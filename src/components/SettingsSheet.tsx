import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { useGameStore } from '../store/gameStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface RangeRowProps {
  label: string;
  minValue: number;
  maxValue: number;
  minKey: string;
  maxKey: string;
  step: number;
  unit: string;
}

function RangeRow({ label, minValue, maxValue, minKey, maxKey, step, unit }: RangeRowProps) {
  const setConfig = useGameStore((s) => s.setConfig);

  const adjust = (key: string, current: number, delta: number, otherKey: string, otherValue: number) => {
    const next = Math.max(step, current + delta);
    // Guard: min can't exceed max and vice-versa
    if (key.endsWith('Min') && next >= otherValue) return;
    if (key.endsWith('Max') && next <= otherValue) return;
    setConfig({ [key]: next } as never);
  };

  return (
    <View style={s.rangeRow}>
      <Text style={s.rangeLabel}>{label}</Text>
      <View style={s.rangeControls}>
        <Text style={s.rangeSubLabel}>MIN</Text>
        <TouchableOpacity style={s.stepBtn} onPress={() => adjust(minKey, minValue, -step, maxKey, maxValue)}>
          <Text style={s.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.rangeValue}>{minValue}{unit}</Text>
        <TouchableOpacity style={s.stepBtn} onPress={() => adjust(minKey, minValue, +step, maxKey, maxValue)}>
          <Text style={s.stepBtnText}>+</Text>
        </TouchableOpacity>

        <Text style={[s.rangeSubLabel, { marginLeft: 16 }]}>MAX</Text>
        <TouchableOpacity style={s.stepBtn} onPress={() => adjust(maxKey, maxValue, -step, minKey, minValue)}>
          <Text style={s.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.rangeValue}>{maxValue}{unit}</Text>
        <TouchableOpacity style={s.stepBtn} onPress={() => adjust(maxKey, maxValue, +step, minKey, minValue)}>
          <Text style={s.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SettingsSheet({ visible, onClose }: Props) {
  const config    = useGameStore((c) => c.config);
  const setConfig = useGameStore((c) => c.setConfig);

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
        <Text style={s.title}>Settings</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={s.section}>PLAY DURATION</Text>
          <RangeRow
            label="Music plays for"
            minValue={config.playMin}
            maxValue={config.playMax}
            minKey="playMin"
            maxKey="playMax"
            step={5}
            unit="s"
          />

          <Text style={s.section}>FREEZE DURATION</Text>
          <RangeRow
            label="Freeze lasts for"
            minValue={config.freezeMin}
            maxValue={config.freezeMax}
            minKey="freezeMin"
            maxKey="freezeMax"
            step={5}
            unit="s"
          />

          <Text style={s.section}>DISPLAY</Text>
          <View style={s.toggleRow}>
            <View>
              <Text style={s.toggleLabel}>Show freeze countdown</Text>
              <Text style={s.toggleHint}>Adds suspense when off</Text>
            </View>
            <Switch
              value={config.showCountdown}
              onValueChange={(v) => setConfig({ showCountdown: v })}
              trackColor={{ true: '#6c63ff', false: '#444' }}
              thumbColor="#fff"
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={s.doneBtn} onPress={onClose}>
          <Text style={s.doneBtnLabel}>Done</Text>
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
    maxHeight: '75%',
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
    marginBottom: 24,
  },
  section: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c63ff',
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 8,
  },
  rangeRow: {
    marginBottom: 24,
  },
  rangeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 10,
  },
  rangeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rangeSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    marginRight: 6,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  stepBtnText: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 22,
  },
  rangeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    width: 44,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ccc',
  },
  toggleHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  doneBtn: {
    marginTop: 16,
    backgroundColor: '#6c63ff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
});
