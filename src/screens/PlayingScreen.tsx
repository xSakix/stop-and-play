import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useGameEngineActions } from '../engine/GameEngineProvider';

export function PlayingScreen() {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const { stop, manualFreeze } = useGameEngineActions();

  // Subtle pulse animation to reinforce "live" state
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        {/* Track name — top */}
        <View style={styles.topBar}>
          <Text style={styles.trackName} numberOfLines={1}>
            ♪  {currentTrack?.name ?? '—'}
          </Text>
        </View>

        {/* Central state label */}
        <View style={styles.centerBlock}>
          <Animated.Text style={[styles.stateLabel, { transform: [{ scale: pulse }] }]}>
            PLAYING
          </Animated.Text>
          <Text style={styles.subtitle}>Don't stop moving!</Text>
        </View>

        {/* Host controls — bottom */}
        <View style={styles.hostControls}>
          {/* Manual freeze — left, prominent */}
          <TouchableOpacity
            style={styles.freezeBtn}
            onPress={manualFreeze}
            activeOpacity={0.8}
            accessibilityLabel="Manually trigger freeze now"
            accessibilityRole="button"
          >
            <Text style={styles.freezeBtnLabel}>FREEZE NOW</Text>
          </TouchableOpacity>

          {/* Stop game — right, subtle */}
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={stop}
            activeOpacity={0.8}
            accessibilityLabel="Stop the game"
            accessibilityRole="button"
          >
            <Text style={styles.stopBtnLabel}>■ STOP</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const PLAYING_GREEN = '#00c896';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PLAYING_GREEN,
  },
  inner: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.55)',
    letterSpacing: 0.5,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateLabel: {
    fontSize: 72,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  hostControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  freezeBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  freezeBtnLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  stopBtn: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  stopBtnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2,
  },
});
