import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DateItem {
  dateString: string; // 'YYYY-MM-DD'
  dayName: string;    // 'Today', 'Fri', 'Sat'
  dayNumber: string;  // '17'
  monthName: string;  // 'Sep'
  isToday: boolean;
}

interface DateSelectorProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
  onOpenCalendar?: () => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
  onOpenCalendar,
}) => {
  // Generate 14 days starting from a base reference (17 Sep 2026 or current)
  const dateList: DateItem[] = useMemo(() => {
    // We base around 2026-09-17 to align with mockup reference date
    const base = new Date(2026, 8, 17); // Month 8 is Sep in JS 0-indexed
    const list: DateItem[] = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      list.push({
        dateString,
        dayName: i === 0 ? 'Today' : DAY_NAMES[d.getDay()],
        dayNumber: String(d.getDate()),
        monthName: MONTH_NAMES[d.getMonth()],
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dateList.map((item) => {
          const isSelected = item.dateString === selectedDate;
          return (
            <TouchableOpacity
              key={item.dateString}
              style={[
                styles.dateCard,
                isSelected ? styles.dateCardActive : styles.dateCardInactive,
              ]}
              onPress={() => onSelectDate(item.dateString)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.dayNameActive : styles.dayNameInactive,
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  isSelected ? styles.dateTextActive : styles.dateTextInactive,
                ]}
              >
                {item.dayNumber} {item.monthName}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Calendar Picker button */}
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={onOpenCalendar}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={20} color="#8A4A1C" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DateSelector;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
    borderWidth: 1,
  },
  dateCardActive: {
    backgroundColor: '#9E3C1B', // Warm Terracotta / brick as seen in the mockup screenshot
    borderColor: '#9E3C1B',
    shadowColor: '#9E3C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  dateCardInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE7E1',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 3,
  },
  dayNameActive: {
    color: '#FFFFFF',
  },
  dayNameInactive: {
    color: '#7A6B63',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  dateTextInactive: {
    color: '#2C201A',
  },
  calendarButton: {
    width: 44,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
