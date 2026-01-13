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
};
