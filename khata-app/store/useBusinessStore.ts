import { create } from 'zustand';
import { Business, BusinessRepository } from '../db/repositories/businessRepository';
import { BusinessSummary, ReportRepository } from '../db/repositories/reportRepository';
import { Transaction } from '../db/repositories/transactionRepository';
import { Customer } from '../db/repositories/customerRepository';

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
      const businesses = await BusinessRepository.getByUser(userId);
      set({ businesses });
      
      const active = businesses[0] ?? null;
      set({ business: active, isLoading: false });
      
      if (active) {
        const [summary, recentTransactions, overdueCustomers] = await Promise.all([
          ReportRepository.getBusinessSummary(active.id),
          ReportRepository.getRecentTransactions(active.id),
          ReportRepository.getOverdueCustomers(active.id)
        ]);
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
       const [summary, recentTransactions, overdueCustomers] = await Promise.all([
         ReportRepository.getBusinessSummary(active.id),
         ReportRepository.getRecentTransactions(active.id),
         ReportRepository.getOverdueCustomers(active.id)
       ]);
       set({ summary, recentTransactions, overdueCustomers, isLoading: false });
    }
  },

  setupBusiness: async (userId, name, address, logo) => {
    const id = await BusinessRepository.create(userId, name, address, logo);
    await get().loadBusiness(userId); // Reload to fetch the new business array
    await get().switchBusiness(id); // Switch active to newly created
    return id;
  },

  editBusiness: async (businessId, name, address, logo) => {
    await BusinessRepository.update(businessId, name, address, logo);
    const { business } = get();
    // Update local businesses array list and active seamlessly
    if (business) {
      await get().loadBusiness(business.user_id);
    }
  },

  refreshSummary: async () => {
    const { business } = get();
    if (!business) return;
    try {
      const [summary, recentTransactions, overdueCustomers] = await Promise.all([
        ReportRepository.getBusinessSummary(business.id),
        ReportRepository.getRecentTransactions(business.id),
        ReportRepository.getOverdueCustomers(business.id)
      ]);
      set({ summary, recentTransactions, overdueCustomers });
    } catch (error) {
      console.error("Failed to refresh summary:", error);
    }
  },
}));
