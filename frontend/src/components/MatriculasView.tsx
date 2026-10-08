'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  X,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Matricula } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function getIniciaisAluno(nome?: string): string {
  if (!nome) return 'AL';
  const palavras = nome
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-zA-ZÀ-ÿ]/g, ''))
    .filter(Boolean);

  if (palavras.length === 0) return 'AL';
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
  return (palavras[0][0] + palavras[1][0]).toUpperCase();
}

function mascararCpf(cpf?: string): string {
  if (!cpf) return '—';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.***-${digits.slice(9, 11)}`;
}

function formatarCpfCompleto(cpf?: string): string {
  if (!cpf) return '—';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

const getDotColorPorEscola = (sigla?: string, codigoTurma?: string) => {
  const chave = (sigla || (codigoTurma ? codigoTurma.split('-')[0] : '')).toUpperCase();
  switch (chave) {
    case 'ELT':
      return 'bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.35)]';
    case 'ELD':
      return 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.35)]';
    case 'ELCV':
      return 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.35)]';
    case 'ELIA':
    case 'EMIA':
      return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.35)]';
    default:
      return 'bg-zinc-400';
  }
};

interface MatriculasViewProps {
  matriculas: Matricula[];
  escolaSelecionada: number | null;
  onNovaMatricula: () => void;
  onCancelarMatricula: (matriculaId: number) => Promise<void>;
  onOpenPerfilAluno: (alunoId: number) => void;
}

export function MatriculasView({
  matriculas,
  escolaSelecionada,
  onNovaMatricula,
  onCancelarMatricula,
  onOpenPerfilAluno,
}: MatriculasViewProps) {
  const [busca, setBusca] = useState('');
  const [filtroCanal, setFiltroCanal] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroEscolaSigla, setFiltroEscolaSigla] = useState('');
  const [cpfsRevelados, setCpfsRevelados] = useState<Record<number, boolean>>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);

  // Identificar quantidade de turmas por participante para remover estranhamento de linhas do mesmo aluno
  const matriculasPorAluno = useMemo(() => {
    const map = new Map<number, number>();
    matriculas.forEach((m) => {
      map.set(m.alunoId, (map.get(m.alunoId) || 0) + 1);
    });
    return map;
  }, [matriculas]);

  // Lista de siglas de escolas disponíveis para filtro por núcleo
  const escolasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    matriculas.forEach((m) => {
      if (m.escolaSigla) set.add(m.escolaSigla);
    });
    return Array.from(set).sort();
  }, [matriculas]);

  const contagens = useMemo(() => {
    return {
      total: matriculas.length,
      confirmada: matriculas.filter((m) => m.status === 'CONFIRMADA').length,
      cancelada: matriculas.filter((m) => m.status === 'CANCELADA').length,
      desistente: matriculas.filter((m) => m.status === 'DESISTENTE_FALTAS').length,
      concluida: matriculas.filter((m) => m.status === 'CONCLUIDA').length,
    };
  }, [matriculas]);

  // Filtragem dos registros
  const matriculasFiltradas = useMemo(() => {
    return matriculas.filter((m) => {
      if (busca.trim()) {
        const q = busca.toLowerCase();
        const matchNome = m.alunoNome?.toLowerCase().includes(q);
        const matchCpf =
          m.alunoCpf?.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
          m.alunoCpf?.toLowerCase().includes(q);
        const matchEmail = m.alunoEmail?.toLowerCase().includes(q);
        const matchTurma = m.turmaCodigo?.toLowerCase().includes(q);
        const matchCurso = m.cursoNome?.toLowerCase().includes(q);
        if (!matchNome && !matchCpf && !matchEmail && !matchTurma && !matchCurso) return false;
      }
      if (filtroCanal && m.canalOrigem !== filtroCanal) return false;
      if (filtroStatus && m.status !== filtroStatus) return false;
      if (filtroEscolaSigla && m.escolaSigla !== filtroEscolaSigla) return false;
      return true;
    });
  }, [matriculas, busca, filtroCanal, filtroStatus, filtroEscolaSigla]);

  // Resetar página quando qualquer filtro for alterado
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroCanal, filtroStatus, filtroEscolaSigla, itensPorPagina]);

  // Paginação
  const totalPaginas = Math.ceil(matriculasFiltradas.length / itensPorPagina) || 1;
  const matriculasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return matriculasFiltradas.slice(inicio, inicio + itensPorPagina);
  }, [matriculasFiltradas, paginaAtual, itensPorPagina]);

  const indiceInicio =
    matriculasFiltradas.length === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const indiceFim = Math.min(paginaAtual * itensPorPagina, matriculasFiltradas.length);

  const toggleRevelarCpf = (id: number) => {
    setCpfsRevelados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const temFiltroAtivo = Boolean(busca || filtroCanal || filtroStatus || filtroEscolaSigla);

  const renderStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMADA':
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Confirmada</span>
          </div>
        );
      case 'CONCLUIDA':
        return (
          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
            <span>Concluída</span>
          </div>
        );
      case 'CANCELADA':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Cancelada
          </span>
        );
      case 'DESISTENTE_FALTAS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Desistente
          </span>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
            <span>{status}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Secretaria de Matrículas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Histórico consolidado de estudantes matriculados, turmas e acompanhamento acadêmico.
          </p>
        </div>

        <button
          onClick={onNovaMatricula}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer self-start sm:self-auto active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Matrícula</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-[#121214] p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-[#27272a] shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome do aluno, CPF, turma ou curso..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-[#09090b] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor por Núcleo/Escola se não houver escola pré-fixada */}
          {!escolaSelecionada && escolasDisponiveis.length > 1 && (
            <div className="w-full sm:w-[150px]">
              <Select
                value={filtroEscolaSigla || 'ALL'}
                onValueChange={(val) => setFiltroEscolaSigla(val === 'ALL' ? '' : val)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Núcleo / Escola" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos Núcleos</SelectItem>
                  {escolasDisponiveis.map((sigla) => (
                    <SelectItem key={sigla} value={sigla}>
                      {sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Seletor shadcn UI: Canal de Origem */}
          <div className="w-full sm:w-[170px]">
            <Select
              value={filtroCanal || 'ALL'}
              onValueChange={(val) => setFiltroCanal(val === 'ALL' ? '' : val)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Canal de Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Canais</SelectItem>
                <SelectItem value="CULTURA_AZ">Cultura AZ</SelectItem>
                <SelectItem value="FORMS">Formulários</SelectItem>
                <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                <SelectItem value="PLANILHA">Planilha</SelectItem>
                <SelectItem value="SITE">Portal Web</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seletor shadcn UI: Status da Matrícula */}
          <div className="w-full sm:w-[175px]">
            <Select
              value={filtroStatus || 'ALL'}
              onValueChange={(val) => setFiltroStatus(val === 'ALL' ? '' : val)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" badge={contagens.total}>
                  Todos os Status
                </SelectItem>
                <SelectItem value="CONFIRMADA" badge={contagens.confirmada}>
                  Confirmadas
                </SelectItem>
                <SelectItem value="CANCELADA" badge={contagens.cancelada}>
                  Canceladas
                </SelectItem>
                {contagens.desistente > 0 && (
                  <SelectItem value="DESISTENTE_FALTAS" badge={contagens.desistente}>
                    Desistentes
                  </SelectItem>
                )}
                {contagens.concluida > 0 && (
                  <SelectItem value="CONCLUIDA" badge={contagens.concluida}>
                    Concluídas
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={() => {
                setBusca('');
                setFiltroCanal('');
                setFiltroStatus('');
                setFiltroEscolaSigla('');
              }}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-100 hover:bg-slate-200 dark:bg-[#18181b] dark:hover:bg-[#27272a] text-slate-700 dark:text-zinc-200 text-xs font-semibold transition cursor-pointer shrink-0"
              title="Limpar todos os filtros"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Matrículas Reestruturada */}
      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] shadow-xs overflow-hidden">
        {/* Barra superior de contagem rápida */}
        <div className="px-5 py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>
            Exibindo{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              {indiceInicio}–{indiceFim}
            </strong>{' '}
            de{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              {matriculasFiltradas.length}
            </strong>{' '}
            matrículas
            {matriculasFiltradas.length !== matriculas.length && (
              <span className="text-zinc-500"> (total cadastrado: {matriculas.length})</span>
            )}
          </span>
          <span className="text-[11px] text-zinc-500">
            Página {paginaAtual} de {totalPaginas}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <colgroup>
              <col className="w-[32%]" />
              <col className="w-[26%]" />
              <col className="w-[24%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="bg-slate-50/95 dark:bg-[#18181b]/95 backdrop-blur-xs text-[#8b8b95] font-semibold sticky top-0 z-10 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] uppercase tracking-[0.06em]">
              <tr>
                <th className="px-4 py-3">Nome do Participante</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Turma & Curso</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right sticky right-0 bg-slate-50/95 dark:bg-[#18181b]/95 z-20 backdrop-blur-xs">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {matriculasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 dark:text-zinc-500">
                    <p className="font-medium text-xs">
                      Nenhuma matrícula localizada com os filtros selecionados.
                    </p>
                  </td>
                </tr>
              ) : (
                matriculasPaginadas.map((m) => {
                  const iniciais = getIniciaisAluno(m.alunoNome);
                  const totalTurmasAluno = matriculasPorAluno.get(m.alunoId) || 1;
                  const cpfRevelado = Boolean(cpfsRevelados[m.id]);

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* 1. Nome do Participante (Avatar + Nome semibold + ID + Menor + Contador turmas) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#18181b] border border-slate-200/80 dark:border-[#27272a] text-slate-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center shrink-0">
                            {iniciais}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => onOpenPerfilAluno(m.alunoId)}
                                className="font-semibold text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[210px] text-left cursor-pointer"
                                title="Abrir prontuário do aluno"
                              >
                                {m.alunoNome}
                              </button>
                              {m.alunoMenorDeIdade && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                  Menor
                                </span>
                              )}
                              {totalTurmasAluno > 1 && (
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-normal bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/50 shrink-0"
                                  title={`Participante matriculado em ${totalTurmasAluno} turmas`}
                                >
                                  {totalTurmasAluno} turmas
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums font-normal mt-0.5">
                              ID #{m.alunoId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contato: E-mail em cima (com Resp. para menor) e CPF mascarado embaixo */}
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          {/* Linha 1: E-mail */}
                          {m.alunoMenorDeIdade ? (
                            <div
                              className="flex items-center gap-1 text-slate-800 dark:text-zinc-300 font-normal text-xs truncate max-w-[240px]"
                              title={
                                m.alunoEmail
                                  ? `Responsável: ${m.alunoEmail}`
                                  : 'Responsável sem e-mail'
                              }
                            >
                              <Shield className="w-3 h-3 text-amber-500/80 shrink-0" />
                              <span className="truncate">
                                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] mr-1">
                                  Resp.:
                                </span>
                                {m.alunoEmail || 'Não informado'}
                              </span>
                            </div>
                          ) : (
                            <div
                              className="text-slate-800 dark:text-zinc-300 font-normal text-xs truncate max-w-[240px]"
                              title={m.alunoEmail}
                            >
                              {m.alunoEmail || '—'}
                            </div>
                          )}

                          {/* Linha 2: CPF mascarado com revelar ao clicar */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-[#a1a1aa] dark:text-zinc-400 tabular-nums font-normal select-all">
                              {cpfRevelado
                                ? formatarCpfCompleto(m.alunoCpf)
                                : mascararCpf(m.alunoCpf)}
                            </span>
                            {m.alunoCpf && (
                              <button
                                type="button"
                                onClick={() => toggleRevelarCpf(m.id)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition p-0.5 cursor-pointer"
                                title={cpfRevelado ? 'Ocultar CPF' : 'Revelar CPF completo'}
                              >
                                {cpfRevelado ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Turma & Curso: Curso como principal, código em mono abaixo com ponto do núcleo */}
                      <td className="px-4 py-3">
                        <div
                          className="text-xs font-medium text-slate-900 dark:text-zinc-200 truncate max-w-[240px]"
                          title={m.cursoNome}
                        >
                          {m.cursoNome}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColorPorEscola(
                              m.escolaSigla,
                              m.turmaCodigo
                            )}`}
                            title={m.escolaSigla || 'Núcleo'}
                          />
                          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                            {m.turmaCodigo}
                          </span>
                        </div>
                      </td>

                      {/* 4. Status: Ponto colorido + texto alinhado à esquerda */}
                      <td className="px-4 py-3 text-left whitespace-nowrap">
                        {renderStatus(m.status)}
                      </td>

                      {/* 5. Ações: Sticky right para nunca vazar ou cortar */}
                      <td className="px-4 py-3 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-[#121214] group-hover:bg-slate-50/90 dark:group-hover:bg-[#161618] transition-colors z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenPerfilAluno(m.alunoId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700/70 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 transition cursor-pointer active:scale-95"
                            title="Abrir prontuário completo do aluno"
                          >
                            <span>Prontuário</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                          </button>

                          {m.status !== 'CANCELADA' && m.status !== 'DESISTENTE_FALTAS' && (
                            <button
                              type="button"
                              onClick={() => onCancelarMatricula(m.id)}
                              className="px-2 py-1 rounded-lg border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium transition cursor-pointer active:scale-95"
                              title="Cancelar matrícula"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação e Navegação */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-[#121214]">
          <div className="flex items-center gap-2">
            <span>
              Exibindo <strong className="font-semibold text-slate-800 dark:text-zinc-200">{indiceInicio}–{indiceFim}</strong> de{' '}
              <strong className="font-semibold text-slate-800 dark:text-zinc-200">{matriculasFiltradas.length}</strong> matrículas
              {matriculasFiltradas.length !== matriculas.length && (
                <span className="text-zinc-500"> (filtradas de {matriculas.length} totais)</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-[11px] text-zinc-500">Linhas por pág:</span>
              <select
                value={itensPorPagina}
                onChange={(e) => {
                  setItensPorPagina(Number(e.target.value));
                  setPaginaAtual(1);
                }}
                className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-700/70 rounded-md px-2 py-1 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={paginaAtual <= 1}
                onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700/60 bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 text-xs font-medium text-slate-700 dark:text-zinc-300">
                Pág. {paginaAtual} de {totalPaginas}
              </span>

              <button
                type="button"
                disabled={paginaAtual >= totalPaginas}
                onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700/60 bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
