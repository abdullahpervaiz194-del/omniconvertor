import React from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Zap, 
  HardDrive, 
  Layers, 
  Lock, 
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProModal: React.FC = () => {
  const { 
    proModalOpen, 
    setProModalOpen, 
    currentUser, 
    userProfile, 
    isPro, 
    isAdmin,
    setAuthModalOpen 
  } = useAuth();

  if (!proModalOpen) return null;

  const proPerks = [
    {
      icon: Zap,
      title: 'Turbo WASM Hardware Acceleration',
      desc: 'Uncapped multi-core SIMD execution for ultra-fast media conversions.'
    },
    {
      icon: HardDrive,
      title: 'Persistent Cloud History Sync',
      desc: 'Never lose track of past conversions with encrypted Firestore storage.'
    },
    {
      icon: Layers,
      title: 'Uncapped Payload Buffers',
      desc: 'Support for high-bitrate video, multi-page PDFs, and 4K vector tracings.'
    },
    {
      icon: ShieldCheck,
      title: 'Zero Document Retention',
      desc: 'Maximum privacy security guarantee on your client-side hardware.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative text-[#fafafa]"
        id="pro-modal"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  OmniConvert Pro
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded border ${
                  isPro 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'bg-[#09090b] text-[#a1a1aa] border-[#27272a]'
                }`}>
                  {isPro ? 'ACTIVE PRO' : 'FREE TIER'}
                </span>
              </div>
              <p className="text-[11px] text-[#71717a] font-mono">
                Stored in Firestore: {userProfile?.proPlan || 'Free Tier'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setProModalOpen(false)}
            className="p-1 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Pricing Bento Tile */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-[#71717a] block">Membership Status</span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {isPro ? (userProfile?.proPlan || 'Pro Membership') : 'Standard Free Tier'}
              </h4>
              <p className="text-xs text-[#a1a1aa] mt-0.5 font-mono">
                {isPro ? 'All premium converters & features unlocked' : 'Submit payment proof for Admin approval'}
              </p>
            </div>

            <div className="text-right font-mono">
              <div className="text-lg font-bold text-white">
                {isPro ? 'PRO' : '$9+'}<span className="text-xs font-normal text-[#71717a]">{isPro ? '' : '/tier'}</span>
              </div>
              <span className={`text-[10px] font-semibold ${isPro ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPro ? 'Verified by Admin' : 'Admin Approved'}
              </span>
            </div>
          </div>

          {/* Feature Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proPerks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div 
                  key={i} 
                  className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-semibold text-white font-mono">{perk.title}</h5>
                  </div>
                  <p className="text-[11px] text-[#71717a] leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Action CTA */}
          <div className="space-y-2 pt-2">
            {!currentUser ? (
              <button
                onClick={() => {
                  setProModalOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Sign In to Submit Payment Proof</span>
              </button>
            ) : isPro ? (
              <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-2 font-bold">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Pro Membership Active</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa]">
                  Tier: {userProfile?.proPlan || 'Pro Unlimited'}. Approved by OmniConvert Administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <a
                  href="/pricing#upload-payment-section"
                  onClick={(e) => {
                    e.preventDefault();
                    setProModalOpen(false);
                    window.history.pushState({}, '', '/pricing');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    setTimeout(() => {
                      const elem = document.getElementById('upload-payment-section');
                      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Upload Payment Screenshot to Get Pro</span>
                </a>

                <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] text-[11px] text-[#a1a1aa] font-mono text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Pro is unlocked only after admin verifies your payment screenshot</span>
                </div>
              </div>
            )}

            {/* If Admin is viewing, provide quick link to Admin panel */}
            {isAdmin && (
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  setProModalOpen(false);
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="w-full py-2 rounded-lg bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/30 text-amber-300 font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel (Review & Approve Users)</span>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#09090b] border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#71717a] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Real-time Firestore Database Integration</span>
          </div>
          <span>Total Conversions: {userProfile?.totalConversions || 0}</span>
        </div>
      </div>
    </div>
  );
};
