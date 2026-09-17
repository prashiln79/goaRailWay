import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Station } from '../types/Station';
import { STATIONS } from '../data/stations';
import { RootStackParamList } from '../navigation/AppNavigator';

type StationsListNavProp = StackNavigationProp<RootStackParamList>;
type CategoryType = 'All' | 'Goa' | 'Konkan' | 'Maharashtra';

export const StationsListScreen: React.FC = () => {
  const navigation = useNavigation<StationsListNavProp>();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');

  // Filter stations
  const { goaStations, konkanStations, maharashtraStations } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const matches = (s: Station) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      );
    };

    const goa = STATIONS.filter(s => s.state === 'Goa' && matches(s));
    const konkan = STATIONS.filter(
      s => s.state === 'Maharashtra' && ['RN', 'KKW', 'SWV', 'CHI', 'KHED', 'ROHA', 'MNDA', 'PER'].includes(s.code) && matches(s),
    );
    const maha = STATIONS.filter(
      s => s.state === 'Maharashtra' && !konkan.some(k => k.code === s.code) && matches(s),
    );

    return { goaStations: goa, konkanStations: konkan, maharashtraStations: maha };
  }, [searchQuery]);

  const handleStationPress = (station: Station) => {
    navigation.navigate('StationDetails', { stationCode: station.code });
  };

  const renderStationCard = (station: Station, isGoa = false) => {
    return (
      <TouchableOpacity
        key={station.code}
        style={styles.stationCard}
        onPress={() => handleStationPress(station)}
        activeOpacity={0.7}
      >
        <View style={styles.stationLeft}>
          <View style={[styles.stationIconBox, isGoa ? styles.iconGoa : styles.iconKonkan]}>
            <Ionicons
              name={isGoa ? 'leaf' : 'business'}
              size={15}
              color={isGoa ? '#1E824C' : '#2563EB'}
            />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.stationZone}>{station.state} · {station.zone ?? 'KR'}</Text>
          </View>
        </View>

        <View style={styles.codeAndArrow}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>{station.code}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#B5A9A1" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Stations</Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#8A7A71" />
        <TextInput
          style={styles.input}
          placeholder="Search station name or code..."
          placeholderTextColor="#A0938C"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoryRow}>
        {(['All', 'Goa', 'Konkan', 'Maharashtra'] as CategoryType[]).map(cat => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={['content']}
        keyExtractor={() => 'key'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        renderItem={() => (
          <View>
            {/* Goa Stations Section */}
            {(activeCategory === 'All' || activeCategory === 'Goa') && goaStations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Goa Stations</Text>
                {goaStations.map(s => renderStationCard(s, true))}
              </View>
            )}

            {/* Konkan Stations Section */}
            {(activeCategory === 'All' || activeCategory === 'Konkan') && konkanStations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Konkan Stations</Text>
                {konkanStations.map(s => renderStationCard(s, false))}
              </View>
            )}

            {/* Other Maharashtra Stations Section */}
            {(activeCategory === 'All' || activeCategory === 'Maharashtra') && maharashtraStations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Maharashtra Stations</Text>
                {maharashtraStations.map(s => renderStationCard(s, false))}
              </View>
            )}
          </View>
        )}
      />
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
    paddingBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C201A',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginTop: 6,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#2C201A',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  categoryChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B584E',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C201A',
    marginBottom: 8,
  },
  stationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  stationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stationIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGoa: {
    backgroundColor: '#EBF7EE',
  },
  iconKonkan: {
    backgroundColor: '#EFF6FF',
  },
  nameBlock: {
    flex: 1,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },
  stationZone: {
    fontSize: 12,
    color: '#8A7A71',
    marginTop: 2,
  },
  codeAndArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBadge: {
    backgroundColor: '#F3EFEA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#554238',
  },
});
