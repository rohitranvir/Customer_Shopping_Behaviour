import { create } from 'zustand';
import { User, UserRepository } from '../db/repositories/userRepository';
import { verifyPin } from '../security/pin';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  loadUser: () => Promise<void>;
  setupUser: (name: string, phone: string, pin: string) => Promise<number>;
  verifyPin: (pin: string) => Promise<boolean>;
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
      let user = await UserRepository.getFirst();
      if (user) {
        // Run migration if the user is on old plaintext PIN
        user = await UserRepository.migratePin(user);
      }
      set({ user, isLoading: false });
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  },

  setupUser: async (name, phone, pin) => {
    const userId = await UserRepository.create(name, phone, pin);
    const user = await UserRepository.getFirst();
    set({ user, isAuthenticated: false });
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
    const user = await UserRepository.getFirst();
    set({ user });
  },

  needsSetup: () => {
    const { user } = get();
    return user === null;
  },
}));
