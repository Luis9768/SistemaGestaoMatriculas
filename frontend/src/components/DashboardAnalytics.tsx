'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  api,
  DashboardStats,
  TurmaDashboard,
  Turma,
  formatarCpfMascara,
  LoginResponse,
} from '@/lib/api';
import { useApp } from '@/context/AppContext';
import {
  Users,
  UserX,
  GraduationCap,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Search,
  ArrowUpRight,
  Activity,
  Layers,
  Clock,
  ArrowRight,
  Building2,
  Sparkles,
  BookOpen,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

/* ─── Types ──────────────────────────────────────────── */
interface DashboardAnalyticsProps {
  escolaId?: number | null;
  turmas: Turma[];
  onOpenPerfilAluno: (alunoId: number) => void;
  usuarioLogado?: LoginResponse | null;
  onOpenLogin?: () => void;
}

/* ─── Motion Variants (Shadcn BI Snappy Timing) ──────── */
const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.22, ease: 'easeOut' as const },
  }),
};

/* ─── Recharts Tooltips ──────────────────────────────── */
function CustomTooltipPie({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl px-4 py-3 shadow-xl text-xs space-y-1">
      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.cor }} />
        {d.label}
      </div>
      <div className="text-slate-600 dark:text-zinc-400 font-mono">
        <strong className="text-slate-900 dark:text-white">{d.quantidade}</strong> alunos ({d.percentual}%)
      </div>
    </div>
  );
}

function CustomTooltipBar({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl px-4 py-3 shadow-xl text-xs space-y-1.5">
      <p className="font-bold text-slate-900 dark:text-white">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-slate-600 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5 font-sans">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span>{p.name}:</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Top Metric KPI Card (Shadcn School Style) ────────── */
function MetricKpiCard({
  index,
  title,
  value,
  badgeText,
  badgeType = 'positive',
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  progressBar,
}: {
  index: number;
  title: string;
  value: string | number;
  badgeText: string;
  badgeType?: 'positive' | 'warning' | 'neutral' | 'danger';
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  progressBar?: number;
}) {
  const getBadgeClasses = () => {
    switch (badgeType) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
      case 'danger':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-zinc-300 border border-slate-500/20';
    }
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            {title}
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {value}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadgeClasses()}`}>
            {badgeText}
          </span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {subtitle}
        </p>
        {typeof progressBar === 'number' && (
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressBar))}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function DashboardAnalytics({
  escolaId,
  turmas,
  onOpenPerfilAluno,
  usuarioLogado,
  onOpenLogin,
}: DashboardAnalyticsProps) {
  const router = useRouter();
  const { escolaAtualObj, cursos, abrirModalNovaTurma } = useApp();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Tabs de análise: cursos | status | frequencia
  const [abaAnalise, setAbaAnalise] = useState<'cursos' | 'status' | 'turma'>('cursos');

  // Turma detalhada (para frequência)
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<number | null>(null);
  const [turmaDashboard, setTurmaDashboard] = useState<TurmaDashboard | null>(null);
  const [loadingTurma, setLoadingTurma] = useState(false);
  const [buscaAlunoTurma, setBuscaAlunoTurma] = useState('');
  const [filtroSituacaoTurma, setFiltroSituacaoTurma] = useState<'todos' | 'risco' | 'regulares'>('todos');

  // Filtro de turmas na tabela da unidade
  const [buscaTurmaTabela, setBuscaTurmaTabela] = useState('');

  const carregarStats = useCallback(async () => {
    setLoadingStats(true);
    setErro(null);
    try {
      const data = await api.getDashboardStats(escolaId || undefined);
      setStats(data);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar dados analíticos');
    } finally {
      setLoadingStats(false);
    }
  }, [escolaId]);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  const carregarDashboardTurma = useCallback(async (idTurma: number) => {
    setLoadingTurma(true);
    try {
      const dados = await api.getDashboardTurma(idTurma);
      setTurmaDashboard(dados);
    } catch {
      setTurmaDashboard(null);
    } finally {
      setLoadingTurma(false);
    }
  }, []);

  useEffect(() => {
    if (turmas?.length > 0 && !turmaSelecionadaId) {
      setTurmaSelecionadaId(turmas[0].id || null);
      if (turmas[0].id) carregarDashboardTurma(turmas[0].id);
    }
  }, [turmas, turmaSelecionadaId, carregarDashboardTurma]);

  const handleSelectTurma = (idTurma: number) => {
    setTurmaSelecionadaId(idTurma);
    carregarDashboardTurma(idTurma);
  };

  // Alunos filtrados dentro da turma em foco
  const alunosFiltrados = useMemo(() => {
    if (!turmaDashboard?.alunos) return [];
    return turmaDashboard.alunos.filter((aluno) => {
      const matchBusca =
        !buscaAlunoTurma ||
        aluno.alunoNome.toLowerCase().includes(buscaAlunoTurma.toLowerCase()) ||
        aluno.alunoCpf.includes(buscaAlunoTurma);
      if (!matchBusca) return false;
      if (filtroSituacaoTurma === 'risco') return aluno.atingiuLimiteFaltas || aluno.riscoDesistencia;
      if (filtroSituacaoTurma === 'regulares') return !aluno.atingiuLimiteFaltas && !aluno.riscoDesistencia;
      return true;
    });
  }, [turmaDashboard, buscaAlunoTurma, filtroSituacaoTurma]);

  // Lista de turmas filtradas da escola
  const turmasFiltradas = useMemo(() => {
    if (!turmas) return [];
    if (!buscaTurmaTabela.trim()) return turmas;
    const termo = buscaTurmaTabela.toLowerCase();
    return turmas.filter(
      (t) =>
        t.codigo.toLowerCase().includes(termo) ||
        (t.cursoNome && t.cursoNome.toLowerCase().includes(termo)) ||
        (t.educadorResponsavel && t.educadorResponsavel.toLowerCase().includes(termo))
    );
  }, [turmas, buscaTurmaTabela]);

  // Alunos em risco acumulados da turma selecionada
  const alunosEmRiscoLista = useMemo(() => {
    if (!turmaDashboard?.alunos) return [];
    return turmaDashboard.alunos.filter((a) => a.atingiuLimiteFaltas || a.riscoDesistencia || a.faltasConsecutivas >= 2);
  }, [turmaDashboard]);

  // Recharts data
  const pieData = stats?.distribuicaoStatus || [];
  const barData =
    stats?.cursosStats?.map((c) => ({
      name: c.escolaSigla,
      fullName: `${c.escolaSigla} — ${c.cursoNome}`,
      Matrículas: c.totalMatriculas,
      Evasões: c.totalEvasoes,
    })) || [];

  // Skeleton de carregamento inicial
  if (loadingStats && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-14 w-full bg-slate-200 dark:bg-slate-800/80 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800/80 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-800/80 rounded-2xl animate-pulse" />
          <div className="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-800/80 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Nome da unidade e cor
  const nomeUnidade = escolaAtualObj ? escolaAtualObj.nome : 'Rede de Escolas Livres de Santo André';
  const siglaUnidade = escolaAtualObj ? escolaAtualObj.sigla : 'REDE';

  return (
    <div className="space-y-6">
      {/* ─── 1. WELCOME HERO BANNER (Shadcn School Style) ─── */}
      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              {siglaUnidade}
            </span>
            <span className="text-slate-400 dark:text-zinc-600 text-xs">·</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Ano Letivo 2026 • 2º Semestre
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Escolar — {nomeUnidade}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Acompanhe matrículas, assiduidade de alunos, turmas ativas e alertas de busca ativa em tempo real.
          </p>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => abrirModalNovaTurma()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#18181b] dark:hover:bg-[#27272a] text-slate-800 dark:text-zinc-100 text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Abrir Turma</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/turmas')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Ver Turmas</span>
          </button>

          <button
            type="button"
            onClick={carregarStats}
            className="p-2 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer"
            title="Atualizar dados analíticos"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. TOP METRIC CARDS (4-Column Bento Grid) ─── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Matrículas Ativas */}
          <MetricKpiCard
            index={0}
            title="Matrículas Ativas"
            value={stats.totalMatriculados}
            badgeText="Cursando"
            badgeType="positive"
            subtitle={`em ${stats.totalTurmas} turmas abertas na unidade`}
            icon={GraduationCap}
            iconBg="bg-emerald-500/10 dark:bg-emerald-950/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />

          {/* Card 2: Assiduidade Global */}
          <MetricKpiCard
            index={1}
            title="Assiduidade Global"
            value={turmaDashboard ? `${turmaDashboard.taxaAssiduidadeTurma}%` : '92.4%'}
            badgeText="Meta ≥ 75%"
            badgeType={
              (turmaDashboard?.taxaAssiduidadeTurma || 92) >= 75 ? 'positive' : 'danger'
            }
            subtitle="Presença apurada nas chamadas escolares"
            icon={Activity}
            iconBg="bg-blue-500/10 dark:bg-blue-950/40"
            iconColor="text-blue-600 dark:text-blue-400"
          />

          {/* Card 3: Ocupação de Vagas */}
          <MetricKpiCard
            index={2}
            title="Ocupação das Vagas"
            value={`${stats.taxaOcupacaoVagas}%`}
            badgeText={`${Math.max(0, stats.totalVagas - stats.vagasOcupadas)} vagas livres`}
            badgeType="neutral"
            subtitle={`${stats.vagasOcupadas} ocupadas de ${stats.totalVagas} totais`}
            icon={Layers}
            iconBg="bg-violet-500/10 dark:bg-violet-950/40"
            iconColor="text-violet-600 dark:text-violet-400"
            progressBar={stats.taxaOcupacaoVagas}
          />

          {/* Card 4: Alunos em Atenção / Busca Ativa */}
          <MetricKpiCard
            index={3}
            title="Alerta de Evasão"
            value={stats.totalEvasoes + (turmaDashboard?.alunosEmRiscoFaltas || 0)}
            badgeText="Busca Ativa"
            badgeType={
              stats.totalEvasoes + (turmaDashboard?.alunosEmRiscoFaltas || 0) > 0 ? 'warning' : 'positive'
            }
            subtitle="Alunos com 2+ faltas ou desligados"
            icon={AlertTriangle}
            iconBg="bg-amber-500/10 dark:bg-amber-950/40"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      {/* ─── 3. MAIN BENTO GRID (12 COLUMNS) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── COLUNA ESQUERDA (8 COLUNAS) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* CARD 1: PAINEL ANALÍTICO COM TABS */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 sm:p-6 shadow-xs space-y-5">
            {/* Cabeçalho do Card com Seletor de Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#27272a]/60 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Desempenho Acadêmico & Frequência</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Análise comparativa entre cursos, matrículas ativas e presenças
                </p>
              </div>

              {/* Seletor de Abas Estilo Shadcn */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#09090b] rounded-xl border border-slate-200/60 dark:border-[#27272a]/60">
                <button
                  type="button"
                  onClick={() => setAbaAnalise('cursos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    abaAnalise === 'cursos'
                      ? 'bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Cursos & Vagas
                </button>
                <button
                  type="button"
                  onClick={() => setAbaAnalise('status')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    abaAnalise === 'status'
                      ? 'bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Status de Alunos
                </button>
                <button
                  type="button"
                  onClick={() => setAbaAnalise('turma')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    abaAnalise === 'turma'
                      ? 'bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Diário por Turma
                </button>
              </div>
            </div>

            {/* CONTEÚDO DA ABA 1: CURSOS & EVASÃO (BAR CHART) */}
            {abaAnalise === 'cursos' && (
              <div className="space-y-4">
                {barData.length > 0 ? (
                  <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                        barCategoryGap="25%"
                        barGap={4}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="currentColor"
                          className="text-slate-200 dark:text-[#27272a]"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                          width={35}
                        />
                        <Tooltip content={<CustomTooltipBar />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                        />
                        <Bar
                          dataKey="Matrículas"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          animationDuration={300}
                        />
                        <Bar
                          dataKey="Evasões"
                          fill="#f43f5e"
                          radius={[6, 6, 0, 0]}
                          animationDuration={300}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic">
                    Nenhum curso registrado para esta escola.
                  </div>
                )}

                {/* Tabela de Cursos da Unidade */}
                {stats?.cursosStats && stats.cursosStats.length > 0 && (
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden mt-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800/80">
                        <tr>
                          <th className="py-2.5 px-3">Curso</th>
                          <th className="py-2.5 px-2 text-center font-mono">Matrículas</th>
                          <th className="py-2.5 px-2 text-center font-mono">Evasões</th>
                          <th className="py-2.5 px-3 text-right">Taxa Evasão</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {stats.cursosStats.map((c) => (
                          <tr key={c.cursoId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {c.cursoNome}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {c.totalMatriculas}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                              {c.totalEvasoes}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  c.taxaEvasao > 0
                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}
                              >
                                {c.taxaEvasao}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CONTEÚDO DA ABA 2: STATUS DE ALUNOS (DONUT CHART) */}
            {abaAnalise === 'status' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="w-full h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="quantidade"
                        nameKey="label"
                        animationDuration={300}
                        stroke="none"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipPie />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-2">
                    Distribuição da Matrícula
                  </h4>
                  {pieData.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.cor }} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">{item.quantidade}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 w-10 text-right">
                          {item.percentual}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 3: DIÁRIO POR TURMA */}
            {abaAnalise === 'turma' && (
              <div className="space-y-4">
                {/* Seletor de Turma */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Turma Analisada:</span>
                  </div>
                  <select
                    value={turmaSelecionadaId || ''}
                    onChange={(e) => handleSelectTurma(Number(e.target.value))}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white cursor-pointer min-w-[220px]"
                  >
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.escolaSigla}] {t.codigo} — {t.cursoNome}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingTurma ? (
                  <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Calculando frequência da turma...</span>
                  </div>
                ) : turmaDashboard ? (
                  <div className="space-y-4">
                    {/* Mini Estatísticas da Turma */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Alunos</span>
                        <p className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                          {turmaDashboard.totalAlunos}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Aulas Dadas</span>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                          {turmaDashboard.totalAulasRegistradas}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Presenças</span>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                          {turmaDashboard.somaPresencas}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Assiduidade</span>
                        <p
                          className={`text-base font-black font-mono mt-0.5 ${
                            turmaDashboard.taxaAssiduidadeTurma >= 75
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {turmaDashboard.taxaAssiduidadeTurma}%
                        </p>
                      </div>
                    </div>

                    {/* Tabela de Alunos da Turma */}
                    <div className="border border-slate-200/80 dark:border-slate-800/60 rounded-xl overflow-hidden">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                        <div className="relative flex-1 max-w-xs">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          <input
                            type="text"
                            placeholder="Buscar aluno..."
                            value={buscaAlunoTurma}
                            onChange={(e) => setBuscaAlunoTurma(e.target.value)}
                            className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div className="flex gap-1 text-[11px]">
                          {(['todos', 'risco', 'regulares'] as const).map((filtro) => (
                            <button
                              key={filtro}
                              type="button"
                              onClick={() => setFiltroSituacaoTurma(filtro)}
                              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                                filtroSituacaoTurma === filtro
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {filtro === 'todos' ? 'Todos' : filtro === 'risco' ? 'Em Risco' : 'Regulares'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {alunosFiltrados.map((aluno) => (
                              <tr key={aluno.matriculaId} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                                <td className="py-2.5 px-3">
                                  <span className="font-bold text-slate-900 dark:text-white block">
                                    {aluno.alunoNome}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    CPF: {formatarCpfMascara(aluno.alunoCpf)}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono">
                                  <span className="font-bold text-emerald-600">{aluno.presencas}P</span>
                                  <span className="text-slate-400 mx-1">/</span>
                                  <span className="font-bold text-rose-600">{aluno.faltas}F</span>
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      aluno.faltasConsecutivas >= 2
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {aluno.faltasConsecutivas} seguidas
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => onOpenPerfilAluno(aluno.alunoId)}
                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                  >
                                    Ver Perfil
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* CARD 2: TURMAS EM ANDAMENTO & ROSTER TABLE */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Turmas Ativas da Unidade</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Capacidade, educador responsável e horários das aulas
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Filtrar turmas..."
                    value={buscaTurmaTabela}
                    onChange={(e) => setBuscaTurmaTabela(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] rounded-lg text-xs"
                  />
                </div>
                <Link
                  href="/turmas"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Tabela de Turmas */}
            <div className="border border-slate-100 dark:border-[#27272a]/80 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-[#09090b]/60 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-100 dark:border-[#27272a]/80">
                    <tr>
                      <th className="py-2.5 px-3">Código & Curso</th>
                      <th className="py-2.5 px-3">Educador / Regente</th>
                      <th className="py-2.5 px-3">Horário & Sala</th>
                      <th className="py-2.5 px-3">Ocupação</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]/50">
                    {turmasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                          Nenhuma turma encontrada.
                        </td>
                      </tr>
                    ) : (
                      turmasFiltradas.slice(0, 6).map((turma) => {
                        const ocupadas = turma.vagasOcupadas || 0;
                        const pct = Math.round((ocupadas / (turma.vagasTotais || 1)) * 100);

                        return (
                          <tr key={turma.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 dark:text-white block font-mono">
                                {turma.codigo}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[160px] block">
                                {turma.cursoNome}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                              {turma.educadorResponsavel || 'A definir'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">
                              {turma.diasHorariosLocal || 'Conforme cronograma'}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="w-28 space-y-1">
                                <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-300">
                                  <span>{ocupadas}/{turma.vagasTotais}</span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      pct >= 100
                                        ? 'bg-rose-500'
                                        : pct >= 80
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => router.push(`/turmas?turmaId=${turma.id}`)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-[#27272a] hover:bg-slate-100 dark:hover:bg-[#18181b] text-slate-700 dark:text-zinc-200 transition cursor-pointer"
                              >
                                Ver Turma
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUNA DIREITA (4 COLUNAS) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* CARD 1: AGENDA ACADÊMICA & PRÓXIMAS AULAS */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272a]/60 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Agenda das Aulas</span>
              </h3>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {turmas.length} turmas
              </span>
            </div>

            <div className="space-y-3">
              {turmas.slice(0, 4).map((turma, idx) => (
                <div
                  key={turma.id || idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-[#27272a]/80 bg-slate-50/50 dark:bg-[#18181b]/50 hover:border-slate-200 dark:hover:border-zinc-700 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-[#27272a]">
                      {turma.codigo}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {turma.status === 'ABERTA' ? 'Matrículas Abertas' : 'Em Andamento'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {turma.cursoNome}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">
                    <span className="truncate max-w-[150px]">
                      {turma.educadorResponsavel || 'Educador atribuído'}
                    </span>
                    <span className="font-mono text-[10px]">
                      {turma.diasHorariosLocal?.split('-')[0] || '19h - 22h'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: CENTRAL DE BUSCA ATIVA & ALERTA DE RISCO */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272a]/60 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Alerta de Busca Ativa</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Prevenção de abandono e cancelamento
                </p>
              </div>
            </div>

            {alunosEmRiscoLista.length > 0 ? (
              <div className="space-y-2.5">
                {alunosEmRiscoLista.slice(0, 4).map((aluno) => (
                  <div
                    key={aluno.matriculaId}
                    className="p-3 rounded-xl border border-amber-200/70 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[160px]">
                        {aluno.alunoNome}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full ${
                          aluno.faltasConsecutivas >= 3
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {aluno.faltasConsecutivas >= 3 ? 'Desligamento' : `${aluno.faltasConsecutivas} Faltas`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Assiduidade: {aluno.porcentagemPresenca}%
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenPerfilAluno(aluno.alunoId)}
                        className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Ver Dossiê →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-emerald-600 dark:text-emerald-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 opacity-80" />
                <span className="font-semibold">Nenhum aluno em risco crítico de faltas nesta turma.</span>
              </div>
            )}
          </div>

          {/* CARD 3: SECRETARIA DE MATRÍCULAS */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Secretaria de Matrículas</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {stats?.totalMatriculados || 0} alunos
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Gestão de estudantes matriculados, declarações oficiais e prontuários escolares.
            </p>

            <Link
              href="/matriculas"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#18181b] dark:hover:bg-[#27272a] text-slate-800 dark:text-zinc-100 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Gerenciar Matrículas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
