/**
 * Minimal zero-dependency test runner for pure TypeScript modules.
 * Uses Node.js assert — no jest-expo or RN runtime required.
 * Run: ts-node --project tsconfig.test.json scripts/run-tests.ts
 */
import assert from 'assert';
import { transition, TRANSITIONS, GameEvent } from '../src/engine/stateMachine';
import { GamePhase } from '../src/types';

// ── Tiny test harness ─────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    process.stdout.write(`  ✅  ${name}\n`);
    passed++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stdout.write(`  ❌  ${name}\n      ${msg}\n`);
    failures.push(name);
    failed++;
  }
}

function describe(group: string, fn: () => void) {
  process.stdout.write(`\n${group}\n`);
  fn();
}

function expect(actual: unknown) {
  return {
    toBe: (expected: unknown) =>
      assert.strictEqual(actual, expected, `Expected ${String(expected)}, got ${String(actual)}`),
  };
}

// ── All events / phases ───────────────────────────────────────────────────────

const ALL_EVENTS: GameEvent[] = [
  'START', 'LOADED', 'LOAD_FAILED', 'PLAY_FAILED',
  'PLAY_TIMER', 'FREEZE_TIMER', 'MANUAL_FREEZE', 'STOP',
];

const ALL_PHASES: GamePhase[] = ['idle', 'loading', 'playing', 'frozen', 'error'];

// ── Legal transitions ─────────────────────────────────────────────────────────

describe('Legal transitions', () => {
  test('idle + START → loading',           () => expect(transition('idle',    'START'        )).toBe('loading'));
  test('loading + LOADED → playing',       () => expect(transition('loading', 'LOADED'       )).toBe('playing'));
  test('loading + LOAD_FAILED → error',    () => expect(transition('loading', 'LOAD_FAILED'  )).toBe('error'  ));
  test('loading + STOP → idle',            () => expect(transition('loading', 'STOP'         )).toBe('idle'   ));
  test('playing + PLAY_TIMER → frozen',    () => expect(transition('playing', 'PLAY_TIMER'   )).toBe('frozen' ));
  test('playing + MANUAL_FREEZE → frozen', () => expect(transition('playing', 'MANUAL_FREEZE')).toBe('frozen' ));
  test('playing + STOP → idle',            () => expect(transition('playing', 'STOP'         )).toBe('idle'   ));
  test('frozen + FREEZE_TIMER → playing',  () => expect(transition('frozen',  'FREEZE_TIMER' )).toBe('playing'));
  test('frozen + STOP → idle',             () => expect(transition('frozen',  'STOP'         )).toBe('idle'   ));
  test('playing + PLAY_FAILED → error',    () => expect(transition('playing', 'PLAY_FAILED'  )).toBe('error'  ));
  test('error + START → loading',          () => expect(transition('error',   'START'        )).toBe('loading'));
  test('error + STOP → idle',              () => expect(transition('error',   'STOP'         )).toBe('idle'   ));
});

// ── Illegal events are no-ops ─────────────────────────────────────────────────

describe('Illegal events return current phase unchanged', () => {
  test('idle + STOP → idle',              () => expect(transition('idle',    'STOP'         )).toBe('idle'   ));
  test('idle + LOADED → idle',            () => expect(transition('idle',    'LOADED'       )).toBe('idle'   ));
  test('idle + PLAY_TIMER → idle',        () => expect(transition('idle',    'PLAY_TIMER'   )).toBe('idle'   ));
  test('idle + PLAY_FAILED → idle',       () => expect(transition('idle',    'PLAY_FAILED'  )).toBe('idle'   ));
  test('loading + PLAY_TIMER → loading',  () => expect(transition('loading', 'PLAY_TIMER'   )).toBe('loading'));
  test('loading + MANUAL_FREEZE → loading',() => expect(transition('loading','MANUAL_FREEZE')).toBe('loading'));
  test('playing + LOADED → playing',      () => expect(transition('playing', 'LOADED'       )).toBe('playing'));
  test('playing + FREEZE_TIMER → playing',() => expect(transition('playing', 'FREEZE_TIMER' )).toBe('playing'));
  test('frozen + START → frozen',         () => expect(transition('frozen',  'START'        )).toBe('frozen' ));
  test('frozen + MANUAL_FREEZE → frozen', () => expect(transition('frozen',  'MANUAL_FREEZE')).toBe('frozen' ));
  test('frozen + PLAY_TIMER → frozen',    () => expect(transition('frozen',  'PLAY_TIMER'   )).toBe('frozen' ));
  test('error + LOADED → error',          () => expect(transition('error',   'LOADED'       )).toBe('error'  ));
  test('error + PLAY_TIMER → error',      () => expect(transition('error',   'PLAY_TIMER'   )).toBe('error'  ));
});

// ── Exhaustive matrix (every phase × every event) ─────────────────────────────

describe('Exhaustive phase × event matrix', () => {
  for (const phase of ALL_PHASES) {
    for (const event of ALL_EVENTS) {
      const expected = TRANSITIONS[phase]?.[event] ?? phase;
      test(`${phase} + ${event} → ${expected}`, () =>
        expect(transition(phase, event)).toBe(expected));
    }
  }
});

// ── Stability properties ──────────────────────────────────────────────────────

describe('Stability properties', () => {
  test('chained transitions: idle → START → LOADED → playing', () => {
    const afterStart  = transition('idle', 'START');
    const afterLoaded = transition(afterStart, 'LOADED');
    expect(afterLoaded).toBe('playing');
  });

  test('STOP from loading/playing/frozen/error always → idle', () => {
    const stoppable: GamePhase[] = ['loading', 'playing', 'frozen', 'error'];
    for (const phase of stoppable) {
      assert.strictEqual(transition(phase, 'STOP'), 'idle', `STOP from ${phase} should → idle`);
    }
  });

  test('pure function — identical inputs always produce identical output (100 calls)', () => {
    for (let i = 0; i < 100; i++) {
      assert.strictEqual(transition('playing', 'PLAY_TIMER'), 'frozen');
      assert.strictEqual(transition('frozen',  'STOP'),       'idle'  );
    }
  });
});

// ── Summary ───────────────────────────────────────────────────────────────────

const total = passed + failed;
process.stdout.write(`\n${'─'.repeat(50)}\n`);
process.stdout.write(`Tests: ${total}  |  ✅ ${passed} passed  |  ❌ ${failed} failed\n`);

if (failed > 0) {
  process.stdout.write(`\nFailed:\n${failures.map((f) => `  • ${f}`).join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('All tests passed.\n');
