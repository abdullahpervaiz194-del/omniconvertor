import {
  db,
  auth,
  storage,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  increment,
  ref,
  uploadBytes,
  getDownloadURL,
  type Unsubscribe,
} from '../lib/firebase';
import {
  UserProfile,
  ConversionHistoryItem,
  PaymentRequest,
  OperationType,
  FirestoreErrorInfo,
} from '../types/firestore';

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local Storage Fallback Helpers (for offline / demo sessions when Firebase Auth provider is unconfigured)
const LOCAL_REQUESTS_KEY = 'omni_local_payment_requests';
const LOCAL_HISTORY_PREFIX = 'omni_local_history_';
const LOCAL_PROFILE_PREFIX = 'omni_local_profile_';

function getLocalPaymentRequests(): PaymentRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return [];
}

function saveLocalPaymentRequests(requests: PaymentRequest[]) {
  try {
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('omni_payments_updated', { detail: requests }));
  } catch (e) {
    console.warn(e);
  }
}

// 1. User Profile Management
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      try {
        localStorage.setItem(LOCAL_PROFILE_PREFIX + uid, JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (error) {
    console.warn('[Firestore] getUserProfile network fallback:', error);
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_PREFIX + uid);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export async function syncUserProfile(
  uid: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null
): Promise<UserProfile> {
  const path = `users/${uid}`;
  const now = new Date().toISOString();

  const profileData: UserProfile = {
    uid,
    email,
    displayName: displayName || email.split('@')[0] || 'User',
    photoURL: photoURL || '',
    isPro: false,
    proPlan: 'Free Tier',
    totalConversions: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Always maintain local copy
  try {
    const existingRaw = localStorage.getItem(LOCAL_PROFILE_PREFIX + uid);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw) as UserProfile;
      profileData.isPro = existing.isPro ?? false;
      profileData.proPlan = existing.proPlan ?? 'Free Tier';
      profileData.totalConversions = existing.totalConversions ?? 0;
      profileData.createdAt = existing.createdAt ?? now;
    }
    localStorage.setItem(LOCAL_PROFILE_PREFIX + uid, JSON.stringify(profileData));
  } catch (e) {}

  try {
    const userRef = doc(db, 'users', uid);
    const existingDoc = await getDoc(userRef);

    if (!existingDoc.exists()) {
      await setDoc(userRef, profileData);
      return profileData;
    } else {
      const data = existingDoc.data() as UserProfile;
      const updates: Partial<UserProfile> = {
        updatedAt: now,
      };
      if (displayName && displayName !== data.displayName) {
        updates.displayName = displayName;
      }
      if (photoURL && photoURL !== data.photoURL) {
        updates.photoURL = photoURL;
      }
      if (email && email !== data.email) {
        updates.email = email;
      }
      if (Object.keys(updates).length > 1) {
        await updateDoc(userRef, updates);
        const merged = { ...data, ...updates };
        try {
          localStorage.setItem(LOCAL_PROFILE_PREFIX + uid, JSON.stringify(merged));
        } catch (e) {}
        return merged;
      }
      try {
        localStorage.setItem(LOCAL_PROFILE_PREFIX + uid, JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (error) {
    console.warn('[Firestore] syncUserProfile cloud sync warning:', error);
    return profileData;
  }
}

export async function updateUserProStatus(
  uid: string,
  isPro: boolean,
  proPlan: string = isPro ? 'Pro Unlimited' : 'Free Tier'
): Promise<void> {
  const path = `users/${uid}`;
  const now = new Date().toISOString();

  // Update local storage immediately
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_PREFIX + uid);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.isPro = isPro;
      parsed.proPlan = proPlan;
      parsed.updatedAt = now;
      localStorage.setItem(LOCAL_PROFILE_PREFIX + uid, JSON.stringify(parsed));
    }
    const demoUserRaw = localStorage.getItem('omni_demo_user');
    if (demoUserRaw) {
      const demo = JSON.parse(demoUserRaw);
      if (demo.uid === uid) {
        demo.isPro = isPro;
        demo.proPlan = proPlan;
        localStorage.setItem('omni_demo_user', JSON.stringify(demo));
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // Update Cloud Firestore
  try {
    const userRef = doc(db, 'users', uid);
    const existingDoc = await getDoc(userRef);
    if (existingDoc.exists()) {
      await updateDoc(userRef, {
        isPro,
        proPlan,
        updatedAt: now,
      });
    } else {
      await setDoc(userRef, {
        uid,
        email: '',
        isPro,
        proPlan,
        totalConversions: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.warn('[Firestore] updateUserProStatus cloud write warning:', error);
  }
}

// 2. Conversion History Logging
export async function addConversionHistory(
  userId: string,
  historyData: Omit<ConversionHistoryItem, 'id' | 'userId' | 'createdAt'>
): Promise<ConversionHistoryItem> {
  const historyId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/history/${historyId}`;
  const now = new Date().toISOString();

  const historyItem: ConversionHistoryItem = {
    ...historyData,
    id: historyId,
    userId,
    createdAt: now,
  };

  // Local update
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_PREFIX + userId);
    const items: ConversionHistoryItem[] = raw ? JSON.parse(raw) : [];
    items.unshift(historyItem);
    localStorage.setItem(LOCAL_HISTORY_PREFIX + userId, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('omni_history_updated', { detail: items }));
  } catch (e) {
    console.warn(e);
  }

  // Cloud Firestore update
  try {
    const historyRef = doc(db, 'users', userId, 'history', historyId);
    await setDoc(historyRef, historyItem);

    // Increment user's total conversions counter
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalConversions: increment(1),
      updatedAt: now,
    }).catch(() => {});
  } catch (error) {
    console.warn('[Firestore] addConversionHistory cloud warning:', error);
  }

  return historyItem;
}

export function subscribeToUserHistory(
  userId: string,
  onUpdate: (items: ConversionHistoryItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = `users/${userId}/history`;

  const loadLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_HISTORY_PREFIX + userId);
      const items: ConversionHistoryItem[] = raw ? JSON.parse(raw) : [];
      if (items.length > 0) onUpdate(items);
    } catch (e) {}
  };
  loadLocal();

  const historyQuery = query(
    collection(db, 'users', userId, 'history'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    historyQuery,
    (snapshot) => {
      const items: ConversionHistoryItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ConversionHistoryItem);
      });
      onUpdate(items);
      try {
        localStorage.setItem(LOCAL_HISTORY_PREFIX + userId, JSON.stringify(items));
      } catch (e) {}
    },
    (error) => {
      loadLocal();
    }
  );
}

export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = `users/${userId}`;

  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_PREFIX + userId);
    if (raw) onUpdate(JSON.parse(raw));
  } catch (e) {}

  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        onUpdate(data);
        try {
          localStorage.setItem(LOCAL_PROFILE_PREFIX + userId, JSON.stringify(data));
        } catch (e) {}
      }
    },
    (error) => {
      try {
        const raw = localStorage.getItem(LOCAL_PROFILE_PREFIX + userId);
        if (raw) onUpdate(JSON.parse(raw));
      } catch (e) {}
    }
  );
}

export async function deleteConversionHistoryItem(
  userId: string,
  historyId: string
): Promise<void> {
  const path = `users/${userId}/history/${historyId}`;

  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_PREFIX + userId);
    if (raw) {
      const items: ConversionHistoryItem[] = JSON.parse(raw);
      const filtered = items.filter((i) => i.id !== historyId);
      localStorage.setItem(LOCAL_HISTORY_PREFIX + userId, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('omni_history_updated', { detail: filtered }));
    }
  } catch (e) {}

  try {
    const historyRef = doc(db, 'users', userId, 'history', historyId);
    await deleteDoc(historyRef);
  } catch (error) {
    console.warn('[Firestore] deleteConversionHistoryItem cloud warning:', error);
  }
}

// 3. Payment Screenshot & Proof Management

/**
 * Compresses an image file on the client using HTML5 Canvas to a lightweight, crisp JPEG (~40-60KB)
 * for instant uploads and sub-second transmission without exceeding Firestore or localStorage limits.
 */
async function compressImageToDataUrl(file: File | Blob, maxWidth = 800, quality = 0.65): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a payment proof screenshot to Firebase Storage with instant client compression
 * and fast 3.5s timeout fallback to avoid long loading or hanging.
 */
export async function uploadPaymentScreenshot(
  userId: string,
  file: File | Blob,
  fileName: string = 'receipt.png'
): Promise<{ downloadUrl: string; storagePath: string }> {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `payments/${userId}/${timestamp}_${safeName}`;

  // 1. Immediately compress client-side to ensure small footprint (~40-60KB)
  const compressedDataUrl = await compressImageToDataUrl(file);

  // If no Firebase Auth currentUser or user is in demo mode, resolve immediately
  if (!auth.currentUser) {
    return {
      downloadUrl: compressedDataUrl,
      storagePath: `fallback_inline_${timestamp}_${safeName}`,
    };
  }

  // 2. Try Firebase Storage with a 3.5-second timeout race
  try {
    const uploadPromise = (async () => {
      const storageReference = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageReference, file, {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          userId,
          uploadedAt: new Date().toISOString(),
        },
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return { downloadUrl, storagePath };
    })();

    const timeoutPromise = new Promise<{ downloadUrl: string; storagePath: string }>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage timeout')), 3500)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (storageError) {
    console.warn('[Payment Upload] Using optimized high-speed inline screenshot:', storageError);
    return {
      downloadUrl: compressedDataUrl,
      storagePath: `fallback_inline_${timestamp}_${safeName}`,
    };
  }
}

/**
 * Submits a new payment request for manual approval.
 * Writes to both LocalStorage (for instant feedback) and Cloud Firestore (so Admin receives it across accounts).
 */
export async function submitPaymentRequest(
  paymentData: Omit<PaymentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<PaymentRequest> {
  const requestId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const path = `paymentRequests/${requestId}`;
  const now = new Date().toISOString();

  // Explicitly sanitize all properties to prevent undefined values from crashing Firestore setDoc
  const newRequest: PaymentRequest = {
    id: requestId,
    userId: String(paymentData.userId || ''),
    userEmail: String(paymentData.userEmail || ''),
    userName: String(paymentData.userName || 'Member'),
    planId: String(paymentData.planId || 'pro_lifetime'),
    planName: String(paymentData.planName || 'Pro Lifetime Access'),
    amount: Number(paymentData.amount) || 49,
    currency: String(paymentData.currency || 'USD'),
    paymentMethod: String(paymentData.paymentMethod || 'bank_transfer'),
    transactionId: String(paymentData.transactionId || `TX-${Date.now().toString().slice(-6)}`),
    screenshotUrl: String(paymentData.screenshotUrl || ''),
    storagePath: String(paymentData.storagePath || ''),
    notes: String(paymentData.notes || ''),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  // 1. Always save to LocalStorage immediately
  try {
    const list = getLocalPaymentRequests();
    const existingIndex = list.findIndex(r => r.id === requestId);
    if (existingIndex >= 0) {
      list[existingIndex] = newRequest;
    } else {
      list.unshift(newRequest);
    }
    saveLocalPaymentRequests(list);
  } catch (e) {
    console.warn('[LocalStorage] save payment request warning:', e);
  }

  // 2. Always publish to Cloud Firestore so the Admin receives it in real-time
  try {
    const requestRef = doc(db, 'paymentRequests', requestId);
    await setDoc(requestRef, newRequest);
  } catch (error) {
    console.warn('[Firestore] submitPaymentRequest cloud write error:', error);
  }

  return newRequest;
}

/**
 * Direct one-off fetch for payment requests from Cloud Firestore (for Admin manual refresh).
 */
export async function fetchPaymentRequestsDirect(): Promise<PaymentRequest[]> {
  try {
    const q = query(
      collection(db, 'paymentRequests'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const items: PaymentRequest[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as PaymentRequest);
    });

    const localAll = getLocalPaymentRequests();
    const mergedMap = new Map<string, PaymentRequest>();
    localAll.forEach(item => mergedMap.set(item.id, item));
    items.forEach(item => mergedMap.set(item.id, item));

    const combined = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    saveLocalPaymentRequests(combined);
    return combined;
  } catch (error) {
    console.warn('[Firestore] fetchPaymentRequestsDirect warning:', error);
    return getLocalPaymentRequests();
  }
}

/**
 * Subscribes to payment requests for a single user in real-time from Cloud Firestore.
 */
export function subscribeToUserPaymentRequests(
  userId: string,
  onUpdate: (items: PaymentRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'paymentRequests';

  // Instant local load
  const loadUserRequests = () => {
    const all = getLocalPaymentRequests();
    const userFiltered = all.filter((r) => r.userId === userId);
    if (userFiltered.length > 0) onUpdate(userFiltered);
  };
  loadUserRequests();

  const handleUpdate = () => loadUserRequests();
  window.addEventListener('omni_payments_updated', handleUpdate);

  const q = query(
    collection(db, 'paymentRequests'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const firestoreUnsub = onSnapshot(
    q,
    (snapshot) => {
      const items: PaymentRequest[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as PaymentRequest);
      });

      // Merge cloud items with any local items
      const localAll = getLocalPaymentRequests().filter((r) => r.userId === userId);
      const mergedMap = new Map<string, PaymentRequest>();
      localAll.forEach(item => mergedMap.set(item.id, item));
      items.forEach(item => mergedMap.set(item.id, item));
      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      onUpdate(combined);
    },
    (error) => {
      console.warn('[Firestore] user payment request listener fallback:', error?.message);
      loadUserRequests();
      if (onError && error instanceof Error) onError(error);
    }
  );

  return () => {
    window.removeEventListener('omni_payments_updated', handleUpdate);
    firestoreUnsub();
  };
}

/**
 * Subscribes to all payment requests in real-time (for Admin Panel) from Cloud Firestore.
 */
export function subscribeToAllPaymentRequests(
  onUpdate: (items: PaymentRequest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'paymentRequests';

  // Instant initial load from local cache
  const loadAllRequests = () => {
    const all = getLocalPaymentRequests();
    if (all.length > 0) onUpdate(all);
  };
  loadAllRequests();

  const handleLocalUpdate = () => loadAllRequests();
  window.addEventListener('omni_payments_updated', handleLocalUpdate);

  const q = query(
    collection(db, 'paymentRequests'),
    orderBy('createdAt', 'desc')
  );

  const firestoreUnsub = onSnapshot(
    q,
    (snapshot) => {
      const items: PaymentRequest[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as PaymentRequest);
      });

      // Merge Cloud Firestore records with any LocalStorage records
      const localAll = getLocalPaymentRequests();
      const mergedMap = new Map<string, PaymentRequest>();
      localAll.forEach(item => mergedMap.set(item.id, item));
      items.forEach(item => mergedMap.set(item.id, item));
      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      onUpdate(combined);
      saveLocalPaymentRequests(combined);
    },
    (error) => {
      console.warn('[Firestore] admin payment requests listener fallback:', error?.message);
      loadAllRequests();
      if (onError && error instanceof Error) onError(error);
    }
  );

  return () => {
    window.removeEventListener('omni_payments_updated', handleLocalUpdate);
    firestoreUnsub();
  };
}

/**
 * Approves a payment screenshot request and automatically activates isPro: true on the target user's profile.
 */
export async function approvePaymentRequest(
  requestId: string,
  targetUserId: string,
  planName: string,
  adminIdentifier: string = 'admin'
): Promise<void> {
  const reqPath = `paymentRequests/${requestId}`;
  const now = new Date().toISOString();

  // 1. Update LocalStorage immediately
  try {
    const all = getLocalPaymentRequests();
    const target = all.find((r) => r.id === requestId);
    if (target) {
      target.status = 'approved';
      target.approvedBy = adminIdentifier;
      target.updatedAt = now;
      saveLocalPaymentRequests(all);
    }
  } catch (e) {}

  await updateUserProStatus(targetUserId, true, planName || 'Pro Unlimited');

  // 2. Update Cloud Firestore
  try {
    const reqRef = doc(db, 'paymentRequests', requestId);
    await updateDoc(reqRef, {
      status: 'approved',
      approvedBy: adminIdentifier,
      updatedAt: now,
    });
  } catch (error) {
    console.warn('[Firestore] approvePaymentRequest cloud update warning:', error);
  }
}

/**
 * Rejects a payment screenshot request with a reason.
 */
export async function rejectPaymentRequest(
  requestId: string,
  rejectionReason: string,
  adminIdentifier: string = 'admin'
): Promise<void> {
  const reqPath = `paymentRequests/${requestId}`;
  const now = new Date().toISOString();

  // 1. Update LocalStorage immediately
  try {
    const all = getLocalPaymentRequests();
    const target = all.find((r) => r.id === requestId);
    if (target) {
      target.status = 'rejected';
      target.rejectionReason = rejectionReason || 'Payment could not be verified.';
      target.approvedBy = adminIdentifier;
      target.updatedAt = now;
      saveLocalPaymentRequests(all);
    }
  } catch (e) {}

  // 2. Update Cloud Firestore
  try {
    const reqRef = doc(db, 'paymentRequests', requestId);
    await updateDoc(reqRef, {
      status: 'rejected',
      rejectionReason: rejectionReason || 'Payment could not be verified.',
      approvedBy: adminIdentifier,
      updatedAt: now,
    });
  } catch (error) {
    console.warn('[Firestore] rejectPaymentRequest cloud update warning:', error);
  }
}
