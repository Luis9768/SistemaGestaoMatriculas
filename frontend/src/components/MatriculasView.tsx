'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  X,
  ArrowUpRight,
} from 'lucide-react';
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
    switch (sigla) {
      case 'ELT':
        return 'bg-violet-100 text-violet-900 border-violet-300';
      case 'ELD':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'ELCV':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      case 'ELIA':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Secretaria de Matrículas & Fila de Espera
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Histórico consolidado com canais de captação (Cultura AZ, Presencial, Forms), status e chamadas.
          </p>
        </div>

        <button
          onClick={onNovaMatricula}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Matrícula</span>
        </button>
      </div>

      {/* Filtros em Barra Elegante */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do aluno, CPF, turma ou curso..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filtroCanal}
            onChange={(e) => setFiltroCanal(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold focus:bg-white"
          >
            <option value="">Todos os Canais</option>
            <option value="CULTURA_AZ">Cultura AZ</option>
            <option value="FORMS">Formulários</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="PLANILHA">Planilha</option>
            <option value="SITE">Site Web</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold focus:bg-white"
          >
            <option value="">Todos os Status</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="INSCRITO">Inscrito (Seleção)</option>
            <option value="FILA_ESPERA">Fila de Espera (Suplente)</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="DESISTENTE_FALTAS">Desistente (3 Faltas)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Matrículas */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Escola</th>
                <th className="px-5 py-4">Aluno</th>
                <th className="px-5 py-4">Contato / CPF</th>
                <th className="px-5 py-4">Turma & Curso</th>
                <th className="px-5 py-4">Origem</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matriculasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Nenhuma matrícula localizada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                matriculasFiltradas.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${getEscolaBadge(m.escolaSigla)}`}>
                        {m.escolaSigla || 'GERAL'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => onOpenPerfilAluno(m.alunoId)}
                        className="font-bold text-slate-900 hover:text-blue-700 hover:underline text-left block cursor-pointer"
                        title="Ver prontuário do aluno"
                      >
                        {m.alunoNome}
                      </button>
                      {m.responsavelNome && (
                        <div className="text-[10px] text-slate-400">Resp: {m.responsavelNome}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="font-mono text-slate-800 font-semibold">{formatarCpfMascara(m.alunoCpf)}</div>
                      <div className="text-[10px] text-slate-400">{m.alunoEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800">{m.turmaCodigo}</span>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{m.cursoNome}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {m.canalOrigem}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          m.status === 'CONFIRMADA'
                            ? 'bg-[#EDF3EC] text-[#346538] border-emerald-300'
                            : m.status === 'INSCRITO'
                            ? 'bg-[#E1F3FE] text-[#1F6C9F] border-blue-300'
                            : m.status === 'FILA_ESPERA'
                            ? 'bg-[#FBF3DB] text-[#956400] border-amber-300'
                            : m.status === 'DESISTENTE_FALTAS'
                            ? 'bg-[#FDEBEC] text-[#9F2F2D] border-rose-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            m.status === 'CONFIRMADA'
                              ? 'bg-emerald-600'
                              : m.status === 'INSCRITO'
                              ? 'bg-blue-600'
                              : m.status === 'FILA_ESPERA'
                              ? 'bg-amber-600'
                              : m.status === 'DESISTENTE_FALTAS'
                              ? 'bg-rose-600'
                              : 'bg-slate-400'
                          }`}
                        />
                        {m.status === 'FILA_ESPERA'
                          ? 'Suplente / Fila'
                          : m.status === 'DESISTENTE_FALTAS'
                          ? 'Desistente (3 Faltas)'
                          : m.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {m.status === 'FILA_ESPERA' && (
                        <button
                          onClick={() => onPromoverSuplente(m.id, m.alunoNome)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer shadow-2xs"
                          title="Efetivar Matrícula de Suplente"
                        >
                          Promover
                        </button>
                      )}
                      <button
                        onClick={() => onOpenPerfilAluno(m.alunoId)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition cursor-pointer"
                      >
                        Perfil
                      </button>
                      {m.status !== 'CANCELADA' && m.status !== 'DESISTENTE_FALTAS' && (
                        <button
                          onClick={() => onCancelarMatricula(m.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
