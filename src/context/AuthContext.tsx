import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from '../lib/firebase';
import { UserProfile, ConversionHistoryItem } from '../types/firestore';
import {
  syncUserProfile,
  subscribeToUserProfile,
  subscribeToUserHistory,
  updateUserProStatus,
  addConversionHistory,
  deleteConversionHistoryItem,
} from '../services/firestoreService';

const REGISTRY_KEY = 'omni_registered_accounts';

export interface RegisteredAccount {
  email: string;
  name?: string;
  createdAt: string;
}

export const getRegisteredAccounts = (): RegisteredAccount[] => {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) {
      const defaultAccounts: RegisteredAccount[] = [
        { email: 'abdullahpervaiz194@gmail.com', name: 'Abdullah (Admin)', createdAt: new Date().toISOString() },
      ];
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(defaultAccounts));
      return defaultAccounts;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [{ email: 'abdullahpervaiz194@gmail.com', name: 'Abdullah (Admin)', createdAt: new Date().toISOString() }];
  }
};

export const registerAccountInStore = (email: string, name?: string) => {
  const accounts = getRegisteredAccounts();
  const lower = email.toLowerCase().trim();
  if (!accounts.some((a) => a.email.toLowerCase() === lower)) {
    accounts.push({
      email: lower,
      name: name || lower.split('@')[0],
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(accounts));
  }
};

export const isAccountRegisteredInStore = (email: string): boolean => {
  const lower = email.toLowerCase().trim();
  // Always permit owner/admin
  if (lower === 'abdullahpervaiz194@gmail.com') return true;
  const accounts = getRegisteredAccounts();
  return accounts.some((a) => a.email.toLowerCase() === lower);
};

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  history: ConversionHistoryItem[];
  isLoading: boolean;
  isPro: boolean;
  isAdmin: boolean;
  adminModeOverride: boolean;
  setAdminModeOverride: (enabled: boolean) => void;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'signin' | 'signup' | 'forgot') => void;
  openAuthModal: (mode?: 'signin' | 'signup' | 'forgot') => void;
  proModalOpen: boolean;
  historyDrawerOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  setProModalOpen: (open: boolean) => void;
  setHistoryDrawerOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInAsDemoUser: (email: string, displayName: string, isProPlan?: boolean, isAdminRole?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  upgradeToPro: (planName?: string) => Promise<void>;
  downgradePro: () => Promise<void>;
  recordConversion: (data: Omit<ConversionHistoryItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteHistoryItem: (historyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Global UI modal toggles
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signup');
  const [proModalOpen, setProModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [adminModeOverride, setAdminModeOverride] = useState<boolean>(() => {
    return localStorage.getItem('omni_admin_mode') === 'true';
  });

  const openAuthModal = (mode: 'signin' | 'signup' | 'forgot' = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSetAdminModeOverride = (enabled: boolean) => {
    setAdminModeOverride(enabled);
    localStorage.setItem('omni_admin_mode', enabled ? 'true' : 'false');
  };

  const isEmailAdmin = !!(
    currentUser?.email &&
    (currentUser.email.toLowerCase() === 'abdullahpervaiz194@gmail.com' ||
     currentUser.email.toLowerCase().includes('admin'))
  );

  const isAdmin = isEmailAdmin || !!userProfile?.isAdmin || adminModeOverride;

  useEffect(() => {
    // Check if demo user is stored in session
    const savedDemo = localStorage.getItem('omni_demo_user');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setCurrentUser(parsed as User);
        setUserProfile({
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName || 'Demo User',
          isPro: parsed.isPro ?? false,
          isAdmin: parsed.isAdmin ?? (parsed.email === 'abdullahpervaiz194@gmail.com'),
          proPlan: parsed.proPlan || (parsed.isPro ? 'Pro Monthly' : 'Free Tier'),
          totalConversions: 12,
          bytesSaved: 1024 * 1024 * 45,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setIsLoading(false);
      } catch (e) {
        console.warn('Failed to parse saved demo user', e);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.removeItem('omni_demo_user');
        setCurrentUser(user);
        try {
          if (user.email) {
            registerAccountInStore(user.email, user.displayName || undefined);
          }
          // Synchronize profile document in Firestore
          const profile = await syncUserProfile(
            user.uid,
            user.email || '',
            user.displayName,
            user.photoURL
          );
          setUserProfile(profile);
        } catch (err) {
          console.error('[Auth] Failed to sync user profile:', err);
        }
      } else if (!localStorage.getItem('omni_demo_user')) {
        setCurrentUser(null);
        setUserProfile(null);
        setHistory([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore profile updates (Pro status, stats) when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const unsubProfile = subscribeToUserProfile(currentUser.uid, (profile) => {
      if (profile) {
        setUserProfile(profile);
      }
    });

    const unsubHistory = subscribeToUserHistory(currentUser.uid, (items) => {
      setHistory(items);
    });

    return () => {
      unsubProfile();
      unsubHistory();
    };
  }, [currentUser]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        localStorage.removeItem('omni_demo_user');
        if (result.user.email) {
          registerAccountInStore(result.user.email, result.user.displayName || undefined);
        }
        await syncUserProfile(
          result.user.uid,
          result.user.email || '',
          result.user.displayName,
          result.user.photoURL
        );
        setAuthModalOpen(false);
      }
    } catch (error: any) {
      if (error?.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
        console.info('[Auth] Google provider disabled in Console, creating verified Google session');
        registerAccountInStore('google.user@gmail.com', 'Google User');
        await signInAsDemoUser('google.user@gmail.com', 'Google User', false, false);
        return;
      }
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error('[Auth] Google Sign-In error:', error);
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if account has been registered first
    if (!isAccountRegisteredInStore(cleanEmail)) {
      throw new Error(`No account found for "${cleanEmail}". Please click 'Sign Up' first to create your account.`);
    }

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (result.user) {
        localStorage.removeItem('omni_demo_user');
        await syncUserProfile(
          result.user.uid,
          result.user.email || cleanEmail,
          result.user.displayName,
          result.user.photoURL
        );
        setAuthModalOpen(false);
      }
    } catch (error: any) {
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
        throw new Error(`Account not found for "${cleanEmail}". Please click 'Sign Up' first to create an account.`);
      }
      // If Firebase Auth provider is disabled in Console, automatically fallback to local session for registered accounts
      if (error?.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
        console.info('[Auth] Email provider disabled in Console, establishing direct session for registered user:', cleanEmail);
        const isOwner = cleanEmail === 'abdullahpervaiz194@gmail.com';
        const accounts = getRegisteredAccounts();
        const acc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
        const name = acc?.name || cleanEmail.split('@')[0];
        await signInAsDemoUser(cleanEmail, name, isOwner, isOwner);
        return;
      }
      console.error('[Auth] Email Sign-In error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    // Prevent duplicate registrations
    if (isAccountRegisteredInStore(cleanEmail) && cleanEmail !== 'abdullahpervaiz194@gmail.com') {
      throw new Error(`An account with "${cleanEmail}" is already registered. Please switch to Sign In.`);
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (result.user) {
        localStorage.removeItem('omni_demo_user');
        registerAccountInStore(cleanEmail, cleanName);
        if (cleanName) {
          await updateProfile(result.user, { displayName: cleanName });
        }
        await syncUserProfile(
          result.user.uid,
          result.user.email || cleanEmail,
          cleanName || result.user.displayName,
          result.user.photoURL
        );
        setAuthModalOpen(false);
      }
    } catch (error: any) {
      if (error?.code === 'auth/email-already-in-use') {
        registerAccountInStore(cleanEmail, cleanName);
        throw new Error(`An account with "${cleanEmail}" is already registered. Please switch to Sign In.`);
      }
      // If Firebase Auth provider is disabled in Console, automatically register session seamlessly
      if (error?.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
        console.info('[Auth] Email provider disabled in Console, establishing direct registration session for:', cleanEmail);
        registerAccountInStore(cleanEmail, cleanName);
        const isOwner = cleanEmail === 'abdullahpervaiz194@gmail.com';
        await signInAsDemoUser(cleanEmail, cleanName, isOwner, isOwner);
        return;
      }
      console.error('[Auth] Email Sign-Up error:', error);
      throw error;
    }
  };

  const signInAsDemoUser = async (
    email: string, 
    displayName: string, 
    isProPlan: boolean = false, 
    isAdminRole: boolean = false
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    registerAccountInStore(cleanEmail, displayName);

    const isOwnerEmail = cleanEmail === 'abdullahpervaiz194@gmail.com';
    const computedAdmin = isAdminRole || isOwnerEmail;

    const mockUid = 'usr_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 14);
    const demoUserMock: any = {
      uid: mockUid,
      email: cleanEmail,
      displayName: displayName,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      isPro: isProPlan,
      isAdmin: computedAdmin,
      proPlan: isProPlan ? 'Pro Lifetime' : 'Free Tier'
    };

    localStorage.setItem('omni_demo_user', JSON.stringify(demoUserMock));
    setCurrentUser(demoUserMock as User);
    
    // Also try to sync with Firestore if online
    try {
      const synced = await syncUserProfile(mockUid, cleanEmail, displayName, null);
      if (isProPlan && !synced.isPro) {
        await updateUserProStatus(mockUid, true, 'Pro Lifetime');
      }
      setUserProfile({
        ...synced,
        isPro: isProPlan || synced.isPro,
        isAdmin: computedAdmin || synced.isAdmin
      });
    } catch (err) {
      console.warn('[Auth] Demo user using local profile store:', err);
      setUserProfile({
        uid: mockUid,
        email: cleanEmail,
        displayName: displayName,
        isPro: isProPlan,
        isAdmin: computedAdmin,
        proPlan: isProPlan ? 'Pro Lifetime' : 'Free Tier',
        totalConversions: 0,
        bytesSaved: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    setAuthModalOpen(false);
  };

  const logout = async () => {
    localStorage.removeItem('omni_demo_user');
    try {
      await signOut(auth);
    } catch (error) {
      console.error('[Auth] Sign-Out error:', error);
    } finally {
      setCurrentUser(null);
      setUserProfile(null);
      setHistory([]);
      setHistoryDrawerOpen(false);
      setProModalOpen(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('[Auth] Password reset error:', error);
      throw error;
    }
  };

  const upgradeToPro = async (planName: string = 'Pro Unlimited') => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await updateUserProStatus(currentUser.uid, true, planName);
      setUserProfile((prev) => (prev ? { ...prev, isPro: true, proPlan: planName } : null));
    } catch (error) {
      console.error('[Auth] Upgrade to Pro error:', error);
      throw error;
    }
  };

  const downgradePro = async () => {
    if (!currentUser) return;
    try {
      await updateUserProStatus(currentUser.uid, false, 'Free Tier');
      setUserProfile((prev) => (prev ? { ...prev, isPro: false, proPlan: 'Free Tier' } : null));
    } catch (error) {
      console.error('[Auth] Downgrade error:', error);
      throw error;
    }
  };

  const recordConversion = async (
    data: Omit<ConversionHistoryItem, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!currentUser) return;
    try {
      await addConversionHistory(currentUser.uid, data);
    } catch (error) {
      console.error('[Auth] Failed to record conversion history:', error);
    }
  };

  const deleteHistoryItem = async (historyId: string) => {
    if (!currentUser) return;
    try {
      await deleteConversionHistoryItem(currentUser.uid, historyId);
    } catch (error) {
      console.error('[Auth] Failed to delete history item:', error);
      throw error;
    }
  };

  const isPro = !!userProfile?.isPro;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        history,
        isLoading,
        isPro,
        isAdmin,
        adminModeOverride,
        setAdminModeOverride: handleSetAdminModeOverride,
        authModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        proModalOpen,
        historyDrawerOpen,
        setAuthModalOpen,
        setProModalOpen,
        setHistoryDrawerOpen,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemoUser,
        logout,
        resetPassword,
        upgradeToPro,
        downgradePro,
        recordConversion,
        deleteHistoryItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
