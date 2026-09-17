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
import { STATIONS } from '../data/stations';

interface SearchStationModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelectStation: (station: Station) => void;
}

export const SearchStationModal: React.FC<SearchStationModalProps> = ({
  visible,
  title,
  onClose,
  onSelectStation,
}) => {
  const [query, setQuery] = useState('');

  const filteredStations = STATIONS.filter(s => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q)
    );
  });

  const popularStations = STATIONS.filter(s =>
    ['LTT', 'CSMT', 'PNVL', 'RN', 'KKW', 'SWV', 'THVM', 'KRMI', 'MAO'].includes(s.code),
  );

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
              placeholder="Search station or code (e.g. THVM, LTT)"
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
              <Text style={styles.sectionTitle}>Popular Stations</Text>
              <View style={styles.chipsRow}>
                {popularStations.map(station => (
                  <TouchableOpacity
                    key={station.code}
                    style={styles.stationChip}
                    onPress={() => {
                      onSelectStation(station);
                      onClose();
                    }}
                  >
                    <Text style={styles.stationChipText}>{station.name}</Text>
                    <Text style={styles.stationChipCode}>{station.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Station list */}
          <FlatList
            data={filteredStations}
            keyExtractor={item => item.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stationItem}
                onPress={() => {
                  onSelectStation(item);
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
    height: '80%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
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
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#2C201A',
  },
  quickSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
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
  stationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A4A1C',
  },
  stationChipCode: {
    fontSize: 11,
    color: '#B66838',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE8',
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C201A',
  },
  stationSubtitle: {
    fontSize: 13,
    color: '#8A7A71',
    marginTop: 2,
  },
  codeBadge: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#554238',
    letterSpacing: 0.5,
  },
});
