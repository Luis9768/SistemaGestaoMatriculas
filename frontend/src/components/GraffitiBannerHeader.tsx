'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';

interface GraffitiBannerHeaderProps {
  onLogout?: () => void;
}

export function GraffitiBannerHeader({ onLogout }: GraffitiBannerHeaderProps) {
  return (
    <header className="relative w-full h-36 sm:h-44 bg-[url('/grafite_banner.webp')] bg-cover bg-center border-b border-black/20 select-none shadow-sm">
      {/* Botões no Canto Superior Direito: O Sol (ThemeToggle) e Sair */}
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-8 flex items-center justify-end">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-md">
          <ThemeToggle showLabel={false} className="bg-transparent hover:bg-white/10 text-amber-300" />

          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-rose-600/80 text-white text-xs font-semibold transition cursor-pointer active:scale-95"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
