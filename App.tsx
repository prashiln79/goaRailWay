import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ensureSignedIn } from './src/services/authService';
import { checkAndSyncWeeklyTrains } from './src/services/trainSyncService';

LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
]);

export default function App() {
  useEffect(() => {
    ensureSignedIn()
      .catch((err) =>
        console.warn('[App] Anonymous sign-in warning:', err),
      )
      .finally(() => {
        // Check if Firebase data is 1 week old; if so, update from RailRadar in the background
        checkAndSyncWeeklyTrains().catch((err) =>
          console.warn('[App] Weekly train sync check warning:', err),
        );
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

