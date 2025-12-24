import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  paymentServiceAPI, 
  PaymentHistoryItemDto,
  GetPaymentHistoryQuery,
  PaymentStatus 
} from 'EduSmart/api/api-payment-service';

export interface PaymentStats {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
}

export interface PaymentState {
  totalAmounts: number;
  paymentHistory: PaymentHistoryItemDto[];
  stats: PaymentStats;
  isLoading: boolean;
  error: string | null;
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  filters: {
    status?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
  };
  fetchTotalAmounts: () => Promise<boolean>;
  fetchPaymentHistory: (query?: GetPaymentHistoryQuery) => Promise<boolean>;
  fetchStats: () => Promise<boolean>;
  setFilters: (filters: Partial<PaymentState['filters']>) => void;
  setPagination: (page: number, pageSize?: number) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  totalAmounts: 0,
  paymentHistory: [],
  stats: {
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
  },
  isLoading: false,
  error: null,
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  },
  filters: {
    status: undefined,
    fromDate: undefined,
    toDate: undefined,
  },
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      fetchTotalAmounts: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await paymentServiceAPI.getTotalAmounts();
          
          if (response.success && response.response !== undefined) {
            set({
              totalAmounts: response.response,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || 'Không thể lấy tổng doanh thu',
            });
            return false;
          }
        } catch (e) {
          const error = e instanceof Error ? e.message : 'Lỗi mạng khi lấy tổng doanh thu';
          set({ isLoading: false, error });
          return false;
        }
      },
      
      fetchPaymentHistory: async (query?: GetPaymentHistoryQuery) => {
        set({ isLoading: true, error: null });
        
        try {
          const state = get();
          const searchQuery: GetPaymentHistoryQuery = query || {
            pageNumber: state.pagination.pageNumber,
            pageSize: state.pagination.pageSize,
            status: state.filters.status,
            fromDate: state.filters.fromDate,
            toDate: state.filters.toDate,
          };
          
          const response = await paymentServiceAPI.getPaymentHistory(searchQuery);
          
          if (response.success && response.response) {
            const { items, totalCount, pageNumber, pageSize, totalPages } = response.response;
            
            set({
              paymentHistory: items || [],
              pagination: {
                pageNumber: pageNumber || 1,
                pageSize: pageSize || 10,
                totalCount: totalCount || 0,
                totalPages: totalPages || 0,
              },
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || 'Không thể lấy lịch sử thanh toán',
            });
            return false;
          }
        } catch (e) {
          const error = e instanceof Error ? e.message : 'Lỗi mạng khi lấy lịch sử thanh toán';
          set({ isLoading: false, error });
          return false;
        }
      },
      
      fetchStats: async () => {
        try {
          // Fetch counts for each status in parallel
          const [allResponse, paidResponse, pendingResponse, failedResponse] = await Promise.all([
            paymentServiceAPI.getPaymentHistory({ pageNumber: 1, pageSize: 1 }),
            paymentServiceAPI.getPaymentHistory({ pageNumber: 1, pageSize: 1, status: PaymentStatus.Paid }),
            paymentServiceAPI.getPaymentHistory({ pageNumber: 1, pageSize: 1, status: PaymentStatus.Pending }),
            Promise.all([
              paymentServiceAPI.getPaymentHistory({ pageNumber: 1, pageSize: 1, status: PaymentStatus.Failed }),
              paymentServiceAPI.getPaymentHistory({ pageNumber: 1, pageSize: 1, status: PaymentStatus.SystemError })
            ])
          ]);
          
          const totalTransactions = allResponse.success ? allResponse.response.totalCount : 0;
          const successfulTransactions = paidResponse.success ? paidResponse.response.totalCount : 0;
          const pendingTransactions = pendingResponse.success ? pendingResponse.response.totalCount : 0;
          const failedCount = failedResponse[0].success ? failedResponse[0].response.totalCount : 0;
          const systemErrorCount = failedResponse[1].success ? failedResponse[1].response.totalCount : 0;
          const failedTransactions = failedCount + systemErrorCount;
          
          set({
            stats: {
              totalTransactions,
              successfulTransactions,
              pendingTransactions,
              failedTransactions,
            },
          });
          
          return true;
        } catch (e) {
          console.error('Error fetching stats:', e);
          return false;
        }
      },
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, pageNumber: 1 },
        }));
        
        get().fetchPaymentHistory();
      },
      
      setPagination: (page, pageSize) => {
        set((state) => ({
          pagination: {
            ...state.pagination,
            pageNumber: Math.max(1, page),
            ...(pageSize && { pageSize }),
          },
        }));
        
        get().fetchPaymentHistory();
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'payment-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        pagination: {
          pageNumber: state.pagination.pageNumber,
          pageSize: state.pagination.pageSize,
        },
      }),
    }
  )
);

