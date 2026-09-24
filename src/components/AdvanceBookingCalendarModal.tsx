import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  getHolidayForDate,
  getUpcomingHolidaysInRange,
  Holiday,
} from '../data/holidays';
import { Train } from '../types/Train';
import { trainService } from '../services/trainService';
import { useReminderStore, ReminderEntry } from '../store/reminderStore';
import {
  scheduleBookingReminders,
  cancelBookingReminders,
  requestNotificationPermission,
} from '../services/notificationService';

interface AdvanceBookingCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate?: (dateString: string) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface MonthData {
  year: number;
  month: number; // 0-11
  title: string;
  daysInMonth: number;
  firstDayOfWeek: number;
}

// Convert Date to "YYYY-MM-DD" local format
const toISODate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AdvanceBookingCalendarModal: React.FC<AdvanceBookingCalendarModalProps> = ({
  visible,
  onClose,
  onSelectDate,
}) => {
  const insets = useSafeAreaInsets();
  const { reminders, addReminder, removeReminder } = useReminderStore();

  // Range view: '60days' (active reservation window) or 'fullYear' (remaining months of year)
  const [calendarRange, setCalendarRange] = useState<'60days' | 'fullYear'>('60days');

  // Train picker state for reminders
  const [trainPickerVisible, setTrainPickerVisible] = useState(false);
  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);

  // Load trains list for reminder selection
  useEffect(() => {
    trainService.getAllTrains().then(trains => {
      setAllTrains(trains);
    });
  }, []);

  // Normalize today at midnight
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 60-Day ARP target date
  const arpDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 60);
    return d;
  }, [today]);

  // Selected date defaults to the 60th day (the newly opened date)
  const [selectedDate, setSelectedDate] = useState<Date>(arpDate);

  // Generate months based on selected range
  const months: MonthData[] = useMemo(() => {
    const list: MonthData[] = [];
    const startYear = today.getFullYear();
    const startMonth = today.getMonth();

    // In '60days' mode: 3 months to cover today + 60 days
    // In 'fullYear' mode: all remaining months through December of current year + January next year
    let numMonths = 3;
    if (calendarRange === 'fullYear') {
      const monthsLeftInYear = 12 - startMonth;
      numMonths = Math.max(monthsLeftInYear + 1, 4); // Include January next year
    }

    for (let i = 0; i < numMonths; i++) {
      const d = new Date(startYear, startMonth + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay();

      list.push({
        year,
        month,
        title: `${MONTH_NAMES[month]} ${year}`,
        daysInMonth,
        firstDayOfWeek,
      });
    }
    return list;
  }, [today, calendarRange]);

  // Helper date comparisons
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Upcoming holidays in the selected period
  const upcomingHolidays = useMemo(() => {
    const rangeEnd = calendarRange === 'fullYear'
      ? new Date(today.getFullYear(), 11, 31)
      : arpDate;
    return getUpcomingHolidaysInRange(today, rangeEnd);
  }, [today, arpDate, calendarRange]);

  const selectedHoliday = useMemo(
    () => getHolidayForDate(selectedDate),
    [selectedDate]
  );

  // Check if a reminder exists for selected date
  const selectedDateKey = toISODate(selectedDate);
  const activeReminderForSelectedDate = useMemo(() => {
    return reminders.find(r => r.journeyDate === selectedDateKey);
  }, [reminders, selectedDateKey]);

  // Booking calculations for selected date
  const selectedInfo = useMemo(() => {
    const isPast = selectedDate < today;
    const isToday = isSameDay(selectedDate, today);
    const isArp = isSameDay(selectedDate, arpDate);
    const isOpen = selectedDate >= today && selectedDate <= arpDate;

    // Calculate when booking opened / will open (TravelDate - 60 days)
    const openDate = new Date(selectedDate);
    openDate.setDate(openDate.getDate() - 60);

    const diffDaysFromToday = Math.round(
      (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysUntilBookingOpens = Math.round(
      (openDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const formattedSelected = `${selectedDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;

    const formattedOpenDate = `${openDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;

    return {
      isPast,
      isToday,
      isArp,
      isOpen,
      diffDaysFromToday,
      daysUntilBookingOpens,
      formattedSelected,
      formattedOpenDate,
    };
  }, [selectedDate, today, arpDate]);

  const handleOpenIrctc = useCallback(() => {
    Linking.openURL('https://www.irctc.co.in/nget/train-search').catch(() => {});
  }, []);

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
    if (onSelectDate) {
      onSelectDate(toISODate(date));
    }
  };

  // Schedule booking opening reminder
  const handleScheduleReminder = async (trainNumber: string, trainName: string) => {
    setIsScheduling(true);
    try {
      const granted = await requestNotificationPermission();
      if (!granted && Platform.OS !== 'android') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive booking opening alerts.'
        );
        setIsScheduling(false);
        return;
      }

      const openDate = new Date(selectedDate);
      openDate.setDate(openDate.getDate() - 60);
      const openDateStr = toISODate(openDate);
      const journeyDateStr = toISODate(selectedDate);

      const notificationIds = await scheduleBookingReminders(
        trainNumber,
        trainName,
        selectedDate
      );

      addReminder({
        trainNumber,
        trainName,
        journeyDate: journeyDateStr,
        bookingOpensDate: openDateStr,
        notificationIds,
        createdAt: Date.now(),
      });

      setTrainPickerVisible(false);

      Alert.alert(
        '🔔 Reminder Scheduled!',
        `You will receive alerts 7 days before, 1 day before, and at 8:00 AM on ${openDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })} when IRCTC opens general booking for ${trainName}.`
      );
    } catch (e: any) {
      Alert.alert('Notice', 'Could not schedule reminder. Please check your notification settings.');
    } finally {
      setIsScheduling(false);
    }
  };

  // Cancel existing reminder
  const handleCancelReminder = async (entry: ReminderEntry) => {
    try {
      if (entry.notificationIds?.length) {
        await cancelBookingReminders(entry.notificationIds);
      }
      removeReminder(entry.trainNumber, entry.journeyDate);
      Alert.alert('Reminder Cancelled', `Alert for ${entry.trainName} has been removed.`);
    } catch (e) {
      removeReminder(entry.trainNumber, entry.journeyDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color="#2C201A" />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Advance Booking Calendar</Text>
            <Text style={styles.headerSubtitle}>60-Day Window & Full Year Planner</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Range Selector Bar */}
        <View style={styles.rangeSelectorContainer}>
          <TouchableOpacity
            style={[
              styles.rangeTab,
              calendarRange === '60days' && styles.rangeTabActive,
            ]}
            onPress={() => setCalendarRange('60days')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={calendarRange === '60days' ? '#FFFFFF' : '#6E5D53'}
            />
            <Text
              style={[
                styles.rangeTabText,
                calendarRange === '60days' && styles.rangeTabTextActive,
              ]}
            >
              60-Day Window (Active)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rangeTab,
              calendarRange === 'fullYear' && styles.rangeTabActive,
            ]}
            onPress={() => setCalendarRange('fullYear')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={calendarRange === 'fullYear' ? '#FFFFFF' : '#6E5D53'}
            />
            <Text
              style={[
                styles.rangeTabText,
                calendarRange === 'fullYear' && styles.rangeTabTextActive,
              ]}
            >
              Full Remaining Year
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 170 }]}
        >
          {/* Rule Card / Highlight Summary */}
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerHeader}>
              <Ionicons name="information-circle" size={18} color="#9E3C1B" />
              <Text style={styles.infoBannerTitle}>General Quota opens 60 days ahead at 8:00 AM</Text>
            </View>
            <Text style={styles.infoBannerDesc}>
              Select any date to check booking status, or plan trips across the remaining year and set an 8:00 AM opening alert!
            </Text>

            <View style={styles.kpiRow}>
              <View style={styles.kpiBox}>
                <Text style={styles.kpiLabel}>TODAY</Text>
                <Text style={styles.kpiValue}>
                  {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#A8998E" />
              <View style={[styles.kpiBox, styles.kpiBoxHighlight]}>
                <Text style={[styles.kpiLabel, styles.kpiLabelHighlight]}>BOOKING OPEN UP TO</Text>
                <Text style={[styles.kpiValue, styles.kpiValueHighlight]}>
                  {arpDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1E824C' }]} />
              <Text style={styles.legendText}>Open</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#9E3C1B' }]} />
              <Text style={styles.legendText}>60th Day</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>Holiday</Text>
            </View>
            <View style={styles.legendItem}>
              <Ionicons name="notifications" size={11} color="#9E3C1B" />
              <Text style={styles.legendText}>Reminder Set</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D6CEC7' }]} />
              <Text style={styles.legendText}>Locked</Text>
            </View>
          </View>

          {/* Upcoming Holidays Quick Selector */}
          {upcomingHolidays.length > 0 && (
            <View style={styles.holidaysSection}>
              <View style={styles.holidaysSectionHeader}>
                <Ionicons name="sparkles" size={14} color="#8B5CF6" />
                <Text style={styles.holidaysSectionTitle}>
                  {calendarRange === 'fullYear' ? 'Festivals & Holidays (Rest of Year)' : 'Festivals in 60-Day Window'}
                </Text>
                <Text style={styles.holidaysSectionCount}>{upcomingHolidays.length} upcoming</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.holidaysChipsScroll}
              >
                {upcomingHolidays.map(h => {
                  const [y, m, d] = h.date.split('-').map(Number);
                  const hDate = new Date(y, m - 1, d);
                  hDate.setHours(0, 0, 0, 0);
                  const isHSelected = isSameDay(hDate, selectedDate);

                  return (
                    <TouchableOpacity
                      key={h.date}
                      style={[styles.holidayChip, isHSelected && styles.holidayChipSelected]}
                      onPress={() => handleSelectDay(hDate)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.holidayChipDot, isHSelected && styles.holidayChipDotSelected]} />
                      <Text style={[styles.holidayChipDate, isHSelected && styles.holidayChipDateSelected]}>
                        {d} {MONTH_NAMES[m - 1].slice(0, 3)}
                      </Text>
                      <Text style={[styles.holidayChipName, isHSelected && styles.holidayChipNameSelected]} numberOfLines={1}>
                        {h.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Month Calendars */}
          {months.map((m, mIdx) => {
            const totalCells = m.firstDayOfWeek + m.daysInMonth;
            const rows = Math.ceil(totalCells / 7);

            return (
              <View key={`${m.year}-${m.month}`} style={styles.monthCard}>
                <View style={styles.monthHeader}>
                  <Text style={styles.monthTitle}>{m.title}</Text>
                  {mIdx === 0 ? (
                    <View style={styles.currentMonthBadge}>
                      <Text style={styles.currentMonthBadgeText}>Current Month</Text>
                    </View>
                  ) : mIdx === 1 ? (
                    <View style={styles.nextMonthBadge}>
                      <Text style={styles.nextMonthBadgeText}>Next Month</Text>
                    </View>
                  ) : m.month === 11 ? (
                    <View style={styles.yearEndBadge}>
                      <Text style={styles.yearEndBadgeText}>Year-End / Holidays</Text>
                    </View>
                  ) : null}
                </View>

                {/* Weekday Row */}
                <View style={styles.weekdayRow}>
                  {WEEKDAY_NAMES.map((w, idx) => (
                    <Text
                      key={w}
                      style={[
                        styles.weekdayText,
                        (idx === 0 || idx === 6) && styles.weekendText,
                      ]}
                    >
                      {w}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {Array.from({ length: rows * 7 }).map((_, cellIdx) => {
                    const dayNum = cellIdx - m.firstDayOfWeek + 1;
                    if (dayNum < 1 || dayNum > m.daysInMonth) {
                      return <View key={`empty-${cellIdx}`} style={styles.dayCellEmpty} />;
                    }

                    const cellDate = new Date(m.year, m.month, dayNum);
                    cellDate.setHours(0, 0, 0, 0);

                    const isCellPast = cellDate < today;
                    const isCellToday = isSameDay(cellDate, today);
                    const isCellArp = isSameDay(cellDate, arpDate);
                    const isCellOpen = cellDate >= today && cellDate <= arpDate;
                    const isCellSelected = isSameDay(cellDate, selectedDate);
                    const holiday = getHolidayForDate(cellDate);
                    const isCellHoliday = !!holiday;
                    const cellKey = toISODate(cellDate);
                    const hasReminderOnCell = reminders.some(r => r.journeyDate === cellKey);

                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        style={[
                          styles.dayCell,
                          isCellOpen && styles.dayCellOpen,
                          isCellHoliday && !isCellSelected && styles.dayCellHoliday,
                          isCellToday && styles.dayCellToday,
                          isCellArp && styles.dayCellArp,
                          isCellSelected && styles.dayCellSelected,
                        ]}
                        onPress={() => handleSelectDay(cellDate)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayNumberText,
                            isCellPast && styles.dayNumberPast,
                            isCellOpen && styles.dayNumberOpen,
                            isCellHoliday && !isCellSelected && styles.dayNumberHoliday,
                            isCellToday && styles.dayNumberToday,
                            isCellArp && styles.dayNumberArp,
                            isCellSelected && styles.dayNumberSelected,
                          ]}
                        >
                          {dayNum}
                        </Text>

                        {/* Cell indicators */}
                        {isCellToday && !isCellSelected && (
                          <View style={styles.todayIndicatorDot} />
                        )}
                        {isCellArp && !isCellSelected && (
                          <View style={styles.arpBadge}>
                            <Text style={styles.arpBadgeText}>60d</Text>
                          </View>
                        )}
                        {hasReminderOnCell && !isCellSelected && (
                          <View style={styles.reminderCellBadge}>
                            <Ionicons name="notifications" size={8} color="#FFFFFF" />
                          </View>
                        )}
                        {isCellHoliday && !isCellSelected && !isCellArp && !hasReminderOnCell && (
                          <View style={styles.holidayIndicatorDot} />
                        )}
                        {!isCellToday && !isCellArp && !isCellHoliday && !hasReminderOnCell && isCellOpen && !isCellSelected && (
                          <View style={styles.openIndicatorDot} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Details Action Card */}
        <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.bottomCardHeader}>
            <View>
              <Text style={styles.bottomDateTitle}>{selectedInfo.formattedSelected}</Text>
              <Text style={styles.bottomDateSubtitle}>
                {selectedInfo.isToday
                  ? 'Departing today'
                  : selectedInfo.isPast
                  ? 'Past date'
                  : `In ${selectedInfo.diffDaysFromToday} days`}
              </Text>
            </View>

            {/* Status Pill */}
            {selectedHoliday ? (
              <View style={[styles.statusPill, styles.statusPillHoliday]}>
                <Ionicons name="sparkles" size={12} color="#7C3AED" />
                <Text style={styles.statusPillHolidayText}>{selectedHoliday.name}</Text>
              </View>
            ) : selectedInfo.isArp ? (
              <View style={[styles.statusPill, styles.statusPillArp]}>
                <Ionicons name="sparkles" size={13} color="#9E3C1B" />
                <Text style={styles.statusPillArpText}>Opens Today (Day 60)</Text>
              </View>
            ) : selectedInfo.isOpen ? (
              <View style={[styles.statusPill, styles.statusPillOpen]}>
                <Ionicons name="checkmark-circle" size={13} color="#1E824C" />
                <Text style={styles.statusPillOpenText}>Booking Open</Text>
              </View>
            ) : selectedInfo.isPast ? (
              <View style={[styles.statusPill, styles.statusPillPast]}>
                <Text style={styles.statusPillPastText}>Departed</Text>
              </View>
            ) : (
              <View style={[styles.statusPill, styles.statusPillLocked]}>
                <Ionicons name="lock-closed" size={12} color="#7A6B63" />
                <Text style={styles.statusPillLockedText}>Opens in {selectedInfo.daysUntilBookingOpens}d</Text>
              </View>
            )}
          </View>

          {/* Selected Holiday Detail Banner */}
          {selectedHoliday && (
            <View style={styles.selectedHolidayBox}>
              <View style={styles.selectedHolidayHeader}>
                <Ionicons name="gift" size={14} color="#7C3AED" />
                <Text style={styles.selectedHolidayTitle}>{selectedHoliday.name}</Text>
                <View style={styles.holidayTypeTag}>
                  <Text style={styles.holidayTypeTagText}>
                    {selectedHoliday.type === 'national'
                      ? 'National Holiday'
                      : selectedHoliday.type === 'goa'
                      ? 'Goa State Holiday'
                      : 'Festival'}
                  </Text>
                </View>
              </View>
              {selectedHoliday.description && (
                <Text style={styles.selectedHolidayDesc}>{selectedHoliday.description}</Text>
              )}
              <View style={styles.holidayRushRow}>
                <Ionicons name="flame" size={13} color="#D97706" />
                <Text style={styles.holidayRushText}>Heavy holiday rush · Reserve promptly at 8 AM!</Text>
              </View>
            </View>
          )}

          {/* Active Reminder Callout (if one exists for this travel date) */}
          {activeReminderForSelectedDate && (
            <View style={styles.activeReminderBox}>
              <View style={styles.activeReminderHeader}>
                <Ionicons name="notifications" size={16} color="#1E824C" />
                <Text style={styles.activeReminderTitle}>
                  Reminder Active · {activeReminderForSelectedDate.trainName}
                </Text>
              </View>
              <Text style={styles.activeReminderDesc}>
                We will alert you at 8:00 AM on {selectedInfo.formattedOpenDate} when booking opens on IRCTC.
              </Text>
              <TouchableOpacity
                style={styles.cancelReminderBtn}
                onPress={() => handleCancelReminder(activeReminderForSelectedDate)}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={14} color="#DC2626" />
                <Text style={styles.cancelReminderText}>Cancel Reminder</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Explanatory text */}
          {!activeReminderForSelectedDate && (
            <Text style={styles.bottomExplanation}>
              {selectedInfo.isArp
                ? 'Today is the very first day bookings opened for this date (at 8:00 AM IST).'
                : selectedInfo.isOpen
                ? `General quota tickets are currently active. Booking opened on ${selectedInfo.formattedOpenDate}.`
                : selectedInfo.isPast
                ? 'This date is already in the past.'
                : `Booking for this date opens on ${selectedInfo.formattedOpenDate} at 8:00 AM IST.`}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {selectedInfo.isOpen ? (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.bookCtaBtn, { flex: 1 }]}
                  onPress={handleOpenIrctc}
                  activeOpacity={0.85}
                >
                  <Text style={styles.bookCtaText}>Book on IRCTC</Text>
                  <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>

                {!activeReminderForSelectedDate && (
                  <TouchableOpacity
                    style={styles.reminderSecondaryBtn}
                    onPress={() => setTrainPickerVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="alarm-outline" size={16} color="#9E3C1B" />
                    <Text style={styles.reminderSecondaryBtnText}>Reminder</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : !selectedInfo.isPast && !activeReminderForSelectedDate ? (
              <TouchableOpacity
                style={styles.setReminderCtaBtn}
                onPress={() => setTrainPickerVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="alarm-outline" size={18} color="#FFFFFF" />
                <Text style={styles.setReminderCtaText}>
                  Set Booking Opening Reminder
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* ── Train Selection Modal for Reminder ── */}
        <Modal
          visible={trainPickerVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setTrainPickerVisible(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <View>
                  <Text style={styles.pickerTitle}>Set Booking Reminder</Text>
                  <Text style={styles.pickerSubtitle}>
                    Journey: {selectedInfo.formattedSelected}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setTrainPickerVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={24} color="#A8998E" />
                </TouchableOpacity>
              </View>

              <View style={styles.pickerNoticeBox}>
                <Ionicons name="time" size={15} color="#9E3C1B" />
                <Text style={styles.pickerNoticeText}>
                  You'll be alerted 7 days before, 1 day before, and at 8:00 AM on {selectedInfo.formattedOpenDate}.
                </Text>
              </View>

              <Text style={styles.pickerSectionLabel}>CHOOSE TRAIN OR GENERAL ALERT</Text>

              <ScrollView style={styles.trainListScroll} showsVerticalScrollIndicator={false}>
                {/* General Option */}
                <TouchableOpacity
                  style={styles.trainPickerItem}
                  onPress={() => handleScheduleReminder('ALL', 'Goa-Mumbai Train Booking')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.trainIconBox, { backgroundColor: '#F5ECE3' }]}>
                    <Ionicons name="star" size={18} color="#9E3C1B" />
                  </View>
                  <View style={styles.trainItemInfo}>
                    <Text style={styles.trainItemName}>General Opening Alert (Any Train)</Text>
                    <Text style={styles.trainItemSub}>
                      All Goa ↔ Mumbai trains opening for this date
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#C4B8AF" />
                </TouchableOpacity>

                {/* Train List */}
                {allTrains.slice(0, 15).map(t => (
                  <TouchableOpacity
                    key={t.trainNumber}
                    style={styles.trainPickerItem}
                    onPress={() => handleScheduleReminder(t.trainNumber, t.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.trainIconBox}>
                      <Ionicons name="train" size={18} color="#9E3C1B" />
                    </View>
                    <View style={styles.trainItemInfo}>
                      <View style={styles.trainNameRow}>
                        <Text style={styles.trainItemName}>{t.name}</Text>
                        <Text style={styles.trainNumberBadge}>#{t.trainNumber}</Text>
                      </View>
                      <Text style={styles.trainItemSub}>
                        {t.sourceStationCode} → {t.destinationStationCode} · {t.type}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#C4B8AF" />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {isScheduling && (
                <View style={styles.schedulingOverlay}>
                  <ActivityIndicator size="small" color="#9E3C1B" />
                  <Text style={styles.schedulingText}>Setting reminder...</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

export default AdvanceBookingCalendarModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE6',
    backgroundColor: '#FAF7F4',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEAE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C201A',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8A7A71',
    marginTop: 2,
  },
  rangeSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAF7F4',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE6',
    gap: 10,
  },
  rangeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD5CC',
    gap: 6,
  },
  rangeTabActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  rangeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E5D53',
  },
  rangeTabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  infoBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  infoBannerDesc: {
    fontSize: 12,
    color: '#6E5D53',
    lineHeight: 17,
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  kpiBox: {
    alignItems: 'flex-start',
  },
  kpiBoxHighlight: {
    alignItems: 'flex-end',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A6B63',
    letterSpacing: 0.5,
  },
  kpiLabelHighlight: {
    color: '#9E3C1B',
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C201A',
    marginTop: 2,
  },
  kpiValueHighlight: {
    color: '#9E3C1B',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6E5D53',
  },
  holidaysSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  holidaysSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  holidaysSectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2C201A',
    flex: 1,
  },
  holidaysSectionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  holidaysChipsScroll: {
    gap: 8,
    paddingRight: 4,
  },
  holidayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  holidayChipSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  holidayChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
  holidayChipDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  holidayChipDate: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
  },
  holidayChipDateSelected: {
    color: '#FFFFFF',
  },
  holidayChipName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4C1D95',
    maxWidth: 140,
  },
  holidayChipNameSelected: {
    color: '#FFFFFF',
  },
  monthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C201A',
  },
  currentMonthBadge: {
    backgroundColor: '#EBF7EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currentMonthBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E824C',
  },
  nextMonthBadge: {
    backgroundColor: '#F5EDE6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nextMonthBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A4A1C',
  },
  yearEndBadge: {
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  yearEndBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#F2EBE5',
    paddingBottom: 8,
    marginBottom: 8,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#8A7A71',
  },
  weekendText: {
    color: '#9E3C1B',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 44,
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
    position: 'relative',
  },
  dayCellOpen: {
    backgroundColor: '#F7FBF8',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#9E3C1B',
  },
  dayCellArp: {
    backgroundColor: '#FDF2E9',
    borderWidth: 1.5,
    borderColor: '#D97706',
  },
  dayCellHoliday: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  dayCellSelected: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C201A',
  },
  dayNumberPast: {
    color: '#C4B8AF',
  },
  dayNumberOpen: {
    color: '#1E824C',
    fontWeight: '700',
  },
  dayNumberHoliday: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  dayNumberToday: {
    color: '#9E3C1B',
    fontWeight: '800',
  },
  dayNumberArp: {
    color: '#B45309',
    fontWeight: '800',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  todayIndicatorDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9E3C1B',
  },
  openIndicatorDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E824C',
  },
  holidayIndicatorDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  reminderCellBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#9E3C1B',
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arpBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#D97706',
    borderRadius: 3,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  arpBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEAE6',
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bottomDateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C201A',
  },
  bottomDateSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A7A71',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillOpen: {
    backgroundColor: '#EBF7EE',
  },
  statusPillOpenText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E824C',
  },
  statusPillArp: {
    backgroundColor: '#FDF2E9',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  statusPillArpText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#9E3C1B',
  },
  statusPillHoliday: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  statusPillHolidayText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  statusPillPast: {
    backgroundColor: '#F5ECE3',
  },
  statusPillPastText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8A7A71',
  },
  statusPillLocked: {
    backgroundColor: '#F5EDE6',
  },
  statusPillLockedText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7A4A1C',
  },
  selectedHolidayBox: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    padding: 9,
    marginBottom: 8,
  },
  selectedHolidayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  selectedHolidayTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5B21B6',
    flex: 1,
  },
  holidayTypeTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  holidayTypeTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6D28D9',
    textTransform: 'uppercase',
  },
  selectedHolidayDesc: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 3,
  },
  holidayRushRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  holidayRushText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  activeReminderBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  activeReminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  activeReminderTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#166534',
  },
  activeReminderDesc: {
    fontSize: 11.5,
    color: '#15803D',
    lineHeight: 16,
    marginBottom: 6,
  },
  cancelReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cancelReminderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  bottomExplanation: {
    fontSize: 12,
    color: '#6E5D53',
    lineHeight: 17,
    marginBottom: 8,
  },
  actionButtonsContainer: {
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookCtaBtn: {
    backgroundColor: '#9E3C1B',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookCtaText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reminderSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FDF2E9',
    borderWidth: 1,
    borderColor: '#E8DED6',
    gap: 6,
  },
  reminderSecondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  setReminderCtaBtn: {
    backgroundColor: '#9E3C1B',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  setReminderCtaText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Train Picker Modal ──
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C201A',
  },
  pickerSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#8A7A71',
    marginTop: 2,
  },
  pickerNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDF2E9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  pickerNoticeText: {
    fontSize: 11.5,
    color: '#8A4A1C',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  pickerSectionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8A7A71',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  trainListScroll: {
    maxHeight: 320,
  },
  trainPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7F4',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    gap: 12,
  },
  trainIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  trainItemInfo: {
    flex: 1,
  },
  trainNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trainItemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2C201A',
  },
  trainNumberBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A7A71',
  },
  trainItemSub: {
    fontSize: 11.5,
    color: '#7A6B63',
    marginTop: 2,
  },
  schedulingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  schedulingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E3C1B',
  },
});
