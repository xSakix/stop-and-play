import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useGameEngineActions } from '../engine/GameEngineProvider';
import { SettingsSheet } from '../components/SettingsSheet';
import { MusicPicker } from '../components/MusicPicker';

export function HomeScreen() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pickerOpen, setPickerOpen]     = useState(false);
  const currentTrack = useGameStore((s) => s.currentTrack);
  const { start } = useGameEngineActions();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>STOP &amp; PLAY</Text>
        <TouchableOpacity
          onPress={() => setSettingsOpen(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Open settings"
        >
          <Text style={styles.gear}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Track selector */}
      <TouchableOpacity
        style={styles.trackRow}
        onPress={() => setPickerOpen(true)}
        accessibilityLabel="Select music track"
      >
        <Text style={styles.trackLabel}>NOW PLAYING</Text>
        <Text style={styles.trackName} numberOfLines={1}>
          {currentTrack?.name ?? 'No track selected'}
        </Text>
        <Text style={styles.trackChevron}>›</Text>
      </TouchableOpacity>

      {/* Start button */}
      <View style={styles.startContainer}>
        <TouchableOpacity
          style={[styles.startButton, !currentTrack && styles.startButtonDisabled]}
          onPress={() => { void start(); }}
          disabled={!currentTrack}
          activeOpacity={0.85}
          accessibilityLabel="Start the game"
          accessibilityRole="button"
        >
          <Text style={styles.startIcon}>▶</Text>
          <Text style={styles.startLabel}>START</Text>
        </TouchableOpacity>
      </View>

      {/* Sheets */}
      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <MusicPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
  },
  gear: {
    fontSize: 24,
  },
  trackRow: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
  },
  trackLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c63ff',
    letterSpacing: 2,
    marginRight: 12,
  },
  trackName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  trackChevron: {
    fontSize: 22,
    color: '#6c63ff',
    marginLeft: 8,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 12,
  },
  startButtonDisabled: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  startIcon: {
    fontSize: 40,
    color: '#ffffff',
    marginBottom: 4,
  },
  startLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
  },
});
