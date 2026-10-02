'use client';

import React, { useState, useEffect } from 'react';
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
  PieChart as PieIcon,
  BarChart3,
  RefreshCw,
  Search,
  Table as TableIcon,
  AlignLeft,
  Columns as ColumnsIcon,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Percent,
  ShieldAlert,
  Lock,
} from 'lucide-react';

interface DashboardAnalyticsProps {
  escolaId?: number | null;
  turmas: Turma[];
  onOpenPerfilAluno: (alunoId: number) => void;
  usuarioLogado?: LoginResponse | null;
  onOpenLogin?: () => void;
}

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

  // Seletores do tipo de gráfico
  const [tipoGraficoStatus, setTipoGraficoStatus] = useState<
    'pizza' | 'torre' | 'barras' | 'tabela'
  >('pizza');
  const [tipoGraficoCursos, setTipoGraficoCursos] = useState<
    'torre' | 'barras' | 'tabela'
  >('torre');

  // Separação de Informações: Geral vs. Frequência
  const [abaAnalitica, setAbaAnalitica] = useState<'geral' | 'frequencia'>('geral');

  // Visão por Turma (Soma de Presenças)
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<number | null>(null);
  const [turmaDashboard, setTurmaDashboard] = useState<TurmaDashboard | null>(null);
  const [loadingTurma, setLoadingTurma] = useState(false);

  // Filtros da lista de alunos na turma selecionada
  const [buscaAlunoTurma, setBuscaAlunoTurma] = useState('');
  const [filtroSituacaoTurma, setFiltroSituacaoTurma] = useState<
    'todos' | 'risco' | 'regulares'
  >('todos');

  // Hover compartilhado nos gráficos
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Carregar dados gerais
  const carregarStats = async () => {
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
  };

  useEffect(() => {
    carregarStats();
  }, [escolaId]);

  // Seletor inicial de turma
  useEffect(() => {
    if (turmas && turmas.length > 0 && !turmaSelecionadaId) {
      setTurmaSelecionadaId(turmas[0].id || null);
      if (turmas[0].id) {
        carregarDashboardTurma(turmas[0].id);
      }
    }
  }, [turmas]);

  const carregarDashboardTurma = async (idTurma: number) => {
    setLoadingTurma(true);
    try {
      const dados = await api.getDashboardTurma(idTurma);
      setTurmaDashboard(dados);
    } catch {
      setTurmaDashboard(null);
    } finally {
      setLoadingTurma(false);
    }
  };

  const handleSelectTurma = (idTurma: number) => {
    setTurmaSelecionadaId(idTurma);
    carregarDashboardTurma(idTurma);
  };

  // ==========================================
  // RENDERIZADORES DE GRÁFICOS: STATUS
  // ==========================================

  // 1. Gráfico Pizza / Donut
  const renderDonutChart = () => {
    if (
      !stats ||
      !stats.distribuicaoStatus ||
      stats.distribuicaoStatus.length === 0 ||
      stats.totalGeral === 0
    ) {
      return (
        <div className="flex items-center justify-center h-56 text-xs text-slate-400 dark:text-slate-500 italic">
          Nenhum dado registrado para gerar o gráfico de pizza.
        </div>
      );
    }

    const size = 190;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercent = 0;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {stats.distribuicaoStatus.map((item) => {
              const strokeDasharray = `${
                (item.percentual / 100) * circumference
              } ${circumference}`;
              const strokeDashoffset = -(
                (accumulatedPercent / 100) *
                circumference
              );
              accumulatedPercent += item.percentual;

              const isHovered = hoveredSlice === item.status;

              return (
                <circle
                  key={item.status}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.cor}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(item.status)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}
          </svg>

          {/* Centro do Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hoveredSlice ? (
              (() => {
                const hoveredItem = stats.distribuicaoStatus.find(
                  (s) => s.status === hoveredSlice
                );
                return (
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {hoveredItem?.quantidade}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                      {hoveredItem?.percentual}%
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {hoveredItem?.label}
                    </span>
                  </div>
                );
              })()
            ) : (
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.totalGeral}
                </span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                  Total Alunos
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  100% registros
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legenda Lateral Interativa */}
        <div className="space-y-1.5 w-full sm:w-auto">
          {stats.distribuicaoStatus.map((item) => (
            <div
              key={item.status}
              onMouseEnter={() => setHoveredSlice(item.status)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`flex items-center justify-between sm:justify-start gap-3 p-2 rounded-xl transition-colors cursor-pointer text-xs ${
                hoveredSlice === item.status
                  ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.cor }}
                ></span>
                <span className="text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-right ml-auto">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {item.quantidade}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 w-12 text-right font-mono">
                  ({item.percentual}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 2. Gráfico de Torre / Colunas Verticais
  const renderTowerChartStatus = () => {
    if (
      !stats ||
      !stats.distribuicaoStatus ||
      stats.distribuicaoStatus.length === 0 ||
      stats.totalGeral === 0
    ) {
      return (
        <div className="flex items-center justify-center h-56 text-xs text-slate-400 dark:text-slate-500 italic">
          Nenhum dado registrado para gerar o gráfico de torre.
        </div>
      );
    }

    const maxValor = Math.max(
      ...stats.distribuicaoStatus.map((d) => d.quantidade),
      1
    );

    return (
      <div className="space-y-4 pt-2">
        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-3 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 relative bg-slate-50/70 dark:bg-[#0A0F1D] rounded-xl">
          {/* Linhas de Grade Horizontais */}
          <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 pl-2 -top-3.5 relative font-mono">
              Teto: {maxValor}
            </span>
          </div>
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 pl-2 -top-3.5 relative font-mono">
              50%: {Math.round(maxValor / 2)}
            </span>
          </div>

          {stats.distribuicaoStatus.map((item) => {
            const alturaPct = Math.max(
              Math.round((item.quantidade / maxValor) * 100),
              8
            );
            const isHovered = hoveredSlice === item.status;

            return (
              <div
                key={item.status}
                onMouseEnter={() => setHoveredSlice(item.status)}
                onMouseLeave={() => setHoveredSlice(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer z-10"
              >
                {/* Valor e Porcentagem no Topo da Torre */}
                <div
                  className={`text-center mb-1.5 transition-all duration-200 ${
                    isHovered ? 'scale-110 -translate-y-1' : ''
                  }`}
                >
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {item.quantidade}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                    {item.percentual}%
                  </span>
                </div>

                {/* Coluna / Torre */}
                <div className="w-full max-w-[46px] bg-slate-200/60 dark:bg-slate-800/60 rounded-t-xl overflow-hidden flex items-end h-full">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      isHovered
                        ? 'brightness-110 shadow-md ring-2 ring-slate-400 dark:ring-slate-500'
                        : ''
                    }`}
                    style={{
                      height: `${alturaPct}%`,
                      backgroundColor: item.cor,
                    }}
                  ></div>
                </div>

                {/* Rótulo da Base */}
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-2 truncate w-full text-center">
                  {item.label.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legenda Horizontal */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
          {stats.distribuicaoStatus.map((item) => (
            <div
              key={item.status}
              onMouseEnter={() => setHoveredSlice(item.status)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`flex items-center gap-1.5 p-1.5 rounded-lg transition cursor-pointer ${
                hoveredSlice === item.status
                  ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: item.cor }}
              ></span>
              <span className="truncate text-[11px] text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto font-mono">
                ({item.percentual}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 3. Gráfico de Barras Horizontais
  const renderBarChartStatus = () => {
    if (
      !stats ||
      !stats.distribuicaoStatus ||
      stats.distribuicaoStatus.length === 0
    )
      return null;
    const maxValor = Math.max(
      ...stats.distribuicaoStatus.map((d) => d.quantidade),
      1
    );

    return (
      <div className="space-y-3 pt-2">
        {stats.distribuicaoStatus.map((item) => {
          const pct = Math.max(
            Math.round((item.quantidade / maxValor) * 100),
            5
          );
          const isHovered = hoveredSlice === item.status;

          return (
            <div
              key={item.status}
              onMouseEnter={() => setHoveredSlice(item.status)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-3 rounded-xl transition cursor-pointer border ${
                isHovered
                  ? 'bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-2xs'
                  : 'bg-slate-50/70 dark:bg-[#0A0F1D] border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-2xs"
                    style={{ backgroundColor: item.cor }}
                  ></span>
                  {item.label}
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-black text-slate-900 dark:text-white">
                    {item.quantidade}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    ({item.percentual}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: item.cor }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 4. Tabela Analítica
  const renderTableStatus = () => {
    if (
      !stats ||
      !stats.distribuicaoStatus ||
      stats.distribuicaoStatus.length === 0
    )
      return null;

    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-2 text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Status / Categoria</th>
              <th className="py-2.5 px-3 text-right">Alunos</th>
              <th className="py-2.5 px-3 text-right">Percentual</th>
              <th className="py-2.5 px-3">Proporção Visual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {stats.distribuicaoStatus.map((item) => (
              <tr
                key={item.status}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-2xs"
                    style={{ backgroundColor: item.cor }}
                  ></span>
                  <span>{item.label}</span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                  {item.quantidade}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-600 dark:text-slate-400 font-mono">
                  {item.percentual}%
                </td>
                <td className="py-2.5 px-3">
                  <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(item.percentual, 4)}%`,
                        backgroundColor: item.cor,
                      }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ==========================================
  // RENDERIZADORES DE GRÁFICOS: CURSOS
  // ==========================================

  // 1. Gráfico de Torre Vertical por Curso
  const renderTowerChartCursos = () => {
    if (!stats || !stats.cursosStats || stats.cursosStats.length === 0) {
      return (
        <div className="flex items-center justify-center h-56 text-xs text-slate-400 dark:text-slate-500 italic">
          Nenhum curso disponível para comparação em torre.
        </div>
      );
    }

    const maxValor = Math.max(
      ...stats.cursosStats.map((c) =>
        Math.max(c.totalMatriculas, c.totalInscricoes, c.totalEvasoes, 1)
      )
    );

    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-end gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>{' '}
            Matrículas
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span> Inscrições
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> Evasões
          </span>
        </div>

        <div className="h-56 flex items-end justify-between gap-3 px-3 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 relative bg-slate-50/70 dark:bg-[#0A0F1D] rounded-xl overflow-x-auto">
          {/* Linha Guia */}
          <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 pl-2 -top-3.5 relative font-mono">
              Teto: {maxValor}
            </span>
          </div>

          {stats.cursosStats.map((curso) => {
            const hMatricula = Math.max(
              Math.round((curso.totalMatriculas / maxValor) * 100),
              6
            );
            const hInscricao = Math.max(
              Math.round((curso.totalInscricoes / maxValor) * 100),
              6
            );
            const hEvasao = Math.max(
              Math.round((curso.totalEvasoes / maxValor) * 100),
              curso.totalEvasoes > 0 ? 6 : 0
            );

            return (
              <div
                key={curso.cursoId}
                className="flex-1 min-w-[70px] flex flex-col items-center h-full justify-end group"
              >
                {/* Cluster de Torres */}
                <div className="flex items-end justify-center gap-1 w-full h-full">
                  {/* Torre 1: Matrículas */}
                  <div className="w-3.5 sm:w-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-t flex items-end h-full">
                    <div
                      className="w-full bg-emerald-500 rounded-t transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${hMatricula}%` }}
                      title={`Matrículas: ${curso.totalMatriculas}`}
                    ></div>
                  </div>

                  {/* Torre 2: Inscrições */}
                  <div className="w-3.5 sm:w-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-t flex items-end h-full">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${hInscricao}%` }}
                      title={`Inscrições: ${curso.totalInscricoes}`}
                    ></div>
                  </div>

                  {/* Torre 3: Evasões */}
                  <div className="w-3.5 sm:w-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-t flex items-end h-full">
                    <div
                      className="w-full bg-rose-500 rounded-t transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${hEvasao}%` }}
                      title={`Evasões: ${curso.totalEvasoes}`}
                    ></div>
                  </div>
                </div>

                {/* Rótulo da Base */}
                <div className="mt-2 text-center w-full">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {curso.escolaSigla}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">
                    {curso.cursoNome.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 2. Gráfico de Barras Horizontais por Curso
  const renderBarChartCursos = () => {
    if (!stats || !stats.cursosStats || stats.cursosStats.length === 0) return null;
    const maxMatriculas = Math.max(
      ...stats.cursosStats.map((c) => Math.max(c.totalMatriculas, c.totalInscricoes, 1))
    );

    return (
      <div className="space-y-4 pt-2">
        <div className="space-y-3">
          {stats.cursosStats.map((curso) => {
            const pctMatricula = Math.max(
              Math.round((curso.totalMatriculas / maxMatriculas) * 100),
              4
            );
            const pctInscricao = Math.max(
              Math.round((curso.totalInscricoes / maxMatriculas) * 100),
              4
            );
            const pctEvasao = curso.taxaEvasao;

            return (
              <div
                key={curso.cursoId}
                className="p-3 bg-slate-50/70 dark:bg-[#0A0F1D] border border-slate-200/80 dark:border-slate-800/80 rounded-xl space-y-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {curso.escolaSigla}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {curso.cursoNome}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {curso.modalidade}
                  </span>
                </div>

                {/* Barras de Inscrições vs Matrículas */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-slate-500 dark:text-slate-400 text-right">
                      Inscrições:
                    </span>
                    <div className="flex-1 bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pctInscricao}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 w-8 text-right font-mono">
                      {curso.totalInscricoes}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-slate-500 dark:text-slate-400 text-right">
                      Matrículas:
                    </span>
                    <div className="flex-1 bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pctMatricula}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 w-8 text-right font-mono">
                      {curso.totalMatriculas}
                    </span>
                  </div>

                  {pctEvasao > 0 && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 text-rose-500 text-right">Evasão:</span>
                      <div className="flex-1 bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pctEvasao, 3)}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 w-8 text-right font-mono">
                        {curso.totalEvasoes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Tabela Comparativa de Cursos
  const renderTableCursos = () => {
    if (!stats || !stats.cursosStats || stats.cursosStats.length === 0) return null;

    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-2 text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Escola / Curso</th>
              <th className="py-2.5 px-3 text-center">Inscrições</th>
              <th className="py-2.5 px-3 text-center">Matrículas</th>
              <th className="py-2.5 px-3 text-center">Evasões</th>
              <th className="py-2.5 px-3 text-right">Taxa Evasão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {stats.cursosStats.map((curso) => (
              <tr
                key={curso.cursoId}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {curso.escolaSigla}
                    </span>
                    <span>{curso.cursoNome}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {curso.modalidade}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {curso.totalInscricoes}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {curso.totalMatriculas}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {curso.totalEvasoes}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      curso.taxaEvasao > 0
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}
                  >
                    {curso.taxaEvasao}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Filtragem dos alunos da turma
  const alunosFiltrados =
    turmaDashboard?.alunos.filter((aluno) => {
      const matchBusca =
        !buscaAlunoTurma ||
        aluno.alunoNome.toLowerCase().includes(buscaAlunoTurma.toLowerCase()) ||
        aluno.alunoCpf.includes(buscaAlunoTurma);

      if (!matchBusca) return false;

      if (filtroSituacaoTurma === 'risco') {
        return aluno.atingiuLimiteFaltas || aluno.riscoDesistencia;
      }
      if (filtroSituacaoTurma === 'regulares') {
        return !aluno.atingiuLimiteFaltas && !aluno.riscoDesistencia;
      }
      return true;
    }) || [];

  return (
    <div className="space-y-6">
      {/* SELETOR DE ESCOPO ANALÍTICO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 dark:border-slate-800/90 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Painel de Indicadores
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Alterne entre a visão macro de matrículas e o acompanhamento de frequência por turma
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setAbaAnalitica('geral')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              abaAnalitica === 'geral'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Visão Geral de Matrículas
          </button>
          <button
            type="button"
            onClick={() => setAbaAnalitica('frequencia')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              abaAnalitica === 'frequencia'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Frequência por Turma</span>
            {turmaDashboard && turmaDashboard.alunosEmRiscoFaltas > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                {turmaDashboard.alunosEmRiscoFaltas}
              </span>
            )}
          </button>
        </div>
      </div>

      {abaAnalitica === 'geral' && (
        <div className="space-y-6">
          {/* BLOCO 1: CARDS DE MÉTRICAS GERAIS (KPIs) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Painel Executivo de Evasões e Matrículas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visão quantitativa de candidatos, matriculados, formados e desistências por faltas
                </p>
              </div>
              <button
                onClick={carregarStats}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Atualizar estatísticas"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingStats ? 'animate-spin text-amber-600' : ''
                  }`}
                />
              </button>
            </div>

            {loadingStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"
                  ></div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Matrículas Ativas */}
                <div className="bg-white dark:bg-[#0D1424] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Matrículas Ativas
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                      {stats.totalMatriculados}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      Cursando
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                    Ocupação: <strong>{stats.taxaOcupacaoVagas}%</strong> ({stats.vagasOcupadas}/{stats.totalVagas})
                  </p>
                </div>

                {/* Card 2: Evasões / Desistências por Falta */}
                <div className="bg-white dark:bg-[#0D1424] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Evasões (3 Faltas)
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                      {stats.totalEvasoes}
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300 px-2 py-0.5 rounded-full font-mono">
                      Taxa: {stats.taxaEvasao}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                    Desligados por 3 faltas consecutivas
                  </p>
                </div>

                {/* Card 3: Inscrições em Andamento */}
                <div className="bg-white dark:bg-[#0D1424] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Inscrições & Seleção
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
                      {stats.totalInscricoes}
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-950/80 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Candidatos
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                    Fila de espera: <strong>{stats.totalFilaEspera}</strong> aguardando
                  </p>
                </div>

                {/* Card 4: Formados / Concluídos */}
                <div className="bg-white dark:bg-[#0D1424] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Formados / Concluídos
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      {stats.totalFormados}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full font-mono">
                      Êxito: {stats.taxaConclusao}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                    Concluíram ciclos formativos
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* BLOCO 2: GRÁFICOS INTERATIVOS COM SELETOR DE VISUALIZAÇÃO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GRÁFICO 1: DISTRIBUIÇÃO DE ALUNOS COM SELETOR */}
            <div className="bg-white dark:bg-[#0D1424] p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Distribuição de Status dos Alunos</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Proporção visual de alunos ativos, desistentes e formados
                  </p>
                </div>

                {/* SELETOR INTERATIVO DE TIPO DE GRÁFICO */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setTipoGraficoStatus('pizza')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      tipoGraficoStatus === 'pizza'
                        ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Gráfico de Pizza / Donut"
                  >
                    <PieIcon className="w-3.5 h-3.5" />
                    <span>Pizza</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoGraficoStatus('torre')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      tipoGraficoStatus === 'torre'
                        ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Gráfico de Torre (Colunas Verticais)"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Torre</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoGraficoStatus('barras')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      tipoGraficoStatus === 'barras'
                        ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Gráfico de Barras Horizontais"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Barras</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoGraficoStatus('tabela')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      tipoGraficoStatus === 'tabela'
                        ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Tabela Analítica"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tabela</span>
                  </button>
                </div>
              </div>

              {/* Renderização Condicional Conforme Escolha do Usuário */}
              {tipoGraficoStatus === 'pizza' && renderDonutChart()}
              {tipoGraficoStatus === 'torre' && renderTowerChartStatus()}
              {tipoGraficoStatus === 'barras' && renderBarChartStatus()}
              {tipoGraficoStatus === 'tabela' && renderTableStatus()}
            </div>

            {/* GRÁFICO 2: COMPARATIVO POR CURSO COM SELETOR */}
            <div className="bg-white dark:bg-[#0D1424] p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Evasão vs. Matrículas por Curso</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Desempenho comparativo entre cursos e oficinas
                  </p>
                </div>

                {/* SELETOR INTERATIVO DE TIPO DE GRÁFICO */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setTipoGraficoCursos('torre')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      tipoGraficoCursos === 'torre'
                        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Gráfico de Torre (Colunas Verticais)"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Torre</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoGraficoCursos('barras')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      tipoGraficoCursos === 'barras'
                        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Gráfico de Barras Horizontais"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Barras</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoGraficoCursos('tabela')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      tipoGraficoCursos === 'tabela'
                        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Tabela Analítica"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tabela</span>
                  </button>
                </div>
              </div>

              {/* Renderização Condicional Conforme Escolha do Usuário */}
              {tipoGraficoCursos === 'torre' && renderTowerChartCursos()}
              {tipoGraficoCursos === 'barras' && renderBarChartCursos()}
              {tipoGraficoCursos === 'tabela' && renderTableCursos()}
            </div>
          </div>
        </div>
      )}

      {/* BLOCO 3: SOMA DE PRESENÇAS E ASSIDUIDADE POR TURMA */}
      {abaAnalitica === 'frequencia' && (
        <div className="bg-white dark:bg-[#0D1424] p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Dashboard de Frequência Consolidada por Turma</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Soma total de presenças, faltas e identificação preventiva de risco de evasão
              </p>
            </div>

            {/* Seletor de Turma */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                Selecionar Turma:
              </label>
              <select
                value={turmaSelecionadaId || ''}
                onChange={(e) => handleSelectTurma(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
              >
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.escolaSigla}] {t.codigo} - {t.cursoNome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingTurma ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Calculando somatório de presenças da turma...</span>
            </div>
          ) : turmaDashboard ? (
            <div className="space-y-6">
              {/* Cabeçalho da Turma Selecionada */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                      {turmaDashboard.escolaSigla}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {turmaDashboard.turmaCodigo}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {turmaDashboard.cursoNome}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Escola: <strong>{turmaDashboard.escolaNome}</strong> • Modalidade:{' '}
                    {turmaDashboard.modalidade}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-500">
                      Total de Alunos:
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white font-mono">
                      {turmaDashboard.totalAlunos} matriculados
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-500">
                      Aulas Registradas:
                    </span>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {turmaDashboard.totalAulasRegistradas} aulas
                    </p>
                  </div>
                </div>
              </div>

              {/* Cards da Soma de Presenças */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-[#0A0F1D] p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Soma de Presenças
                  </span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                    {turmaDashboard.somaPresencas}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Presenças confirmadas
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#0A0F1D] p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Soma de Faltas
                  </span>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
                    {turmaDashboard.somaFaltas}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Faltas não justificadas
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#0A0F1D] p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Faltas Justificadas
                  </span>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    {turmaDashboard.somaJustificadas}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Abonadas com atestado
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#0A0F1D] p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Assiduidade da Turma
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 font-mono ${
                      turmaDashboard.taxaAssiduidadeTurma >= 75
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {turmaDashboard.taxaAssiduidadeTurma}%
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Presença global computada
                  </span>
                </div>
              </div>

              {/* Alertas Preventivos da Turma */}
              {(turmaDashboard.alunosEmRiscoFaltas > 0 ||
                turmaDashboard.alunosDesistentes > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {turmaDashboard.alunosEmRiscoFaltas > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 p-3.5 rounded-xl flex items-center gap-2.5 text-xs">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <strong>
                          {turmaDashboard.alunosEmRiscoFaltas} aluno(s) com 2 faltas consecutivas:
                        </strong>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                          Risco crítico. Mais 1 falta injustificada ativará o alerta de evasão.
                        </p>
                      </div>
                    </div>
                  )}
                  {turmaDashboard.alunosDesistentes > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 p-3.5 rounded-xl flex items-center gap-2.5 text-xs">
                      <UserX className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <div>
                        <strong>
                          {turmaDashboard.alunosDesistentes} aluno(s) com 3 faltas consecutivas:
                        </strong>
                        <p className="text-[11px] text-rose-700 dark:text-rose-300">
                          Protocolo das Escolas: contatar aluno/responsável por WhatsApp ou E-mail.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TABELA DE ALUNOS COM BARRA DE BUSCA E FILTROS RÁPIDOS */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                {/* Barra de Filtros e Busca */}
                <div className="bg-slate-50 dark:bg-[#0A0F1D] p-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar aluno por nome ou CPF..."
                        value={buscaAlunoTurma}
                        onChange={(e) => setBuscaAlunoTurma(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mr-1">
                      Filtrar:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiltroSituacaoTurma('todos')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        filtroSituacaoTurma === 'todos'
                          ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Todos ({turmaDashboard.alunos.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFiltroSituacaoTurma('risco')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        filtroSituacaoTurma === 'risco'
                          ? 'bg-amber-600 text-white shadow-2xs font-bold'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Em Risco (2+ faltas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFiltroSituacaoTurma('regulares')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        filtroSituacaoTurma === 'regulares'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Regulares
                    </button>
                  </div>
                </div>

                {alunosFiltrados.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                    Nenhum aluno encontrado com os critérios de busca selecionados.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5 px-4">Aluno</th>
                          <th className="py-2.5 px-4">CPF</th>
                          <th className="py-2.5 px-4 text-center">Aulas</th>
                          <th className="py-2.5 px-4 text-center">Presenças</th>
                          <th className="py-2.5 px-4 text-center">Faltas</th>
                          <th className="py-2.5 px-4 text-center">Faltas Seguidas</th>
                          <th className="py-2.5 px-4">Assiduidade</th>
                          <th className="py-2.5 px-4 text-center">Situação</th>
                          <th className="py-2.5 px-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {alunosFiltrados.map((aluno) => (
                          <tr
                            key={aluno.matriculaId}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{aluno.alunoNome}</span>
                                {aluno.menorDeIdade && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                                    Menor
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 font-medium">
                              {formatarCpfMascara(aluno.alunoCpf)}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300 font-mono">
                              {aluno.totalAulas}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              {aluno.presencas}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">
                              {aluno.faltas}
                            </td>
                            <td className="py-3 px-4 text-center font-mono">
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                  aluno.faltasConsecutivas >= 3
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                    : aluno.faltasConsecutivas === 2
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {aluno.faltasConsecutivas}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-28">
                                <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {aluno.porcentagemPresenca}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      aluno.porcentagemPresenca >= 75
                                        ? 'bg-emerald-500'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{
                                      width: `${aluno.porcentagemPresenca}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {aluno.atingiuLimiteFaltas ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  Crítico (3 Faltas)
                                </span>
                              ) : aluno.riscoDesistencia ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  Alerta (2 Faltas)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  Regular
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => onOpenPerfilAluno(aluno.alunoId)}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition shadow-2xs cursor-pointer"
                              >
                                Ver Perfil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Nenhuma turma selecionada.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
