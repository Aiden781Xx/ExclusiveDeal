'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/deals';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    industry: '',
    foundingYear: new Date().getFullYear().toString(),
    teamSize: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/users/verify', {
        industry: formData.industry,
        foundingYear: parseInt(formData.foundingYear),
        teamSize: formData.teamSize,
      });

      // Redirect after successful verification
      router.push(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Verify Your Startup</h1>
        <p className="text-center text-gray-600 mb-8">
          Complete your profile to access exclusive deals
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 mb-2">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              name="industry"
              placeholder="e.g., SaaS, FinTech, EdTech"
              value={formData.industry}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="foundingYear" className="block text-sm font-semibold text-gray-700 mb-2">
              Founding Year
            </label>
            <input
              id="foundingYear"
              type="number"
              name="foundingYear"
              min="2000"
              max={new Date().getFullYear()}
              value={formData.foundingYear}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="teamSize" className="block text-sm font-semibold text-gray-700 mb-2">
              Team Size
            </label>
            <select
              id="teamSize"
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select team size</option>
              <option value="1">1 person</option>
              <option value="2-5">2-5 people</option>
              <option value="6-10">6-10 people</option>
              <option value="11-20">11-20 people</option>
              <option value="20+">20+ people</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Your information is secure and will only be used to verify your startup status.
        </p>
      </div>
    </div>
  );
}
