import { create } from 'zustand';
import { Customer, CustomerRepository } from '../db/repositories/customerRepository';
import { Transaction, TransactionRepository } from '../db/repositories/transactionRepository';
import { useGoogleDriveStore } from './useGoogleDriveStore';

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
  addCustomer: (businessId: number, name: string, phone?: string, openingBalance?: number, type?: 'CUSTOMER' | 'SUPPLIER') => Promise<number>;
  editCustomer: (id: number, name: string, phone?: string, type?: 'CUSTOMER' | 'SUPPLIER') => Promise<void>;
  removeCustomer: (id: number) => Promise<void>;

  loadTransactions: (customerId: number) => Promise<void>;
  
  // Note: added businessId to avoid inference from customers array
  addTransaction: (
    businessId: number,
    customerId: number,
    type: 'CREDIT' | 'DEBIT',
    amount: number,
    note?: string,
    date?: string,
    dueDate?: string
  ) => Promise<void>;
  
  editTransaction: (
    businessId: number,
    txId: number,
    customerId: number,
    amount: number,
    note?: string,
    date?: string,
    dueDate?: string
  ) => Promise<void>;
  
  removeTransaction: (
    businessId: number,
    id: number, 
    customerId: number
  ) => Promise<void>;

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
      const customers = await CustomerRepository.getAll(businessId);
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
    const customers = await CustomerRepository.search(businessId, query);
    set({ customers });
  },

  selectCustomer: async (id) => {
    const customer = await CustomerRepository.getById(id);
    set({ selectedCustomer: customer });
  },

  addCustomer: async (businessId, name, phone, openingBalance = 0, type = 'CUSTOMER') => {
    const id = await CustomerRepository.create(businessId, name, phone, openingBalance, type);
    // Refresh only the list
    await get().loadCustomers(businessId);
    require('./useBusinessStore').useBusinessStore.getState().refreshSummary();
    return id;
  },

  editCustomer: async (id, name, phone, type) => {
    await CustomerRepository.update(id, name, phone, type);
    
    // Optimistic local update to avoid full DB reload
    const { customers, selectedCustomer } = get();
    
    if (selectedCustomer?.id === id) {
      set({ selectedCustomer: { ...selectedCustomer, name, phone: phone || null, type: type || selectedCustomer.type } });
    }
    
    set({
      customers: customers.map((c) => 
        c.id === id ? { ...c, name, phone: phone || null, type: type || c.type } : c
      )
    });
  },

  removeCustomer: async (id) => {
    await CustomerRepository.delete(id);
    const { customers } = get();
    const updated = customers.filter((c) => c.id !== id);
    set({ customers: updated, selectedCustomer: null, transactions: [] });
    require('./useBusinessStore').useBusinessStore.getState().refreshSummary();
  },

  loadTransactions: async (customerId) => {
    set({ isLoading: true });
    try {
      const transactions = await TransactionRepository.getByCustomer(customerId);
      set({ transactions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addTransaction: async (businessId, customerId, type, amount, note, date, dueDate) => {
    await TransactionRepository.create(customerId, type, amount, note, date, dueDate);
    
    // Efficient partial reload:
    // Only reload the specific customer and their transactions, then patch the state
    const [updatedTxs, updatedCustomer] = await Promise.all([
      TransactionRepository.getByCustomer(customerId),
      CustomerRepository.getById(customerId),
    ]);
    
    set((state) => ({
      transactions: updatedTxs,
      selectedCustomer: updatedCustomer,
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, balance: updatedCustomer?.balance, last_tx_date: updatedCustomer?.last_tx_date, is_overdue: updatedCustomer?.is_overdue } : c
      ),
    }));
    require('./useBusinessStore').useBusinessStore.getState().refreshSummary();
    
    // Trigger silent background backup
    const driveStore = useGoogleDriveStore.getState();
    if (driveStore.isSignedIn && driveStore.isAutoBackupEnabled && driveStore.backupFrequency === 'TRANSACTION') {
      driveStore.backup(true).catch(console.error);
    }
  },

  editTransaction: async (businessId, txId, customerId, amount, note, date, dueDate) => {
    await TransactionRepository.update(txId, amount, note, date, dueDate);
    
    const [updatedTxs, updatedCustomer] = await Promise.all([
      TransactionRepository.getByCustomer(customerId),
      CustomerRepository.getById(customerId),
    ]);
    
    set((state) => ({
      transactions: updatedTxs,
      selectedCustomer: updatedCustomer,
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, balance: updatedCustomer?.balance, last_tx_date: updatedCustomer?.last_tx_date, is_overdue: updatedCustomer?.is_overdue } : c
      ),
    }));
    require('./useBusinessStore').useBusinessStore.getState().refreshSummary();

    // Trigger silent background backup
    const driveStore = useGoogleDriveStore.getState();
    if (driveStore.isSignedIn && driveStore.isAutoBackupEnabled && driveStore.backupFrequency === 'TRANSACTION') {
      driveStore.backup(true).catch(console.error);
    }
  },

  removeTransaction: async (businessId, id, customerId) => {
    await TransactionRepository.delete(id);
    
    const [updatedTxs, updatedCustomer] = await Promise.all([
      TransactionRepository.getByCustomer(customerId),
      CustomerRepository.getById(customerId),
    ]);
    
    set((state) => ({
      transactions: updatedTxs,
      selectedCustomer: updatedCustomer,
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, balance: updatedCustomer?.balance, last_tx_date: updatedCustomer?.last_tx_date, is_overdue: updatedCustomer?.is_overdue } : c
      ),
    }));
    require('./useBusinessStore').useBusinessStore.getState().refreshSummary();

    // Trigger silent background backup
    const driveStore = useGoogleDriveStore.getState();
    if (driveStore.isSignedIn && driveStore.isAutoBackupEnabled && driveStore.backupFrequency === 'TRANSACTION') {
      driveStore.backup(true).catch(console.error);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  clearSelection: () =>
    set({ selectedCustomer: null, transactions: [], searchQuery: '' }),
}));
