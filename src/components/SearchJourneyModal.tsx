import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Train } from '../types/Train';
import { Station } from '../types/Station';
import { TRAINS } from '../data/trains';
import { STATIONS, STATION_MAP } from '../data/stations';
import { KONKAN_SEARCH_DESTINATIONS, SearchDestination } from '../data/searchDestinations';
import { getTrainTypeColor } from './TrainCard';

interface SearchJourneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTrain: (train: Train) => void;
  onSelectStation: (stationCode: string) => void;
  onPlanRoute?: (fromCode: string, toCode: string) => void;
}

type SearchMode = 'instant' | 'route';

interface TrainResultItem {
  kind: 'train';
  train: Train;
}

interface StationResultItem {
  kind: 'station';
  station: Station;
}

interface DestinationResultItem {
  kind: 'destination';
  destination: SearchDestination;
}

type UnifiedResultItem = TrainResultItem | StationResultItem | DestinationResultItem;

const QUICK_SUGGESTIONS = [
  'Matsyagandha',
  'Mandovi',
  'Jan Shatabdi',
  'Vande Bharat',
  'Thivim',
  'Madgaon',
  'Sawantwadi Road',
  'Kudal',
  'North Goa',
  'South Goa',
];

export const SearchJourneyModal: React.FC<SearchJourneyModalProps> = ({
  visible,
  onClose,
  onSelectTrain,
  onSelectStation,
}) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('instant');

  // Route mode state
  const [routeFrom, setRouteFrom] = useState('CSMT');
  const [routeTo, setRouteTo] = useState('THVM');

  // Filtered results for instant mode
  const instantResults = useMemo<UnifiedResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: UnifiedResultItem[] = [];

    // 1. Match trains (by number or name)
    const matchingTrains = TRAINS.filter(
      t =>
        t.trainNumber.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.sourceStationCode.toLowerCase().includes(q) ||
        t.destinationStationCode.toLowerCase().includes(q),
    );
    matchingTrains.forEach(t => items.push({ kind: 'train', train: t }));

    // 2. Match stations (by code, name, state, zone)
    const matchingStations = STATIONS.filter(
      s =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        (s.zone && s.zone.toLowerCase().includes(q)),
    );
    matchingStations.forEach(s => items.push({ kind: 'station', station: s }));

    // 3. Match destinations (e.g. North Goa, South Goa, Sawantwadi)
    const matchingDests = KONKAN_SEARCH_DESTINATIONS.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q),
    );
    matchingDests.forEach(d => {
      // Don't duplicate if already in stations
      if (!matchingStations.some(s => s.code === d.code)) {
        items.push({ kind: 'destination', destination: d });
      }
    });

    return items;
  }, [query]);

  // Route mode trains
  const routeTrains = useMemo<Train[]>(() => {
    if (mode !== 'route') return [];
    const MUMBAI_CODES = new Set(['CSMT', 'LTT', 'DR', 'PNVL', 'BCT', 'BDTS', 'DIV']);
    const isFromMumbai = MUMBAI_CODES.has(routeFrom);

    return TRAINS.filter(train => {
      let fromIdx = train.stops.findIndex(s => s.stationCode === routeFrom);
      if (fromIdx < 0 && isFromMumbai) {
        fromIdx = train.stops.findIndex(s => MUMBAI_CODES.has(s.stationCode));
      }
      if (fromIdx < 0) return false;

      const toIdx = train.stops.findIndex((s, i) => i > fromIdx && s.stationCode === routeTo);
      return toIdx > fromIdx;
    });
  }, [mode, routeFrom, routeTo]);

  const handleSelectQuickSuggestion = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleSwapRoute = useCallback(() => {
    setRouteFrom(prev => routeTo);
    setRouteTo(prev => routeFrom);
  }, [routeFrom, routeTo]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#2C201A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Trains & Places</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Mode Selector: Instant Search vs Plan Route */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'instant' && styles.modeTabActive]}
            onPress={() => setMode('instant')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="search"
              size={16}
              color={mode === 'instant' ? '#9E3C1B' : '#7A6B63'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeTabText, mode === 'instant' && styles.modeTabTextActive]}>
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, mode === 'route' && styles.modeTabActive]}
            onPress={() => setMode('route')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="git-commit-outline"
              size={16}
              color={mode === 'route' ? '#9E3C1B' : '#7A6B63'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeTabText, mode === 'route' && styles.modeTabTextActive]}>
              Plan Route
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'instant' ? (
          <>
            {/* Search Input Bar */}
            <View style={styles.inputContainer}>
              <Ionicons name="search" size={20} color="#8A4A1C" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search train, station or destination"
                placeholderTextColor="#A8998E"
                value={query}
                onChangeText={setQuery}
                autoFocus
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color="#A8998E" />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Suggestion Chips */}
            {query.length === 0 && (
              <View style={styles.quickSection}>
                <Text style={styles.quickHeading}>POPULAR SEARCHES</Text>
                <View style={styles.chipsWrap}>
                  {QUICK_SUGGESTIONS.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={styles.chip}
                      onPress={() => handleSelectQuickSuggestion(s)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Results List */}
            <FlatList
              data={instantResults}
              keyExtractor={(item, index) => {
                if (item.kind === 'train') return `train-${item.train.trainNumber}-${index}`;
                if (item.kind === 'station') return `stn-${item.station.code}-${index}`;
                return `dest-${item.destination.code}-${index}`;
              }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                if (item.kind === 'train') {
                  const t = item.train;
                  const color = getTrainTypeColor(t.type);
                  return (
                    <TouchableOpacity
                      style={styles.resultRow}
                      onPress={() => {
                        onClose();
                        onSelectTrain(t);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.resultIconBox, { backgroundColor: color + '15' }]}>
                        <Ionicons name="train" size={20} color={color} />
                      </View>
                      <View style={styles.resultInfo}>
                        <View style={styles.resultTitleRow}>
                          <Text style={styles.resultTitle}>{t.name}</Text>
                          <View style={[styles.typeBadge, { backgroundColor: color + '15' }]}>
                            <Text style={[styles.typeBadgeText, { color }]}>{t.type}</Text>
                          </View>
                        </View>
                        <Text style={styles.resultSubtitle}>
                          #{t.trainNumber} · {t.sourceStationCode} → {t.destinationStationCode}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
                    </TouchableOpacity>
                  );
                }

                if (item.kind === 'station') {
                  const stn = item.station;
                  return (
                    <TouchableOpacity
                      style={styles.resultRow}
                      onPress={() => {
                        onClose();
                        onSelectStation(stn.code);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.resultIconBox, { backgroundColor: '#F0E7DE' }]}>
                        <Ionicons name="location" size={20} color="#8A4A1C" />
                      </View>
                      <View style={styles.resultInfo}>
                        <View style={styles.resultTitleRow}>
                          <Text style={styles.resultTitle}>{stn.name}</Text>
                          <View style={styles.codeBadge}>
                            <Text style={styles.codeBadgeText}>{stn.code}</Text>
                          </View>
                        </View>
                        <Text style={styles.resultSubtitle}>
                          {stn.state} · {stn.zone ?? 'Indian Railways'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
                    </TouchableOpacity>
                  );
                }

                // Destination
                const dest = item.destination;
                return (
                  <TouchableOpacity
                    style={styles.resultRow}
                    onPress={() => {
                      onClose();
                      onSelectStation(dest.code);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.resultIconBox, { backgroundColor: '#EBF5EB' }]}>
                      <Ionicons name="compass" size={20} color="#2E7D32" />
                    </View>
                    <View style={styles.resultInfo}>
                      <View style={styles.resultTitleRow}>
                        <Text style={styles.resultTitle}>{dest.name}</Text>
                        <View style={[styles.codeBadge, { backgroundColor: dest.type === 'GOA' ? '#EBF5EB' : '#FFF3E0' }]}>
                          <Text style={[styles.codeBadgeText, { color: dest.type === 'GOA' ? '#2E7D32' : '#C05621' }]}>
                            {dest.type === 'GOA' ? 'Goa' : 'Nearby Alt'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.resultSubtitle}>
                        {dest.region} {dest.distanceKm ? `· ${dest.distanceKm} km from Goa` : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                query.length > 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={40} color="#A8998E" />
                    <Text style={styles.emptyTitle}>No matching results</Text>
                    <Text style={styles.emptyDesc}>Try searching by train name, number, station, or town</Text>
                  </View>
                ) : null
              }
            />
          </>
        ) : (
          /* Route Mode: From → To */
          <View style={styles.routeContainer}>
            <View style={styles.routeCard}>
              <View style={styles.routeInputRow}>
                <View style={styles.dotOrigin} />
                <View style={styles.routeTextGroup}>
                  <Text style={styles.routeLabel}>FROM</Text>
                  <Text style={styles.routeValue}>
                    {STATION_MAP[routeFrom]?.name ?? routeFrom} ({routeFrom})
                  </Text>
                </View>
              </View>

              <View style={styles.routeDividerRow}>
                <View style={styles.routeDividerLine} />
                <TouchableOpacity style={styles.swapBtn} onPress={handleSwapRoute} activeOpacity={0.7}>
                  <Ionicons name="swap-vertical" size={18} color="#8A4A1C" />
                </TouchableOpacity>
              </View>

              <View style={styles.routeInputRow}>
                <View style={styles.dotDestination} />
                <View style={styles.routeTextGroup}>
                  <Text style={styles.routeLabel}>TO</Text>
                  <Text style={styles.routeValue}>
                    {STATION_MAP[routeTo]?.name ?? routeTo} ({routeTo})
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Stations to Choose */}
            <Text style={styles.routeHeading}>POPULAR ORIGIN / DESTINATION</Text>
            <View style={styles.chipsWrap}>
              {[
                { from: 'CSMT', to: 'THVM', label: 'Mumbai → Thivim' },
                { from: 'CSMT', to: 'MAO', label: 'Mumbai → Madgaon' },
                { from: 'CSMT', to: 'SWV', label: 'Mumbai → Sawantwadi' },
                { from: 'DR', to: 'SWV', label: 'Dadar → Sawantwadi' },
                { from: 'MAO', to: 'CSMT', label: 'Madgaon → Mumbai' },
              ].map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.chip}
                  onPress={() => {
                    setRouteFrom(item.from);
                    setRouteTo(item.to);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Route Train Results */}
            <Text style={styles.routeHeading}>
              DIRECT TRAINS ({routeTrains.length})
            </Text>

            <FlatList
              data={routeTrains}
              keyExtractor={item => item.trainNumber}
              contentContainerStyle={styles.listContent}
              renderItem={({ item: t }) => {
                const color = getTrainTypeColor(t.type);
                return (
                  <TouchableOpacity
                    style={styles.resultRow}
                    onPress={() => {
                      onClose();
                      onSelectTrain(t);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.resultIconBox, { backgroundColor: color + '15' }]}>
                      <Ionicons name="train" size={20} color={color} />
                    </View>
                    <View style={styles.resultInfo}>
                      <View style={styles.resultTitleRow}>
                        <Text style={styles.resultTitle}>{t.name}</Text>
                        <View style={[styles.typeBadge, { backgroundColor: color + '15' }]}>
                          <Text style={[styles.typeBadgeText, { color }]}>{t.type}</Text>
                        </View>
                      </View>
                      <Text style={styles.resultSubtitle}>
                        #{t.trainNumber} · Stops at both {routeFrom} and {routeTo}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#C4B8AF" />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="train-outline" size={40} color="#A8998E" />
                  <Text style={styles.emptyTitle}>No direct trains found</Text>
                  <Text style={styles.emptyDesc}>Try swapping or choosing another station pair</Text>
                </View>
              }
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE6',
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C201A',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F0EB',
  },
  modeTabActive: {
    backgroundColor: '#FCEFE9',
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A6B63',
  },
  modeTabTextActive: {
    color: '#9E3C1B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8DED6',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2C201A',
    height: '100%',
  },
  quickSection: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  quickHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A7A70',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3E38',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  resultIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#7A6B63',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  codeBadge: {
    backgroundColor: '#F0E7DE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A4A1C',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3E38',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8A7A70',
    textAlign: 'center',
    marginTop: 4,
  },
  routeContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    padding: 14,
    marginBottom: 16,
  },
  routeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dotOrigin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
    marginRight: 12,
  },
  dotDestination: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C05621',
    marginRight: 12,
  },
  routeTextGroup: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A7A70',
    letterSpacing: 0.6,
  },
  routeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
    marginTop: 2,
  },
  routeDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  routeDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0EAE4',
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7EFE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  routeHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A7A70',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
});
