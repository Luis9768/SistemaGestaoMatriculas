'use client';

import React from 'react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';

interface GraffitiBannerHeaderProps {
  onLogout?: () => void;
}

export function GraffitiBannerHeader({ onLogout }: GraffitiBannerHeaderProps) {
  return (
    <header className="w-full bg-white dark:bg-[#0C101C] border-b border-slate-200/90 dark:border-slate-800/80 shadow-xs sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Identidade Institucional: Brasão de Santo André + A CASA */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <Image
            src="/logo_santo_andre.png"
            alt="Brasão Oficial do Município de Santo André"
            width={32}
            height={46}
            className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs dark:brightness-110"
            priority
          />
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase font-sans leading-none">
              A CASA
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono mt-1 leading-none">
              Centro Artístico de Santo André
            </span>
          </div>
        </div>

        {/* Controles: Tema e Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle showLabel={false} />

          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer active:scale-98 shadow-xs"
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
