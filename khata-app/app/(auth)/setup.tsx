import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useGoogleDriveStore } from '../../store/useGoogleDriveStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PinPad from '../../components/PinPad';
import { COLORS, PIN_LENGTH } from '../../utils/constants';

type Step = 'profile' | 'business' | 'pin';

export default function SetupScreen() {
  const router = useRouter();
  const { setupUser } = useAuthStore();
  const { setupBusiness } = useBusinessStore();

  const [step, setStep] = useState<Step>('profile');
  const [loading, setLoading] = useState(false);
  const { signIn, listBackups, backupFiles, restore } = useGoogleDriveStore();

  // Step 1 – Profile
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 – Business
  const [bizName, setBizName] = useState('');
  const [bizAddress, setBizAddress] = useState('');

  // Step 3 – PIN
  const [tempPin, setTempPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const nextStep = () => {
    if (step === 'profile') {
      if (!name.trim() || !phone.trim()) {
        Alert.alert('Required', 'Please enter your name and phone number.');
        return;
      }
      if (phone.length < 10) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
        return;
      }
      setStep('business');
    } else if (step === 'business') {
      if (!bizName.trim()) {
        Alert.alert('Required', 'Please enter your business name.');
        return;
      }
      setStep('pin');
    }
  };

  const handlePinEntry = async (enteredPin: string) => {
    setPinError(null);
    if (!tempPin) {
      setTempPin(enteredPin);
    } else {
      if (enteredPin !== tempPin) {
        setPinError('PINs do not match. Try again.');
        setTempPin('');
        return;
      }
      // PIN matches, complete setup
      await completeSetup(enteredPin);
    }
  };

  const completeSetup = async (finalPin: string) => {
    setLoading(true);
    try {
      const userId = await setupUser(name.trim(), phone.trim(), finalPin);
      await setupBusiness(userId, bizName.trim(), bizAddress.trim() || undefined);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Setup Failed', e?.message ?? 'Could not complete setup. Please try again.');
      setTempPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn();
      const currentUser = await GoogleSignin.getCurrentUser();
      if (!currentUser?.user) throw new Error('Could not get Google user info');

      const gName = currentUser.user.name ?? 'My Shop';
      const gEmail = currentUser.user.email;

      // Check if backup exists
      await listBackups();
      const backups = useGoogleDriveStore.getState().backupFiles;
      
      if (backups.length > 0) {
        const latest = backups[0];
        Alert.alert(
          'Backup Found',
          `We found your previous backup from Google Drive. Restore it?`,
          [
            { 
              text: 'Skip & Start Fresh', 
              onPress: () => finishGoogleSetup(gName, gEmail)
            },
            {
              text: 'Restore Data',
              onPress: async () => {
                try {
                  setLoading(true);
                  await restore(latest.id);
                  await AsyncStorage.setItem('auth_method', 'google');
                  
                  // Refresh global app state
                  await useAuthStore.getState().loadUser();
                  const refreshedUser = useAuthStore.getState().user;
                  if (refreshedUser) {
                    await useBusinessStore.getState().loadBusiness(refreshedUser.id);
                  }
                  
                  router.replace('/(tabs)');
                } catch (e) {
                  Alert.alert('Restore Failed', 'Could not restore backup.');
                  setLoading(false);
                }
              }
            }
          ]
        );
      } else {
        await finishGoogleSetup(gName, gEmail);
      }
    } catch (e: any) {
      Alert.alert('Google Sign-In Failed', e.message ?? 'Please try again.');
      setLoading(false);
    }
  };

  const finishGoogleSetup = async (gName: string, gEmail: string) => {
    try {
      setLoading(true);
      const userId = await setupUser(gName, gEmail, '0000');
      await setupBusiness(userId, `${gName}'s Business`);
      await AsyncStorage.setItem('auth_method', 'google');
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Setup Failed', e.message ?? 'Could not set up account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="book-account" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>Khata Book</Text>
          <Text style={styles.tagline}>Digital Ledger for Shopkeepers</Text>
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {(['profile', 'business', 'pin'] as Step[]).map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepDot, step === s && styles.stepDotActive, i < ['profile', 'business', 'pin'].indexOf(step) && styles.stepDotDone]}>
                {i < ['profile', 'business', 'pin'].indexOf(step) ? (
                  <MaterialCommunityIcons name="check" size={14} color="#fff" />
                ) : (
                  <Text style={styles.stepNum}>{i + 1}</Text>
                )}
              </View>
              {i < 2 && <View style={[styles.stepLine, i < ['profile', 'business', 'pin'].indexOf(step) && styles.stepLineDone]} />}
            </View>
          ))}
        </View>

        {/* Step 1 — Profile */}
        {step === 'profile' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Profile</Text>
            <Text style={styles.cardSub}>Let's start with your information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor={COLORS.inkLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor={COLORS.inkLight}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>
        )}

        {/* Step 2 — Business */}
        {step === 'business' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Business</Text>
            <Text style={styles.cardSub}>Tell us about your shop</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sharma General Store"
                placeholderTextColor={COLORS.inkLight}
                value={bizName}
                onChangeText={setBizName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Address (Optional)</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Shop address..."
                placeholderTextColor={COLORS.inkLight}
                value={bizAddress}
                onChangeText={setBizAddress}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Step 3 — PIN */}
        {step === 'pin' && (
          <View style={[styles.card, styles.pinCard]}>
             {loading ? (
               <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 40 }} />
             ) : (
               <PinPad
                  title={tempPin ? "Confirm PIN" : "Set Your PIN"}
                  subtitle={tempPin ? "Re-enter your 4-digit PIN" : "A 4-digit PIN to secure your ledger"}
                  onComplete={handlePinEntry}
                  error={pinError}
               />
             )}
          </View>
        )}

        {/* CTA */}
        {step !== 'pin' && (
          <View>
            <TouchableOpacity style={styles.btn} onPress={nextStep}>
              <Text style={styles.btnText}>Continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>

            {step === 'profile' && (
              <>
                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                <TouchableOpacity 
                  style={styles.googleBtn} 
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                >
                  <MaterialCommunityIcons name="google" size={20} color={COLORS.ink} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {step !== 'profile' && !loading && (
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            if (step === 'pin') {
               setTempPin('');
               setPinError(null);
               setStep('business');
            } else {
               setStep('profile');
            }
          }}>
            <Text style={styles.backText}>← Go Back</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  scroll: { padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
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
  appName: { fontSize: 28, fontWeight: '800', color: COLORS.ink },
  tagline: { fontSize: 14, color: COLORS.inkMuted, marginTop: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepDotDone: { backgroundColor: COLORS.credit },
  stepNum: { fontSize: 14, fontWeight: '700', color: COLORS.inkLight },
  stepLine: { width: 40, height: 2, backgroundColor: COLORS.border },
  stepLineDone: { backgroundColor: COLORS.credit },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  pinCard: { paddingHorizontal: 0 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: COLORS.ink, marginBottom: 4 },
  cardSub: { fontSize: 14, color: COLORS.inkMuted, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.inkMuted, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.ink,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiline: { height: 80, textAlignVertical: 'top' },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  backBtn: { alignItems: 'center', padding: 8 },
  backText: { fontSize: 14, color: COLORS.inkMuted },
  orDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { marginHorizontal: 10, color: COLORS.inkMuted, fontWeight: '600', fontSize: 12 },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.ink },
});
