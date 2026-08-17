import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Crown,
  Sparkles,
  ExternalLink,
  DollarSign,
  User as UserIcon,
  Layers,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToAllPaymentRequests,
  fetchPaymentRequestsDirect,
  approvePaymentRequest,
  rejectPaymentRequest
} from '../services/firestoreService';
import { PaymentRequest } from '../types/firestore';
import confetti from 'canvas-confetti';

interface AdminPageProps {
  navigate: (route: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const { 
    currentUser, 
    isAdmin, 
    openAuthModal
  } = useAuth();

  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Rejection modal
  const [rejectingRequest, setRejectingRequest] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Transaction ID could not be verified in banking records.');

  // Screenshot Lightbox
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const direct = await fetchPaymentRequestsDirect();
      setRequests(direct);
      setFeedbackMsg({
        text: `Refreshed ${direct.length} payment records directly from Firestore.`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (e: any) {
      setFeedbackMsg({
        text: e.message || 'Failed to refresh records.',
        type: 'error'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Subscribe to all payment requests in Firestore only when authenticated as admin
  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsub = subscribeToAllPaymentRequests(
      (items) => {
        setRequests(items);
        setIsLoading(false);
      },
      (error) => {
        console.error('[Admin] Failed to load payment requests:', error);
        setIsLoading(false);
      }
    );

    // Also run an immediate direct fetch to populate instantly
    fetchPaymentRequestsDirect().then((items) => {
      if (items.length > 0) {
        setRequests(items);
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, [isAdmin]);

  const handleApprove = async (req: PaymentRequest) => {
    setProcessingId(req.id);
    try {
      await approvePaymentRequest(
        req.id,
        req.userId,
        req.planName,
        currentUser?.email || currentUser?.uid || 'Admin-Reviewer'
      );

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });

      setFeedbackMsg({
        text: `Approved payment for ${req.userEmail || req.userId}. isPro status activated automatically!`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      console.error('[Admin] Approval failed:', err);
      setFeedbackMsg({
        text: err.message || 'Failed to approve payment request.',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingRequest) return;
    setProcessingId(rejectingRequest.id);
    try {
      await rejectPaymentRequest(
        rejectingRequest.id,
        rejectionReason,
        currentUser?.email || currentUser?.uid || 'Admin-Reviewer'
      );

      setFeedbackMsg({
        text: `Payment request ${rejectingRequest.id} marked as rejected.`,
        type: 'success'
      });
      setRejectingRequest(null);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      console.error('[Admin] Rejection failed:', err);
      setFeedbackMsg({
        text: err.message || 'Failed to reject payment request.',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalRevenue = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Filtered list
  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      r.id.toLowerCase().includes(q) ||
      r.userEmail?.toLowerCase().includes(q) ||
      r.userName?.toLowerCase().includes(q) ||
      r.transactionId?.toLowerCase().includes(q) ||
      r.planName?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Guard: If user is not logged in or is not an administrator, show strict access restriction
  if (!currentUser || !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#18181b] border border-rose-500/30 text-center space-y-5 shadow-2xl shadow-rose-950/20">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Administrator Login Required
            </h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              The payment verification dashboard and moderation controls are strictly restricted to authenticated administrators. Please log in with your admin account to continue.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Log In as Admin</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 rounded-xl bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Converters</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Bar Navigation & Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
            title="Back to Converters"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Payment Verification & Admin Panel
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                STAFF ONLY
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Review user payment proof screenshots. Approving a submission automatically activates <code className="text-emerald-400 font-mono">isPro: true</code> for the target user.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            title="Refresh payment requests from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Pricing Page</span>
          </button>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-2 animate-in fade-in ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : 'bg-red-950/60 border-red-500/50 text-red-200'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Metrics Bento Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-mono uppercase font-bold">Total Requests</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {totalCount}
          </div>
          <p className="text-[10px] text-[#a1a1aa] font-mono">All-time payment submissions</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-amber-500/30 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-mono uppercase font-bold">Pending Review</span>
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
            {pendingCount}
          </div>
          <p className="text-[10px] text-amber-400/80 font-mono">Awaiting verification</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-mono uppercase font-bold">Approved (Pro)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
            {approvedCount}
          </div>
          <p className="text-[10px] text-emerald-400/80 font-mono">Auto-upgraded to Pro</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-mono uppercase font-bold">Processed Revenue</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-[#a1a1aa] font-mono">From approved tiers</p>
        </div>
      </section>

      {/* Filters & Search Controls */}
      <section className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#09090b] text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, ID, TXN..."
            className="w-full bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#71717a] font-mono focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </section>

      {/* Submissions List / Table */}
      <section className="rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Pending & Historic Submissions ({filteredRequests.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#71717a] font-mono">Firestore Real-time Stream</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-[#a1a1aa] font-mono">Connecting to Firestore paymentRequests collection...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#09090b] border border-[#27272a] text-[#71717a] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-white font-mono">No payment submissions found</p>
            <p className="text-[11px] text-[#71717a]">
              {filterStatus !== 'all' || searchQuery
                ? 'Try resetting the filter tabs or search criteria.'
                : 'Upload a payment screenshot on the Pricing page to test the approval workflow.'}
            </p>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold cursor-pointer"
            >
              Go to Pricing & Upload Screenshot →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#27272a]">
            {filteredRequests.map((req) => {
              const isProcessing = processingId === req.id;
              return (
                <div 
                  key={req.id} 
                  className={`p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-colors ${
                    req.status === 'pending' ? 'bg-[#18181b] hover:bg-[#1f1f23]' : 'bg-[#121215] opacity-90'
                  }`}
                >
                  {/* Left Column: User & Plan Info */}
                  <div className="flex items-start gap-4">
                    {/* Thumbnail click to preview */}
                    <div 
                      onClick={() => setLightboxImage({ url: req.screenshotUrl, title: `${req.planName} - ${req.userEmail}` })}
                      className="w-20 h-20 rounded-xl bg-black/60 border border-[#27272a] hover:border-indigo-500 overflow-hidden shrink-0 cursor-pointer relative group flex items-center justify-center"
                    >
                      <img 
                        src={req.screenshotUrl} 
                        alt="Screenshot Thumbnail" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">
                          {req.userName || 'Member'}
                        </span>
                        <span className="text-[11px] text-indigo-300 font-mono">
                          ({req.userEmail})
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : req.status === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#a1a1aa] font-mono">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{req.planName}</span>
                          <span className="text-emerald-400 font-bold">(${req.amount})</span>
                        </div>
                        <div>
                          <span>Method: </span>
                          <span className="text-[#fafafa] font-semibold">{req.paymentMethod?.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div>
                          <span>TXN Ref: </span>
                          <span className="text-indigo-300 font-bold">{req.transactionId || 'None'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#71717a] font-mono">
                        <span>Submitted: {new Date(req.createdAt).toLocaleString()}</span>
                        <span>UID: {req.userId.substring(0, 12)}...</span>
                        {req.approvedBy && (
                          <span className="text-emerald-400">Processed by: {req.approvedBy}</span>
                        )}
                      </div>

                      {req.notes && (
                        <p className="text-[11px] text-[#d4d4d8] bg-[#09090b] p-2 rounded-lg border border-[#27272a] max-w-xl">
                          <span className="text-[#71717a] font-mono">User note: </span>
                          {req.notes}
                        </p>
                      )}

                      {req.rejectionReason && (
                        <p className="text-[11px] text-red-300 bg-red-950/30 p-2 rounded-lg border border-red-800/40 max-w-xl font-mono">
                          <span className="text-red-400 font-bold">Rejection Reason: </span>
                          {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions (Approve / Reject / Inspect) */}
                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => setLightboxImage({ url: req.screenshotUrl, title: `${req.planName} - ${req.userEmail}` })}
                      className="px-3 py-2 rounded-lg bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Inspect full image"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Inspect Receipt</span>
                    </button>

                    {req.status === 'pending' ? (
                      <>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleApprove(req)}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve & Activate Pro</span>
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => setRejectingRequest(req)}
                          className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-red-200 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : req.status === 'approved' ? (
                      <div className="px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Pro Active</span>
                      </div>
                    ) : (
                      <div className="px-3 py-2 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>Denied</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reject Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>Reject Payment Submission</span>
              </div>
              <button
                onClick={() => setRejectingRequest(null)}
                className="p-1 rounded text-[#71717a] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Specify the reason why this payment submission for <strong className="text-white">{rejectingRequest.userEmail}</strong> is being rejected:
            </p>

            <div className="space-y-2">
              {[
                'Transaction ID could not be verified in banking records.',
                'Screenshot receipt is unclear or cropped.',
                'Transferred amount does not match the chosen plan tier.',
                'Duplicate transaction reference submitted.'
              ].map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRejectionReason(reason)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                    rejectionReason === reason
                      ? 'bg-red-950/40 border-red-500/60 text-red-200'
                      : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={2}
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-red-500 rounded-lg p-2.5 text-xs text-white placeholder-[#71717a] font-mono focus:outline-none"
              placeholder="Or write custom reason..."
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-3 py-2 rounded-lg text-xs font-mono text-[#a1a1aa] hover:text-white bg-[#09090b] border border-[#27272a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="max-w-4xl max-h-[90vh] bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-[#27272a] flex items-center justify-between bg-[#09090b]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono text-white font-bold">{lightboxImage.title}</span>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh] flex items-center justify-center bg-black">
              <img
                src={lightboxImage.url}
                alt="Payment Screenshot Inspection"
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
