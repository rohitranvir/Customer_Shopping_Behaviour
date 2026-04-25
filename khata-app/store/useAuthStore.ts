import { create } from 'zustand';
import { User, getUser, createUser, updateUserPin } from '../db/queries';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  loadUser: () => Promise<void>;
  setupUser: (name: string, phone: string, pin: string) => Promise<number>;
  verifyPin: (pin: string) => boolean;
  unlock: () => void;
  lock: () => void;
  changePin: (userId: number, newPin: string) => Promise<void>;
  needsSetup: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getUser();
      set({ user, isLoading: false });
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  },

  setupUser: async (name, phone, pin) => {
    const { createUser: dbCreate, createBusiness } = await import('../db/queries');
    const userId = await dbCreate(name, phone, pin);
    const user = await getUser();
    set({ user, isAuthenticated: false });
    return userId;
  },

  verifyPin: (pin: string) => {
    const { user } = get();
    return user?.pin === pin;
  },

  unlock: () => set({ isAuthenticated: true }),

  lock: () => set({ isAuthenticated: false }),

  changePin: async (userId, newPin) => {
    await updateUserPin(userId, newPin);
    const user = await getUser();
    set({ user });
  },

  needsSetup: () => {
    const { user } = get();
    return user === null;
  },
}));
