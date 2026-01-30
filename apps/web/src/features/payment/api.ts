import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';

export interface CreatePaymentSessionParams {
  amount: number;
  currency: string;
  description?: string;
}

export interface CreatePaymentSessionResponse {
  paymentUrl: string;
  sessionId: string;
}

export interface CreateNoteParams {
  note: string;
  amount: number;
  currency: string;
  transactionId: string;
  displayName?: string;
  isPublic?: boolean;
}

export interface PaymentNote {
  id: string;
  note: string;
  amount: number;
  currency: string;
  displayName: string | null;
  createdAt: string;
}

export interface PaginatedNotes {
  notes: PaymentNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const paymentApi = {
  createSession: async (
    params: CreatePaymentSessionParams,
    options?: ApiClientOptions,
  ): Promise<CreatePaymentSessionResponse> => {
    return apiClient.post<CreatePaymentSessionResponse>(
      '/payments/session',
      params,
      options,
    );
  },

  createSubscription: async (
    params: {
      amount: number;
      currency: string;
      interval: 'MONTHLY' | 'YEARLY';
      description?: string;
      returnUrl?: string;
      cancelUrl?: string;
    },
    options?: ApiClientOptions,
  ): Promise<CreatePaymentSessionResponse> => {
    return apiClient.post<CreatePaymentSessionResponse>(
      '/payments/subscription',
      params,
      options,
    );
  },

  createNote: async (
    params: CreateNoteParams,
    options?: ApiClientOptions,
  ): Promise<PaymentNote> => {
    return apiClient.post<PaymentNote>('/payments/notes', params, options);
  },

  getNotes: async (
    page = 1,
    limit = 20,
    options?: ApiClientOptions,
  ): Promise<PaginatedNotes> => {
    return apiClient.get<PaginatedNotes>(
      `/payments/notes?page=${page}&limit=${limit}`,
      options,
    );
  },
};
