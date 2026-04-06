import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useGameEngine } from '../hooks/useGameEngine';

export function FrozenScreen() {
  const showCountdown        = useGameStore((s) => s.config.showCountdown);
  const freezeRemaining      = useGameStore((s) => s.freezeRemainingSeconds);
  const { stop } = useGameEngine();

  // Flash-in effect on freeze
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flashAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    return () => {
      flashAnim.setValue(0);
    };
  }, [flashAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: flashAnim }]}>
      <SafeAreaView style={styles.inner}>
        {/* Central block — players focus here */}
        <View style={styles.centerBlock}>
          <Text style={styles.stateLabel}>FREEZE!</Text>
          <Text style={styles.subtitle}>Nobody move!</Text>

          {showCountdown && freezeRemaining > 0 && (
            <View style={styles.countdownBadge}>
              <Text style={styles.countdownText}>{freezeRemaining}s</Text>
            </View>
          )}
        </View>

        {/* Stop button — host only, unobtrusive */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={stop}
            activeOpacity={0.8}
            accessibilityLabel="Stop the game"
            accessibilityRole="button"
          >
            <Text style={styles.stopBtnLabel}>■ STOP GAME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const FREEZE_RED = '#e63946';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FREEZE_RED,
  },
  inner: {
    flex: 1,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateLabel: {
    fontSize: 80,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  countdownBadge: {
    marginTop: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'flex-end',
  },
  stopBtn: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  stopBtnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
});
