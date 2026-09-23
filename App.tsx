import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ensureSignedIn } from './src/services/authService';

LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
]);

export default function App() {
  // Sign in anonymously as early as possible so Firestore reads are authenticated.
  // Firebase Auth persists the UID across restarts — this is a no-op on re-launches.
  useEffect(() => {
    ensureSignedIn().catch((err) =>
      console.warn('[App] Anonymous sign-in failed — Firestore reads will fall back to local data:', err),
    );
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

