import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useGameEngineActions } from '../engine/GameEngineProvider';

export function ErrorScreen() {
  const errorMessage = useGameStore((s) => s.errorMessage);
  const { start, stop } = useGameEngineActions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.icon}>✕</Text>
        <Text style={styles.title}>Failed to load audio</Text>
        <Text style={styles.message} numberOfLines={3}>
          {errorMessage ?? 'An unknown error occurred.'}
        </Text>

        <TouchableOpacity style={styles.retryBtn} onPress={() => { void start(); }} activeOpacity={0.85}>
          <Text style={styles.retryLabel}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={stop} activeOpacity={0.85}>
          <Text style={styles.cancelLabel}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 56,
    color: '#e63946',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#6c63ff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
  },
  retryLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  cancelLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
});
