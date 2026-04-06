import { useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';
import { audioManager } from '../audio/AudioManager';

function randomBetween(min: number, max: number): number {
  // Consumed at transition time — never pre-computed
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Core game engine.
 *
 * State machine:
 *   idle ──[start()]──► playing
 *   playing ──[timer | manualFreeze()]──► frozen
 *   frozen  ──[timer]──────────────────► playing
 *   playing | frozen ──[stop()]────────► idle
 *
 * Timers are owned here; the store only holds phase + UI-facing values.
 * Cleanup (clearTimeout/clearInterval) happens automatically via useEffect
 * return callbacks whenever phase changes.
 */
export function useGameEngine() {
  const phase          = useGameStore((s) => s.phase);
  const config         = useGameStore((s) => s.config);
  const currentTrack   = useGameStore((s) => s.currentTrack);
  const setPhase       = useGameStore((s) => s.setPhase);
  const setFreezeRemaining = useGameStore((s) => s.setFreezeRemaining);

  // Stable refs — never go stale inside closures
  const playTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const freezeTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Playing phase ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    audioManager.play();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const delaySec = randomBetween(config.playMin, config.playMax);
    playTimerRef.current = setTimeout(() => {
      setPhase('frozen');
    }, delaySec * 1000);

    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps
  // config is intentionally excluded: settings lock while game runs

  // ── Frozen phase ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'frozen') return;

    audioManager.pause();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const durationSec = randomBetween(config.freezeMin, config.freezeMax);
    setFreezeRemaining(durationSec);

    // Tick-down for optional countdown display
    let remaining = durationSec;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setFreezeRemaining(Math.max(0, remaining));
    }, 1000);

    freezeTimerRef.current = setTimeout(() => {
      setPhase('playing');
    }, durationSec * 1000);

    return () => {
      if (freezeTimerRef.current) {
        clearTimeout(freezeTimerRef.current);
        freezeTimerRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setFreezeRemaining(0);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Idle phase ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'idle') return;
    audioManager.unload();
  }, [phase]);

  // ── Init / teardown ──────────────────────────────────────────────────────
  useEffect(() => {
    audioManager.init();
    return () => {
      audioManager.unload();
    };
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    if (!currentTrack) return;
    try {
      await audioManager.load(currentTrack.uri, currentTrack.isDefault);
      setPhase('playing');
    } catch (err) {
      console.error('[GameEngine] Failed to load track:', err);
    }
  }, [currentTrack, setPhase]);

  const stop = useCallback(() => {
    setPhase('idle');
  }, [setPhase]);

  /**
   * Host-only: immediately freeze regardless of the play timer.
   * The existing timer is cleared via the 'playing' effect cleanup;
   * the frozen effect schedules a normal random resume.
   */
  const manualFreeze = useCallback(() => {
    if (phase === 'playing') {
      setPhase('frozen');
    }
  }, [phase, setPhase]);

  return { start, stop, manualFreeze };
}
