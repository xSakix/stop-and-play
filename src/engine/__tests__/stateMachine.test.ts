import { transition, TRANSITIONS, GameEvent } from '../stateMachine';
import { GamePhase } from '../../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** All events defined in the union type */
const ALL_EVENTS: GameEvent[] = [
  'START', 'LOADED', 'LOAD_FAILED',
  'PLAY_TIMER', 'FREEZE_TIMER', 'MANUAL_FREEZE', 'STOP',
];

/** All phases defined in the union type */
const ALL_PHASES: GamePhase[] = ['idle', 'loading', 'playing', 'frozen', 'error'];

// ── Legal transitions (every edge in the TRANSITIONS table) ──────────────────

describe('transition() — legal transitions', () => {
  test('idle + START → loading', () => {
    expect(transition('idle', 'START')).toBe('loading');
  });

  test('loading + LOADED → playing', () => {
    expect(transition('loading', 'LOADED')).toBe('playing');
  });

  test('loading + LOAD_FAILED → error', () => {
    expect(transition('loading', 'LOAD_FAILED')).toBe('error');
  });

  test('loading + STOP → idle', () => {
    expect(transition('loading', 'STOP')).toBe('idle');
  });

  test('playing + PLAY_TIMER → frozen', () => {
    expect(transition('playing', 'PLAY_TIMER')).toBe('frozen');
  });

  test('playing + MANUAL_FREEZE → frozen', () => {
    expect(transition('playing', 'MANUAL_FREEZE')).toBe('frozen');
  });

  test('playing + STOP → idle', () => {
    expect(transition('playing', 'STOP')).toBe('idle');
  });

  test('frozen + FREEZE_TIMER → playing', () => {
    expect(transition('frozen', 'FREEZE_TIMER')).toBe('playing');
  });

  test('frozen + STOP → idle', () => {
    expect(transition('frozen', 'STOP')).toBe('idle');
  });

  test('error + START → loading', () => {
    expect(transition('error', 'START')).toBe('loading');
  });

  test('error + STOP → idle', () => {
    expect(transition('error', 'STOP')).toBe('idle');
  });
});

// ── Illegal transitions (events absent from a phase's table) ─────────────────
// All should return the current phase unchanged (no-op).

describe('transition() — illegal events are no-ops', () => {
  test('idle ignores STOP (not in table — nothing to stop)', () => {
    expect(transition('idle', 'STOP')).toBe('idle');
  });

  test('idle ignores LOADED', () => {
    expect(transition('idle', 'LOADED')).toBe('idle');
  });

  test('idle ignores PLAY_TIMER', () => {
    expect(transition('idle', 'PLAY_TIMER')).toBe('idle');
  });

  test('loading ignores PLAY_TIMER', () => {
    expect(transition('loading', 'PLAY_TIMER')).toBe('loading');
  });

  test('loading ignores MANUAL_FREEZE', () => {
    expect(transition('loading', 'MANUAL_FREEZE')).toBe('loading');
  });

  test('playing ignores LOADED', () => {
    expect(transition('playing', 'LOADED')).toBe('playing');
  });

  test('playing ignores FREEZE_TIMER', () => {
    expect(transition('playing', 'FREEZE_TIMER')).toBe('playing');
  });

  test('frozen ignores START', () => {
    expect(transition('frozen', 'START')).toBe('frozen');
  });

  test('frozen ignores MANUAL_FREEZE (already frozen)', () => {
    expect(transition('frozen', 'MANUAL_FREEZE')).toBe('frozen');
  });

  test('frozen ignores PLAY_TIMER', () => {
    expect(transition('frozen', 'PLAY_TIMER')).toBe('frozen');
  });

  test('error ignores LOADED', () => {
    expect(transition('error', 'LOADED')).toBe('error');
  });

  test('error ignores PLAY_TIMER', () => {
    expect(transition('error', 'PLAY_TIMER')).toBe('error');
  });
});

// ── Exhaustive table coverage ─────────────────────────────────────────────────
// Verify every phase × every event either matches the TRANSITIONS table
// or returns the current phase (no-op). Guards against future table edits
// that forget to update this test file.

describe('transition() — exhaustive phase × event matrix', () => {
  ALL_PHASES.forEach((phase) => {
    ALL_EVENTS.forEach((event) => {
      const expected = TRANSITIONS[phase]?.[event] ?? phase;
      test(`${phase} + ${event} → ${expected}`, () => {
        expect(transition(phase, event)).toBe(expected);
      });
    });
  });
});

// ── Idempotency / stability ───────────────────────────────────────────────────

describe('transition() — stability properties', () => {
  test('calling transition twice in sequence is equivalent to chaining', () => {
    // idle → START → loading → LOADED → playing
    const afterStart  = transition('idle', 'START');
    const afterLoaded = transition(afterStart, 'LOADED');
    expect(afterLoaded).toBe('playing');
  });

  test('STOP from any non-idle phase always reaches idle', () => {
    const stoppable: GamePhase[] = ['loading', 'playing', 'frozen', 'error'];
    stoppable.forEach((phase) => {
      expect(transition(phase, 'STOP')).toBe('idle');
    });
  });

  test('pure function — same inputs always produce same output', () => {
    for (let i = 0; i < 100; i++) {
      expect(transition('playing', 'PLAY_TIMER')).toBe('frozen');
      expect(transition('frozen', 'STOP')).toBe('idle');
    }
  });
});
