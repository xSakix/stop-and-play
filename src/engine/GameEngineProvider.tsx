import React, { createContext, useContext, ReactNode } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';

interface EngineActions {
  start: () => Promise<void>;
  stop: () => void;
  manualFreeze: () => void;
}

const GameEngineContext = createContext<EngineActions | null>(null);

/**
 * Instantiates useGameEngine exactly once — above the screen router in App.tsx.
 * Because this provider never unmounts, the engine's timer refs and audio session
 * survive all screen transitions. Screens must never call useGameEngine directly.
 */
export function GameEngineProvider({ children }: { children: ReactNode }) {
  const actions = useGameEngine();
  return (
    <GameEngineContext.Provider value={actions}>
      {children}
    </GameEngineContext.Provider>
  );
}

/**
 * Thin context consumer for screens. Returns { start, stop, manualFreeze }.
 * No effects, no refs — just the stable action objects from the provider.
 */
export function useGameEngineActions(): EngineActions {
  const ctx = useContext(GameEngineContext);
  if (!ctx) throw new Error('useGameEngineActions must be used inside <GameEngineProvider>');
  return ctx;
}
