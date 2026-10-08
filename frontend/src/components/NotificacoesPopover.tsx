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
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api, Notificacao } from '@/lib/api';
import { useApp } from '@/context/AppContext';

interface NotificacoesPopoverProps {
  escolaId?: number | null;
  turmaId?: number | null;
  turmaNome?: string | null;
}

export function NotificacoesPopover({ escolaId, turmaId, turmaNome }: NotificacoesPopoverProps) {
  const router = useRouter();
  const {
    abrirModalPerfil,
    setEscolaSelecionada,
    escolas,
    turmas,
    abrirModalDetalhesTurma,
  } = useApp();

  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [lidasIds, setLidasIds] = useState<Set<string>>(new Set());
  const [filtroAba, setFiltroAba] = useState<'TODAS' | 'RISCO' | 'DECLARACAO' | 'VAGAS'>('TODAS');
  const [turmaFiltroId, setTurmaFiltroId] = useState<number | null>(turmaId || null);
  const [carregando, setCarregando] = useState(false);

  // Sincronizar turmaId externo se mudar
  useEffect(() => {
    if (turmaId !== undefined) {
      setTurmaFiltroId(turmaId);
    }
  }, [turmaId]);

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

  // Salvar no localStorage quando atualizar lidas
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
      const targetTurmaId = turmaId !== undefined ? (turmaId || undefined) : (turmaFiltroId || undefined);
      const data = await api.obterNotificacoes(escolaId || undefined, targetTurmaId);
      setNotificacoes(data);
    } catch (err) {
      console.warn('Não foi possível carregar notificações:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarNotificacoes();
    const timer = setInterval(() => {
      buscarNotificacoes();
    }, 120000);
    return () => clearInterval(timer);
  }, [escolaId, turmaId, turmaFiltroId]);

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

  const handleAcaoNotificacao = async (notif: Notificacao) => {
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

    // 2. Ações de Perfil de Aluno / Declaração
    if (notif.alunoId && (notif.acaoTipo === 'ABRIR_PERFIL' || notif.acaoTipo === 'EMITIR_DECLARACAO')) {
      abrirModalPerfil(
        notif.alunoId,
        notif.acaoTipo === 'EMITIR_DECLARACAO' ? (notif.matriculaId || null) : null
      );
      return;
    }

    // 3. Ações de Turma / Vagas: abre modal imediatamente e navega
    if (notif.turmaId || notif.acaoTipo === 'ABRIR_TURMA' || notif.tipo === 'VAGA_DISPONIVEL') {
      if (notif.turmaId) {
        await abrirModalDetalhesTurma(notif.turmaId);
      }
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
    if (filtroAba === 'VAGAS') return n.tipo === 'VAGA_DISPONIVEL';
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
        className={`relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${
          aberto
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
            : 'border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200'
        }`}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />

        {/* Badge Flutuante de Novas Notificações */}
        {totalNaoLidas > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full text-white leading-none ${
              temUrgenteNaoLida ? 'bg-rose-600 animate-pulse' : 'bg-slate-900 dark:bg-blue-600'
            }`}
          >
            {totalNaoLidas > 99 ? '99+' : totalNaoLidas}
          </span>
        )}
      </button>

      {/* Flyout Popover com Design Editorial Minimalista */}
      {aberto && (
        <div
          role="dialog"
          aria-label="Notificações do Sistema"
          className="absolute right-0 mt-3 w-[440px] sm:w-[500px] max-w-[calc(100vw-24px)] max-h-[85vh] bg-white dark:bg-[#18181b] rounded-2xl shadow-xl border border-slate-200/90 dark:border-[#27272a] z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Topo / Cabeçalho Editorial com Respiro Generoso */}
          <div className="px-6 py-5 border-b border-slate-200/80 dark:border-[#27272a] bg-slate-50/70 dark:bg-[#121214] flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                {turmaNome
                  ? `Alertas da Turma ${turmaNome}`
                  : turmaFiltroId
                  ? 'Alertas da Turma'
                  : 'Central de Notificações'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {totalNaoLidas === 0
                  ? 'Nenhum alerta pendente no momento'
                  : `${totalNaoLidas} ${totalNaoLidas === 1 ? 'alerta pendente' : 'alertas pendentes'}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {totalNaoLidas > 0 && (
                <button
                  type="button"
                  onClick={marcarTodasComoLidas}
                  title="Marcar todas como lidas"
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Marcar lidas</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setAberto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Fechar popover de notificações"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filtro Contextual de Turma (quando no modo geral da escola) */}
          {turmaId === undefined && turmas && turmas.length > 0 && (
            <div className="px-6 py-3 bg-slate-100/50 dark:bg-slate-900/30 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                Filtrar Turma:
              </span>
              <select
                value={turmaFiltroId || ''}
                onChange={(e) => setTurmaFiltroId(e.target.value ? Number(e.target.value) : null)}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">Todas as turmas da escola</option>
                {turmas
                  .filter((t) => !escolaId || t.escolaId === escolaId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} ({t.cursoNome || 'Curso'})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Filtros em Abas Segmentadas Limpas */}
          <div className="px-6 py-3 bg-slate-50/30 dark:bg-slate-900/20 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFiltroAba('TODAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                filtroAba === 'TODAS'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Todas ({notificacoes.length})
            </button>

            <button
              type="button"
              onClick={() => setFiltroAba('RISCO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                filtroAba === 'RISCO'
                  ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-200/80 dark:border-rose-900/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Faltas & Risco</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroAba('DECLARACAO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                filtroAba === 'DECLARACAO'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-900/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Declarações</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroAba('VAGAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                filtroAba === 'VAGAS'
                  ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Vagas</span>
            </button>
          </div>

          {/* Lista de Notificações com Altura Confortável e Espaçamento Respirável */}
          <div className="flex-1 overflow-y-auto max-h-[460px] p-5 sm:p-6 space-y-3.5">
            {carregando && notificacoes.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                Carregando alertas...
              </div>
            ) : notificacoesFiltradas.length === 0 ? (
              <div className="py-14 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tudo em ordem
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Não há avisos de faltas ou movimentações de vagas pendentes para o filtro atual.
                </p>
              </div>
            ) : (
              notificacoesFiltradas.map((notif) => {
                const lida = lidasIds.has(notif.id);
                const isUrgente = notif.nivel === 'URGENTE';
                const isDeclaracao = notif.tipo === 'DECLARACAO_PRONTA';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleAcaoNotificacao(notif)}
                    className={`relative p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      lida
                        ? 'bg-slate-50/40 dark:bg-[#09090b]/50 border-slate-200/60 dark:border-[#27272a]/60 opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-zinc-700'
                        : isUrgente
                        ? 'bg-white dark:bg-[#121214] border-rose-200/90 dark:border-rose-900/50 hover:border-rose-400 shadow-2xs hover:shadow-xs'
                        : isDeclaracao
                        ? 'bg-white dark:bg-[#121214] border-emerald-200/90 dark:border-emerald-900/50 hover:border-emerald-400 shadow-2xs hover:shadow-xs'
                        : 'bg-white dark:bg-[#121214] border-slate-200/90 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-zinc-700 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Linha Superior: Categoria, Escola, Status de Leitura e Botão Fechar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isUrgente ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/50">
                            Risco Crítico
                          </span>
                        ) : isDeclaracao ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/50">
                            Declaração
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            Vaga & Suplência
                          </span>
                        )}

                        {notif.escolaSigla && (
                          <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                            {notif.escolaSigla}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!lida && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 shrink-0"
                            title="Não lida"
                          />
                        )}

                        {!lida && (
                          <button
                            type="button"
                            onClick={(e) => marcarComoLida(notif.id, e)}
                            title="Dispensar aviso"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Título com Tipografia de Destaque */}
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5 leading-snug tracking-tight">
                      {notif.titulo}
                    </h4>

                    {/* Mensagem com Entrelinha Confortável */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {notif.mensagem}
                    </p>

                    {/* Rodapé Interno com Data e Botão de Ação Claro */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{notif.dataHora || 'Recente'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcaoNotificacao(notif);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <span>{notif.acaoRotulo || 'Ver Detalhes'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé Editorial com Micro-cópia Limpa */}
          <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Sincronizado automaticamente com frequência escolar e registros letivos.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
