'use client';

import React from 'react';
import {
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { Aluno, PageResponse, aplicarMascaraCpf, formatarTelefone, Escola } from '@/lib/api';

interface AlunosPesquisaViewProps {
  paginaAlunos: PageResponse<Aluno>;
  paginaAtualAlunos: number;
  buscaAlunoTermo: string;
  loadingAlunos: boolean;
  escolaAtualObj: Escola | null;
  onBuscarAlunos: (termo: string) => void;
  onMudarPagina: (pagina: number) => void;
  onCadastrarNovoAluno: () => void;
  onOpenPerfilAluno: (alunoId: number) => void;
  onVerTodasEscolas?: () => void;
}

/**
 * Extrai as duas primeiras iniciais de letras do nome do aluno,
 * ignorando números e códigos de turma.
 */
function getIniciaisAluno(nome: string): string {
  const palavras = nome
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-zA-ZÀ-ÿ]/g, ''))
    .filter(Boolean);

  if (palavras.length === 0) return 'AL';
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
  return (palavras[0][0] + palavras[1][0]).toUpperCase();
}

export function AlunosPesquisaView({
  paginaAlunos,
  paginaAtualAlunos,
  buscaAlunoTermo,
  loadingAlunos,
  escolaAtualObj,
  onBuscarAlunos,
  onMudarPagina,
  onCadastrarNovoAluno,
  onOpenPerfilAluno,
  onVerTodasEscolas,
}: AlunosPesquisaViewProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Banner de Contexto da Unidade Escolar */}
      {escolaAtualObj && (
        <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] p-3.5 sm:p-4 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center space-x-2.5">
            <span className="px-2 py-0.5 rounded font-black text-[11px] bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              {escolaAtualObj.sigla}
            </span>
            <span className="text-slate-700 dark:text-zinc-300">
              Listando alunos com matrícula na <strong className="text-slate-900 dark:text-white">{escolaAtualObj.nome}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Cabeçalho de Gestão Central de Alunos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Cadastro Central de Alunos {escolaAtualObj ? `(${escolaAtualObj.sigla})` : '(4 Escolas)'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Pesquisa rápida com paginação no servidor por Nome, E-mail ou CPF com proteção LGPD.
          </p>
        </div>
        <button
          onClick={onCadastrarNovoAluno}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Aluno</span>
        </button>
      </div>

      {/* Barra de Busca Rápida */}
      <div className="bg-white dark:bg-[#121214] p-3.5 rounded-2xl border border-slate-200/90 dark:border-[#27272a] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por Nome do aluno, E-mail ou CPF..."
            value={buscaAlunoTermo}
            onChange={(e) => onBuscarAlunos(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-[#09090b] focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Tabela de Alunos com Ritmo e Densidade Equilibrados */}
      <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/90 dark:border-[#27272a] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-[#09090b]/80 text-slate-400 dark:text-zinc-500 font-semibold border-b border-slate-200/80 dark:border-[#27272a]/80 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nome do Participante</th>
                <th className="px-5 py-3.5">CPF</th>
                <th className="px-5 py-3.5">E-mail</th>
                <th className="px-5 py-3.5">Telefone</th>
                <th className="px-5 py-3.5 text-right">Prontuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]/60">
              {loadingAlunos ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500 dark:text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                    Carregando registros...
                  </td>
                </tr>
              ) : paginaAlunos.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 dark:text-zinc-500">
                    Nenhum aluno encontrado com os termos de busca informados.
                  </td>
                </tr>
              ) : (
                paginaAlunos.content.map((aluno) => {
                  const iniciais = getIniciaisAluno(aluno.nome);

                  return (
                    <tr
                      key={aluno.id}
                      onClick={() => onOpenPerfilAluno(aluno.id!)}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Nome do Aluno, Avatar Neutro e Badge Menor */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#18181b] border border-slate-200/80 dark:border-[#27272a] text-slate-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center shrink-0">
                            {iniciais}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[220px]"
                                title={aluno.nome}
                              >
                                {aluno.nome}
                              </span>
                              {aluno.menorDeIdade && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                  Menor
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                              ID #{aluno.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. CPF (Formatado e legível) */}
                      <td className="px-5 py-3.5 text-xs text-slate-700 dark:text-zinc-300 font-mono tracking-tight select-all">
                        {aluno.cpf ? aplicarMascaraCpf(aluno.cpf) : '—'}
                      </td>

                      {/* 3. E-mail (Coluna Dedicada) */}
                      <td className="px-5 py-3.5">
                        <div
                          className="text-slate-900 dark:text-zinc-200 font-medium text-xs truncate max-w-[240px]"
                          title={aluno.email}
                        >
                          {aluno.email || '—'}
                        </div>
                      </td>

                      {/* 4. Telefone (Coluna Dedicada) */}
                      <td className="px-5 py-3.5 text-xs text-slate-700 dark:text-zinc-300 font-mono">
                        {aluno.telefone ? formatarTelefone(aluno.telefone) : '—'}
                      </td>

                      {/* 5. Ação da Linha: Botão Prontuário */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline transition-colors">
                          <span>Prontuário</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginação */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Mostrando {paginaAlunos.content.length} de{' '}
            <strong className="text-slate-900 dark:text-white">{paginaAlunos.totalElements}</strong>{' '}
            alunos (Página {paginaAlunos.totalPages > 0 ? paginaAlunos.number + 1 : 0} de{' '}
            {paginaAlunos.totalPages})
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={paginaAlunos.first || loadingAlunos}
              onClick={(e) => {
                e.stopPropagation();
                onMudarPagina(paginaAtualAlunos - 1);
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center space-x-1 cursor-pointer transition shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              disabled={paginaAlunos.last || loadingAlunos}
              onClick={(e) => {
                e.stopPropagation();
                onMudarPagina(paginaAtualAlunos + 1);
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center space-x-1 cursor-pointer transition shadow-2xs"
            >
              <span>Próxima</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
