import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  GOA_STATIONS_DATA,
  NEARBY_ALTERNATIVE_STATIONS_DATA,
  MUMBAI_STATIONS_DATA,
  GoaStationInfo,
  NearbyAlternativeStationInfo,
  MumbaiStationInfo,
} from '../data/stationAlternatives';
import { STATION_MAP } from '../data/stations';
import { RootStackParamList } from '../navigation/AppNavigator';

type StationDetailsRouteProp = RouteProp<RootStackParamList, 'StationDetails'>;
type StationDetailsNavProp = StackNavigationProp<RootStackParamList>;

export const StationDetailsScreen: React.FC = () => {
  const route = useRoute<StationDetailsRouteProp>();
  const navigation = useNavigation<StationDetailsNavProp>();
  const insets = useSafeAreaInsets();
  const { stationCode } = route.params;

  const [goaStation, setGoaStation] = useState<GoaStationInfo | null>(null);
  const [nearbyStation, setNearbyStation] = useState<NearbyAlternativeStationInfo | null>(null);
  const [mumbaiStation, setMumbaiStation] = useState<MumbaiStationInfo | null>(null);

  useEffect(() => {
    const goa = GOA_STATIONS_DATA.find(s => s.code === stationCode) ?? null;
    const nearby = NEARBY_ALTERNATIVE_STATIONS_DATA.find(s => s.code === stationCode) ?? null;
    const mumbai = MUMBAI_STATIONS_DATA.find(s => s.code === stationCode) ?? null;
    setGoaStation(goa);
    setNearbyStation(nearby);
    setMumbaiStation(mumbai);
  }, [stationCode]);

  const rawStation = STATION_MAP[stationCode];
  const stationName =
    goaStation?.name ?? nearbyStation?.name ?? mumbaiStation?.name ?? rawStation?.name ?? stationCode;

  const handleViewTrains = useCallback(() => {
    // Navigate to Trains tab to view journeys for this station
    navigation.navigate('MainTabs');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#2C201A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Station Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
      >
        {/* Main Station Identity Card */}
        <View style={styles.card}>
          <View style={styles.codeRow}>
            <Text style={styles.stationTitle}>{stationName}</Text>
            <View style={styles.codePill}>
              <Text style={styles.codePillText}>{stationCode}</Text>
            </View>
          </View>

          {/* Region or State Subtitle */}
          {goaStation && (
            <View style={styles.regionBadge}>
              <Ionicons name="leaf-outline" size={13} color="#1E824C" />
              <Text style={styles.regionBadgeText}>{goaStation.region}</Text>
            </View>
          )}

          {mumbaiStation && (
            <View style={styles.nearbyInfoBlock}>
              <Text style={styles.nearbyStateText}>{mumbaiStation.area}</Text>
              <View style={styles.altTag}>
                <Text style={styles.altTagText}>{mumbaiStation.type}</Text>
              </View>
            </View>
          )}

          {nearbyStation && (
            <View style={styles.nearbyInfoBlock}>
              <Text style={styles.nearbyStateText}>{nearbyStation.state}</Text>
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate-outline" size={13} color="#8A4A1C" />
                <Text style={styles.distanceBadgeText}>{nearbyStation.distanceLabel}</Text>
              </View>
              <View style={styles.altTag}>
                <Text style={styles.altTagText}>{nearbyStation.alternativeFor}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Primary CTA: View trains */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleViewTrains}
          activeOpacity={0.88}
        >
          <Ionicons name="train-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>View trains</Text>
        </TouchableOpacity>

        {/* Optional Secondary Information: Mumbai Station Details */}
        {mumbaiStation && (
          <View style={styles.infoSection}>
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="information-circle-outline" size={16} color="#8A4A1C" />
                <Text style={styles.sectionHeader}>Overview</Text>
              </View>
              <Text style={styles.bodyText}>{mumbaiStation.tagline}</Text>
            </View>

            {mumbaiStation.nearbyDestinations && (
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="location-outline" size={16} color="#8A4A1C" />
                  <Text style={styles.sectionHeader}>Nearby destinations</Text>
                </View>
                <Text style={styles.bodyText}>{mumbaiStation.nearbyDestinations}</Text>
              </View>
            )}

            {mumbaiStation.transitAccess && (
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="git-network-outline" size={16} color="#8A4A1C" />
                  <Text style={styles.sectionHeader}>Transit & connectivity</Text>
                </View>
                <Text style={styles.bodyText}>{mumbaiStation.transitAccess}</Text>
              </View>
            )}
          </View>
        )}

        {/* Optional Secondary Information: Goa Station Details */}
        {goaStation && (
          <View style={styles.infoSection}>
            {goaStation.nearbyDestinations && (
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="location-outline" size={16} color="#8A4A1C" />
                  <Text style={styles.sectionHeader}>Nearby destinations</Text>
                </View>
                <Text style={styles.bodyText}>{goaStation.nearbyDestinations}</Text>
              </View>
            )}

            {goaStation.roadAccess && (
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="car-outline" size={16} color="#8A4A1C" />
                  <Text style={styles.sectionHeader}>Approximate road access</Text>
                </View>
                <Text style={styles.bodyText}>{goaStation.roadAccess}</Text>
              </View>
            )}
          </View>
        )}

        {/* Optional Secondary Information: Nearby Station Road Transfer Details */}
        {nearbyStation && (
          <View style={styles.infoSection}>
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="bus-outline" size={16} color="#8A4A1C" />
                <Text style={styles.sectionHeader}>Continue to Goa by bus/taxi</Text>
              </View>
              <Text style={styles.bodyText}>
                {nearbyStation.roadTip ??
                  'Pre-paid taxis and state transport buses are available outside the station connecting directly to Goa.'}
              </Text>
              {nearbyStation.roadTravelTime && (
                <View style={styles.travelTimePill}>
                  <Ionicons name="time-outline" size={13} color="#8A4A1C" />
                  <Text style={styles.travelTimeText}>{nearbyStation.roadTravelTime}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StationDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4', // Warm cream background
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C201A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF', // Soft sand / ivory
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C201A',
    flex: 1,
  },
  codePill: {
    backgroundColor: '#F3EFEA',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  codePillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8A4A1C',
    letterSpacing: 0.5,
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EBF7EE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 5,
    marginTop: 4,
  },
  regionBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E824C',
  },
  nearbyInfoBlock: {
    marginTop: 4,
  },
  nearbyStateText: {
    fontSize: 14,
    color: '#7A6B63',
    fontWeight: '500',
    marginBottom: 6,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  distanceBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
  },
  altTag: {
    backgroundColor: '#EBF7EE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  altTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E824C',
  },
  primaryBtn: {
    backgroundColor: '#9E3C1B', // Terracotta accent
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#9E3C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoSection: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
  },
  bodyText: {
    fontSize: 13,
    color: '#554238',
    lineHeight: 19,
  },
  travelTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F2',
    borderWidth: 1,
    borderColor: '#F2DFD5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 10,
  },
  travelTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A4A1C',
  },
});
