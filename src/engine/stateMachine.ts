import { GamePhase } from '../types';

export type GameEvent =
  | 'START'          // host taps Start — begins async audio load
  | 'LOADED'         // audio loaded successfully
  | 'LOAD_FAILED'    // audio failed to load or play
  | 'PLAY_TIMER'     // random play timer fired → freeze
  | 'FREEZE_TIMER'   // random freeze timer fired → resume
  | 'MANUAL_FREEZE'  // host overrides → freeze now
  | 'STOP';          // host aborts → back to idle

type TransitionTable = Partial<Record<GameEvent, GamePhase>>;

/**
 * Single source of truth for all legal phase transitions.
 * Any event not listed for a phase is a no-op (illegal events are silently ignored).
 */
export const TRANSITIONS: Record<GamePhase, TransitionTable> = {
  idle:    { START: 'loading' },
  loading: { LOADED: 'playing', LOAD_FAILED: 'error', STOP: 'idle' },
  playing: { PLAY_TIMER: 'frozen', MANUAL_FREEZE: 'frozen', STOP: 'idle' },
  frozen:  { FREEZE_TIMER: 'playing', STOP: 'idle' },
  error:   { START: 'loading', STOP: 'idle' },
};

/**
 * Pure transition function — no side effects, fully unit-testable.
 * Returns the next phase, or the current phase if the event is illegal.
 */
export function transition(phase: GamePhase, event: GameEvent): GamePhase {
  return TRANSITIONS[phase]?.[event] ?? phase;
}
