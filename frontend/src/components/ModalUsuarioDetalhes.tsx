'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  ShieldCheck,
  Users2,
  CheckCircle2,
  Edit2,
  Power,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Usuario, Escola } from '@/lib/api';

interface ModalUsuarioDetalhesProps {
  isOpen: boolean;
  usuario: Usuario | null;
  escolas: Escola[];
  onClose: () => void;
  onAlternarStatus: (usuarioId: number, statusAtual: boolean) => Promise<void>;
  onAbrirEdicao: (usuario: Usuario) => void;
}

export function ModalUsuarioDetalhes({
  isOpen,
  usuario,
  escolas,
  onClose,
  onAlternarStatus,
  onAbrirEdicao,
}: ModalUsuarioDetalhesProps) {
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  if (!isOpen || !usuario) return null;

  const isAdmin = usuario.role === 'ROLE_ADMIN';
  const isEncarregada = usuario.role === 'ROLE_ENCARREGADA';
  const isAtivo = Boolean(usuario.ativo);

  // Mapear escolas vinculadas
  const escolasVinculadas: Escola[] = [];
  if (isEncarregada) {
    if (usuario.escolas && usuario.escolas.length > 0) {
      escolasVinculadas.push(...usuario.escolas);
    } else if (usuario.escolasIds && usuario.escolasIds.length > 0) {
      escolas.forEach((esc) => {
        if (usuario.escolasIds?.includes(esc.id)) {
          escolasVinculadas.push(esc);
        }
      });
    } else if (usuario.escolaId) {
      const encontrada = escolas.find((e) => e.id === usuario.escolaId);
      if (encontrada) escolasVinculadas.push(encontrada);
      else if (usuario.escolaNome && usuario.escolaSigla) {
        escolasVinculadas.push({
          id: usuario.escolaId,
          nome: usuario.escolaNome,
          sigla: usuario.escolaSigla,
        });
      }
    }
  }

  const handleToggleStatus = async () => {
    try {
      setSalvandoStatus(true);
      await onAlternarStatus(usuario.id, isAtivo);
    } finally {
      setSalvandoStatus(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-usuario-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Cabeçalho do Modal */}
        <div className="relative p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Fechar detalhes"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar Neutro (sem ponto verde sobreposto) */}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base border bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700/80 shrink-0">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="modal-usuario-titulo"
                  className="text-base font-bold text-slate-900 dark:text-white truncate"
                >
                  {usuario.nome}
                </h2>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Administrador</span>
                  </span>
                )}
                {isEncarregada && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/25 dark:border-orange-500/30 shadow-2xs">
                    <Users2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span>Encarregada</span>
                  </span>
                )}
              </div>

              {/* E-mail com Alto Contraste */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-400" />
                <span className="truncate">{usuario.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corpo: Ficha Limpa sem Balões Neon ou Caixas Pesadas */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Seção 1: Escopo de Atuação */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Escopo de Atuação
            </h4>

            {isAdmin ? (
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Acesso Unificado à Rede
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Permissão irrestrita de gestão em todas as Escolas Livres (ELT, ELD, ELCV e EMIA).
                </p>
              </div>
            ) : (
              <div className="pt-0.5 space-y-2">
                {escolasVinculadas.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {escolasVinculadas.map((esc) => (
                      <span
                        key={esc.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium"
                      >
                        <span className="font-semibold text-slate-900 dark:text-slate-100">[{esc.sigla}]</span>
                        <span>{esc.nome}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Nenhuma escola associada no momento.
                  </p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Acesso ao diário de chamadas, turmas e matrículas das unidades autorizadas.
                </p>
              </div>
            )}
          </div>

          {/* Divisor Sutil */}
          <div className="border-t border-slate-100 dark:border-slate-800/80" />

          {/* Seção 2: Status da Conta */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Status da Conta
            </h4>

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Acesso ao painel
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isAtivo
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isAtivo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAtivo
                    ? 'O usuário pode realizar login normalmente.'
                    : 'Login bloqueado. O usuário não consegue autenticar no sistema.'}
                </p>
              </div>

              {/* Botão de inativação/ativação como ação secundária sutil (outline) */}
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={salvandoStatus}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                  isAtivo
                    ? 'border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'border-emerald-200/80 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                {salvandoStatus ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : isAtivo ? (
                  <Power className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{isAtivo ? 'Bloquear Login' : 'Reativar Login'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé com Hierarquia Correta: Fechar (Neutro) e Editar Acessos (Primário / CTA) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-semibold text-xs transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="relative group">
            <button
              type="button"
              disabled={!isAtivo}
              onClick={() => {
                if (!isAtivo) return;
                onClose();
                onAbrirEdicao(usuario);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs ${
                !isAtivo
                  ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 cursor-pointer'
              }`}
            >
              {!isAtivo ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Edit2 className="w-3.5 h-3.5" />
              )}
              <span>Editar Acessos</span>
            </button>
            {!isAtivo && (
              <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover:block w-56 p-2 text-[10px] leading-tight bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg shadow-lg z-50">
                🔒 Usuário inativo. Reative o acesso acima para liberar a edição cadastral.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
