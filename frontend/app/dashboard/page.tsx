'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  isVerified: boolean;
  coins?: number;
}

interface Partner {
  name: string;
  website?: string;
  logo?: string;
}

interface Claim {
  _id: string;
  claimCode: string;
  status: string;
  expiryDate: string;
  dealId: {
    title: string;
    partner: Partner | string;
    category: string;
    discount: number;
  };
}

function partnerName(p: Partner | string): string {
  return typeof p === 'string' ? p : p?.name ?? '';
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile();
    fetchClaims();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await api.get('/claims/user/claims');
      setClaims(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-bold text-gray-800">My Dashboard</h1>
          <div className="flex flex-wrap gap-3 items-center">
            {user && (
              <Link
                href="/coins"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition duration-200 font-semibold"
              >
                <span>🪙</span>
                <span>{user.coins ?? 0} Coins</span>
                <span className="text-amber-200">·</span>
                <span>Purchase</span>
              </Link>
            )}
            <Link
              href="/deals"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Browse Deals
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 text-sm mb-2">Full Name</p>
                <p className="text-2xl font-bold text-gray-800">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-2">Coins</p>
                <p className="text-xl text-gray-700 flex items-center gap-2">
                  <span className="font-bold text-amber-600">{user.coins ?? 0}</span>
                  <Link href="/coins" className="text-blue-500 hover:underline text-sm">Purchase more</Link>
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-2">Email</p>
                <p className="text-xl text-gray-700">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-2">Company</p>
                <p className="text-xl text-gray-700">{user.company || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-2">Verification Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-4 py-2 rounded-full font-semibold ${
                      user.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.isVerified ? '✓ Verified' : '⏳ Not Verified'}
                  </span>
                  {!user.isVerified && (
                    <Link
                      href="/verify"
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      Verify now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Claims Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Claimed Deals ({claims.length})
          </h2>

          {loading ? (
            <div className="text-center text-gray-600 py-12">Loading claims...</div>
          ) : claims.length > 0 ? (
            <div className="space-y-4">
              {claims.map(claim => (
                <div
                  key={claim._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {claim.dealId.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Partner: <strong>{partnerName(claim.dealId.partner)}</strong>
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Category: <strong className="capitalize">{claim.dealId.category}</strong>
                        </span>
                        <span className="text-green-600 font-bold">
                          {claim.dealId.discount}% Discount
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-block px-4 py-2 rounded-full font-semibold capitalize whitespace-nowrap ${getStatusColor(claim.status)}`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Claim Code</p>
                      <p className="text-lg font-mono font-bold text-blue-600">
                        {claim.claimCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Expires</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(claim.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(claim.claimCode);
                          alert('Claim code copied to clipboard!');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-6">No claimed deals yet</p>
              <Link
                href="/deals"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg transition duration-200 inline-block"
              >
                Start Browsing Deals
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
