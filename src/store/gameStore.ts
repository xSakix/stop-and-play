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

  // --- persisted ---
  config: GameConfig;
  tracks: Track[];
  currentTrack: Track | null;

  // --- actions ---
  setPhase: (phase: GamePhase) => void;
  setFreezeRemaining: (seconds: number) => void;
  setConfig: (patch: Partial<GameConfig>) => void;
  setCurrentTrack: (track: Track) => void;
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: 'idle',
      freezeRemainingSeconds: 0,
      config: DEFAULT_CONFIG,
      tracks: DEFAULT_TRACKS,
      currentTrack: DEFAULT_TRACKS[0],

      setPhase: (phase) => set({ phase }),
      setFreezeRemaining: (seconds) => set({ freezeRemainingSeconds: seconds }),
      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      addTrack: (track) => set((s) => ({ tracks: [...s.tracks, track] })),
      removeTrack: (id) =>
        set((s) => {
          const tracks = s.tracks.filter((t) => t.id !== id);
          const currentTrack =
            s.currentTrack?.id === id
              ? (tracks[0] ?? null)
              : s.currentTrack;
          return { tracks, currentTrack };
        }),
    }),
    {
      name: 'stop-and-play-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist settings, not the transient game state
      partialize: (s) => ({
        config: s.config,
        tracks: s.tracks,
        currentTrack: s.currentTrack,
      }),
    },
  ),
);
