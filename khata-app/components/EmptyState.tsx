import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { COLORS } from '../utils/constants';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  const { isDark } = useThemeStore();

  return (
    <View style={styles.container}>
      {/* Illustrated circle background */}
      <View style={[styles.iconCircle, isDark && { backgroundColor: '#1e293b' }]}>
        <View style={[styles.iconCircleInner, isDark && { backgroundColor: '#334155' }]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={52}
            color={isDark ? '#60a5fa' : COLORS.primary}
          />
        </View>
      </View>

      <Text style={[styles.title, isDark && { color: '#f1f5f9' }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isDark && { color: '#94a3b8' }]}>{subtitle}</Text>
      ) : null}
      {action ? <View style={styles.actionWrap}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCircleInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
  actionWrap: {
    marginTop: 24,
  },
});
