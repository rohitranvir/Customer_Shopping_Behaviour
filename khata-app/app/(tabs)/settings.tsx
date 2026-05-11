import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useGoogleDriveStore } from '../../store/useGoogleDriveStore';
// backup utilities used in local file restore path only (no JSON export needed here)
import { seedTestData } from '../../db/seed';
import { exportToCSV } from '../../utils/csv';
import { scheduleDailyReminder, cancelAllReminders, requestNotificationPermission } from '../../utils/notifications';
import { getDatabase } from '../../db/database';
import { COLORS, APP_NAME, APP_VERSION } from '../../utils/constants';
import * as Haptics from 'expo-haptics';
import { Toast } from '../../components/Toast';

type ColorScheme = 'system' | 'light' | 'dark';

// ─── Reusable Section Header ──────────────────────────────────────────────────
function SectionHeader({ icon, label, isDark }: { icon: string; label: string; isDark: boolean }) {
  return (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.primary} />
      <Text style={[styles.sectionTitle, isDark && styles.dark_text]}>{label}</Text>
    </View>
  );
}

// ─── Reusable Row ─────────────────────────────────────────────────────────────
function SettingRow({
  icon, label, subtitle, isDark, right, onPress, danger,
}: {
  icon: string; label: string; subtitle?: string; isDark: boolean;
  right?: React.ReactNode; onPress?: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, isDark && styles.dark_row]}
      onPress={() => {
        if (onPress) {
          Haptics.selectionAsync();
          onPress();
        }
      }}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color={danger ? COLORS.debit : (isDark ? '#94a3b8' : COLORS.inkMuted)}
        style={styles.rowIcon}
      />
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && styles.dangerText, isDark && styles.dark_text]}>{label}</Text>
        {subtitle ? <Text style={[styles.rowSub, isDark && styles.dark_sub]}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#475569' : COLORS.border} /> : null)}
    </TouchableOpacity>
  );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View style={[styles.card, isDark && styles.dark_card]}>
      {children}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { user, changePin, loadUser } = useAuthStore();
  const { business, businesses, editBusiness, setupBusiness, switchBusiness, loadBusiness } = useBusinessStore();
  const { isDark, colorScheme, setColorScheme } = useThemeStore();

  // Google Drive store
  const {
    isSignedIn: driveSignedIn,
    lastBackup: driveLastBackup,
    backupFiles,
    isLoading: driveLoading,
    isAutoBackupEnabled,
    backupFrequency,
    init: driveInit,
    signIn: driveSignIn,
    signOut: driveSignOut,
    backup: driveBackup,
    listBackups: driveListBackups,
    restore: driveRestore,
    setAutoBackupEnabled,
    setBackupFrequency,
  } = useGoogleDriveStore();

  // Local backup state
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [localBackupLoading, setLocalBackupLoading] = useState(false);

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [overdueNotif, setOverdueNotif] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);

  // Profile edit modal
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editShopName, setEditShopName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLogo, setEditLogo] = useState<string | null>(null);

  // PIN change modal
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // New business modal
  const [newBizModal, setNewBizModal] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizAddress, setNewBizAddress] = useState('');

  // Seed test data
  const [seedLoading, setSeedLoading] = useState(false);

  // Generic loading overlay
  const [busyMsg, setBusyMsg] = useState<string | null>(null);

  useEffect(() => {
    init();
    driveInit(); // configure Google Sign-In and restore session silently
  }, []);

  const init = async () => {
    const last = await AsyncStorage.getItem('last_local_backup');
    const notif = await AsyncStorage.getItem('notif_enabled');
    const overdue = await AsyncStorage.getItem('overdue_notif');
    const hour = await AsyncStorage.getItem('notif_hour');
    const min = await AsyncStorage.getItem('notif_minute');
    if (last) setLastBackup(last);
    if (notif === 'true') setNotifEnabled(true);
    if (overdue === 'true') setOverdueNotif(true);
    if (hour) setReminderHour(+hour);
    if (min) setReminderMinute(+min);
  };

  // ── Google Drive handlers ──────────────────────────────────────────────────
  const handleDriveSignIn = async () => {
    try {
      await driveSignIn();
      Toast.success('Connected to Google Drive!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Sign-In Failed', e.message);
    }
  };

  const handleDriveBackup = async () => {
    try {
      await driveBackup();
      Toast.success('Backed up to Google Drive!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Backup Failed', e.message);
    }
  };

  const handleDriveRestore = async () => {
    const identity = user?.phone;
    if (!identity) {
      Alert.alert('Error', 'Could not determine user identity for restore.');
      return;
    }
    await driveListBackups(identity);
    const { backupFiles } = useGoogleDriveStore.getState();
    if (backupFiles.length === 0) {
      Alert.alert('No Backups Found', `No backup found in Google Drive for account: ${identity}.`);
      return;
    }
    const latest = backupFiles[0];
    const dateLabel = latest.createdTime
      ? new Date(latest.createdTime).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : 'Unknown date';
    Alert.alert(
      'Restore from Drive',
      `Restore your backup?\n\n📁 ${latest.name}\n🕐 ${dateLabel}\n\nThis will overwrite YOUR current data only.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore', style: 'destructive',
          onPress: async () => {
            setBusyMsg('Restoring from Google Drive...');
            try {
              await driveRestore(latest.id);
              await loadUser();
              const refreshedUser = useAuthStore.getState().user;
              if (refreshedUser) {
                await loadBusiness(refreshedUser.id);
              }
              setBusyMsg(null);
              Toast.success('Restored successfully! Data updated.');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e: any) {
              setBusyMsg(null);
              Alert.alert('Restore Failed', e.message);
            }
          },
        },
      ]
    );
  };

  const handleDriveSignOut = () => {
    Alert.alert(
      'Disconnect Google Drive',
      'Are you sure you want to sign out from Google Drive?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: async () => {
          await driveSignOut();
          Toast.success('Disconnected from Google Drive.');
        }},
      ]
    );
  };

  const handleChangeBackupFreq = () => {
    Alert.alert('Backup Frequency', 'Choose how often to auto-backup to Google Drive', [
      { text: 'Every Transaction', onPress: () => setBackupFrequency('TRANSACTION') },
      { text: 'Daily', onPress: () => setBackupFrequency('DAILY') },
      { text: 'Weekly', onPress: () => setBackupFrequency('WEEKLY') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Profile ────────────────────────────────────────────────────────────────
  const openProfileModal = () => {
    setEditShopName(business?.name ?? '');
    setEditAddress(business?.address ?? '');
    setEditLogo(business?.logo ?? null);
    setProfileModalVisible(true);
  };

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      setEditLogo(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!business || !editShopName.trim()) return;
    setBusyMsg('Saving profile...');
    try {
      await editBusiness(business.id, editShopName.trim(), editAddress.trim() || undefined, editLogo ?? undefined);
      setProfileModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.success('Profile updated successfully.');
    } catch (e: any) {
      Toast.error(e.message);
    } finally {
      setBusyMsg(null);
    }
  };

  const savePin = async () => {
    if (!user) return;
    if (newPin.length !== 4) { Toast.error('PIN must be exactly 4 digits.'); return; }
    if (newPin !== confirmPin) { Toast.error('PINs do not match.'); return; }
    await changePin(user.id, newPin);
    setPinModalVisible(false);
    setNewPin(''); setConfirmPin('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.success('Your PIN has been updated.');
  };

  // ── Notifications ──────────────────────────────────────────────────────────
  const toggleNotifications = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) { Alert.alert('Permission Denied', 'Enable notifications in device settings.'); return; }
      await scheduleDailyReminder(reminderHour, reminderMinute);
    } else {
      await cancelAllReminders();
    }
    setNotifEnabled(val);
    await AsyncStorage.setItem('notif_enabled', val ? 'true' : 'false');
  };


  // ── Local Backup ────────────────────────────────────────────────────────────
  const handleBackup = async () => {
    setLocalBackupLoading(true);
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/khata.db`;
      const backupName = `KhataBackup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
      const backupPath = `${FileSystem.cacheDirectory}${backupName}`;
      await FileSystem.copyAsync({ from: dbPath, to: backupPath });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing Not Available', 'Your device does not support file sharing.');
        return;
      }
      await Sharing.shareAsync(backupPath, { mimeType: 'application/octet-stream', dialogTitle: 'Save your KhataBook backup' });
      const dateStr = new Date().toLocaleString('en-IN');
      setLastBackup(dateStr);
      await AsyncStorage.setItem('last_local_backup', dateStr);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.success('Backup file shared successfully!');
    } catch (e: any) {
      Toast.error('Backup failed: ' + (e.message ?? 'Unknown error'));
    } finally {
      setLocalBackupLoading(false);
    }
  };



  const handleRestore = async () => {
    Alert.alert(
      '⚠️ Restore Backup',
      'This will REPLACE all your current data with the backup file. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setBusyMsg('Restoring backup...');
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
              });
              if (result.canceled || !result.assets?.[0]) {
                setBusyMsg(null);
                return;
              }
              const pickedUri = result.assets[0].uri;
              const dbPath = `${FileSystem.documentDirectory}SQLite/khata.db`;
              await FileSystem.copyAsync({ from: pickedUri, to: dbPath });
              await loadUser();
              const refreshedUser = useAuthStore.getState().user;
              if (refreshedUser) {
                await loadBusiness(refreshedUser.id);
              }
              setBusyMsg(null);
              Toast.success('Restore successful! Data updated.');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e: any) {
              setBusyMsg(null);
              Alert.alert('Restore Failed', e.message ?? 'Could not restore. Make sure the file is a valid .db backup.');
            }
          },
        },
      ]
    );
  };


  // ── Seed Test Data ──────────────────────────────────────────────────────────
  const handleSeedData = async () => {
    if (!business) {
      Alert.alert('No Business', 'Please set up a business profile first.');
      return;
    }
    Alert.alert(
      'Load Test Data',
      'This will add 4 sample customers with transactions. Existing customers with the same phone number will be skipped.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: async () => {
            setSeedLoading(true);
            try {
              const count = await seedTestData(business.id);
              if (count === 0) {
                Toast.success('Test data already loaded — no duplicates added.');
              } else {
                Toast.success(`Added ${count} test customer${count > 1 ? 's' : ''} with transactions!`);
              }
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e: any) {
              Alert.alert('Seed Failed', e.message ?? 'Could not insert test data.');
            } finally {
              setSeedLoading(false);
            }
          },
        },
      ]
    );
  };

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    if (!business) return;
    setBusyMsg('Preparing CSV export...');
    try {
      await exportToCSV(business.name);
    } catch (e: any) { Alert.alert('Export Failed', e.message); }
    finally { setBusyMsg(null); }
  };

  // ── Clear All Data ─────────────────────────────────────────────────────────
  const handleClearData = () => {
    Alert.alert(
      '⚠️ Clear All Data',
      'This will permanently delete ALL your customers, transactions, and business data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE EVERYTHING', style: 'destructive',
          onPress: async () => {
            setBusyMsg('Clearing all data...');
            try {
              const db = await getDatabase();
              await db.execAsync(`
                DELETE FROM transactions;
                DELETE FROM customers;
                DELETE FROM business;
                DELETE FROM users;
              `);
              await loadUser();
            } catch (e: any) { Alert.alert('Error', e.message); }
            finally { setBusyMsg(null); }
          },
        },
      ]
    );
  };

  // ── Add Business ───────────────────────────────────────────────────────────
  const handleAddBusiness = async () => {
    if (!user || !newBizName.trim()) { Alert.alert('Required', 'Please enter a business name.'); return; }
    setBusyMsg('Creating business...');
    try {
      await setupBusiness(user.id, newBizName.trim(), newBizAddress.trim() || undefined);
      setNewBizModal(false);
      setNewBizName(''); setNewBizAddress('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.success(`Switched to "${newBizName}".`);
    } catch (e: any) { Toast.error(e.message); }
    finally { setBusyMsg(null); }
  };

  // ─── Dark background helper ───────────────────────────────────────────────
  const bg = isDark ? '#0f172a' : COLORS.surfaceSecondary;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Loading Overlay */}
      {busyMsg && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.overlayText}>{busyMsg}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── HEADER ─────────────────────────────────────────────────────── */}
        <View style={[styles.pageHeader, isDark && styles.dark_card]}>
          {business?.logo ? (
            <Image source={{ uri: business.logo }} style={styles.logoImg} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <MaterialCommunityIcons name="store" size={28} color="#fff" />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.headerBiz, isDark && styles.dark_text]}>{business?.name ?? 'Your Business'}</Text>
            <Text style={[styles.headerUser, isDark && styles.dark_sub]}>{user?.name} • {user?.phone}</Text>
          </View>
          <TouchableOpacity onPress={openProfileModal} style={styles.editHeaderBtn}>
            <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── 1. PROFILE ─────────────────────────────────────────────────── */}
        <SectionHeader icon="account-circle" label="Profile" isDark={isDark} />
        <Card isDark={isDark}>
          <SettingRow icon="store-edit" label="Edit Shop Profile" subtitle="Name, address, logo" isDark={isDark} onPress={openProfileModal} />
          <View style={[styles.divider, isDark && styles.dark_divider]} />
          <SettingRow icon="lock-reset" label="Change PIN" subtitle="Update your 4-digit security PIN" isDark={isDark} onPress={() => setPinModalVisible(true)} />
        </Card>

        {/* ─── 2. APPEARANCE ──────────────────────────────────────────────── */}
        <SectionHeader icon="palette" label="Appearance" isDark={isDark} />
        <Card isDark={isDark}>
          {(['system', 'light', 'dark'] as ColorScheme[]).map((mode, i) => {
            const labels = { system: 'System Default', light: 'Light Mode', dark: 'Dark Mode' };
            const icons = { system: 'theme-light-dark', light: 'white-balance-sunny', dark: 'moon-waning-crescent' };
            const isActive = colorScheme === mode;
            return (
              <View key={mode}>
                {i > 0 && <View style={[styles.divider, isDark && styles.dark_divider]} />}
                <SettingRow
                  icon={icons[mode]}
                  label={labels[mode]}
                  isDark={isDark}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setColorScheme(mode);
                  }}
                  right={
                    <View style={[styles.radioOuter, isActive && styles.radioActive]}>
                      {isActive && <View style={styles.radioInner} />}
                    </View>
                  }
                />
              </View>
            );
          })}
        </Card>

        {/* ─── 3. BUSINESS ────────────────────────────────────────────────── */}
        <SectionHeader icon="domain" label="Business Accounts" isDark={isDark} />
        <Card isDark={isDark}>
          {businesses.map((biz, i) => {
            const isActive = biz.id === business?.id;
            return (
              <View key={biz.id}>
                {i > 0 && <View style={[styles.divider, isDark && styles.dark_divider]} />}
                <SettingRow
                  icon="store"
                  label={biz.name}
                  subtitle={isActive ? 'Currently active' : biz.address ?? ''}
                  isDark={isDark}
                  onPress={isActive ? undefined : () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    switchBusiness(biz.id);
                  }}
                  right={
                    isActive
                      ? <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>
                      : <MaterialCommunityIcons name="swap-horizontal" size={20} color={COLORS.primary} />
                  }
                />
              </View>
            );
          })}
          <View style={[styles.divider, isDark && styles.dark_divider]} />
          <SettingRow
            icon="plus-circle"
            label="Add Another Business"
            subtitle="Manage a separate set of customers"
            isDark={isDark}
            onPress={() => setNewBizModal(true)}
          />
        </Card>

        {/* ─── 4. REMINDERS ───────────────────────────────────────────────── */}
        <SectionHeader icon="bell" label="Reminders" isDark={isDark} />
        <Card isDark={isDark}>
          <SettingRow
            icon="bell-ring"
            label="Daily Reminder"
            subtitle={`At ${String(reminderHour).padStart(2,'0')}:${String(reminderMinute).padStart(2,'0')} every day`}
            isDark={isDark}
            right={
              <Switch
                value={notifEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={notifEnabled ? COLORS.primary : '#f4f3f4'}
              />
            }
          />
          {notifEnabled && (
            <>
              <View style={[styles.divider, isDark && styles.dark_divider]} />
              <View style={styles.timePickerRow}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={isDark ? '#94a3b8' : COLORS.inkMuted} style={styles.rowIcon} />
                <Text style={[styles.rowLabel, isDark && styles.dark_text]}>Reminder Time</Text>
                <View style={styles.timeInputsRow}>
                  <TextInput
                    style={[styles.timeInput, isDark && styles.dark_input]}
                    value={String(reminderHour).padStart(2, '0')}
                    keyboardType="number-pad"
                    maxLength={2}
                    onChangeText={(v) => setReminderHour(Math.min(23, +v || 0))}
                  />
                  <Text style={[styles.timeSep, isDark && styles.dark_text]}>:</Text>
                  <TextInput
                    style={[styles.timeInput, isDark && styles.dark_input]}
                    value={String(reminderMinute).padStart(2, '0')}
                    keyboardType="number-pad"
                    maxLength={2}
                    onChangeText={(v) => setReminderMinute(Math.min(59, +v || 0))}
                  />
                  <TouchableOpacity
                    style={styles.timeSetBtn}
                    onPress={async () => {
                      await scheduleDailyReminder(reminderHour, reminderMinute);
                      await AsyncStorage.multiSet([
                        ['notif_hour', String(reminderHour)],
                        ['notif_minute', String(reminderMinute)],
                      ]);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Toast.success(`Reminder set for ${String(reminderHour).padStart(2,'0')}:${String(reminderMinute).padStart(2,'0')}`);
                    }}
                  >
                    <Text style={styles.timeSetBtnText}>Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          <View style={[styles.divider, isDark && styles.dark_divider]} />
          <SettingRow
            icon="alert-circle"
            label="Remind for Overdue"
            subtitle="Get notified about customers with past due dates"
            isDark={isDark}
            right={
              <Switch
                value={overdueNotif}
                onValueChange={async (v) => { setOverdueNotif(v); await AsyncStorage.setItem('overdue_notif', v ? 'true' : 'false'); }}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={overdueNotif ? COLORS.primary : '#f4f3f4'}
              />
            }
          />
        </Card>

        {/* ─── 5. GOOGLE DRIVE BACKUP ─────────────────────────────────────── */}
        <SectionHeader icon="google-drive" label="Google Drive Backup" isDark={isDark} />
        <Card isDark={isDark}>
          {driveSignedIn ? (
            // ── Connected State ──
            <>
              <View style={styles.driveConnectedBox}>
                <MaterialCommunityIcons name="google" size={22} color="#16a34a" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.rowLabel, isDark && styles.dark_text]}>Google Drive Connected</Text>
                  {driveLastBackup
                    ? <Text style={[styles.rowSub, isDark && styles.dark_sub]}>Last backup: {driveLastBackup}</Text>
                    : <Text style={[styles.rowSub, isDark && styles.dark_sub]}>No backup yet</Text>
                  }
                </View>
                <TouchableOpacity onPress={handleDriveSignOut}>
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.divider, isDark && styles.dark_divider]} />
              
              <SettingRow
                icon="cloud-sync"
                label="Auto Backup"
                subtitle="Automatically upload data to Drive"
                isDark={isDark}
                right={
                  <Switch
                    value={isAutoBackupEnabled}
                    onValueChange={setAutoBackupEnabled}
                    trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                    thumbColor={isAutoBackupEnabled ? COLORS.primary : '#f4f3f4'}
                  />
                }
              />
              
              {isAutoBackupEnabled && (
                <>
                  <View style={[styles.divider, isDark && styles.dark_divider]} />
                  <SettingRow
                    icon="clock-outline"
                    label="Backup Frequency"
                    subtitle={`Current: ${backupFrequency === 'TRANSACTION' ? 'Every transaction' : backupFrequency === 'DAILY' ? 'Daily' : 'Weekly'}`}
                    isDark={isDark}
                    onPress={handleChangeBackupFreq}
                  />
                </>
              )}

              <View style={[styles.divider, isDark && styles.dark_divider]} />
              <SettingRow
                icon="cloud-upload"
                label="Backup Now"
                subtitle="Manually upload data to Google Drive"
                isDark={isDark}
                onPress={handleDriveBackup}
                right={driveLoading ? <ActivityIndicator size="small" color={COLORS.primary} /> : undefined}
              />
              <View style={[styles.divider, isDark && styles.dark_divider]} />
              <SettingRow
                icon="cloud-download"
                label="Restore from Google Drive"
                subtitle="Download and restore your latest backup"
                isDark={isDark}
                onPress={handleDriveRestore}
              />
            </>
          ) : (
            // ── Not Connected State ──
            <SettingRow
              icon="google"
              label="Connect Google Drive"
              subtitle="Sign in to back up to your own Google Drive"
              isDark={isDark}
              onPress={handleDriveSignIn}
              right={driveLoading
                ? <ActivityIndicator size="small" color={COLORS.primary} />
                : <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
              }
            />
          )}
        </Card>

        {/* ─── 6. LOCAL BACKUP ────────────────────────────────────────────── */}
        <SectionHeader icon="database" label="Local Backup" isDark={isDark} />
        <Card isDark={isDark}>
          {/* Last backup info */}
          {lastBackup && (
            <View style={styles.driveConnectedBox}>
              <MaterialCommunityIcons name="check-circle" size={22} color="#16a34a" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.rowLabel, isDark && styles.dark_text]}>Last Backup</Text>
                <Text style={[styles.rowSub, isDark && styles.dark_sub]}>{lastBackup}</Text>
              </View>
            </View>
          )}
          {lastBackup && <View style={[styles.divider, isDark && styles.dark_divider]} />}

          <SettingRow
            icon="database-export"
            label="Backup Data"
            subtitle="Save a .db backup file to your device"
            isDark={isDark}
            onPress={handleBackup}
            right={localBackupLoading ? <ActivityIndicator size="small" color={COLORS.primary} /> : undefined}
          />

          <View style={[styles.divider, isDark && styles.dark_divider]} />
          <SettingRow
            icon="database-import"
            label="Restore Backup"
            subtitle="Restore from a previously saved .db file"
            isDark={isDark}
            onPress={handleRestore}
          />

          <View style={[styles.divider, isDark && styles.dark_divider]} />
          <SettingRow 
            icon="database-plus" 
            label="Load Test Data" 
            subtitle="Add fake customers & transactions" 
            isDark={isDark} 
            onPress={handleSeedData}
            right={seedLoading ? <ActivityIndicator size="small" color={COLORS.primary} /> : undefined}
          />

          <View style={[styles.divider, isDark && styles.dark_divider]} />
          <SettingRow icon="file-delimited" label="Export as CSV" subtitle="Download all data as a spreadsheet" isDark={isDark} onPress={handleExportCSV} />

          <View style={[styles.divider, isDark && styles.dark_divider]} />
          <SettingRow icon="delete-sweep" label="Clear All Data" subtitle="Permanently erase everything" danger isDark={isDark} onPress={handleClearData} />
        </Card>

        {/* ─── APP INFO ───────────────────────────────────────────────────── */}
        <Card isDark={isDark}>
          <SettingRow icon="information" label={`${APP_NAME} v${APP_VERSION}`} subtitle="Made for Indian shopkeepers 🇮🇳" isDark={isDark} />
        </Card>

        {/* ─── DEVELOPER CREDIT ───────────────────────────────────────────── */}
        <View style={[
          styles.devCard,
          isDark && { backgroundColor: '#1e293b', borderColor: '#334155' },
        ]}>
          <View style={styles.devCardInner}>
            <View style={[styles.devIconWrap, isDark && { backgroundColor: '#0f172a' }]}>
              <MaterialCommunityIcons name="code-braces" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.devTitle, isDark && { color: '#64748b' }]}>Developed by</Text>
              <Text style={[styles.devName, isDark && { color: '#f1f5f9' }]}>Rohit Ranvira</Text>
            </View>
            <MaterialCommunityIcons name="heart" size={16} color="#f43f5e" />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Profile Edit Modal ─────────────────────────────────────────── */}
      <Modal visible={profileModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setProfileModalVisible(false)}>
        <View style={[styles.modalContainer, isDark && { backgroundColor: '#0f172a' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.dark_text]}>Edit Shop Profile</Text>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={isDark ? '#94a3b8' : COLORS.inkMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoPicker} onPress={pickLogo}>
            {editLogo ? (
              <Image source={{ uri: editLogo }} style={styles.logoPreview} />
            ) : (
              <View style={styles.logoPlaceholderLg}>
                <MaterialCommunityIcons name="camera-plus" size={32} color="#fff" />
                <Text style={{ color: '#fff', marginTop: 4, fontSize: 12 }}>Upload Logo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.inputLabel, isDark && styles.dark_sub]}>Shop Name *</Text>
          <TextInput
            style={[styles.modalInput, isDark && styles.dark_input]}
            value={editShopName}
            onChangeText={setEditShopName}
            placeholder="Enter shop name"
            placeholderTextColor={COLORS.inkLight}
          />
          <Text style={[styles.inputLabel, isDark && styles.dark_sub]}>Address</Text>
          <TextInput
            style={[styles.modalInput, styles.multilineInput, isDark && styles.dark_input]}
            value={editAddress}
            onChangeText={setEditAddress}
            placeholder="Shop address (optional)"
            placeholderTextColor={COLORS.inkLight}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── PIN Change Modal ───────────────────────────────────────────── */}
      <Modal visible={pinModalVisible} animationType="fade" transparent onRequestClose={() => setPinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModalCard, isDark && { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.modalTitle, isDark && styles.dark_text]}>Change PIN</Text>
            <TextInput
              style={[styles.modalInput, isDark && styles.dark_input]}
              value={newPin}
              onChangeText={setNewPin}
              placeholder="New 4-digit PIN"
              placeholderTextColor={COLORS.inkLight}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <TextInput
              style={[styles.modalInput, isDark && styles.dark_input]}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="Confirm new PIN"
              placeholderTextColor={COLORS.inkLight}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: COLORS.border }]} onPress={() => setPinModalVisible(false)}>
                <Text style={[styles.saveBtnText, { color: COLORS.ink }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={savePin}>
                <Text style={styles.saveBtnText}>Update PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add New Business Modal ─────────────────────────────────────── */}
      <Modal visible={newBizModal} animationType="fade" transparent onRequestClose={() => setNewBizModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModalCard, isDark && { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.modalTitle, isDark && styles.dark_text]}>Add Business</Text>
            <TextInput
              style={[styles.modalInput, isDark && styles.dark_input]}
              value={newBizName}
              onChangeText={setNewBizName}
              placeholder="Business name *"
              placeholderTextColor={COLORS.inkLight}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.modalInput, isDark && styles.dark_input]}
              value={newBizAddress}
              onChangeText={setNewBizAddress}
              placeholder="Address (optional)"
              placeholderTextColor={COLORS.inkLight}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: COLORS.border }]} onPress={() => setNewBizModal(false)}>
                <Text style={[styles.saveBtnText, { color: COLORS.ink }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={handleAddBusiness}>
                <Text style={styles.saveBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingTop: 56 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: { marginTop: 12, color: '#fff', fontSize: 15, fontWeight: '600' },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerBiz: { fontSize: 16, fontWeight: '800', color: COLORS.ink },
  headerUser: { fontSize: 12, color: COLORS.inkMuted, marginTop: 2 },
  editHeaderBtn: { padding: 8, backgroundColor: COLORS.primaryLight, borderRadius: 20 },

  logoImg: { width: 52, height: 52, borderRadius: 12 },
  logoPlaceholder: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 8, marginTop: 8, paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.inkMuted, textTransform: 'uppercase', letterSpacing: 0.6 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
  },
  rowIcon: { marginRight: 14 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: COLORS.ink },
  rowSub: { fontSize: 12, color: COLORS.inkMuted, marginTop: 2 },
  dangerText: { color: COLORS.debit },

  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 52 },

  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  activeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },

  driveConnectedBox: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14,
    backgroundColor: '#f0fdf4',
  },
  disconnectText: { fontSize: 12, fontWeight: '700', color: COLORS.debit },

  timePickerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  timeInputsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  timeInput: {
    width: 44, height: 36, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, textAlign: 'center', fontSize: 15, fontWeight: '700',
    color: COLORS.ink,
  },
  timeSep: { fontSize: 18, fontWeight: '700', color: COLORS.ink, paddingHorizontal: 2 },
  timeSetBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 12, height: 36,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  timeSetBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ── Modals ────────────────────────────────────────────────────────────────
  modalContainer: { flex: 1, backgroundColor: COLORS.surfaceSecondary, padding: 24, paddingTop: 60 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.ink },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  pinModalCard: {
    width: '100%', backgroundColor: COLORS.surface,
    borderRadius: 20, padding: 24,
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.inkMuted, marginBottom: 6 },
  modalInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, height: 48, fontSize: 15, color: COLORS.ink,
    marginBottom: 16,
  },
  multilineInput: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  logoPicker: { alignSelf: 'center', marginBottom: 24 },
  logoPreview: { width: 100, height: 100, borderRadius: 16 },
  logoPlaceholderLg: {
    width: 100, height: 100, borderRadius: 16, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Dark Mode tokens used alongside StyleSheet ─────────────────────────────
  dark_text: { color: '#f1f5f9' },
  dark_sub: { color: '#94a3b8' },
  dark_card: { backgroundColor: '#1e293b' },
  dark_row: { backgroundColor: '#1e293b' },
  dark_divider: { backgroundColor: '#334155' },
  dark_input: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' },

  // ── Developer Credit Card ──────────────────────────────────────────────────
  devCard: {
    marginHorizontal: 0,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 1,
  },
  devCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  devIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
  },
  devTitle: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
});
