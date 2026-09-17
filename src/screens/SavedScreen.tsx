import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSavedStore } from '../store/savedStore';
import { STATION_MAP } from '../data/stations';
import { TRAIN_MAP } from '../data/trains';
import { RootStackParamList } from '../navigation/AppNavigator';

type SavedNavProp = StackNavigationProp<RootStackParamList>;
type SavedTab = 'Routes' | 'Trains' | 'Connections';

export const SavedScreen: React.FC = () => {
  const navigation = useNavigation<SavedNavProp>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<SavedTab>('Routes');

  const {
    savedRoutes,
    savedTrains,
    savedConnections,
    toggleRouteFavorite,
    toggleTrainFavorite,
  } = useSavedStore();

  const handleRoutePress = (_fromCode: string, _toCode: string) => {
    // Navigate to Connections or Train list
    navigation.navigate('Connections');
  };

  const handleTrainPress = (trainNumber: string) => {
    navigation.navigate('TrainDetails', { trainNumber });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabsRow}>
        {(['Routes', 'Trains', 'Connections'] as SavedTab[]).map(tab => {
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
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Saved Routes */}
        {activeTab === 'Routes' && (
          <View>
            {savedRoutes.map(item => {
              const fromName = STATION_MAP[item.fromStationCode]?.name ?? item.fromStationCode;
              const toName = STATION_MAP[item.toStationCode]?.name ?? item.toStationCode;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.savedCard}
                  onPress={() => handleRoutePress(item.fromStationCode, item.toStationCode)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.iconCircleBlue}>
                      <Ionicons name="calendar-outline" size={18} color="#2563EB" />
                    </View>
                    <View style={styles.routeDetails}>
                      <Text style={styles.cardTitle}>
                        {fromName} → {toName}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {item.label ?? 'Frequently used route'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleRouteFavorite(item.fromStationCode, item.toStationCode)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={item.isFavorite ? 'star' : 'star-outline'}
                      size={20}
                      color={item.isFavorite ? '#D97706' : '#C4B7AF'}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Saved Trains */}
        {activeTab === 'Trains' && (
          <View>
            {savedTrains.map(item => {
              const train = TRAIN_MAP[item.trainNumber];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.savedCard}
                  onPress={() => handleTrainPress(item.trainNumber)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.iconCircleRed}>
                      <Ionicons name="train" size={18} color="#DC2626" />
                    </View>
                    <View style={styles.routeDetails}>
                      <Text style={styles.cardTitle}>
                        {train?.name ?? 'Matsyagandha Express'}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        #{item.trainNumber} · {train?.type ?? 'Express'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleTrainFavorite(item.trainNumber)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={item.isFavorite ? 'star' : 'star-outline'}
                      size={20}
                      color={item.isFavorite ? '#D97706' : '#C4B7AF'}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Saved Connections */}
        {activeTab === 'Connections' && (
          <View>
            {savedConnections.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.savedCard}
                onPress={() => navigation.navigate('Connections')}
                activeOpacity={0.75}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.iconCircleOrange}>
                    <Ionicons name="git-branch-outline" size={18} color="#D97706" />
                  </View>
                  <View style={styles.routeDetails}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>
                      Via {STATION_MAP[item.viaStationCode]?.name ?? item.viaStationCode} · 2 trains
                    </Text>
                  </View>
                </View>

                <Ionicons name="star" size={20} color="#D97706" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom Help Tip */}
        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={18} color="#8A4A1C" />
          <View style={styles.hintContent}>
            <Text style={styles.hintTitle}>Save your favourite routes</Text>
            <Text style={styles.hintText}>
              Quick access to your common journeys and connecting combinations.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SavedScreen;

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
  tabsRow: {
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
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  savedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircleBlue: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleRed: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOrange: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8A7A71',
    marginTop: 2,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#F3DEC6',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },
  hintContent: {
    flex: 1,
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A4A1C',
  },
  hintText: {
    fontSize: 12,
    color: '#7A6B63',
    marginTop: 2,
    lineHeight: 16,
  },
});
