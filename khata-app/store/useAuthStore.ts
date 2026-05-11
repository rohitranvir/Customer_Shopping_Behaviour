import { create } from 'zustand';
import { User, UserRepository } from '../db/repositories/userRepository';
import { verifyPin } from '../security/pin';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null; // active user
  localUsers: User[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  loadUser: () => Promise<void>;
  switchUser: (userId: number) => Promise<void>;
  setupUser: (name: string, phone: string, pin: string) => Promise<number>;
  verifyPin: (pin: string) => Promise<boolean>;
  unlock: () => void;
  lock: () => void;
  changePin: (userId: number, newPin: string) => Promise<void>;
  needsSetup: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  localUsers: [],
  isAuthenticated: false,
  isLoading: true,

  loadUser: async () => {
    set({ isLoading: true });
    try {
      let users = await UserRepository.getAll();
      
      // Migration for old PINs
      for (let i = 0; i < users.length; i++) {
        if (users[i].pin.length < 64) {
          users[i] = await UserRepository.migratePin(users[i]);
        }
      }
      
      set({ localUsers: users });

      const activeIdStr = await AsyncStorage.getItem('active_user_id');
      let activeUser = null;
      if (activeIdStr) {
        activeUser = users.find(u => u.id === parseInt(activeIdStr)) || null;
      }
      
      set({ user: activeUser, isLoading: false });
    } catch (e) {
      set({ user: null, localUsers: [], isLoading: false });
    }
  },

  switchUser: async (userId: number) => {
    const { localUsers } = get();
    const activeUser = localUsers.find(u => u.id === userId) || null;
    if (activeUser) {
      await AsyncStorage.setItem('active_user_id', userId.toString());
      set({ user: activeUser, isAuthenticated: false }); // Requires PIN unlock
    }
  },

  setupUser: async (name, phone, pin) => {
    const userId = await UserRepository.create(name, phone, pin);
    await AsyncStorage.setItem('active_user_id', userId.toString());
    
    // Reload local users and set active user
    await get().loadUser();
    set({ isAuthenticated: false });
    return userId;
  },

  verifyPin: async (pin: string) => {
    const { user } = get();
    if (!user) return false;
    return await verifyPin(pin, user.pin);
  },

  unlock: () => set({ isAuthenticated: true }),

  lock: () => set({ isAuthenticated: false }),

  changePin: async (userId, newPin) => {
    await UserRepository.updatePin(userId, newPin);
    await get().loadUser();
  },

  needsSetup: () => {
    const { localUsers } = get();
    return localUsers.length === 0;
  },
}));
