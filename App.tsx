import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameEngineProvider } from './src/engine/GameEngineProvider';
import { useGameStore } from './src/store/gameStore';
import { HomeScreen }    from './src/screens/HomeScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { PlayingScreen } from './src/screens/PlayingScreen';
import { FrozenScreen }  from './src/screens/FrozenScreen';
import { ErrorScreen }   from './src/screens/ErrorScreen';

/**
 * ScreenRouter reads phase from the store and renders the matching screen.
 * It lives inside GameEngineProvider so all screens have access to engine actions.
 */
function ScreenRouter() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case 'idle':    return <HomeScreen />;
    case 'loading': return <LoadingScreen />;
    case 'playing': return <PlayingScreen />;
    case 'frozen':  return <FrozenScreen />;
    case 'error':   return <ErrorScreen />;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/*
        GameEngineProvider mounts once for the app's lifetime.
        useGameEngine() runs here — NOT in individual screens.
        This ensures timers and audio session survive all phase transitions.
      */}
      <GameEngineProvider>
        <ScreenRouter />
      </GameEngineProvider>
    </SafeAreaProvider>
  );
}
