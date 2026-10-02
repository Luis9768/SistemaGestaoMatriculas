'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  AlertTriangle,
  FileCheck2,
  Users,
  CheckCircle2,
  CheckCheck,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Clock,
  Filter,
} from 'lucide-react';
import { api, Notificacao } from '@/lib/api';
import { useApp } from '@/context/AppContext';

interface NotificacoesPopoverProps {
  escolaId?: number | null;
}

export function NotificacoesPopover({ escolaId }: NotificacoesPopoverProps) {
  const router = useRouter();
  const { abrirModalPerfil, setEscolaSelecionada, escolas } = useApp();

  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [lidasIds, setLidasIds] = useState<Set<string>>(new Set());
  const [filtroAba, setFiltroAba] = useState<'TODAS' | 'RISCO' | 'DECLARACAO' | 'VAGAS'>('TODAS');
  const [carregando, setCarregando] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar IDs marcados como lidos no localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gestao_notificacoes_lidas');
      if (stored) {
        setLidasIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn('Erro ao carregar notificações lidas do cache:', e);
    }
  }, []);

  // Salvar no localStorage quando atualizar lidas (com política de expurgo / retenção máxima)
  const salvarLidas = (novasLidas: Set<string>) => {
    const arrayLidas = Array.from(novasLidas);
    const cappedArray = arrayLidas.length > 150 ? arrayLidas.slice(arrayLidas.length - 150) : arrayLidas;
    const cappedSet = new Set(cappedArray);
    setLidasIds(cappedSet);
    try {
      localStorage.setItem('gestao_notificacoes_lidas', JSON.stringify(cappedArray));
    } catch (e) {
      console.warn('Erro ao salvar notificações lidas:', e);
    }
  };

  const buscarNotificacoes = async () => {
    try {
      setCarregando(true);
      const data = await api.obterNotificacoes(escolaId || undefined);
      setNotificacoes(data);
    } catch (err) {
      console.warn('Não foi possível carregar notificações:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarNotificacoes();
    // Atualizar a cada 2 minutos em segundo plano para não sobrecarregar o banco
    const timer = setInterval(() => {
      buscarNotificacoes();
    }, 120000);
    return () => clearInterval(timer);
  }, [escolaId]);

  // Fechar ao teclar Esc ou clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };

    if (aberto) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [aberto]);

  const marcarComoLida = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nova = new Set(lidasIds);
    nova.add(id);
    salvarLidas(nova);
  };

  const marcarTodasComoLidas = () => {
    const nova = new Set(lidasIds);
    notificacoes.forEach((n) => nova.add(n.id));
    salvarLidas(nova);
  };

  const handleAcaoNotificacao = (notif: Notificacao) => {
    marcarComoLida(notif.id);
    setAberto(false);

    // 1. Sempre selecionar a escola correta antes da navegação
    let targetEscolaId = notif.escolaId;
    if (!targetEscolaId && notif.escolaSigla && escolas && escolas.length > 0) {
      const match = escolas.find(
        (e) => e.sigla?.toUpperCase() === notif.escolaSigla?.toUpperCase()
      );
      if (match) targetEscolaId = match.id;
    }
    if (targetEscolaId) {
      setEscolaSelecionada(targetEscolaId);
    }

    // 2. Encaminhar para o destino exato
    if (notif.alunoId && (notif.acaoTipo === 'ABRIR_PERFIL' || notif.acaoTipo === 'EMITIR_DECLARACAO')) {
      abrirModalPerfil(notif.alunoId, notif.acaoTipo === 'EMITIR_DECLARACAO' ? (notif.matriculaId || null) : null);
    } else if (notif.acaoTipo === 'ABRIR_TURMA' || notif.tipo === 'VAGA_SUPLENCIA') {
      const codigoTurma = notif.turmaNome?.split(' - ')[0]?.trim() || '';
      const params = new URLSearchParams();
      if (notif.turmaId) params.set('turmaId', String(notif.turmaId));
      if (codigoTurma) params.set('busca', codigoTurma);

      router.push(`/turmas?${params.toString()}`);
    }
  };

  // Contagem de não-lidas
  const naoLidas = notificacoes.filter((n) => !lidasIds.has(n.id));
  const totalNaoLidas = naoLidas.length;
  const temUrgenteNaoLida = naoLidas.some((n) => n.nivel === 'URGENTE');

  // Filtragem pela aba selecionada
  const notificacoesFiltradas = notificacoes.filter((n) => {
    if (filtroAba === 'RISCO') return n.tipo === 'RISCO_FALTAS' || n.tipo === 'LIMITE_FALTAS';
    if (filtroAba === 'DECLARACAO') return n.tipo === 'DECLARACAO_PRONTA';
    if (filtroAba === 'VAGAS') return n.tipo === 'VAGA_SUPLENCIA';
    return true;
  });

  return (
    <div className="relative" ref={containerRef}>
      {/* Botão Sino com Badge de Contador */}
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        aria-label="Abrir central de notificações"
        aria-expanded={aberto}
        title="Central de Notificações"
        className={`relative p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 shadow-xs flex items-center justify-center ${
          aberto
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/20'
            : 'border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
        }`}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />

        {/* Badge Flutuante de Novas Notificações */}
        {totalNaoLidas > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-black rounded-full text-white shadow-md leading-none ${
              temUrgenteNaoLida
                ? 'bg-rose-600 ring-2 ring-white dark:ring-[#0D1322] animate-pulse'
                : 'bg-amber-600 ring-2 ring-white dark:ring-[#0D1322]'
            }`}
          >
            {totalNaoLidas > 99 ? '99+' : totalNaoLidas}
          </span>
        )}
      </button>

      {/* Flyout Popover */}
      {aberto && (
        <div
          role="dialog"
          aria-label="Notificações do Sistema"
          className="absolute right-0 mt-2.5 w-[380px] sm:w-[440px] max-w-[calc(100vw-24px)] max-h-[85vh] bg-white dark:bg-[#0E1424] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Topo do Card de Notificações */}
          <div className="p-4 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-[#11182B]/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Central de Notificações
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {totalNaoLidas === 0
                    ? 'Nenhum alerta pendente'
                    : `${totalNaoLidas} ${totalNaoLidas === 1 ? 'alerta pendente' : 'alertas pendentes'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {totalNaoLidas > 0 && (
                <button
                  type="button"
                  onClick={marcarTodasComoLidas}
                  title="Marcar todas como lidas"
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Marcar lidas</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Abas / Filtros Rápidos */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100/60 dark:bg-[#0B101D] border-b border-slate-200/80 dark:border-slate-800/80 overflow-x-auto text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setFiltroAba('TODAS')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 cursor-pointer ${
                filtroAba === 'TODAS'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Todas ({notificacoes.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroAba('RISCO')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 flex items-center gap-1 cursor-pointer ${
                filtroAba === 'RISCO'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>Faltas & Risco</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroAba('DECLARACAO')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 flex items-center gap-1 cursor-pointer ${
                filtroAba === 'DECLARACAO'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <FileCheck2 className="w-3 h-3 text-emerald-500" />
              <span>Declarações</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroAba('VAGAS')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shrink-0 flex items-center gap-1 cursor-pointer ${
                filtroAba === 'VAGAS'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/60 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <Users className="w-3 h-3 text-purple-500" />
              <span>Vagas</span>
            </button>
          </div>

          {/* Lista de Notificações com Rolagem Suave */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[460px] p-2 space-y-2">
            {carregando && notificacoes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Carregando alertas...
              </div>
            ) : notificacoesFiltradas.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tudo em dia!
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] mx-auto">
                  Não há avisos de risco de faltas ou declarações pendentes para o filtro selecionado.
                </p>
              </div>
            ) : (
              notificacoesFiltradas.map((notif) => {
                const lida = lidasIds.has(notif.id);
                const isUrgente = notif.nivel === 'URGENTE';
                const isDeclaracao = notif.tipo === 'DECLARACAO_PRONTA';
                const isVaga = notif.tipo === 'VAGA_SUPLENCIA';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleAcaoNotificacao(notif)}
                    className={`relative group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      lida
                        ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/50 opacity-70 hover:opacity-100'
                        : isUrgente
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/40 hover:border-rose-400 hover:shadow-sm'
                        : isDeclaracao
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-900/40 hover:border-emerald-400 hover:shadow-sm'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-800 hover:border-amber-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícone Indicador de Categoria */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          isUrgente
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20'
                            : isDeclaracao
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                            : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/20'
                        }`}
                      >
                        {isUrgente ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : isDeclaracao ? (
                          <FileCheck2 className="w-4 h-4" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                      </div>

                      {/* Conteúdo Textual */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                isUrgente
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'
                                  : isDeclaracao
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                              }`}
                            >
                              {isUrgente ? 'Risco Crítico' : isDeclaracao ? 'Declaração' : 'Vaga'}
                            </span>

                            {notif.escolaSigla && (
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                                • {notif.escolaSigla}
                              </span>
                            )}
                          </div>

                          {!lida && (
                            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {notif.titulo}
                        </h4>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                          {notif.mensagem}
                        </p>

                        {/* Barra Inferior com Ação e Horário */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notif.dataHora || 'Recente'}
                          </span>

                          <div className="flex items-center gap-2">
                            {notif.acaoRotulo && (
                              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 group-hover:underline">
                                <span>{notif.acaoRotulo}</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            )}

                            {!lida && (
                              <button
                                type="button"
                                onClick={(e) => marcarComoLida(notif.id, e)}
                                title="Dispensar aviso"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé Informativo */}
          <div className="p-2.5 px-4 bg-slate-50 dark:bg-[#11182B] border-t border-slate-200/80 dark:border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Notificações automáticas sincronizadas com a frequência escolar e emissões de documentos.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
