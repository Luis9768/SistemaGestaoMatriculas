'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react';
import { api, RelatorioPrefeituraData, AlunoAtivoPrefeitura } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { getSchoolThemeColors } from '@/lib/escolaUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RelatorioPrefeituraViewProps {
  escolaId?: number | null;
  onOpenPerfilAluno: (alunoId: number) => void;
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

export function RelatorioPrefeituraView({
  escolaId,
  onOpenPerfilAluno,
}: RelatorioPrefeituraViewProps) {
  const { escolaAtualObj, escolas } = useApp();
  const schoolTheme = getSchoolThemeColors(escolaAtualObj?.sigla);

  const [relatorio, setRelatorio] = useState<RelatorioPrefeituraData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros locais da lista nominal
  const [filtroEscolaId, setFiltroEscolaId] = useState<string>(
    escolaId ? String(escolaId) : 'ALL'
  );
  const [filtroModalidade, setFiltroModalidade] = useState<'TODAS' | 'FORMACAO' | 'NUCLEO' | 'OFICINA'>('TODAS');
  const [incluirEvasoesNaLista, setIncluirEvasoesNaLista] = useState(false);
  const [busca, setBusca] = useState('');
  const [cpfsRevelados, setCpfsRevelados] = useState<Record<number, boolean>>({});

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);

  const carregarRelatorio = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const idParaConsulta = filtroEscolaId === 'ALL' ? undefined : Number(filtroEscolaId);
      const data = await api.getRelatorioPrefeitura(idParaConsulta);
      setRelatorio(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar relatório da prefeitura:', err);
      setErro('Não foi possível carregar os dados do relatório. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  }, [filtroEscolaId]);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  // Se a escola selecionada globalmente mudar no cabeçalho
  useEffect(() => {
    if (escolaId) {
      setFiltroEscolaId(String(escolaId));
    }
  }, [escolaId]);

  // Toggle revelação de CPF individual
  const toggleRevelarCpf = (id: number) => {
    setCpfsRevelados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Base completa de alunos conforme inclusão ou não de evasões
  const listaBrutaAlunos = useMemo(() => {
    if (!relatorio) return [];
    let base = [...(relatorio.alunosAtivos || [])];
    if (incluirEvasoesNaLista && relatorio.alunosEvasoes) {
      base = [...base, ...relatorio.alunosEvasoes];
    }
    return base;
  }, [relatorio, incluirEvasoesNaLista]);

  // Filtragem dos alunos
  const alunosFiltrados = useMemo(() => {
    return listaBrutaAlunos.filter((item) => {
      if (filtroModalidade !== 'TODAS' && item.modalidade !== filtroModalidade) {
        return false;
      }
      if (busca.trim()) {
        const q = busca.toLowerCase();
        const matchNome = item.alunoNome?.toLowerCase().includes(q);
        const matchCurso = item.cursoNome?.toLowerCase().includes(q);
        const matchTurma = item.turmaCodigo?.toLowerCase().includes(q);
        const matchEscola = item.escolaSigla?.toLowerCase().includes(q);
        const matchEmail = item.alunoEmail?.toLowerCase().includes(q);
        const matchCodMat = item.codigoMatricula?.toLowerCase().includes(q);
        const matchCpf =
          item.alunoCpf?.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
          item.alunoCpf?.toLowerCase().includes(q);
        if (!matchNome && !matchCurso && !matchTurma && !matchEscola && !matchEmail && !matchCodMat && !matchCpf) {
          return false;
        }
      }
      return true;
    });
  }, [listaBrutaAlunos, filtroModalidade, busca]);

  // Resetar para página 1 ao filtrar
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroModalidade, incluirEvasoesNaLista, busca, filtroEscolaId, itensPorPagina]);

  const totalPaginas = Math.ceil(alunosFiltrados.length / itensPorPagina) || 1;
  const alunosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return alunosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [alunosFiltrados, paginaAtual, itensPorPagina]);

  const indiceInicio = alunosFiltrados.length === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const indiceFim = Math.min(paginaAtual * itensPorPagina, alunosFiltrados.length);

  // 1. Exportar CSV do Quadro Consolidado Numérico
  const handleExportarTabelaResumoCSV = () => {
    if (!relatorio) return;
    const headers = [
      'Sigla',
      'Escola Livre',
      'Matriculados em Formacao (Ativos)',
      'Matriculados em Nucleo (Ativos)',
      'Matriculados em Oficina (Ativos)',
      'Total Matriculados Ativos (Sem Formandos)',
      'Total Desistencias',
      'Taxa de Desistencia (%)',
    ];
    const rows = relatorio.escolas.map((e) => [
      e.escolaSigla,
      `"${e.escolaNome}"`,
      e.matriculadosFormacao,
      e.matriculadosNucleo,
      e.matriculadosOficina,
      e.totalMatriculadosAtivos,
      e.totalDesistencias,
      `${e.taxaDesistencia}%`,
    ]);
    rows.push([
      'TOTAL GERAL',
      '"CONSOLIDADO"',
      relatorio.totalRedeFormacao,
      relatorio.totalRedeNucleo,
      relatorio.totalRedeOficina,
      relatorio.totalRedeMatriculadosAtivos,
      relatorio.totalRedeDesistencias,
      `${relatorio.taxaRedeDesistencia}%`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-prefeitura-resumo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Exportar Excel/CSV da Lista Nominal Massiva
  const handleExportarNominalExcel = (incluirEvasoes = false) => {
    if (!relatorio) return;

    let lista = [...(relatorio.alunosAtivos || [])];
    if (incluirEvasoes && relatorio.alunosEvasoes) {
      lista = [...lista, ...relatorio.alunosEvasoes];
    }

    const headers = [
      'Codigo de Matricula',
      'Nome do Aluno',
      'Curso Matriculado',
      'Modalidade',
      'Codigo da Turma',
      'Escola Sigla',
      'Escola Nome',
      'CPF',
      'E-mail',
      'Telefone',
      'Data da Matricula',
      'Origem da Matricula',
      'Situacao / Status',
    ];

    const rows = lista.map((a) => {
      const codMatricula = a.codigoMatricula || `MAT-${String(a.matriculaId).padStart(5, '0')}`;
      const modDesc =
        a.modalidade === 'FORMACAO' ? 'Formação' : a.modalidade === 'NUCLEO' ? 'Núcleo' : 'Oficina';
      const situacao =
        a.statusDescricao ||
        (a.statusMatricula === 'CONFIRMADA'
          ? 'Matriculado Ativo'
          : a.statusMatricula || 'Matriculado Ativo');

      return [
        `"${codMatricula}"`,
        `"${a.alunoNome || ''}"`,
        `"${a.cursoNome || ''}"`,
        `"${modDesc}"`,
        `"${a.turmaCodigo || ''}"`,
        `"${a.escolaSigla || ''}"`,
        `"${a.escolaNome || ''}"`,
        `"${a.alunoCpf ? formatarCpfCompleto(a.alunoCpf) : ''}"`,
        `"${a.alunoEmail || ''}"`,
        `"${a.alunoTelefone || ''}"`,
        `"${a.dataMatricula || '-'}"`,
        `"${a.canalOrigem || 'PRESENCIAL'}"`,
        `"${situacao}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sufixo = incluirEvasoes ? 'ativos-com-evasoes' : 'alunos-matriculados-ativos';
    a.download = `relatorio-${sufixo}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── Cabeçalho ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Relatório de Alunos Matriculados
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Consolidado por Escola & Modalidade para prestação de contas mensal e exportação de dados massivos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportarNominalExcel(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow transition cursor-pointer"
            title="Exportar alunos com matrícula confirmada ativa em formato Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Matriculados (Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportarNominalExcel(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1f1f23] dark:hover:bg-[#27272a] text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-[#27272a] text-xs font-semibold transition cursor-pointer"
            title="Exportar planilha incluindo desistentes e cancelados"
          >
            <Download className="w-4 h-4" />
            <span>Com Evasões</span>
          </button>

          <button
            type="button"
            onClick={handleExportarTabelaResumoCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white hover:bg-slate-50 dark:bg-[#121214] dark:hover:bg-[#18181b] text-slate-700 dark:text-zinc-300 text-xs font-medium transition cursor-pointer"
            title="Baixar resumo quantitativo em CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Tabela Resumo (CSV)</span>
          </button>

          <button
            type="button"
            onClick={carregarRelatorio}
            className="p-2 rounded-xl border border-slate-200 dark:border-[#27272a] bg-white hover:bg-slate-50 dark:bg-[#121214] dark:hover:bg-[#18181b] text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {erro && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <span>{erro}</span>
          <button
            onClick={carregarRelatorio}
            className="underline font-semibold cursor-pointer ml-3"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* ─── 1. Quadro Numérico Consolidado por Escola & Modalidade ─── */}
      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#27272a]/60 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
              Quadro Quantitativo por Escola Livre & Modalidade
            </h3>
            {relatorio && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {relatorio.totalRedeMatriculadosAtivos} ativos
              </span>
            )}
          </div>

          {/* Filtro de Unidade */}
          {escolas.length > 1 && (
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <Select
                value={filtroEscolaId}
                onValueChange={(val) => setFiltroEscolaId(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todas as Escolas Livres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas as Escolas (Rede)</SelectItem>
                  {escolas.map((esc) => (
                    <SelectItem key={esc.id} value={String(esc.id)}>
                      {esc.sigla} - {esc.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="border border-slate-100 dark:border-[#27272a]/80 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-[#09090b]/60 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-100 dark:border-[#27272a]/80">
                <tr>
                  <th className="py-3 px-4">Escola Livre (Unidade)</th>
                  <th className="py-3 px-3 text-center font-mono">Formação</th>
                  <th className="py-3 px-3 text-center font-mono">Núcleo</th>
                  <th className="py-3 px-3 text-center font-mono">Oficina</th>
                  <th className="py-3 px-4 text-center font-mono text-slate-700 dark:text-zinc-200">
                    Total Matriculados Ativos
                  </th>
                  <th className="py-3 px-3 text-center font-mono">Desistências (Nº)</th>
                  <th className="py-3 px-4 text-right font-mono">Taxa de Desistência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]/50">
                {loading && !relatorio ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Carregando dados da rede...
                    </td>
                  </tr>
                ) : !relatorio || relatorio.escolas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      Nenhuma escola encontrada para a exibição.
                    </td>
                  </tr>
                ) : (
                  relatorio.escolas.map((esc) => (
                    <tr
                      key={esc.escolaId}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {esc.escolaSigla}
                          </span>
                          <span className="text-slate-500 dark:text-zinc-400">
                            {esc.escolaNome}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 dark:text-zinc-300">
                        {esc.matriculadosFormacao}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 dark:text-zinc-300">
                        {esc.matriculadosNucleo}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 dark:text-zinc-300">
                        {esc.matriculadosOficina}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-slate-900 dark:text-white">
                        {esc.totalMatriculadosAtivos}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-600 dark:text-zinc-400">
                        {esc.totalDesistencias}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200/70 dark:border-[#27272a] text-xs font-semibold">
                          {esc.taxaDesistencia}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {relatorio && (
                <tfoot className="bg-slate-50/90 dark:bg-[#18181b]/70 border-t border-slate-200/80 dark:border-[#27272a] font-bold text-slate-900 dark:text-white">
                  <tr>
                    <td className="py-3 px-4 uppercase tracking-wider text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      Total Consolidado ({relatorio.escolas.length}{' '}
                      {relatorio.escolas.length === 1 ? 'escola' : 'escolas'})
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {relatorio.totalRedeFormacao}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {relatorio.totalRedeNucleo}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {relatorio.totalRedeOficina}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold">
                      {relatorio.totalRedeMatriculadosAtivos}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-zinc-400">
                      {relatorio.totalRedeDesistencias}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-white dark:bg-[#09090b] text-slate-900 dark:text-white border border-slate-200/80 dark:border-[#27272a] text-xs font-bold">
                        {relatorio.taxaRedeDesistencia}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* ─── 2. Relação Nominal Completa dos Alunos ─── */}
      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-5 sm:p-6 shadow-xs space-y-4">
        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#09090b]/60 p-3.5 rounded-xl border border-slate-100 dark:border-[#27272a]/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'TODAS', label: 'Todas Modalidades' },
                { id: 'FORMACAO', label: 'Formação' },
                { id: 'NUCLEO', label: 'Núcleo' },
                { id: 'OFICINA', label: 'Oficina' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFiltroModalidade(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filtroModalidade === tab.id
                    ? 'bg-white dark:bg-[#27272a] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <span className="h-4 w-px bg-slate-200 dark:bg-zinc-700 mx-1 hidden sm:inline-block" />

            <button
              type="button"
              onClick={() => setIncluirEvasoesNaLista((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                incluirEvasoesNaLista
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-[#18181b] border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-zinc-300'
              }`}
            >
              {incluirEvasoesNaLista ? 'Exibindo com Evasões' : 'Apenas Matriculados Ativos'}
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, turma..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Resumo de Contagem */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
          <span>
            Exibindo{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              {indiceInicio}–{indiceFim}
            </strong>{' '}
            de{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              {alunosFiltrados.length}
            </strong>{' '}
            registros
          </span>
          <span className="text-[11px] text-zinc-500">
            Página {paginaAtual} de {totalPaginas}
          </span>
        </div>

        {/* Tabela Nominal */}
        <div className="border border-slate-100 dark:border-[#27272a]/80 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-50/70 dark:bg-[#09090b]/60 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-100 dark:border-[#27272a]/80">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Escola</th>
                  <th className="py-2.5 px-3">Modalidade</th>
                  <th className="py-2.5 px-3">Curso & Turma</th>
                  <th className="py-2.5 px-3">Aluno Matriculado</th>
                  <th className="py-2.5 px-3 font-mono">CPF</th>
                  <th className="py-2.5 px-3">Contato</th>
                  <th className="py-2.5 px-3">Situação</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]/50">
                {alunosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                      Nenhum aluno encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  alunosPaginados.map((item) => {
                    const codMatricula =
                      item.codigoMatricula || `MAT-${String(item.matriculaId).padStart(5, '0')}`;
                    const cpfRevelado = Boolean(cpfsRevelados[item.matriculaId]);
                    const isAtivo =
                      item.statusMatricula === 'CONFIRMADA' || !item.statusMatricula;

                    return (
                      <tr
                        key={item.matriculaId}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-medium text-zinc-500 dark:text-zinc-400 text-[11px]">
                          {codMatricula}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-zinc-200">
                          {item.escolaSigla}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-zinc-300 border border-slate-200/70 dark:border-[#27272a] text-[10px] font-semibold uppercase font-mono">
                            {item.modalidade === 'FORMACAO'
                              ? 'Formação'
                              : item.modalidade === 'NUCLEO'
                              ? 'Núcleo'
                              : 'Oficina'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {item.cursoNome}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Turma: {item.turmaCodigo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          <button
                            type="button"
                            onClick={() => onOpenPerfilAluno(item.alunoId)}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition text-left cursor-pointer"
                            title="Abrir dossiê do aluno"
                          >
                            {item.alunoNome}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>
                              {cpfRevelado
                                ? formatarCpfCompleto(item.alunoCpf)
                                : mascararCpf(item.alunoCpf)}
                            </span>
                            {item.alunoCpf && (
                              <button
                                type="button"
                                onClick={() => toggleRevelarCpf(item.matriculaId)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
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
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400 text-[11px]">
                          <div>{item.alunoEmail || '—'}</div>
                          {item.alunoTelefone && (
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {item.alunoTelefone}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isAtivo ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Matriculado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              {item.statusDescricao || item.statusMatricula || 'Evasão'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenPerfilAluno(item.alunoId)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#18181b] hover:bg-slate-200 dark:hover:bg-[#27272a] text-slate-700 dark:text-zinc-200 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Dossiê
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

        {/* Controles de Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#18181b] transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#18181b] transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
