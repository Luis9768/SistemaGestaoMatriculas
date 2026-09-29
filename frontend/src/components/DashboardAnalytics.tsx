'use client';

import React, { useState, useEffect } from 'react';
import { api, DashboardStats, TurmaDashboard, Turma, formatarCpfMascara, LoginResponse } from '@/lib/api';
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

export function DashboardAnalytics({ escolaId, turmas, onOpenPerfilAluno, usuarioLogado, onOpenLogin }: DashboardAnalyticsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Seletores do tipo de gráfico (Interatividade solicitada pelo usuário)
  const [tipoGraficoStatus, setTipoGraficoStatus] = useState<'pizza' | 'torre' | 'barras' | 'tabela'>('pizza');
  const [tipoGraficoCursos, setTipoGraficoCursos] = useState<'torre' | 'barras' | 'tabela'>('torre');

  // Separação de Informações (Evitar sobrecarga cognitiva): Geral vs. Frequência
  const [abaAnalitica, setAbaAnalitica] = useState<'geral' | 'frequencia'>('geral');

  // Visão por Turma (Soma de Presenças)
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<number | null>(null);
  const [turmaDashboard, setTurmaDashboard] = useState<TurmaDashboard | null>(null);
  const [loadingTurma, setLoadingTurma] = useState(false);

  // Filtros da lista de alunos na turma selecionada
  const [buscaAlunoTurma, setBuscaAlunoTurma] = useState('');
  const [filtroSituacaoTurma, setFiltroSituacaoTurma] = useState<'todos' | 'risco' | 'regulares'>('todos');

  // Hover compartilhado nos gráficos
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Carregar dados gerais
  useEffect(() => {
    if (usuarioLogado || api.getUsuarioSalvo()) {
      carregarStats();
    } else {
      setLoadingStats(false);
    }
  }, [escolaId, usuarioLogado]);

  // Ao mudar de turma ou inicializar com a primeira turma disponível
  useEffect(() => {
    if (turmas && turmas.length > 0 && (usuarioLogado || api.getUsuarioSalvo())) {
      const turmaInicial = turmaSelecionadaId && turmas.some((t) => t.id === turmaSelecionadaId)
        ? turmaSelecionadaId
        : turmas[0].id!;
      setTurmaSelecionadaId(turmaInicial);
      carregarDashboardTurma(turmaInicial);
    } else {
      setTurmaDashboard(null);
    }
  }, [turmas, usuarioLogado]);

  const carregarStats = async () => {
    try {
      setLoadingStats(true);
      setErro(null);
      const data = await api.getDashboardStats(escolaId || undefined);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const carregarDashboardTurma = async (idTurma: number) => {
    try {
      setLoadingTurma(true);
      const data = await api.getDashboardTurma(idTurma);
      setTurmaDashboard(data);
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
    if (!stats || !stats.distribuicaoStatus || stats.distribuicaoStatus.length === 0 || stats.totalGeral === 0) {
      return (
        <div className="flex items-center justify-center h-56 text-xs text-slate-400 italic">
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
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {stats.distribuicaoStatus.map((item) => {
              const strokeDasharray = `${(item.percentual / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
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
                const hoveredItem = stats.distribuicaoStatus.find((s) => s.status === hoveredSlice);
                return (
                  <div>
                    <span className="text-2xl font-black text-slate-800">{hoveredItem?.quantidade}</span>
                    <p className="text-xs text-slate-500 font-bold">{hoveredItem?.percentual}%</p>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{hoveredItem?.label}</span>
                  </div>
                );
              })()
            ) : (
              <div>
                <span className="text-2xl font-black text-slate-800">{stats.totalGeral}</span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Alunos</p>
                <span className="text-[10px] text-emerald-600 font-bold">100% registros</span>
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
              className={`flex items-center justify-between sm:justify-start gap-3 p-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                hoveredSlice === item.status ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: item.cor }}></span>
                <span className="text-slate-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 text-right ml-auto">
                <span className="font-semibold text-slate-900">{item.quantidade}</span>
                <span className="text-[11px] text-slate-400 w-12 text-right">({item.percentual}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 2. Gráfico de Torre / Colunas Verticais
  const renderTowerChartStatus = () => {
    if (!stats || !stats.distribuicaoStatus || stats.distribuicaoStatus.length === 0 || stats.totalGeral === 0) {
      return (
        <div className="flex items-center justify-center h-56 text-xs text-slate-400 italic">
          Nenhum dado registrado para gerar o gráfico de torre.
        </div>
      );
    }

    const maxValor = Math.max(...stats.distribuicaoStatus.map((d) => d.quantidade), 1);

    return (
      <div className="space-y-4 pt-2">
        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-3 pt-6 pb-2 border-b border-slate-200 relative bg-slate-50/50 rounded-xl">
          {/* Linhas de Grade Horizontais */}
          <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-200 pointer-events-none">
            <span className="text-[9px] text-slate-400 pl-2 -top-3.5 relative">Teto: {maxValor}</span>
          </div>
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200 pointer-events-none">
            <span className="text-[9px] text-slate-400 pl-2 -top-3.5 relative">50%: {Math.round(maxValor / 2)}</span>
          </div>

          {stats.distribuicaoStatus.map((item) => {
            const alturaPct = Math.max(Math.round((item.quantidade / maxValor) * 100), 8);
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
                  <span className="text-xs font-black text-slate-800 block">{item.quantidade}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.percentual}%</span>
                </div>

                {/* Coluna / Torre */}
                <div className="w-full max-w-[46px] bg-slate-200/60 rounded-t-xl overflow-hidden flex items-end h-full">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      isHovered ? 'brightness-110 shadow-md ring-2 ring-slate-400/50' : ''
                    }`}
                    style={{
                      height: `${alturaPct}%`,
                      backgroundColor: item.cor,
                    }}
                  ></div>
                </div>

                {/* Rótulo da Base */}
                <span className="text-[10px] font-semibold text-slate-600 mt-2 truncate w-full text-center">
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
              className={`flex items-center gap-1.5 p-1 rounded-lg transition cursor-pointer ${
                hoveredSlice === item.status ? 'bg-slate-100 font-bold' : ''
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: item.cor }}></span>
              <span className="truncate text-[11px] text-slate-700">{item.label}</span>
              <span className="text-[10px] text-slate-400 ml-auto">({item.percentual}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 3. Gráfico de Barras Horizontais
  const renderBarChartStatus = () => {
    if (!stats || !stats.distribuicaoStatus || stats.distribuicaoStatus.length === 0) return null;
    const maxValor = Math.max(...stats.distribuicaoStatus.map((d) => d.quantidade), 1);

    return (
      <div className="space-y-3 pt-2">
        {stats.distribuicaoStatus.map((item) => {
          const pct = Math.max(Math.round((item.quantidade / maxValor) * 100), 5);
          const isHovered = hoveredSlice === item.status;

          return (
            <div
              key={item.status}
              onMouseEnter={() => setHoveredSlice(item.status)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2.5 rounded-xl transition cursor-pointer border ${
                isHovered ? 'bg-slate-100/90 border-slate-300 shadow-2xs' : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shadow-2xs" style={{ backgroundColor: item.cor }}></span>
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">{item.quantidade}</span>
                  <span className="text-[11px] font-semibold text-slate-400">({item.percentual}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
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
    if (!stats || !stats.distribuicaoStatus || stats.distribuicaoStatus.length === 0) return null;

    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Status / Categoria</th>
              <th className="py-2.5 px-3 text-right">Alunos</th>
              <th className="py-2.5 px-3 text-right">Percentual</th>
              <th className="py-2.5 px-3">Proporção Visual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.distribuicaoStatus.map((item) => (
              <tr key={item.status} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shadow-2xs" style={{ backgroundColor: item.cor }}></span>
                  <span>{item.label}</span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.quantidade}</td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-600">{item.percentual}%</td>
                <td className="py-2.5 px-3">
                  <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(item.percentual, 4)}%`, backgroundColor: item.cor }}
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
        <div className="flex items-center justify-center h-56 text-xs text-slate-400 italic">
          Nenhum curso disponível para comparação em torre.
        </div>
      );
    }

    const maxValor = Math.max(
      ...stats.cursosStats.map((c) => Math.max(c.totalMatriculas, c.totalInscricoes, c.totalEvasoes, 1))
    );

    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-end gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Matrículas
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span> Inscrições
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> Evasões
          </span>
        </div>

        <div className="h-56 flex items-end justify-between gap-3 px-3 pt-6 pb-2 border-b border-slate-200 relative bg-slate-50/50 rounded-xl overflow-x-auto">
          {/* Linha Guia */}
          <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-200 pointer-events-none">
            <span className="text-[9px] text-slate-400 pl-2 -top-3.5 relative">Teto: {maxValor}</span>
          </div>

          {stats.cursosStats.map((curso) => {
            const hMatricula = Math.max(Math.round((curso.totalMatriculas / maxValor) * 100), 6);
            const hInscricao = Math.max(Math.round((curso.totalInscricoes / maxValor) * 100), 6);
            const hEvasao = Math.max(Math.round((curso.totalEvasoes / maxValor) * 100), curso.totalEvasoes > 0 ? 6 : 0);

            return (
              <div key={curso.cursoId} className="flex-1 min-w-[70px] flex flex-col items-center h-full justify-end group">
                {/* Cluster de Torres */}
                <div className="flex items-end justify-center gap-1 w-full h-full">
                  {/* Torre 1: Matrículas */}
                  <div className="w-3.5 sm:w-4 bg-slate-200/50 rounded-t flex items-end h-full">
                    <div
                      className="w-full bg-emerald-500 rounded-t transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${hMatricula}%` }}
                      title={`Matrículas: ${curso.totalMatriculas}`}
                    ></div>
                  </div>

                  {/* Torre 2: Inscrições */}
                  <div className="w-3.5 sm:w-4 bg-slate-200/50 rounded-t flex items-end h-full">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${hInscricao}%` }}
                      title={`Inscrições: ${curso.totalInscricoes}`}
                    ></div>
                  </div>

                  {/* Torre 3: Evasões */}
                  <div className="w-3.5 sm:w-4 bg-slate-200/50 rounded-t flex items-end h-full">
                    <div
                      className="w-full bg-rose-500 rounded-t transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${hEvasao}%` }}
                      title={`Evasões: ${curso.totalEvasoes}`}
                    ></div>
                  </div>
                </div>

                {/* Identificação na Base */}
                <div className="mt-2 text-center w-full">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                    {curso.escolaSigla}
                  </span>
                  <p className="text-[10px] text-slate-600 truncate w-full mt-0.5 font-medium" title={curso.cursoNome}>
                    {curso.cursoNome.split(' ')[0]}
                  </p>
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

    const maxValor = Math.max(
      ...stats.cursosStats.map((c) => Math.max(c.totalMatriculas, c.totalInscricoes, c.totalEvasoes, 1))
    );

    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-end gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Matrículas
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span> Inscrições
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> Evasões
          </span>
        </div>

        <div className="space-y-3">
          {stats.cursosStats.map((curso) => {
            const pctMatricula = Math.round((curso.totalMatriculas / maxValor) * 100);
            const pctInscricao = Math.round((curso.totalInscricoes / maxValor) * 100);
            const pctEvasao = Math.round((curso.totalEvasoes / maxValor) * 100);

            return (
              <div key={curso.cursoId} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {curso.escolaSigla}
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-xs">{curso.cursoNome}</span>
                  </div>
                  {curso.totalEvasoes > 0 ? (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Taxa Evasão: {curso.taxaEvasao}%
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Zero Evasão
                    </span>
                  )}
                </div>

                {/* Barras Comparativas */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-20 text-slate-500 text-[10px]">Matrículas ({curso.totalMatriculas})</span>
                    <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pctMatricula, 3)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-20 text-slate-500 text-[10px]">Inscrições ({curso.totalInscricoes})</span>
                    <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pctInscricao, 3)}%` }}
                      ></div>
                    </div>
                  </div>

                  {curso.totalEvasoes > 0 && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-20 text-slate-500 text-[10px]">Evasões ({curso.totalEvasoes})</span>
                      <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pctEvasao, 3)}%` }}
                        ></div>
                      </div>
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
      <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Escola / Curso</th>
              <th className="py-2.5 px-3 text-center">Inscrições</th>
              <th className="py-2.5 px-3 text-center">Matrículas</th>
              <th className="py-2.5 px-3 text-center">Evasões</th>
              <th className="py-2.5 px-3 text-right">Taxa Evasão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.cursosStats.map((curso) => (
              <tr key={curso.cursoId} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                      {curso.escolaSigla}
                    </span>
                    <span>{curso.cursoNome}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{curso.modalidade}</span>
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-blue-600">{curso.totalInscricoes}</td>
                <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{curso.totalMatriculas}</td>
                <td className="py-2.5 px-3 text-center font-bold text-rose-600">{curso.totalEvasoes}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    curso.taxaEvasao > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                  }`}>
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
  const alunosFiltrados = turmaDashboard?.alunos.filter((aluno) => {
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

      {/* SELETOR DE ESCOPO ANALÍTICO (SEPARAÇÃO DE INFORMAÇÕES) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Painel de Indicadores</h2>
          <p className="text-xs text-slate-500">Alterne entre a visão macro de matrículas e o acompanhamento de frequência por turma</p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setAbaAnalitica('geral')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              abaAnalitica === 'geral'
                ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Geral de Matrículas
          </button>
          <button
            type="button"
            onClick={() => setAbaAnalitica('frequencia')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              abaAnalitica === 'frequencia'
                ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Frequência por Turma</span>
            {turmaDashboard && turmaDashboard.alunosEmRiscoFaltas > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
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
            <h2 className="text-lg font-bold text-slate-800">Painel Executivo de Evasões e Matrículas</h2>
            <p className="text-xs text-slate-500">
              Visão quantitativa de candidatos, matriculados, formados e desistências por faltas
            </p>
          </div>
          <button
            onClick={carregarStats}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title="Atualizar estatísticas"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {loadingStats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Matrículas Ativas */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matrículas Ativas</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-800">{stats.totalMatriculados}</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Cursando
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Ocupação de vagas: <strong>{stats.taxaOcupacaoVagas}%</strong> ({stats.vagasOcupadas}/{stats.totalVagas})
              </p>
            </div>

            {/* Card 2: Evasões / Desistências por Falta */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evasões (3 Faltas)</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-rose-600">{stats.totalEvasoes}</span>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Taxa: {stats.taxaEvasao}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Alunos desligados por 3 faltas consecutivas
              </p>
            </div>

            {/* Card 3: Inscrições em Andamento */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inscrições & Seleção</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-blue-600">{stats.totalInscricoes}</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Candidatos
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Fila de espera: <strong>{stats.totalFilaEspera}</strong> aguardando
              </p>
            </div>

            {/* Card 4: Formados / Concluídos */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Formados / Concluídos</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-amber-600">{stats.totalFormados}</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Êxito: {stats.taxaConclusao}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Concluíram ciclos formativos com sucesso
              </p>
            </div>

          </div>
        ) : null}
      </div>

      {/* BLOCO 2: GRÁFICOS INTERATIVOS COM SELETOR DE VISUALIZAÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: DISTRIBUIÇÃO DE ALUNOS COM SELETOR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>Distribuição de Status dos Alunos</span>
              </h3>
              <p className="text-xs text-slate-500">Proporção visual de alunos ativos, desistentes e formados</p>
            </div>

            {/* SELETOR INTERATIVO DE TIPO DE GRÁFICO */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTipoGraficoStatus('pizza')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                  tipoGraficoStatus === 'pizza'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gráfico de Pizza / Donut"
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span>Pizza</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoGraficoStatus('torre')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                  tipoGraficoStatus === 'torre'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gráfico de Torre (Colunas Verticais)"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Torre</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoGraficoStatus('barras')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                  tipoGraficoStatus === 'barras'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gráfico de Barras Horizontais"
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Barras</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoGraficoStatus('tabela')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                  tipoGraficoStatus === 'tabela'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Evasão vs. Matrículas por Curso</span>
              </h3>
              <p className="text-xs text-slate-500">Desempenho comparativo entre cursos e oficinas</p>
            </div>

            {/* SELETOR INTERATIVO DE TIPO DE GRÁFICO */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTipoGraficoCursos('torre')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                  tipoGraficoCursos === 'torre'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gráfico de Torre (Colunas Verticais)"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Torre</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoGraficoCursos('barras')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                  tipoGraficoCursos === 'barras'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Gráfico de Barras Horizontais"
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Barras</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoGraficoCursos('tabela')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                  tipoGraficoCursos === 'tabela'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
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
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Dashboard de Frequência Consolidada por Turma</span>
            </h3>
            <p className="text-xs text-slate-500">
              Soma total de presenças, faltas e identificação preventiva de risco de evasão
            </p>
          </div>

          {/* Seletor de Turma */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Selecionar Turma:</label>
            <select
              value={turmaSelecionadaId || ''}
              onChange={(e) => handleSelectTurma(Number(e.target.value))}
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 shadow-2xs"
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
          <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Calculando somatório de presenças da turma...</span>
          </div>
        ) : turmaDashboard ? (
          <div className="space-y-6">

            {/* Cabeçalho da Turma Selecionada */}
            <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                    {turmaDashboard.escolaSigla}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {turmaDashboard.turmaCodigo}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{turmaDashboard.cursoNome}</h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Escola: <strong>{turmaDashboard.escolaNome}</strong> • Modalidade: {turmaDashboard.modalidade}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="text-slate-400">Total de Alunos:</span>
                  <p className="font-bold text-slate-800">{turmaDashboard.totalAlunos} matriculados</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Aulas Registradas:</span>
                  <p className="font-bold text-indigo-700">{turmaDashboard.totalAulasRegistradas} aulas</p>
                </div>
              </div>
            </div>

            {/* Cards da Soma de Presenças */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center hover:border-slate-300 transition">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Soma de Presenças</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {turmaDashboard.somaPresencas}
                </div>
                <span className="text-[10px] text-slate-400">Presenças confirmadas</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center hover:border-slate-300 transition">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Soma de Faltas</span>
                <div className="text-2xl font-extrabold text-rose-600 mt-1">
                  {turmaDashboard.somaFaltas}
                </div>
                <span className="text-[10px] text-slate-400">Faltas não justificadas</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center hover:border-slate-300 transition">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Faltas Justificadas</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  {turmaDashboard.somaJustificadas}
                </div>
                <span className="text-[10px] text-slate-400">Abonadas com atestado</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center hover:border-slate-300 transition">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Assiduidade da Turma</span>
                <div className={`text-2xl font-extrabold mt-1 ${
                  turmaDashboard.taxaAssiduidadeTurma >= 75 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {turmaDashboard.taxaAssiduidadeTurma}%
                </div>
                <span className="text-[10px] text-slate-400">Presença global computada</span>
              </div>

            </div>

            {/* Alertas Preventivos da Turma (se houver alunos em risco) */}
            {(turmaDashboard.alunosEmRiscoFaltas > 0 || turmaDashboard.alunosDesistentes > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {turmaDashboard.alunosEmRiscoFaltas > 0 && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl flex items-center gap-2.5 text-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <strong>{turmaDashboard.alunosEmRiscoFaltas} aluno(s) com 2 faltas consecutivas:</strong>
                      <p className="text-[11px] text-amber-700">Risco crítico. Mais 1 falta injustificada ativará o alerta de evasão.</p>
                    </div>
                  </div>
                )}
                {turmaDashboard.alunosDesistentes > 0 && (
                  <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3 rounded-xl flex items-center gap-2.5 text-xs">
                    <UserX className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <strong>{turmaDashboard.alunosDesistentes} aluno(s) com 3 faltas consecutivas:</strong>
                      <p className="text-[11px] text-rose-700">Protocolo das Escolas: contatar aluno/responsável por WhatsApp ou E-mail antes do desligamento.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TABELA DE ALUNOS COM BARRA DE BUSCA E FILTROS RÁPIDOS */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              
              {/* Barra de Filtros e Busca */}
              <div className="bg-slate-50 p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar aluno por nome ou CPF..."
                      value={buscaAlunoTurma}
                      onChange={(e) => setBuscaAlunoTurma(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
                  <span className="text-[11px] text-slate-500 font-semibold mr-1">Filtrar:</span>
                  <button
                    type="button"
                    onClick={() => setFiltroSituacaoTurma('todos')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      filtroSituacaoTurma === 'todos'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Todos ({turmaDashboard.alunos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroSituacaoTurma('risco')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      filtroSituacaoTurma === 'risco'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    Em Risco (2+ faltas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroSituacaoTurma('regulares')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      filtroSituacaoTurma === 'regulares'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Regulares
                  </button>
                </div>
              </div>

              {alunosFiltrados.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Nenhum aluno encontrado com os critérios de busca selecionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
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
                    <tbody className="divide-y divide-slate-100">
                      {alunosFiltrados.map((aluno) => (
                        <tr key={aluno.matriculaId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{aluno.alunoNome}</span>
                              {aluno.menorDeIdade && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                                  Menor
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 font-medium">{formatarCpfMascara(aluno.alunoCpf)}</td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-700">{aluno.totalAulas}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600">{aluno.presencas}</td>
                          <td className="py-3 px-4 text-center font-bold text-rose-600">{aluno.faltas}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              aluno.faltasConsecutivas >= 3
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : aluno.faltasConsecutivas === 2
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'text-slate-700'
                            }`}>
                              {aluno.faltasConsecutivas}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-28">
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="font-bold text-slate-700">{aluno.porcentagemPresenca}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    aluno.porcentagemPresenca >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${aluno.porcentagemPresenca}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {aluno.atingiuLimiteFaltas ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDEBEC] text-[#9F2F2D] border border-rose-200/80">
                                Crítico (3 Faltas)
                              </span>
                            ) : aluno.riscoDesistencia ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FBF3DB] text-[#956400] border border-amber-200/80">
                                Alerta (2 Faltas)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF3EC] text-[#346538] border border-emerald-200/80">
                                Regular
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onOpenPerfilAluno(aluno.alunoId)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition shadow-2xs"
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
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhuma turma selecionada.
          </div>
        )}

      </div>
      )}

    </div>
  );
}
