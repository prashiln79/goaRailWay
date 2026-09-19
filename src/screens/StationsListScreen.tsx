import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  GOA_STATIONS_DATA,
  NEARBY_ALTERNATIVE_STATIONS_DATA,
  MUMBAI_STATIONS_DATA,
  GoaStationInfo,
  NearbyAlternativeStationInfo,
  MumbaiStationInfo,
} from '../data/stationAlternatives';
import { CORRIDOR_HUBS } from '../data/corridorHubs';
import { useCorridorStore } from '../store/corridorStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type StationsNavProp = StackNavigationProp<RootStackParamList>;

type GoaTabFilter = 'ALL' | 'GOA' | 'NEARBY';
type MumbaiTabFilter = 'ALL' | 'TERMINUS' | 'JUNCTION';

export const StationsListScreen: React.FC = () => {
  const navigation = useNavigation<StationsNavProp>();
  const insets = useSafeAreaInsets();
  const { selectedHub, setSelectedHub } = useCorridorStore();

  const [query, setQuery] = useState('');
  const [goaTab, setGoaTab] = useState<GoaTabFilter>('ALL');
  const [mumbaiTab, setMumbaiTab] = useState<MumbaiTabFilter>('ALL');

  const q = query.toLowerCase().trim();

  // ── Goa Filters ──────────────────────────────────────────────────
  const filteredGoa = useMemo(() => {
    if (!q) return GOA_STATIONS_DATA;
    return GOA_STATIONS_DATA.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        (s.nearbyDestinations && s.nearbyDestinations.toLowerCase().includes(q)),
    );
  }, [q]);

  const filteredNearby = useMemo(() => {
    if (!q) return NEARBY_ALTERNATIVE_STATIONS_DATA;
    return NEARBY_ALTERNATIVE_STATIONS_DATA.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.alternativeFor.toLowerCase().includes(q) ||
        s.usefulRegion.toLowerCase().includes(q),
    );
  }, [q]);

  const northGoaAlternatives = filteredNearby.filter(s => s.usefulRegion === 'North Goa');
  const southGoaAlternatives = filteredNearby.filter(s => s.usefulRegion === 'South Goa');

  // ── Mumbai Filters ───────────────────────────────────────────────
  const filteredMumbai = useMemo(() => {
    let list = MUMBAI_STATIONS_DATA;
    if (mumbaiTab === 'TERMINUS') {
      list = list.filter(s => s.type === 'Terminus');
    } else if (mumbaiTab === 'JUNCTION') {
      list = list.filter(s => s.type === 'Junction' || s.type === 'Transit Hub');
    }
    if (!q) return list;
    return list.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        (s.nearbyDestinations && s.nearbyDestinations.toLowerCase().includes(q)),
    );
  }, [q, mumbaiTab]);

  const handleStationPress = (stationCode: string) => {
    navigation.navigate('StationDetails', { stationCode });
  };

  const isGoaHub = selectedHub === 'Goa';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isGoaHub ? 'Goa Stations' : 'Mumbai Hubs'}
        </Text>
        <Text style={styles.subtitle}>
          {isGoaHub
            ? 'Goa rail stations and nearby alternative gateways'
            : 'Mumbai metropolitan originating & terminating hubs'}
        </Text>
      </View>

      {/* Corridor Hub Switcher: Goa / Mumbai */}
      <View style={styles.hubChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hubScroll}
        >
          {CORRIDOR_HUBS.map(hub => {
            const isActive = selectedHub === hub.id;
            return (
              <TouchableOpacity
                key={hub.id}
                style={[styles.hubChip, isActive && styles.hubChipActive]}
                onPress={() => {
                  setSelectedHub(hub.id);
                  setQuery('');
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={hub.icon}
                  size={14}
                  color={isActive ? '#FFFFFF' : '#8A4A1C'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.hubChipText,
                    isActive && styles.hubChipTextActive,
                  ]}
                >
                  {hub.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Field */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#8A7A71" />
        <TextInput
          style={styles.input}
          placeholder={
            isGoaHub
              ? 'Search station or area (e.g. Thivim, Panaji, Madgaon)'
              : 'Search Mumbai hub (e.g. CSMT, Dadar, Panvel, Kurla)'
          }
          placeholderTextColor="#A0938C"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Sub-Category Chips */}
      {isGoaHub ? (
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(
              [
                { id: 'ALL', label: `All (${filteredGoa.length + filteredNearby.length})` },
                { id: 'GOA', label: `Goa (${filteredGoa.length})` },
                { id: 'NEARBY', label: `Nearby Alt (${filteredNearby.length})` },
              ] as { id: GoaTabFilter; label: string }[]
            ).map(tab => {
              const isActive = goaTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setGoaTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(
              [
                { id: 'ALL', label: `All Hubs (${MUMBAI_STATIONS_DATA.length})` },
                {
                  id: 'TERMINUS',
                  label: `Terminals (${
                    MUMBAI_STATIONS_DATA.filter(s => s.type === 'Terminus').length
                  })`,
                },
                {
                  id: 'JUNCTION',
                  label: `Junctions (${
                    MUMBAI_STATIONS_DATA.filter(s => s.type !== 'Terminus').length
                  })`,
                },
              ] as { id: MumbaiTabFilter; label: string }[]
            ).map(tab => {
              const isActive = mumbaiTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setMumbaiTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Station List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {isGoaHub ? (
          <>
            {/* GOA STATIONS SECTION */}
            {goaTab !== 'NEARBY' && filteredGoa.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>GOA</Text>

                {filteredGoa.map((station: GoaStationInfo) => (
                  <TouchableOpacity
                    key={station.code}
                    style={styles.stationCard}
                    onPress={() => handleStationPress(station.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.stationName}>{station.name}</Text>
                      <View style={styles.codeBadge}>
                        <Text style={styles.stationCode}>{station.code}</Text>
                      </View>
                    </View>
                    <Text style={styles.regionText}>{station.region}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* NEARBY STATIONS SECTION */}
            {goaTab !== 'GOA' && filteredNearby.length > 0 && (
              <View style={[styles.section, styles.nearbySection]}>
                {/* NEARBY FOR NORTH GOA */}
                {northGoaAlternatives.length > 0 && (
                  <View style={styles.groupBlock}>
                    <Text style={styles.groupHeader}>NEARBY FOR NORTH GOA</Text>
                    {northGoaAlternatives.map((station: NearbyAlternativeStationInfo) => (
                      <TouchableOpacity
                        key={station.code}
                        style={[styles.stationCard, styles.nearbyCard]}
                        onPress={() => handleStationPress(station.code)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.cardHeaderRow}>
                          <Text style={styles.stationName}>{station.name}</Text>
                          <View style={styles.codeBadge}>
                            <Text style={styles.stationCode}>{station.code}</Text>
                          </View>
                        </View>
                        <Text style={styles.stateText}>{station.state}</Text>
                        <View style={styles.distanceBadgeRow}>
                          <Text style={styles.distanceText}>{station.distanceLabel}</Text>
                          <Text style={styles.bulletSeparator}>•</Text>
                          <Text style={styles.altText}>{station.alternativeFor}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* NEARBY FOR SOUTH GOA */}
                {southGoaAlternatives.length > 0 && (
                  <View style={styles.groupBlock}>
                    <Text style={styles.groupHeader}>NEARBY FOR SOUTH GOA</Text>
                    {southGoaAlternatives.map((station: NearbyAlternativeStationInfo) => (
                      <TouchableOpacity
                        key={station.code}
                        style={[styles.stationCard, styles.nearbyCard]}
                        onPress={() => handleStationPress(station.code)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.cardHeaderRow}>
                          <Text style={styles.stationName}>{station.name}</Text>
                          <View style={styles.codeBadge}>
                            <Text style={styles.stationCode}>{station.code}</Text>
                          </View>
                        </View>
                        <Text style={styles.stateText}>{station.state}</Text>
                        <View style={styles.distanceBadgeRow}>
                          <Text style={styles.distanceText}>{station.distanceLabel}</Text>
                          <Text style={styles.bulletSeparator}>•</Text>
                          <Text style={styles.altText}>{station.alternativeFor}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Empty Search Notice */}
            {filteredGoa.length === 0 && filteredNearby.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={36} color="#A8998E" />
                <Text style={styles.emptyTitle}>No matching stations found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching "North Goa", "Thivim", "Madgaon", or "Panaji".
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* MUMBAI STATIONS SECTION */}
            {filteredMumbai.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MUMBAI HUBS</Text>

                {filteredMumbai.map((station: MumbaiStationInfo) => (
                  <TouchableOpacity
                    key={station.code}
                    style={styles.stationCard}
                    onPress={() => handleStationPress(station.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.stationName}>{station.name}</Text>
                      <View style={styles.codeBadge}>
                        <Text style={styles.stationCode}>{station.code}</Text>
                      </View>
                    </View>
                    <View style={styles.mumbaiMetaRow}>
                      <Text style={styles.regionText}>{station.area}</Text>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{station.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.taglineText} numberOfLines={2}>
                      {station.tagline}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={36} color="#A8998E" />
                <Text style={styles.emptyTitle}>No matching Mumbai hubs found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching "CSMT", "Dadar", "Panvel", or "Kurla".
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StationsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#8A7A71',
    marginTop: 2,
    fontWeight: '500',
  },

  // Hub Switcher Chips
  hubChipsContainer: {
    marginTop: 10,
    marginBottom: 2,
  },
  hubScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  hubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  hubChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  hubChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C4E46',
  },
  hubChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2C201A',
  },
  filterRow: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  filterChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C4E46',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  nearbySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A7A71',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupBlock: {
    marginBottom: 12,
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A4A1C',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  nearbyCard: {
    borderColor: '#EFE5DC',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C201A',
  },
  codeBadge: {
    backgroundColor: '#F5EDE8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stationCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9E3C1B',
  },
  regionText: {
    fontSize: 13,
    color: '#7A6B63',
    fontWeight: '500',
  },
  mumbaiMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 6,
  },
  typeBadge: {
    backgroundColor: '#EBF3FB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1565C0',
  },
  taglineText: {
    fontSize: 12,
    color: '#6B5E57',
    lineHeight: 16,
  },
  stateText: {
    fontSize: 13,
    color: '#7A6B63',
    marginBottom: 6,
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3C1B',
  },
  bulletSeparator: {
    fontSize: 10,
    color: '#A8998E',
  },
  altText: {
    fontSize: 12,
    color: '#7A6B63',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C201A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#7A6B63',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
