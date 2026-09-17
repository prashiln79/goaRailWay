import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { AvailabilityItem } from '../types/Connection';
import { trainService } from '../services/trainService';
import { STATION_MAP } from '../data/stations';
import AvailabilityTable from '../components/AvailabilityTable';
import { RootStackParamList } from '../navigation/AppNavigator';

type AvailabilityRouteProp = RouteProp<RootStackParamList, 'Availability'>;
type AvailabilityNavProp = StackNavigationProp<RootStackParamList>;

export const AvailabilityScreen: React.FC = () => {
  const route = useRoute<AvailabilityRouteProp>();
  const navigation = useNavigation<AvailabilityNavProp>();
  const insets = useSafeAreaInsets();
  const { trainNumber, fromCode = 'LTT', toCode = 'THVM', date = 'Thu, 17 Sep 2026' } =
    route.params || {};

  const [train, setTrain] = useState<Train | null>(null);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);

  useEffect(() => {
    Promise.all([
      trainService.getTrain(trainNumber),
      trainService.getTrainAvailability(trainNumber),
    ]).then(([t, av]) => {
      setTrain(t);
      setAvailability(av);
    });
  }, [trainNumber]);

  const handleOpenIRCTC = () => {
    Linking.openURL('https://www.irctc.co.in/nget/train-search').catch(() => {});
  };

  const fromName = STATION_MAP[fromCode]?.name ?? fromCode;
  const toName = STATION_MAP[toCode]?.name ?? toCode;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#2C201A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Date Selector Pill */}
        <TouchableOpacity style={styles.dateSelector} activeOpacity={0.8}>
          <Ionicons name="calendar-outline" size={16} color="#8A4A1C" />
          <Text style={styles.dateText}>{date}</Text>
          <Ionicons name="chevron-down" size={16} color="#8A4A1C" />
        </TouchableOpacity>

        {/* Train Summary Card */}
        <View style={styles.trainCard}>
          <Text style={styles.trainTitle}>
            {trainNumber} {train?.name ?? 'Matsyagandha Express'}
          </Text>
          <Text style={styles.routeSubtitle}>
            {fromName} → {toName}
          </Text>

          {/* Feature Chips */}
          <View style={styles.featureChips}>
            <View style={styles.chip}>
              <Ionicons name="flash-outline" size={11} color="#8A4A1C" />
              <Text style={styles.chipText}>{train?.type ?? 'Express'}</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="repeat-outline" size={11} color="#8A4A1C" />
              <Text style={styles.chipText}>Daily</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="restaurant-outline" size={11} color="#8A4A1C" />
              <Text style={styles.chipText}>Pantry</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="shield-checkmark-outline" size={11} color="#8A4A1C" />
              <Text style={styles.chipText}>LHB</Text>
            </View>
          </View>
        </View>

        {/* Class Availability Matrix Table */}
        <AvailabilityTable items={availability} />

        {/* Disclaimer Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={18} color="#8A4A1C" />
          <Text style={styles.noticeText}>
            Availability changes frequently. Check IRCTC for latest status.
          </Text>
        </View>

        {/* Primary CTA: Check booking on IRCTC */}
        <TouchableOpacity
          style={styles.irctcButton}
          onPress={handleOpenIRCTC}
          activeOpacity={0.88}
        >
          <Text style={styles.irctcButtonText}>Check booking on IRCTC</Text>
          <Ionicons name="open-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Quick Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={18} color="#D97706" />
            <Text style={styles.tipsTitle}>Quick tips</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Tatkal quota opens 1 day before journey date (10:00 AM for AC, 11:00 AM for Non-AC).
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Check nearby stations for better availability (e.g. Panvel PNVL or Ratnagiri RN).
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Split your journey if direct tickets are waitlisted (try our Connections tab).
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Keep multiple train options ready before Tatkal booking window opens.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AvailabilityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C201A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEAE6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 14,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3B32',
  },
  trainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  trainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C201A',
  },
  routeSubtitle: {
    fontSize: 14,
    color: '#7A6B63',
    fontWeight: '500',
    marginTop: 4,
  },
  featureChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7EEE7',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    gap: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A4A1C',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#F2DFD5',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginVertical: 10,
  },
  noticeText: {
    fontSize: 12,
    color: '#7A4321',
    flex: 1,
    lineHeight: 16,
  },
  irctcButton: {
    backgroundColor: '#9E3C1B',
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  irctcButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginTop: 10,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  tipBullet: {
    fontSize: 14,
    color: '#8A7A71',
    marginRight: 8,
    lineHeight: 18,
  },
  tipText: {
    fontSize: 13,
    color: '#554238',
    flex: 1,
    lineHeight: 18,
  },
});
