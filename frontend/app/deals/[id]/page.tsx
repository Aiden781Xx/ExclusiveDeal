'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Partner {
  name: string;
  website?: string;
  logo?: string;
}

interface Deal {
  _id: string;
  title: string;
  description: string;
  category: string;
  partner: Partner | string;
  discount: number;
  value?: number;
  originalPrice?: string;
  discountedPrice?: string;
  isLocked: boolean;
  requiredVerification: string;
  claimsCount: number;
  maxClaims?: number | null;
  expiryDate: string;
}

function dealValue(deal: Deal): string {
  return deal.discountedPrice ?? deal.originalPrice ?? (deal.value != null ? `$${deal.value}` : '—');
}

function partnerName(p: Partner | string): string {
  return typeof p === 'string' ? p : p?.name ?? '';
}

interface User {
  isVerified: boolean;
}

export default function DealDetails() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDealDetails();
    fetchUserProfile();
  }, [router, dealId]);

  const fetchDealDetails = async () => {
    try {
      const response = await api.get(`/deals/${dealId}`);
      setDeal(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch deal details');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data.data);
    } catch (err) {
      console.error('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDeal = async () => {
    setError('');
    setSuccess('');
    setClaiming(true);

    try {
      // Check if deal is locked and user is not verified
      if (deal?.isLocked && !user?.isVerified) {
        router.push(`/verify?redirect=/deals/${dealId}`);
        return;
      }

      const response = await api.post(`/claims/${dealId}/claim`);
      setSuccess('Deal claimed successfully! Check your dashboard for details.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to claim deal';
      setError(errorMsg);
      
      // If error is about verification, redirect to verify page
      if (err.response?.status === 403) {
        setTimeout(() => {
          router.push(`/verify?redirect=/deals/${dealId}`);
        }, 2000);
      }
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading deal details...</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Deal not found</h1>
          <Link href="/deals" className="text-blue-500 hover:text-blue-700">
            Back to deals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link href="/deals" className="text-blue-500 hover:text-blue-700 font-semibold mb-6 inline-block">
          ← Back to deals
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-full capitalize mb-4">
                  {deal.category}
                </span>
                {deal.isLocked && (
                  <span className="ml-3 inline-block px-4 py-2 bg-red-100 text-red-800 font-semibold rounded-full">
                    🔒 Verification Required
                  </span>
                )}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{deal.title}</h1>
            <p className="text-gray-600 text-lg">{deal.description}</p>
          </div>

          {/* Deal Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Discount</p>
              <p className="text-4xl font-bold text-green-600">{deal.discount}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Deal Value</p>
              <p className="text-3xl font-bold text-gray-800">{dealValue(deal)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Claimed By</p>
              <p className="text-3xl font-bold text-blue-600">{deal.claimsCount} users</p>
            </div>
          </div>

          {/* Partner & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-t pt-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Partner</h3>
              <p className="text-2xl font-semibold text-blue-600">{partnerName(deal.partner)}</p>
              <p className="text-gray-600 mt-2">Leading provider in {deal.category} solutions</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Key Details</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Expires:</strong> {new Date(deal.expiryDate).toLocaleDateString()}
                </li>
                <li>
                  <strong>Type:</strong> {deal.isLocked ? 'Verified Users Only' : 'Public Deal'}
                </li>
                {deal.maxClaims && <li><strong>Limit:</strong> {deal.maxClaims} users max</li>}
              </ul>
            </div>
          </div>

          {/* Eligibility */}
          {deal.isLocked && (
            <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">🔒 This deal requires verification</h3>
              <p className="text-yellow-800">
                You need to verify your startup details to claim this exclusive deal.
                {!user?.isVerified && ' You are currently not verified.'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✓ {success}
            </div>
          )}

          {/* Action Button */}
          <div className="border-t pt-8">
            <button
              onClick={handleClaimDeal}
              disabled={claiming}
              className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition duration-200 ${
                claiming
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {claiming ? 'Claiming...' : 'Claim This Deal'}
            </button>
          </div>

          {/* Info Footer */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Once claimed, you'll receive a unique code to redeem with {partnerName(deal.partner)}
          </p>
        </div>
      </div>
    </div>
  );
}
