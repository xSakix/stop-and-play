import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

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
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      // Duck other audio (notifications, alerts) then restore — right for a party game.
      // DoNotMix would completely stop on phone calls; DuckOthers is less disruptive.
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    });
  }

  async load(uri: string, isDefault: boolean): Promise<void> {
    await this.unload();

    let source: Parameters<typeof Audio.Sound.createAsync>[0];

    if (isDefault) {
      const assetLoader = DEFAULT_ASSETS[uri];
      if (!assetLoader) throw new Error(`Unknown default track: ${uri}`);
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
    // AVPlaybackStatus is a discriminated union — isLoaded is the discriminant
    const status: AVPlaybackStatus = await this.sound.getStatusAsync();
    if (status.isLoaded) {
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

export const audioManager = new AudioManager();
