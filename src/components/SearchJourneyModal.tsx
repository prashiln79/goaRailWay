import React, { useState, useMemo, useCallback } from 'react';
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
import { getTrainTypeColor } from './TrainCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchJourneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTrain: (train: Train) => void;
  onSelectStation: (stationCode: string) => void;
  onPlanRoute?: (fromCode: string, toCode: string, date?: string) => void;
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

const formatDateDisplay = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} (${DAY_NAMES[d.getDay()]})`;
};

const formatDateLong = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  return `${DAY_FULL[d.getDay()]}, ${d.getDate()} ${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
};

// Quick date chips: Today, Tomorrow, then next 5 days
const buildQuickDates = (): { label: string; iso: string }[] => {
  const dates: { label: string; iso: string }[] = [];
  const base = new Date(); base.setHours(0,0,0,0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = toISODate(d);
    let label: string;
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else label = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
    dates.push({ label, iso });
  }
  return dates;
};

// Build month calendar data
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

// ─── Sub-component: Station Picker ────────────────────────────────────────────

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
        <Text style={spStyles.title}>Select {target === 'from' ? 'Origin' : 'Destination'}</Text>
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

// ─── Sub-component: Mini Calendar ─────────────────────────────────────────────

interface MiniCalendarProps {
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  minDate: string;
  maxDate: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onSelectDate, minDate, maxDate }) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const [viewYear, setViewYear] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(selectedDate + 'T00:00:00');
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
  container: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F0EB', alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 15, fontWeight: '800', color: '#2C201A' },
  dayHeader: { flexDirection: 'row', marginBottom: 4 },
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

// ─── Main Modal ───────────────────────────────────────────────────────────────

export const SearchJourneyModal: React.FC<SearchJourneyModalProps> = ({
  visible,
  onClose,
  onSelectTrain,
  onSelectStation,
  onPlanRoute,
}) => {
  const insets = useSafeAreaInsets();

  // Journey planner state
  const [routeFrom, setRouteFrom] = useState('CSMT');
  const [routeTo, setRouteTo] = useState('THVM');
  const [journeyDate, setJourneyDate] = useState(() => toISODate(new Date()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [stationPickTarget, setStationPickTarget] = useState<StationPickTarget>(null);

  // Data
  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [allStations, setAllStations] = useState<Station[]>([]);

  React.useEffect(() => {
    if (visible) {
      trainService.getAllTrains().then(setAllTrains);
      stationService.getAllStations().then(setAllStations);
    }
  }, [visible]);

  // Date bounds
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return toISODate(d); }, []);
  const maxDate = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 120); return toISODate(d);
  }, []);
  const quickDates = useMemo(() => buildQuickDates(), []);

  // Route trains filtered
  const routeTrains = useMemo<Train[]>(() => {
    const MUMBAI_CODES = new Set(['CSMT', 'LTT', 'DR', 'PNVL', 'BCT', 'BDTS', 'DIV']);
    const isFromMumbai = MUMBAI_CODES.has(routeFrom);
    return allTrains.filter(train => {
      let fromIdx = train.stops.findIndex(s => s.stationCode === routeFrom);
      if (fromIdx < 0 && isFromMumbai) fromIdx = train.stops.findIndex(s => MUMBAI_CODES.has(s.stationCode));
      if (fromIdx < 0) return false;
      const toIdx = train.stops.findIndex((s, i) => i > fromIdx && s.stationCode === routeTo);
      return toIdx > fromIdx;
    });
  }, [routeFrom, routeTo, allTrains]);

  const handleSwapRoute = useCallback(() => {
    const tmp = routeFrom;
    setRouteFrom(routeTo);
    setRouteTo(tmp);
  }, [routeFrom, routeTo]);

  const handleOpenStationPick = useCallback((target: 'from' | 'to') => {
    setStationPickTarget(target);
  }, []);

  const handleStationSelected = useCallback((code: string) => {
    if (stationPickTarget === 'from') setRouteFrom(code);
    else if (stationPickTarget === 'to') setRouteTo(code);
    setStationPickTarget(null);
  }, [stationPickTarget]);

  const handleSearchTrain = useCallback(() => {
    onPlanRoute?.(routeFrom, routeTo, journeyDate);
    onClose();
  }, [routeFrom, routeTo, journeyDate, onPlanRoute, onClose]);

  // ── If station picker is open, render it full-screen ──────────────────────
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
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#2C201A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan Your Journey</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ── Journey Content ──────────────────────────────────────── */}
        {
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Journey Card: From / To ──────────────────────────── */}
            <View style={styles.journeyCard}>
              {/* FROM */}
              <TouchableOpacity
                style={styles.stationRow}
                onPress={() => handleOpenStationPick('from')}
                activeOpacity={0.7}
              >
                <View style={styles.dotOrigin} />
                <View style={styles.stationInfo}>
                  <Text style={styles.stationLabel}>FROM</Text>
                  <Text style={styles.stationValue}>
                    {STATION_MAP[routeFrom]?.name ?? routeFrom}
                  </Text>
                  <Text style={styles.stationCode}>{routeFrom}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
              </TouchableOpacity>

              {/* Divider + Swap */}
              <View style={styles.swapRow}>
                <View style={styles.swapLine} />
                <TouchableOpacity style={styles.swapBtn} onPress={handleSwapRoute} activeOpacity={0.7}>
                  <Ionicons name="swap-vertical" size={18} color="#9E3C1B" />
                </TouchableOpacity>
              </View>

              {/* TO */}
              <TouchableOpacity
                style={styles.stationRow}
                onPress={() => handleOpenStationPick('to')}
                activeOpacity={0.7}
              >
                <View style={styles.dotDestination} />
                <View style={styles.stationInfo}>
                  <Text style={styles.stationLabel}>TO</Text>
                  <Text style={styles.stationValue}>
                    {STATION_MAP[routeTo]?.name ?? routeTo}
                  </Text>
                  <Text style={styles.stationCode}>{routeTo}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
              </TouchableOpacity>
            </View>

            {/* ── Journey Date: tap to open calendar ── */}
            <TouchableOpacity
              style={styles.datePickerRow}
              onPress={() => setShowCalendar(v => !v)}
              activeOpacity={0.75}
            >
              <View style={styles.datePickerLeft}>
                <Ionicons name="calendar-outline" size={20} color="#9E3C1B" style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.datePickerLabel}>JOURNEY DATE</Text>
                  <Text style={styles.datePickerValue}>{formatDateLong(journeyDate)}</Text>
                </View>
              </View>
              <Ionicons
                name={showCalendar ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9E3C1B"
              />
            </TouchableOpacity>

            {/* Mini Calendar (toggled) */}
            {showCalendar && (
              <View style={styles.calendarCard}>
                <MiniCalendar
                  selectedDate={journeyDate}
                  onSelectDate={(iso) => { setJourneyDate(iso); setShowCalendar(false); }}
                  minDate={today}
                  maxDate={maxDate}
                />
              </View>
            )}



            {/* ── Search Trains Button ─────────────────────────────── */}
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchTrain} activeOpacity={0.85}>
              <Ionicons name="train" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.searchBtnText}>
                Find Trains ({routeTrains.length} available)
              </Text>
            </TouchableOpacity>

            {/* ── Direct Trains List ───────────────────────────────── */}
            {routeTrains.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="train-outline" size={15} color="#8A7A70" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>
                    DIRECT TRAINS · {routeFrom} → {routeTo}
                  </Text>
                </View>
                {routeTrains.map(t => {
                  const color = getTrainTypeColor(t.type);
                  return (
                    <TouchableOpacity
                      key={t.trainNumber}
                      style={styles.resultRow}
                      onPress={() => { onClose(); onSelectTrain(t); }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.resultIconBox, { backgroundColor: color + '15' }]}>
                        <Ionicons name="train" size={20} color={color} />
                      </View>
                      <View style={styles.resultInfo}>
                        <View style={styles.resultTitleRow}>
                          <Text style={styles.resultTitle}>{t.name}</Text>
                          <View style={[styles.typeBadge, { backgroundColor: color + '15' }]}>
                            <Text style={[styles.typeBadgeText, { color }]}>{t.type}</Text>
                          </View>
                        </View>
                        <Text style={styles.resultSubtitle}>
                          #{t.trainNumber} · stops at {routeFrom} & {routeTo}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        }
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F4' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#EFEAE6',
    backgroundColor: '#FFFFFF',
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#2C201A' },



  // ── Journey Card ───────────────────────────────────────────────
  journeyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    marginHorizontal: 16, marginTop: 16, marginBottom: 6,
    borderWidth: 1, borderColor: '#EFEAE6',
    shadowColor: '#2C201A', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
  },
  stationRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dotOrigin: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2E7D32', marginRight: 14 },
  dotDestination: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#C05621', marginRight: 14 },
  stationInfo: { flex: 1 },
  stationLabel: { fontSize: 10, fontWeight: '800', color: '#8A7A70', letterSpacing: 0.6, marginBottom: 2 },
  stationValue: { fontSize: 16, fontWeight: '800', color: '#2C201A' },
  stationCode: { fontSize: 11, fontWeight: '700', color: '#9E3C1B', marginTop: 1 },
  swapRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  swapLine: { flex: 1, height: 1, backgroundColor: '#F0EAE4' },
  swapBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F7EFE8', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 1, borderColor: '#E8DED6',
  },

  // ── Section headers ────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#8A7A70', letterSpacing: 0.8 },

  // ── Date picker row ────────────────────────────────────────────
  datePickerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    marginHorizontal: 16, marginTop: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#EFEAE6',
    shadowColor: '#2C201A', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  datePickerLeft: { flexDirection: 'row', alignItems: 'center' },
  datePickerLabel: { fontSize: 10, fontWeight: '800', color: '#8A7A70', letterSpacing: 0.6, marginBottom: 2 },
  datePickerValue: { fontSize: 15, fontWeight: '700', color: '#2C201A' },


  // ── Calendar card ──────────────────────────────────────────────
  calendarCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    marginHorizontal: 16, marginTop: 12,
    borderWidth: 1, borderColor: '#EFEAE6',
    shadowColor: '#2C201A', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    paddingBottom: 8,
  },

  // ── Route chips ────────────────────────────────────────────────
  chipsScroll: { paddingHorizontal: 16, gap: 8, paddingVertical: 2 },
  routeChip: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8DED6',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  routeChipActive: { backgroundColor: '#9E3C1B', borderColor: '#9E3C1B' },
  routeChipText: { fontSize: 13, fontWeight: '600', color: '#4A3E38' },
  routeChipTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // ── Search button ──────────────────────────────────────────────
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#9E3C1B',
    marginHorizontal: 16, marginTop: 20, marginBottom: 8,
    paddingVertical: 15, borderRadius: 16,
    shadowColor: '#9E3C1B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  searchBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

  // ── Train results ──────────────────────────────────────────────
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 12,
    borderRadius: 12, marginHorizontal: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#EFEAE6',
  },
  resultIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  resultInfo: { flex: 1 },
  resultTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultTitle: { fontSize: 15, fontWeight: '700', color: '#2C201A' },
  resultSubtitle: { fontSize: 12, color: '#7A6B63', marginTop: 2 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  codeBadge: { backgroundColor: '#F0E7DE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  codeBadgeText: { fontSize: 10, fontWeight: '700', color: '#8A4A1C' },


});
