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

interface TrainCardProps {
  train: Train;
  isSelected?: boolean;
  onPress: (train: Train) => void;
  selectedFrom?: string;
  selectedTo?: string;
  // Destination metadata: Goa station vs Alternative station
  destinationType?: 'GOA' | 'NEARBY';
  distanceLabel?: string;     // e.g. "38 km from North Goa" or "60 km from Thivim"
  alternativeFor?: string;    // e.g. "Alternative for North Goa"
  roadTravelTip?: string;     // e.g. "Continue to North Goa by road"
  computedDuration?: string;
}

export const TrainCard: React.FC<TrainCardProps> = memo(({
  train,
  isSelected,
  onPress,
  selectedFrom,
  selectedTo,
  destinationType = 'GOA',
  distanceLabel,
  alternativeFor,
  roadTravelTip,
  computedDuration,
}) => {
  // Find matching stops for timing
  const fromStop = train.stops.find(s => s.stationCode === selectedFrom) ?? train.stops[0];
  const toStop = train.stops.find(s => s.stationCode === selectedTo) ?? train.stops[train.stops.length - 1];

  const depTime = fromStop?.departureTime ?? '15:20';
  const arrTime = toStop?.arrivalTime ?? toStop?.departureTime ?? '03:20';
  const dayOffset = (toStop?.dayOffset ?? 0) - (fromStop?.dayOffset ?? 0);

  const fromName = (selectedFrom && STATION_MAP[selectedFrom]?.name) || STATION_MAP[train.sourceStationCode]?.name || train.sourceStationCode;
  const toName = (selectedTo && STATION_MAP[selectedTo]?.name) || STATION_MAP[train.destinationStationCode]?.name || train.destinationStationCode;

  // Calculate Goa stops count
  const goaStopsCount = train.stops.filter(s =>
    ['PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'VSG', 'SVDEM', 'KULEM'].includes(s.stationCode),
  ).length;

  // Running days text formatting
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getRunsText = () => {
    if (train.runningDays.length === 7) {
      return 'Runs daily';
    }
    if (train.runningDays.length === 6 && !train.runningDays.includes(0)) {
      return 'Mon – Sat';
    }
    if (train.runningDays.length <= 3) {
      return train.runningDays.map(d => DAY_NAMES[d]).join(', ');
    }
    return `${train.runningDays.length} days/week`;
  };

  const runsText = getRunsText();

  // Journey Type determination: ☀️ Day, 🌙 Night, Day → Night, Night → Day
  const getJourneyType = () => {
    const depHour = parseInt(depTime.split(':')[0] || '12', 10);
    const arrHour = parseInt(arrTime.split(':')[0] || '12', 10);

    const isDepDay = depHour >= 6 && depHour < 18;
    const isArrDay = arrHour >= 6 && arrHour < 18;

    if (isDepDay && isArrDay) {
      return { label: '☀️ Day', bg: '#FEF3C7', text: '#92400E' };
    }
    if (!isDepDay && !isArrDay) {
      return { label: '🌙 Night', bg: '#EDE9FE', text: '#5B21B6' };
    }
    if (isDepDay && !isArrDay) {
      return { label: 'Day → Night', bg: '#FFEDD5', text: '#9A3412' };
    }
    return { label: 'Night → Day', bg: '#E0F2FE', text: '#0369A1' };
  };

  const journeyType = getJourneyType();

  const isAlternative = destinationType === 'NEARBY';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isAlternative && styles.cardAlternative,
      ]}
      onPress={() => onPress(train)}
      activeOpacity={0.88}
    >
      {/* Top Header: Train Number, Name and Chevron */}
      <View style={styles.headerRow}>
        <View style={styles.numberAndName}>
          <Text style={styles.trainNumber}>{train.trainNumber}</Text>
          <Text style={styles.trainName} numberOfLines={1}>{train.name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#A89D96" />
      </View>

      {/* Route and Journey Type row */}
      <View style={styles.routeAndTypeRow}>
        <Text style={styles.routeSubtitle} numberOfLines={1}>
          {fromName} → {toName}
        </Text>
        <View style={[styles.badgeJourneyType, { backgroundColor: journeyType.bg }]}>
          <Text style={[styles.badgeJourneyTypeText, { color: journeyType.text }]}>
            {journeyType.label}
          </Text>
        </View>
      </View>

      {/* Main Timings & Duration Row */}
      <View style={styles.timingSection}>
        <Text style={styles.timeText}>{depTime}</Text>
        <View style={styles.durationTrack}>
          <View style={styles.trackLine} />
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{computedDuration ?? '12h 00m'}</Text>
          </View>
        </View>
        <View style={styles.arrCol}>
          <Text style={styles.timeText}>
            {arrTime}
            {dayOffset > 0 && <Text style={styles.dayOffsetSub}> +{dayOffset}</Text>}
          </Text>
        </View>
      </View>

      {/* Alternative station explanation banner */}
      {isAlternative ? (
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
      ) : (
        <View style={styles.goaStationPillRow}>
          <View style={styles.goaStationPill}>
            <Ionicons name="location" size={12} color="#1E824C" />
            <Text style={styles.goaStationPillText}>{toName} · Goa station</Text>
          </View>
        </View>
      )}

      {/* Bottom Features / Badges Row */}
      <View style={styles.badgesRow}>
        {!isAlternative && goaStopsCount > 0 && (
          <View style={styles.badgeGoa}>
            <Ionicons name="leaf-outline" size={12} color="#8A4A1C" />
            <Text style={styles.badgeGoaText}>{goaStopsCount} Goa stops</Text>
          </View>
        )}

        <View style={styles.badgeRuns}>
          <Ionicons name="calendar-outline" size={12} color="#1E824C" />
          <Text style={styles.badgeRunsText}>{runsText}</Text>
        </View>

        <View style={styles.badgeTatkal}>
          <Ionicons name="ticket-outline" size={12} color="#C0392B" />
          <Text style={styles.badgeTatkalText}>Tatkal</Text>
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
    marginHorizontal: 16,
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
    borderLeftColor: '#D97706', // Warm amber indicator for alternative stations
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
    marginBottom: 12,
    gap: 8,
  },
  routeSubtitle: {
    fontSize: 13,
    color: '#7A6B63',
    fontWeight: '600',
    flex: 1,
  },
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
  badgeJourneyType: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  badgeJourneyTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },
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
  badgeTatkal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEEEE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  badgeTatkalText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C0392B',
  },
});
