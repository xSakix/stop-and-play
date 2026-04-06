import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore } from './src/store/gameStore';
import { HomeScreen }    from './src/screens/HomeScreen';
import { PlayingScreen } from './src/screens/PlayingScreen';
import { FrozenScreen }  from './src/screens/FrozenScreen';

/**
 * Root: drives which full-screen view is shown based on game phase.
 * No navigation library needed — phase IS the route.
 */
export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {phase === 'idle'    && <HomeScreen />}
      {phase === 'playing' && <PlayingScreen />}
      {phase === 'frozen'  && <FrozenScreen />}
    </SafeAreaProvider>
  );
}
