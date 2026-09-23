import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSavedStore } from '../store/savedStore';
import { SavedTrain } from '../types/Connection';
import { Train } from '../types/Train';
import { trainService } from '../services/trainService';
import { TrainCard } from '../components/TrainCard';
import { RootStackParamList } from '../navigation/AppNavigator';

type SavedNavProp = StackNavigationProp<RootStackParamList>;

export const SavedScreen: React.FC = () => {
  const navigation = useNavigation<SavedNavProp>();
  const insets = useSafeAreaInsets();

  const { savedTrains } = useSavedStore();

  // Resolve full Train objects from savedTrains list
  const [resolvedTrains, setResolvedTrains] = useState<Train[]>([]);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      const results: Train[] = [];

      for (const saved of savedTrains) {
        const fromService = await trainService.getTrain(saved.trainNumber);
        if (fromService) results.push(fromService);
      }

      if (!cancelled) setResolvedTrains(results);
    };

    resolve();
    return () => { cancelled = true; };
  }, [savedTrains]);

  const handleTrainPress = (train: Train) => {
    navigation.navigate('TrainDetails', { trainNumber: train.trainNumber });
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<Train>) => (
    <TrainCard
      train={item}
      onPress={handleTrainPress}
      index={index}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="heart-outline" size={48} color="#C4B7AF" />
      </View>
      <Text style={styles.emptyTitle}>No saved trains yet</Text>
      <Text style={styles.emptyText}>
        Open any train and tap the{' '}
        <Text style={styles.emptyHighlight}>♥</Text> icon to save it here for quick access.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved Trains</Text>
        {savedTrains.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{savedTrains.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={resolvedTrains}
        keyExtractor={item => item.trainNumber}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
          resolvedTrains.length === 0 && savedTrains.length === 0 && styles.listContentCentered,
        ]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          savedTrains.length > 0 ? (
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={15} color="#8A4A1C" />
              <Text style={styles.hintText}>
                Tap a train to view details · Tap{' '}
                <Text style={{ color: '#DC2626' }}>♥</Text> on the details screen to unsave
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default SavedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C201A',
  },
  badge: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── List ─────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  listContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // ── Empty State ──────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#F5EFEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C201A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8A7A71',
    textAlign: 'center',
    lineHeight: 21,
  },
  emptyHighlight: {
    color: '#DC2626',
    fontWeight: '700',
  },

  // ── Footer Hint ──────────────────────────────────────────────
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#8A7A71',
    flex: 1,
    lineHeight: 17,
  },
});
