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
  GoaStationInfo,
  NearbyAlternativeStationInfo,
} from '../data/stationAlternatives';
import { RootStackParamList } from '../navigation/AppNavigator';

type StationsNavProp = StackNavigationProp<RootStackParamList>;

export const StationsListScreen: React.FC = () => {
  const navigation = useNavigation<StationsNavProp>();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();

  // Filter Goa Stations
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

  // Filter Nearby Alternative Stations
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

  const handleStationPress = (stationCode: string) => {
    navigation.navigate('StationDetails', { stationCode });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Stations</Text>
        <Text style={styles.subtitle}>Goa stations and nearby alternatives</Text>
      </View>

      {/* Search Field */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#8A7A71" />
        <TextInput
          style={styles.input}
          placeholder="Search station or area (e.g. Thivim, Panaji, North Goa)"
          placeholderTextColor="#A0938C"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* GOA STATIONS SECTION */}
        {filteredGoa.length > 0 && (
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
        {filteredNearby.length > 0 && (
          <View style={[styles.section, styles.nearbySection]}>
            {/* <Text style={styles.sectionTitle}>NEARBY STATIONS</Text>
            <Text style={styles.sectionSubtitle}>Alternative stations outside Goa</Text> */}

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
      </ScrollView>
    </SafeAreaView>
  );
};

export default StationsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4', // Warm cream background
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Soft sand / ivory
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
  sectionSubtitle: {
    fontSize: 13,
    color: '#7A6B63',
    marginBottom: 12,
    marginLeft: 4,
  },
  groupBlock: {
    marginBottom: 12,
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E3C1B', // Terracotta accent
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  nearbyCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#9E3C1B', // Terracotta indicator
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C201A',
    flex: 1,
    marginRight: 10,
  },
  codeBadge: {
    backgroundColor: '#F3EFEA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A4A1C',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  regionText: {
    fontSize: 13,
    color: '#7A6B63',
    marginTop: 4,
    fontWeight: '500',
  },
  stateText: {
    fontSize: 12,
    color: '#8A7A71',
    marginTop: 2,
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C201A',
  },
  bulletSeparator: {
    color: '#C4B7AF',
    fontSize: 12,
  },
  altText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E824C', // Muted green for useful alternative
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#382A22',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A7A71',
    textAlign: 'center',
    marginTop: 4,
  },
});
