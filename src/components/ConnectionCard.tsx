import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionOption } from '../types/Connection';
import { STATION_MAP } from '../data/stations';

interface ConnectionCardProps {
  option: ConnectionOption;
  onPressDetails?: (trainNumber: string) => void;
  onViewJourney?: (option: ConnectionOption) => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  option,
  onPressDetails,
  onViewJourney,
}) => {
  const isDirect = option.type === 'direct';

  if (isDirect) {
    const seg = option.segments[0];
    const fromName = STATION_MAP[seg.fromStationCode]?.name ?? seg.fromStationCode;
    const toName = STATION_MAP[seg.toStationCode]?.name ?? seg.toStationCode;

    return (
      <View style={styles.card}>
        <View style={styles.tagRow}>
          <View style={styles.directBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#1E824C" />
            <Text style={styles.directBadgeText}>Direct Train</Text>
          </View>
        </View>

        <View style={styles.trainHeader}>
          <Text style={styles.trainNumber}>{seg.trainNumber}</Text>
          <Text style={styles.trainName}>{seg.trainName}</Text>
        </View>

        <Text style={styles.routeSubtitle}>
          {fromName} → {toName}
        </Text>

        <View style={styles.timingRow}>
          <Text style={styles.timeBold}>{seg.departureTime}</Text>
          <Text style={styles.arrowIcon}>─────────</Text>
          <Text style={styles.timeBold}>{seg.arrivalTime}</Text>
        </View>

        <View style={styles.subInfoRow}>
          <Text style={styles.durationPill}>{seg.duration}</Text>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.stopsText}>5 Goa stops</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewJourneyBtn}
            onPress={() => onPressDetails && onPressDetails(seg.trainNumber)}
          >
            <Text style={styles.viewJourneyText}>View journey</Text>
            <Ionicons name="chevron-forward" size={15} color="#9E3C1B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Connecting Journey option
  const seg1 = option.segments[0];
  const seg2 = option.segments[1];
  const viaStationName = (option.connectionStationCode && STATION_MAP[option.connectionStationCode]?.name) || option.connectionStationCode || 'Transfer Station';

  return (
    <View style={[styles.card, styles.connectingCard]}>
      {/* Header: 💡 Connection option */}
      <View style={styles.tagRow}>
        <View style={styles.connectionHeaderBadge}>
          <Ionicons name="bulb" size={14} color="#D97706" />
          <Text style={styles.connectionHeaderText}>Connection option</Text>
        </View>
        <View style={styles.trainsCountPill}>
          <Text style={styles.trainsCountPillText}>2 trains</Text>
        </View>
      </View>

      {/* Train 1 Segment */}
      <View style={styles.segmentBlock}>
        <Text style={styles.segmentRouteText}>
          {STATION_MAP[seg1.fromStationCode]?.name ?? seg1.fromStationCode} → {STATION_MAP[seg1.toStationCode]?.name ?? seg1.toStationCode}
        </Text>
        <View style={styles.trainRow}>
          <Text style={styles.segTrainTitle}>
            {seg1.trainNumber} {seg1.trainName}
          </Text>
          <Text style={styles.segTimingsText}>
            {seg1.departureTime} → {seg1.arrivalTime}
          </Text>
        </View>
      </View>

      {/* Connection Layover Badge in between */}
      <View style={styles.transferSection}>
        <View style={styles.transferLine} />
        <View style={styles.transferBubble}>
          <Ionicons name="time-outline" size={13} color="#8A4A1C" />
          <Text style={styles.transferTimeText}>{option.connectionTime ?? '1h 15m'}</Text>
          <Text style={styles.transferStationText}>at {viaStationName}</Text>
        </View>
        <View style={styles.transferLine} />
      </View>

      {/* Train 2 Segment */}
      <View style={styles.segmentBlock}>
        <Text style={styles.segmentRouteText}>
          {STATION_MAP[seg2.fromStationCode]?.name ?? seg2.fromStationCode} → {STATION_MAP[seg2.toStationCode]?.name ?? seg2.toStationCode}
        </Text>
        <View style={styles.trainRow}>
          <Text style={styles.segTrainTitle}>
            {seg2.trainNumber} {seg2.trainName}
          </Text>
          <Text style={styles.segTimingsText}>
            {seg2.departureTime} → {seg2.arrivalTime}
          </Text>
        </View>
      </View>

      {/* Total duration footer */}
      <View style={styles.footerRow}>
        <View style={styles.durationInfo}>
          <Text style={styles.totalDurationText}>{option.totalDuration} total</Text>
          <Text style={styles.totalTrainsText}>• 2 trains</Text>
        </View>

        <TouchableOpacity
          style={styles.viewJourneyBtn}
          onPress={() => onViewJourney && onViewJourney(option)}
          activeOpacity={0.85}
        >
          <Text style={styles.viewJourneyText}>View journey</Text>
          <Ionicons name="chevron-forward" size={15} color="#9E3C1B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConnectionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  connectingCard: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#D97706',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  directBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  directBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E824C',
  },

  connectionHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
    gap: 5,
  },
  connectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  trainsCountPill: {
    backgroundColor: '#F3EFEA',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  trainsCountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6B63',
  },
  trainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  trainNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C201A',
  },
  trainName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#382A22',
  },
  routeSubtitle: {
    fontSize: 13,
    color: '#7A6B63',
    fontWeight: '500',
    marginBottom: 8,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  timeBold: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1613',
  },
  arrowIcon: {
    fontSize: 14,
    color: '#D5C9C0',
    fontWeight: '800',
    letterSpacing: -1,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    gap: 6,
  },
  durationPill: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A7A71',
  },
  bulletDot: {
    color: '#C4B7AF',
  },
  stopsText: {
    fontSize: 12,
    color: '#7A6B63',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F6F2EE',
    paddingTop: 10,
    marginTop: 6,
  },
  segmentBlock: {
    backgroundColor: '#FAF7F5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  segmentRouteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A4A1C',
    marginBottom: 4,
  },
  trainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segTrainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
    flex: 1,
  },
  segTimingsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C201A',
  },
  transferSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 8,
  },
  transferLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EFE7E1',
  },
  transferBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F2',
    borderWidth: 1,
    borderColor: '#F2DFD5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 8,
    gap: 4,
  },
  transferTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A4A1C',
  },
  transferStationText: {
    fontSize: 11,
    color: '#7A6B63',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F6F2EE',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalDurationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C201A',
  },
  totalTrainsText: {
    fontSize: 12,
    color: '#8A7A71',
  },
  viewJourneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7EEE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 2,
  },
  viewJourneyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A4A1C',
  },
});
