import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GamePhase, GameConfig, Track } from '../types';

export const DEFAULT_TRACKS: Track[] = [
  { id: 'default-1', name: 'Groove Loop',  uri: 'default:groove', isDefault: true },
  { id: 'default-2', name: 'Party Beat',   uri: 'default:party',  isDefault: true },
  { id: 'default-3', name: 'Dance Floor',  uri: 'default:dance',  isDefault: true },
];

const DEFAULT_CONFIG: GameConfig = {
  playMin: 5,
  playMax: 30,
  freezeMin: 3,
  freezeMax: 45,
  showCountdown: false,
};

interface GameStore {
  // --- transient (not persisted) ---
  phase: GamePhase;
  freezeRemainingSeconds: number;
  errorMessage: string | null;

  // --- persisted ---
  config: GameConfig;
  tracks: Track[];
  currentTrack: Track | null;

  // --- actions ---
  setPhase: (phase: GamePhase) => void;
  setFreezeRemaining: (seconds: number) => void;
  setError: (message: string) => void;
  setConfig: (patch: Partial<GameConfig>) => void;
  setCurrentTrack: (track: Track) => void;
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      phase: 'idle',
      freezeRemainingSeconds: 0,
      errorMessage: null,
      config: DEFAULT_CONFIG,
      tracks: DEFAULT_TRACKS,
      currentTrack: DEFAULT_TRACKS[0],

      setPhase: (phase) =>
        set({ phase, ...(phase === 'idle' ? { errorMessage: null } : {}) }),
      setFreezeRemaining: (seconds) => set({ freezeRemainingSeconds: seconds }),
      setError: (message) => set({ errorMessage: message }),
      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      addTrack: (track) => set((s) => ({ tracks: [...s.tracks, track] })),
      removeTrack: (id) =>
        set((s) => {
          const tracks = s.tracks.filter((t) => t.id !== id);
          const currentTrack =
            s.currentTrack?.id === id ? (tracks[0] ?? null) : s.currentTrack;
          return { tracks, currentTrack };
        }),
    }),
    {
      name: 'stop-and-play-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        config: s.config,
        tracks: s.tracks,
        currentTrack: s.currentTrack,
      }),
      // Validate and sanitise config values loaded from storage.
      // Guards against schema drift, corruption, or hand-edited AsyncStorage.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<typeof current>;
        const raw = { ...DEFAULT_CONFIG, ...(p.config ?? {}) };

        const config: GameConfig = {
          ...raw,
          // If range is inverted or degenerate, reset that pair to defaults
          playMin:   raw.playMin >= raw.playMax  ? DEFAULT_CONFIG.playMin  : raw.playMin,
          playMax:   raw.playMin >= raw.playMax  ? DEFAULT_CONFIG.playMax  : raw.playMax,
          freezeMin: raw.freezeMin >= raw.freezeMax ? DEFAULT_CONFIG.freezeMin : raw.freezeMin,
          freezeMax: raw.freezeMin >= raw.freezeMax ? DEFAULT_CONFIG.freezeMax : raw.freezeMax,
        };

        return {
          ...current,
          config,
          tracks:       p.tracks       ?? current.tracks,
          currentTrack: p.currentTrack ?? current.currentTrack,
        };
      },
    },
  ),
);
