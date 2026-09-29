'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';

interface GraffitiBannerHeaderProps {
  onLogout?: () => void;
}

export function GraffitiBannerHeader({ onLogout }: GraffitiBannerHeaderProps) {
  return (
    <header className="w-full bg-white dark:bg-[#0A0D14] border-b border-[#EAEAEA] dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100">
            Escolas Livres
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle showLabel={false} />

          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EAEAEA] dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer active:scale-98"
              title="Encerrar sessão e voltar ao login"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
