import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Station } from '../types/Station';
import { StationOption } from '../types/JourneyResult';
import { stationService } from '../services/stationService';

interface SearchStationModalProps {
  visible: boolean;
  title: string;
  isDestination?: boolean;
  onClose: () => void;
  onSelectStation: (station: StationOption) => void;
}

export const AREA_DESTINATIONS: StationOption[] = [
  {
    code: 'GOA_NORTH',
    name: 'North Goa',
    state: 'Goa',
    isArea: true,
    areaType: 'GOA_NORTH',
    subtitle: 'Includes Thivim & nearby (Sawantwadi, Kudal, Kankavli, Belagavi)',
  },
  {
    code: 'GOA_SOUTH',
    name: 'South Goa',
    state: 'Goa',
    isArea: true,
    areaType: 'GOA_SOUTH',
    subtitle: 'Includes Madgaon, Canacona, Vasco & nearby (Karwar)',
  },
  {
    code: 'GOA_ALL',
    name: 'All Goa & Alternatives',
    state: 'Goa',
    isArea: true,
    areaType: 'GOA_ALL',
    subtitle: 'Considers all Goa terminals and nearby corridor alternatives',
  },
];

export const SearchStationModal: React.FC<SearchStationModalProps> = ({
  visible,
  title,
  isDestination = false,
  onClose,
  onSelectStation,
}) => {
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);

  React.useEffect(() => {
    if (visible) {
      stationService.getAllStations().then(setStations);
    }
  }, [visible]);

  const q = query.toLowerCase().trim();

  // Filter regular stations
  const filteredStations = stations.filter(s => {
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q)
    );
  });

  // Filter area destinations
  const filteredAreas = isDestination
    ? AREA_DESTINATIONS.filter(a => {
        if (!q) return true;
        return (
          a.name.toLowerCase().includes(q) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(q))
        );
      })
    : [];

  const popularStations: StationOption[] = isDestination
    ? [
        AREA_DESTINATIONS[0], // North Goa
        AREA_DESTINATIONS[1], // South Goa
        { code: 'THVM', name: 'Thivim', state: 'Goa' },
        { code: 'MAO', name: 'Madgaon', state: 'Goa' },
        { code: 'SWV', name: 'Sawantwadi Road', state: 'Maharashtra' },
        { code: 'KUDL', name: 'Kudal', state: 'Maharashtra' },
      ]
    : [
        { code: 'LTT', name: 'Mumbai LTT', state: 'Maharashtra' },
        { code: 'CSMT', name: 'Mumbai CSMT', state: 'Maharashtra' },
        { code: 'PNVL', name: 'Panvel', state: 'Maharashtra' },
        { code: 'RN', name: 'Ratnagiri', state: 'Maharashtra' },
      ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Search input */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#8A7A71" />
            <TextInput
              style={styles.input}
              placeholder={isDestination ? "Search region (North Goa) or station (Thivim, SWV)" : "Search origin station or code (e.g. LTT, CSMT)"}
              placeholderTextColor="#A0938C"
              value={query}
              onChangeText={setQuery}
              autoFocus
              clearButtonMode="while-editing"
            />
          </View>

          {/* Quick chips if no query */}
          {!query && (
            <View style={styles.quickSection}>
              <Text style={styles.sectionTitle}>{isDestination ? 'Recommended Regions & Stations' : 'Popular Origin Stations'}</Text>
              <View style={styles.chipsRow}>
                {popularStations.map(station => (
                  <TouchableOpacity
                    key={station.code}
                    style={[styles.stationChip, station.isArea && styles.areaChip]}
                    onPress={() => {
                      onSelectStation(station);
                      onClose();
                    }}
                  >
                    {station.isArea && <Ionicons name="sparkles" size={12} color="#9E3C1B" style={{ marginRight: 2 }} />}
                    <Text style={[styles.stationChipText, station.isArea && styles.areaChipText]}>{station.name}</Text>
                    {!station.isArea && <Text style={styles.stationChipCode}>{station.code}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* List: Areas first (if destination), then stations */}
          <FlatList
            data={filteredStations}
            keyExtractor={item => item.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              filteredAreas.length > 0 ? (
                <View style={styles.areaSection}>
                  <Text style={styles.areaSectionTitle}>GOA REGIONS (INCLUDES NEARBY ALTERNATIVES)</Text>
                  {filteredAreas.map(area => (
                    <TouchableOpacity
                      key={area.code}
                      style={styles.areaItem}
                      onPress={() => {
                        onSelectStation(area);
                        onClose();
                      }}
                    >
                      <View style={styles.areaIconBox}>
                        <Ionicons name="navigate-circle" size={24} color="#9E3C1B" />
                      </View>
                      <View style={styles.areaDetails}>
                        <Text style={styles.areaName}>{area.name}</Text>
                        <Text style={styles.areaSubtitle}>{area.subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <Text style={[styles.areaSectionTitle, { marginTop: 14 }]}>SPECIFIC STATIONS</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stationItem}
                onPress={() => {
                  onSelectStation({
                    code: item.code,
                    name: item.name,
                    state: item.state,
                    isArea: false,
                  });
                  onClose();
                }}
              >
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{item.name}</Text>
                  <Text style={styles.stationSubtitle}>{item.state} · {item.zone ?? 'KR'}</Text>
                </View>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{item.code}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SearchStationModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '82%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C201A',
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F3F0',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2C201A',
  },
  quickSection: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A7A71',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F2',
    borderWidth: 1,
    borderColor: '#F2D8C9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  areaChip: {
    backgroundColor: '#FFF1EC',
    borderColor: '#E8B9A6',
  },
  stationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A4A1C',
  },
  areaChipText: {
    fontWeight: '800',
    color: '#9E3C1B',
  },
  stationChipCode: {
    fontSize: 11,
    color: '#B66838',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  areaSection: {
    marginBottom: 6,
  },
  areaSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9E3C1B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F5',
    borderWidth: 1,
    borderColor: '#F6DEC6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  areaIconBox: {
    marginRight: 12,
  },
  areaDetails: {
    flex: 1,
  },
  areaName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C201A',
  },
  areaSubtitle: {
    fontSize: 12,
    color: '#7A6B63',
    marginTop: 2,
    lineHeight: 16,
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE8',
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C201A',
  },
  stationSubtitle: {
    fontSize: 12,
    color: '#8A7A71',
    marginTop: 2,
  },
  codeBadge: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#554238',
    letterSpacing: 0.5,
  },
});
