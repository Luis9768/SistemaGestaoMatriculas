'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Usuario } from '@/lib/api';

interface UsuarioCardProps {
  usuario: Usuario;
  onClick: (usuario: Usuario) => void;
}

export function UsuarioCard({ usuario, onClick }: UsuarioCardProps) {
  const inicial = usuario.nome?.trim() ? usuario.nome.trim().charAt(0).toUpperCase() : 'U';

  return (
    <article
      onClick={() => onClick(usuario)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(usuario);
        }
      }}
      className="group relative rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-[#27272a] bg-white dark:bg-[#121214] hover:border-slate-400 dark:hover:border-zinc-600 transition-all duration-200 flex flex-col items-center justify-between text-center cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-slate-400/40 shadow-xs hover:shadow-sm"
      aria-label={`Gerenciar acesso de ${usuario.nome}`}
    >
      {/* ─── FOTO DO USUÁRIO (Elemento Principal, Proporção Equilibrada) ─── */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 border border-slate-200/80 dark:border-zinc-700/70 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-102">
        {usuario.fotoUrl ? (
          <img
            src={usuario.fotoUrl}
            alt={usuario.nome}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-800 dark:text-zinc-100 font-bold text-3xl font-sans select-none">
            {inicial}
          </div>
        )}
      </div>

      {/* ─── NOME DO USUÁRIO (Logo abaixo da foto) ─── */}
      <div className="mt-4 w-full">
        <h3
          className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1"
          title={usuario.nome}
        >
          {usuario.nome}
        </h3>
      </div>

      {/* ─── GERENCIAR ACESSO (Alinhado no rodapé do card) ─── */}
      <div className="w-full mt-5 pt-3.5 border-t border-slate-100 dark:border-[#27272a]/70 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          <span>Gerenciar acesso</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </span>
      </div>
    </article>
  );
}
