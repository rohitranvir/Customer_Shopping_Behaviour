import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import PinPad from '../../components/PinPad';
import { COLORS } from '../../utils/constants';

export default function UnlockScreen() {
  const router = useRouter();
  const { user, localUsers, switchUser, verifyPin, unlock } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(user?.id || null);
  const shakeAnim = new Animated.Value(0);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePin = async (pin: string) => {
    // If we selected a user but they are not the active store user, switch them first
    if (selectedUserId && (!user || user.id !== selectedUserId)) {
      await switchUser(selectedUserId);
    }
    
    const isValid = await verifyPin(pin);
    if (isValid) {
      setError(null);
      unlock();
      router.replace('/(tabs)');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      shake();
      setError(
        newAttempts >= 5
          ? 'Too many attempts. Are you sure about your PIN?'
          : 'Incorrect PIN. Please try again.'
      );
    }
  };

  const handleUserSelect = (id: number) => {
    setSelectedUserId(id);
    setAttempts(0);
    setError(null);
  };

  // If there's no active user selected and we need to show the list
  if (!selectedUserId && localUsers.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="account-group" size={36} color="#fff" />
          </View>
          <Text style={styles.appName}>Select Account</Text>
          <Text style={styles.bizName}>Who is using the app?</Text>
        </View>

        <FlatList
          data={localUsers}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userCard}
              onPress={() => handleUserSelect(item.id)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userPhone}>{item.phone}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.inkMuted} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.addBtn} onPress={() => router.replace('/(auth)/setup')}>
          <MaterialCommunityIcons name="plus-circle" size={20} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Add New Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show PIN entry
  const activeName = localUsers.find(u => u.id === selectedUserId)?.name || user?.name;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="book-account" size={36} color="#fff" />
        </View>
        <Text style={styles.appName}>Khata Book</Text>
        <Text style={styles.bizName}>{activeName}</Text>
      </View>

      <Animated.View style={[styles.padWrap, { transform: [{ translateX: shakeAnim }] }]}>
        <PinPad
          title="Enter PIN"
          subtitle="Enter your 4-digit PIN to unlock"
          onComplete={handlePin}
          error={error}
        />
      </Animated.View>
      
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity style={{ padding: 10, marginBottom: 10 }} onPress={() => setSelectedUserId(null)}>
           <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Switch Account</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>Your data is stored securely on this device</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'space-between',
    paddingVertical: 60,
    alignItems: 'center',
  },
  top: { alignItems: 'center' },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appName: { fontSize: 26, fontWeight: '800', color: COLORS.ink },
  bizName: { fontSize: 14, color: COLORS.inkMuted, marginTop: 4 },
  padWrap: { width: '100%', alignItems: 'center' },
  footer: { fontSize: 12, color: COLORS.inkLight, textAlign: 'center' },
  list: { width: '100%', flex: 1, marginTop: 20 },
  userCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  userName: { fontSize: 16, fontWeight: '600', color: COLORS.ink, marginBottom: 2 },
  userPhone: { fontSize: 13, color: COLORS.inkMuted },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
});
