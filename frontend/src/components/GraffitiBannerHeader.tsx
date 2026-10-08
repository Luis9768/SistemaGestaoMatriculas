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
    <header className="w-full bg-[#F3EEE6]/90 dark:bg-[#0F0E0D]/90 backdrop-blur-md border-b border-[#E3DBD0] dark:border-[#211E1B] shadow-2xs sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <span className="text-xs sm:text-sm font-black tracking-widest text-[#1C1917] dark:text-[#EDE8E0] uppercase font-sans leading-none">
              A CASA
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-[#736B63] dark:text-[#9C948A] uppercase font-mono mt-1 leading-none">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D9D0C3] dark:border-[#2C2723] bg-[#EBE4D8] hover:bg-rose-50 dark:bg-[#1A1714] dark:hover:bg-rose-950/40 text-[#544D45] hover:text-rose-700 dark:text-[#B5ACA0] dark:hover:text-rose-400 text-xs font-semibold transition active:scale-98 shadow-2xs cursor-pointer"
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
