import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// ─── Singleton event bus ────────────────────────────────────────────────────
type Listener = (msg: ToastMessage) => void;
let _listeners: Listener[] = [];
let _counter = 0;

export const Toast = {
  show(message: string, type: ToastType = 'success') {
    const id = ++_counter;
    _listeners.forEach(l => l({ id, message, type }));
  },
  success: (msg: string) => Toast.show(msg, 'success'),
  error:   (msg: string) => Toast.show(msg, 'error'),
  info:    (msg: string) => Toast.show(msg, 'info'),
};

// ─── Individual Toast Item ──────────────────────────────────────────────────
function ToastItem({ toast, onDone }: { toast: ToastMessage; onDone: (id: number) => void }) {
  const anim = useRef(new Animated.Value(0)).current;

  const colors: Record<ToastType, { bg: string; icon: string }> = {
    success: { bg: '#16a34a', icon: 'check-circle' },
    error:   { bg: '#dc2626', icon: 'alert-circle' },
    info:    { bg: '#2563eb', icon: 'information' },
  };

  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.delay(2600),
      Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => onDone(toast.id));
  }, []);

  const { bg, icon } = colors[toast.type];

  return (
    <Animated.View
      style={[
        styles.toastRow,
        { backgroundColor: bg },
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }),
            },
          ],
        },
      ]}
    >
      <MaterialCommunityIcons name={icon as any} size={20} color="#fff" />
      <Text style={styles.toastText} numberOfLines={2}>{toast.message}</Text>
    </Animated.View>
  );
}

// ─── Toast Host (mount once in root layout) ─────────────────────────────────
export function ToastHost() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener: Listener = (msg) => {
      setToasts(prev => [...prev, msg]);
    };
    _listeners.push(listener);
    return () => { _listeners = _listeners.filter(l => l !== listener); };
  }, []);

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <View style={styles.host} pointerEvents="none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDone={remove} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  toastText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
