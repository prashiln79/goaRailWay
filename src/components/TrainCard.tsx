import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Train } from '../types/Train';
import { STATION_MAP } from '../data/stations';

interface TrainCardProps {
  train: Train;
  isSelected: boolean;
  onPress: (train: Train) => void;
}

const TRAIN_TYPE_COLORS: Record<string, string> = {
  Rajdhani: '#C62828',
  VandeBharat: '#0D47A1',
  Tejas: '#6A1B9A',
  Express: '#1565C0',
  Mail: '#E65100',
  Passenger: '#2E7D32',
  DEMU: '#2E7D32',
};

const TRAIN_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Rajdhani: 'flash',
  VandeBharat: 'flash',
  Tejas: 'flash',
  Express: 'train',
  Mail: 'train',
  Passenger: 'train',
  DEMU: 'train',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getTrainTypeColor(type: string): string {
  return TRAIN_TYPE_COLORS[type] ?? '#1565C0';
}

const TrainCard: React.FC<TrainCardProps> = memo(({ train, isSelected, onPress }) => {
  const color = getTrainTypeColor(train.type);
  const srcStation = STATION_MAP[train.sourceStationCode];
  const dstStation = STATION_MAP[train.destinationStationCode];
  const icon = TRAIN_TYPE_ICONS[train.type] ?? 'train';

  const runDays = train.runningDays
    .map(d => DAYS[d])
    .join(' ');

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onPress(train)}
      activeOpacity={0.85}
    >
      {/* Left color bar */}
      <View style={[styles.colorBar, { backgroundColor: color }]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.typeBadge, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={11} color={color} />
            <Text style={[styles.typeBadgeText, { color }]}>{train.type}</Text>
          </View>
          <Text style={styles.trainNumber}>#{train.trainNumber}</Text>
        </View>

        {/* Train name */}
        <Text style={styles.trainName} numberOfLines={1}>
          {train.name}
        </Text>

        {/* Route */}
        <View style={styles.routeRow}>
          <Ionicons name="location-outline" size={12} color="#6B7280" />
          <Text style={styles.routeText} numberOfLines={1}>
            {srcStation?.name ?? train.sourceStationCode}
            <Text style={styles.routeArrow}> → </Text>
            {dstStation?.name ?? train.destinationStationCode}
          </Text>
        </View>

        {/* Running days */}
        <Text style={styles.days}>{runDays}</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={styles.chevron} />
    </TouchableOpacity>
  );
});

TrainCard.displayName = 'TrainCard';

export default TrainCard;

const styles = StyleSheet.create({
  card: {
    width: 220,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardSelected: {
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#1A73E8',
  },
  colorBar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  trainNumber: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  trainName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.1,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  routeText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  routeArrow: {
    color: '#9CA3AF',
  },
  days: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  chevron: {
    alignSelf: 'center',
    marginRight: 8,
  },
});
