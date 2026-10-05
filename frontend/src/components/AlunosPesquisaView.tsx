'use client';

import React from 'react';
import {
  Search,
  PlusCircle,
  Baby,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Aluno, PageResponse, formatarCpfMascara, formatarTelefone, Escola } from '@/lib/api';

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
  onVerTodasEscolas: () => void;
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {escolaAtualObj && (
        <div className="bg-white dark:bg-[#0D1220] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-4 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center space-x-2.5">
            <span className="px-2 py-0.5 rounded font-black text-[11px] bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              {escolaAtualObj.sigla}
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              Filtrando alunos com matrícula na <strong className="text-slate-900 dark:text-white">{escolaAtualObj.nome}</strong>
            </span>
          </div>
          <button
            onClick={onVerTodasEscolas}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold underline cursor-pointer"
          >
            Ver Alunos de Todas as Escolas
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Cadastro Central de Alunos {escolaAtualObj ? `(${escolaAtualObj.sigla})` : '(4 Escolas)'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pesquisa rápida com paginação no servidor por Nome, E-mail ou CPF com proteção LGPD.
          </p>
        </div>
        <button
          onClick={onCadastrarNovoAluno}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Aluno</span>
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white dark:bg-[#0D1220] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por Nome do aluno, E-mail ou CPF..."
            value={buscaAlunoTermo}
            onChange={(e) => onBuscarAlunos(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Tabela de Alunos com Paginação */}
      <div className="bg-white dark:bg-[#0D1220] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800/80 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Nome do Aluno</th>
                <th className="px-5 py-4">CPF Protegido</th>
                <th className="px-5 py-4">E-mail / Telefone</th>
                <th className="px-5 py-4">Nascimento / Idade</th>
                <th className="px-5 py-4">Responsável Legal (Se Menor)</th>
                <th className="px-5 py-4 text-right">Prontuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loadingAlunos ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    Carregando registros...
                  </td>
                </tr>
              ) : paginaAlunos.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                    Nenhum aluno encontrado com os termos de busca informados.
                  </td>
                </tr>
              ) : (
                paginaAlunos.content.map((aluno) => {
                  const iniciais = aluno.nome
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={aluno.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {iniciais}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{aluno.nome}</span>
                              {aluno.menorDeIdade && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  <Baby className="w-3 h-3 mr-0.5" /> Menor
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">ID #{aluno.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {formatarCpfMascara(aluno.cpf)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-900 dark:text-white font-medium">{aluno.email}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{formatarTelefone(aluno.telefone)}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {aluno.dataNascimento ? aluno.dataNascimento : 'Não informada'}
                      </td>
                      <td className="px-5 py-4">
                        {aluno.responsavel ? (
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{aluno.responsavel.nome}</span>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {aluno.responsavel.grauParentesco} • CPF: {formatarCpfMascara(aluno.responsavel.cpf)}
                            </div>
                            {aluno.responsavel.telefone && (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Tel: {formatarTelefone(aluno.responsavel.telefone)}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Maior de idade</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onOpenPerfilAluno(aluno.id!)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 rounded-xl font-bold transition shadow-2xs text-xs cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          <span>Ver Perfil</span>
                        </button>
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
            Mostrando {paginaAlunos.content.length} de <strong className="text-slate-900 dark:text-white">{paginaAlunos.totalElements}</strong> alunos
            (Página {paginaAlunos.totalPages > 0 ? paginaAlunos.number + 1 : 0} de {paginaAlunos.totalPages})
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={paginaAlunos.first || loadingAlunos}
              onClick={() => onMudarPagina(paginaAtualAlunos - 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              disabled={paginaAlunos.last || loadingAlunos}
              onClick={() => onMudarPagina(paginaAtualAlunos + 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
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
