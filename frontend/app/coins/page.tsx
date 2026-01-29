'use client';

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { paymentsAPI } from '@/lib/api';

interface CoinPack {
  coins: number;
  amount: number;
  label: string;
  popular: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name: string;
      description: string;
      handler: (res: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      prefill?: { email?: string; name?: string };
      theme?: { color: string };
    }) => { open: () => void };
  }
}

export default function CoinsPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<CoinPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPacks();
  }, [router]);

  const fetchPacks = async () => {
    try {
      const res = await paymentsAPI.getPacks();
      setPacks(res.data.data || []);
    } catch {
      setPacks([
        { coins: 100, amount: 99, label: '100 Coins', popular: false },
        { coins: 500, amount: 449, label: '500 Coins', popular: true },
        { coins: 1000, amount: 799, label: '1000 Coins', popular: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = useCallback(
    async (pack: CoinPack) => {
      setError('');
      setSuccess('');
      setPurchasing(pack.coins);

      try {
        const { data } = await paymentsAPI.createOrder(pack.coins);
        const d = data?.data;
        if (!d?.orderId || !d?.keyId) {
          setError('Invalid response from server.');
          setPurchasing(null);
          return;
        }
        const { orderId, keyId, amount, currency } = d;

        if (!scriptReady || typeof window === 'undefined' || !(window as any).Razorpay) {
          setError('Payment script not loaded. Please refresh and try again.');
          setPurchasing(null);
          return;
        }

        const Razorpay = (window as any).Razorpay;
        const rzp = new Razorpay({
          key: keyId,
          amount: String(amount),
          currency: currency || 'INR',
          order_id: orderId,
          name: 'Startup Benefits',
          description: `Purchase ${pack.coins} coins`,
          theme: { color: '#2563eb' },
          handler: async (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              await paymentsAPI.verify({
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
                coins: pack.coins,
              });
              setSuccess(`+${pack.coins} coins added!`);
              setPurchasing(null);
              setTimeout(() => router.push('/dashboard'), 1500);
            } catch (e: any) {
              setError(e?.response?.data?.message || 'Verification failed');
              setPurchasing(null);
            }
          },
          modal: {
            ondismiss: () => {
              setPurchasing(null);
            },
          },
        });

        rzp.on('payment.failed', () => {
          setError('Payment failed or was cancelled.');
          setPurchasing(null);
        });

        rzp.open();
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          (err?.response?.status === 401 ? 'Please log in again.' : '') ||
          (err?.response?.status === 503 ? 'Payment gateway not configured.' : '') ||
          'Could not start payment';
        setError(String(msg).trim() || 'Could not start payment');
        setPurchasing(null);
      }
    },
    [router, scriptReady]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-semibold mb-6 inline-block"
          >
            ← Back to Dashboard
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Purchase Coins</h1>
            <p className="text-gray-600">
              Use coins to unlock deals and rewards. Powered by{' '}
              <a
                href="https://razorpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Razorpay
              </a>
              .
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <div
                key={pack.coins}
                className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-200 hover:shadow-xl ${
                  pack.popular ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200'
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="text-center mb-6">
                  <p className="text-gray-600 font-medium">{pack.label}</p>
                  <p className="text-4xl font-bold text-gray-800 mt-2">₹{pack.amount}</p>
                </div>
                <button
                  onClick={() => handleBuy(pack)}
                  disabled={purchasing !== null || !scriptReady}
                  className="w-full py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition duration-200"
                >
                  {!scriptReady
                    ? 'Loading…'
                    : purchasing === pack.coins
                    ? 'Opening Razorpay…'
                    : 'Buy with Razorpay'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
