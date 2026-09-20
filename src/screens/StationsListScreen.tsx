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

import { useCorridorStore } from '../store/corridorStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type StationsNavProp = StackNavigationProp<RootStackParamList>;

// ─── Corridor Station Model ───────────────────────────────────────────────────
interface CorridorStation {
  code: string;
  name: string;
  tier: 1 | 2 | 3; // 1=Mumbai, 2=Konkan intermediate, 3=Goa
  state: 'Maharashtra' | 'Goa' | 'Karnataka';
  isMajor: boolean;
  distanceFromMumbai?: number; // km
  tagline?: string;
  nearbyDestinations?: string;
  transitAccess?: string;
}

// ─── Full Corridor Route Data ─────────────────────────────────────────────────
// Ordered from Mumbai → Goa. isMajor=true for featured stations.
const CORRIDOR_STATIONS: CorridorStation[] = [
  // TIER 1 — Mumbai Boarding
  {
    code: 'CSMT',
    name: 'Mumbai CSMT',
    tier: 1,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 0,
    tagline: 'UNESCO terminus; origin for Konkan Kanya, Mandovi, Tejas & Vande Bharat',
    nearbyDestinations: 'Colaba, Fort, Marine Drive, Nariman Point',
    transitAccess: 'Direct hub for Central & Harbour suburban locals, pre-paid taxis, BEST buses.',
  },
  {
    code: 'DR',
    name: 'Dadar',
    tier: 1,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 6,
    tagline: 'Premier interchange linking Central & Western lines; origin for Tutari Express',
    nearbyDestinations: 'Shivaji Park, Prabhadevi, Worli, Lower Parel',
    transitAccess: 'Fast trains on both Western & Central lines, direct expressway access.',
  },
  {
    code: 'TNA',
    name: 'Thane',
    tier: 1,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 34,
    tagline: 'Key suburban halt for Mumbai-metropolitan travelers boarding Konkan trains',
    nearbyDestinations: 'Thane city, Ghodbunder Road, Mulund, Airoli',
    transitAccess: 'Both Central & Trans-Harbour suburban lines, city autos and cabs.',
  },
  {
    code: 'PNVL',
    name: 'Panvel',
    tier: 1,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 59,
    tagline: 'Gateway junction where ALL Konkan corridor trains halt; ideal for Navi Mumbai',
    nearbyDestinations: 'Navi Mumbai, Kharghar, Belapur, Vashi, Pune Expressway link',
    transitAccess: 'Harbour Line locals, state buses to Pune, NH48 / Mumbai-Pune Expressway.',
  },
  // TIER 2 — Konkan Intermediate Key Stops
  {
    code: 'RN',
    name: 'Roha',
    tier: 2,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 98,
    tagline: 'First major Konkan Railway station after Mumbai-Goa split',
    nearbyDestinations: 'Murud-Janjira (50 km), Shrivardhan (50 km)',
    transitAccess: 'State bus connections toward Alibag and Konkan coast.',
  },
  {
    code: 'MGN',
    name: 'Mangaon',
    tier: 2,
    state: 'Maharashtra',
    isMajor: false,
    distanceFromMumbai: 123,
    tagline: 'Coastal Konkan halt in Raigad district',
  },
  {
    code: 'KHED',
    name: 'Khed',
    tier: 2,
    state: 'Maharashtra',
    isMajor: false,
    distanceFromMumbai: 173,
    tagline: 'Scenic station in Ratnagiri district near Chiplun lakes',
  },
  {
    code: 'CHI',
    name: 'Chiplun',
    tier: 2,
    state: 'Maharashtra',
    isMajor: false,
    distanceFromMumbai: 199,
    tagline: 'Temple town halt on the scenic Vashishti river estuary',
    nearbyDestinations: 'Parshuram Bhumi Temple, Vashishti Estuary',
  },
  {
    code: 'RN1',
    name: 'Ratnagiri',
    tier: 2,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 259,
    tagline: 'Key midpoint halt; Alphonso mango region with road connections inland',
    nearbyDestinations: 'Ganpatipule (25 km), Ratnadurg Fort, Bhatye Beach',
    transitAccess: 'State buses, cabs to beach areas and Ganpatipule from station.',
  },
  {
    code: 'RJR',
    name: 'Rajapur Road',
    tier: 2,
    state: 'Maharashtra',
    isMajor: false,
    distanceFromMumbai: 305,
    tagline: 'Junction town halt near Rajapur coastal town',
  },
  {
    code: 'VBW',
    name: 'Vaibhavwadi Road',
    tier: 2,
    state: 'Maharashtra',
    isMajor: false,
    distanceFromMumbai: 333,
    tagline: 'Konkan halt surrounded by dense green ghats and valleys',
  },
  {
    code: 'KKW',
    name: 'Kankavli',
    tier: 2,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 365,
    tagline: 'Commercial town halt; useful alternative boarding point for trains to Mumbai',
    nearbyDestinations: 'Vengurla (30 km), Deobag Beach, Tondavali Beach',
    transitAccess: 'Shared auto and local buses between Kankavli and Vengurla.',
  },
  {
    code: 'SIND',
    name: 'Sindhudurg',
    tier: 2,
    state: 'Maharashtra',
    isMajor: false,
    distanceFromMumbai: 388,
    tagline: 'Historic coastal fort district halt in Sindhudurg district',
  },
  {
    code: 'KUDL',
    name: 'Kudal',
    tier: 2,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 405,
    tagline: 'Major Sindhudurg district halt; last significant town before Goa border',
    nearbyDestinations: 'Vengurla (18 km), Shiroda (14 km)',
    transitAccess: 'Local autos and buses toward Vengurla and Shiroda coast.',
  },
  {
    code: 'SWV',
    name: 'Sawantwadi Road',
    tier: 2,
    state: 'Maharashtra',
    isMajor: true,
    distanceFromMumbai: 426,
    tagline: 'Final major Maharashtra halt & feeder hub to North Goa via road (38 km)',
    nearbyDestinations: 'Sawantwadi town (6 km), Patradevi Goa border (10 km)',
    transitAccess: 'Kadamba & MSRTC buses to Mapusa/Pernem every 20–30 min from ST stand.',
  },
  // TIER 3 — Goa Arrival Stations
  {
    code: 'PER',
    name: 'Pernem',
    tier: 3,
    state: 'Goa',
    isMajor: true,
    distanceFromMumbai: 456,
    tagline: 'First Goa station; nearest railhead to Mopa International Airport & North beaches',
    nearbyDestinations: 'Mopa Airport (14 km), Arambol (12 km), Mandrem (8 km), Morjim (10 km)',
    transitAccess: 'Taxis and Kadamba buses from station to Arambol, Mandrem and airport.',
  },
  {
    code: 'THVM',
    name: 'Thivim',
    tier: 3,
    state: 'Goa',
    isMajor: true,
    distanceFromMumbai: 472,
    tagline: 'Prime North Goa gateway for Mapusa, Calangute, Baga & Panaji',
    nearbyDestinations: 'Mapusa (10 km), Calangute (18 km), Baga (19 km), Anjuna (21 km), Panaji (23 km)',
    transitAccess: 'Pre-paid taxis, autos and Kadamba buses to Mapusa & Panaji right outside.',
  },
  {
    code: 'KRMI',
    name: 'Karmali',
    tier: 3,
    state: 'Goa',
    isMajor: true,
    distanceFromMumbai: 487,
    tagline: 'Closest railhead to capital Panaji and Old Goa churches',
    nearbyDestinations: 'Old Goa (3 km), Panaji (12 km), Miramar (15 km), Dona Paula (18 km)',
    transitAccess: 'Quick 20-min taxi or bus along NH748 directly into Panaji central.',
  },
  {
    code: 'MAO',
    name: 'Madgaon',
    tier: 3,
    state: 'Goa',
    isMajor: true,
    distanceFromMumbai: 514,
    tagline: 'Largest Goa junction; connecting Konkan Railway with South Western Railway',
    nearbyDestinations: 'Colva (8 km), Benaulim (10 km), Palolem (36 km), Margao city (2 km)',
    transitAccess: 'Pre-paid taxi booths, state transport terminal, auto stands right outside.',
  },
  // Below Goa (Karwar, etc.)
  {
    code: 'CNO',
    name: 'Canacona',
    tier: 3,
    state: 'Goa',
    isMajor: false,
    distanceFromMumbai: 543,
    tagline: 'Southernmost Goa halt; gateway to Palolem, Patnem, Agonda beaches',
    nearbyDestinations: 'Palolem Beach (3 km), Patnem (4 km), Agonda (9 km)',
    transitAccess: 'Local autos and taxis to Palolem and Patnem beaches in under 10 minutes.',
  },
  {
    code: 'KAWR',
    name: 'Karwar',
    tier: 3,
    state: 'Karnataka',
    isMajor: false,
    distanceFromMumbai: 575,
    tagline: 'First Karnataka station; scenic coastal town near Goa-Karnataka border',
    nearbyDestinations: 'Karwar Beach, INS Chapal War Memorial, Devbagh Island',
    transitAccess: 'Local auto rickshaws and shared cabs to beach and fort areas.',
  },
];

// Stations to show in the vertical route map (featured only)
const MAP_STATIONS = CORRIDOR_STATIONS.filter(s => s.isMajor);

// ─── Tier Labels & Colors ─────────────────────────────────────────────────────
const TIER_META = {
  1: { label: 'Mumbai', dotColor: '#1565C0', dotBg: '#E3F0FC', labelColor: '#1565C0' },
  2: { label: 'Konkan', dotColor: '#7A4A1C', dotBg: '#F5EDE6', labelColor: '#7A4A1C' },
  3: { label: 'Goa', dotColor: '#1E824C', dotBg: '#EBF7EE', labelColor: '#1E824C' },
};

type ViewMode = 'MAP' | 'LIST';
type ListFilter = 'ALL' | 'TIER1' | 'TIER2' | 'TIER3';

export const StationsListScreen: React.FC = () => {
  const navigation = useNavigation<StationsNavProp>();
  const insets = useSafeAreaInsets();
  const { selectedHub } = useCorridorStore();

  const [viewMode, setViewMode] = useState<ViewMode>('MAP');
  const [listFilter, setListFilter] = useState<ListFilter>('ALL');
  const [query, setQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const q = query.toLowerCase().trim();

  const filteredList = useMemo(() => {
    let list = CORRIDOR_STATIONS;
    if (listFilter === 'TIER1') list = list.filter(s => s.tier === 1);
    else if (listFilter === 'TIER2') list = list.filter(s => s.tier === 2);
    else if (listFilter === 'TIER3') list = list.filter(s => s.tier === 3);
    if (!q) return list;
    return list.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        (s.tagline && s.tagline.toLowerCase().includes(q)) ||
        (s.nearbyDestinations && s.nearbyDestinations.toLowerCase().includes(q)),
    );
  }, [q, listFilter]);

  const selectedStationData = selectedStation
    ? CORRIDOR_STATIONS.find(s => s.code === selectedStation)
    : null;

  const handleStationPress = (code: string) => {
    if (viewMode === 'MAP') {
      setSelectedStation(prev => (prev === code ? null : code));
    } else {
      navigation.navigate('StationDetails', { stationCode: code });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Konkan Corridor</Text>
          <Text style={styles.subtitle}>Mumbai ↔ Goa railway route map & station guide</Text>
        </View>
        {/* View Mode Toggle */}
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'MAP' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('MAP')}
            activeOpacity={0.8}
          >
            <Ionicons name="git-branch-outline" size={16} color={viewMode === 'MAP' ? '#FFFFFF' : '#6E5D53'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'LIST' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('LIST')}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={16} color={viewMode === 'LIST' ? '#FFFFFF' : '#6E5D53'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tier Legend ── */}
      <View style={styles.legendRow}>
        {([1, 2, 3] as const).map(tier => (
          <View key={tier} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TIER_META[tier].dotColor }]} />
            <Text style={[styles.legendLabel, { color: TIER_META[tier].labelColor }]}>
              {TIER_META[tier].label}
            </Text>
          </View>
        ))}
        <Text style={styles.legendHint}>Tap a station for details</Text>
      </View>

      {/* ── Search (List mode only) ── */}
      {viewMode === 'LIST' && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8A7A71" />
          <TextInput
            style={styles.input}
            placeholder="Search station, code or area..."
            placeholderTextColor="#A0938C"
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
          />
        </View>
      )}

      {/* ── List Filter Chips (List mode only) ── */}
      {viewMode === 'LIST' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterRow}
        >
          {(
            [
              { id: 'ALL', label: 'All Stations' },
              { id: 'TIER1', label: '🏙 Mumbai' },
              { id: 'TIER2', label: '🌊 Konkan' },
              { id: 'TIER3', label: '🌴 Goa' },
            ] as { id: ListFilter; label: string }[]
          ).map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, listFilter === f.id && styles.filterChipActive]}
              onPress={() => setListFilter(f.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, listFilter === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {viewMode === 'MAP' ? (
          <CorridorMap
            stations={MAP_STATIONS}
            selectedStation={selectedStation}
            selectedStationData={selectedStationData ?? null}
            onPress={handleStationPress}
            onNavigate={code => navigation.navigate('StationDetails', { stationCode: code })}
          />
        ) : (
          <ListView
            stations={filteredList}
            onPress={code => navigation.navigate('StationDetails', { stationCode: code })}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Corridor Map Sub-Component ───────────────────────────────────────────────
interface CorridorMapProps {
  stations: CorridorStation[];
  selectedStation: string | null;
  selectedStationData: CorridorStation | null;
  onPress: (code: string) => void;
  onNavigate: (code: string) => void;
}

const CorridorMap: React.FC<CorridorMapProps> = ({
  stations,
  selectedStation,
  selectedStationData,
  onPress,
  onNavigate,
}) => {
  // Group consecutive same-tier stations together for section headers
  let lastTier: number | null = null;

  return (
    <View style={styles.mapContainer}>
      {/* Route Label: Mumbai end */}
      <View style={styles.mapEndLabel}>
        <View style={styles.mapEndDot} />
        <Text style={styles.mapEndText}>MUMBAI</Text>
        <View style={styles.mapEndLine} />
      </View>

      {stations.map((station, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === stations.length - 1;
        const tier = station.tier;
        const meta = TIER_META[tier];
        const isSelected = selectedStation === station.code;
        const showTierHeader = tier !== lastTier;
        lastTier = tier;

        return (
          <View key={station.code}>
            {/* Tier Section Header */}
            {showTierHeader && tier !== 1 && (
              <View style={styles.tierDivider}>
                <View style={styles.tierDividerLine} />
                <Text style={[styles.tierDividerLabel, { color: meta.labelColor }]}>
                  ↓ {tier === 2 ? 'KONKAN RAILWAY' : 'GOA'}
                </Text>
                <View style={styles.tierDividerLine} />
              </View>
            )}

            <TouchableOpacity
              style={styles.mapStationRow}
              onPress={() => onPress(station.code)}
              activeOpacity={0.75}
            >
              {/* Left: Distance label */}
              <View style={styles.mapDistanceCol}>
                {station.distanceFromMumbai !== undefined && (
                  <Text style={styles.mapDistanceText}>{station.distanceFromMumbai} km</Text>
                )}
              </View>

              {/* Center: Track line + Dot */}
              <View style={styles.mapTrackCol}>
                {!isFirst && <View style={[styles.trackLine, { backgroundColor: meta.dotColor + '44' }]} />}
                <View
                  style={[
                    styles.stationDot,
                    { backgroundColor: meta.dotBg, borderColor: meta.dotColor },
                    isSelected && { backgroundColor: meta.dotColor, transform: [{ scale: 1.25 }] },
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="location" size={14} color="#FFFFFF" />
                  )}
                </View>
                {!isLast && <View style={[styles.trackLine, { backgroundColor: meta.dotColor + '44' }]} />}
              </View>

              {/* Right: Station info */}
              <View style={[styles.mapStationInfo, isSelected && styles.mapStationInfoSelected]}>
                <View style={styles.mapStationTitleRow}>
                  <Text style={[styles.mapStationName, isSelected && { color: meta.dotColor }]}>
                    {station.name}
                  </Text>
                  <View style={[styles.mapCodeBadge, { backgroundColor: meta.dotBg }]}>
                    <Text style={[styles.mapCodeText, { color: meta.dotColor }]}>{station.code}</Text>
                  </View>
                </View>
                <Text style={styles.mapStateName}>{station.state}</Text>

                {/* Expanded detail panel */}
                {isSelected && station.tagline && (
                  <View style={styles.mapExpandedPanel}>
                    <Text style={styles.mapTagline}>{station.tagline}</Text>

                    {station.nearbyDestinations && (
                      <View style={styles.mapDetailRow}>
                        <Ionicons name="navigate-outline" size={12} color="#7A4A1C" />
                        <Text style={styles.mapDetailText}>{station.nearbyDestinations}</Text>
                      </View>
                    )}

                    {station.transitAccess && (
                      <View style={styles.mapDetailRow}>
                        <Ionicons name="bus-outline" size={12} color="#1565C0" />
                        <Text style={styles.mapDetailText}>{station.transitAccess}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.mapViewBtn}
                      onPress={() => onNavigate(station.code)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.mapViewBtnText}>View Station Details</Text>
                      <Ionicons name="chevron-forward" size={13} color="#9E3C1B" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Route Label: Goa end */}
      <View style={styles.mapEndLabel}>
        <View style={styles.mapEndLine} />
        <View style={[styles.mapEndDot, { backgroundColor: '#1E824C' }]} />
        <Text style={[styles.mapEndText, { color: '#1E824C' }]}>SOUTH GOA & KARNATAKA</Text>
      </View>

      {/* Booking Tier Guide Card */}
      <View style={styles.tierGuideCard}>
        <Text style={styles.tierGuideTitle}>Smart Booking Guide</Text>
        <Text style={styles.tierGuideSubtitle}>Best stations to book Tatkal from for each journey type</Text>

        <View style={styles.tierGuideRow}>
          <View style={[styles.tierGuideBadge, { backgroundColor: '#E3F0FC' }]}>
            <Text style={[styles.tierGuideBadgeText, { color: '#1565C0' }]}>Tier 1</Text>
          </View>
          <Text style={styles.tierGuideDesc}>Mumbai CSMT · Dadar · Thane · Panvel</Text>
        </View>
        <Text style={styles.tierGuideNote}>All major Mumbai departure hubs</Text>

        <View style={[styles.tierGuideRow, { marginTop: 10 }]}>
          <View style={[styles.tierGuideBadge, { backgroundColor: '#F5EDE6' }]}>
            <Text style={[styles.tierGuideBadgeText, { color: '#7A4A1C' }]}>Tier 2</Text>
          </View>
          <Text style={styles.tierGuideDesc}>Ratnagiri · Kankavli · Kudal · Sawantwadi</Text>
        </View>
        <Text style={styles.tierGuideNote}>Intermediate boarding — useful when direct quota is full</Text>

        <View style={[styles.tierGuideRow, { marginTop: 10 }]}>
          <View style={[styles.tierGuideBadge, { backgroundColor: '#EBF7EE' }]}>
            <Text style={[styles.tierGuideBadgeText, { color: '#1E824C' }]}>Tier 3</Text>
          </View>
          <Text style={styles.tierGuideDesc}>Pernem · Thivim · Karmali · Madgaon</Text>
        </View>
        <Text style={styles.tierGuideNote}>Direct Goa arrival stations — core destination hubs</Text>
      </View>
    </View>
  );
};

// ─── List View Sub-Component ──────────────────────────────────────────────────
interface ListViewProps {
  stations: CorridorStation[];
  onPress: (code: string) => void;
}

const ListView: React.FC<ListViewProps> = ({ stations, onPress }) => {
  if (stations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={36} color="#A8998E" />
        <Text style={styles.emptyTitle}>No matching stations</Text>
        <Text style={styles.emptySubtitle}>Try searching "Thivim", "Panvel", "Madgaon", or a station code.</Text>
      </View>
    );
  }

  return (
    <View>
      {stations.map(station => {
        const meta = TIER_META[station.tier];
        return (
          <TouchableOpacity
            key={station.code}
            style={[styles.listCard, station.isMajor && styles.listCardMajor]}
            onPress={() => onPress(station.code)}
            activeOpacity={0.7}
          >
            {/* Tier indicator bar */}
            <View style={[styles.listTierBar, { backgroundColor: meta.dotColor }]} />

            <View style={styles.listCardInner}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listStationName}>{station.name}</Text>
                <View style={styles.listCodeBadgeWrap}>
                  <View style={[styles.listCodeBadge, { backgroundColor: meta.dotBg }]}>
                    <Text style={[styles.listCodeText, { color: meta.dotColor }]}>{station.code}</Text>
                  </View>
                  {station.isMajor && (
                    <View style={styles.majorBadge}>
                      <Text style={styles.majorBadgeText}>★ Major</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={[styles.listStateTier, { color: meta.labelColor }]}>
                {station.state} · Tier {station.tier}
                {station.distanceFromMumbai !== undefined && ` · ${station.distanceFromMumbai} km from Mumbai`}
              </Text>

              {station.tagline && (
                <Text style={styles.listTagline} numberOfLines={2}>{station.tagline}</Text>
              )}

              {station.nearbyDestinations && (
                <View style={styles.listNearbyRow}>
                  <Ionicons name="navigate-outline" size={12} color="#7A4A1C" />
                  <Text style={styles.listNearbyText} numberOfLines={1}>
                    {station.nearbyDestinations}
                  </Text>
                </View>
              )}

              <View style={styles.listFooterRow}>
                <Text style={styles.listActionText}>View details</Text>
                <Ionicons name="chevron-forward" size={13} color="#9E3C1B" />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default StationsListScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 12,
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

  // View Mode Toggle
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0E8E0',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  viewModeBtn: {
    padding: 7,
    borderRadius: 8,
  },
  viewModeBtnActive: {
    backgroundColor: '#9E3C1B',
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  legendHint: {
    fontSize: 11,
    color: '#A8998E',
    marginLeft: 'auto' as any,
    fontStyle: 'italic',
  },

  // Search & Filters (List mode)
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2C201A',
  },
  filterRow: {
    marginBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  filterChipActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#5C4E46',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  scrollContent: {
    paddingTop: 4,
  },

  // ── MAP VIEW STYLES ──────────────────────────────────────────────────
  mapContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  mapEndLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingLeft: 80, // align with center track
  },
  mapEndDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1565C0',
  },
  mapEndLine: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E0',
  },
  mapEndText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1565C0',
    letterSpacing: 0.8,
  },

  tierDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingLeft: 60,
  },
  tierDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7DDD3',
  },
  tierDividerLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  mapStationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },

  mapDistanceCol: {
    width: 52,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 16,
  },
  mapDistanceText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#B0A097',
  },

  mapTrackCol: {
    width: 32,
    alignItems: 'center',
    paddingTop: 0,
  },
  trackLine: {
    width: 2,
    flex: 1,
    minHeight: 14,
  },
  stationDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapStationInfo: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 8,
    paddingBottom: 12,
    marginLeft: 4,
  },
  mapStationInfoSelected: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#EFEAE5',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  mapStationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  mapStationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },
  mapCodeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  mapCodeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  mapStateName: {
    fontSize: 11.5,
    color: '#8A7A71',
    marginTop: 1,
    fontWeight: '500',
  },

  // Expanded panel when station is selected
  mapExpandedPanel: {
    marginTop: 10,
  },
  mapTagline: {
    fontSize: 12.5,
    color: '#4A3B32',
    lineHeight: 17,
    marginBottom: 8,
  },
  mapDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 5,
  },
  mapDetailText: {
    fontSize: 11.5,
    color: '#6E5D53',
    lineHeight: 16,
    flex: 1,
  },
  mapViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F5EDE6',
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 4,
  },
  mapViewBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#9E3C1B',
  },

  // Smart Booking Tier Guide Card
  tierGuideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEAE5',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tierGuideTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C201A',
    marginBottom: 3,
  },
  tierGuideSubtitle: {
    fontSize: 12,
    color: '#8A7A71',
    marginBottom: 14,
    lineHeight: 17,
  },
  tierGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  tierGuideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 52,
    alignItems: 'center',
  },
  tierGuideBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tierGuideDesc: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2C201A',
    flex: 1,
  },
  tierGuideNote: {
    fontSize: 11,
    color: '#8A7A71',
    marginLeft: 62,
    marginBottom: 2,
    fontStyle: 'italic',
  },

  // ── LIST VIEW STYLES ──────────────────────────────────────────────────
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEAE5',
    overflow: 'hidden',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  listCardMajor: {
    borderColor: '#E0D4C8',
  },
  listTierBar: {
    width: 4,
  },
  listCardInner: {
    flex: 1,
    padding: 14,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  listStationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C201A',
    flex: 1,
  },
  listCodeBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  listCodeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  listCodeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  majorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#FEF8E7',
    borderWidth: 1,
    borderColor: '#F9E4B5',
  },
  majorBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#92540C',
  },
  listStateTier: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 5,
  },
  listTagline: {
    fontSize: 12.5,
    color: '#6E5D53',
    lineHeight: 17,
    marginBottom: 5,
  },
  listNearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  listNearbyText: {
    fontSize: 11.5,
    color: '#7A6B63',
    flex: 1,
  },
  listFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E3C1B',
  },

  // Empty state
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
