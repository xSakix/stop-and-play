import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../store/gameStore';

export function LoadingScreen() {
  const currentTrack = useGameStore((s) => s.currentTrack);
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
  },
});
