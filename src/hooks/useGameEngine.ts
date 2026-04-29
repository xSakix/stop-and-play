import { useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';
import { audioManager } from '../audio/AudioManager';
import { GameEvent, transition } from '../engine/stateMachine';

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clearTimer(ref: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (ref.current !== null) { clearTimeout(ref.current); ref.current = null; }
}

function clearTick(ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (ref.current !== null) { clearInterval(ref.current); ref.current = null; }
}

/**
 * Game engine — intended to be instantiated ONCE inside GameEngineProvider.
 * Never call this hook directly in screens; use useGameEngineActions() instead.
 *
 * State machine (source of truth: src/engine/stateMachine.ts):
 *   idle ──[START]──► loading ──[LOADED]──► playing ──[PLAY_TIMER|MANUAL_FREEZE]──► frozen
 *                         └──[LOAD_FAILED]──► error          └──[FREEZE_TIMER]──► playing
 *   any ──[STOP]──► idle
 */
export function useGameEngine() {
  const phase              = useGameStore((s) => s.phase);
  const config             = useGameStore((s) => s.config);
  const setFreezeRemaining = useGameStore((s) => s.setFreezeRemaining);
  const setError           = useGameStore((s) => s.setError);

  const playTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const freezeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards against concurrent start() calls during loading
  const isLoadingRef  = useRef(false);

  /**
   * Stable dispatch — reads phase imperatively so it never goes stale
   * inside timer callbacks regardless of when they fire.
   */
  const dispatch = useCallback((event: GameEvent) => {
    const current = useGameStore.getState().phase;
    const next    = transition(current, event);
    if (next !== current) {
      useGameStore.getState().setPhase(next);
    }
  }, []); // no deps — imperative state read, always fresh

  // ── Phase-driven side effects (single effect, switch statement) ───────────
  useEffect(() => {
    switch (phase) {

      case 'playing': {
        // play() is awaited; any I/O failure dispatches LOAD_FAILED → error screen
        audioManager.play().catch(() => dispatch('LOAD_FAILED'));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const delaySec = randomBetween(config.playMin, config.playMax);
        playTimerRef.current = setTimeout(() => dispatch('PLAY_TIMER'), delaySec * 1000);
        break;
      }

      case 'frozen': {
        // pause() failure is non-fatal — game stays frozen, timer still runs
        audioManager.pause().catch(console.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        const durationSec = randomBetween(config.freezeMin, config.freezeMax);
        setFreezeRemaining(durationSec);

        let remaining = durationSec;
        countdownRef.current = setInterval(() => {
          remaining -= 1;
          setFreezeRemaining(Math.max(0, remaining));
        }, 1000);

        freezeTimerRef.current = setTimeout(
          () => dispatch('FREEZE_TIMER'),
          durationSec * 1000,
        );
        break;
      }

      case 'idle':
      case 'error':
        audioManager.unload();
        isLoadingRef.current = false;
        break;

      // 'loading': no side effect here — start() drives the async load
    }

    return () => {
      clearTimer(playTimerRef);
      clearTimer(freezeTimerRef);
      clearTick(countdownRef);
      if (phase === 'frozen') setFreezeRemaining(0);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps
  // dispatch, config, setFreezeRemaining omitted intentionally:
  //   dispatch: stable (imperative read, [] deps)
  //   config: locked during gameplay — must NOT react to mid-game changes
  //   setFreezeRemaining: stable Zustand action

  // ── Audio session init — runs once for the lifetime of the provider ───────
  useEffect(() => {
    audioManager.init();
    return () => { audioManager.unload(); };
  }, []);

  // ── Public API ─────────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    const currentPhase = useGameStore.getState().phase;
    // Only callable from idle or error; guard against re-entrant calls during loading
    if (currentPhase !== 'idle' && currentPhase !== 'error') return;
    if (isLoadingRef.current) return;

    const { currentTrack } = useGameStore.getState();
    if (!currentTrack) return;

    isLoadingRef.current = true;
    dispatch('START'); // idle|error → loading

    try {
      await audioManager.load(currentTrack.uri, currentTrack.isDefault);
      dispatch('LOADED'); // loading → playing
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load audio';
      setError(message);
      dispatch('LOAD_FAILED'); // loading → error
    } finally {
      isLoadingRef.current = false;
    }
  }, [dispatch, setError]);

  const stop = useCallback(() => {
    dispatch('STOP'); // any → idle
  }, [dispatch]);

  const manualFreeze = useCallback(() => {
    dispatch('MANUAL_FREEZE'); // playing → frozen (no-op from any other phase)
  }, [dispatch]);

  return { start, stop, manualFreeze };
}
