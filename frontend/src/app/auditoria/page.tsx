'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import {
  api,
  AuditoriaAcaoDTO,
  TipoAcaoAuditoria,
  PaginaAuditoria,
} from '@/lib/api';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserCheck,
  GraduationCap,
  ClipboardCheck,
  UserX,
  FileSpreadsheet,
  LogIn,
  AlertCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';

const TIPOS_ACAO_CONFIG: Record<
  TipoAcaoAuditoria,
  { label: string; corBadge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  LOGIN: {
    label: 'Login de Acesso',
    corBadge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    icon: LogIn,
  },
  CRIACAO_MATRICULA: {
    label: 'Matrícula Realizada',
    corBadge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    icon: GraduationCap,
  },
  CANCELAMENTO_MATRICULA: {
    label: 'Matrícula Cancelada',
    corBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    icon: UserX,
  },
  DESLIGAMENTO_MATRICULA: {
    label: 'Desligamento por Faltas',
    corBadge: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
    icon: UserX,
  },
  INSCRICAO_EXTERNA: {
    label: 'Inscrição Pública',
    corBadge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    icon: UserCheck,
  },
  REGISTRO_CHAMADA: {
    label: 'Diário de Chamada',
    corBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    icon: ClipboardCheck,
  },
  EDICAO_CHAMADA: {
    label: 'Edição de Chamada',
    corBadge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
    icon: ClipboardCheck,
  },
  CRIACAO_TURMA: {
    label: 'Criação de Turma',
    corBadge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    icon: GraduationCap,
  },
  ATUALIZACAO_TURMA: {
    label: 'Edição de Turma',
    corBadge: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    icon: GraduationCap,
  },
  CRIACAO_MATERIA: {
    label: 'Criação de Disciplina',
    corBadge: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
    icon: Tag,
  },
  CADASTRO_USUARIO: {
    label: 'Cadastro de Usuário',
    corBadge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    icon: UserCheck,
  },
  ATUALIZACAO_USUARIO: {
    label: 'Edição de Usuário',
    corBadge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    icon: User,
  },
  ATUALIZACAO_ALUNO: {
    label: 'Atualização de Aluno',
    corBadge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    icon: User,
  },
  IMPORTACAO_LOTE: {
    label: 'Importação em Lote',
    corBadge: 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30',
    icon: FileSpreadsheet,
  },
};

function formatarDataHora(isoString: string): { data: string; hora: string } {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { data: isoString, hora: '' };
    const data = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const hora = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return { data, hora };
  } catch {
    return { data: isoString, hora: '' };
  }
}

export default function AuditoriaPage() {
  const router = useRouter();
  const { usuarioLogado, escolas } = useApp();

  const [loading, setLoading] = useState(true);
  const [paginaData, setPaginaData] = useState<PaginaAuditoria | null>(null);

  // Filtros
  const [termoBusca, setTermoBusca] = useState('');
  const [tipoAcaoFiltro, setTipoAcaoFiltro] = useState<string>('');
  const [escolaIdFiltro, setEscolaIdFiltro] = useState<string>('');
  const [paginaAtual, setPaginaAtual] = useState(0);

  const carregarLogs = useCallback(
    async (pageIndex: number = 0) => {
      try {
        setLoading(true);
        const res = await api.listarAuditoria({
          termo: termoBusca.trim() || undefined,
          tipoAcao: (tipoAcaoFiltro as TipoAcaoAuditoria) || undefined,
          escolaId: escolaIdFiltro ? Number(escolaIdFiltro) : undefined,
          page: pageIndex,
          size: 20,
        });
        setPaginaData(res);
        setPaginaAtual(pageIndex);
      } catch (err: any) {
        console.error('Erro ao carregar auditoria:', err);
      } finally {
        setLoading(false);
      }
    },
    [termoBusca, tipoAcaoFiltro, escolaIdFiltro]
  );

  useEffect(() => {
    if (usuarioLogado && usuarioLogado.role === 'ROLE_ADMIN') {
      carregarLogs(0);
    }
  }, [usuarioLogado, carregarLogs]);

  // Se o usuário não for administrador, barra o acesso
  if (usuarioLogado && usuarioLogado.role !== 'ROLE_ADMIN') {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-16 px-4">
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-rose-400 font-serif">
              Acesso Restrito à Gestão Geral
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              O módulo de Histórico de Ações & Auditoria contém dados de rastreabilidade
              institucional e é exclusivo para usuários com perfil de{' '}
              <strong>Administrador Geral</strong> da Secretaria de Cultura.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.replace('/turmas')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Retornar às Turmas
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const logs = paginaData?.content || [];
  const totalLogs = paginaData?.totalElements || 0;
  const totalPages = paginaData?.totalPages || 0;

  return (
    <AppLayout>
      <div className="w-full mx-auto py-2 space-y-6">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-800/80 dark:border-[#27272a]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
                  Histórico de Ações & Auditoria
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">


            <button
              onClick={() => carregarLogs(paginaAtual)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-800/80 hover:bg-stone-700 text-white border border-stone-700 transition cursor-pointer disabled:opacity-50"
              title="Atualizar registros"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-stone-900/60 dark:bg-[#141416]/80 rounded-2xl border border-stone-800/80 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Campo de Busca Livre */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar usuário, aluno, ID ou detalhe..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && carregarLogs(0)}
                className="w-full pl-9 pr-3 py-2 bg-stone-950/60 border border-stone-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition"
              />
            </div>

            {/* Filtro por Tipo de Ação */}
            <div>
              <select
                value={tipoAcaoFiltro}
                onChange={(e) => setTipoAcaoFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950/60 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500/60 transition"
              >
                <option value="">Todas as Ações</option>
                {Object.entries(TIPOS_ACAO_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Escola */}
            <div>
              <select
                value={escolaIdFiltro}
                onChange={(e) => setEscolaIdFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950/60 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500/60 transition"
              >
                <option value="">Todas as Unidades Escolares</option>
                {escolas.map((esc) => (
                  <option key={esc.id} value={esc.id}>
                    {esc.sigla} - {esc.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Botões de Ação de Filtro */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => carregarLogs(0)}
                className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar</span>
              </button>

              {(termoBusca || tipoAcaoFiltro || escolaIdFiltro) && (
                <button
                  onClick={() => {
                    setTermoBusca('');
                    setTipoAcaoFiltro('');
                    setEscolaIdFiltro('');
                  }}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                  title="Limpar filtros"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>
              Total de registros:{' '}
              <strong className="text-white font-mono">{totalLogs}</strong>
            </span>
            {totalPages > 1 && (
              <span>
                Página <strong className="text-white font-mono">{paginaAtual + 1}</strong> de{' '}
                <strong className="text-white font-mono">{totalPages}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Lista de Registros Auditados */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-4 animate-pulse h-20"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Nenhuma ação encontrada
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Não foram localizados registros de auditoria com os critérios de filtro atuais.
              Tente redefinir a busca ou remover os filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log) => {
              const cfg =
                TIPOS_ACAO_CONFIG[log.tipoAcao] || {
                  label: log.tipoAcaoDescricao || log.tipoAcao,
                  corBadge: 'bg-stone-500/15 text-stone-300 border-stone-500/30',
                  icon: FileText,
                };
              const ActionIcon = cfg.icon;
              const { data, hora } = formatarDataHora(log.criadoEm);

              return (
                <div
                  key={log.id}
                  className="group bg-stone-900/50 dark:bg-[#141416]/60 hover:bg-stone-900/80 border border-stone-800/80 hover:border-stone-700/80 rounded-2xl p-4 transition-all duration-150"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Linha Principal: Badge de Ação + Detalhe */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 p-2 rounded-xl bg-stone-800/70 border border-stone-700/60 text-slate-300 shrink-0">
                        <ActionIcon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10.5px] font-semibold border ${cfg.corBadge}`}
                          >
                            <span>{cfg.label}</span>
                          </span>

                          {log.escolaSigla && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-bold bg-stone-800 text-slate-300 border border-stone-700">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{log.escolaSigla}</span>
                            </span>
                          )}

                          {log.entidade && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              [{log.entidade}
                              {log.entidadeId ? ` #${log.entidadeId}` : ''}]
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed break-words font-medium">
                          {log.detalhes}
                        </p>

                        {/* Identificação do Usuário Executor */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-300">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{log.usuarioNome}</span>
                          </span>

                          {log.usuarioRole && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-white/5 text-slate-400 border border-white/10">
                              {log.usuarioRole === 'ROLE_ADMIN'
                                ? 'Admin'
                                : log.usuarioRole === 'ROLE_ENCARREGADA'
                                ? 'Encarregada'
                                : log.usuarioRole === 'ROLE_PROFESSOR'
                                ? 'Professor'
                                : log.usuarioRole}
                            </span>
                          )}

                          {log.usuarioEmail && (
                            <span className="text-slate-400 hidden sm:inline">
                              ({log.usuarioEmail})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Data e Hora no Canto Direito */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-stone-800/60 text-right">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{data}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{hora}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-stone-800/80">
            <button
              onClick={() => carregarLogs(paginaAtual - 1)}
              disabled={paginaAtual <= 0 || loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-900 border border-stone-800 text-slate-300 hover:text-white hover:bg-stone-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-xs text-slate-400">
              Página <strong className="text-white font-mono">{paginaAtual + 1}</strong> de{' '}
              <strong className="text-white font-mono">{totalPages}</strong>
            </span>

            <button
              onClick={() => carregarLogs(paginaAtual + 1)}
              disabled={paginaAtual >= totalPages - 1 || loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-900 border border-stone-800 text-slate-300 hover:text-white hover:bg-stone-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
