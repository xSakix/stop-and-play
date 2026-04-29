import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useGameEngineActions } from '../engine/GameEngineProvider';

export function LoadingScreen() {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const { stop } = useGameEngineActions();
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.label, { opacity: fadeAnim }]}>
        Loading
      </Animated.Text>
      {currentTrack && (
        <Text style={styles.trackName} numberOfLines={1}>
          {currentTrack.name}
        </Text>
      )}
      <TouchableOpacity style={styles.cancelBtn} onPress={stop} activeOpacity={0.7}>
        <Text style={styles.cancelLabel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  label: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6c63ff',
    letterSpacing: 4,
    marginBottom: 16,
  },
  trackName: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 48,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelLabel: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
});
