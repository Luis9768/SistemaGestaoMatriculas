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
    <header className="w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/90 dark:border-[#27272a] shadow-xs sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Identidade Institucional: Brasão de Santo André + A CASA */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <Image
            src="/logo_santo_andre.png"
            alt="Brasão Oficial do Município de Santo André"
            width={34}
            height={48}
            className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs dark:brightness-110"
            priority
          />
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-black tracking-widest text-slate-900 dark:text-zinc-100 uppercase font-sans leading-none">
              A CASA
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-500 dark:text-zinc-400 uppercase font-mono mt-1 leading-none">
              Centro Artístico de Santo André
            </span>
          </div>
        </div>

        {/* Controles: Tema + Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle showLabel={false} />

          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-[#27272a] bg-slate-50 hover:bg-rose-50 dark:bg-[#121214] dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-700 dark:text-zinc-300 dark:hover:text-rose-400 text-xs font-semibold transition active:scale-98 shadow-xs cursor-pointer"
              title="Encerrar sessão e voltar ao login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
