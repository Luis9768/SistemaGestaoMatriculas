'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';

interface GraffitiBannerHeaderProps {
  onLogout?: () => void;
}

export function GraffitiBannerHeader({ onLogout }: GraffitiBannerHeaderProps) {
  return (
    <header className="relative w-full overflow-hidden bg-[#0A0D14] border-b border-slate-800/80 shadow-2xl select-none">
      {/* TEXTURA 1: Parede Urbana de Tijolos em SVG com Iluminação Focal Central */}
      <div className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-45" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="brick-wall-pattern" width="80" height="40" patternUnits="userSpaceOnUse">
              {/* Linhas de assentamento de tijolos urbanos */}
              <rect width="80" height="40" fill="none" />
              <path
                d="M 0 0 L 80 0 M 0 20 L 80 20 M 0 40 L 80 40 M 40 0 L 40 20 M 0 20 L 0 40 M 80 20 L 80 40 M 20 20 L 20 40 M 60 20 L 60 40"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#brick-wall-pattern)" />
        </svg>
      </div>

      {/* TEXTURA 2: Manchas e Aerossóis de Tinta Spray Inspirados no Grafite */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Spray Magenta / Hot Pink (lado esquerdo / centro) */}
        <div className="absolute -top-12 left-1/4 w-80 h-40 bg-[#FF007A]/25 rounded-full blur-3xl transform -rotate-12" />
        {/* Spray Azul Ciano Elétrico / Cobalto (centro / direita) */}
        <div className="absolute top-2 left-1/2 w-96 h-36 bg-[#00D2FF]/20 rounded-full blur-3xl" />
        {/* Spray Amarelo / Âmbar Quente (extremo esquerdo) */}
        <div className="absolute -bottom-10 left-6 w-64 h-36 bg-[#FFB703]/25 rounded-full blur-2xl" />
        {/* Spray Verde Limão Ácido (detalhe dinâmico) */}
        <div className="absolute -bottom-8 right-1/3 w-60 h-28 bg-[#10B981]/20 rounded-full blur-2xl" />
        {/* Spray Roxo / Ultravioleta Profundo */}
        <div className="absolute top-0 right-10 w-72 h-36 bg-[#7C3AED]/25 rounded-full blur-3xl" />

        {/* Efeito de Vinheta de Iluminação de Holofote */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-transparent to-[#0A0D14]/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0D14]/60 via-transparent to-[#0A0D14]" />
      </div>

      {/* ELEMENTOS GRÁFICOS DE ARTE URBANA: Gotas, Respingos e Tags de Spray SVG */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Gotas e escorrências de tinta spray */}
          <circle cx="95" cy="20" r="3" fill="#FF007A" opacity="0.8" />
          <circle cx="102" cy="32" r="2" fill="#FF007A" opacity="0.6" />
          <path d="M 95 20 Q 96 28, 95 36" stroke="#FF007A" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />

          <circle cx="340" cy="15" r="3.5" fill="#00D2FF" opacity="0.7" />
          <circle cx="344" cy="28" r="2" fill="#00D2FF" opacity="0.5" />
          <path d="M 340 15 Q 341 24, 340 32" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          <circle cx="580" cy="18" r="2.5" fill="#FFB703" opacity="0.8" />
          <circle cx="582" cy="30" r="1.5" fill="#FFB703" opacity="0.6" />

          {/* Respingos de tinta (splatter) */}
          <circle cx="180" cy="45" r="1.8" fill="#10B981" opacity="0.7" />
          <circle cx="186" cy="48" r="1" fill="#10B981" opacity="0.5" />
          <circle cx="176" cy="51" r="1.2" fill="#10B981" opacity="0.6" />

          <circle cx="720" cy="25" r="2.2" fill="#FF007A" opacity="0.6" />
          <circle cx="726" cy="22" r="1.2" fill="#FF007A" opacity="0.4" />
        </svg>
      </div>

      {/* CONTEÚDO PRINCIPAL DO BANNER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Identidade Visual Urbana & Arte Graffiti */}
        <div className="flex flex-col">
          {/* Tag de Topo Urbana */}
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#FF007A]/20 border border-[#FF007A]/40 text-[#FF5DA2] text-[10px] sm:text-[11px] font-black tracking-widest uppercase">
              Arte Urbana & Expressão
            </span>
            <span className="text-slate-500 text-xs hidden sm:inline">•</span>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase hidden sm:inline">
              Santo André • Cultura Viva
            </span>
          </div>

          {/* Título Mural Estilizado com Tipografia Marcante e Gradiente Grafite */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none">
              <span className="bg-gradient-to-r from-[#FF007A] via-[#A855F7] via-[#00D2FF] to-[#FFB703] bg-clip-text text-transparent">
                ESCOLAS LIVRES
              </span>
            </h1>
            <span className="hidden md:inline-block text-xs font-black px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 uppercase tracking-widest transform -rotate-2">
              Hub Cultural
            </span>
          </div>

          {/* Badges Estilizadas em Tags de Spray das 4 Artes */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-violet-950/80 text-violet-300 border border-violet-700/50 shadow-xs shadow-violet-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              ELT Teatro
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-700/50 shadow-xs shadow-rose-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              ELD Dança
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-950/80 text-sky-300 border border-sky-700/50 shadow-xs shadow-sky-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              ELCV Cinema
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-700/50 shadow-xs shadow-amber-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ELIA Iniciação
            </span>
          </div>
        </div>

        {/* Lado Direito: APENAS O BOTÃO DO SOL (ThemeToggle) E OPÇÃO DE SAIR */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Botão de Modo Claro e Escuro ("O Sol") com Destaque Neon Estilizado */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#FFB703] via-[#FF007A] to-[#00D2FF] opacity-70 blur-sm group-hover:opacity-100 transition duration-300 pointer-events-none" />
            <div className="relative">
              <ThemeToggle showLabel={false} className="bg-slate-900/90 border-slate-700/80 hover:bg-slate-800 text-amber-300 shadow-lg" />
            </div>
          </div>

          {/* Botão Sair com Destaque Urbano e Contraste */}
          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/25 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5 active:scale-95"
              title="Encerrar sessão e voltar ao login"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
