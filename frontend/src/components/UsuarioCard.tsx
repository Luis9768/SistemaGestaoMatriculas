'use client';

import React from 'react';
import {
  Mail,
  ShieldCheck,
  Users2,
  Building2,
  ArrowUpRight,
} from 'lucide-react';
import { Usuario } from '@/lib/api';

interface UsuarioCardProps {
  usuario: Usuario;
  onClick: (usuario: Usuario) => void;
}

export function UsuarioCard({ usuario, onClick }: UsuarioCardProps) {
  const isAdmin = usuario.role === 'ROLE_ADMIN';
  const isEncarregada = usuario.role === 'ROLE_ENCARREGADA';
  const isAtivo = Boolean(usuario.ativo);

  const escolasLista: { id?: number; sigla?: string; nome?: string }[] = [];
  if (isEncarregada) {
    if (usuario.escolas && usuario.escolas.length > 0) {
      escolasLista.push(...usuario.escolas);
    } else if (usuario.escolaNome && usuario.escolaSigla) {
      escolasLista.push({
        id: usuario.escolaId,
        sigla: usuario.escolaSigla,
        nome: usuario.escolaNome,
      });
    }
  }

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
      className={`relative group rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer select-none hover:-translate-y-0.5 hover:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-slate-500/40 ${
        isAtivo
          ? 'bg-white dark:bg-[#121214] border-slate-200/90 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs'
          : 'bg-slate-50/70 dark:bg-[#09090b]/80 border-slate-200/60 dark:border-[#27272a]/60 opacity-80 hover:border-slate-300 dark:hover:border-zinc-700 shadow-2xs'
      }`}
      aria-label={`Ver e gerenciar perfil de ${usuario.nome}`}
    >
      {/* ─── TOPO DO CARD: Avatar Neutro, Identidade e Cargo Consolidado ─── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar Neutro Limpo (sem ponto verde sobreposto) */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm tracking-tight border bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-zinc-100 border-slate-200/90 dark:border-[#27272a] shrink-0">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>

          {/* Nome e E-mail com Alto Contraste */}
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">
              {usuario.nome}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs mt-0.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
              <span className="truncate">{usuario.email}</span>
            </div>
          </div>
        </div>

        {/* Badge de Função: Administrador (Verde) e Encarregada (Laranja) */}
        <div className="shrink-0">
          {isEncarregada && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/25 dark:border-orange-500/30 shadow-2xs">
              <Users2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Encarregada</span>
            </span>
          )}
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Administrador</span>
            </span>
          )}
        </div>
      </div>

      {/* ─── CORPO: Unidades Escolares Autorizadas (Chips Informativos Sutis, Sem Truncamento Forçado) ─── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Building2 className="w-3 h-3" />
          <span>{isAdmin ? 'Escopo de Gestão' : 'Escola(s) Autorizada(s)'}</span>
        </div>

        {isEncarregada && (
          <div className="flex flex-wrap gap-1.5">
            {escolasLista.length > 0 ? (
              escolasLista.map((esc, i) => (
                <span
                  key={esc.id || i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100">[{esc.sigla}]</span>
                  <span>{esc.nome}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                Nenhuma escola atribuída no momento.
              </span>
            )}
          </div>
        )}

        {isAdmin && (
          <div>
            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium">
              Coordenação Geral • Acesso Unificado às 4 Escolas Livres
            </span>
          </div>
        )}
      </div>

      {/* ─── RODAPÉ: Status e Ação de Gerenciamento Nítida ─── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          {!isAtivo && (
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
              Login bloqueado
            </span>
          )}
        </div>

        {/* Link Interativo Nítido com Transição Suave */}
        <div className="flex items-center gap-1 font-medium text-xs text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors">
          <span>Gerenciar acesso</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
        </div>
      </div>
    </article>
  );
}
