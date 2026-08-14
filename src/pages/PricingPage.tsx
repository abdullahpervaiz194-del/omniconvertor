import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Loader2, 
  Copy, 
  QrCode, 
  Sparkles, 
  Building2, 
  Wallet, 
  CreditCard,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  uploadPaymentScreenshot, 
  submitPaymentRequest, 
  subscribeToUserPaymentRequests 
} from '../services/firestoreService';
import { PaymentRequest } from '../types/firestore';
import confetti from 'canvas-confetti';

interface PricingPageProps {
  navigate: (route: string) => void;
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  period: string;
  badge?: string;
  featured?: boolean;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 9,
    period: '/month',
    features: [
      'Uncapped SIMD multi-core WASM speed',
      'Persistent encrypted Firestore history',
      'All 12 Image, Doc & Media converters',
      'Batch conversion with ZIP export',
      'High-bitrate GIF & 1080p MP4 export'
    ]
  },
  {
    id: 'pro_lifetime',
    name: 'Pro Lifetime Access',
    price: 49,
    period: 'one-time',
    badge: 'MOST POPULAR',
    featured: true,
    features: [
      'Lifetime unlimited Pro membership',
      'Zero monthly or annual renewals',
      'Turbo hardware acceleration',
      'Priority access to all future converters',
      'Priority manual & automated verification',
      'Zero server upload file privacy guarantee'
    ]
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual Team',
    price: 79,
    period: '/year',
    badge: 'SAVE 30%',
    features: [
      'Full Pro suite for power users',
      'Unlimited 4K SVG vectorization tracings',
      'Multi-page PDF OCR & Word extractions',
      'Dedicated premium support channel',
      'Commercial usage license'
    ]
  }
];

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  const { 
    currentUser, 
    userProfile, 
    isPro, 
    isAdmin, 
    setAuthModalOpen 
  } = useAuth();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro_lifetime');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [transactionId, setTransactionId] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRequest, setSuccessRequest] = useState<PaymentRequest | null>(null);

  // User's past payment requests
  const [userRequests, setUserRequests] = useState<PaymentRequest[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[1];

  // Subscribe to user's payment requests in Firestore
  useEffect(() => {
    if (!currentUser) {
      setUserRequests([]);
      return;
    }

    const unsub = subscribeToUserPaymentRequests(currentUser.uid, (requests) => {
      setUserRequests(requests);
    });

    return () => unsub();
  }, [currentUser]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size must be under 15MB.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Helper to generate a sample canvas receipt for instant 1-click test verification
  const handleGenerateSampleReceipt = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 400);

    // Card frame
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(20, 20, 560, 360, 16);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Receipt header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('PAYMENT TRANSFER RECEIPT', 50, 70);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`Date: ${new Date().toLocaleString()}`, 50, 105);
    ctx.fillText(`Transfer Reference: TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, 50, 130);

    // Divider
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(550, 150);
    ctx.stroke();

    // Details
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Product: ${selectedPlan.name}`, 50, 190);
    ctx.fillText(`Amount Paid: $${selectedPlan.price}.00 USD`, 50, 225);
    ctx.fillText(`Paid By: ${currentUser?.displayName || currentUser?.email || 'Valued User'}`, 50, 260);
    ctx.fillText(`Payment Mode: ${paymentMethod.toUpperCase()}`, 50, 295);

    // Status stamp
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('● COMPLETED / VERIFIED', 50, 345);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_payment_receipt_${Date.now()}.png`, { type: 'image/png' });
        handleFileSelect(file);
      }
    }, 'image/png');
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!selectedFile) {
      setErrorMsg('Please upload a screenshot or image of your payment proof.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setUploadProgress('Uploading payment proof to Firebase Storage...');

    try {
      // 1. Upload to Firebase Storage
      const { downloadUrl, storagePath } = await uploadPaymentScreenshot(
        currentUser.uid,
        selectedFile,
        selectedFile.name
      );

      setUploadProgress('Recording payment submission in Firestore...');

      // 2. Submit payment request to Firestore
      const newRequest = await submitPaymentRequest({
        userId: currentUser.uid,
        userEmail: currentUser.email || 'anonymous@user.com',
        userName: senderName.trim() || currentUser.displayName || currentUser.email?.split('@')[0] || 'Member',
        planId: selectedPlan.id,
        planName: `${selectedPlan.name} ($${selectedPlan.price})`,
        amount: selectedPlan.price,
        currency: 'USD',
        paymentMethod,
        transactionId: transactionId.trim() || `TX-${Date.now().toString().slice(-6)}`,
        screenshotUrl: downloadUrl,
        storagePath,
        notes: notes.trim(),
      });

      setSuccessRequest(newRequest);
      setSelectedFile(null);
      setPreviewUrl(null);
      setTransactionId('');
      setSenderName('');
      setNotes('');

      // Confetti celebration
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err: any) {
      console.error('[Payment Proof] Submission failed:', err);
      setErrorMsg(err.message || 'Failed to submit payment screenshot. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const scrollToUpload = (planId: string) => {
    setSelectedPlanId(planId);
    if (uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>INSTANT UPGRADE WITH MANUAL PAYMENT PROOF VERIFICATION</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Flexible Pricing & Payment Verification
        </h1>
        <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
          Choose a plan, send payment via your preferred instrument, and upload your payment screenshot. Our team verifies submissions promptly with automated instant Pro activation.
        </p>

        {isPro && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-3 font-mono">
            <Crown className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>You currently have active Pro membership ({userProfile?.proPlan || 'Pro Unlimited'}). All modules unlocked!</span>
          </div>
        )}
      </section>

      {/* Pricing Plans Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                plan.featured
                  ? 'bg-gradient-to-b from-[#1c1936] to-[#121124] border-indigo-500/60 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]'
              } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-amber-500 text-white shadow-md">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1 font-mono">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-[#71717a]">{plan.period}</span>
                  </div>
                </div>

                <div className="w-full h-px bg-[#27272a]"></div>

                <ul className="space-y-2.5 text-xs text-[#a1a1aa]">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToUpload(plan.id);
                  }}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    plan.featured || isSelected
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-[#27272a] hover:bg-[#3f3f46] text-white border border-[#3f3f46]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select & Upload Proof</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Payment Proof Upload Section */}
      <section 
        ref={uploadSectionRef} 
        id="upload-payment-section"
        className="p-6 sm:p-8 rounded-2xl bg-[#18181b] border border-[#27272a] shadow-xl space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272a]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                STEP 2 & 3
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Transfer & Upload Payment Screenshot
              </h2>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Send the exact plan amount (${selectedPlan.price} USD) to any of our channels below and submit your screenshot.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-[#71717a] font-mono uppercase block">Selected Tier</span>
              <span className="text-xs font-bold text-white">{selectedPlan.name} (${selectedPlan.price})</span>
            </div>
          </div>
        </div>

        {/* Payment Transfer Channels (Accordion / Tabs) */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Select Payment Destination Channel</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'bank_transfer', label: 'Bank Wire / IBAN', icon: Building2 },
              { id: 'easypaisa_jazzcash', label: 'EasyPaisa / JazzCash', icon: Wallet },
              { id: 'stripe_paypal', label: 'PayPal / Stripe', icon: CreditCard },
              { id: 'crypto_usdt', label: 'Crypto (USDT-TRC20)', icon: QrCode },
            ].map((method) => {
              const Icon = method.icon;
              const isCurrent = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isCurrent
                      ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500 text-white'
                      : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-indigo-400' : 'text-[#71717a]'}`} />
                  <span className="text-xs font-semibold">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Transfer Instructions Box */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-3 font-mono text-xs">
            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>Bank Name:</span>
                  <span className="text-white font-semibold">Standard International Commercial Bank</span>
                </div>
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>Account Title:</span>
                  <span className="text-white font-semibold">OmniConvert Global Ltd</span>
                </div>
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>Account / IBAN:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-300 font-bold">GB29NWBK60161331926819</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('GB29NWBK60161331926819', 'iban')}
                      className="p-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                      title="Copy IBAN"
                    >
                      {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>Swift / BIC:</span>
                  <span className="text-white">NWBKGB2L</span>
                </div>
              </div>
            )}

            {paymentMethod === 'easypaisa_jazzcash' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>EasyPaisa / JazzCash Title:</span>
                  <span className="text-white font-semibold">Abdullah Pervaiz</span>
                </div>
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>Mobile Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">+92 300 1234567</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('+923001234567', 'ep')}
                      className="p-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === 'ep' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>Amount to Send (PKR Eqv):</span>
                  <span className="text-amber-400 font-bold">~PKR {(selectedPlan.price * 278).toLocaleString()}</span>
                </div>
              </div>
            )}

            {paymentMethod === 'stripe_paypal' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>PayPal Email:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-300 font-bold">billing@omniconvert.app</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('billing@omniconvert.app', 'pp')}
                      className="p-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === 'pp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>Reference Tag:</span>
                  <span className="text-white">PRO-{currentUser?.uid ? currentUser.uid.substring(0, 6).toUpperCase() : 'MEMBER'}</span>
                </div>
              </div>
            )}

            {paymentMethod === 'crypto_usdt' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>USDT Network:</span>
                  <span className="text-emerald-400 font-bold">TRC-20 (Tron)</span>
                </div>
                <div className="flex items-center justify-between text-[#a1a1aa]">
                  <span>Wallet Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-300 font-bold truncate max-w-[200px] sm:max-w-none">
                      TY2D7bF84Y7qKpMN9zX2QWj8v1A6S9uR3E
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('TY2D7bF84Y7qKpMN9zX2QWj8v1A6S9uR3E', 'usdt')}
                      className="p-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === 'usdt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmitProof} className="space-y-6">
          
          {/* Screenshot Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Payment Proof Screenshot (Firebase Storage)</span>
              </label>

              {/* Instant Test Receipt Generator Button */}
              <button
                type="button"
                onClick={handleGenerateSampleReceipt}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer"
                title="Generates a mock receipt canvas image for testing"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Test Receipt</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-[#27272a] hover:border-indigo-500/50 rounded-2xl bg-[#09090b] text-center space-y-3 cursor-pointer group transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">
                    Click to browse or drag and drop your payment screenshot
                  </p>
                  <p className="text-[11px] text-[#71717a] font-mono">
                    Supports PNG, JPG, JPEG, WEBP up to 15MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#09090b] border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-white">{selectedFile?.name}</span>
                    <span className="text-[10px] text-[#71717a] font-mono">
                      ({((selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLightboxUrl(previewUrl)}
                      className="p-1 rounded text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors cursor-pointer"
                      title="Inspect preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-[#18181b] transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-[#27272a] max-h-56 bg-black/50 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Payment Proof Preview"
                    className="max-h-56 w-auto object-contain cursor-pointer"
                    onClick={() => setLightboxUrl(previewUrl)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Meta Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#a1a1aa] block">
                Transaction / Reference ID (Optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN987654321 or Bank Ref"
                className="w-full bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white placeholder-[#71717a] font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#a1a1aa] block">
                Sender Name / Phone
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={currentUser?.displayName || currentUser?.email || 'Your Name'}
                className="w-full bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white placeholder-[#71717a] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#a1a1aa] block">
              Additional Notes or Comments (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any details to help verify your payment quickly..."
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-lg p-3 text-xs text-white placeholder-[#71717a] focus:outline-none resize-none"
            />
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success notice */}
          {successRequest && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Payment Proof Successfully Submitted!</span>
              </div>
              <p className="text-xs text-[#a1a1aa] font-mono leading-relaxed">
                Your request ID is <span className="text-white font-bold">{successRequest.id}</span> for <span className="text-white">{successRequest.planName}</span>. Status is currently <span className="text-amber-400 font-bold">PENDING REVIEW</span>. Once an admin clicks approve, your Pro membership will activate automatically!
              </p>
              {isAdmin && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Admin Panel to Approve this Request</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            {!currentUser ? (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sign In to Upload Payment Screenshot</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isUploading}
                id="submit-payment-proof-btn"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs font-mono shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadProgress || 'Processing Upload...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Payment Proof for Verification (${selectedPlan.price} USD)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </section>

      {/* User's Payment Submissions History */}
      {currentUser && userRequests.length > 0 && (
        <section className="p-6 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Your Payment Proof Submissions ({userRequests.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#71717a] font-mono">Real-time Firestore Sync</span>
          </div>

          <div className="divide-y divide-[#27272a]">
            {userRequests.map((req) => (
              <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{req.planName}</span>
                    <span className="text-[10px] font-mono text-[#71717a]">ID: {req.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#a1a1aa] font-mono text-[11px]">
                    <span>Method: {req.paymentMethod?.replace('_', ' ').toUpperCase()}</span>
                    <span>Ref: {req.transactionId || 'N/A'}</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  {req.rejectionReason && (
                    <p className="text-[11px] text-red-400 font-mono">
                      Reason: {req.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLightboxUrl(req.screenshotUrl)}
                    className="px-2.5 py-1 rounded bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] text-white text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-indigo-400" />
                    <span>View Receipt</span>
                  </button>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    req.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : req.status === 'rejected'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                  }`}>
                    {req.status === 'approved' ? '✓ Approved (Pro Active)' : req.status === 'rejected' ? '✕ Rejected' : '● Pending Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Admin Quick Jump Link */}
      {isAdmin && (
        <section className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Admin Access Detected: Manage all pending verification screenshots in the Admin Panel</span>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer"
          >
            Open Admin Panel →
          </button>
        </section>
      )}

      {/* Image Lightbox Modal */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div 
            className="max-w-3xl max-h-[85vh] bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#27272a] flex items-center justify-between bg-[#09090b]">
              <span className="text-xs font-mono text-white font-bold">Payment Screenshot Lightbox</span>
              <button
                onClick={() => setLightboxUrl(null)}
                className="p-1 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={lightboxUrl}
                alt="Payment Screenshot Full Preview"
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
