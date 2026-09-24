import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Linking,
  ImageBackground,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Train } from '../types/Train';
import { TrainStop } from '../types/TrainStop';
import { trainService } from '../services/trainService';
import { STATION_MAP } from '../data/stations';
import { useSavedStore } from '../store/savedStore';
import { useReminderStore } from '../store/reminderStore';
import { BookingReminderSheet } from '../components/BookingReminderSheet';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getConnectingGoaTrains, GoaConnectingTrain } from '../utils/connectingTrainsUtils';

type TrainDetailsRouteProp = RouteProp<RootStackParamList, 'TrainDetails'>;
type TrainDetailsNavProp = StackNavigationProp<RootStackParamList>;

type TabOption = 'Overview' | 'Connecting Trains';
type ConnFilterType = 'ALL' | 'TRAINS' | 'BUSES';

const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const formatRunningDays = (runningDays: number[]): string => {
  if (!runningDays || runningDays.length === 0) return 'Special';
  if (runningDays.length === 7) return 'Daily';

  if (runningDays.length === 6) {
    const missing = [1, 2, 3, 4, 5, 6, 0].find(d => !runningDays.includes(d));
    if (missing !== undefined) {
      return `Daily (Ex. ${DAY_LABELS[missing]})`;
    }
  }

  const sorted = [...runningDays].sort((a, b) => {
    const ma = a === 0 ? 7 : a;
    const mb = b === 0 ? 7 : b;
    return ma - mb;
  });

  if (sorted.length === 1) {
    return `${DAY_LABELS[sorted[0]]} only`;
  }

  return sorted.map(d => DAY_LABELS[d]).join(', ');
};

// ── Indicative fare ranges per train type (Mumbai–Goa corridor, ~500–1300 km) ──
type FareClass = { label: string; code: string; range: string; color: string };

const FARE_CLASSES: Record<string, FareClass[]> = {
  VandeBharat: [
    { label: 'Chair Car',       code: 'CC', range: '\u20B9 1,350 – 1,855', color: '#1E824C' },
    { label: 'Executive Chair', code: 'EC', range: '\u20B9 2,650 – 3,530', color: '#9E3C1B' },
  ],
  Rajdhani: [
    { label: '3rd AC',   code: '3A', range: '\u20B9 1,810 – 2,390', color: '#1565C0' },
    { label: '2nd AC',   code: '2A', range: '\u20B9 2,590 – 3,445', color: '#6A1B9A' },
    { label: '1st AC',   code: '1A', range: '\u20B9 4,370 – 5,820', color: '#9E3C1B' },
  ],
  Tejas: [
    { label: 'Chair Car',       code: 'CC', range: '\u20B9 1,175 – 1,605', color: '#1E824C' },
    { label: 'Executive Chair', code: 'EC', range: '\u20B9 2,125 – 2,865', color: '#9E3C1B' },
  ],
  Express: [
    { label: 'Sleeper',  code: 'SL', range: '\u20B9  355 –   545', color: '#2E7D32' },
    { label: '3rd AC',   code: '3A', range: '\u20B9  975 – 1,420', color: '#1565C0' },
    { label: '2nd AC',   code: '2A', range: '\u20B9 1,380 – 2,015', color: '#6A1B9A' },
    { label: '1st AC',   code: '1A', range: '\u20B9 2,330 – 3,395', color: '#9E3C1B' },
  ],
  Mail: [
    { label: 'Sleeper',  code: 'SL', range: '\u20B9  310 –   480', color: '#2E7D32' },
    { label: '3rd AC',   code: '3A', range: '\u20B9  870 – 1,275', color: '#1565C0' },
    { label: '2nd AC',   code: '2A', range: '\u20B9 1,235 – 1,805', color: '#6A1B9A' },
    { label: '1st AC',   code: '1A', range: '\u20B9 2,085 – 3,040', color: '#9E3C1B' },
  ],
  Passenger: [
    { label: 'Unreserved / General', code: 'UR', range: '\u20B9   50 –   180', color: '#558B2F' },
  ],
  DEMU: [
    { label: 'Unreserved / General', code: 'UR', range: '\u20B9   30 –   120', color: '#558B2F' },
  ],
};

const getFareClasses = (type: string): FareClass[] =>
  FARE_CLASSES[type] ?? FARE_CLASSES['Express'];

export const TrainDetailsScreen: React.FC = () => {
  const route = useRoute<TrainDetailsRouteProp>();
  const navigation = useNavigation<TrainDetailsNavProp>();
  const insets = useSafeAreaInsets();
  const { trainNumber } = route.params;

  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabOption>('Overview');
  const [connFilter, setConnFilter] = useState<ConnFilterType>('ALL');

  const { isTrainSaved, toggleTrainFavorite } = useSavedStore();
  const isFavorite = isTrainSaved(trainNumber);

  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const { hasAnyReminder, getRemindersForTrain } = useReminderStore();
  const hasReminderForThisTrain = hasAnyReminder(trainNumber);
  const trainReminders = getRemindersForTrain(trainNumber);

  const [allTrains, setAllTrains] = useState<Train[]>([]);

  useEffect(() => {
    trainService.getAllTrains().then(setAllTrains);
    trainService.getTrain(trainNumber).then(t => {
      setTrain(t);
      setLoading(false);
    });
  }, [trainNumber]);

  const connectionAnalysis = useMemo(() => {
    if (!train) return null;
    return getConnectingGoaTrains(train, allTrains);
  }, [train, allTrains]);

  const isGoaStation = (code: string) => {
    return ['PER', 'THVM', 'KRMI', 'MAO', 'CNO', 'VSG', 'SVDEM', 'KULEM'].includes(code);
  };

  const goaStopsCount = useMemo(() => {
    if (!train) return 0;
    return train.stops.filter(s => isGoaStation(s.stationCode)).length;
  }, [train]);

  if (loading || !train) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading train details...</Text>
      </SafeAreaView>
    );
  }

  const srcStation = STATION_MAP[train.sourceStationCode];
  const dstStation = STATION_MAP[train.destinationStationCode];

  const todayDay = new Date().getDay();
  const isDaily = train.runningDays?.length === 7;
  const runsToday = Boolean(train.runningDays?.includes(todayDay));
  const runningDaysText = formatRunningDays(train.runningDays);

  // ── Render: Stop Timeline (Overview Tab) ──────────────────────────
  const renderStop = ({ item, index }: { item: TrainStop; index: number }) => {
    const station = STATION_MAP[item.stationCode];
    const isFirst = index === 0;
    const isLast = index === train.stops.length - 1;
    const time = isFirst
      ? item.departureTime
      : isLast
      ? item.arrivalTime
      : item.arrivalTime ?? item.departureTime;

    const isGoa = isGoaStation(item.stationCode);

    return (
      <View style={styles.stopRow}>
        {/* Departure/Arrival Time */}
        <View style={styles.timeBox}>
          <Text style={styles.stopTime}>{time}</Text>
        </View>

        {/* Timeline Visual */}
        <View style={styles.timeline}>
          {!isFirst && <View style={styles.lineTop} />}
          <View
            style={[
              styles.stopDot,
              isFirst || isLast ? styles.stopDotTerminal : undefined,
              isGoa ? styles.stopDotGoa : undefined,
            ]}
          />
          {!isLast && <View style={styles.lineBottom} />}
        </View>

        {/* Station info */}
        <View style={styles.stopInfo}>
          <View style={styles.stationTitleRow}>
            <Text style={[styles.stopStationName, (isFirst || isLast) && styles.terminalName]}>
              {station?.name ?? item.stationCode}
            </Text>
            <View style={styles.timelineCodeBadge}>
              <Text style={styles.timelineCodeBadgeText}>{item.stationCode}</Text>
            </View>
            {isFirst && <Text style={styles.tagTerminal}>(Start)</Text>}
            {isLast && <Text style={styles.tagTerminal}>(End)</Text>}
            {isGoa && !isFirst && !isLast && (
              <View style={styles.goaTag}>
                <Text style={styles.goaTagText}>(Goa)</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // ── Render: Connecting Train Card ────────────────────────────────
  const renderConnectingTrain = ({ item }: { item: GoaConnectingTrain }) => {
    const isToMumbai = item.direction === 'TO_MUMBAI';
    const firstGoaStop = item.goaStops[0];
    const firstGoaStopName = firstGoaStop ? firstGoaStop.stationName : 'Goa';
    const firstGoaStopTime = firstGoaStop ? firstGoaStop.time : '';

    return (
      <View style={styles.connCard}>
        {/* Header: Name, Number & Layover Badge */}
        <View style={styles.connCardHeader}>
          <View style={styles.connNameBlock}>
            <View style={styles.connTitleRow}>
              <Text style={styles.connTrainName} numberOfLines={1}>
                {item.train.name}
              </Text>
              <View style={styles.connNumberBadge}>
                <Text style={styles.connNumberText}>{item.train.trainNumber}</Text>
              </View>
            </View>
            <Text style={styles.connTrainType}>
              {item.isPassengerShuttle
                ? 'Passenger / Shuttle · Unreserved'
                : isToMumbai
                ? 'Feeder from Goa · Express'
                : `${item.train.type} Express`}
            </Text>
          </View>

          <View style={styles.layoverBadge}>
            <Ionicons name="time-outline" size={12} color="#9E3C1B" />
            <Text style={styles.layoverBadgeText}>
              {item.layoverFormatted} {isToMumbai ? 'layover' : 'wait'}
            </Text>
          </View>
        </View>

        {/* Timing Endpoint Row */}
        <View style={styles.connTimingRow}>
          <View style={styles.connTimingEndpoint}>
            <Text style={styles.connTimeLabel}>
              {isToMumbai ? `Boards Goa (${firstGoaStopName})` : `Departs ${item.transferStationName}`}
            </Text>
            <Text style={styles.connTimeValue}>
              {isToMumbai ? firstGoaStopTime : item.transferTime}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#9E3C1B" style={{ marginTop: 12 }} />
          <View style={[styles.connTimingEndpoint, { alignItems: 'flex-end' }]}>
            <Text style={styles.connTimeLabel}>
              {isToMumbai ? `Arrives ${item.transferStationName}` : `Reaches Goa (${firstGoaStopName})`}
            </Text>
            <Text style={styles.connTimeValue}>
              {isToMumbai ? item.transferTime : firstGoaStopTime}
            </Text>
          </View>
        </View>

        {/* Goa Stations Reached / Boarded */}
        <View style={styles.connGoaStopsBox}>
          <Text style={styles.connGoaStopsTitle}>
            {isToMumbai ? 'Boarding stops in Goa:' : 'Goa stops on this train:'}
          </Text>
          <View style={styles.connGoaStopsPills}>
            {item.goaStops.map(s => (
              <View key={s.stationCode} style={styles.connGoaPill}>
                <Text style={styles.connGoaPillName}>{s.stationName}</Text>
                <Text style={styles.connGoaPillTime}>
                  {isToMumbai ? `Dep ${s.time}` : `Arr ${s.time}`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Practical Boarding & Ticket Tip */}
        <View style={styles.connTipBox}>
          <Ionicons name="ticket-outline" size={15} color="#8A4A1C" style={{ marginTop: 1 }} />
          <Text style={styles.connTipText}>{item.ticketTip}</Text>
        </View>

        {/* View Train Details Action */}
        <TouchableOpacity
          style={styles.connViewBtn}
          onPress={() => navigation.push('TrainDetails', { trainNumber: item.train.trainNumber })}
          activeOpacity={0.8}
        >
          <Text style={styles.connViewBtnText}>View Train Schedule</Text>
          <Ionicons name="chevron-forward" size={14} color="#9E3C1B" />
        </TouchableOpacity>
      </View>
    );
  };

  // ── Render: Road & Bus Timetable Section ─────────────────────────
  const renderBusTimetableSection = () => {
    const road = connectionAnalysis?.roadTransitDetails;
    if (!road) return null;

    return (
      <View style={styles.busSectionContainer}>
        {/* Section Header */}
        <View style={styles.busSectionHeader}>
          <View style={styles.busSectionTitleRow}>
            <View style={styles.busIconBadge}>
              <Ionicons name="bus" size={18} color="#9E3C1B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.busSectionTitle}>{road.summaryTitle}</Text>
              <Text style={styles.busSectionSubtitle}>{road.summarySubtitle}</Text>
            </View>
          </View>
        </View>

        {/* Station Shuttle Guide */}
        <View style={styles.shuttleCard}>
          <View style={styles.shuttleHeader}>
            <Ionicons name="swap-horizontal" size={16} color="#B45309" />
            <Text style={styles.shuttleTitle}>{road.shuttleGuide.title}</Text>
          </View>
          <Text style={styles.shuttleDesc}>{road.shuttleGuide.description}</Text>
          <View style={styles.shuttleMetricsRow}>
            <View style={styles.shuttleMetricItem}>
              <Text style={styles.shuttleMetricLabel}>Distance</Text>
              <Text style={styles.shuttleMetricVal}>{road.shuttleGuide.distance}</Text>
            </View>
            <View style={styles.shuttleMetricDivider} />
            <View style={styles.shuttleMetricItem}>
              <Text style={styles.shuttleMetricLabel}>Shared Auto</Text>
              <Text style={[styles.shuttleMetricVal, { color: '#1E824C' }]}>{road.shuttleGuide.sharedAutoFare}</Text>
            </View>
            <View style={styles.shuttleMetricDivider} />
            <View style={styles.shuttleMetricItem}>
              <Text style={styles.shuttleMetricLabel}>Private Auto</Text>
              <Text style={styles.shuttleMetricVal}>{road.shuttleGuide.privateAutoFare}</Text>
            </View>
            <View style={styles.shuttleMetricDivider} />
            <View style={styles.shuttleMetricItem}>
              <Text style={styles.shuttleMetricLabel}>Time</Text>
              <Text style={styles.shuttleMetricVal}>{road.shuttleGuide.duration}</Text>
            </View>
          </View>
        </View>

        {/* Bus Route Cards */}
        <Text style={styles.busRoutesListHeading}>State Bus Routes & Time Table</Text>
        {road.busRoutes.map(route => (
          <View key={route.id} style={styles.busRouteCard}>
            {/* Route Header */}
            <View style={styles.busRouteCardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.busRouteTitleRow}>
                  <Text style={styles.busRouteFrom}>{route.from}</Text>
                  <Ionicons name="arrow-forward" size={13} color="#9E3C1B" style={{ marginHorizontal: 6 }} />
                  <Text style={styles.busRouteTo}>{route.to}</Text>
                </View>
                <Text style={styles.busRouteOperator}>{route.operator} · {route.busType}</Text>
              </View>
            </View>

            {/* Quick Stats Badges */}
            <View style={styles.busStatsRow}>
              <View style={styles.busStatChip}>
                <Ionicons name="repeat-outline" size={12} color="#7A6B63" />
                <Text style={styles.busStatText}>{route.frequency}</Text>
              </View>
              <View style={styles.busStatChip}>
                <Ionicons name="time-outline" size={12} color="#7A6B63" />
                <Text style={styles.busStatText}>{route.duration}</Text>
              </View>
              <View style={[styles.busStatChip, { backgroundColor: '#EBF7EE' }]}>
                <Ionicons name="cash-outline" size={12} color="#1E824C" />
                <Text style={[styles.busStatText, { color: '#1E824C', fontWeight: '700' }]}>{route.fare}</Text>
              </View>
            </View>

            {/* Boarding & Drop Points */}
            <View style={styles.busPointsBox}>
              <View style={styles.busPointRow}>
                <Ionicons name="radio-button-on" size={13} color="#9E3C1B" />
                <Text style={styles.busPointLabel}>Pickup:</Text>
                <Text style={styles.busPointValue} numberOfLines={1}>{route.pickupPoint}</Text>
              </View>
              <View style={styles.busPointRow}>
                <Ionicons name="location" size={13} color="#1E824C" />
                <Text style={styles.busPointLabel}>Drop:</Text>
                <Text style={styles.busPointValue} numberOfLines={1}>{route.dropPoint}</Text>
              </View>
            </View>

            {/* Timetable / Schedule Slots */}
            <View style={styles.busTimetableContainer}>
              <Text style={styles.busTimetableLabel}>Scheduled Departures:</Text>
              {route.scheduleSlots.map(slot => (
                <View key={slot.period} style={styles.busSlotRow}>
                  <Text style={styles.busSlotPeriod}>{slot.period}</Text>
                  <View style={styles.busTimesWrap}>
                    {slot.times.map(t => (
                      <View key={t} style={styles.busTimePill}>
                        <Text style={styles.busTimeText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Route Halts */}
            <View style={styles.busHaltsRow}>
              <Text style={styles.busHaltsLabel}>Route Stops: </Text>
              <Text style={styles.busHaltsText}>{route.keyStops.join(' → ')}</Text>
            </View>

            {/* Travel Tip */}
            <View style={styles.busTipBox}>
              <Ionicons name="bulb-outline" size={14} color="#B45309" />
              <Text style={styles.busTipText}>{route.travelTip}</Text>
            </View>
          </View>
        ))}

        {/* Direct Taxi / Cab Guide Card */}
        <View style={styles.cabGuideCard}>
          <View style={styles.cabGuideHeader}>
            <Ionicons name="car-outline" size={18} color="#2C201A" />
            <Text style={styles.cabGuideTitle}>{road.cabGuide.title}</Text>
          </View>
          <View style={styles.cabTable}>
            {road.cabGuide.options.map((opt, i) => (
              <View key={opt.destination} style={[styles.cabTableRow, i % 2 === 1 && styles.cabTableRowAlt]}>
                <Text style={styles.cabDestText}>{opt.destination}</Text>
                <Text style={styles.cabDurationText}>{opt.duration}</Text>
                <Text style={styles.cabFareText}>{opt.estimatedFare}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.cabTipText}>{road.cabGuide.tip}</Text>
        </View>
      </View>
    );
  };

  // ── Render: Connecting Tab Footer ─────────────────────────────────
  const renderConnectingFooter = () => {
    if (activeTab !== 'Connecting Trains') return null;
    if (connectionAnalysis?.isDirect) return null;

    if (connFilter === 'TRAINS') {
      return (
        <TouchableOpacity
          style={styles.busPromptCard}
          onPress={() => setConnFilter('BUSES')}
          activeOpacity={0.85}
        >
          <View style={styles.busPromptIconBox}>
            <Ionicons name="bus-outline" size={20} color="#9E3C1B" />
          </View>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.busPromptTitle}>Need Road Transit or Bus Schedules?</Text>
            <Text style={styles.busPromptSub}>
              Kadamba & MSRTC state bus timetable, station auto transfer, and cab fare guide.
            </Text>
          </View>
          <View style={styles.busPromptBtn}>
            <Text style={styles.busPromptBtnText}>View Timetable</Text>
            <Ionicons name="arrow-forward" size={12} color="#9E3C1B" />
          </View>
        </TouchableOpacity>
      );
    }

    return renderBusTimetableSection();
  };

  // ── Render: Empty State for Connections ──────────────────────────
  const renderEmptyConnections = () => {
    if (connectionAnalysis?.isDirect) {
      const isMumbai = connectionAnalysis.direction === 'TO_MUMBAI';
      return (
        <View style={styles.directGoaCard}>
          <Ionicons name="checkmark-circle" size={32} color="#1E824C" />
          <Text style={styles.directGoaTitle}>
            {isMumbai ? 'Direct Train from Goa' : 'Direct Train to Goa'}
          </Text>
          <Text style={styles.directGoaDesc}>
            {isMumbai
              ? 'This train boards directly in Goa with scheduled halts at Goa stations. No feeder train change required!'
              : 'This train travels directly into Goa with scheduled halts at Goa stations. No train change required!'}
          </Text>
        </View>
      );
    }
    if (connFilter === 'BUSES') {
      return null;
    }
    return (
      <View style={styles.emptyConnCard}>
        <Ionicons name="train-outline" size={36} color="#A8998E" />
        <Text style={styles.emptyConnTitle}>No connecting trains found</Text>
        <Text style={styles.emptyConnDesc}>
          Check the bus timetables and road transit options below to complete your journey.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#2C201A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Train Details</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            onPress={() => setReminderModalVisible(true)}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={hasReminderForThisTrain ? 'notifications' : 'notifications-outline'}
              size={22}
              color={hasReminderForThisTrain ? '#D97706' : '#2C201A'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleTrainFavorite(trainNumber)}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#DC2626' : '#2C201A'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={
          activeTab === 'Overview'
            ? (train.stops as any)
            : connFilter === 'BUSES'
            ? []
            : (connectionAnalysis?.connectingTrains as any ?? [])
        }
        keyExtractor={item =>
          activeTab === 'Overview'
            ? `${(item as TrainStop).stationCode}-${(item as TrainStop).sequence}`
            : `conn-${(item as GoaConnectingTrain).train.trainNumber}`
        }
        renderItem={activeTab === 'Overview' ? (renderStop as any) : (renderConnectingTrain as any)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={activeTab === 'Connecting Trains' ? renderConnectingFooter() : null}
        ListEmptyComponent={activeTab === 'Connecting Trains' ? renderEmptyConnections() : null}
        ListHeaderComponent={
          <View>
            {/* Unified Compact Hero Cover Card */}
            <View style={styles.heroCardContainer}>
              <ImageBackground
                source={require('../../assets/konkan_railway_cover.png')}
                style={styles.heroCover}
                imageStyle={styles.heroCoverImage}
                resizeMode="cover"
              >
                {/* Dark Contrast Scrim */}
                <View style={styles.heroOverlay}>
                  {/* Top Badges Row */}
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroNumberBadge}>
                      <Ionicons name="train" size={12} color="#FFFFFF" />
                      <Text style={styles.heroNumberText}>{train.trainNumber}</Text>
                    </View>

                    <View style={styles.heroTypeBadge}>
                      <Text style={styles.heroTypeText}>{train.type}</Text>
                    </View>

                    <View style={styles.heroScheduleBadge}>
                      <Ionicons
                        name={isDaily ? 'repeat-outline' : 'calendar-outline'}
                        size={11}
                        color="#FFEAD8"
                      />
                      <Text style={styles.heroScheduleText}>{runningDaysText}</Text>
                    </View>
                  </View>

                  {/* Bottom Content Group (Anchored) */}
                  <View style={styles.heroBottomGroup}>
                    {/* Train Name */}
                    <Text style={styles.heroTrainName} numberOfLines={1}>
                      {train.name}
                    </Text>

                    {/* Route Row */}
                    <View style={styles.heroRouteRow}>
                      <Text style={styles.heroStationName} numberOfLines={1}>
                        {srcStation?.name ?? train.sourceStationCode}
                      </Text>
                      <View style={styles.heroCodePill}>
                        <Text style={styles.heroCodeText}>{train.sourceStationCode}</Text>
                      </View>

                      <Ionicons
                        name="arrow-forward"
                        size={12}
                        color="rgba(255, 255, 255, 0.75)"
                        style={{ marginHorizontal: 2 }}
                      />

                      <Text style={styles.heroStationName} numberOfLines={1}>
                        {dstStation?.name ?? train.destinationStationCode}
                      </Text>
                      <View style={styles.heroCodePill}>
                        <Text style={styles.heroCodeText}>{train.destinationStationCode}</Text>
                      </View>
                    </View>

                    {/* Feature Chips Row */}
                    <View style={styles.heroChipsRow}>
                      {train.type !== 'Passenger' && train.type !== 'DEMU' && (
                        <View style={styles.heroGlassChip}>
                          <Ionicons name="restaurant-outline" size={11} color="rgba(255, 255, 255, 0.9)" />
                          <Text style={styles.heroGlassChipText}>Pantry</Text>
                        </View>
                      )}
                      <View style={styles.heroGlassChip}>
                        <Ionicons name="shield-checkmark-outline" size={11} color="rgba(255, 255, 255, 0.9)" />
                        <Text style={styles.heroGlassChipText}>
                          {train.type === 'Passenger' || train.type === 'DEMU' ? 'ICF / Shuttle' : 'LHB Coach'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>

            {/* Booking Opening Reminder Banner Card */}
            <TouchableOpacity
              style={[styles.reminderBannerCard, hasReminderForThisTrain && styles.reminderBannerCardActive]}
              onPress={() => setReminderModalVisible(true)}
              activeOpacity={0.88}
            >
              <View style={[styles.reminderBannerIconBox, hasReminderForThisTrain && styles.reminderBannerIconBoxActive]}>
                <Ionicons
                  name={hasReminderForThisTrain ? 'notifications' : 'alarm-outline'}
                  size={20}
                  color={hasReminderForThisTrain ? '#D97706' : '#9E3C1B'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.reminderBannerTitleRow}>
                  <Text style={styles.reminderBannerTitle}>
                    {hasReminderForThisTrain ? 'Booking Reminder Active' : 'Set Booking Opening Alert'}
                  </Text>
                  <View style={styles.arpPill}>
                    <Text style={styles.arpPillText}>60-Day ARP</Text>
                  </View>
                </View>
                <Text style={styles.reminderBannerSub}>
                  {hasReminderForThisTrain
                    ? `${trainReminders.length} reminder${trainReminders.length > 1 ? 's' : ''} set for this train · Tap to view & manage`
                    : 'Get notified 7 days before, 1 day before, and at 8:00 AM on opening day.'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9E3C1B" />
            </TouchableOpacity>

            {/* Overview Connecting Notice Banner */}
            {activeTab === 'Overview' && !connectionAnalysis?.isDirect && (connectionAnalysis?.connectingTrains.length ?? 0) > 0 && (
              <TouchableOpacity
                style={styles.connNoticeBanner}
                onPress={() => setActiveTab('Connecting Trains')}
                activeOpacity={0.85}
              >
                <View style={styles.connNoticeIconBox}>
                  <Ionicons name="git-network" size={18} color="#9E3C1B" />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.connNoticeTitle}>
                    {connectionAnalysis?.direction === 'TO_MUMBAI'
                      ? 'Feeder Trains from Goa Available'
                      : 'Connecting Trains to Goa Available'}
                  </Text>
                  <Text style={styles.connNoticeSub}>
                    {connectionAnalysis?.direction === 'TO_MUMBAI'
                      ? `Board in Goa to reach ${connectionAnalysis?.transferStationName} before departure at ${connectionAnalysis?.transferTime} · ${connectionAnalysis?.connectingTrains.length} feeder trains available`
                      : `Arrives ${connectionAnalysis?.transferStationName} at ${connectionAnalysis?.transferTime} · ${connectionAnalysis?.connectingTrains.length} onward trains on same track`}
                  </Text>
                </View>
                <View style={styles.connNoticeBtn}>
                  <Text style={styles.connNoticeBtnText}>View ({connectionAnalysis?.connectingTrains.length})</Text>
                  <Ionicons name="arrow-forward" size={12} color="#9E3C1B" />
                </View>
              </TouchableOpacity>
            )}

            {/* Tabs Row */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'Overview' && styles.tabItemActive]}
                onPress={() => setActiveTab('Overview')}
              >
                <Text style={[styles.tabText, activeTab === 'Overview' && styles.tabTextActive]}>
                  Overview
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'Connecting Trains' && styles.tabItemActive]}
                onPress={() => setActiveTab('Connecting Trains')}
              >
                <View style={styles.tabItemInner}>
                  <Text style={[styles.tabText, activeTab === 'Connecting Trains' && styles.tabTextActive]}>
                    Connecting Trains
                  </Text>
                  {connectionAnalysis && connectionAnalysis.connectingTrains.length > 0 && (
                    <View
                      style={[
                        styles.tabBadge,
                        activeTab === 'Connecting Trains' && styles.tabBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          activeTab === 'Connecting Trains' && styles.tabBadgeTextActive,
                        ]}
                      >
                        {connectionAnalysis.connectingTrains.length}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Overview Stops Summary */}
            {activeTab === 'Overview' && (
              <View style={styles.stopsSummaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="git-commit-outline" size={14} color="#7A6B63" />
                  <Text style={styles.summaryText}>{Math.max(0, train.stops.length - 2)} intermediate stops</Text>
                </View>
                {goaStopsCount > 0 ? (
                  <View style={styles.summaryItem}>
                    <Ionicons name="leaf-outline" size={14} color="#1E824C" />
                    <Text style={[styles.summaryText, { color: '#1E824C', fontWeight: '700' }]}>
                      {goaStopsCount} Goa stations
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.summaryItem, styles.summaryHubItem]}>
                    <Ionicons name="navigate-outline" size={13} color="#B45309" />
                    <Text style={styles.summaryActionText} numberOfLines={1}>
                      {connectionAnalysis?.direction === 'TO_MUMBAI' ? 'Departs' : 'Terminates'}{' '}
                      <Text style={styles.summaryStationName}>
                        {connectionAnalysis?.direction === 'TO_MUMBAI'
                          ? (srcStation?.name ?? train.sourceStationCode)
                          : (dstStation?.name ?? train.destinationStationCode)}
                      </Text>
                    </Text>
                    <View style={styles.stationCodeBadge}>
                      <Text style={styles.stationCodeBadgeText}>
                        {connectionAnalysis?.direction === 'TO_MUMBAI'
                          ? train.sourceStationCode
                          : train.destinationStationCode}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ── Fare Range Card (Overview only) ── */}
            {activeTab === 'Overview' && (
              <View style={styles.fareCard}>
                <View style={styles.fareCardHeader}>
                  <View style={styles.fareCardIconBox}>
                    <Ionicons name="ticket-outline" size={16} color="#9E3C1B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fareCardTitle}>Indicative Fare Range</Text>
                    <Text style={styles.fareCardSub}>Mumbai – Goa corridor (approx.)</Text>
                  </View>
                  <View style={styles.fareCardDisclaimer}>
                    <Text style={styles.fareCardDisclaimerText}>Estimated</Text>
                  </View>
                </View>
                <View style={styles.fareRowsWrap}>
                  {getFareClasses(train.type).map((fc) => (
                    <View key={fc.code} style={styles.fareRow}>
                      <View style={[styles.fareCodeBadge, { backgroundColor: fc.color + '18' }]}>
                        <Text style={[styles.fareCodeText, { color: fc.color }]}>{fc.code}</Text>
                      </View>
                      <Text style={styles.fareClassLabel}>{fc.label}</Text>
                      <Text style={styles.fareRangeText}>{fc.range}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.fareNote}>
                  ⚠️ Fares vary by distance, quota, season &amp; dynamic pricing. Check IRCTC for exact fare.
                </Text>
              </View>
            )}

            {activeTab === 'Connecting Trains' && connectionAnalysis && (
              <View style={styles.connHeaderCard}>
                <View style={styles.connHeaderRow}>
                  <View style={styles.connStationBadge}>
                    <Ionicons name="swap-horizontal" size={14} color="#9E3C1B" />
                    <Text style={styles.connStationBadgeText}>
                      {connectionAnalysis.direction === 'TO_MUMBAI' ? 'Departure Hub' : 'Transfer Hub'}
                    </Text>
                  </View>
                  <Text style={styles.connArrivalText}>
                    {connectionAnalysis.direction === 'TO_MUMBAI' ? 'Departure: ' : 'Arrival: '}
                    <Text style={styles.connArrivalTextBold}>{connectionAnalysis.transferTime}</Text>
                  </Text>
                </View>
                <Text style={styles.connHeaderTitle}>
                  {connectionAnalysis.transferStationName} ({connectionAnalysis.transferStationCode})
                </Text>
                <Text style={styles.connHeaderSub}>
                  {connectionAnalysis.direction === 'TO_MUMBAI'
                    ? `Catch this Mumbai train by boarding a feeder train from Goa. Arrive at ${connectionAnalysis.transferStationName} with plenty of time to board.`
                    : connectionAnalysis.isDirect
                    ? 'Onward connecting trains towards South Goa and coastal junctions.'
                    : 'Catch an onward train towards Goa on the same track without leaving the station platform. You can board unreserved coaches with a general counter ticket.'}
                </Text>
              </View>
            )}

            {/* Connecting Filter Pills (All / Trains / Bus Timetable) */}
            {activeTab === 'Connecting Trains' && connectionAnalysis && !connectionAnalysis.isDirect && (
              <View style={styles.connSubFilterRow}>
                <TouchableOpacity
                  style={[styles.connSubFilterBtn, connFilter === 'ALL' && styles.connSubFilterBtnActive]}
                  onPress={() => setConnFilter('ALL')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.connSubFilterText, connFilter === 'ALL' && styles.connSubFilterTextActive]}>
                    All ({connectionAnalysis.connectingTrains.length + (connectionAnalysis.roadTransitDetails?.busRoutes.length ?? 0)})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.connSubFilterBtn, connFilter === 'TRAINS' && styles.connSubFilterBtnActive]}
                  onPress={() => setConnFilter('TRAINS')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="train-outline"
                    size={13}
                    color={connFilter === 'TRAINS' ? '#FFFFFF' : '#6E5D53'}
                  />
                  <Text style={[styles.connSubFilterText, connFilter === 'TRAINS' && styles.connSubFilterTextActive]}>
                    Trains ({connectionAnalysis.connectingTrains.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.connSubFilterBtn, connFilter === 'BUSES' && styles.connSubFilterBtnActive]}
                  onPress={() => setConnFilter('BUSES')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="bus-outline"
                    size={13}
                    color={connFilter === 'BUSES' ? '#FFFFFF' : '#6E5D53'}
                  />
                  <Text style={[styles.connSubFilterText, connFilter === 'BUSES' && styles.connSubFilterTextActive]}>
                    Bus Timetable ({connectionAnalysis.roadTransitDetails?.busRoutes.length ?? 3})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={[styles.reminderBarBtn, hasReminderForThisTrain && styles.reminderBarBtnActive]}
          onPress={() => setReminderModalVisible(true)}
          activeOpacity={0.88}
        >
          <Ionicons
            name={hasReminderForThisTrain ? 'notifications' : 'alarm-outline'}
            size={18}
            color={hasReminderForThisTrain ? '#D97706' : '#9E3C1B'}
          />
          <Text style={[styles.reminderBarBtnText, hasReminderForThisTrain && styles.reminderBarBtnTextActive]}>
            {hasReminderForThisTrain ? 'Alert Active' : 'Set Reminder'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => Linking.openURL('https://www.irctc.co.in/nget/train-search').catch(() => {})}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaButtonText}>Book on IRCTC</Text>
          <Ionicons name="open-outline" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Booking Reminder Sheet Modal */}
      {train && (
        <BookingReminderSheet
          visible={reminderModalVisible}
          onClose={() => setReminderModalVisible(false)}
          train={train}
        />
      )}
    </SafeAreaView>
  );
};

export default TrainDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#7A6B63',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
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
  heroCardContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2A1810',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 5,
  },
  heroCover: {
    width: '100%',
    minHeight: 250,
  },
  heroCoverImage: {
    borderRadius: 20,
  },
  heroOverlay: {
    minHeight: 250,
    backgroundColor: 'rgba(14, 8, 4, 0.58)',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBottomGroup: {
    marginTop: 36,
  },
  heroNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#9E3C1B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroNumberText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroScheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  heroScheduleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFEAD8',
  },
  heroTrainName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 10,
    lineHeight: 28,
  },
  heroRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 16,
  },
  heroStationName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.96)',
  },
  heroCodePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  heroCodeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  heroChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  heroGlassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
  },
  heroGlassChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  runsStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 6,
  },
  runsStatusBadgeOff: {
    backgroundColor: '#FDF6E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  runsStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E824C',
  },
  runsStatusTextOff: {
    color: '#B45309',
  },
  routeSubtitle: {
    fontSize: 14,
    color: '#7A6B63',
    fontWeight: '500',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  routeStationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
  },
  routeCodeBadge: {
    backgroundColor: '#F7EFE8',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  routeCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A4A1C',
    letterSpacing: 0.5,
  },
  tagChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7E1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A4A1C',
  },

  // ── Overview Notice Banner ───────────────────────────────────────
  connNoticeBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#F7EFE8',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E8DED6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connNoticeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  connNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C201A',
  },
  connNoticeSub: {
    fontSize: 11.5,
    color: '#7A6B63',
    marginTop: 2,
  },
  connNoticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8DED6',
    gap: 3,
  },
  connNoticeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E3C1B',
  },

  // ── Tabs Row ─────────────────────────────────────────────────────
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7E1',
    marginHorizontal: 16,
    marginTop: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#9E3C1B',
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#8A7A71',
  },
  tabTextActive: {
    color: '#9E3C1B',
    fontWeight: '700',
  },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#9E3C1B',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },

  // ── Intermediate Stops Summary (Overview Tab) ────────────────────
  stopsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryText: {
    fontSize: 12,
    color: '#7A6B63',
    fontWeight: '500',
  },
  summaryHubItem: {
    flexShrink: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryActionText: {
    fontSize: 12,
    color: '#7A6B63',
    fontWeight: '500',
  },
  summaryStationName: {
    fontWeight: '700',
    color: '#2C201A',
  },
  stationCodeBadge: {
    backgroundColor: '#F7EFE8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  stationCodeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A4A1C',
    letterSpacing: 0.5,
  },

  // ── Stops Timeline (Overview Tab) ────────────────────────────────
  stopRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 52,
  },
  timeBox: {
    width: 60,
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  stopTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#382A22',
  },
  timeline: {
    width: 28,
    alignItems: 'center',
  },
  lineTop: {
    position: 'absolute',
    top: 0,
    bottom: '50%',
    width: 2,
    backgroundColor: '#E2D7CF',
  },
  lineBottom: {
    position: 'absolute',
    top: '50%',
    bottom: 0,
    width: 2,
    backgroundColor: '#E2D7CF',
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#A8998E',
    marginTop: 4,
    zIndex: 2,
  },
  stopDotTerminal: {
    borderColor: '#9E3C1B',
    backgroundColor: '#9E3C1B',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stopDotGoa: {
    borderColor: '#1E824C',
    backgroundColor: '#EBF7EE',
  },
  stopInfo: {
    flex: 1,
    paddingLeft: 8,
    paddingTop: 2,
  },
  stationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  stopStationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#382A22',
  },
  terminalName: {
    fontWeight: '800',
    color: '#1C1613',
  },
  tagTerminal: {
    fontSize: 12,
    color: '#8A7A71',
  },
  timelineCodeBadge: {
    backgroundColor: '#F5EFEA',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EAE1D9',
  },
  timelineCodeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A6B63',
    letterSpacing: 0.4,
  },
  goaTag: {
    backgroundColor: '#EBF7EE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  goaTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E824C',
  },

  // ── Connecting Tab Header Card ───────────────────────────────────
  connHeaderCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
  },
  connHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  connStationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  connStationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  connArrivalText: {
    fontSize: 12,
    color: '#7A6B63',
  },
  connArrivalTextBold: {
    fontWeight: '800',
    color: '#9E3C1B',
  },
  connHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C201A',
    marginBottom: 4,
  },
  connHeaderSub: {
    fontSize: 12.5,
    color: '#6E5D53',
    lineHeight: 17,
  },

  // ── Connecting Train Card ────────────────────────────────────────
  connCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  connCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  connNameBlock: {
    flex: 1,
    marginRight: 8,
  },
  connTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  connTrainName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
    flexShrink: 1,
  },
  connNumberBadge: {
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  connNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6B63',
  },
  connTrainType: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8A7A70',
    marginTop: 3,
  },
  layoverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5ECE3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  layoverBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#9E3C1B',
  },

  // ── Connecting Timing Row ────────────────────────────────────────
  connTimingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  connTimingEndpoint: {
    flex: 1,
  },
  connTimeLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#8A7A70',
    marginBottom: 2,
  },
  connTimeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C201A',
  },

  // ── Goa Stops Pills Box ──────────────────────────────────────────
  connGoaStopsBox: {
    marginBottom: 10,
  },
  connGoaStopsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E5D53',
    marginBottom: 5,
  },
  connGoaStopsPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  connGoaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  connGoaPillName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E824C',
  },
  connGoaPillTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },

  // ── Boarding Tip Box ─────────────────────────────────────────────
  connTipBox: {
    flexDirection: 'row',
    backgroundColor: '#FAF4ED',
    padding: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE2D3',
    gap: 7,
    marginBottom: 10,
  },
  connTipText: {
    flex: 1,
    fontSize: 11.5,
    color: '#6E4D38',
    lineHeight: 16,
    fontWeight: '500',
  },

  // ── View Train Details CTA ───────────────────────────────────────
  connViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5ECE3',
    gap: 4,
  },
  connViewBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#9E3C1B',
  },

  // ── Connecting Sub-Filter Switcher ──────────────────────────────
  connSubFilterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    gap: 8,
  },
  connSubFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3EDE7',
    borderWidth: 1,
    borderColor: '#E7DDD3',
    gap: 5,
  },
  connSubFilterBtnActive: {
    backgroundColor: '#9E3C1B',
    borderColor: '#9E3C1B',
  },
  connSubFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E5D53',
  },
  connSubFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Bus Prompt Card (When Trains tab is active) ───────────────────
  busPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    padding: 14,
    backgroundColor: '#F6EFE8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EADECF',
    gap: 10,
  },
  busPromptIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EDE1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busPromptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C201A',
    marginBottom: 2,
  },
  busPromptSub: {
    fontSize: 11.5,
    color: '#7A6B63',
    lineHeight: 16,
  },
  busPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD1C4',
    gap: 3,
  },
  busPromptBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#9E3C1B',
  },

  // ── Road & Bus Transit Section ────────────────────────────────────
  busSectionContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  busSectionHeader: {
    marginBottom: 12,
  },
  busSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  busIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7EDE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  busSectionTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#2C201A',
    letterSpacing: -0.2,
  },
  busSectionSubtitle: {
    fontSize: 12,
    color: '#7A6B63',
    lineHeight: 17,
    marginTop: 3,
  },

  // ── Station Shuttle Card ──────────────────────────────────────────
  shuttleCard: {
    backgroundColor: '#FFFDFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE5',
    marginBottom: 16,
  },
  shuttleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  shuttleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C201A',
  },
  shuttleDesc: {
    fontSize: 12,
    color: '#6E5D53',
    lineHeight: 17,
    marginBottom: 12,
  },
  shuttleMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F4EE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  shuttleMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  shuttleMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A7A71',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  shuttleMetricVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2C201A',
  },
  shuttleMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E7DDD3',
  },

  // ── Bus Routes Heading & Cards ────────────────────────────────────
  busRoutesListHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
    marginBottom: 10,
  },
  busRouteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE5',
    marginBottom: 12,
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  busRouteCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  busRouteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  busRouteFrom: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C201A',
  },
  busRouteTo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9E3C1B',
  },
  busRouteOperator: {
    fontSize: 11.5,
    color: '#7A6B63',
    fontWeight: '500',
  },
  busStatsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  busStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5ECE3',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  busStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A3B32',
  },
  busPointsBox: {
    backgroundColor: '#FAF7F4',
    borderRadius: 8,
    padding: 9,
    gap: 5,
    marginBottom: 10,
  },
  busPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  busPointLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E5D53',
    width: 48,
  },
  busPointValue: {
    fontSize: 11.5,
    color: '#2C201A',
    flex: 1,
  },
  busTimetableContainer: {
    backgroundColor: '#FFFDFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E8E1',
    padding: 10,
    marginBottom: 10,
  },
  busTimetableLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2C201A',
    marginBottom: 6,
  },
  busSlotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  busSlotPeriod: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A7A71',
    width: 62,
    marginTop: 3,
  },
  busTimesWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  busTimePill: {
    backgroundColor: '#F3EDE7',
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    borderRadius: 5,
  },
  busTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C201A',
  },
  busHaltsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  busHaltsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6B63',
  },
  busHaltsText: {
    fontSize: 11,
    color: '#6E5D53',
    lineHeight: 16,
  },
  busTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF8E7',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F9E4B5',
  },
  busTipText: {
    fontSize: 11.5,
    color: '#7C4A03',
    lineHeight: 16,
    flex: 1,
  },

  // ── Direct Taxi Guide Card ────────────────────────────────────────
  cabGuideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEAE5',
    marginTop: 4,
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cabGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cabGuideTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2C201A',
  },
  cabTable: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEAE5',
    marginBottom: 10,
  },
  cabTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  cabTableRowAlt: {
    backgroundColor: '#FAF6F2',
  },
  cabDestText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C201A',
    flex: 1.4,
  },
  cabDurationText: {
    fontSize: 11.5,
    color: '#7A6B63',
    flex: 0.8,
    textAlign: 'center',
  },
  cabFareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E824C',
    flex: 1,
    textAlign: 'right',
  },
  cabTipText: {
    fontSize: 11.5,
    color: '#7A6B63',
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // ── Empty States ─────────────────────────────────────────────────
  directGoaCard: {
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#EBF7EE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D3EED8',
    marginTop: 8,
  },
  directGoaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E824C',
    marginTop: 8,
  },
  directGoaDesc: {
    fontSize: 12.5,
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyConnCard: {
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    marginTop: 8,
  },
  emptyConnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A3E38',
    marginTop: 8,
  },
  emptyConnDesc: {
    fontSize: 12.5,
    color: '#8A7A70',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },

  // ── Bottom Sticky Action Bar ─────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE7E1',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  reminderBarBtn: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEECE6',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  reminderBarBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  reminderBarBtnText: {
    color: '#9E3C1B',
    fontSize: 14,
    fontWeight: '700',
  },
  reminderBarBtnTextActive: {
    color: '#B45309',
  },
  ctaButton: {
    flex: 1.25,
    backgroundColor: '#9E3C1B',
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Top Bar & Reminder Banner Card ──────────────────────────────
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    gap: 10,
  },
  reminderBannerCardActive: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  reminderBannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEECE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBannerIconBoxActive: {
    backgroundColor: '#FEF3C7',
  },
  reminderBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reminderBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C201A',
  },
  reminderBannerSub: {
    fontSize: 11,
    color: '#7A6B63',
    marginTop: 2,
  },
  arpPill: {
    backgroundColor: '#FEECE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  arpPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9E3C1B',
  },

  // ── Fare Range Card ────────────────────────────────────────────
  fareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    shadowColor: '#2C201A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  fareCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE9',
  },
  fareCardIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEECE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fareCardTitle: { fontSize: 14, fontWeight: '800', color: '#2C201A' },
  fareCardSub: { fontSize: 11, color: '#8A7A70', marginTop: 1 },
  fareCardDisclaimer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  fareCardDisclaimerText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  fareRowsWrap: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F3EF',
  },
  fareCodeBadge: {
    width: 38,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fareCodeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  fareClassLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#3C2C24' },
  fareRangeText: { fontSize: 13, fontWeight: '800', color: '#2C201A', fontVariant: ['tabular-nums'] },
  fareNote: {
    fontSize: 11,
    color: '#8A7A70',
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
    lineHeight: 16,
  },
});
