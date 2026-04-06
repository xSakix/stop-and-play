import { Audio, AVPlaybackStatus } from 'expo-av';

/**
 * Map default track URI keys to bundled asset requires.
 * Drop MP3 files into assets/tracks/ and reference them here.
 * The files are loaded lazily so missing ones don't crash the app.
 */
const DEFAULT_ASSETS: Record<string, () => unknown> = {
  'default:groove': () => require('../../assets/tracks/groove.mp3'),
  'default:party':  () => require('../../assets/tracks/party.mp3'),
  'default:dance':  () => require('../../assets/tracks/dance.mp3'),
};

class AudioManager {
  private sound: Audio.Sound | null = null;

  async init(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      // Keep playing when the screen locks or the app backgrounds
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
    });
  }

  /**
   * Load a track. Always unloads the previous sound first.
   * @param uri  Either a "default:*" key or a filesystem URI from the picker.
   * @param isDefault  True for bundled tracks, false for device tracks.
   */
  async load(uri: string, isDefault: boolean): Promise<void> {
    await this.unload();

    let source: Parameters<typeof Audio.Sound.createAsync>[0];

    if (isDefault) {
      const assetLoader = DEFAULT_ASSETS[uri];
      if (!assetLoader) {
        throw new Error(`Unknown default track: ${uri}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source = assetLoader() as any;
    } else {
      source = { uri };
    }

    const { sound } = await Audio.Sound.createAsync(source, {
      isLooping: true,
      shouldPlay: false,
      volume: 1.0,
    });

    this.sound = sound;
  }

  async play(): Promise<void> {
    if (!this.sound) return;
    const status = await this.sound.getStatusAsync();
    if ((status as AVPlaybackStatus & { isLoaded: boolean }).isLoaded) {
      await this.sound.playAsync();
    }
  }

  async pause(): Promise<void> {
    if (!this.sound) return;
    await this.sound.pauseAsync();
  }

  async unload(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
    } catch {
      // Already unloaded — safe to ignore
    }
    this.sound = null;
  }

  isLoaded(): boolean {
    return this.sound !== null;
  }
}

// Singleton — one shared instance across the app
export const audioManager = new AudioManager();
