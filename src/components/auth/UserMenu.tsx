import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Sparkles, 
  Clock, 
  LogOut, 
  ChevronDown, 
  Crown, 
  Layers,
  ShieldCheck,
  Shield,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserMenu: React.FC = () => {
  const { 
    currentUser, 
    userProfile, 
    history, 
    isPro, 
    isAdmin,
    logout, 
    openAuthModal,
    setProModalOpen, 
    setHistoryDrawerOpen 
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => openAuthModal('signin')}
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a] text-xs font-mono font-medium transition-all cursor-pointer"
          id="header-signin-btn"
        >
          <span>Sign In</span>
        </button>

        <button
          onClick={() => openAuthModal('signup')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono py-1.5 px-3.5 rounded-md shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          id="header-signup-btn"
        >
          <User className="w-3.5 h-3.5" />
          <span>Sign Up Free</span>
        </button>
      </div>
    );
  }

  const displayName = userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#fafafa] transition-all cursor-pointer"
        id="user-menu-button"
      >
        <div className="relative">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-md object-cover border border-[#27272a]"
            />
          ) : (
            <div className="w-7 h-7 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
              {initial}
            </div>
          )}
          {isPro && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-black font-bold shadow-sm">
              ★
            </div>
          )}
        </div>

        <div className="hidden sm:block text-left pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white max-w-[100px] truncate">
              {displayName}
            </span>
            {isPro && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            )}
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-[#a1a1aa] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#fafafa]"
          id="user-dropdown-menu"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-[#27272a] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">{displayName}</span>
              {isPro ? (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO MEMBER
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                  FREE TIER
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#71717a] font-mono truncate">{currentUser.email}</p>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                setHistoryDrawerOpen(true);
              }}
              className="w-full px-3 py-2 rounded-lg text-xs hover:bg-[#27272a] flex items-center justify-between text-[#fafafa] transition-colors cursor-pointer"
              id="menu-history-btn"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Conversion History</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                {history.length}
              </span>
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                setProModalOpen(true);
              }}
              className="w-full px-3 py-2 rounded-lg text-xs hover:bg-[#27272a] flex items-center justify-between text-[#fafafa] transition-colors cursor-pointer"
              id="menu-pro-btn"
            >
              <div className="flex items-center gap-2.5">
                <Crown className={`w-4 h-4 ${isPro ? 'text-amber-400' : 'text-indigo-400'}`} />
                <span>{isPro ? 'Manage Pro Tier' : 'Upgrade to Pro'}</span>
              </div>
              {isPro && (
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  Active
                </span>
              )}
            </button>

            <a
              href="/pricing"
              onClick={(e) => {
                e.preventDefault();
                setDropdownOpen(false);
                window.history.pushState({}, '', '/pricing');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="w-full px-3 py-2 rounded-lg text-xs hover:bg-[#27272a] flex items-center justify-between text-[#fafafa] transition-colors cursor-pointer"
              id="menu-pricing-btn"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Pricing & Proof Upload</span>
              </div>
            </a>

            {isAdmin && (
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="w-full px-3 py-2 rounded-lg text-xs hover:bg-amber-950/30 border border-amber-500/20 flex items-center justify-between text-amber-300 transition-colors cursor-pointer"
                id="menu-admin-btn"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Panel</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  STAFF
                </span>
              </a>
            )}
          </div>

          {/* Sign Out */}
          <div className="pt-1.5 border-t border-[#27272a] p-1.5">
            <button
              onClick={async () => {
                setDropdownOpen(false);
                await logout();
              }}
              className="w-full px-3 py-2 rounded-lg text-xs hover:bg-rose-950/40 text-[#a1a1aa] hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
              id="menu-signout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
