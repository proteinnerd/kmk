'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { UserRegistration } from '@/types/user';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserRegistration>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register');
      }

      // Redirect to login page on successful registration
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1d24] min-h-screen flex items-center justify-center">
      <div className="bg-white/5 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Register</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
} 