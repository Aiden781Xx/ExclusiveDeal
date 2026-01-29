'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  claimsCount: number;
  status: string;
}

function dealValue(deal: Deal): string {
  return deal.discountedPrice ?? deal.originalPrice ?? (deal.value != null ? `$${deal.value}` : '—');
}

function partnerName(p: Partner | string): string {
  return typeof p === 'string' ? p : p?.name ?? '';
}

const CATEGORIES = ['Cloud', 'Marketing', 'Analytics', 'Productivity'] as const;

export default function Deals() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchDeals = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await api.get('/deals', { params });
      setDeals(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDeals();
  }, [router, fetchDeals]);

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-bold text-gray-800">Available Deals</h1>
          <div className="flex gap-3">
            <Link
              href="/coins"
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg transition duration-200 font-medium"
            >
              🪙 Purchase Coins
            </Link>
            <Link
              href="/dashboard"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              My Dashboard
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-md h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Deals Grid */}
            {deals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {deals.map(deal => (
                  <Link
                    key={deal._id}
                    href={`/deals/${deal._id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full p-6 flex flex-col">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full capitalize">
                            {deal.category}
                          </span>
                        </div>
                        {deal.isLocked && (
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                            🔒 Locked
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                        {deal.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 flex-grow">
                        {((deal.description ?? '').length > 100
                          ? (deal.description ?? '').slice(0, 100) + '...'
                          : (deal.description ?? ''))}
                      </p>

                      <div className="border-t pt-4 mb-4">
                        <p className="text-sm text-gray-600 mb-2">Partner: <strong>{partnerName(deal.partner)}</strong></p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{deal.discount}%</p>
                            <p className="text-xs text-gray-500">Discount</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Value</p>
                            <p className="text-lg font-bold text-gray-800">{dealValue(deal)}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Claimed by {deal.claimsCount} users
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No deals found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
