import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  configureGoogleSignIn,
  signInWithGoogle,
  signOutGoogle,
  getGoogleAccessToken,
  uploadBackupToDrive,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  DriveFile,
} from '../utils/googleDrive';
import { exportDatabaseAsJSON, importDatabaseFromJSON } from '../db/backup';

const LAST_BACKUP_KEY = 'last_drive_backup_time';

// ─── State Shape ──────────────────────────────────────────────────────────────
interface GoogleDriveState {
  isSignedIn: boolean;
  accessToken: string | null;
  lastBackup: string | null;
  backupFiles: DriveFile[];
  isLoading: boolean;
  error: string | null;

  // Actions
  init: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  backup: () => Promise<void>;
  listBackups: () => Promise<void>;
  restore: (fileId: string) => Promise<void>;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGoogleDriveStore = create<GoogleDriveState>((set, get) => ({
  isSignedIn: false,
  accessToken: null,
  lastBackup: null,
  backupFiles: [],
  isLoading: false,
  error: null,

  // ── Init: configure GoogleSignin + check if user is already signed in ────────
  init: async () => {
    configureGoogleSignIn();
    try {
      const token = await getGoogleAccessToken();
      const lastBackup = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      if (token) {
        set({ isSignedIn: true, accessToken: token, lastBackup });
      } else {
        set({ isSignedIn: false, accessToken: null, lastBackup });
      }
    } catch {
      set({ isSignedIn: false, accessToken: null });
    }
  },

  // ── Sign In ──────────────────────────────────────────────────────────────────
  signIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await signInWithGoogle();
      const lastBackup = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      set({ isSignedIn: true, accessToken: token, lastBackup, isLoading: false });
    } catch (e: any) {
      const msg =
        e?.code === '12501'
          ? 'Sign-in cancelled.'
          : e?.message ?? 'Google Sign-In failed. Please try again.';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  // ── Sign Out ─────────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOutGoogle();
      set({
        isSignedIn: false,
        accessToken: null,
        backupFiles: [],
        isLoading: false,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Sign-out failed.' });
    }
  },

  // ── Backup: export DB as JSON, upload to Drive ───────────────────────────────
  backup: async () => {
    const { accessToken } = get();
    if (!accessToken) throw new Error('Not signed in to Google.');
    set({ isLoading: true, error: null });
    try {
      const jsonContent = await exportDatabaseAsJSON();
      await uploadBackupToDrive(accessToken, jsonContent);
      const dateStr = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      await AsyncStorage.setItem(LAST_BACKUP_KEY, dateStr);
      set({ lastBackup: dateStr, isLoading: false });
    } catch (e: any) {
      const msg = e?.message ?? 'Backup failed. Please try again.';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  // ── List Backups from Drive ──────────────────────────────────────────────────
  listBackups: async () => {
    const { accessToken } = get();
    if (!accessToken) return;
    set({ isLoading: true, error: null });
    try {
      const files = await listBackupsFromDrive(accessToken);
      set({ backupFiles: files, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Could not list backups.' });
    }
  },

  // ── Restore: download JSON from Drive, import into DB ───────────────────────
  restore: async (fileId: string) => {
    const { accessToken } = get();
    if (!accessToken) throw new Error('Not signed in to Google.');
    set({ isLoading: true, error: null });
    try {
      const jsonContent = await downloadBackupFromDrive(accessToken, fileId);
      await importDatabaseFromJSON(jsonContent);
      set({ isLoading: false });
    } catch (e: any) {
      const msg = e?.message ?? 'Restore failed. The file may be corrupt.';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  // ── Clear error ──────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
