export type GamePhase = 'idle' | 'loading' | 'playing' | 'frozen' | 'error';

export interface Track {
  id: string;
  name: string;
  /** URI for device tracks, or a key like "default:groove" for bundled ones */
  uri: string;
  isDefault: boolean;
}

export interface GameConfig {
  /** Minimum seconds the music plays before a random freeze */
  playMin: number;
  /** Maximum seconds the music plays before a random freeze */
  playMax: number;
  /** Minimum seconds the freeze lasts */
  freezeMin: number;
  /** Maximum seconds the freeze lasts */
  freezeMax: number;
  /** Whether to show a countdown timer during the freeze phase */
  showCountdown: boolean;
}
