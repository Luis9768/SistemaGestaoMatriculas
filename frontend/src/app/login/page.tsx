'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LoginResponse } from '@/lib/api';
import { LoginCulturalView } from '@/components/LoginCulturalView';

export default function LoginPage() {
  const router = useRouter();
  const { loading, carregarDadosIniciais } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginSucesso = async (user: LoginResponse) => {
    await carregarDadosIniciais(user);
    router.replace('/direcionamento');
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#18181B]/20 border-t-[#18181B] rounded-full animate-spin" />
      </div>
    );
  }

  return <LoginCulturalView onLoginSucesso={handleLoginSucesso} />;
}
