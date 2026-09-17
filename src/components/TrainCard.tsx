import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Train } from '../types/Train';
import { STATION_MAP } from '../data/stations';

export function getTrainTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Rajdhani: '#C62828',
    VandeBharat: '#0D47A1',
    Tejas: '#6A1B9A',
    Express: '#9E3C1B',
    Mail: '#E65100',
    Passenger: '#2E7D32',
    DEMU: '#2E7D32',
  };
  return colors[type] ?? '#9E3C1B';
}

// ── Segment type used by home-screen explorer ──────────────────────────────
export interface TrainCardSegment {
  fromCode: string;
  fromName: string;
  fromTime: string;
  fromDay: number;
  toCode: string;
  toName: string;
  toTime: string;
  toDay: number;
  direction: '→ Goa' | '→ Mumbai' | 'Halt';
  directionColor: string;
  directionBg: string;
}

interface TrainCardProps {
  train: Train;
  onPress: (train: Train) => void;

  // ── Journey search context (optional) ──
  isSelected?: boolean;
  selectedFrom?: string;
  selectedTo?: string;
  computedDuration?: string;
  destinationType?: 'GOA' | 'NEARBY';
  distanceLabel?: string;
  alternativeFor?: string;
  roadTravelTip?: string;

  // ── Home explorer context (optional) ──
  // When provided, shows the contextual segment banner instead of timing row
  segment?: TrainCardSegment | null;
  // When true, shows "→ Goa notice" or "Terminates at SWV" notice on All-trains view
  showGoaNotice?: boolean;
  showAltNotice?: boolean;
}

export const TrainCard: React.FC<TrainCardProps> = memo(({
  train,
  onPress,
  isSelected,
  selectedFrom,
  selectedTo,
  computedDuration,
  destinationType = 'GOA',
  distanceLabel,
  alternativeFor,
  roadTravelTip,
  segment,
  showGoaNotice,
  showAltNotice,
}) => {
  // ── Find stops for timing ─────────────────────────────────────────────────
  const fromStop = train.stops.find(s => s.stationCode === selectedFrom) ?? train.stops[0];
  const toStop = train.stops.find(s => s.stationCode === selectedTo) ?? train.stops[train.stops.length - 1];

  const defaultDepTime = fromStop?.departureTime ?? '00:00';
  const defaultArrTime = toStop?.arrivalTime ?? toStop?.departureTime ?? '00:00';
  const defaultDayOffset = (toStop?.dayOffset ?? 0) - (fromStop?.dayOffset ?? 0);

  const defaultFromName = (selectedFrom && STATION_MAP[selectedFrom]?.name)
    || STATION_MAP[train.sourceStationCode]?.name
    || train.sourceStationCode;
  const defaultToName = (selectedTo && STATION_MAP[selectedTo]?.name)
    || STATION_MAP[train.destinationStationCode]?.name
    || train.destinationStationCode;

  // Active segment values (if a directional segment is present, e.g. for Goa / Mumbai)
  const isDirectionalSegment = !!(
    segment &&
    segment.direction !== 'Halt' &&
    segment.fromCode !== segment.toCode
  );

  const depTime = isDirectionalSegment ? segment.fromTime : defaultDepTime;
  const arrTime = isDirectionalSegment ? segment.toTime : defaultArrTime;
  const fromName = isDirectionalSegment ? segment.fromName : defaultFromName;
  const toName = isDirectionalSegment ? segment.toName : defaultToName;
  const dayOffset = isDirectionalSegment
    ? Math.max(0, (segment.toDay ?? 0) - (segment.fromDay ?? 0))
    : defaultDayOffset;

  // ── Duration ──────────────────────────────────────────────────────────────
  const computedDur = computedDuration ?? (() => {
    const [dh, dm] = depTime.split(':').map(Number);
    const [ah, am] = arrTime.split(':').map(Number);
    if (isNaN(dh) || isNaN(dm) || isNaN(ah) || isNaN(am)) return '0h 00m';
    const depDay = isDirectionalSegment ? (segment?.fromDay ?? 0) : (fromStop?.dayOffset ?? 0);
    const arrDay = isDirectionalSegment ? (segment?.toDay ?? 0) : (toStop?.dayOffset ?? 0);
    const depMins = depDay * 1440 + dh * 60 + dm;
    const arrMins = arrDay * 1440 + ah * 60 + am;
    let diff = arrMins - depMins;
    if (diff < 0) diff += 1440;
    return `${Math.floor(diff / 60)}h ${(diff % 60).toString().padStart(2, '0')}m`;
  })();

  // ── Journey type ─────────────────────────────────────────────────────────
  const depHour = parseInt(depTime.split(':')[0] || '12', 10);
  const arrHour = parseInt(arrTime.split(':')[0] || '12', 10);

  // A train is overnight if it crosses midnight / arrives next day
  const isOvernight = dayOffset > 0;

  // Daytime is 05:00 to 18:59
  const isDepDay = depHour >= 5 && depHour < 19;
  const isArrDay = arrHour >= 5 && arrHour < 19;

  const journeyType = isOvernight
    ? { label: '🌙 Overnight', bg: '#E8E1F1', text: '#57466F' }
    : isDepDay && isArrDay
      ? { label: '☀️ Day', bg: '#FEF3C7', text: '#92400E' }
      : isDepDay && !isArrDay
        ? { label: '🌅 Evening', bg: '#FFEDD5', text: '#9A3412' }
        : { label: '🌙 Night', bg: '#EDE9FE', text: '#5B21B6' };

  // ── Running days ─────────────────────────────────────────────────────────
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const runsText = train.runningDays.length === 7
    ? 'Runs daily'
    : train.runningDays.length === 6 && !train.runningDays.includes(0)
      ? 'Mon – Sat'
      : train.runningDays.length <= 3
        ? `Runs: ${train.runningDays.map(d => DAY_NAMES[d]).join(', ')}`
        : `${train.runningDays.length} days/week`;

  // ── Goa stops count ──────────────────────────────────────────────────────
  const goaStopsCount = train.stops.filter(s =>
    ['PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'VSG', 'SVDEM', 'KULEM'].includes(s.stationCode),
  ).length;

  const isAlternative = destinationType === 'NEARBY';
  // Whether we are in the explorer (home) context
  const isExplorer = segment !== undefined;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isAlternative && !isExplorer && styles.cardAlternative,
        showAltNotice && styles.cardAlt,
      ]}
      onPress={() => onPress(train)}
      activeOpacity={0.88}
    >
      {/* ── Header: Train Number + Name ── */}
      <View style={styles.headerRow}>
        <View style={styles.numberAndName}>
          <Text style={styles.trainNumber}>{train.trainNumber}</Text>
          <Text style={styles.trainName} numberOfLines={1}>{train.name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#A89D96" />
      </View>

      {/* ── Route subtitle & Journey Type (Consistent across all tabs) ── */}
      <View style={styles.routeAndTypeRow}>
        <View style={styles.routeWithTag}>
          <Text style={styles.routeSubtitle} numberOfLines={1}>
            {fromName} → {toName}
          </Text>
          {/* {isDirectionalSegment && (
            <View style={[styles.directionChip, { backgroundColor: segment.directionBg }]}>
              <Ionicons
                name={segment.direction === '→ Mumbai' ? 'business-outline' : 'sunny-outline'}
                size={10}
                color={segment.directionColor}
              />
              <Text style={[styles.directionChipText, { color: segment.directionColor }]}>
                {segment.direction}
              </Text>
            </View>
          )} */}
        </View>
        <View style={[styles.badgeJourneyType, { backgroundColor: journeyType.bg }]}>
          <Text style={[styles.badgeJourneyTypeText, { color: journeyType.text }]} numberOfLines={1}>
            {journeyType.label}
          </Text>
        </View>
      </View>

      {/* ── Main Timings & Duration Row (Consistent across all tabs) ── */}
      <View style={styles.timingSection}>
        <Text style={styles.timeText}>{depTime}</Text>
        <View style={styles.durationTrack}>
          <View style={styles.trackLine} />
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{computedDur}</Text>
          </View>
        </View>
        <View style={styles.arrCol}>
          <Text style={styles.timeText}>
            {arrTime}
            {dayOffset > 0 && <Text style={styles.dayOffsetSub}> +{dayOffset}</Text>}
          </Text>
        </View>
      </View>

      {/* ── Halt Banner (Sawantwadi / Ratnagiri specific station) ── */}
      {segment && segment.direction === 'Halt' && (
        <View style={styles.haltBanner}>
          <Ionicons name="pin" size={13} color="#9E3C1B" />
          <Text style={styles.haltBannerText}>
            Halt at {segment.fromName}:{' '}
            <Text style={styles.haltBold}>Arr {segment.fromTime}</Text>
            {segment.toTime && segment.toTime !== segment.fromTime && (
              <Text style={styles.haltBold}> · Dep {segment.toTime}</Text>
            )}
          </Text>
        </View>
      )}

      {/* ── Alternative / Goa notices (explorer All-trains view) ── */}
      {showAltNotice && (
        <View style={styles.altNotice}>
          <Ionicons name="navigate-outline" size={12} color="#D97706" />
          <Text style={styles.altNoticeText}>Terminates at Sawantwadi Road (38 km from North Goa)</Text>
        </View>
      )}
      {showGoaNotice && (
        <View style={styles.goaNotice}>
          <Ionicons name="checkmark-circle-outline" size={12} color="#2E7D32" />
          <Text style={styles.goaNoticeText}>Direct Goa train with scheduled halts</Text>
        </View>
      )}

      {/* ── Journey-search: Alternative station explanation ── */}
      {!isExplorer && isAlternative && (
        <View style={styles.altExplanationBox}>
          <View style={styles.altBadgeRow}>
            <View style={styles.altBadge}>
              <Ionicons name="navigate-outline" size={12} color="#D97706" />
              <Text style={styles.altBadgeText}>Alternative station</Text>
            </View>
            {distanceLabel && (
              <Text style={styles.altDistanceText}>{distanceLabel}</Text>
            )}
          </View>
          <View style={styles.transitHintRow}>
            <Text style={styles.transitHint}>🚆 Train available to {toName}</Text>
            <Text style={styles.transitRoadHint}>🚌 {roadTravelTip ?? 'Continue to Goa by road'}</Text>
          </View>
        </View>
      )}

      {/* ── Journey-search: Goa station pill ── */}
      {!isExplorer && !isAlternative && (
        <View style={styles.goaStationPillRow}>
          <View style={styles.goaStationPill}>
            <Ionicons name="location" size={12} color="#1E824C" />
            <Text style={styles.goaStationPillText}>{toName} · Goa station</Text>
          </View>
        </View>
      )}

      {/* ── Footer: Running days + Goa stops ── */}
      <View style={styles.badgesRow}>
        {!isAlternative && goaStopsCount > 0 && !isExplorer && (
          <View style={styles.badgeGoa}>
            <Ionicons name="leaf-outline" size={12} color="#8A4A1C" />
            <Text style={styles.badgeGoaText}>{goaStopsCount} Goa stops</Text>
          </View>
        )}
        <View style={styles.badgeRuns}>
          <Ionicons name="calendar-outline" size={12} color="#1E824C" />
          <Text style={styles.badgeRunsText}>{runsText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

TrainCard.displayName = 'TrainCard';

export default TrainCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardSelected: {
    borderColor: '#9E3C1B',
    borderWidth: 1.5,
  },
  cardAlternative: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#D97706',
  },
  cardAlt: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#D97706',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  numberAndName: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  trainNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C201A',
    marginRight: 8,
    letterSpacing: 0.3,
  },
  trainName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#382A22',
    flex: 1,
  },
  routeAndTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  routeWithTag: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    marginRight: 8,
  },
  routeSubtitle: {
    fontSize: 13,
    color: '#7A6B63',
    fontWeight: '600',
    flexShrink: 1,
  },
  directionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  directionChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  badgeJourneyType: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeJourneyTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Halt Banner ───────────────────────────────────────────────────────────
  haltBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF4F0',
    borderWidth: 1,
    borderColor: '#F2D7CD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 10,
  },
  haltBannerText: {
    fontSize: 12,
    color: '#5C4E46',
    flex: 1,
  },
  haltBold: {
    fontWeight: '800',
    color: '#9E3C1B',
  },

  // ── Timing Row ────────────────────────────────────────────────────────────
  timingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1613',
  },
  arrCol: {
    alignItems: 'flex-end',
  },
  dayOffsetSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  durationTrack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 12,
  },
  trackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: '#E5DDD7',
  },
  durationPill: {
    backgroundColor: '#FAF7F4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE7E1',
    zIndex: 2,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6B63',
  },

  // ── Explorer notices ──────────────────────────────────────────────────────
  altNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
    marginBottom: 8,
  },
  altNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
  goaNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5EB',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
    marginBottom: 8,
  },
  goaNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
  },

  // ── Journey-search: Alternative station explanation ───────────────────────
  altExplanationBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  altBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  altBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    gap: 4,
  },
  altBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  altDistanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350F',
  },
  transitHintRow: {
    gap: 2,
  },
  transitHint: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  transitRoadHint: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '500',
  },

  // ── Journey-search: Goa station pill ─────────────────────────────────────
  goaStationPillRow: {
    marginTop: 8,
    marginBottom: 2,
  },
  goaStationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EE',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  goaStationPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E824C',
  },

  // ── Footer badges ─────────────────────────────────────────────────────────
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  badgeGoa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7EEE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  badgeGoaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A4A1C',
  },
  badgeRuns: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  badgeRunsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E824C',
  },
});
