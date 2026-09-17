import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionOption } from '../types/Connection';
import { STATION_MAP } from '../data/stations';

interface ConnectionCardProps {
  option: ConnectionOption;
  onPressDetails?: (trainNumber: string) => void;
  onCheckAvailability?: (option: ConnectionOption) => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  option,
  onPressDetails,
  onCheckAvailability,
}) => {
  const isDirect = option.type === 'direct';

  if (isDirect) {
    const seg = option.segments[0];
    const fromName = STATION_MAP[seg.fromStationCode]?.name ?? seg.fromStationCode;
    const toName = STATION_MAP[seg.toStationCode]?.name ?? seg.toStationCode;

    return (
      <View style={styles.card}>
        {/* Direct Tag Header */}
        <View style={styles.tagRow}>
          <View style={styles.directBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#1E824C" />
            <Text style={styles.directBadgeText}>Direct Journey</Text>
          </View>
          <View style={styles.availBadge}>
            <Text style={styles.availBadgeText}>Likely available</Text>
          </View>
        </View>

        {/* Train Info */}
        <View style={styles.trainHeader}>
          <Text style={styles.trainNumber}>{seg.trainNumber}</Text>
          <Text style={styles.trainName}>{seg.trainName}</Text>
        </View>

        <View style={styles.timingRow}>
          <Text style={styles.timeBold}>{seg.departureTime}</Text>
          <Text style={styles.stationSub}>{fromName}</Text>
          <Text style={styles.arrowIcon}> → </Text>
          <Text style={styles.timeBold}>{seg.arrivalTime}</Text>
          <Text style={styles.stationSub}>{toName}</Text>
        </View>

        <View style={styles.subInfoRow}>
          <Text style={styles.durationPill}>{seg.duration}</Text>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.stopsText}>5 Goa stops</Text>
        </View>

        {/* Bottom tags & Action */}
        <View style={styles.actionRow}>
          <View style={styles.miniTag}>
            <Ionicons name="git-commit-outline" size={13} color="#2563EB" />
            <Text style={styles.miniTagText}>Direct</Text>
          </View>
          <View style={styles.miniTagGreen}>
            <Ionicons name="checkmark" size={13} color="#1E824C" />
            <Text style={styles.miniTagTextGreen}>Runs today</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => onPressDetails && onPressDetails(seg.trainNumber)}
          >
            <Text style={styles.viewBtnText}>View details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Connecting Journey
  const seg1 = option.segments[0];
  const seg2 = option.segments[1];
  const viaStationName = (option.connectionStationCode && STATION_MAP[option.connectionStationCode]?.name) || option.connectionStationCode || 'Junction';

  return (
    <View style={[styles.card, styles.connectingCard]}>
      {/* Header Badge */}
      <View style={styles.tagRow}>
        <View style={styles.starBadge}>
          <Ionicons name="star" size={13} color="#D97706" />
          <Text style={styles.starBadgeText}>{option.tag ?? 'Better Connection Option'}</Text>
        </View>
      </View>

      <Text style={styles.tagSubtext}>Often better chances in Tatkal when direct is full</Text>

      {/* Segment 1 */}
      <View style={styles.segmentContainer}>
        <View style={styles.stepCircle}>
          <Text style={styles.stepNum}>1</Text>
        </View>
        <View style={styles.segmentDetails}>
          <Text style={styles.segTrainTitle}>
            {seg1.trainNumber} {seg1.trainName}
          </Text>
          <Text style={styles.segTiming}>
            {seg1.departureTime} {STATION_MAP[seg1.fromStationCode]?.name ?? seg1.fromStationCode} → {seg1.arrivalTime} {STATION_MAP[seg1.toStationCode]?.name ?? seg1.toStationCode}
          </Text>
        </View>
      </View>

      {/* Connection Buffer */}
      <View style={styles.layoverRow}>
        <View style={styles.layoverDottedLine} />
        <View style={styles.layoverBadge}>
          <Ionicons name="time-outline" size={13} color="#8A4A1C" />
          <Text style={styles.layoverText}>{option.connectionTime ?? '1h 15m'} connection at {viaStationName}</Text>
        </View>
        <Text style={styles.bufferHint}>Enough time to change platform</Text>
      </View>

      {/* Segment 2 */}
      <View style={styles.segmentContainer}>
        <View style={[styles.stepCircle, styles.stepCircle2]}>
          <Text style={styles.stepNum}>2</Text>
        </View>
        <View style={styles.segmentDetails}>
          <Text style={styles.segTrainTitle}>
            {seg2.trainNumber} {seg2.trainName}
          </Text>
          <Text style={styles.segTiming}>
            {seg2.departureTime} {STATION_MAP[seg2.fromStationCode]?.name ?? seg2.fromStationCode} → {seg2.arrivalTime} {STATION_MAP[seg2.toStationCode]?.name ?? seg2.toStationCode}
          </Text>
        </View>
      </View>

      {/* Total Duration Footer */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total journey: <Text style={styles.totalValue}>{option.totalDuration}</Text></Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.checkBothBtn}
        onPress={() => onCheckAvailability && onCheckAvailability(option)}
        activeOpacity={0.85}
      >
        <Text style={styles.checkBothBtnText}>Check availability for both trains</Text>
      </TouchableOpacity>
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
    borderLeftWidth: 3,
    borderLeftColor: '#E67E22',
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
  availBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  availBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  trainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
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
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  timeBold: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1613',
  },
  stationSub: {
    fontSize: 13,
    color: '#7A6B63',
    marginLeft: 4,
  },
  arrowIcon: {
    fontSize: 14,
    color: '#A0938C',
    marginHorizontal: 8,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
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
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F6F2EE',
    paddingTop: 10,
  },
  miniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  miniTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  miniTagGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EE',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  miniTagTextGreen: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E824C',
  },
  viewBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#F7F3F0',
    borderRadius: 6,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A4321',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  starBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  tagSubtext: {
    fontSize: 12,
    color: '#7A6B63',
    marginBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 4,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#9E3C1B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle2: {
    backgroundColor: '#D97706',
  },
  stepNum: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  segmentDetails: {
    flex: 1,
  },
  segTrainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
  },
  segTiming: {
    fontSize: 13,
    color: '#7A6B63',
    marginTop: 2,
  },
  layoverRow: {
    paddingLeft: 32,
    marginVertical: 6,
  },
  layoverDottedLine: {
    width: 1,
    height: 8,
    backgroundColor: '#D5C9C0',
    marginBottom: 4,
  },
  layoverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  layoverText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A4A1C',
  },
  bufferHint: {
    fontSize: 11,
    color: '#8A7A71',
    marginTop: 1,
  },
  totalRow: {
    marginTop: 10,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F6F2EE',
  },
  totalLabel: {
    fontSize: 13,
    color: '#7A6B63',
  },
  totalValue: {
    fontWeight: '700',
    color: '#2C201A',
  },
  checkBothBtn: {
    backgroundColor: '#F7EEE7',
    borderWidth: 1,
    borderColor: '#E8D5C8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBothBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A4A1C',
  },
});
