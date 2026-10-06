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

/**
 * Converte data ISO (YYYY-MM-DD) para formato humano (DD/MM/YYYY)
 * e calcula a idade em anos.
 */
function formatarDataEIdade(dataIso?: string | null): { dataFormatada: string; idadeTexto: string | null } {
  if (!dataIso) return { dataFormatada: '—', idadeTexto: null };

  const partes = dataIso.split('-');
  if (partes.length !== 3) return { dataFormatada: dataIso, idadeTexto: null };

  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const dia = parseInt(partes[2], 10);

  if (isNaN(ano) || isNaN(mes) || isNaN(dia)) return { dataFormatada: dataIso, idadeTexto: null };

  const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();

  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade--;
  }

  const idadeTexto = idade >= 0 ? `${idade} anos` : null;
  return { dataFormatada, idadeTexto };
}

/**
 * Remove códigos de turma redundantes do nome do responsável
 * (ex: 'Responsável de Aluno 33 ELT DRAM 2026' -> 'Responsável de Aluno 33')
 */
function limparNomeResponsavel(nome: string): string {
  if (!nome) return '';
  return nome.replace(/\s+(ELT|ELD|ELCV|EMIA|ELIA)\b.*$/i, '').trim();
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
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline cursor-pointer"
          >
            Ver Alunos de Todas as Escolas
          </button>
        </div>
      )}

      {/* Cabeçalho de Gestão Central de Alunos */}
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
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Aluno</span>
        </button>
      </div>

      {/* Barra de Busca Rápida */}
      <div className="bg-white dark:bg-[#0D1220] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por Nome do aluno, E-mail ou CPF..."
            value={buscaAlunoTermo}
            onChange={(e) => onBuscarAlunos(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Tabela de Alunos com Ritmo e Densidade Equilibrados */}
      <div className="bg-white dark:bg-[#0D1220] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nome do Aluno</th>
                <th className="px-5 py-3.5">CPF Protegido</th>
                <th className="px-5 py-3.5">E-mail / Telefone</th>
                <th className="px-5 py-3.5">Nascimento / Idade</th>
                <th className="px-5 py-3.5">Responsável Legal</th>
                <th className="px-5 py-3.5 text-right">Prontuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loadingAlunos ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
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
                  const iniciais = getIniciaisAluno(aluno.nome);
                  const infoData = formatarDataEIdade(aluno.dataNascimento);
                  const nomeRespLimpo = aluno.responsavel ? limparNomeResponsavel(aluno.responsavel.nome) : '';

                  return (
                    <tr
                      key={aluno.id}
                      onClick={() => onOpenPerfilAluno(aluno.id!)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Nome do Aluno, Avatar Neutro e Badge Delimitado Menor */}
                      <td className="px-5 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center shrink-0">
                            {iniciais}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[190px]"
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
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                              ID #{aluno.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. CPF Protegido (Sutil e Neutro em #94a3b8 / text-slate-400) */}
                      <td className="px-5 py-3 text-xs text-slate-400 dark:text-slate-400 font-mono tracking-tight select-all">
                        {formatarCpfMascara(aluno.cpf)}
                      </td>

                      {/* 3. E-mail e Telefone Formatado com Espaço pós DDD */}
                      <td className="px-5 py-3">
                        <div
                          className="text-slate-900 dark:text-slate-200 font-medium text-xs truncate max-w-[210px]"
                          title={aluno.email}
                        >
                          {aluno.email}
                        </div>
                        {aluno.telefone ? (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {formatarTelefone(aluno.telefone)}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">—</div>
                        )}
                      </td>

                      {/* 4. Nascimento / Idade Calculada */}
                      <td className="px-5 py-3">
                        <div className="text-slate-900 dark:text-slate-200 font-medium text-xs">
                          {infoData.dataFormatada}
                        </div>
                        {infoData.idadeTexto && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {infoData.idadeTexto}
                          </div>
                        )}
                      </td>

                      {/* 5. Responsável Legal: Compactado em Estritamente 2 Linhas */}
                      <td className="px-5 py-3">
                        {aluno.responsavel ? (
                          <div className="space-y-0.5 min-w-0">
                            <div
                              className="text-slate-900 dark:text-slate-200 text-xs font-medium truncate max-w-[200px]"
                              title={`${aluno.responsavel.nome}${aluno.responsavel.grauParentesco ? ` (${aluno.responsavel.grauParentesco})` : ''}`}
                            >
                              <span>{nomeRespLimpo}</span>
                              {aluno.responsavel.grauParentesco && (
                                <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                                  ({aluno.responsavel.grauParentesco})
                                </span>
                              )}
                            </div>
                            {aluno.responsavel.telefone ? (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                {formatarTelefone(aluno.responsavel.telefone)}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 dark:text-slate-600">—</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* 6. Ação da Linha: Botão Compacto Leve Estilo Ghost */}
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
