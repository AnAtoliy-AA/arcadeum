export interface AdminPaymentNoteItem {
  id: string;
  note: string;
  amount: number;
  currency: string;
  displayName: string | null;
  createdAt: string;
  transactionId: string;
  isPublic: boolean;
  userId: string | null;
}

export interface AdminPaymentNotesResponse {
  items: AdminPaymentNoteItem[];
  total: number;
  page: number;
  pageSize: number;
}
