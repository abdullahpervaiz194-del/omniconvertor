import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalMode,
    setAuthModalMode,
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword 
  } = useAuth();

  const mode = authModalMode;
  const setMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setAuthModalMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setIsOperationNotAllowed(false);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [currentHostname, setCurrentHostname] = useState('');

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError(null);
    setIsOperationNotAllowed(false);
    setIsUnauthorizedDomain(false);
    setSuccessMsg(null);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsOperationNotAllowed(false);
    setIsUnauthorizedDomain(false);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err: any) {
      const msg = err?.message || '';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
      setCurrentHostname(hostname);

      if (msg.includes('auth/unauthorized-domain') || msg.includes('unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        setError(`Firebase Error (auth/unauthorized-domain): The domain "${hostname}" is not authorized for OAuth operations in your Firebase project.`);
      } else if (msg.includes('auth/operation-not-allowed')) {
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
    setIsUnauthorizedDomain(false);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(email, password, displayName);
        handleClose();
      } else if (mode === 'signin') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await signInWithEmail(email, password);
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
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
      setCurrentHostname(hostname);

      if (raw.includes('auth/unauthorized-domain') || raw.includes('unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        raw = `Firebase Error (auth/unauthorized-domain): The domain "${hostname}" is not authorized for OAuth operations in your Firebase project.`;
      } else if (raw.includes('auth/operation-not-allowed')) {
        setIsOperationNotAllowed(true);
        raw = 'Firebase Error (auth/operation-not-allowed): Email/Password authentication is currently disabled in your Firebase project console.';
      } else if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password') || raw.includes('auth/user-not-found')) {
        raw = `No registered account found with ${email || 'this email'}. Please click "Sign Up" above to create your account first.`;
      } else if (raw.includes('auth/email-already-in-use')) {
        raw = 'An account with this email already exists. Please switch to Sign In.';
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

  const isNotFoundError = error && (error.toLowerCase().includes('sign up') || error.toLowerCase().includes('no account') || error.toLowerCase().includes('not found'));

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
                {mode === 'signup' && 'Create Your OmniConvert Account'}
                {mode === 'signin' && 'Sign In to OmniConvert'}
                {mode === 'forgot' && 'Reset Your Password'}
              </h3>
              <p className="text-[11px] text-[#a1a1aa] font-mono">
                {mode === 'signup' && 'Sign up first to save conversions & access Pro'}
                {mode === 'signin' && 'Welcome back! Enter your registered details'}
                {mode === 'forgot' && 'We will send a reset link to your email'}
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

        {/* Segmented Mode Selector Tabs (Sign Up vs Sign In) */}
        {mode !== 'forgot' && (
          <div className="px-6 pt-4 pb-1 shrink-0">
            <div className="grid grid-cols-2 p-1 rounded-lg bg-[#09090b] border border-[#27272a]">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 px-3 rounded-md text-xs font-semibold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
                id="tab-mode-signup"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>1. Sign Up Free</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`py-2 px-3 rounded-md text-xs font-semibold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
                id="tab-mode-signin"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>2. Sign In</span>
              </button>
            </div>
          </div>
        )}

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
                <span>{mode === 'signup' ? 'Sign Up with Google' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-[#27272a]"></div>
                <span className="text-[10px] uppercase font-mono text-[#71717a]">
                  {mode === 'signup' ? 'or register with email' : 'or sign in with email'}
                </span>
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
                  <label className="text-[11px] font-mono text-[#a1a1aa] block">
                    Password {mode === 'signup' ? '(min. 6 characters)' : ''}
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
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
                  <div className="space-y-1.5 text-xs flex-1">
                    <span className="font-semibold block">{error}</span>
                    
                    {/* Prompt to switch to Sign Up if account doesn't exist */}
                    {mode === 'signin' && isNotFoundError && (
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-all"
                      >
                        <span>👉 Click here to Sign Up first</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUnauthorizedDomain && (
                  <div className="mt-2 pt-2 border-t border-rose-900/40 text-[11px] text-rose-200/90 space-y-1.5 font-mono">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Authorize domain in Firebase Console (1-minute fix):
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-[10px] text-[#d4d4d8]">
                      <li>Open <a href="https://console.firebase.google.com/project/wired-ascent-7q6d2/authentication/settings" target="_blank" rel="noreferrer" className="text-indigo-300 underline font-bold hover:text-indigo-200">Firebase Console &gt; Authentication &gt; Settings</a></li>
                      <li>Select the <strong className="text-white">Authorized domains</strong> tab</li>
                      <li>Click <strong className="text-white">Add domain</strong></li>
                      <li>Enter: <code className="px-1.5 py-0.5 rounded bg-black/60 text-amber-300 font-bold">{currentHostname || 'your-deployment-domain'}</code> and click <strong className="text-white">Add</strong></li>
                    </ol>
                  </div>
                )}

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
                  {mode === 'signup' && 'Create Account & Sign Up'}
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle modes */}
          <div className="pt-2 border-t border-[#27272a] text-center text-xs text-[#a1a1aa]">
            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'signin' && (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign Up Free First
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            )}
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

