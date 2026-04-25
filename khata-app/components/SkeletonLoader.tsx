import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

function SkeletonBox({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonBoxProps) {
  const { isDark } = useThemeStore();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const baseColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: baseColor, opacity },
        style,
      ]}
    />
  );
}

// ─── Customer List Skeleton ─────────────────────────────────────────────────
export function CustomerListSkeleton() {
  const { isDark } = useThemeStore();
  const cardBg = isDark ? '#1e293b' : '#fff';

  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <View key={i} style={[styles.card, { backgroundColor: cardBg }]}>
          <SkeletonBox width={48} height={48} borderRadius={24} />
          <View style={styles.info}>
            <SkeletonBox width="60%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonBox width="40%" height={12} />
          </View>
          <View style={styles.right}>
            <SkeletonBox width={70} height={16} style={{ marginBottom: 6 }} />
            <SkeletonBox width={50} height={10} />
          </View>
        </View>
      ))}
    </>
  );
}

// ─── Transaction List Skeleton ──────────────────────────────────────────────
export function TransactionListSkeleton() {
  const { isDark } = useThemeStore();
  const cardBg = isDark ? '#1e293b' : '#fff';

  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={[styles.txCard, { backgroundColor: cardBg }]}>
          <SkeletonBox width={36} height={36} borderRadius={18} />
          <View style={styles.info}>
            <SkeletonBox width="55%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonBox width="35%" height={11} />
          </View>
          <SkeletonBox width={60} height={16} />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    gap: 14,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    gap: 12,
  },
  info: { flex: 1 },
  right: { alignItems: 'flex-end' },
});
