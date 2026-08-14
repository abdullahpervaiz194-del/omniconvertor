import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  Shield,
  Crown,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    signInAsDemoUser,
    resetPassword 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError(null);
    setIsOperationNotAllowed(false);
    setSuccessMsg(null);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsOperationNotAllowed(false);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('auth/operation-not-allowed')) {
        setIsOperationNotAllowed(true);
        setError('Firebase Error (auth/operation-not-allowed): Google Sign-In provider is disabled in Firebase Console.');
      } else if (msg.includes('auth/popup-closed-by-user')) {
        setError('Sign-in popup was closed before completing. Please try again.');
      } else {
        setError(msg || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsOperationNotAllowed(false);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await signInWithEmail(email, password);
        handleClose();
      } else if (mode === 'signup') {
        if (!email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(email, password, displayName);
        handleClose();
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Please enter your email address.');
        }
        await resetPassword(email);
        setSuccessMsg('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      let raw = err?.message || 'Authentication failed. Please verify credentials.';
      if (raw.includes('auth/operation-not-allowed')) {
        setIsOperationNotAllowed(true);
        raw = 'Firebase Error (auth/operation-not-allowed): Email/Password authentication is currently disabled in your Firebase project console.';
      } else if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password')) {
        raw = 'Invalid email or password. Please check your credentials.';
      } else if (raw.includes('auth/email-already-in-use')) {
        raw = 'An account with this email already exists. Try signing in.';
      } else if (raw.includes('auth/weak-password')) {
        raw = 'Password is too weak. Please use at least 6 characters.';
      } else if (raw.includes('auth/invalid-email')) {
        raw = 'Please enter a valid email address.';
      }
      setError(raw);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (
    demoEmail: string, 
    name: string, 
    isPro: boolean, 
    isAdmin: boolean
  ) => {
    setLoading(true);
    setError(null);
    setIsOperationNotAllowed(false);
    try {
      await signInAsDemoUser(demoEmail, name, isPro, isAdmin);
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in demo session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative text-[#fafafa] max-h-[90vh] flex flex-col"
        id="auth-modal"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm">
              Ω
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {mode === 'signin' && 'Sign In to OmniConvert'}
                {mode === 'signup' && 'Create Your Account'}
                {mode === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-[11px] text-[#a1a1aa] font-mono">
                Sync file history, unlock Pro & Admin access
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Quick Google Sign In */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                id="google-signin-btn"
                className="w-full py-2.5 px-4 rounded-lg bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:border-[#3f3f46]"
              >
                {/* SVG Google Official Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-[#27272a]"></div>
                <span className="text-[10px] uppercase font-mono text-[#71717a]">or with email</span>
                <div className="h-[1px] flex-1 bg-[#27272a]"></div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#a1a1aa] block">Full Name (Optional)</label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#a1a1aa] block">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-[#a1a1aa] block">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                        setIsOperationNotAllowed(false);
                      }}
                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold">{error}</span>
                  </div>
                </div>

                {isOperationNotAllowed && (
                  <div className="mt-2 pt-2 border-t border-rose-900/40 text-[11px] text-rose-200/90 space-y-1.5 font-mono">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      How to enable in Firebase Console:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-[10px] text-[#d4d4d8]">
                      <li>Open Firebase Console &gt; <strong className="text-white">Authentication</strong></li>
                      <li>Go to <strong className="text-white">Sign-in method</strong> tab</li>
                      <li>Click <strong className="text-white">Email/Password</strong> and/or <strong className="text-white">Google</strong></li>
                      <li>Toggle <strong className="text-white">Enable</strong> and click <strong className="text-white">Save</strong></li>
                    </ol>
                    <p className="text-[10px] text-amber-300 pt-1">
                      💡 Tip: You can also use the <strong>1-Click Quick Login</strong> buttons below to test instantly without configuring Firebase!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle modes */}
          <div className="pt-2 border-t border-[#27272a] text-center text-xs text-[#a1a1aa]">
            {mode === 'signin' && (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                    setIsOperationNotAllowed(false);
                  }}
                  className="text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign Up Free
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                    setIsOperationNotAllowed(false);
                  }}
                  className="text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccessMsg(null);
                  setIsOperationNotAllowed(false);
                }}
                className="text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            )}
          </div>

          {/* 1-Click Test Login Section */}
          <div className="pt-3 border-t border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#71717a] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Instant 1-Click Test Logins
              </span>
              <span className="text-[9px] text-[#71717a] font-mono">Bypasses Provider Lock</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('abdullahpervaiz194@gmail.com', 'Abdullah (Admin)', true, true)}
                className="w-full py-2 px-3 rounded-lg bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
                id="demo-admin-login-btn"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Log In as Abdullah (Admin & Pro)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/80 group-hover:text-amber-300">
                  Full Admin ⚡
                </span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('tester.user1@example.com', 'Alex (User 1)', false, false)}
                  className="py-1.5 px-2.5 rounded-lg bg-[#27272a]/60 hover:bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  id="demo-user1-login-btn"
                >
                  <UserIcon className="w-3 h-3 text-[#71717a]" />
                  <span>User Account 1 (Free)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('tester.user2@example.com', 'Sam (User 2)', false, false)}
                  className="py-1.5 px-2.5 rounded-lg bg-[#27272a]/60 hover:bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  id="demo-user2-login-btn"
                >
                  <UserIcon className="w-3 h-3 text-[#71717a]" />
                  <span>User Account 2 (Free)</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Guarantee */}
        <div className="p-3 bg-[#09090b] border-t border-[#27272a] flex items-center justify-center gap-2 text-[10px] text-[#71717a] font-mono shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Secured via Firebase Firestore & Authentication</span>
        </div>
      </div>
    </div>
  );
};

