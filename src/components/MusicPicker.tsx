import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useGameStore } from '../store/gameStore';
import { Track } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function MusicPicker({ visible, onClose }: Props) {
  const tracks       = useGameStore((s) => s.tracks);
  const currentTrack = useGameStore((s) => s.currentTrack);
  const setCurrentTrack = useGameStore((s) => s.setCurrentTrack);
  const addTrack        = useGameStore((s) => s.addTrack);
  const removeTrack     = useGameStore((s) => s.removeTrack);

  const pickFromDevice = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const track: Track = {
        id:        `device-${Date.now()}`,
        name:      file.name.replace(/\.[^/.]+$/, ''), // strip extension
        uri:       file.uri,
        isDefault: false,
      };
      addTrack(track);
      setCurrentTrack(track);
      onClose();
    } catch {
      Alert.alert('Error', 'Could not open audio file. Please try another.');
    }
  };

  const confirmDelete = (track: Track) => {
    Alert.alert(
      'Remove track',
      `Remove "${track.name}" from the list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeTrack(track.id) },
      ],
    );
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.title}>Choose Music</Text>

        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          style={s.list}
          renderItem={({ item }) => {
            const isSelected = currentTrack?.id === item.id;
            return (
              <TouchableOpacity
                style={[s.trackItem, isSelected && s.trackItemSelected]}
                onPress={() => selectTrack(item)}
                onLongPress={() => !item.isDefault && confirmDelete(item)}
                accessibilityLabel={`Select ${item.name}`}
              >
                <Text style={s.trackIcon}>{item.isDefault ? '♫' : '📁'}</Text>
                <Text style={[s.trackName, isSelected && s.trackNameSelected]} numberOfLines={1}>
                  {item.name}
                </Text>
                {isSelected && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <Text style={s.hint}>Long-press a device track to remove it</Text>
          }
        />

        <TouchableOpacity style={s.addBtn} onPress={pickFromDevice}>
          <Text style={s.addBtnLabel}>+ Add from device</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <Text style={s.closeBtnLabel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  list: {
    maxHeight: 280,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#1a1a2e',
  },
  trackItemSelected: {
    backgroundColor: 'rgba(108,99,255,0.25)',
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  trackIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  trackName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#ccc',
  },
  trackNameSelected: {
    color: '#fff',
  },
  checkmark: {
    fontSize: 16,
    color: '#6c63ff',
    fontWeight: '800',
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#6c63ff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  addBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6c63ff',
    letterSpacing: 0.5,
  },
  closeBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
});
