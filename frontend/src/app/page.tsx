'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function RootPage() {
  const router = useRouter();
  const { usuarioLogado, loading } = useApp();

  useEffect(() => {
    if (!loading) {
      if (usuarioLogado) {
        router.replace('/direcionamento');
      } else {
        router.replace('/login');
      }
    }
  }, [loading, usuarioLogado, router]);

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#000000] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Redirecionando para o portal...
        </span>
      </div>
    </div>
  );
}
