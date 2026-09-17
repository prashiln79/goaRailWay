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
}

export const TrainCard: React.FC<TrainCardProps> = memo(({
  train,
  isSelected,
  onPress,
  selectedFrom,
  selectedTo,
}) => {
  // Find matching stops for timing
  const fromStop = train.stops.find(s => s.stationCode === selectedFrom) ?? train.stops[0];
  const toStop = train.stops.find(s => s.stationCode === selectedTo) ?? train.stops[train.stops.length - 1];

  const depTime = fromStop?.departureTime ?? '15:20';
  const arrTime = toStop?.arrivalTime ?? toStop?.departureTime ?? '03:20';

  const fromName = (selectedFrom && STATION_MAP[selectedFrom]?.name) || STATION_MAP[train.sourceStationCode]?.name || train.sourceStationCode;
  const toName = (selectedTo && STATION_MAP[selectedTo]?.name) || STATION_MAP[train.destinationStationCode]?.name || train.destinationStationCode;

  // Calculate Goa stops count
  const goaStopsCount = train.stops.filter(s =>
    ['PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'VSG', 'SVDEM', 'KULEM'].includes(s.stationCode),
  ).length;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
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

      {/* Main Route & Timings */}
      <View style={styles.timingSection}>
        {/* Departure */}
        <View style={styles.timeCol}>
          <Text style={styles.timeText}>{depTime}</Text>
          <Text style={styles.stationText} numberOfLines={1}>{fromName}</Text>
        </View>

        {/* Duration pill in middle */}
        <View style={styles.durationCol}>
          <Text style={styles.durationText}>7h 40m</Text>
          <View style={styles.durationLine}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <Ionicons name="arrow-forward" size={14} color="#C4B7AF" style={styles.arrowIcon} />
          </View>
        </View>

        {/* Arrival */}
        <View style={[styles.timeCol, styles.timeColRight]}>
          <Text style={styles.timeText}>{arrTime}</Text>
          <Text style={[styles.stationText, styles.stationTextRight]} numberOfLines={1}>{toName}</Text>
        </View>
      </View>

      {/* Badges Row */}
      <View style={styles.badgesRow}>
        <View style={styles.badgeGoa}>
          <Ionicons name="leaf-outline" size={12} color="#8A4A1C" />
          <Text style={styles.badgeGoaText}>{goaStopsCount > 0 ? `${goaStopsCount} Goa stops` : 'Direct to Goa'}</Text>
        </View>

        <View style={styles.badgeRuns}>
          <Ionicons name="checkmark-circle" size={13} color="#1E824C" />
          <Text style={styles.badgeRunsText}>Runs today</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  timingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  timeCol: {
    flex: 2,
  },
  timeColRight: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1613',
  },
  stationText: {
    fontSize: 13,
    color: '#7A6B63',
    fontWeight: '500',
    marginTop: 2,
  },
  stationTextRight: {
    textAlign: 'right',
  },
  durationCol: {
    flex: 1.8,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A7A71',
    marginBottom: 4,
  },
  durationLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C4B7AF',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DFD7D1',
  },
  arrowIcon: {
    marginLeft: -2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
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
