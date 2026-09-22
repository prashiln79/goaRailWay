import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderEntry {
  trainNumber: string;
  trainName: string;
  journeyDate: string;       // "YYYY-MM-DD"
  bookingOpensDate: string;  // "YYYY-MM-DD"  (journeyDate - 60 days)
  notificationIds: string[]; // Expo notification IDs
  createdAt: number;         // Date.now() — for sorting
}

interface ReminderState {
  reminders: ReminderEntry[];
  addReminder: (entry: ReminderEntry) => void;
  removeReminder: (trainNumber: string, journeyDate: string) => void;
  getRemindersForTrain: (trainNumber: string) => ReminderEntry[];
  hasAnyReminder: (trainNumber: string) => boolean;
  hasReminder: (trainNumber: string, journeyDate: string) => boolean;
  getReminder: (trainNumber: string, journeyDate: string) => ReminderEntry | undefined;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: (entry) => {
        set(state => ({
          reminders: [
            // Replace if same train+date already exists
            ...state.reminders.filter(
              r => !(r.trainNumber === entry.trainNumber && r.journeyDate === entry.journeyDate),
            ),
            entry,
          ],
        }));
      },

      removeReminder: (trainNumber, journeyDate) => {
        set(state => ({
          reminders: state.reminders.filter(
            r => !(r.trainNumber === trainNumber && r.journeyDate === journeyDate),
          ),
        }));
      },

      getRemindersForTrain: (trainNumber) => {
        return get().reminders.filter(r => r.trainNumber === trainNumber);
      },

      hasAnyReminder: (trainNumber) => {
        return get().reminders.some(r => r.trainNumber === trainNumber);
      },

      hasReminder: (trainNumber, journeyDate) => {
        return get().reminders.some(
          r => r.trainNumber === trainNumber && r.journeyDate === journeyDate,
        );
      },

      getReminder: (trainNumber, journeyDate) => {
        return get().reminders.find(
          r => r.trainNumber === trainNumber && r.journeyDate === journeyDate,
        );
      },
    }),
    {
      name: 'goa-railway-reminders',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
