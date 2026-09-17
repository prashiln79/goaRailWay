import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import MapView, { Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { Station } from '../types/Station';
import { trainService } from '../services/trainService';
import { stationService } from '../services/stationService';
import { useTrainStore, TrainFilter } from '../store/trainStore';
import { useMapStore, DEFAULT_REGION } from '../store/mapStore';
import RailwayMap from '../components/RailwayMap';

import TrainCard from '../components/TrainCard';
import FilterChips from '../components/FilterChips';
import SearchBar from '../components/SearchBar';
import StationBottomSheet from '../components/StationBottomSheet';
import TrainBottomSheet from '../components/TrainBottomSheet';
import { RootStackParamList } from '../navigation/AppNavigator';

type MapScreenNavProp = StackNavigationProp<RootStackParamList>;

const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavProp>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  // Stores
  const {
    filteredTrains,
    selectedTrain,
    activeFilter,
    loadTrains,
    setFilter,
    selectTrain,
  } = useTrainStore();
  const { region, selectedStation, routes, setRegion, selectStation, loadRoutes, focusStation } =
    useMapStore();

  // Local state
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [stationTrains, setStationTrains] = useState<Train[]>([]);
  const [stationLoading, setStationLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Initial load
  useEffect(() => {
    loadTrains();
    loadRoutes();
    stationService.getAllStations().then(setAllStations);
  }, []);

  // When station selected, load its trains
  useEffect(() => {
    if (!selectedStation) {
      setStationTrains([]);
      return;
    }
    setStationLoading(true);
    trainService
      .getTrainsAtStation(selectedStation.code)
      .then(trains => {
        setStationTrains(trains);
        setStationLoading(false);
      })
      .catch(() => setStationLoading(false));
  }, [selectedStation]);

  const handleStationPress = useCallback(
    (station: Station) => {
      selectTrain(null);
      selectStation(station);
    },
    [selectStation, selectTrain],
  );

  const handleTrainPress = useCallback(
    (train: Train) => {
      selectStation(null);
      selectTrain(train);
    },
    [selectStation, selectTrain],
  );

  const handleTrainCardPress = useCallback(
    (train: Train) => {
      handleTrainPress(train);
      // Animate map to first Konkan stop of that train
      const firstStop = train.stops[Math.floor(train.stops.length / 2)];
      // We'll just center on the midpoint station
    },
    [handleTrainPress],
  );

  const handleCloseStation = useCallback(() => {
    selectStation(null);
  }, [selectStation]);

  const handleCloseTrain = useCallback(() => {
    selectTrain(null);
  }, [selectTrain]);

  const handleViewRoute = useCallback(
    (train: Train) => {
      navigation.navigate('TrainDetails', { trainNumber: train.trainNumber });
    },
    [navigation],
  );

  const handleSeeAllTrains = useCallback(() => {
    if (selectedStation) {
      navigation.navigate('StationDetails', { stationCode: selectedStation.code });
    }
  }, [selectedStation, navigation]);

  const handleFilterChange = useCallback(
    (filter: TrainFilter) => {
      setFilter(filter);
    },
    [setFilter],
  );

  const handleReCenter = useCallback(() => {
    mapRef.current?.animateToRegion(DEFAULT_REGION, 600);
    setRegion(DEFAULT_REGION);
  }, [setRegion]);

  const handleRegionChange = useCallback(
    (newRegion: Region) => {
      setRegion(newRegion);
    },
    [setRegion],
  );

  const handleSearchFocus = useCallback(() => {
    (navigation as any).navigate('Search');
  }, [navigation]);

  const carouselRef = useRef<FlatList>(null);

  // Scroll carousel to selected train
  useEffect(() => {
    if (!selectedTrain) return;
    const idx = filteredTrains.findIndex(t => t.id === selectedTrain.id);
    if (idx >= 0) {
      carouselRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
    }
  }, [selectedTrain, filteredTrains]);

  const renderTrainCard = useCallback(
    ({ item }: { item: Train }) => (
      <TrainCard
        train={item}
        isSelected={selectedTrain?.id === item.id}
        onPress={handleTrainCardPress}
      />
    ),
    [selectedTrain, handleTrainCardPress],
  );

  const topInset = insets.top;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* ─── FULL SCREEN MAP ─── */}
        <View style={styles.mapContainer}>
          <RailwayMap
            mapRef={mapRef}
            stations={allStations}
            trains={filteredTrains}
            routes={routes}
            selectedTrain={selectedTrain}
            selectedStation={selectedStation}
            initialRegion={DEFAULT_REGION}
            onStationPress={handleStationPress}
            onTrainPress={handleTrainPress}
            onRegionChange={handleRegionChange}
          />

          {/* ─── Floating top bar ─── */}
          <View style={[styles.topBar, { top: topInset + 8 }]}>
            <View style={styles.searchWrapper}>
              <SearchBar
                value={searchText}
                onChangeText={setSearchText}
                onFocus={handleSearchFocus}
                onClear={() => setSearchText('')}
              />
            </View>
            <TouchableOpacity style={styles.settingsBtn}>
              <Ionicons name="layers-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* ─── Map controls (right side) ─── */}
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={() =>
                mapRef.current?.animateToRegion(
                  { ...region, latitudeDelta: region.latitudeDelta / 2, longitudeDelta: region.longitudeDelta / 2 },
                  300,
                )
              }
            >
              <Ionicons name="add" size={22} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={() =>
                mapRef.current?.animateToRegion(
                  { ...region, latitudeDelta: region.latitudeDelta * 2, longitudeDelta: region.longitudeDelta * 2 },
                  300,
                )
              }
            >
              <Ionicons name="remove" size={22} color="#374151" />
            </TouchableOpacity>
            <View style={styles.controlDivider} />
            <TouchableOpacity style={styles.mapControlBtn} onPress={handleReCenter}>
              <Ionicons name="locate-outline" size={20} color="#1A73E8" />
            </TouchableOpacity>
          </View>

          {/* ─── Selected train chip (floating) ─── */}
          {selectedTrain && (
            <TouchableOpacity
              style={styles.selectedTrainChip}
              onPress={() => handleViewRoute(selectedTrain)}
              activeOpacity={0.85}
            >
              <Ionicons name="train" size={14} color="#FFFFFF" />
              <Text style={styles.selectedTrainChipText}>
                {selectedTrain.trainNumber} · {selectedTrain.name}
              </Text>
              <Ionicons name="close" size={14} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>

        {/* ─── BOTTOM PANEL ─── */}
        <SafeAreaView edges={['bottom']} style={styles.bottomPanel}>
          {/* Filter chips */}
          <FilterChips activeFilter={activeFilter} onFilterChange={handleFilterChange} />

          {/* Horizontal train carousel */}
          <FlatList
            ref={carouselRef}
            data={filteredTrains}
            horizontal
            keyExtractor={t => t.id}
            renderItem={renderTrainCard}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            getItemLayout={(_, index) => ({ length: 232, offset: 232 * index, index })}
            onScrollToIndexFailed={() => {}}
            style={styles.carousel}
          />
        </SafeAreaView>

        {/* ─── BOTTOM SHEETS (rendered over everything) ─── */}
        <StationBottomSheet
          station={selectedStation}
          trains={stationTrains}
          isLoading={stationLoading}
          onClose={handleCloseStation}
          onTrainPress={handleTrainPress}
          onSeeAllPress={handleSeeAllTrains}
        />

        <TrainBottomSheet
          train={selectedTrain && !selectedStation ? selectedTrain : null}
          onClose={handleCloseTrain}
          onViewRoute={handleViewRoute}
        />
      </View>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    zIndex: 10,
  },
  searchWrapper: {
    flex: 1,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mapControls: {
    position: 'absolute',
    right: 12,
    bottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    overflow: 'hidden',
  },
  mapControlBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
  },
  selectedTrainChip: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A73E8',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: '70%',
    zIndex: 10,
  },
  selectedTrainChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  carousel: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  carouselContent: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
});
