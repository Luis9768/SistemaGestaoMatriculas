'use client';

import React, { useState, useEffect } from 'react';
import { api, PerfilAluno, MatriculaItemPerfil, RegistroPresenca, formatarCpfMascara } from '@/lib/api';
import { ShieldCheck, FileText, Camera, AlertTriangle, MessageCircle, Mail, GraduationCap, X, Check } from 'lucide-react';

interface PerfilAlunoModalProps {
  alunoId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function PerfilAlunoModal({ alunoId, isOpen, onClose, onUpdate }: PerfilAlunoModalProps) {
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'atuais' | 'historico' | 'presencas'>('atuais');
  const [matriculaSelecionadaId, setMatriculaSelecionadaId] = useState<number | null>(null);

  // Formulário para registrar presença rápida
  const [mostrarFormPresenca, setMostrarFormPresenca] = useState(false);
  const [novaDataAula, setNovaDataAula] = useState(new Date().toISOString().split('T')[0]);
  const [novoStatusPresenca, setNovoStatusPresenca] = useState<'PRESENTE' | 'FALTA' | 'JUSTIFICADA'>('PRESENTE');
  const [novaJustificativa, setNovaJustificativa] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [salvandoPresenca, setSalvandoPresenca] = useState(false);

  useEffect(() => {
    if (isOpen && alunoId) {
      carregarPerfil();
    }
  }, [isOpen, alunoId]);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await api.getPerfilAluno(alunoId);
      setPerfil(data);
      if (data.cursosAtuais && data.cursosAtuais.length > 0) {
        setMatriculaSelecionadaId(data.cursosAtuais[0].matriculaId);
      } else if (data.historicoCursos && data.historicoCursos.length > 0) {
        setMatriculaSelecionadaId(data.historicoCursos[0].matriculaId);
      }
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarPresenca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matriculaSelecionadaId) return;

    try {
      setSalvandoPresenca(true);
      await api.registrarPresenca(matriculaSelecionadaId, {
        matriculaId: matriculaSelecionadaId,
        dataAula: novaDataAula,
        status: novoStatusPresenca,
        justificativa: novoStatusPresenca === 'JUSTIFICADA' ? novaJustificativa : undefined,
        conteudoMinistrado: novoConteudo || undefined,
      });
      setMostrarFormPresenca(false);
      setNovaJustificativa('');
      setNovoConteudo('');
      await carregarPerfil();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert(err.message || 'Falha ao registrar presença');
    } finally {
      setSalvandoPresenca(false);
    }
  };

  const handleDesligarPorFaltas = async (matriculaId: number) => {
    if (!confirm('Deseja confirmar o desligamento deste aluno por 3 faltas consecutivas? A vaga será liberada imediatamente para a lista de suplentes.')) {
      return;
    }
    try {
      await api.desligarPorFaltas(matriculaId);
      alert('Desligamento por faltas confirmado com sucesso! A vaga foi disponibilizada para os suplentes da turma.');
      await carregarPerfil();
      if (onUpdate) onUpdate();
    } catch (e: any) {
      alert(e.message || 'Erro ao processar desligamento');
    }
  };

  if (!isOpen) return null;

  const aluno = perfil?.aluno;
  const cursoSelecionado = perfil?.cursosAtuais.find((c) => c.matriculaId === matriculaSelecionadaId) ||
    perfil?.historicoCursos.find((c) => c.matriculaId === matriculaSelecionadaId);

  const getCorTemaEscola = (cor?: string) => {
    switch (cor) {
      case 'violet':
        return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Topo do Modal com Avatar e Ações */}
        <div className="bg-zinc-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white rounded-full p-2 hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Carregando perfil do aluno...</span>
            </div>
          ) : erro ? (
            <div className="bg-rose-950/70 border border-rose-600 text-rose-200 p-4 rounded-lg">
              {erro}
            </div>
          ) : aluno ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-2xl font-bold shadow-md">
                  {aluno.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{aluno.nome}</h2>
                    {aluno.menorDeIdade ? (
                      <span className="bg-amber-400 text-zinc-900 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Menor de Idade
                      </span>
                    ) : (
                      <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-medium">
                        Maior de Idade
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300 mt-1">
                    <span><strong>CPF:</strong> {aluno.cpf ? formatarCpfMascara(aluno.cpf) : 'Não informado'}</span>
                    <span><strong>E-mail:</strong> {aluno.email || 'Não informado'}</span>
                    <span><strong>Telefone:</strong> {aluno.telefone || 'Não informado'}</span>
                    {aluno.dataNascimento && (
                      <span><strong>Nascimento:</strong> {new Date(aluno.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Indicadores Resumidos */}
              <div className="flex gap-3 bg-zinc-800/80 p-3 rounded-xl border border-zinc-700 text-center">
                <div className="px-3 border-r border-zinc-700">
                  <div className="text-xl font-bold text-emerald-400">{perfil?.totalCursosAtivos || 0}</div>
                  <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Cursos Ativos</div>
                </div>
                <div className="px-3">
                  <div className="text-xl font-bold text-amber-400">{perfil?.totalCursosConcluidos || 0}</div>
                  <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Formado / Concluído</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Card de Responsável Legal (caso menor) */}
        {!loading && aluno?.responsavel && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="font-semibold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">
                Responsável Legal
              </span>
              <span><strong>{aluno.responsavel.nome}</strong> ({aluno.responsavel.grauParentesco || 'Responsável'})</span>
              <span className="text-amber-700 font-mono">CPF: {formatarCpfMascara(aluno.responsavel.cpf)}</span>
              <span className="text-amber-700">Tel: {aluno.responsavel.telefone}</span>
            </div>
            <div>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200 flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-700" />
                <span>Termo Físico Arquivado</span>
              </span>
            </div>
          </div>
        )}

        {/* Barra de Conformidade LGPD & Proteção de Dados */}
        {!loading && aluno && (
          <div className="bg-emerald-50/70 border-b border-emerald-200 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-emerald-900 gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-700" /> LGPD Conforme
              </span>
              <span className="text-zinc-600">
                Consentimento registrado nos termos da <strong>Lei nº 13.709/2018 (Arts. 7º e 14)</strong>
                {aluno.dataConsentimentoLgpd && (
                  <span className="ml-1 text-zinc-500">
                    em {new Date(aluno.dataConsentimentoLgpd).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                aluno.consentimentoUsoImagem 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}>
                <Camera className="w-3 h-3 text-blue-600" />
                <span>Imagem Pedagógica: {aluno.consentimentoUsoImagem ? 'Autorizado' : 'Não Autorizado / Restrito'}</span>
              </span>
              <span className="text-zinc-400 font-mono text-[10px]">Sigilo Ativo</span>
            </div>
          </div>
        )}

        {/* Abas de Navegação */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-6 pt-2">
          <button
            onClick={() => setAbaAtiva('atuais')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${
              abaAtiva === 'atuais'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Cursos Atuais ({perfil?.cursosAtuais.length || 0})
          </button>
          <button
            onClick={() => setAbaAtiva('historico')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${
              abaAtiva === 'historico'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Histórico Escolar ({perfil?.historicoCursos.length || 0})
          </button>
          <button
            onClick={() => setAbaAtiva('presencas')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${
              abaAtiva === 'presencas'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Frequência & Presenças
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ABA 1: CURSOS ATUAIS */}
          {abaAtiva === 'atuais' && (
            <div className="space-y-4">
              {perfil?.cursosAtuais.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  O aluno não possui matrículas ativas no momento.
                </div>
              ) : (
                perfil?.cursosAtuais.map((curso) => (
                  <div
                    key={curso.matriculaId}
                    className="border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition shadow-sm bg-white"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getCorTemaEscola(curso.escolaCorTema)}`}>
                          {curso.escolaSigla}
                        </span>
                        <h3 className="font-bold text-zinc-900 text-base">{curso.cursoNome}</h3>
                        <span className="text-xs text-zinc-500">({curso.turmaCodigo})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          {curso.status}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {curso.modalidade || 'CURSO'}
                        </span>
                      </div>
                    </div>

                    {/* Alerta Pedagógico de 3 Faltas e Ações de Contato Prévio */}
                    {curso.frequencia?.atingiuLimiteFaltas && (
                      <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-950 text-xs p-4 rounded-xl space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-900 block text-xs">
                              Alerta de Evasão (3 Faltas Consecutivas):
                            </span>
                            <span className="text-[11px] text-amber-800">
                              Conforme protocolo das Escolas Livres, a secretaria deve realizar uma tentativa de contato prévio com o munícipe/responsável antes de qualquer cancelamento manual de vaga.
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
                          {(aluno?.telefone || aluno?.responsavel?.telefone) && (
                            <a
                              href={`https://wa.me/55${(aluno?.telefone || aluno?.responsavel?.telefone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Olá ${aluno?.nome}, somos da secretaria da ${curso.escolaNome || 'Escola Livre'}. Notamos 3 faltas consecutivas na turma ${curso.turmaCodigo} do curso ${curso.cursoNome}. Gostaríamos de conversar para entender o que aconteceu e verificar como podemos te apoiar para evitar o desligamento da vaga.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Contatar no WhatsApp</span>
                            </a>
                          )}
                          {(aluno?.email || aluno?.responsavel?.email) && (
                            <a
                              href={`mailto:${aluno?.email || aluno?.responsavel?.email}?subject=${encodeURIComponent(
                                `Secretaria de Cultura Santo André - Acompanhamento de Frequência: ${curso.cursoNome}`
                              )}&body=${encodeURIComponent(
                                `Prezado(a) ${aluno?.nome},\n\nIdentificamos o registro de 3 ausências consecutivas nas aulas da turma ${curso.turmaCodigo} (${curso.cursoNome}).\n\nPor gentileza, responda a este e-mail ou entre em contato com a secretaria da escola para alinharmos sua frequência e mantermos sua vaga ativa.\n\nAtenciosamente,\nSecretaria das Escolas Livres de Santo André`
                              )}`}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Enviar E-mail</span>
                            </a>
                          )}
                          {curso.status !== 'DESISTENTE_FALTAS' && curso.status !== 'CANCELADA' && (
                            <button
                              type="button"
                              onClick={() => handleDesligarPorFaltas(curso.matriculaId)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition sm:ml-auto"
                            >
                              Desligar Aluno (Após Contato Sem Retorno)
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {curso.frequencia?.riscoDesistencia && !curso.frequencia?.atingiuLimiteFaltas && (
                      <div className="mb-3 bg-amber-50/80 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span><strong>Alerta Preventivo:</strong> Aluno acumula 2 faltas consecutivas. Recomendado acompanhamento pedagógico.</span>
                      </div>
                    )}

                    {/* Resumo de Frequência do Curso */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-center">
                      <div>
                        <div className="text-xs text-zinc-500">Frequência</div>
                        <div className={`text-base font-bold ${
                          (curso.frequencia?.porcentagemFrequencia || 0) >= 75 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {curso.frequencia?.porcentagemFrequencia ?? 100}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Total Aulas</div>
                        <div className="text-base font-semibold text-zinc-800">{curso.frequencia?.totalAulas || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Presenças</div>
                        <div className="text-base font-semibold text-emerald-600">{curso.frequencia?.totalPresencas || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Faltas</div>
                        <div className="text-base font-semibold text-rose-600">{curso.frequencia?.totalFaltas || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Faltas Seguidas</div>
                        <div className={`text-base font-bold ${
                          (curso.frequencia?.faltasConsecutivas || 0) >= 2 ? 'text-rose-600' : 'text-zinc-700'
                        }`}>
                          {curso.frequencia?.faltasConsecutivas || 0}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between items-center text-xs text-zinc-500">
                      <span>Período: {curso.dataInicio ? new Date(curso.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR') : 'A definir'} até {curso.dataTermino ? new Date(curso.dataTermino + 'T12:00:00').toLocaleDateString('pt-BR') : 'A definir'}</span>
                      <button
                        onClick={() => {
                          setMatriculaSelecionadaId(curso.matriculaId);
                          setAbaAtiva('presencas');
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                      >
                        Ver Lista de Aulas e Presenças →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA 2: HISTÓRICO ESCOLAR (FORMOU-SE OU NÃO) */}
          {abaAtiva === 'historico' && (
            <div className="space-y-4">
              {perfil?.historicoCursos.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  Nenhum curso anterior ou histórico finalizado registrado para este aluno.
                </div>
              ) : (
                perfil?.historicoCursos.map((curso) => (
                  <div
                    key={curso.matriculaId}
                    className="border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition shadow-sm bg-white"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getCorTemaEscola(curso.escolaCorTema)}`}>
                          {curso.escolaSigla}
                        </span>
                        <h4 className="font-bold text-zinc-900">{curso.cursoNome}</h4>
                        <span className="text-xs text-zinc-500">({curso.turmaCodigo})</span>
                      </div>

                      {/* Selo Principal: Formou-se vs Desistente vs Cancelado */}
                      <div>
                        {curso.formado ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF3EC] text-[#346538] border border-emerald-200">
                            <GraduationCap className="w-3.5 h-3.5 text-[#346538]" />
                            <span>Formado com Êxito</span>
                          </span>
                        ) : curso.desistenteFaltas ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDEBEC] text-[#9F2F2D] border border-rose-200">
                            <X className="w-3.5 h-3.5 text-[#9F2F2D]" />
                            <span>Desistente por Faltas</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                            <span>{curso.status}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-zinc-600 mt-2 flex flex-wrap gap-x-4">
                      <span><strong>Escola:</strong> {curso.escolaNome}</span>
                      <span><strong>Modalidade:</strong> {curso.modalidade || 'Livre'}</span>
                      <span><strong>Período:</strong> {curso.dataInicio ? new Date(curso.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR') : '-'} a {curso.dataTermino ? new Date(curso.dataTermino + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</span>
                    </div>

                    {curso.presencas && curso.presencas.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                        <span>Frequência final: <strong>{curso.frequencia?.porcentagemFrequencia}%</strong> ({curso.frequencia?.totalPresencas} presenças de {curso.frequencia?.totalAulas} aulas)</span>
                        <button
                          onClick={() => {
                            setMatriculaSelecionadaId(curso.matriculaId);
                            setAbaAtiva('presencas');
                          }}
                          className="text-zinc-600 hover:text-zinc-900 font-medium hover:underline"
                        >
                          Ver registros de presença passados →
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA 3: FREQUÊNCIA E LISTA DE PRESENÇAS */}
          {abaAtiva === 'presencas' && (
            <div className="space-y-4">
              
              {/* Seletor de Curso para Visualização de Presenças */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Selecione o Curso para Ver / Lançar Presenças:
                  </label>
                  <select
                    value={matriculaSelecionadaId || ''}
                    onChange={(e) => setMatriculaSelecionadaId(Number(e.target.value))}
                    className="w-full sm:w-80 border border-zinc-300 rounded-lg px-3 py-1.5 text-xs text-zinc-800 bg-white"
                  >
                    <optgroup label="Cursos Atuais">
                      {perfil?.cursosAtuais.map((c) => (
                        <option key={c.matriculaId} value={c.matriculaId}>
                          [{c.escolaSigla}] {c.cursoNome} ({c.turmaCodigo})
                        </option>
                      ))}
                    </optgroup>
                    {perfil?.historicoCursos && perfil.historicoCursos.length > 0 && (
                      <optgroup label="Histórico Concluído">
                        {perfil.historicoCursos.map((c) => (
                          <option key={c.matriculaId} value={c.matriculaId}>
                            [{c.escolaSigla}] {c.cursoNome} - Concluído
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {cursoSelecionado && (
                  <button
                    onClick={() => setMostrarFormPresenca(!mostrarFormPresenca)}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    {mostrarFormPresenca ? 'Fechar Formulário' : '+ Lançar Presença / Falta'}
                  </button>
                )}
              </div>

              {/* Formulário de Registro de Nova Presença */}
              {mostrarFormPresenca && matriculaSelecionadaId && (
                <form
                  onSubmit={handleSalvarPresenca}
                  className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Registrar Presença / Aula
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Data da Aula:</label>
                      <input
                        type="date"
                        value={novaDataAula}
                        onChange={(e) => setNovaDataAula(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-1.5 text-xs bg-white text-zinc-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Status:</label>
                      <select
                        value={novoStatusPresenca}
                        onChange={(e: any) => setNovoStatusPresenca(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-1.5 text-xs bg-white text-zinc-900"
                      >
                        <option value="PRESENTE">Presente</option>
                        <option value="FALTA">Falta Não Justificada</option>
                        <option value="JUSTIFICADA">Falta Justificada (Atestado)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Conteúdo Trabalhado:</label>
                      <input
                        type="text"
                        placeholder="Ex: Exercício de Iluminação Cênica"
                        value={novoConteudo}
                        onChange={(e) => setNovoConteudo(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-1.5 text-xs bg-white text-zinc-900"
                      />
                    </div>
                  </div>

                  {novoStatusPresenca === 'JUSTIFICADA' && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Justificativa / Motivo:</label>
                      <input
                        type="text"
                        placeholder="Ex: Atestado médico apresentado na secretaria"
                        value={novaJustificativa}
                        onChange={(e) => setNovaJustificativa(e.target.value)}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-1.5 text-xs bg-white text-zinc-900"
                        required
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarFormPresenca(false)}
                      className="px-3 py-1.5 border border-zinc-300 rounded-lg text-xs text-zinc-600 hover:bg-zinc-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvandoPresenca}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                    >
                      {salvandoPresenca ? 'Salvando...' : 'Confirmar Registro'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tabela de Presenças da Matrícula */}
              {cursoSelecionado ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                      Lista de Aulas Registradas ({cursoSelecionado.presencas?.length || 0})
                    </h4>
                    <span className="text-xs text-zinc-500">
                      Frequência: <strong>{cursoSelecionado.frequencia?.porcentagemFrequencia}%</strong> ({cursoSelecionado.frequencia?.totalPresencas} P / {cursoSelecionado.frequencia?.totalFaltas} F)
                    </span>
                  </div>

                  {cursoSelecionado.presencas?.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                      Nenhuma aula registrada ainda para esta turma. Utilize o botão acima para registrar.
                    </div>
                  ) : (
                    <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-100 text-zinc-700 border-b border-zinc-200 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-4">Data</th>
                            <th className="py-2.5 px-4">Status</th>
                            <th className="py-2.5 px-4">Conteúdo Ministrado</th>
                            <th className="py-2.5 px-4">Justificativa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {cursoSelecionado.presencas?.map((p, idx) => (
                            <tr key={p.id || idx} className="hover:bg-zinc-50">
                              <td className="py-2.5 px-4 font-medium text-zinc-900">
                                {new Date(p.dataAula + 'T12:00:00').toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-2.5 px-4">
                                {p.status === 'PRESENTE' && (
                                  <span className="px-2 py-0.5 rounded-full font-medium bg-[#EDF3EC] text-[#346538] text-[11px] border border-emerald-200/80">
                                    Presente
                                  </span>
                                )}
                                {p.status === 'FALTA' && (
                                  <span className="px-2 py-0.5 rounded-full font-medium bg-[#FDEBEC] text-[#9F2F2D] text-[11px] border border-rose-200/80">
                                    Falta
                                  </span>
                                )}
                                {p.status === 'JUSTIFICADA' && (
                                  <span className="px-2 py-0.5 rounded-full font-medium bg-[#FBF3DB] text-[#956400] text-[11px] border border-amber-200/80">
                                    Justificada
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-zinc-700">
                                {p.conteudoMinistrado || 'Aula regular'}
                              </td>
                              <td className="py-2.5 px-4 text-zinc-500 italic">
                                {p.justificativa || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-zinc-500">
                  Nenhum curso selecionado.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Rodapé do Modal */}
        <div className="bg-zinc-100 border-t border-zinc-200 px-6 py-3 flex justify-between items-center text-xs text-zinc-500">
          <span>Sistema SIGMA – Escolas Livres de Santo André</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg font-medium transition"
          >
            Fechar Perfil
          </button>
        </div>

      </div>
    </div>
  );
}
