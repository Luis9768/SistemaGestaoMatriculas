'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, LoginResponse } from '@/lib/api';
import { LoginCulturalView } from '@/components/LoginCulturalView';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginSucesso = (user: LoginResponse) => {
    router.replace('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#18181B]/20 border-t-[#18181B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <LoginCulturalView
      onLoginSucesso={handleLoginSucesso}
    />
  );
}
