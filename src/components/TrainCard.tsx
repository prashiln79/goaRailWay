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

export type TrainCategory = 'PREMIUM' | 'SUPERFAST' | 'EXPRESS' | 'PASSENGER';
export type TrainGroup = 'SUPERFAST_PREMIUM' | 'EXPRESS_PASSENGER';

export interface TrainCategoryInfo {
  category: TrainCategory;
  group: TrainGroup;
  label: string;
  badgeBg: string;
  badgeText: string;
  accentBorderColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isSuperfastOrPremium: boolean;
}

export function getTrainCategory(train: Train): TrainCategoryInfo {
  const isPremium =
    train.type === 'VandeBharat' ||
    train.type === 'Tejas' ||
    train.type === 'Rajdhani';

  const isSuperfast =
    !isPremium &&
    (train.name.includes('SF') ||
      train.name.includes('Superfast') ||
      train.trainNumber.startsWith('12') ||
      train.trainNumber.startsWith('20') ||
      train.trainNumber.startsWith('22'));

  const isPassenger =
    train.type === 'Passenger' ||
    train.type === 'DEMU' ||
    train.name.includes('Passenger');

  if (train.type === 'VandeBharat') {
    return {
      category: 'PREMIUM',
      group: 'SUPERFAST_PREMIUM',
      label: 'Vande Bharat',
      badgeBg: '#EBF3FF',
      badgeText: '#0052CC',
      accentBorderColor: '#0052CC',
      iconName: 'flash',
      isSuperfastOrPremium: true,
    };
  }

  if (train.type === 'Tejas') {
    return {
      category: 'PREMIUM',
      group: 'SUPERFAST_PREMIUM',
      label: 'Tejas',
      badgeBg: '#F5EDFF',
      badgeText: '#7928CA',
      accentBorderColor: '#7928CA',
      iconName: 'star',
      isSuperfastOrPremium: true,
    };
  }

  if (train.type === 'Rajdhani') {
    return {
      category: 'PREMIUM',
      group: 'SUPERFAST_PREMIUM',
      label: 'Rajdhani',
      badgeBg: '#FFF1EE',
      badgeText: '#D9381E',
      accentBorderColor: '#D9381E',
      iconName: 'ribbon',
      isSuperfastOrPremium: true,
    };
  }

  if (isSuperfast) {
    return {
      category: 'SUPERFAST',
      group: 'SUPERFAST_PREMIUM',
      label: 'Superfast',
      badgeBg: '#FFF7ED',
      badgeText: '#C2410C',
      accentBorderColor: '#EA580C',
      iconName: 'flash-outline',
      isSuperfastOrPremium: true,
    };
  }

  if (isPassenger) {
    return {
      category: 'PASSENGER',
      group: 'EXPRESS_PASSENGER',
      label: 'Passenger',
      badgeBg: '#F0FDF4',
      badgeText: '#15803D',
      accentBorderColor: '#16A34A',
      iconName: 'subway-outline',
      isSuperfastOrPremium: false,
    };
  }

  return {
    category: 'EXPRESS',
    group: 'EXPRESS_PASSENGER',
    label: 'Express',
    badgeBg: '#F3F4F6',
    badgeText: '#4B5563',
    accentBorderColor: '#9CA3AF',
    iconName: 'train-outline',
    isSuperfastOrPremium: false,
  };
}

export interface FrequencyBadgeInfo {
  label: string;
  isDaily: boolean;
  bg: string;
  text: string;
  borderColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export function getFrequencyBadge(runningDays?: number[]): FrequencyBadgeInfo {
  const days = runningDays ?? [];
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (days.length === 7) {
    return {
      label: 'Runs Daily',
      isDaily: true,
      bg: '#ECFDF5',
      text: '#047857',
      borderColor: '#A7F3D0',
      iconName: 'repeat',
    };
  }

  if (days.length === 6) {
    const missing = [1, 2, 3, 4, 5, 6, 0].find(d => !days.includes(d));
    const missingName = missing !== undefined ? DAY_NAMES[missing] : '';
    return {
      label: missingName ? `Daily ex. ${missingName}` : '6 days/wk',
      isDaily: false,
      bg: '#F0FDF4',
      text: '#15803D',
      borderColor: '#BBF7D0',
      iconName: 'calendar-outline',
    };
  }

  if (days.length === 1) {
    const dayName = DAY_NAMES[days[0]];
    return {
      label: `Weekly (${dayName})`,
      isDaily: false,
      bg: '#FFFBEB',
      text: '#B45309',
      borderColor: '#FDE68A',
      iconName: 'calendar-outline',
    };
  }

  // 2 to 5 days
  const sorted = [...days].sort((a, b) => {
    const orderA = a === 0 ? 7 : a;
    const orderB = b === 0 ? 7 : b;
    return orderA - orderB;
  });
  const daysStr = sorted.map(d => DAY_NAMES[d]).join(', ');

  return {
    label: daysStr || 'Special',
    isDaily: false,
    bg: '#EFF6FF',
    text: '#1D4ED8',
    borderColor: '#BFDBFE',
    iconName: 'calendar-outline',
  };
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
  direction: '→ Goa' | '→ Mumbai' | 'Halt' | '→ Nearby';
  directionColor: string;
  directionBg: string;
}

interface TrainCardProps {
  train: Train;
  onPress: (train: Train) => void;
  index?: number;

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
  index,
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

  // ── Goa stops count ──────────────────────────────────────────────────────
  const goaStopsCount = train.stops.filter(s =>
    ['PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'VSG', 'SVDEM', 'KULEM'].includes(s.stationCode),
  ).length;

  const isAlternative = destinationType === 'NEARBY';
  // Whether we are in the explorer (home) context
  const isExplorer = segment !== undefined;
  const catInfo = getTrainCategory(train);
  const freqInfo = getFrequencyBadge(train.runningDays);
  const isOddRow = typeof index === 'number' && index % 2 !== 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isOddRow && styles.cardOdd,
        isSelected && styles.cardSelected,
        {
          borderLeftWidth: 3.5,
          borderLeftColor: catInfo.accentBorderColor,
        },
        isAlternative && !isExplorer && styles.cardAlternative,
        showAltNotice && styles.cardAlt,
      ]}
      onPress={() => onPress(train)}
      activeOpacity={0.88}
    >
      {/* ── Header: Train Name, Number Badge & Action Chevron ── */}
      <View style={styles.headerRow}>
        <View style={styles.nameBlock}>
          <Text style={styles.trainName} numberOfLines={1}>
            {train.name}
          </Text>
          <View style={[styles.numberBadge, isOddRow && styles.numberBadgeOdd]}>
            <Text style={styles.trainNumber}>{train.trainNumber}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#A89D96" />
      </View>

      {/* ── Badges Row: Category (Left) · Frequency / Running Days (Right) ── */}
      <View style={styles.badgesRow}>
        <View style={[styles.badgeCategory, { backgroundColor: catInfo.badgeBg }]}>
          <Ionicons
            name={catInfo.iconName}
            size={11}
            color={catInfo.badgeText}
            style={styles.badgeIcon}
          />
          <Text
            style={[styles.badgeCategoryText, { color: catInfo.badgeText }]}
            numberOfLines={1}
          >
            {catInfo.label}
          </Text>
        </View>
        <View
          style={[
            styles.badgeFrequency,
            {
              backgroundColor: freqInfo.bg,
              borderColor: freqInfo.borderColor,
            },
          ]}
        >
          <Ionicons
            name={freqInfo.iconName}
            size={11}
            color={freqInfo.text}
            style={styles.badgeIcon}
          />
          <Text
            style={[styles.badgeFrequencyText, { color: freqInfo.text }]}
            numberOfLines={1}
          >
            {freqInfo.label}
          </Text>
        </View>
      </View>

      {/* ── Journey & Timing Section: Departure (Left) · Duration Track (Center) · Arrival (Right) ── */}
      <View style={styles.journeySection}>
        {/* Departure Endpoint */}
        <View style={styles.timeEndpoint}>
          <Text style={styles.timeText}>{depTime}</Text>
          <Text style={styles.stationText} numberOfLines={1}>
            {fromName}
          </Text>
        </View>

        {/* Center Duration Track */}
        <View style={styles.durationCenter}>
          <Text style={styles.durationLabel}>{computedDur}</Text>
          <View style={styles.trackLineContainer}>
            <View style={[styles.trackLine, isOddRow && styles.trackLineOdd]} />
            <Ionicons name="arrow-forward" size={11} color="#9E3C1B" style={styles.trackArrow} />
          </View>
          {!isAlternative && goaStopsCount > 0 && !isExplorer && (
            <Text style={styles.goaStopsLabel}>{goaStopsCount} Goa stops</Text>
          )}
        </View>

        {/* Arrival Endpoint */}
        <View style={[styles.timeEndpoint, styles.timeEndpointRight]}>
          <Text style={styles.timeText}>
            {arrTime}
            {dayOffset > 0 && <Text style={styles.dayOffsetBadge}> +{dayOffset}</Text>}
          </Text>
          <Text style={[styles.stationText, styles.stationTextRight]} numberOfLines={1}>
            {toName}
          </Text>
        </View>
      </View>

      {/* ── Halt Banner (Sawantwadi / Ratnagiri specific station) ── */}
      {segment && segment.direction === 'Halt' && (
        <View style={styles.haltBanner}>
          <Ionicons name="pin" size={12} color="#9E3C1B" />
          <Text style={styles.haltBannerText} numberOfLines={1}>
            Halt at {segment.fromName}: Arr {segment.fromTime}
            {segment.toTime && segment.toTime !== segment.fromTime ? ` · Dep ${segment.toTime}` : ''}
          </Text>
        </View>
      )}

      {/* ── Alternative / Goa notices (explorer All-trains view) ── */}
      {showAltNotice && (
        <View style={styles.altNotice}>
          <Ionicons name="navigate-outline" size={11} color="#D97706" />
          <Text style={styles.altNoticeText} numberOfLines={1}>
            Terminates at Sawantwadi Road (38 km from North Goa)
          </Text>
        </View>
      )}
      {showGoaNotice && (
        <View style={styles.goaNotice}>
          <Ionicons name="checkmark-circle-outline" size={11} color="#2E7D32" />
          <Text style={styles.goaNoticeText} numberOfLines={1}>Direct Goa train with scheduled halts</Text>
        </View>
      )}

      {/* ── Journey-search: Alternative station explanation ── */}
      {!isExplorer && isAlternative && (
        <View style={styles.altExplanationBox}>
          <View style={styles.altBadgeRow}>
            <View style={styles.altBadge}>
              <Ionicons name="navigate-outline" size={11} color="#D97706" />
              <Text style={styles.altBadgeText}>Alternative station</Text>
            </View>
            {distanceLabel && (
              <Text style={styles.altDistanceText}>{distanceLabel}</Text>
            )}
          </View>
          <View style={styles.transitHintRow}>
            <Text style={styles.transitHint}>🚆 Train to {toName} · 🚌 {roadTravelTip ?? 'Road to Goa'}</Text>
          </View>
        </View>
      )}

      {/* ── Journey-search: Goa station pill ── */}
      {!isExplorer && !isAlternative && (
        <View style={styles.goaStationPillRow}>
          <View style={styles.goaStationPill}>
            <Ionicons name="location" size={11} color="#1E824C" />
            <Text style={styles.goaStationPillText}>{toName} · Goa station</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

TrainCard.displayName = 'TrainCard';

export default TrainCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardOdd: {
    backgroundColor: '#F5ECE3',
    borderColor: '#E7DDD1',
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

  // ── Header: Train Name & Number ──────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  nameBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  trainName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
    flexShrink: 1,
  },
  numberBadge: {
    backgroundColor: '#F5EFEA',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    marginLeft: 6,
    flexShrink: 0,
  },
  numberBadgeOdd: {
    backgroundColor: '#FFFFFF',
  },
  trainNumber: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7A6B63',
    letterSpacing: 0.2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexShrink: 0,
  },
  badgeCategoryText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  badgeFrequency: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 0,
  },
  badgeFrequencyText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // ── Journey & Timings Section ────────────────────────────────────────────
  journeySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeEndpoint: {
    flex: 1,
    maxWidth: '36%',
  },
  timeEndpointRight: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: -0.3,
  },
  dayOffsetBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  stationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7A6B63',
    marginTop: 2,
  },
  stationTextRight: {
    textAlign: 'right',
  },
  durationCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A7A70',
    marginBottom: 3,
  },
  trackLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  trackLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E8DED6',
  },
  trackLineOdd: {
    backgroundColor: '#DDCFBF',
  },
  trackArrow: {
    marginLeft: -4,
  },
  goaStopsLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#8A4A1C',
    marginTop: 3,
  },

  // ── Halt Banner ───────────────────────────────────────────────────────────
  haltBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF4F0',
    borderWidth: 1,
    borderColor: '#F2D7CD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
    marginTop: 6,
  },
  haltBannerText: {
    fontSize: 11,
    color: '#5C4E46',
    flex: 1,
  },
  haltBold: {
    fontWeight: '800',
    color: '#9E3C1B',
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

});
