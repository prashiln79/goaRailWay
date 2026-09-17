import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AvailabilityItem } from '../types/Connection';

interface AvailabilityTableProps {
  items: AvailabilityItem[];
}

export const AvailabilityTable: React.FC<AvailabilityTableProps> = ({ items }) => {
  const getStatusColor = (summary: string) => {
    switch (summary) {
      case 'High demand':
        return { bg: '#FDF0EE', text: '#C0392B' };
      case 'Good chance':
      case 'Available':
        return { bg: '#EBF7EE', text: '#1E824C' };
      case 'Try Tatkal':
        return { bg: '#FFF7ED', text: '#D97706' };
      default:
        return { bg: '#F3EFEA', text: '#6B7280' };
    }
  };

  const getBadgeStyle = (status: string) => {
    if (status.includes('WL')) {
      return { bg: '#FDF0EE', text: '#D9381E' };
    }
    if (status === 'Available') {
      return { bg: '#EBF7EE', text: '#1E824C' };
    }
    if (status.includes('RAC')) {
      return { bg: '#FEF3C7', text: '#B45309' };
    }
    return { bg: '#F3F4F6', text: '#374151' };
  };

  return (
    <View style={styles.tableCard}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.classCol]}>Class</Text>
        <Text style={[styles.headerCell, styles.genCol]}>General</Text>
        <Text style={[styles.headerCell, styles.tatkalCol]}>Tatkal</Text>
        <Text style={[styles.headerCell, styles.statusCol]}>Status</Text>
      </View>

      {/* Rows */}
      {items.map((row, idx) => {
        const statusColors = getStatusColor(row.statusSummary);
        const genColors = getBadgeStyle(row.generalStatus);
        const tatColors = getBadgeStyle(row.tatkalStatus);
        const isLast = idx === items.length - 1;

        return (
          <View
            key={row.trainClass}
            style={[styles.dataRow, isLast && styles.dataRowLast]}
          >
            {/* Class */}
            <View style={styles.classCol}>
              <Text style={styles.classText}>{row.trainClass}</Text>
            </View>

            {/* General */}
            <View style={styles.genCol}>
              <View style={[styles.cellBadge, { backgroundColor: genColors.bg }]}>
                <Text style={[styles.cellBadgeText, { color: genColors.text }]}>
                  {row.generalStatus}
                </Text>
              </View>
            </View>

            {/* Tatkal */}
            <View style={styles.tatkalCol}>
              <View style={[styles.cellBadge, { backgroundColor: tatColors.bg }]}>
                <Text style={[styles.cellBadgeText, { color: tatColors.text }]}>
                  {row.tatkalStatus}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.statusCol}>
              <Text style={[styles.statusSummaryText, { color: statusColors.text }]}>
                {row.statusSummary}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default AvailabilityTable;

const styles = StyleSheet.create({
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    overflow: 'hidden',
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE6',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A7A71',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  classCol: {
    flex: 1.2,
  },
  genCol: {
    flex: 2,
    alignItems: 'center',
  },
  tatkalCol: {
    flex: 2,
    alignItems: 'center',
  },
  statusCol: {
    flex: 2.3,
    alignItems: 'flex-end',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F2EE',
  },
  dataRowLast: {
    borderBottomWidth: 0,
  },
  classText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C201A',
  },
  cellBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 58,
    alignItems: 'center',
  },
  cellBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
});
