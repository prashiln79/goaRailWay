import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

const CHANNEL_ID = 'goa-booking-reminders';

export function isExpoGo(): boolean {
  return isRunningInExpoGo();
}

/**
 * Android Expo Go (SDK 53+) removed remote push notifications and triggers:
 * "Android Push notifications (remote notifications) functionality provided by expo-notifications
 * was removed from Expo Go with the release of SDK 53..."
 * whenever expo-notifications is imported on Android in Expo Go.
 *
 * To allow seamless testing in Expo Go on Android without fatal crashes, we only load
 * expo-notifications when NOT running inside Expo Go on Android.
 */
function getNotificationsModule(): typeof import('expo-notifications') | null {
  if (Platform.OS === 'android' && isRunningInExpoGo()) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-notifications');
  } catch (err: any) {
    console.warn('[notificationService] Failed to load expo-notifications:', err?.message);
    return null;
  }
}

// ── Android channel setup ─────────────────────────────────────────────────────
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Booking Reminders',
      description: 'IRCTC booking opening alerts for your saved journeys',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9E3C1B',
      sound: 'default',
    });
  } catch (err: any) {
    console.warn('[notificationService] Notification channel setup warning:', err?.message);
  }
}

// ── Permission request ────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    // In Expo Go on Android, native notifications cannot be requested
    return false;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (err: any) {
    console.warn('[notificationService] Permission request notice:', err?.message);
    return false;
  }
}

// ── Schedule up to 3 local notifications for a train + journey date ───────────
/**
 * ARP (Advance Reservation Period) = 60 days
 *
 * bookingOpens = journeyDate - 60 days
 * Notification 1: bookingOpens - 7 days @ 09:00  → "Opens in 7 days"
 * Notification 2: bookingOpens - 1 day  @ 08:00  → "Opens tomorrow"
 * Notification 3: bookingOpens          @ 08:00  → "Booking is now open"
 *
 * Returns the list of scheduled notification IDs (may be < 3 if some are in the past).
 */
export async function scheduleBookingReminders(
  trainNumber: string,
  trainName: string,
  journeyDate: Date,
): Promise<string[]> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return [];
  }

  try {
    await ensureAndroidChannel();
  } catch (e) {
    console.warn('[notificationService] Android channel setup warning:', e);
  }

  // Booking opens 60 days before the journey
  const bookingOpens = new Date(journeyDate);
  bookingOpens.setDate(bookingOpens.getDate() - 60);
  bookingOpens.setHours(0, 0, 0, 0);

  const slots: Array<{ daysOffset: number; hour: number; title: string; body: string }> = [
    {
      daysOffset: -7,
      hour: 9,
      title: '🔔 Booking Reminder — 7 Days',
      body: `${trainName} booking opens in 7 days. Get ready!`,
    },
    {
      daysOffset: -1,
      hour: 8,
      title: '🔔 Booking Opens Tomorrow',
      body: `${trainName} — booking opens tomorrow at 8:00 AM on IRCTC.`,
    },
    {
      daysOffset: 0,
      hour: 8,
      title: '🎟️ Booking is Now Open!',
      body: `Book your seat on ${trainName} now before it fills up.`,
    },
  ];

  const now = Date.now();
  const ids: string[] = [];

  for (const slot of slots) {
    const triggerDate = new Date(bookingOpens);
    triggerDate.setDate(triggerDate.getDate() + slot.daysOffset);
    triggerDate.setHours(slot.hour, 0, 0, 0);

    // Skip if trigger is already in the past
    if (triggerDate.getTime() <= now) continue;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: slot.title,
          body: slot.body,
          data: { trainNumber },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      ids.push(id);
    } catch (err: any) {
      console.warn('[notificationService] Failed to schedule notification slot:', err?.message);
    }
  }

  return ids;
}

// ── Cancel reminders by ID ────────────────────────────────────────────────────
export async function cancelBookingReminders(ids: string[]): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !ids.length) return;

  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Ignore if already fired / doesn't exist
    }
  }
}

// ── Foreground notification handler ──────────────────────────────────────────
// Call this once at app startup (e.g. in AppNavigator)
export function configureNotificationHandler(): void {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err: any) {
    console.warn('[notificationService] Failed to set notification handler:', err?.message);
  }
}

// ── Listener when user taps a notification ────────────────────────────────────
export function addNotificationResponseListener(
  onResponse: (trainNumber: string) => void,
): (() => void) | null {
  const Notifications = getNotificationsModule();
  if (!Notifications) return null;

  try {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response?.notification?.request?.content?.data;
      if (data?.trainNumber) {
        onResponse(String(data.trainNumber));
      }
    });

    return () => {
      try {
        sub?.remove?.();
      } catch {}
    };
  } catch (err: any) {
    console.warn('[notificationService] Failed to attach notification response listener:', err?.message);
    return null;
  }
}
