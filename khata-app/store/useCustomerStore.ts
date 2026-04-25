import { create } from 'zustand';
import {
  Customer,
  Transaction,
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createTransaction,
  deleteTransaction,
  searchCustomers,
  updateTransaction,
  getTransactionsByCustomer,
} from '../db/queries';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  transactions: Transaction[];
  isLoading: boolean;
  searchQuery: string;

  // Actions
  loadCustomers: (businessId: number) => Promise<void>;
  searchAndFilter: (businessId: number, query: string) => Promise<void>;
  selectCustomer: (id: number) => Promise<void>;
  addCustomer: (businessId: number, name: string, phone?: string, openingBalance?: number) => Promise<number>;
  editCustomer: (id: number, name: string, phone?: string) => Promise<void>;
  removeCustomer: (id: number) => Promise<void>;

  loadTransactions: (customerId: number) => Promise<void>;
  addTransaction: (
    customerId: number,
    type: 'CREDIT' | 'DEBIT',
    amount: number,
    note?: string,
    date?: string,
    dueDate?: string
  ) => Promise<void>;
  editTransaction: (
    txId: number,
    customerId: number,
    amount: number,
    note?: string,
    date?: string,
    dueDate?: string
  ) => Promise<void>;
  removeTransaction: (id: number, customerId: number) => Promise<void>;

  setSearchQuery: (q: string) => void;
  clearSelection: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  transactions: [],
  isLoading: false,
  searchQuery: '',

  loadCustomers: async (businessId) => {
    set({ isLoading: true });
    try {
      const customers = await getAllCustomers(businessId);
      set({ customers, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  searchAndFilter: async (businessId, query) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      await get().loadCustomers(businessId);
      return;
    }
    const customers = await searchCustomers(businessId, query);
    set({ customers });
  },

  selectCustomer: async (id) => {
    const customer = await getCustomerById(id);
    set({ selectedCustomer: customer });
  },

  addCustomer: async (businessId, name, phone, openingBalance = 0) => {
    const id = await createCustomer(businessId, name, phone, openingBalance);
    await get().loadCustomers(businessId);
    return id;
  },

  editCustomer: async (id, name, phone) => {
    await updateCustomer(id, name, phone);
    const { selectedCustomer, customers } = get();
    // Refresh selected customer and list
    if (selectedCustomer?.id === id) {
      const updated = await getCustomerById(id);
      set({ selectedCustomer: updated });
    }
    // Re-fetch list
    const businessId = customers[0]?.business_id;
    if (businessId) await get().loadCustomers(businessId);
  },

  removeCustomer: async (id) => {
    await deleteCustomer(id);
    const { customers } = get();
    const updated = customers.filter((c) => c.id !== id);
    set({ customers: updated, selectedCustomer: null, transactions: [] });
  },

  loadTransactions: async (customerId) => {
    set({ isLoading: true });
    try {
      const transactions = await getTransactionsByCustomer(customerId);
      set({ transactions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addTransaction: async (customerId, type, amount, note, date, dueDate) => {
    await createTransaction(customerId, type, amount, note, date, dueDate);
    // Refresh transactions and customer balance
    await get().loadTransactions(customerId);
    const updated = await getCustomerById(customerId);
    set({ selectedCustomer: updated });
    // Also refresh customers list to update balances
    const { customers } = get();
    const businessId = customers[0]?.business_id;
    if (businessId) await get().loadCustomers(businessId);
  },

  editTransaction: async (txId, customerId, amount, note, date, dueDate) => {
    await updateTransaction(txId, amount, note, date, dueDate);
    await get().loadTransactions(customerId);
    const updated = await getCustomerById(customerId);
    set({ selectedCustomer: updated });
    const { customers } = get();
    const businessId = customers[0]?.business_id;
    if (businessId) await get().loadCustomers(businessId);
  },

  removeTransaction: async (id, customerId) => {
    await deleteTransaction(id);
    await get().loadTransactions(customerId);
    const updated = await getCustomerById(customerId);
    set({ selectedCustomer: updated });
    const { customers } = get();
    const businessId = customers[0]?.business_id;
    if (businessId) await get().loadCustomers(businessId);
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  clearSelection: () =>
    set({ selectedCustomer: null, transactions: [], searchQuery: '' }),
}));
