import React, { useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  configureNotificationHandler,
  addNotificationResponseListener,
} from '../services/notificationService';

import TrainsHomeScreen from '../screens/TrainsHomeScreen';
import TrainDetailsScreen from '../screens/TrainDetailsScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import StationsListScreen from '../screens/StationsListScreen';
import StationDetailsScreen from '../screens/StationDetailsScreen';
import SavedScreen from '../screens/SavedScreen';
import MoreScreen from '../screens/MoreScreen';

// Configure foreground notification behavior
configureNotificationHandler();

export type RootStackParamList = {
  MainTabs: undefined;
  TrainDetails: { trainNumber: string };
  StationDetails: { stationCode: string };
  Connections: undefined;
};

export type TabParamList = {
  Trains: undefined;
  Stations: undefined;
  Saved: undefined;
  More: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Trains"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EFEAE6',
          height: 62 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarActiveTintColor: '#9E3C1B',
        tabBarInactiveTintColor: '#A8998E',
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
            Trains: { active: 'train', inactive: 'train-outline' },
            Stations: { active: 'location', inactive: 'location-outline' },
            Saved: { active: 'heart', inactive: 'heart-outline' },
            More: { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal-outline' },
          };
          const iconConfig = icons[route.name] ?? { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal-outline' };
          return <Ionicons name={focused ? iconConfig.active : iconConfig.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Trains"
        component={TrainsHomeScreen}
        options={{ tabBarLabel: 'Trains' }}
      />
      <Tab.Screen
        name="Stations"
        component={StationsListScreen}
        options={{ tabBarLabel: 'Stations' }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{ tabBarLabel: 'Saved' }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
}

const AppNavigator: React.FC = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    // When a user taps a booking notification, navigate directly to that train's details
    const cleanup = addNotificationResponseListener(trainNumber => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('TrainDetails', { trainNumber });
      }
    });

    return () => {
      cleanup?.();
    };
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FAF7F4' },
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen
          name="TrainDetails"
          component={TrainDetailsScreen}
          options={{ presentation: 'card', gestureEnabled: true }}
        />
        <Stack.Screen
          name="StationDetails"
          component={StationDetailsScreen}
          options={{ presentation: 'card', gestureEnabled: true }}
        />
        <Stack.Screen
          name="Connections"
          component={ConnectionsScreen}
          options={{ presentation: 'card', gestureEnabled: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
