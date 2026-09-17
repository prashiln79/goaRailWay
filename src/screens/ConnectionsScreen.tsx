import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ConnectionOption } from '../types/Connection';
import { MOCK_CONNECTIONS } from '../data/connections';
import ConnectionCard from '../components/ConnectionCard';
import { RootStackParamList } from '../navigation/AppNavigator';

type ConnectionsNavProp = StackNavigationProp<RootStackParamList>;

type TabOption = 'Best Options' | 'All Connections';

export const ConnectionsScreen: React.FC = () => {
  const navigation = useNavigation<ConnectionsNavProp>();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabOption>('Best Options');
  const [selectedOptionForModal, setSelectedOptionForModal] = useState<ConnectionOption | null>(null);

  const directOptions = MOCK_CONNECTIONS.filter(c => c.type === 'direct');
  const connectingOptions = MOCK_CONNECTIONS.filter(c => c.type === 'connecting');

  const displayedConnecting =
    activeTab === 'Best Options' ? connectingOptions.slice(0, 2) : connectingOptions;

  const handlePressTrain = (trainNumber: string) => {
    navigation.navigate('TrainDetails', { trainNumber });
  };

  const handleCheckBoth = (option: ConnectionOption) => {
    setSelectedOptionForModal(option);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Mumbai LTT → Thivim</Text>
          <Text style={styles.subtitle}>Thu, 17 Sep 2026</Text>
        </View>
      </View>

      {/* Tab Filter */}
      <View style={styles.tabContainer}>
        {(['Best Options', 'All Connections'] as TabOption[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Direct Journey Section */}
        {directOptions.map(option => (
          <ConnectionCard
            key={option.id}
            option={option}
            onPressDetails={handlePressTrain}
            onCheckAvailability={handleCheckBoth}
          />
        ))}

        {/* Connecting Journeys Section */}
        {displayedConnecting.map(option => (
          <ConnectionCard
            key={option.id}
            option={option}
            onPressDetails={handlePressTrain}
            onCheckAvailability={handleCheckBoth}
          />
        ))}

        {/* Strategy Hint Box */}
        <View style={styles.strategyBox}>
          <View style={styles.strategyTitleRow}>
            <Ionicons name="bulb-outline" size={18} color="#D97706" />
            <Text style={styles.strategyTitle}>Station-wise Booking Strategy</Text>
          </View>
          <Text style={styles.strategyText}>
            Separate journey segments may have separate quota availability. Often when Mumbai to Goa tickets are fully waitlisted, tickets to Ratnagiri or Kankavli remain available in Tatkal or General quota.
          </Text>
        </View>
      </ScrollView>

      {/* Segment Availability Breakdown Modal */}
      <Modal
        visible={selectedOptionForModal !== null}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Segment Booking Strategy</Text>
              <TouchableOpacity
                onPress={() => setSelectedOptionForModal(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color="#2C201A" />
              </TouchableOpacity>
            </View>

            {selectedOptionForModal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.strategySubheader}>
                  Try splitting your journey into 2 bookings:
                </Text>

                {selectedOptionForModal.segments.map((seg, idx) => (
                  <View key={seg.trainNumber} style={styles.modalSegmentCard}>
                    <View style={styles.segBadgeRow}>
                      <View style={styles.segBadge}>
                        <Text style={styles.segBadgeText}>Segment {idx + 1}</Text>
                      </View>
                      <View style={styles.availPill}>
                        <Text style={styles.availPillText}>{seg.availabilitySample ?? 'Available'}</Text>
                      </View>
                    </View>
                    <Text style={styles.segTrainName}>
                      {seg.trainNumber} {seg.trainName}
                    </Text>
                    <Text style={styles.segStations}>
                      {seg.fromStationCode} ({seg.departureTime}) → {seg.toStationCode} ({seg.arrivalTime})
                    </Text>
                    <Text style={styles.segDuration}>Duration: {seg.duration}</Text>
                  </View>
                ))}

                <View style={styles.disclaimerBox}>
                  <Ionicons name="shield-outline" size={16} color="#8A4A1C" />
                  <Text style={styles.disclaimerText}>
                    Separate journey segments have independent seat inventories. Booking two segments requires two PNRs. Ensure comfortable layover buffer for connecting trains.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCta}
                  onPress={() => {
                    setSelectedOptionForModal(null);
                    navigation.navigate('Availability', {
                      trainNumber: selectedOptionForModal.segments[0].trainNumber,
                    });
                  }}
                >
                  <Text style={styles.modalCtaText}>Check Segment 1 Availability</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ConnectionsScreen;

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
  headerTitles: {},
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C201A',
  },
  subtitle: {
    fontSize: 13,
    color: '#8A7A71',
    marginTop: 2,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#EFE7E1',
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A6B63',
  },
  tabButtonTextActive: {
    color: '#2C201A',
    fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 4,
  },
  strategyBox: {
    backgroundColor: '#FFF9F5',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3DEC6',
    marginTop: 6,
    marginBottom: 20,
  },
  strategyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  strategyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A4A1C',
  },
  strategyText: {
    fontSize: 13,
    color: '#6B584E',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C201A',
  },
  strategySubheader: {
    fontSize: 14,
    color: '#7A6B63',
    marginBottom: 12,
    fontWeight: '500',
  },
  modalSegmentCard: {
    backgroundColor: '#FAF7F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  segBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  segBadge: {
    backgroundColor: '#9E3C1B',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  segBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  availPill: {
    backgroundColor: '#EBF7EE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  availPillText: {
    color: '#1E824C',
    fontSize: 12,
    fontWeight: '700',
  },
  segTrainName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },
  segStations: {
    fontSize: 13,
    color: '#7A6B63',
    marginTop: 2,
  },
  segDuration: {
    fontSize: 12,
    color: '#A0938C',
    marginTop: 4,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7F2',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginVertical: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#8A4A1C',
    flex: 1,
    lineHeight: 16,
  },
  modalCta: {
    backgroundColor: '#9E3C1B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  modalCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
