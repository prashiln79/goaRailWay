import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { trainService } from '../services/trainService';
import { TrainCard, TrainCardSegment } from '../components/TrainCard';
import { STATION_MAP } from '../data/stations';
import { SearchJourneyModal } from '../components/SearchJourneyModal';
import DateSelector from '../components/DateSelector';
import { RootStackParamList } from '../navigation/AppNavigator';

type TrainsHomeNavProp = StackNavigationProp<RootStackParamList>;

export type CorridorHubId = 'Goa' | 'Sawantwadi' | 'Ratnagiri' | 'Mumbai';

export interface HubStation {
  code: string;
  name: string;
  shortName: string;
  tag?: string;
}

export interface CorridorHub {
  id: CorridorHubId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  stations: HubStation[];
}

export const CORRIDOR_HUBS: CorridorHub[] = [
  {
    id: 'Goa',
    label: 'Goa',
    icon: 'sunny-outline',
    description: 'Stations across North, Central & South Goa',
    stations: [
      { code: 'ALL_GOA', name: 'All Goa Stations', shortName: 'All Goa' },
      { code: 'THVM', name: 'Thivim', shortName: 'Thivim', tag: 'North' },
      { code: 'KRMI', name: 'Karmali', shortName: 'Karmali', tag: 'Panaji' },
      { code: 'MAO', name: 'Madgaon', shortName: 'Madgaon', tag: 'South' },
      { code: 'CNO', name: 'Canacona', shortName: 'Canacona', tag: 'South' },
      { code: 'VSG', name: 'Vasco da Gama', shortName: 'Vasco', tag: 'Port' },
      { code: 'PER', name: 'Pernem', shortName: 'Pernem', tag: 'North' },
    ],
  },
  {
    id: 'Sawantwadi',
    label: 'Sawantwadi',
    icon: 'location-outline',
    description: 'Sindhudurg district & Goa border alternatives',
    stations: [
      { code: 'ALL_SWV', name: 'All Sindhudurg', shortName: 'All' },
      { code: 'SWV', name: 'Sawantwadi Road', shortName: 'Sawantwadi Rd', tag: '38 km to Goa' },
      { code: 'KUDL', name: 'Kudal', shortName: 'Kudal', tag: '60 km to Goa' },
      { code: 'KKW', name: 'Kankavli', shortName: 'Kankavli', tag: '75 km to Goa' },
    ],
  },
  {
    id: 'Ratnagiri',
    label: 'Ratnagiri',
    icon: 'boat-outline',
    description: 'Central Konkan junctions & coastal towns',
    stations: [
      { code: 'ALL_RN', name: 'All Central Konkan', shortName: 'All' },
      { code: 'RN', name: 'Ratnagiri', shortName: 'Ratnagiri', tag: 'Junction' },
      { code: 'CHI', name: 'Chiplun', shortName: 'Chiplun', tag: 'North Konkan' },
      { code: 'ROHA', name: 'Roha', shortName: 'Roha', tag: 'Junction' },
    ],
  },
  {
    id: 'Mumbai',
    label: 'Mumbai',
    icon: 'business-outline',
    description: 'Mumbai metropolitan originating & terminating hubs',
    stations: [
      { code: 'ALL_MUMBAI', name: 'All Mumbai Hubs', shortName: 'All' },
      { code: 'CSMT', name: 'Mumbai CSMT', shortName: 'CSMT', tag: 'South' },
      { code: 'LTT', name: 'Mumbai LTT', shortName: 'LTT', tag: 'Kurla' },
      { code: 'DR', name: 'Dadar', shortName: 'Dadar', tag: 'Central' },
      { code: 'PNVL', name: 'Panvel', shortName: 'Panvel', tag: 'Navi Mumbai' },
      { code: 'DIV', name: 'Diva', shortName: 'Diva', tag: 'Central' },
    ],
  },
];

type TimingFilter = 'All' | 'Early Morning' | 'Morning' | 'Afternoon' | 'Evening' | 'Night';
type SortType = 'Departure time' | 'Journey duration' | 'Arrival time';

const GOA_STATION_CODES = new Set(['PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'VSG']);
const SWV_STATION_CODES = new Set(['SWV', 'KUDL', 'KKW']);
const RN_STATION_CODES = new Set(['RN', 'CHI', 'ROHA', 'MNDA']);
const MUMBAI_STATION_CODES = new Set(['CSMT', 'LTT', 'DR', 'PNVL', 'DIV', 'BCT', 'BDTS']);
// All mid-Konkan codes used for direction detection
const KONKAN_CODES = new Set([...Array.from(GOA_STATION_CODES), ...Array.from(SWV_STATION_CODES), ...Array.from(RN_STATION_CODES)]);

// Returns the sequence index of the first stop matching any code in the set, or -1
function firstMatchIndex(train: Train, codeSet: Set<string>): number {
  return train.stops.findIndex(s => codeSet.has(s.stationCode));
}

// Returns stop index for a specific station code, or -1
function stopIndex(train: Train, code: string): number {
  return train.stops.findIndex(s => s.stationCode === code);
}

// Helpers still used by the timing filter sorting
function getDepTime(train: Train): string {
  return train.stops[0]?.departureTime ?? '00:00';
}

export const TrainsHomeScreen: React.FC = () => {
  const navigation = useNavigation<TrainsHomeNavProp>();
  const insets = useSafeAreaInsets();

  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [selectedDate, setSelectedDate] = useState('2026-09-17');

  // Filters & Sorting: Major Corridor Hubs + Dynamic Station Sub-menu
  const [selectedHub, setSelectedHub] = useState<CorridorHubId>('Goa');
  const [selectedStationCode, setSelectedStationCode] = useState<string | null>('ALL_GOA');
  const [timingFilter, setTimingFilter] = useState<TimingFilter>('All');
  const [sortOption, setSortOption] = useState<SortType>('Departure time');

  // Modals
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    trainService.getAllTrains().then(trains => {
      setAllTrains(trains);
    });
  }, []);

  const handleTrainPress = useCallback(
    (train: Train) => {
      navigation.navigate('TrainDetails', { trainNumber: train.trainNumber });
    },
    [navigation],
  );

  const handleSelectStation = useCallback(
    (stationCode: string) => {
      navigation.navigate('StationDetails', { stationCode });
    },
    [navigation],
  );

  const handleHubSelect = useCallback((hubId: CorridorHubId) => {
    setSelectedHub(hubId);
    if (hubId === 'Goa') setSelectedStationCode('ALL_GOA');
    else if (hubId === 'Sawantwadi') setSelectedStationCode('ALL_SWV');
    else if (hubId === 'Ratnagiri') setSelectedStationCode('ALL_RN');
    else if (hubId === 'Mumbai') setSelectedStationCode('ALL_MUMBAI');
    else setSelectedStationCode(null);
  }, []);

  const activeHub = useMemo(() => {
    return CORRIDOR_HUBS.find(h => h.id === selectedHub);
  }, [selectedHub]);

  const activeStationObj = useMemo(() => {
    return activeHub?.stations.find(s => s.code === selectedStationCode);
  }, [activeHub, selectedStationCode]);

  // Filter and Sort train feed
  const filteredTrains = useMemo(() => {
    let list = [...allTrains];

    // 1. Hub / Station Selection Filter — with directional logic for terminal hubs
    if (selectedHub === 'Goa') {
      if (selectedStationCode && selectedStationCode !== 'ALL_GOA') {
        // Filter trains that stop at the specific Goa station AND are traveling TOWARD Goa
        // (i.e., a Mumbai/Konkan stop appears before the Goa stop in the stops sequence)
        list = list.filter(t => {
          const goaIdx = stopIndex(t, selectedStationCode);
          if (goaIdx === -1) return false; // doesn't stop here
          // Check if there's a Mumbai or northern Konkan stop before this Goa stop
          const northBeforeGoa = t.stops
            .slice(0, goaIdx)
            .some(s => MUMBAI_STATION_CODES.has(s.stationCode) || SWV_STATION_CODES.has(s.stationCode) || RN_STATION_CODES.has(s.stationCode));
          return northBeforeGoa || MUMBAI_STATION_CODES.has(t.sourceStationCode) || RN_STATION_CODES.has(t.sourceStationCode);
        });
      } else {
        // All Goa — trains that are heading toward or terminating in Goa (from Mumbai/Konkan)
        list = list.filter(t => {
          const firstGoaIdx = firstMatchIndex(t, GOA_STATION_CODES);
          if (firstGoaIdx === -1) return false;
          // Must have a Mumbai or northern Konkan stop before the Goa stop (heading south into Goa)
          const northBeforeGoa = t.stops
            .slice(0, firstGoaIdx)
            .some(s => MUMBAI_STATION_CODES.has(s.stationCode) || SWV_STATION_CODES.has(s.stationCode) || RN_STATION_CODES.has(s.stationCode));
          const originatesNorth = MUMBAI_STATION_CODES.has(t.sourceStationCode) || RN_STATION_CODES.has(t.sourceStationCode);
          return northBeforeGoa || originatesNorth;
        });
      }
    } else if (selectedHub === 'Sawantwadi') {
      // Bidirectional — show all trains passing through Sindhudurg region
      if (selectedStationCode && selectedStationCode !== 'ALL_SWV') {
        list = list.filter(t => t.stops.some(s => s.stationCode === selectedStationCode));
      } else {
        list = list.filter(t => t.stops.some(s => SWV_STATION_CODES.has(s.stationCode)));
      }
    } else if (selectedHub === 'Ratnagiri') {
      // Bidirectional — show all trains passing through Central Konkan
      if (selectedStationCode && selectedStationCode !== 'ALL_RN') {
        list = list.filter(t => t.stops.some(s => s.stationCode === selectedStationCode));
      } else {
        list = list.filter(t => t.stops.some(s => RN_STATION_CODES.has(s.stationCode)));
      }
    } else if (selectedHub === 'Mumbai') {
      if (selectedStationCode && selectedStationCode !== 'ALL_MUMBAI') {
        // Filter trains that stop at the specific Mumbai station AND are traveling TOWARD Mumbai
        // (i.e., the Mumbai stop appears after a Goa/Konkan stop)
        list = list.filter(t => {
          const mumbaiIdx = stopIndex(t, selectedStationCode);
          if (mumbaiIdx === -1) return false; // doesn't stop here
          // Check if there's a Goa or Konkan stop before this Mumbai stop
          const konkanBeforeMumbai = t.stops
            .slice(0, mumbaiIdx)
            .some(s => KONKAN_CODES.has(s.stationCode));
          return konkanBeforeMumbai;
        });
      } else {
        // All Mumbai hubs — trains heading FROM Goa/Konkan TO Mumbai
        list = list.filter(t => {
          const firstMumbaiIdx = firstMatchIndex(t, MUMBAI_STATION_CODES);
          if (firstMumbaiIdx === -1) return false;
          // Konkan/Goa stop must appear before the Mumbai stop
          const hasKonkanBeforeMumbai = t.stops
            .slice(0, firstMumbaiIdx)
            .some(s => KONKAN_CODES.has(s.stationCode));
          return hasKonkanBeforeMumbai;
        });
      }
    }

    // 2. Timing Filter
    if (timingFilter !== 'All') {
      list = list.filter(t => {
        const depTime = getDepTime(t);
        const hour = parseInt(depTime.split(':')[0] || '12', 10);

        if (timingFilter === 'Early Morning') return hour >= 4 && hour < 8;
        if (timingFilter === 'Morning') return hour >= 8 && hour < 12;
        if (timingFilter === 'Afternoon') return hour >= 12 && hour < 17;
        if (timingFilter === 'Evening') return hour >= 17 && hour < 21;
        if (timingFilter === 'Night') return hour >= 21 || hour < 4;
        return true;
      });
    }

    // 3. Sorting
    return list.sort((a, b) => {
      const aDepTime = getDepTime(a);
      const bDepTime = getDepTime(b);
      const aLast = a.stops[a.stops.length - 1];
      const bLast = b.stops[b.stops.length - 1];
      const aArrTime = aLast?.arrivalTime ?? aLast?.departureTime ?? '00:00';
      const bArrTime = bLast?.arrivalTime ?? bLast?.departureTime ?? '00:00';

      if (sortOption === 'Departure time') return aDepTime.localeCompare(bDepTime);
      if (sortOption === 'Arrival time') return aArrTime.localeCompare(bArrTime);
      if (sortOption === 'Journey duration') {
        // Rough minutes from first to last stop
        const dur = (t: Train) => {
          const f = t.stops[0];
          const l = t.stops[t.stops.length - 1];
          const [dh, dm] = (f?.departureTime ?? '00:00').split(':').map(Number);
          const [ah, am] = (l?.arrivalTime ?? l?.departureTime ?? '00:00').split(':').map(Number);
          return ((l?.dayOffset ?? 0) - (f?.dayOffset ?? 0)) * 1440
            + (ah * 60 + am) - (dh * 60 + dm);
        };
        return dur(a) - dur(b);
      }
      return 0;
    });
  }, [allTrains, selectedHub, selectedStationCode, timingFilter, sortOption]);

  const headingTitle = useMemo(() => {
    if (activeStationObj && !activeStationObj.code.startsWith('ALL_')) {
      const dirLabel = selectedHub === 'Mumbai' ? '→ MUMBAI' : selectedHub === 'Goa' ? '→ GOA' : '';
      return `${dirLabel ? dirLabel + ' · ' : ''}${activeStationObj.name.toUpperCase()} (${filteredTrains.length})`;
    }
    const dirLabel = selectedHub === 'Mumbai' ? 'TRAINS TO MUMBAI' : selectedHub === 'Goa' ? 'TRAINS TO GOA' : `${selectedHub.toUpperCase()} TRAINS`;
    return `${dirLabel} (${filteredTrains.length})`;
  }, [selectedHub, activeStationObj, filteredTrains.length]);

  const headingSubtitle = useMemo(() => {
    if (activeStationObj && !activeStationObj.code.startsWith('ALL_')) {
      if (selectedHub === 'Mumbai') return `Trains from Goa/Konkan arriving at ${activeStationObj.name}`;
      if (selectedHub === 'Goa') return `Trains from Mumbai/Konkan arriving at ${activeStationObj.name}`;
      return `Trains with scheduled halt at ${activeStationObj.name}`;
    }
    if (selectedHub === 'Mumbai') return 'Goa & Konkan trains heading to Mumbai';
    if (selectedHub === 'Goa') return 'Mumbai & Konkan trains heading to Goa';
    return activeHub?.description ?? 'Scheduled services';
  }, [selectedHub, activeStationObj, activeHub]);

  // Compute a contextual journey segment for a selected hub/station
  // Returns the from-stop and to-stop relevant to the user's selected context
  const getContextualSegment = useCallback(
    (train: Train) => {
      if (!selectedHub) return null;

      // When Mumbai is selected: show the Goa/Konkan start → Mumbai end segment
      if (selectedHub === 'Mumbai') {
        const targetCodes = selectedStationCode && selectedStationCode !== 'ALL_MUMBAI'
          ? new Set([selectedStationCode])
          : MUMBAI_STATION_CODES;
        const firstMumbaiIdx = firstMatchIndex(train, targetCodes);
        if (firstMumbaiIdx === -1) return null;
        // Find the first Konkan/Goa stop as the segment origin
        const firstKonkanIdx = firstMatchIndex(train, KONKAN_CODES);
        const segFromIdx = firstKonkanIdx !== -1 && firstKonkanIdx < firstMumbaiIdx ? firstKonkanIdx : 0;
        const fromStop = train.stops[segFromIdx];
        const toStop = train.stops[firstMumbaiIdx];
        if (!fromStop || !toStop) return null;
        return {
          fromCode: fromStop.stationCode,
          fromName: STATION_MAP[fromStop.stationCode]?.name ?? fromStop.stationCode,
          fromTime: fromStop.departureTime ?? fromStop.arrivalTime ?? '',
          fromDay: fromStop.dayOffset ?? 0,
          toCode: toStop.stationCode,
          toName: STATION_MAP[toStop.stationCode]?.name ?? toStop.stationCode,
          toTime: toStop.arrivalTime ?? toStop.departureTime ?? '',
          toDay: toStop.dayOffset ?? 0,
          direction: '→ Mumbai' as const,
          directionColor: '#1565C0' as const,
          directionBg: '#E3F2FD' as const,
        };
      }

      // When Goa is selected: show the Mumbai/Konkan start → Goa end segment
      if (selectedHub === 'Goa') {
        let toStop: typeof train.stops[0] | undefined;

        if (selectedStationCode && selectedStationCode !== 'ALL_GOA') {
          toStop = train.stops.find(s => s.stationCode === selectedStationCode);
        } else {
          // For ALL_GOA: if train terminates in Goa, use its destination stop (e.g. MAO or VSG)
          if (GOA_STATION_CODES.has(train.destinationStationCode)) {
            toStop = train.stops.find(s => s.stationCode === train.destinationStationCode);
          } else {
            // Otherwise prefer MAO (Madgaon Jn) or the last Goa stop on this train
            toStop = train.stops.find(s => s.stationCode === 'MAO')
              ?? [...train.stops].reverse().find(s => GOA_STATION_CODES.has(s.stationCode));
          }
        }

        if (!toStop) return null;

        // The segment starts from train's origin stop (Mumbai/Konkan side)
        const fromStop = train.stops[0];
        if (!fromStop || fromStop.stationCode === toStop.stationCode) return null;

        return {
          fromCode: fromStop.stationCode,
          fromName: STATION_MAP[fromStop.stationCode]?.name ?? fromStop.stationCode,
          fromTime: fromStop.departureTime ?? '',
          fromDay: fromStop.dayOffset ?? 0,
          toCode: toStop.stationCode,
          toName: STATION_MAP[toStop.stationCode]?.name ?? toStop.stationCode,
          toTime: toStop.arrivalTime ?? toStop.departureTime ?? '',
          toDay: toStop.dayOffset ?? 0,
          direction: '→ Goa' as const,
          directionColor: '#2E7D32' as const,
          directionBg: '#EBF5EB' as const,
        };
      }

      // For Sawantwadi / Ratnagiri: just highlight the halt
      if (selectedStationCode && !selectedStationCode.startsWith('ALL_')) {
        const haltStop = train.stops.find(s => s.stationCode === selectedStationCode);
        if (!haltStop) return null;
        return {
          fromCode: haltStop.stationCode,
          fromName: STATION_MAP[haltStop.stationCode]?.name ?? haltStop.stationCode,
          fromTime: haltStop.arrivalTime ?? haltStop.departureTime ?? '',
          fromDay: haltStop.dayOffset ?? 0,
          toCode: '',
          toName: '',
          toTime: haltStop.departureTime ?? '',
          toDay: haltStop.dayOffset ?? 0,
          direction: 'Halt' as const,
          directionColor: '#7B5E52' as const,
          directionBg: '#F5EDE8' as const,
        };
      }

      return null;
    },
    [selectedHub, selectedStationCode],
  );

  // Render a train card using the shared TrainCard component
  const renderExplorerCard = useCallback((train: Train) => {
    const segment = getContextualSegment(train) as TrainCardSegment | null;
    return (
      <TrainCard
        key={train.trainNumber}
        train={train}
        onPress={handleTrainPress}
        segment={segment}
      />
    );
  }, [getContextualSegment, handleTrainPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Main Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.appName}>Konkan Train Planner</Text>
          <Text style={styles.appTagline}>Explore Konkan trains</Text>
          <Text style={styles.appSubTagline}>Mumbai • Konkan • Goa</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="train" size={26} color="#9E3C1B" />
        </View>
      </View>

      {/* Train Feed */}
      <FlatList
        data={filteredTrains}
        keyExtractor={item => `feed-train-${item.trainNumber}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        ListHeaderComponent={
          <View>
            {/* Single Search Bar Button */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => setSearchModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={18} color="#8A4A1C" style={styles.searchBarIcon} />
              <Text style={styles.searchBarPlaceholder}>
                Search train, station or destination
              </Text>
              <View style={styles.searchBarShortcut}>
                <Ionicons name="options-outline" size={14} color="#8A4A1C" />
              </View>
            </TouchableOpacity>

            {/* Compact Date Control */}
            <View style={styles.dateBar}>
              <View style={styles.dateLeft}>
                <Text style={styles.dateOverline}>TODAY</Text>
                <Text style={styles.dateTitle}>17 Sep 2026</Text>
              </View>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setDateModalVisible(prev => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={16} color="#9E3C1B" />
                <Text style={styles.datePickerBtnText}>Select Date</Text>
              </TouchableOpacity>
            </View>

            {/* Expandable Date Selector */}
            {dateModalVisible && (
              <View style={styles.dateSelectorWrap}>
                <DateSelector
                  selectedDate={selectedDate}
                  onSelectDate={d => {
                    setSelectedDate(d);
                    setDateModalVisible(false);
                  }}
                  onOpenCalendar={() => {}}
                />
              </View>
            )}

            {/* Major Corridor Hub Chips */}
            <View style={styles.chipsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CORRIDOR_HUBS.map(hub => {
                  const isActive = selectedHub === hub.id;
                  return (
                    <TouchableOpacity
                      key={hub.id}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => handleHubSelect(hub.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={hub.icon}
                        size={14}
                        color={isActive ? '#FFFFFF' : '#8A4A1C'}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                        {hub.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Dynamic Station Sub-Menu (Appears when a Hub is selected) */}
            {activeHub && activeHub.stations.length > 0 && (
              <View style={styles.stationMenuContainer}>
                <View style={styles.stationMenuHeader}>
                  <Text style={styles.stationMenuOverline}>
                    {activeHub.label.toUpperCase()} STATIONS
                  </Text>
                  <Text style={styles.stationMenuTip}>Tap station to filter</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stationMenuScroll}>
                  {activeHub.stations.map(stn => {
                    const isStnActive = selectedStationCode === stn.code;
                    return (
                      <TouchableOpacity
                        key={stn.code}
                        style={[styles.stationChip, isStnActive && styles.stationChipActive]}
                        onPress={() => setSelectedStationCode(stn.code)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.stationChipText, isStnActive && styles.stationChipTextActive]}>
                          {stn.shortName}
                        </Text>
                        {stn.tag && (
                          <View style={[styles.stationTagBadge, isStnActive && styles.stationTagBadgeActive]}>
                            <Text style={[styles.stationTagBadgeText, isStnActive && styles.stationTagBadgeTextActive]}>
                              {stn.tag}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Timing Sort & Filter Chips */}
            <View style={styles.timingSection}>
              <View style={styles.timingHeaderRow}>
                <Text style={styles.sectionOverline}>DEPARTURE TIME</Text>
                <TouchableOpacity
                  style={styles.sortTriggerBtn}
                  onPress={() => setSortModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="swap-vertical" size={13} color="#9E3C1B" />
                  <Text style={styles.sortTriggerText}>Sort: {sortOption}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timingScroll}>
                {(
                  [
                    { id: 'All', label: 'All Times' },
                    { id: 'Early Morning', label: '🌅 04:00 - 08:00' },
                    { id: 'Morning', label: '☀️ 08:00 - 12:00' },
                    { id: 'Afternoon', label: '🌤️ 12:00 - 17:00' },
                    { id: 'Evening', label: '🌙 17:00 - 21:00' },
                    { id: 'Night', label: '🌌 21:00 - 04:00' },
                  ] as { id: TimingFilter; label: string }[]
                ).map(t => {
                  const isActive = timingFilter === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.timingChip, isActive && styles.timingChipActive]}
                      onPress={() => setTimingFilter(t.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.timingChipText, isActive && styles.timingChipTextActive]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Section Divider & All Trains Header */}
            <View style={styles.allTrainsHeadingRow}>
              <Text style={styles.sectionTitle}>{headingTitle}</Text>
              {/* <Text style={styles.resultsMeta}>
                {timingFilter !== 'All' ? `${timingFilter} · ${filteredTrains.length} trains` : headingSubtitle}
              </Text> */}
            </View>
          </View>
        }
        renderItem={({ item }) => renderExplorerCard(item)}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="train-outline" size={44} color="#A8998E" />
            <Text style={styles.emptyTitle}>No trains matching filters</Text>
            <Text style={styles.emptySubtitle}>Try changing the timing filter or category</Text>
          </View>
        }
      />

      {/* Unified Search & Journey Modal */}
      <SearchJourneyModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectTrain={handleTrainPress}
        onSelectStation={handleSelectStation}
      />

      {/* Sort Options Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sortOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.sortSheet}>
            <Text style={styles.sortSheetTitle}>Sort Trains By</Text>
            {(['Departure time', 'Arrival time', 'Journey duration'] as SortType[]).map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.sortOptionItem}
                onPress={() => {
                  setSortOption(opt);
                  setSortModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOption === opt && styles.sortOptionTextActive,
                  ]}
                >
                  {opt}
                </Text>
                {sortOption === opt && (
                  <Ionicons name="checkmark" size={18} color="#9E3C1B" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TrainsHomeScreen;

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
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FAF7F4',
  },
  headerTitles: {
    flex: 1,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: -0.4,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E3C1B',
    marginTop: 2,
  },
  appSubTagline: {
    fontSize: 12,
    color: '#7A6B63',
    marginTop: 1,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F7EFE8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE5DC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E8DED6',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  searchBarIcon: {
    marginRight: 10,
  },
  searchBarPlaceholder: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#A8998E',
  },
  searchBarShortcut: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F7EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginBottom: 12,
  },
  dateLeft: {},
  dateOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E3C1B',
    letterSpacing: 0.8,
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
    marginTop: 1,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCEFE9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  datePickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  dateSelectorWrap: {
    marginBottom: 12,
  },
  chipsContainer: {
    marginBottom: 12,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  categoryChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C4E46',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stationMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    padding: 10,
    marginBottom: 12,
  },
  stationMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  stationMenuOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E3C1B',
    letterSpacing: 0.8,
  },
  stationMenuTip: {
    fontSize: 11,
    color: '#8A7A70',
  },
  stationMenuScroll: {
    gap: 8,
  },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F7EFE8',
    borderWidth: 1,
    borderColor: '#EFE5DC',
    gap: 6,
  },
  stationChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  stationChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3E38',
  },
  stationChipTextActive: {
    color: '#FFFFFF',
  },
  stationTagBadge: {
    backgroundColor: '#EBE2D8',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  stationTagBadgeActive: {
    backgroundColor: '#7A2C12',
  },
  stationTagBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A4A1C',
  },
  stationTagBadgeTextActive: {
    color: '#FDEEE9',
  },
  timingSection: {
    marginBottom: 16,
  },
  timingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A7A70',
    letterSpacing: 0.8,
  },
  sortTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortTriggerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E3C1B',
  },
  timingScroll: {
    gap: 6,
  },
  timingChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F0EB',
  },
  timingChipActive: {
    backgroundColor: '#FCEFE9',
    borderWidth: 1,
    borderColor: '#9E3C1B',
  },
  timingChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C4E46',
  },
  timingChipTextActive: {
    color: '#9E3C1B',
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: 0.8,
  },
  allTrainsHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 4,
  },
  resultsMeta: {
    fontSize: 12,
    color: '#7A6B63',
  },
  trainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  trainCardAlt: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#D97706',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberBadge: {
    backgroundColor: '#F5F0EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  numberBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A4A1C',
    letterSpacing: 0.5,
  },
  nameCol: {
    flex: 1,
  },
  trainName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C201A',
  },
  routeSubtitle: {
    fontSize: 13,
    color: '#7A6B63',
    marginTop: 2,
  },
  timingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F4',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  timeCol: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A7A70',
    letterSpacing: 0.6,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C201A',
    marginTop: 2,
  },
  dayOffsetSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  durationMiddle: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C4E46',
  },
  arrowTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    marginVertical: 3,
    justifyContent: 'center',
  },
  arrowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D1C7BD',
  },
  arrowIcon: {
    backgroundColor: '#FAF7F4',
    paddingHorizontal: 2,
  },
  journeyTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  journeyTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // ── Contextual Segment Banner styles ──────────────────────────
  segmentBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  segmentDirectionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  segmentDirectionText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentStop: {
    flex: 1,
  },
  segmentStopCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C201A',
    letterSpacing: 0.4,
  },
  segmentStopTime: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C201A',
    marginTop: 1,
  },
  segmentDayTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  segmentStopName: {
    fontSize: 10,
    color: '#7A6B63',
    marginTop: 2,
  },
  segmentArrow: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  // ── Halt Banner styles ──────────────────────────────────────────
  haltBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF4F0',
    borderWidth: 1,
    borderColor: '#F2D7CD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 10,
  },
  haltBannerText: {
    fontSize: 12,
    color: '#5C4E46',
    flex: 1,
  },
  haltBold: {
    fontWeight: '800',
    color: '#9E3C1B',
  },
  altNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
    marginBottom: 10,
  },
  altNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
  goaNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5EB',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
    marginBottom: 10,
  },
  goaNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F2ECE6',
  },
  runsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3E38',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A7A70',
    marginTop: 4,
  },
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  sortSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C201A',
    marginBottom: 14,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0EB',
  },
  sortOptionText: {
    fontSize: 15,
    color: '#4A3E38',
  },
  sortOptionTextActive: {
    fontWeight: '700',
    color: '#9E3C1B',
  },
});
