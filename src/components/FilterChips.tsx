import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrainFilter } from '../store/trainStore';

interface FilterChipsProps {
  activeFilter: TrainFilter;
  onFilterChange: (filter: TrainFilter) => void;
}

const CHIPS: { label: string; value: TrainFilter; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'All Trains', value: 'all', icon: 'train-outline' },
  { label: 'To Goa', value: 'to-goa', icon: 'navigate-outline' },
  { label: 'From Mumbai', value: 'from-mumbai', icon: 'arrow-forward-outline' },
  { label: 'Goa Stations', value: 'goa-stations', icon: 'location-outline' },
];

const FilterChips: React.FC<FilterChipsProps> = memo(({ activeFilter, onFilterChange }) => {
  return (
    <View style={styles.container}>
      {CHIPS.map(chip => {
        const isActive = activeFilter === chip.value;
        return (
          <TouchableOpacity
            key={chip.value}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange(chip.value)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={chip.icon}
              size={13}
              color={isActive ? '#FFFFFF' : '#1A73E8'}
              style={styles.chipIcon}
            />
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

FilterChips.displayName = 'FilterChips';

export default FilterChips;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1A73E8',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A73E8',
    letterSpacing: 0.2,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
