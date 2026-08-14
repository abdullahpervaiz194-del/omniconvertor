export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isPro: boolean;
  proPlan?: string;
  isAdmin?: boolean;
  totalConversions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  planId: string;
  planName: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
  screenshotUrl: string;
  storagePath?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversionHistoryItem {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  toolId: string;
  fromFormat: string;
  toFormat: string;
  originalSize: number;
  fileSize: number;
  category?: string;
  status: 'completed' | 'failed';
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
