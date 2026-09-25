import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Train } from '../types/Train';
import { Station } from '../types/Station';
import { trainService } from '../services/trainService';
import { stationService } from '../services/stationService';
import { STATION_MAP } from '../data/stations';
import { filterAndSortJourneyTrains } from '../utils/trainFilterUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchJourneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTrain?: (train: Train) => void;
  onSelectStation?: (stationCode: string) => void;
  onPlanRoute?: (fromCode: string, toCode: string, date?: string) => void;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
}

type StationPickTarget = 'from' | 'to' | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDateShort = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return `Today, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  if (diff === 1) return `Tomorrow, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  return `${DAY_FULL[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};

const buildMonthCalendar = (year: number, month: number): (string | null)[][] => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows: (string | null)[][] = [];
  let row: (string | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    row.push(toISODate(date));
    if (row.length === 7) { rows.push(row); row = []; }
  }
  if (row.length > 0) { while (row.length < 7) row.push(null); rows.push(row); }
  return rows;
};

// ─── Station Picker ───────────────────────────────────────────────────────────

interface StationPickerProps {
  target: 'from' | 'to';
  currentCode: string;
  allStations: Station[];
  onSelect: (code: string) => void;
  onBack: () => void;
}

const StationPicker: React.FC<StationPickerProps> = ({ target, currentCode, allStations, onSelect, onBack }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allStations.slice(0, 30);
    return allStations.filter(s =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [query, allStations]);

  return (
    <View style={{ flex: 1 }}>
      <View style={spStyles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color="#2C201A" />
        </TouchableOpacity>
        <Text style={spStyles.title}>Select {target === 'from' ? 'Origin (From)' : 'Destination (To)'}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={spStyles.inputWrap}>
        <Ionicons name="search" size={18} color="#8A4A1C" style={{ marginRight: 10 }} />
        <TextInput
          style={spStyles.input}
          placeholder="Type station name or code..."
          placeholderTextColor="#A8998E"
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#A8998E" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={s => s.code}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        renderItem={({ item: s }) => (
          <TouchableOpacity
            style={[spStyles.row, s.code === currentCode && spStyles.rowActive]}
            onPress={() => onSelect(s.code)}
            activeOpacity={0.7}
          >
            <View style={spStyles.codeBox}>
              <Text style={spStyles.code}>{s.code}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={spStyles.name}>{s.name}</Text>
              <Text style={spStyles.sub}>{s.state}</Text>
            </View>
            {s.code === currentCode && <Ionicons name="checkmark-circle" size={20} color="#9E3C1B" />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const spStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#EFEAE6',
    backgroundColor: '#FFFFFF',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#2C201A' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginTop: 14, marginBottom: 8,
    paddingHorizontal: 14, height: 48,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E8DED6',
  },
  input: { flex: 1, fontSize: 15, color: '#2C201A', height: '100%' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 12,
    borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EFEAE6',
    gap: 12,
  },
  rowActive: { borderColor: '#9E3C1B', backgroundColor: '#FFF5F2' },
  codeBox: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: '#F0E7DE', alignItems: 'center', justifyContent: 'center',
  },
  code: { fontSize: 12, fontWeight: '800', color: '#8A4A1C' },
  name: { fontSize: 14, fontWeight: '700', color: '#2C201A' },
  sub: { fontSize: 12, color: '#7A6B63', marginTop: 1 },
});

// ─── Mini Calendar ────────────────────────────────────────────────────────────

interface MiniCalendarProps {
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  minDate: string;
  maxDate: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onSelectDate, minDate, maxDate }) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const [viewYear, setViewYear] = useState(() => {
    const d = new Date((selectedDate || toISODate(today)) + 'T00:00:00');
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date((selectedDate || toISODate(today)) + 'T00:00:00');
    return d.getMonth();
  });

  const weeks = useMemo(() => buildMonthCalendar(viewYear, viewMonth), [viewYear, viewMonth]);

  const canPrev = useMemo(() => {
    const minD = new Date(minDate + 'T00:00:00');
    return !(viewYear === minD.getFullYear() && viewMonth === minD.getMonth());
  }, [viewYear, viewMonth, minDate]);

  const canNext = useMemo(() => {
    const maxD = new Date(maxDate + 'T00:00:00');
    return !(viewYear === maxD.getFullYear() && viewMonth === maxD.getMonth());
  }, [viewYear, viewMonth, maxDate]);

  const prevMonth = () => {
    if (!canPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (!canNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <View style={calStyles.container}>
      {/* Month nav */}
      <View style={calStyles.navRow}>
        <TouchableOpacity onPress={prevMonth} disabled={!canPrev} style={calStyles.navBtn}>
          <Ionicons name="chevron-back" size={18} color={canPrev ? '#9E3C1B' : '#D0C5BE'} />
        </TouchableOpacity>
        <Text style={calStyles.monthTitle}>{MONTH_FULL[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} disabled={!canNext} style={calStyles.navBtn}>
          <Ionicons name="chevron-forward" size={18} color={canNext ? '#9E3C1B' : '#D0C5BE'} />
        </TouchableOpacity>
      </View>
      {/* Day headers */}
      <View style={calStyles.dayHeader}>
        {DAY_NAMES.map(d => (
          <Text key={d} style={calStyles.dayName}>{d}</Text>
        ))}
      </View>
      {/* Weeks */}
      {weeks.map((week, wi) => (
        <View key={wi} style={calStyles.weekRow}>
          {week.map((iso, di) => {
            if (!iso) return <View key={di} style={calStyles.dayCell} />;
            const isSelected = iso === selectedDate;
            const isToday = iso === toISODate(today);
            const isPast = iso < minDate;
            const isFuture = iso > maxDate;
            const disabled = isPast || isFuture;
            return (
              <TouchableOpacity
                key={di}
                style={[
                  calStyles.dayCell,
                  isSelected && calStyles.dayCellSelected,
                  isToday && !isSelected && calStyles.dayCellToday,
                  disabled && calStyles.dayCellDisabled,
                ]}
                onPress={() => !disabled && onSelectDate(iso)}
                activeOpacity={disabled ? 1 : 0.7}
              >
                <Text style={[
                  calStyles.dayText,
                  isSelected && calStyles.dayTextSelected,
                  isToday && !isSelected && calStyles.dayTextToday,
                  disabled && calStyles.dayTextDisabled,
                ]}>
                  {new Date(iso + 'T00:00:00').getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const calStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F0EB', alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 15, fontWeight: '800', color: '#2C201A' },
  dayHeader: { flexDirection: 'row', marginBottom: 6 },
  dayName: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#8A7A70' },
  weekRow: { flexDirection: 'row' },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20, margin: 1 },
  dayCellSelected: { backgroundColor: '#9E3C1B' },
  dayCellToday: { backgroundColor: '#F5ECE3' },
  dayCellDisabled: { opacity: 0.3 },
  dayText: { fontSize: 13, fontWeight: '600', color: '#2C201A' },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  dayTextToday: { color: '#9E3C1B', fontWeight: '800' },
  dayTextDisabled: { color: '#A8998E' },
});

// ─── Main Modal: Simple & Clear Journey Input ─────────────────────────────────

export const SearchJourneyModal: React.FC<SearchJourneyModalProps> = ({
  visible,
  onClose,
  onPlanRoute,
  initialFrom,
  initialTo,
  initialDate,
}) => {
  const insets = useSafeAreaInsets();

  // Inputs: From, To, Date
  const [routeFrom, setRouteFrom] = useState(initialFrom || 'CSMT');
  const [routeTo, setRouteTo] = useState(initialTo || 'THVM');
  const [journeyDate, setJourneyDate] = useState<string | null>(initialDate !== undefined ? initialDate : () => toISODate(new Date()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [stationPickTarget, setStationPickTarget] = useState<StationPickTarget>(null);

  // Train and station data
  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [allStations, setAllStations] = useState<Station[]>([]);

  useEffect(() => {
    if (visible) {
      if (initialFrom) setRouteFrom(initialFrom);
      if (initialTo) setRouteTo(initialTo);
      if (initialDate !== undefined) setJourneyDate(initialDate);
      trainService.getAllTrains().then(setAllTrains);
      stationService.getAllStations().then(setAllStations);
    }
  }, [visible, initialFrom, initialTo, initialDate]);

  // Today & Tomorrow helpers
  const todayIso = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0);
    return toISODate(d);
  }, []);

  const tomorrowIso = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 1);
    return toISODate(d);
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 120);
    return toISODate(d);
  }, []);

  // Matching trains count
  const matchingTrains = useMemo(() => {
    return filterAndSortJourneyTrains(allTrains, routeFrom, routeTo, journeyDate || undefined);
  }, [allTrains, routeFrom, routeTo, journeyDate]);

  const handleSwap = useCallback(() => {
    const tmp = routeFrom;
    setRouteFrom(routeTo);
    setRouteTo(tmp);
  }, [routeFrom, routeTo]);

  const handleStationSelected = useCallback((code: string) => {
    if (stationPickTarget === 'from') setRouteFrom(code);
    else if (stationPickTarget === 'to') setRouteTo(code);
    setStationPickTarget(null);
  }, [stationPickTarget]);

  const handleFindTrains = useCallback(() => {
    onPlanRoute?.(routeFrom, routeTo, journeyDate || undefined);
    onClose();
  }, [routeFrom, routeTo, journeyDate, onPlanRoute, onClose]);

  // ── Station Picker Sub-view ──────────────────────────────────────────────
  if (stationPickTarget !== null) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={() => setStationPickTarget(null)}>
        <View style={{ flex: 1, backgroundColor: '#FAF7F4', paddingTop: insets.top }}>
          <StationPicker
            target={stationPickTarget}
            currentCode={stationPickTarget === 'from' ? routeFrom : routeTo}
            allStations={allStations}
            onSelect={handleStationSelected}
            onBack={() => setStationPickTarget(null)}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#2C201A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan Journey</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ── Simple Content: From, To, Date ───────────────────────── */}
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── From & To Route Card ─────────────────────────────── */}
          <View style={styles.card}>
            {/* FROM Field */}
            <TouchableOpacity
              style={styles.stationField}
              onPress={() => setStationPickTarget('from')}
              activeOpacity={0.7}
            >
              <View style={styles.dotOrigin} />
              <View style={styles.stationTextContainer}>
                <Text style={styles.fieldLabel}>FROM</Text>
                <Text style={styles.stationName} numberOfLines={1}>
                  {STATION_MAP[routeFrom]?.name ?? routeFrom}
                </Text>
                <Text style={styles.stationCode}>{routeFrom}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
            </TouchableOpacity>

            {/* Divider with Swap Button */}
            <View style={styles.swapDividerRow}>
              <View style={styles.dividerLine} />
              <TouchableOpacity
                style={styles.swapButton}
                onPress={handleSwap}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="swap-vertical" size={18} color="#9E3C1B" />
              </TouchableOpacity>
              <View style={styles.dividerLine} />
            </View>

            {/* TO Field */}
            <TouchableOpacity
              style={styles.stationField}
              onPress={() => setStationPickTarget('to')}
              activeOpacity={0.7}
            >
              <View style={styles.dotDestination} />
              <View style={styles.stationTextContainer}>
                <Text style={styles.fieldLabel}>TO</Text>
                <Text style={styles.stationName} numberOfLines={1}>
                  {STATION_MAP[routeTo]?.name ?? routeTo}
                </Text>
                <Text style={styles.stationCode}>{routeTo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
            </TouchableOpacity>
          </View>

          {/* ── Date Selection Card ──────────────────────────────── */}
          <View style={styles.card}>
            {/* Date Row trigger */}
            <TouchableOpacity
              style={styles.dateRow}
              onPress={() => setShowCalendar(v => !v)}
              activeOpacity={0.75}
            >
              <View style={styles.dateLeft}>
                <View style={styles.dateIconBox}>
                  <Ionicons name="calendar-outline" size={18} color="#9E3C1B" />
                </View>
                <View>
                  <Text style={styles.fieldLabel}>JOURNEY DATE</Text>
                  <Text style={styles.dateValue}>
                    {journeyDate ? formatDateShort(journeyDate) : 'All Days (Flexible)'}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={showCalendar ? 'chevron-up' : 'calendar'}
                size={18}
                color="#9E3C1B"
              />
            </TouchableOpacity>

            {/* Quick Date Pills: Today, Tomorrow, Pick Date, All Days */}
            <View style={styles.quickDateRow}>
              {/* Today */}
              <TouchableOpacity
                style={[styles.datePill, journeyDate === todayIso && styles.datePillActive]}
                onPress={() => {
                  setJourneyDate(todayIso);
                  setShowCalendar(false);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.datePillText, journeyDate === todayIso && styles.datePillTextActive]}>
                  Today
                </Text>
              </TouchableOpacity>

              {/* Tomorrow */}
              <TouchableOpacity
                style={[styles.datePill, journeyDate === tomorrowIso && styles.datePillActive]}
                onPress={() => {
                  setJourneyDate(tomorrowIso);
                  setShowCalendar(false);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.datePillText, journeyDate === tomorrowIso && styles.datePillTextActive]}>
                  Tomorrow
                </Text>
              </TouchableOpacity>

              {/* Specific / Calendar */}
              <TouchableOpacity
                style={[
                  styles.datePill,
                  journeyDate !== null &&
                    journeyDate !== todayIso &&
                    journeyDate !== tomorrowIso &&
                    styles.datePillActive,
                ]}
                onPress={() => setShowCalendar(v => !v)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.datePillText,
                    journeyDate !== null &&
                      journeyDate !== todayIso &&
                      journeyDate !== tomorrowIso &&
                      styles.datePillTextActive,
                  ]}
                >
                  {journeyDate && journeyDate !== todayIso && journeyDate !== tomorrowIso
                    ? `${new Date(journeyDate + 'T00:00:00').getDate()} ${
                        MONTH_NAMES[new Date(journeyDate + 'T00:00:00').getMonth()]
                      }`
                    : 'Pick Date'}
                </Text>
              </TouchableOpacity>

              {/* All Days */}
              <TouchableOpacity
                style={[styles.datePill, journeyDate === null && styles.datePillActive]}
                onPress={() => {
                  setJourneyDate(null);
                  setShowCalendar(false);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.datePillText, journeyDate === null && styles.datePillTextActive]}>
                  All Days
                </Text>
              </TouchableOpacity>
            </View>

            {/* Expandable Calendar */}
            {showCalendar && (
              <View style={styles.calendarContainer}>
                <MiniCalendar
                  selectedDate={journeyDate || todayIso}
                  onSelectDate={(iso) => {
                    setJourneyDate(iso);
                    setShowCalendar(false);
                  }}
                  minDate={todayIso}
                  maxDate={maxDate}
                />
              </View>
            )}
          </View>

          {/* ── Find Trains Action Button ────────────────────────── */}
          <TouchableOpacity
            style={styles.findButton}
            onPress={handleFindTrains}
            activeOpacity={0.85}
          >
            <Ionicons name="train" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.findButtonText}>
              Find Trains ({matchingTrains.length} Available)
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE6',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C201A',
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },

  // ── Card Container ─────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },

  // ── Station Field (From / To) ──────────────────────────────────
  stationField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dotOrigin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
    marginRight: 14,
  },
  dotDestination: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C05621',
    marginRight: 14,
  },
  stationTextContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A7A70',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C201A',
  },
  stationCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E3C1B',
    marginTop: 2,
  },

  // ── Swap Divider ───────────────────────────────────────────────
  swapDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0EAE4',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7EFE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E8DED6',
  },

  // ── Date Card ──────────────────────────────────────────────────
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7EFE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },

  // ── Quick Date Pills ───────────────────────────────────────────
  quickDateRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  datePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5F0',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  datePillActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A3E38',
  },
  datePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Expandable Calendar Container ──────────────────────────────
  calendarContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0EAE4',
    paddingBottom: 8,
  },

  // ── Find Trains Button ─────────────────────────────────────────
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9E3C1B',
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#9E3C1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  findButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
