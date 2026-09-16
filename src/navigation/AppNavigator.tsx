import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapScreen from '../screens/MapScreen';
import TrainDetailsScreen from '../screens/TrainDetailsScreen';
import StationDetailsScreen from '../screens/StationDetailsScreen';
import SearchScreen from '../screens/SearchScreen';

export type RootStackParamList = {
  Tabs: undefined;
  MapScreen: undefined;
  TrainDetails: { trainNumber: string };
  StationDetails: { stationCode: string };
  Search: undefined;
};

export type TabParamList = {
  Map: undefined;
  Trains: undefined;
  Stations: undefined;
  Search: undefined;
  More: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

/** Placeholder tab screens */
const TrainsListPlaceholder = () => {
  const MapScreenComp = MapScreen; // reuse map for now
  return <MapScreenComp />;
};

function MapStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F8F9FA' },
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="MapScreen" component={MapScreen} />
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
        name="Search"
        component={SearchScreen}
        options={{ presentation: 'modal', gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
}


function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#1A73E8',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Map: focused ? 'map' : 'map-outline',
            Trains: focused ? 'train' : 'train-outline',
            Stations: focused ? 'location' : 'location-outline',
            Search: focused ? 'search' : 'search-outline',
            More: focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipsis-horizontal'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Trains" component={MapStack} />
      <Tab.Screen name="Stations" component={MapStack} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="More" component={MapStack} />
    </Tab.Navigator>
  );
}

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <BottomTabs />
    </NavigationContainer>
  );
};

export default AppNavigator;
