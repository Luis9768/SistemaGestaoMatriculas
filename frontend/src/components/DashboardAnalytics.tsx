'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  api,
  DashboardStats,
  TurmaDashboard,
  Turma,
  formatarCpfMascara,
  LoginResponse,
} from '@/lib/api';
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

/* ─── Motion Variants (Executive BI Snappy Timing) ──────── */
const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.22, ease: 'easeOut' as const },
  }),
};

const chartVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

/* ─── Recharts Custom Tooltip ────────────────────────── */
function CustomTooltipPie({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl text-xs space-y-1">
      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.cor }} />
        {d.label}
      </div>
      <div className="text-slate-600 dark:text-slate-400">
        <span className="font-mono font-bold text-slate-900 dark:text-white">{d.quantidade}</span>
        {' '}alunos ({d.percentual}%)
      </div>
    </div>
  );
}

function CustomTooltipBar({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl text-xs space-y-1.5">
      <p className="font-bold text-slate-900 dark:text-white">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────── */
function KpiCard({
  index, title, value, badge, badgeColor, icon: Icon, iconBg, detail, accentColor
}: {
  index: number;
  title: string;
  value: number;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  detail: React.ReactNode;
  accentColor: string;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
    >
      {/* Accent top line */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${accentColor}`} />

      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-none">
          {title}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline gap-3">
        <span className="text-[2.1rem] font-black text-slate-900 dark:text-white tracking-tight font-mono leading-none">
          {value}
        </span>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      </div>

      <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        {detail}
      </div>
    </motion.div>
  );
}

/* ─── Tab Button ─────────────────────────────────────── */
function TabButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Main Dashboard Component ───────────────────────── */
export function DashboardAnalytics({
  escolaId,
  turmas,
  onOpenPerfilAluno,
  usuarioLogado,
  onOpenLogin,
}: DashboardAnalyticsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAnalitica, setAbaAnalitica] = useState<'geral' | 'frequencia'>('geral');
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<number | null>(null);
  const [turmaDashboard, setTurmaDashboard] = useState<TurmaDashboard | null>(null);
  const [loadingTurma, setLoadingTurma] = useState(false);
  const [buscaAlunoTurma, setBuscaAlunoTurma] = useState('');
  const [filtroSituacaoTurma, setFiltroSituacaoTurma] = useState<'todos' | 'risco' | 'regulares'>('todos');

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

  useEffect(() => { carregarStats(); }, [carregarStats]);

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

  // Filter students
  const alunosFiltrados =
    turmaDashboard?.alunos.filter((aluno) => {
      const matchBusca =
        !buscaAlunoTurma ||
        aluno.alunoNome.toLowerCase().includes(buscaAlunoTurma.toLowerCase()) ||
        aluno.alunoCpf.includes(buscaAlunoTurma);
      if (!matchBusca) return false;
      if (filtroSituacaoTurma === 'risco') return aluno.atingiuLimiteFaltas || aluno.riscoDesistencia;
      if (filtroSituacaoTurma === 'regulares') return !aluno.atingiuLimiteFaltas && !aluno.riscoDesistencia;
      return true;
    }) || [];

  // Recharts data preparation
  const pieData = stats?.distribuicaoStatus || [];
  const barData = stats?.cursosStats?.map(c => ({
    name: `${c.escolaSigla}`,
    fullName: `${c.escolaSigla} — ${c.cursoNome}`,
    Matrículas: c.totalMatriculas,
    Inscrições: c.totalInscricoes,
    Evasões: c.totalEvasoes,
  })) || [];

  /* ─── Loading Skeleton ───────────────────────────────── */
  if (loadingStats && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header + Tab Switcher ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Painel de Indicadores
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visão consolidada de matrículas, evasões e frequência
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <TabButton active={abaAnalitica === 'geral'} onClick={() => setAbaAnalitica('geral')}>
              Matrículas
            </TabButton>
            <TabButton active={abaAnalitica === 'frequencia'} onClick={() => setAbaAnalitica('frequencia')}>
              <span className="flex items-center gap-1.5">
                Frequência
                {turmaDashboard && turmaDashboard.alunosEmRiscoFaltas > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                    {turmaDashboard.alunosEmRiscoFaltas}
                  </span>
                )}
              </span>
            </TabButton>
          </div>

          <button
            onClick={carregarStats}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── TAB: Visão Geral ──────────────────────────── */}
      <AnimatePresence mode="wait">
        {abaAnalitica === 'geral' && stats && (
          <motion.div
            key="geral"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                index={0}
                title="Matrículas Ativas"
                value={stats.totalMatriculados}
                badge="Cursando"
                badgeColor="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                icon={CheckCircle2}
                iconBg="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                accentColor="bg-emerald-500"
                detail={
                  <span className="font-mono">
                    Ocupação: <strong className="text-slate-700 dark:text-slate-200">{stats.taxaOcupacaoVagas}%</strong>
                    <span className="text-slate-400 dark:text-slate-500 mx-1">·</span>
                    {stats.vagasOcupadas}/{stats.totalVagas} vagas
                  </span>
                }
              />
              <KpiCard
                index={1}
                title="Evasões (3 Faltas)"
                value={stats.totalEvasoes}
                badge={`${stats.taxaEvasao}%`}
                badgeColor="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                icon={TrendingDown}
                iconBg="bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                accentColor="bg-rose-500"
                detail="Desligados por faltas consecutivas"
              />
              <KpiCard
                index={2}
                title="Inscrições"
                value={stats.totalInscricoes}
                badge="Candidatos"
                badgeColor="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                icon={Users}
                iconBg="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                accentColor="bg-blue-500"
                detail={
                  <span className="font-mono">
                    Fila de espera: <strong className="text-slate-700 dark:text-slate-200">{stats.totalFilaEspera}</strong> aguardando
                  </span>
                }
              />
              <KpiCard
                index={3}
                title="Formados"
                value={stats.totalFormados}
                badge={`Êxito ${stats.taxaConclusao}%`}
                badgeColor="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                icon={GraduationCap}
                iconBg="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                accentColor="bg-amber-500"
                detail="Concluíram ciclos formativos"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Donut Chart — Status Distribution */}
              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate="visible"
                className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Distribuição por Status
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Proporção de alunos ativos, evadidos e formados
                  </p>
                </div>

                {pieData.length > 0 && stats.totalGeral > 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="quantidade"
                            nameKey="label"
                            animationBegin={0}
                            animationDuration={350}
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

                    {/* Center label overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ display: 'none' }} />

                    {/* Legend */}
                    <div className="w-full space-y-1.5">
                      {pieData.map(item => (
                        <div key={item.status} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.cor }} />
                            <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2.5 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white">{item.quantidade}</span>
                            <span className="text-slate-400 dark:text-slate-500 w-10 text-right text-[11px]">{item.percentual}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic">
                    Nenhum dado disponível.
                  </div>
                )}
              </motion.div>

              {/* Bar Chart — Courses Comparison */}
              <motion.div
                variants={chartVariants}
                initial="hidden"
                animate="visible"
                className="lg:col-span-3 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    Matrículas vs. Evasões por Curso
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Comparativo entre inscrições, matrículas e evasões
                  </p>
                </div>

                {barData.length > 0 ? (
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                        barCategoryGap="20%"
                        barGap={3}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="currentColor"
                          className="text-slate-200 dark:text-slate-800"
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
                          wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                        />
                        <Bar
                          dataKey="Matrículas"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          animationBegin={0}
                          animationDuration={350}
                        />
                        <Bar
                          dataKey="Inscrições"
                          fill="#3b82f6"
                          radius={[6, 6, 0, 0]}
                          animationBegin={0}
                          animationDuration={350}
                        />
                        <Bar
                          dataKey="Evasões"
                          fill="#f43f5e"
                          radius={[6, 6, 0, 0]}
                          animationBegin={0}
                          animationDuration={350}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic">
                    Nenhum curso disponível para comparação.
                  </div>
                )}

                {/* Course Details Table */}
                {stats.cursosStats && stats.cursosStats.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-500 dark:text-slate-400 font-semibold">
                            <th className="pb-2.5 pr-3">Curso</th>
                            <th className="pb-2.5 px-2 text-center">Inscrições</th>
                            <th className="pb-2.5 px-2 text-center">Matrículas</th>
                            <th className="pb-2.5 px-2 text-center">Evasões</th>
                            <th className="pb-2.5 pl-2 text-right">Taxa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {stats.cursosStats.map(curso => (
                            <tr key={curso.cursoId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 pr-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {curso.escolaSigla}
                                  </span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                    {curso.cursoNome}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-blue-600 dark:text-blue-400 font-mono">{curso.totalInscricoes}</td>
                              <td className="py-2.5 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">{curso.totalMatriculas}</td>
                              <td className="py-2.5 px-2 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">{curso.totalEvasoes}</td>
                              <td className="py-2.5 pl-2 text-right">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                                  curso.taxaEvasao > 0
                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}>
                                  {curso.taxaEvasao}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TAB: Frequência por Turma ─────────────────── */}
      <AnimatePresence mode="wait">
        {abaAnalitica === 'frequencia' && (
          <motion.div
            key="frequencia"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
          >
            {/* Frequency Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Frequência por Turma
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Presenças, faltas e identificação preventiva de risco
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Turma:</label>
                  <select
                    value={turmaSelecionadaId || ''}
                    onChange={e => handleSelectTurma(Number(e.target.value))}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer min-w-[200px]"
                  >
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.escolaSigla}] {t.codigo} — {t.cursoNome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loadingTurma ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Calculando frequência da turma...</span>
              </div>
            ) : turmaDashboard ? (
              <div className="p-6 space-y-6">
                {/* Turma info bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white">
                      {turmaDashboard.escolaSigla}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {turmaDashboard.cursoNome}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-mono">
                        {turmaDashboard.turmaCodigo}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Alunos</span>
                      <p className="font-bold text-slate-900 dark:text-white font-mono">{turmaDashboard.totalAlunos}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Aulas</span>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{turmaDashboard.totalAulasRegistradas}</p>
                    </div>
                  </div>
                </div>

                {/* Frequency KPI mini cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Presenças', value: turmaDashboard.somaPresencas, color: 'emerald', sub: 'Confirmadas' },
                    { label: 'Faltas', value: turmaDashboard.somaFaltas, color: 'rose', sub: 'Não justificadas' },
                    { label: 'Justificadas', value: turmaDashboard.somaJustificadas, color: 'amber', sub: 'Com atestado' },
                    {
                      label: 'Assiduidade',
                      value: turmaDashboard.taxaAssiduidadeTurma,
                      color: turmaDashboard.taxaAssiduidadeTurma >= 75 ? 'emerald' : 'rose',
                      sub: 'Presença global',
                      isPercent: true,
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-4 text-center hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {item.label}
                      </span>
                      <div className={`text-2xl font-black mt-1.5 font-mono text-${item.color}-600 dark:text-${item.color}-400`}>
                        {item.value}{(item as any).isPercent && '%'}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.sub}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Risk alerts */}
                {(turmaDashboard.alunosEmRiscoFaltas > 0 || turmaDashboard.alunosDesistentes > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {turmaDashboard.alunosEmRiscoFaltas > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3 text-xs"
                      >
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-900 dark:text-amber-200">
                            {turmaDashboard.alunosEmRiscoFaltas} aluno(s) com 2 faltas
                          </p>
                          <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                            Risco crítico — mais 1 falta ativa o alerta de evasão.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {turmaDashboard.alunosDesistentes > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 flex items-start gap-3 text-xs"
                      >
                        <UserX className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-900 dark:text-rose-200">
                            {turmaDashboard.alunosDesistentes} aluno(s) com 3 faltas
                          </p>
                          <p className="text-rose-700 dark:text-rose-300 mt-0.5">
                            Protocolo: contatar aluno/responsável por WhatsApp ou E-mail.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Student Table */}
                <div className="border border-slate-200/80 dark:border-slate-800/60 rounded-xl overflow-hidden">
                  {/* Filters */}
                  <div className="bg-slate-50/80 dark:bg-slate-900/40 p-3.5 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar aluno por nome ou CPF..."
                        value={buscaAlunoTurma}
                        onChange={e => setBuscaAlunoTurma(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      {[
                        { key: 'todos' as const, label: `Todos (${turmaDashboard.alunos.length})`, color: 'indigo' },
                        { key: 'risco' as const, label: 'Em Risco', color: 'amber' },
                        { key: 'regulares' as const, label: 'Regulares', color: 'emerald' },
                      ].map(f => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setFiltroSituacaoTurma(f.key)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                            filtroSituacaoTurma === f.key
                              ? `bg-${f.color}-600 text-white shadow-sm`
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {alunosFiltrados.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                      Nenhum aluno encontrado com os critérios selecionados.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/60 dark:border-slate-800/60">
                          <tr>
                            <th className="py-3 px-4">Aluno</th>
                            <th className="py-3 px-4">CPF</th>
                            <th className="py-3 px-3 text-center">Aulas</th>
                            <th className="py-3 px-3 text-center">Presenças</th>
                            <th className="py-3 px-3 text-center">Faltas</th>
                            <th className="py-3 px-3 text-center">Seguidas</th>
                            <th className="py-3 px-3">Assiduidade</th>
                            <th className="py-3 px-3 text-center">Situação</th>
                            <th className="py-3 px-4 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {alunosFiltrados.map((aluno, index) => (
                            <motion.tr
                              key={aluno.matriculaId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.03, duration: 0.3 }}
                              className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                                  {aluno.alunoNome}
                                  {aluno.menorDeIdade && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                                      Menor
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                                {formatarCpfMascara(aluno.alunoCpf)}
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-medium text-slate-600 dark:text-slate-300">
                                {aluno.totalAulas}
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {aluno.presencas}
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                                {aluno.faltas}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                                  aluno.faltasConsecutivas >= 3
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    : aluno.faltasConsecutivas === 2
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                  {aluno.faltasConsecutivas}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="w-24">
                                  <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{aluno.porcentagemPresenca}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${aluno.porcentagemPresenca}%` }}
                                      transition={{ duration: 0.35, ease: 'easeOut' }}
                                      className={`h-full rounded-full ${
                                        aluno.porcentagemPresenca >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                {aluno.atingiuLimiteFaltas ? (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
                                    Crítico
                                  </span>
                                ) : aluno.riscoDesistencia ? (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                                    Alerta
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                    Regular
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => onOpenPerfilAluno(aluno.alunoId)}
                                  className="px-3 py-1.5 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                >
                                  Perfil
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
                Selecione uma turma para visualizar a frequência.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
