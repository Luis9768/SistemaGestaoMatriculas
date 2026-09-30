'use client';

import React, { useState } from 'react';
import { Search, Plus, X, User } from 'lucide-react';
import { Matricula, formatarCpfMascara } from '@/lib/api';

interface MatriculasViewProps {
  matriculas: Matricula[];
  escolaSelecionada: number | null;
  onNovaMatricula: () => void;
  onPromoverSuplente: (matriculaId: number, alunoNome: string) => Promise<void>;
  onCancelarMatricula: (matriculaId: number) => Promise<void>;
  onOpenPerfilAluno: (alunoId: number) => void;
}

export function MatriculasView({
  matriculas,
  escolaSelecionada,
  onNovaMatricula,
  onPromoverSuplente,
  onCancelarMatricula,
  onOpenPerfilAluno,
}: MatriculasViewProps) {
  const [busca, setBusca] = useState('');
  const [filtroCanal, setFiltroCanal] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const matriculasFiltradas = matriculas.filter((m) => {
    if (busca.trim()) {
      const q = busca.toLowerCase();
      const matchNome = m.alunoNome.toLowerCase().includes(q);
      const matchCpf = m.alunoCpf?.toLowerCase().includes(q);
      const matchTurma = m.turmaCodigo?.toLowerCase().includes(q);
      const matchCurso = m.cursoNome?.toLowerCase().includes(q);
      if (!matchNome && !matchCpf && !matchTurma && !matchCurso) return false;
    }
    if (filtroCanal && m.canalOrigem !== filtroCanal) return false;
    if (filtroStatus && m.status !== filtroStatus) return false;
    return true;
  });

  const getEscolaBadge = (sigla?: string) => {
    switch (sigla?.toUpperCase()) {
      case 'ELT':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60';
      case 'ELD':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60';
      case 'ELCV':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60';
      case 'ELIA':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMADA':
        return {
          label: 'Confirmada',
          style:
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
        };
      case 'INSCRITO':
        return {
          label: 'Inscrito',
          style:
            'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50',
        };
      case 'FILA_ESPERA':
        return {
          label: 'Fila de Espera',
          style:
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
        };
      case 'DESISTENTE_FALTAS':
        return {
          label: 'Desistente (Faltas)',
          style:
            'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
        };
      case 'CANCELADA':
        return {
          label: 'Cancelada',
          style:
            'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        };
      default:
        return {
          label: status,
          style:
            'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        };
    }
  };

  const formatarOrigem = (canal?: string) => {
    switch (canal?.toUpperCase()) {
      case 'CULTURA_AZ':
        return 'Cultura AZ';
      case 'FORMS':
        return 'Formulário';
      case 'PRESENCIAL':
        return 'Presencial';
      case 'PLANILHA':
        return 'Planilha';
      case 'SITE':
        return 'Portal Web';
      default:
        return canal || 'Não informado';
    }
  };

  const temFiltroAtivo = Boolean(busca || filtroCanal || filtroStatus);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Secretaria de Matrículas & Fila de Espera
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Histórico consolidado com canais de captação (Cultura AZ, Presencial, Forms), status e chamadas.
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
      <div className="bg-white dark:bg-[#0D121F] p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome do aluno, CPF, turma ou curso..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition"
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

        <div className="flex gap-2.5">
          <select
            value={filtroCanal}
            onChange={(e) => setFiltroCanal(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
          >
            <option value="">Todos os Canais</option>
            <option value="CULTURA_AZ">Cultura AZ</option>
            <option value="FORMS">Formulários</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="PLANILHA">Planilha</option>
            <option value="SITE">Portal Web</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
          >
            <option value="">Todos os Status</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="INSCRITO">Inscrito (Seleção)</option>
            <option value="FILA_ESPERA">Fila de Espera (Suplente)</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="DESISTENTE_FALTAS">Desistente (3 Faltas)</option>
          </select>

          {temFiltroAtivo && (
            <button
              onClick={() => {
                setBusca('');
                setFiltroCanal('');
                setFiltroStatus('');
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
              title="Limpar todos os filtros"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Matrículas */}
      <div className="bg-white dark:bg-[#0D121F] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Barra superior com indicador de total */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Exibindo{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              {matriculasFiltradas.length}
            </strong>{' '}
            de{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              {matriculas.length}
            </strong>{' '}
            matrículas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-[#080B13] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/90 dark:border-slate-800/90 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Escola</th>
                <th className="px-5 py-3.5">Aluno</th>
                <th className="px-5 py-3.5">Contato / CPF</th>
                <th className="px-5 py-3.5">Turma & Curso</th>
                <th className="px-5 py-3.5">Origem</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {matriculasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="font-medium text-xs">Nenhuma matrícula localizada com os filtros selecionados.</p>
                  </td>
                </tr>
              ) : (
                matriculasFiltradas.map((m) => {
                  const statusInfo = getStatusBadge(m.status);

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase tracking-wider ${getEscolaBadge(
                            m.escolaSigla
                          )}`}
                        >
                          {m.escolaSigla || 'GERAL'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => onOpenPerfilAluno(m.alunoId)}
                          className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left block cursor-pointer transition-colors"
                          title="Ver prontuário do aluno"
                        >
                          {m.alunoNome}
                        </button>
                        {m.responsavelNome && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Resp: {m.responsavelNome}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {formatarCpfMascara(m.alunoCpf)}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                          {m.alunoEmail}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {m.turmaCodigo}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[240px]">
                          {m.cursoNome}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/60">
                          {formatarOrigem(m.canalOrigem)}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.style}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {m.status === 'FILA_ESPERA' && (
                          <button
                            onClick={() => onPromoverSuplente(m.id, m.alunoNome)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition cursor-pointer active:scale-95"
                            title="Efetivar Matrícula de Suplente"
                          >
                            Promover
                          </button>
                        )}
                        <button
                          onClick={() => onOpenPerfilAluno(m.alunoId)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer active:scale-95"
                        >
                          Perfil
                        </button>
                        {m.status !== 'CANCELADA' && m.status !== 'DESISTENTE_FALTAS' && (
                          <button
                            onClick={() => onCancelarMatricula(m.id)}
                            className="px-2.5 py-1 rounded-lg border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium transition cursor-pointer active:scale-95"
                          >
                            Cancelar
                          </button>
                        )}
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
  );
}
