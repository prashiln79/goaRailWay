import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Train } from '../types/Train';
import { STATION_MAP } from '../data/stations';
import { useReminderStore } from '../store/reminderStore';
import {
  scheduleBookingReminders,
  cancelBookingReminders,
  requestNotificationPermission,
  isExpoGo,
} from '../services/notificationService';

interface BookingReminderSheetProps {
  visible: boolean;
  onClose: () => void;
  train: Train;
  initialDate?: string; // "YYYY-MM-DD"
}

// Format "YYYY-MM-DD" to user friendly string e.g. "Sat, 25 Nov"
const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatShortDay = (dateStr: string): { dayName: string; dayNum: number; month: string } => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return {
    dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
    dayNum: d,
    month: date.toLocaleDateString('en-IN', { month: 'short' }),
  };
};

// Date to "YYYY-MM-DD" in local time
const toISODate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const BookingReminderSheet: React.FC<BookingReminderSheetProps> = ({
  visible,
  onClose,
  train,
  initialDate,
}) => {
  const insets = useSafeAreaInsets();
  const { hasReminder, getReminder, addReminder, removeReminder } = useReminderStore();

  // Generate 45 upcoming days starting from tomorrow
  const upcomingDates = useMemo(() => {
    const list: string[] = [];
    const base = new Date();
    // Start from tomorrow
    for (let i = 1; i <= 60; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      list.push(toISODate(d));
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) return initialDate;
    // Default to 65 days out if available or first upcoming date
    const target = new Date();
    target.setDate(target.getDate() + 65);
    return toISODate(target);
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate booking opening date: journeyDate - 60 days
  const { bookingOpenDateStr, daysUntilOpen, isOpenNow, openDateObj } = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const journey = new Date(y, m - 1, d);

    const openDate = new Date(journey);
    openDate.setDate(openDate.getDate() - 60);
    openDate.setHours(8, 0, 0, 0);

    const now = new Date();
    const diffMs = openDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      bookingOpenDateStr: toISODate(openDate),
      daysUntilOpen: diffDays,
      isOpenNow: diffMs <= 0,
      openDateObj: openDate,
    };
  }, [selectedDate]);

  const existingReminder = getReminder(train.trainNumber, selectedDate);
  const isReminderSet = Boolean(existingReminder);

  // Source & Destination Station names
  const src = STATION_MAP[train.sourceStationCode]?.name ?? train.sourceStationCode;
  const dst = STATION_MAP[train.destinationStationCode]?.name ?? train.destinationStationCode;

  // Check if train runs on selected day
  const trainRunsOnSelectedDate = useMemo(() => {
    if (!train.runningDays || train.runningDays.length === 7) return true;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    return train.runningDays.includes(dayOfWeek);
  }, [train.runningDays, selectedDate]);

  // Handle Set Reminder
  const handleSetReminder = async () => {
    try {
      setIsProcessing(true);
      const isExpoGoOnAndroid = isExpoGo() && Platform.OS === 'android';

      let hasPerm = false;
      try {
        hasPerm = await requestNotificationPermission();
      } catch {
        hasPerm = false;
      }

      // Only block if permissions are rejected in an environment where notifications are supported
      if (!hasPerm && !isExpoGoOnAndroid) {
        Alert.alert(
          'Permission Needed',
          'Please grant notification permission in your device Settings to receive booking alerts.',
          [{ text: 'OK' }],
        );
        setIsProcessing(false);
        return;
      }

      const [y, m, d] = selectedDate.split('-').map(Number);
      const journeyDateObj = new Date(y, m - 1, d);

      let notificationIds: string[] = [];
      try {
        notificationIds = await scheduleBookingReminders(
          train.trainNumber,
          train.name,
          journeyDateObj,
        );
      } catch (scheduleErr: any) {
        console.warn('[BookingReminderSheet] Scheduling local notification notice:', scheduleErr?.message);
      }

      addReminder({
        trainNumber: train.trainNumber,
        trainName: train.name,
        journeyDate: selectedDate,
        bookingOpensDate: bookingOpenDateStr,
        notificationIds,
        createdAt: Date.now(),
      });

      if (isExpoGoOnAndroid) {
        Alert.alert(
          '🔔 Reminder Saved!',
          `Your booking reminder for ${train.name} on ${formatDateDisplay(selectedDate)} has been saved in the app under the Saved tab.\n\n` +
            `ℹ️ Note: Expo Go on Android does not support native push/scheduled notifications (removed by Expo in SDK 53+).\n\n` +
            `To test native system lockscreen alerts, use a Development Build ('npx expo run:android').`,
          [{ text: 'Got it' }],
        );
      } else {
        Alert.alert(
          '🔔 Booking Reminders Set!',
          `We have scheduled alerts for your journey on ${formatDateDisplay(selectedDate)}:\n\n` +
            `• 7 days before opening (9:00 AM)\n` +
            `• 1 day before opening (8:00 AM)\n` +
            `• On opening morning (8:00 AM)\n\n` +
            `You will receive a notification directly on your device.`,
          [{ text: 'Got it' }],
        );
      }
    } catch (err: any) {
      if (err?.message?.includes('removed from Expo Go')) {
        addReminder({
          trainNumber: train.trainNumber,
          trainName: train.name,
          journeyDate: selectedDate,
          bookingOpensDate: bookingOpenDateStr,
          notificationIds: [],
          createdAt: Date.now(),
        });
        Alert.alert(
          '🔔 Reminder Saved!',
          `Your booking reminder for ${train.name} on ${formatDateDisplay(selectedDate)} has been saved in the app under the Saved tab.\n\n` +
            `Note: System notifications require an Expo Development Build ('npx expo run:android') instead of Expo Go.`,
          [{ text: 'Got it' }],
        );
      } else {
        Alert.alert('Error', err?.message ?? 'Failed to schedule notification.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Cancel Reminder
  const handleCancelReminder = async () => {
    if (!existingReminder) return;

    Alert.alert(
      'Cancel Reminder',
      `Are you sure you want to cancel the booking reminder for ${train.name} on ${formatDateDisplay(selectedDate)}?`,
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel Reminder',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await cancelBookingReminders(existingReminder.notificationIds);
              removeReminder(train.trainNumber, selectedDate);
              Alert.alert('Reminder Removed', 'The scheduled booking alerts have been cancelled.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleOpenIrctc = () => {
    Linking.openURL('https://www.irctc.co.in/nget/train-search').catch(() => {
      Alert.alert('Error', 'Could not open IRCTC website.');
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Sheet Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.titleIconRow}>
                <Ionicons name="alarm-outline" size={20} color="#9E3C1B" />
                <Text style={styles.sheetTitle}>Booking Opening Reminder</Text>
              </View>
              <Text style={styles.sheetSubtitle}>IRCTC Advance Reservation Period (ARP) is 60 Days</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Train Info Banner */}
            <View style={styles.trainInfoCard}>
              <View style={styles.trainNumBadge}>
                <Text style={styles.trainNumText}>{train.trainNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trainName} numberOfLines={1}>
                  {train.name}
                </Text>
                <View style={styles.routeRow}>
                  <Text style={styles.routeStation} numberOfLines={1}>{src}</Text>
                  <Ionicons name="arrow-forward" size={12} color="#9E3C1B" style={{ marginHorizontal: 4 }} />
                  <Text style={styles.routeStation} numberOfLines={1}>{dst}</Text>
                </View>
              </View>
            </View>

            {/* Journey Date Picker Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Select Your Journey Date</Text>
              <Text style={styles.selectedDateBadge}>{formatDateDisplay(selectedDate)}</Text>
            </View>

            {/* Horizontal Date Scroller */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateListContainer}
            >
              {upcomingDates.map(dateStr => {
                const isSelected = dateStr === selectedDate;
                const { dayName, dayNum, month } = formatShortDay(dateStr);
                const hasRem = hasReminder(train.trainNumber, dateStr);

                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => setSelectedDate(dateStr)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>
                      {dayName}
                    </Text>
                    <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextSelected]}>
                      {dayNum}
                    </Text>
                    <Text style={[styles.dateChipMonth, isSelected && styles.dateChipTextSelected]}>
                      {month}
                    </Text>
                    {hasRem && (
                      <View style={styles.reminderDot}>
                        <Ionicons name="notifications" size={8} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Non-running warning if applicable */}
            {!trainRunsOnSelectedDate && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={15} color="#B45309" />
                <Text style={styles.warningText}>
                  Note: {train.name} does not typically run on this day of the week.
                </Text>
              </View>
            )}

            {/* Booking Opening Calculation Card */}
            <View style={[styles.calcCard, isOpenNow ? styles.calcCardOpen : styles.calcCardUpcoming]}>
              <View style={styles.calcCardHeader}>
                <View style={[styles.calcIconBox, isOpenNow ? styles.calcIconBoxOpen : styles.calcIconBoxUpcoming]}>
                  <Ionicons
                    name={isOpenNow ? 'checkmark-circle' : 'calendar'}
                    size={22}
                    color={isOpenNow ? '#15803D' : '#9E3C1B'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.calcSubhead}>IRCTC Booking Window (60 Days Prior)</Text>
                  <Text style={styles.calcDateText}>
                    Opens on {formatDateDisplay(bookingOpenDateStr)} at 8:00 AM
                  </Text>
                </View>
              </View>

              <View style={styles.calcStatusBadgeRow}>
                {isOpenNow ? (
                  <View style={styles.openNowPill}>
                    <Ionicons name="flash" size={12} color="#15803D" />
                    <Text style={styles.openNowText}>Booking is OPEN right now!</Text>
                  </View>
                ) : (
                  <View style={styles.countdownPill}>
                    <Ionicons name="time-outline" size={12} color="#9E3C1B" />
                    <Text style={styles.countdownText}>
                      Booking opens in <Text style={{ fontWeight: '800' }}>{daysUntilOpen} days</Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Notification Schedule Breakdown */}
            <Text style={styles.sectionLabel}>3-Stage Automated Notification Plan</Text>

            <View style={styles.timelineBox}>
              {/* Step 1 */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineNode, daysUntilOpen > 7 && styles.timelineNodeActive]}>
                  <Ionicons name="notifications-outline" size={14} color={daysUntilOpen > 7 ? '#9E3C1B' : '#9CA3AF'} />
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeaderRow}>
                    <Text style={styles.timelineStepTitle}>7 Days Before Opening</Text>
                    <Text style={styles.timelineStepTime}>9:00 AM</Text>
                  </View>
                  <Text style={styles.timelineBody}>
                    "Booking opens in 7 days for {train.name}. Check your IRCTC login and ID proofs."
                  </Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              {/* Step 2 */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineNode, daysUntilOpen > 1 && styles.timelineNodeActive]}>
                  <Ionicons name="alarm-outline" size={14} color={daysUntilOpen > 1 ? '#9E3C1B' : '#9CA3AF'} />
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeaderRow}>
                    <Text style={styles.timelineStepTitle}>1 Day Before Opening</Text>
                    <Text style={styles.timelineStepTime}>8:00 AM</Text>
                  </View>
                  <Text style={styles.timelineBody}>
                    "Booking opens tomorrow morning at 8:00 AM sharp on IRCTC."
                  </Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              {/* Step 3 */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineNode, !isOpenNow && styles.timelineNodeActive]}>
                  <Ionicons name="ticket-outline" size={14} color={!isOpenNow ? '#9E3C1B' : '#9CA3AF'} />
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeaderRow}>
                    <Text style={styles.timelineStepTitle}>Opening Morning</Text>
                    <Text style={styles.timelineStepTime}>8:00 AM</Text>
                  </View>
                  <Text style={styles.timelineBody}>
                    "🎟️ Booking is now open! Tap to view train details & book seats."
                  </Text>
                </View>
              </View>
            </View>

            {/* Direct IRCTC Action if already open */}
            {isOpenNow && (
              <TouchableOpacity
                style={styles.irctcBtn}
                onPress={handleOpenIrctc}
                activeOpacity={0.85}
              >
                <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
                <Text style={styles.irctcBtnText}>Book Now on IRCTC Official</Text>
                <Ionicons name="open-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            {isReminderSet ? (
              <View style={styles.activeReminderBox}>
                <View style={styles.activeStatusRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                  <Text style={styles.activeStatusText}>
                    Reminder is Active for {formatDateDisplay(selectedDate)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancelReminder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      <Text style={styles.cancelBtnText}>Cancel This Reminder</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.setReminderBtn, isProcessing && { opacity: 0.7 }]}
                onPress={handleSetReminder}
                disabled={isProcessing}
                activeOpacity={0.85}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="notifications" size={18} color="#FFFFFF" />
                    <Text style={styles.setReminderBtnText}>
                      Set 3-Stage Booking Reminder
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FAF7F4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE6',
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C201A',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#7A6B63',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3EFEA',
  },
  bodyScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  trainInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginBottom: 16,
    gap: 12,
  },
  trainNumBadge: {
    backgroundColor: '#9E3C1B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trainNumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  trainName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  routeStation: {
    fontSize: 12,
    color: '#7A6B63',
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C201A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedDateBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E3C1B',
    backgroundColor: '#FEECE6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateListContainer: {
    gap: 8,
    paddingBottom: 8,
  },
  dateChip: {
    width: 62,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E0DA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  dateChipSelected: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  dateChipDay: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A6B63',
  },
  dateChipNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C201A',
    marginVertical: 1,
  },
  dateChipMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7A6B63',
  },
  dateChipTextSelected: {
    color: '#FFFFFF',
  },
  reminderDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
  },
  calcCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginVertical: 14,
  },
  calcCardUpcoming: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  calcCardOpen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  calcCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calcIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcIconBoxUpcoming: {
    backgroundColor: '#FFEDD5',
  },
  calcIconBoxOpen: {
    backgroundColor: '#DCFCE7',
  },
  calcSubhead: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A6B63',
    textTransform: 'uppercase',
  },
  calcDateText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C201A',
    marginTop: 2,
  },
  calcStatusBadgeRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countdownText: {
    fontSize: 12,
    color: '#9E3C1B',
    fontWeight: '600',
  },
  openNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  openNowText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '800',
  },
  timelineBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginTop: 10,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timelineNodeActive: {
    backgroundColor: '#FEECE6',
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C201A',
  },
  timelineStepTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  timelineBody: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 13,
    marginVertical: 4,
  },
  irctcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  irctcBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEAE6',
    backgroundColor: '#FAF7F4',
  },
  setReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9E3C1B',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#9E3C1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  setReminderBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  activeReminderBox: {
    gap: 8,
  },
  activeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});

export default BookingReminderSheet;
