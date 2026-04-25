import { create } from 'zustand';
import {
  Business,
  getBusinessByUser,
  createBusiness,
  updateBusiness,
  BusinessSummary,
  getBusinessSummary,
  Transaction,
  Customer,
  getRecentTransactions,
  getOverdueCustomers,
  getBusinessesByUser,
} from '../db/queries';

interface BusinessState {
  business: Business | null; // Currently active business
  businesses: Business[];    // ALL businesses for this user
  summary: BusinessSummary | null;
  recentTransactions: Transaction[];
  overdueCustomers: Customer[];
  isLoading: boolean;

  // Actions
  loadBusiness: (userId: number) => Promise<void>;
  switchBusiness: (businessId: number) => Promise<void>;
  setupBusiness: (userId: number, name: string, address?: string, logo?: string) => Promise<number>;
  editBusiness: (businessId: number, name: string, address?: string, logo?: string) => Promise<void>;
  refreshSummary: () => Promise<void>;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  business: null,
  businesses: [],
  summary: null,
  recentTransactions: [],
  overdueCustomers: [],
  isLoading: false,

  loadBusiness: async (userId: number) => {
    set({ isLoading: true });
    try {
      const businesses = await getBusinessesByUser(userId);
      set({ businesses });
      
      const active = businesses[0] ?? null;
      set({ business: active, isLoading: false });
      
      if (active) {
        const summary = await getBusinessSummary(active.id);
        const recentTransactions = await getRecentTransactions(active.id);
        const overdueCustomers = await getOverdueCustomers(active.id);
        set({ summary, recentTransactions, overdueCustomers });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },

  switchBusiness: async (businessId: number) => {
    const { businesses } = get();
    const active = businesses.find((b) => b.id === businessId) || null;
    if (active) {
       set({ business: active, isLoading: true });
       const summary = await getBusinessSummary(active.id);
       const recentTransactions = await getRecentTransactions(active.id);
       const overdueCustomers = await getOverdueCustomers(active.id);
       set({ summary, recentTransactions, overdueCustomers, isLoading: false });
    }
  },

  setupBusiness: async (userId, name, address, logo) => {
    const id = await createBusiness(userId, name, address, logo);
    await get().loadBusiness(userId); // Reload to fetch the new business array
    await get().switchBusiness(id); // Switch active to newly created
    return id;
  },

  editBusiness: async (businessId, name, address, logo) => {
    await updateBusiness(businessId, name, address, logo);
    const { business, businesses } = get();
    // Update local businesses array list and active seamlessly
    if (business) {
      await get().loadBusiness(business.user_id);
    }
  },

  refreshSummary: async () => {
    const { business } = get();
    if (!business) return;
    const summary = await getBusinessSummary(business.id);
    const recentTransactions = await getRecentTransactions(business.id);
    const overdueCustomers = await getOverdueCustomers(business.id);
    set({ summary, recentTransactions, overdueCustomers });
  },
}));
