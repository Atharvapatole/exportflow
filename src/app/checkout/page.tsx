'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Building,
  User,
  Mail,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PRICING_CATALOG } from '@/config/constants';
import { Button } from '@/components/ui/Button';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get('plan');
  const packId = searchParams.get('pack');
  const interval = (searchParams.get('interval') || searchParams.get('billingCycle') || 'monthly') as
    | 'monthly'
    | 'annual';

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<{
    user?: { name: string; email: string };
    organization?: { name: string; country: string };
  } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Determine selected item
  const allPlans = [...PRICING_CATALOG.exporterPlans, ...PRICING_CATALOG.chaPlans];
  const selectedSub = planId ? allPlans.find((s) => s.id === planId) : null;
  const selectedPack = packId ? PRICING_CATALOG.creditPacks.find((p) => p.id === packId) : null;

  // Default to professional if neither specified
  const effectiveSub = !selectedSub && !selectedPack ? PRICING_CATALOG.exporterPlans.find((s) => s.id === 'professional') : selectedSub;
  const itemType = selectedPack ? 'credit_pack' : 'subscription';
  const itemId = selectedPack ? selectedPack.id : (effectiveSub?.id || 'professional');

  const itemName = selectedPack
    ? selectedPack.name
    : `${effectiveSub?.name || 'Professional'} Plan (${interval === 'annual' ? 'Annual' : 'Monthly'})`;

  const itemPrice = selectedPack
    ? selectedPack.priceInr
    : interval === 'annual'
    ? effectiveSub?.annualPriceInr || 5990
    : effectiveSub?.monthlyPriceInr || 599;

  // Fetch current user context
  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserContext(data);
        }
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setCheckingAuth(false);
      }
    }
    loadAuth();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          itemId,
          billingCycle: itemType === 'subscription' ? interval : undefined,
        }),
      });

      const orderData = await res.json();

      if (res.status === 401) {
        const returnUrl = encodeURIComponent(`/checkout?${selectedPack ? `pack=${selectedPack.id}` : `plan=${effectiveSub?.id || 'growth'}&interval=${interval}`}`);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay payment gateway failed to load. Please check your internet connection.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ExportFlow by BENZWELL',
        description: `${itemName} Checkout`,
        order_id: orderData.orderId,
        prefill: {
          name: userContext?.user?.name || '',
          email: userContext?.user?.email || '',
        },
        theme: {
          color: '#10243A',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              alert('Payment successful! Your ExportFlow subscription and credits are activated.');
              const isChaPlan = String(itemId).startsWith('cha_') || String(planId).startsWith('cha_');
              router.push(isChaPlan ? '/cha/dashboard' : '/dashboard');
              router.refresh();
            } else {
              alert(verifyData.error || 'Payment verification failed. Please contact support.');
            }
          } catch (err: any) {
            alert('Verification network error: ' + err.message);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        alert('Payment Failed: ' + (resp.error?.description || 'Payment was declined'));
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Top back navigation */}
      <div className="mb-8">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pricing & Plans</span>
        </Link>
      </div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted Razorpay Checkout</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Complete Your Order
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Instant activation. Automated B2B GST invoice provided.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plan Details & Features */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {selectedPack ? 'Pay-As-You-Go Credit Pack' : 'Subscription Plan'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {itemName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedPack
                    ? `${selectedPack.name} with 12 months validity and instant document credits.`
                    : `Full document workflow suite with ${interval} billing.`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{itemPrice.toLocaleString('en-IN')}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {selectedPack ? 'one-time' : `/${interval === 'annual' ? 'year' : 'month'}`}
                </span>
              </div>
            </div>

            <hr className="my-6 border-slate-100 dark:border-slate-800" />

            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Included Entitlements & Features
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {selectedPack ? (
                <>
                  {selectedPack.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Credits never expire — Lifetime validity</span>
                  </li>
                </>
              ) : (
                <>
                  {(effectiveSub as any)?.features?.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Instant access to Document Studio & Vector PDF exports</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Account Details Box */}
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span>Billing Account</span>
            </h3>

            {userContext?.user ? (
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {userContext.user.name}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {userContext.user.email}
                  </span>
                </div>
                {userContext.organization && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Company</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {userContext.organization.name}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
                <p>You are not currently logged in. Clicking checkout will prompt you to quickly sign in or register to attach your plan to your export organization.</p>
                <div className="mt-3 flex gap-3">
                  <Link
                    href={`/login?returnUrl=${encodeURIComponent(`/checkout?${selectedPack ? `pack=${selectedPack.id}` : `plan=${effectiveSub?.id || 'growth'}&interval=${interval}`}`)}`}
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                      Log In to existing account
                    </span>
                  </Link>
                  <span>•</span>
                  <Link
                    href={`/register?plan=${selectedPack ? selectedPack.id : effectiveSub?.id || 'growth'}`}
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                      Create new account
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Button */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md sticky top-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{itemName}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{itemPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (Statutory 18% Included)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing Fee</span>
                <span>₹0</span>
              </div>

              <hr className="my-2 border-slate-100 dark:border-slate-800" />

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Total Payable
                </span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  ₹{itemPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handlePay}
                isLoading={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md rounded-xl flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{itemPrice.toLocaleString('en-IN')} via Razorpay</span>
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Supports UPI, Cards, NetBanking, EMI & Wallets</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Instant activation after payment completion</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <span>GST invoice sent to registered email</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] text-[#172033] dark:text-[#F1F5F9] flex flex-col transition-colors">
      <PublicHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center text-sm text-slate-500">
              Loading checkout...
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
