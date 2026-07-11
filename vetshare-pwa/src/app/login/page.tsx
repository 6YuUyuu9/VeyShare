'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

type UserRole = 'owner' | 'vet';

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
    } else {
      // เมื่อล็อกอินสำเร็จ สามารถส่งแยกหน้าตามบทบาทได้ (เช่น /dashboard สำหรับหมอ หรือ / สำหรับเจ้าของ)
      if (role === 'vet') {
        router.push('/clinic-dashboard');
      } else {
        router.push('/pet-dashboard');
      }
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transition-all duration-300">
        
        {/* Brand & Subtitle */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Vet<span className="text-sky-500">Share</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            ระบบเวชระเบียนสัตวแพทย์ควบคุมสิทธิ์ผ่านคิวอาร์โค้ด
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mt-6">
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              role === 'owner'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🐾 เจ้าของสัตว์เลี้ยง
          </button>
          <button
            type="button"
            onClick={() => setRole('vet')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              role === 'vet'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🩺 สัตวแพทย์ / คลินิก
          </button>
        </div>

        {/* Status Error Message */}
        {errorMessage && (
          <div className="p-3.5 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium animate-pulse">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form Fields */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              อีเมลผู้ใช้งาน
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all text-sm"
              placeholder={role === 'owner' ? 'owner@example.com' : 'vet@clinic.com'}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                รหัสผ่าน
              </label>
              <a href="#" className="text-xs font-semibold text-sky-500 hover:text-sky-600 transition-colors">
                ลืมรหัสผ่าน?
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-600 hover:shadow-sky-500/30 active:scale-[0.99] disabled:bg-sky-300 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                กำลังยืนยันตัวตน...
              </span>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>

        {/* Secondary Actions */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            ยังไม่มีบัญชีผู้ใช้งานใช่ไหม?{' '}
            <a href="#" className="font-bold text-sky-500 hover:text-sky-600 transition-colors">
              สมัครสมาชิกใหม่
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}