import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { Station } from '../types/Station';
import { trainService } from '../services/trainService';
import { stationService } from '../services/stationService';
import { STATION_MAP } from '../data/stations';
import { getTrainTypeColor } from '../components/TrainCard';
import { RootStackParamList } from '../navigation/AppNavigator';
import SearchBar from '../components/SearchBar';
import { useMapStore } from '../store/mapStore';
import { useTrainStore } from '../store/trainStore';
import { TextInput } from 'react-native';

type SearchNavProp = StackNavigationProp<RootStackParamList, 'Search'>;

type SearchResultType = 'train' | 'station';

interface SearchResult {
  type: SearchResultType;
  train?: Train;
  station?: Station;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchNavProp>();
  const { selectStation, focusStation } = useMapStore();
  const { selectTrain } = useTrainStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const [trains, stations] = await Promise.all([
        trainService.searchTrains(query),
        stationService.searchStations(query),
      ]);
      const trainResults: SearchResult[] = trains.map(t => ({ type: 'train', train: t }));
      const stationResults: SearchResult[] = stations.map(s => ({ type: 'station', station: s }));
      setResults([...stationResults, ...trainResults]);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleTrainResult = useCallback(
    (train: Train) => {
      Keyboard.dismiss();
      selectTrain(train);
      navigation.navigate('MapScreen');
    },
    [navigation, selectTrain],
  );

  const handleStationResult = useCallback(
    (station: Station) => {
      Keyboard.dismiss();
      focusStation(station);
      selectStation(station);
      navigation.navigate('MapScreen');
    },
    [navigation, focusStation, selectStation],
  );

  const renderResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'train' && item.train) {
      const t = item.train;
      const src = STATION_MAP[t.sourceStationCode];
      const dst = STATION_MAP[t.destinationStationCode];
      const color = getTrainTypeColor(t.type);
      return (
        <TouchableOpacity
          style={styles.resultRow}
          onPress={() => handleTrainResult(t)}
          activeOpacity={0.7}
        >
          <View style={[styles.resultIcon, { backgroundColor: color + '18' }]}>
            <Ionicons name="train" size={18} color={color} />
          </View>
          <View style={styles.resultBody}>
            <Text style={styles.resultTitle}>{t.trainNumber} · {t.name}</Text>
            <Text style={styles.resultSub}>
              {src?.name ?? t.sourceStationCode} → {dst?.name ?? t.destinationStationCode}
            </Text>
          </View>
          <View style={[styles.resultTypeBadge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.resultTypeBadgeText, { color }]}>{t.type}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (item.type === 'station' && item.station) {
      const s = item.station;
      return (
        <TouchableOpacity
          style={styles.resultRow}
          onPress={() => handleStationResult(s)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.resultIcon,
              { backgroundColor: s.isGoaStation ? '#DBEAFE' : '#F3F4F6' },
            ]}
          >
            <Ionicons
              name="location"
              size={18}
              color={s.isGoaStation ? '#1A73E8' : '#6B7280'}
            />
          </View>
          <View style={styles.resultBody}>
            <Text style={styles.resultTitle}>{s.name}</Text>
            <Text style={styles.resultSub}>{s.code} · {s.state}</Text>
          </View>
          {s.isGoaStation && (
            <View style={styles.goaBadge}>
              <Text style={styles.goaBadgeText}>GOA</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <Ionicons name="search-outline" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.textInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Train number, name, station..."
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Hint */}
      {!query && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintTitle}>Search for</Text>
          {['12619 — Train number', 'Matsyagandha — Train name', 'Madgaon — Station name', 'MAO — Station code', 'Thivim — Station'].map(hint => (
            <TouchableOpacity
              key={hint}
              style={styles.hintChip}
              onPress={() => setQuery(hint.split(' — ')[0])}
            >
              <Ionicons name="search" size={13} color="#1A73E8" />
              <Text style={styles.hintText}>{hint}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      {query.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item, idx) =>
            item.type === 'train'
              ? `train-${item.train?.id}`
              : `station-${item.station?.id}-${idx}`
          }
          renderItem={renderResult}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searching ? 'Searching...' : 'No results found'}
            </Text>
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {},
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  hintContainer: {
    padding: 20,
    gap: 10,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  hintText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
  },
  listContent: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: {
    flex: 1,
    gap: 3,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resultSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultTypeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resultTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  goaBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  goaBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1A73E8',
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginLeft: 66,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 15,
    paddingVertical: 40,
  },
});
