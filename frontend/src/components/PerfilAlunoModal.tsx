'use client';

import React, { useState, useEffect } from 'react';
import {
  api,
  PerfilAluno,
  MatriculaItemPerfil,
  aplicarMascaraTelefone,
  formatarTelefone,
} from '@/lib/api';
import { getCorTemaEscola } from '@/lib/escolaUtils';
import {
  X,
  Plus,
  Mail,
  Phone,
  Edit3,
  Calendar,
  AlertTriangle,
  MessageCircle,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface PerfilAlunoModalProps {
  alunoId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const formatarData = (dataStr?: string) => {
  if (!dataStr) return 'Não informada';
  const clean = dataStr.split('T')[0];
  const partes = clean.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};

const calcularIdade = (dataNasc?: string) => {
  if (!dataNasc) return null;
  const nasc = new Date(dataNasc);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return isNaN(idade) ? null : idade;
};

export function PerfilAlunoModal({
  alunoId,
  isOpen,
  onClose,
  onUpdate,
}: PerfilAlunoModalProps) {
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'atuais' | 'frequencia' | 'historico'>('atuais');
  const [matriculaSelecionadaId, setMatriculaSelecionadaId] = useState<number | null>(null);

  // Modo de edição de dados de contato (email, telefone, responsável)
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editRespTelefone, setEditRespTelefone] = useState('');
  const [editRespEmail, setEditRespEmail] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [feedbackSalvo, setFeedbackSalvo] = useState<string | null>(null);


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

  const iniciarEdicao = () => {
    if (perfil?.aluno) {
      setEditEmail(perfil.aluno.email || '');
      setEditTelefone(aplicarMascaraTelefone(perfil.aluno.telefone || ''));
      setEditRespTelefone(aplicarMascaraTelefone(perfil.aluno.responsavel?.telefone || ''));
      setEditRespEmail(perfil.aluno.responsavel?.email || '');
      setModoEdicao(true);
      setFeedbackSalvo(null);
    }
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvandoEdicao(true);
      await api.atualizarContatoAluno(alunoId, {
        email: editEmail.trim(),
        telefone: editTelefone.trim(),
        responsavelTelefone: editRespTelefone.trim() || undefined,
        responsavelEmail: editRespEmail.trim() || undefined,
      });
      setFeedbackSalvo('Dados de contato atualizados com sucesso.');
      setModoEdicao(false);
      await carregarPerfil();
      if (onUpdate) onUpdate();
      setTimeout(() => setFeedbackSalvo(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar dados');
    } finally {
      setSalvandoEdicao(false);
    }
  };


  const handleDesligarPorFaltas = async (matriculaId: number) => {
    if (
      !confirm(
        'Deseja confirmar o cancelamento da vaga deste aluno por limite de faltas consecutivas? A vaga será disponibilizada para suplência.'
      )
    ) {
      return;
    }
    try {
      await api.desligarPorFaltas(matriculaId);
      alert('Desligamento confirmado com sucesso.');
      await carregarPerfil();
      if (onUpdate) onUpdate();
    } catch (e: any) {
      alert(e.message || 'Erro ao processar desligamento');
    }
  };

  if (!isOpen) return null;

  const aluno = perfil?.aluno;
  const cursoSelecionado =
    perfil?.cursosAtuais.find((c) => c.matriculaId === matriculaSelecionadaId) ||
    perfil?.historicoCursos.find((c) => c.matriculaId === matriculaSelecionadaId);

  const idade = calcularIdade(aluno?.dataNascimento);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/80 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Cabeçalho do Prontuário */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0D1220]">
          {loading ? (
            <div className="flex items-center gap-2.5 py-6">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Carregando prontuário do estudante...</span>
            </div>
          ) : erro ? (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-4 rounded-xl text-xs flex items-center justify-between">
              <span>{erro}</span>
              <button onClick={carregarPerfil} className="underline text-xs font-semibold">Tentar novamente</button>
            </div>
          ) : aluno ? (
            <div className="space-y-4">
              
              {/* Linha 1: Monograma + Nome + Status + Ações (Editar Contatos / Fechar) */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm flex items-center justify-center shrink-0 select-none shadow-xs">
                    {aluno.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {aluno.nome}
                      </h2>
                      {aluno.menorDeIdade ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40">
                          Menor de Idade
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                          Regular
                        </span>
                      )}
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                        Matrícula #{aluno.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!modoEdicao && (
                    <button
                      onClick={iniciarEdicao}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Editar Contato</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    aria-label="Fechar prontuário"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mensagem de Feedback de Edição */}
              {feedbackSalvo && (
                <div className="px-3.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{feedbackSalvo}</span>
                </div>
              )}

              {/* Modo de Edição em Linha */}
              {modoEdicao ? (
                <form
                  onSubmit={handleSalvarEdicao}
                  className="bg-slate-50 dark:bg-[#070A11] border border-slate-200/90 dark:border-slate-800 p-4 rounded-xl space-y-3.5 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-200/70 dark:border-slate-800/70 pb-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Atualizar Dados de Contato
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Alterações refletem imediatamente na ficha
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        E-mail do Estudante *
                      </label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={editTelefone}
                        onChange={(e) => setEditTelefone(aplicarMascaraTelefone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    {aluno.responsavel && (
                      <>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Telefone do Responsável ({aluno.responsavel.grauParentesco || 'Responsável'})
                          </label>
                          <input
                            type="text"
                            value={editRespTelefone}
                            onChange={(e) => setEditRespTelefone(aplicarMascaraTelefone(e.target.value))}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            E-mail do Responsável
                          </label>
                          <input
                            type="email"
                            value={editRespEmail}
                            onChange={(e) => setEditRespEmail(e.target.value)}
                            placeholder="responsavel@exemplo.com"
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setModoEdicao(false)}
                      className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvandoEdicao}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
                    >
                      {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Visualização Clean dos Contatos (SEM CPF) */
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{aluno.email || 'E-mail não cadastrado'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{formatarTelefone(aluno.telefone)}</span>
                  </div>

                  {aluno.dataNascimento && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {formatarData(aluno.dataNascimento)}
                        {idade !== null && (
                          <span className="text-slate-400 ml-1">({idade} anos)</span>
                        )}
                      </span>
                    </div>
                  )}

                  {aluno.responsavel && (
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50">
                        {aluno.responsavel.grauParentesco || 'Responsável'}
                      </span>
                      <strong className="text-slate-700 dark:text-slate-200">
                        {aluno.responsavel.nome}
                      </strong>
                      {aluno.responsavel.telefone && (
                        <span className="font-mono">{formatarTelefone(aluno.responsavel.telefone)}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Barra de Segmento de Abas */}
        <div className="bg-slate-50/70 dark:bg-[#070A11] px-6 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-900/80 p-1 rounded-xl text-xs">
            <button
              onClick={() => setAbaAtiva('atuais')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'atuais'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>Cursos Atuais</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {perfil?.cursosAtuais.length || 0}
              </span>
            </button>

            <button
              onClick={() => setAbaAtiva('frequencia')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'frequencia'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>Frequência & Presenças</span>
              {cursoSelecionado?.frequencia?.atingiuLimiteFaltas && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              onClick={() => setAbaAtiva('historico')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'historico'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>Histórico Escolar</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {perfil?.historicoCursos.length || 0}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
            <span>{perfil?.totalCursosAtivos || 0} ativo(s)</span>
            <span>•</span>
            <span>{perfil?.totalCursosConcluidos || 0} concluído(s)</span>
          </div>
        </div>

        {/* Conteúdo com macro-espaçamento limpo */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white dark:bg-[#0B0F19]">
          
          {/* ABA 1: CURSOS ATUAIS */}
          {abaAtiva === 'atuais' && (
            <div className="space-y-4">
              {perfil?.cursosAtuais.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-[#0E1322] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                  O estudante não possui matrículas ativas no momento.
                </div>
              ) : (
                perfil?.cursosAtuais.map((curso) => {
                  const freq = curso.frequencia?.porcentagemFrequencia ?? 100;
                  const faltasConsecutivas = curso.frequencia?.faltasConsecutivas || 0;
                  const emAlerta = curso.frequencia?.atingiuLimiteFaltas || faltasConsecutivas >= 3;

                  return (
                    <div
                      key={curso.matriculaId}
                      className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-[#0D1220] hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
                    >
                      {/* Topo do Card de Curso */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getCorTemaEscola(
                              curso.escolaSigla || curso.escolaCorTema
                            )}`}
                          >
                            {curso.escolaSigla || 'GERAL'}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            {curso.cursoNome}
                          </h3>
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                            ({curso.turmaCodigo})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700">
                            {curso.modalidade || 'FORMAÇÃO'}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                            {curso.status}
                          </span>
                        </div>
                      </div>

                      {/* Informações de Período e Horário */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <div>
                          <strong className="text-slate-600 dark:text-slate-300 font-medium">Período Letivo:</strong>{' '}
                          {formatarData(curso.dataInicio)} até {formatarData(curso.dataTermino)}
                        </div>
                        <div>
                          <strong className="text-slate-600 dark:text-slate-300 font-medium">Escola Oficial:</strong>{' '}
                          {curso.escolaNome}
                        </div>
                      </div>

                      {/* Barra de Progresso de Frequência */}
                      <div className="bg-slate-50/70 dark:bg-[#070A11] p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Assiduidade do Estudante
                          </span>
                          <span className={`font-mono font-bold ${freq >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {freq}%
                          </span>
                        </div>

                        <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              freq >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(freq, 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                          <span>{curso.frequencia?.totalPresencas || 0} presenças de {curso.frequencia?.totalAulas || 0} aulas</span>
                          <span>{curso.frequencia?.totalFaltas || 0} faltas ({faltasConsecutivas} consecutivas)</span>
                        </div>
                      </div>

                      {/* Alerta de Risco de Evasão (se houver) */}
                      {emAlerta && (
                        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl space-y-3 text-xs">
                          <div className="flex items-start gap-2 text-amber-900 dark:text-amber-300">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                            <div>
                              <strong className="block">Alerta de Faltas Consecutivas (3 ou mais)</strong>
                              <span className="text-[11px] text-amber-800 dark:text-amber-400">
                                Recomenda-se tentativa de contato antes do cancelamento definitivo da matrícula.
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {(aluno?.telefone || aluno?.responsavel?.telefone) && (
                              <a
                                href={`https://wa.me/55${(aluno?.telefone || aluno?.responsavel?.telefone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Olá ${aluno?.nome}, somos da secretaria da ${curso.escolaNome || 'Escola Livre'}. Notamos ausências consecutivas na turma ${curso.turmaCodigo} (${curso.cursoNome}). Gostaríamos de conversar para apoiá-lo a manter sua vaga ativa.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            {(aluno?.email || aluno?.responsavel?.email) && (
                              <a
                                href={`mailto:${aluno?.email || aluno?.responsavel?.email}?subject=${encodeURIComponent(
                                  `Frequência: ${curso.cursoNome}`
                                )}`}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>E-mail</span>
                              </a>
                            )}

                            {curso.status !== 'DESISTENTE_FALTAS' && curso.status !== 'CANCELADA' && (
                              <button
                                type="button"
                                onClick={() => handleDesligarPorFaltas(curso.matriculaId)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition cursor-pointer sm:ml-auto"
                              >
                                Desligar por Faltas
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Link direto para a aba de frequência */}
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            setMatriculaSelecionadaId(curso.matriculaId);
                            setAbaAtiva('frequencia');
                          }}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>Ver diário completo de presenças</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ABA 2: FREQUÊNCIA & PRESENÇAS FILTRADAS POR CURSO */}
          {abaAtiva === 'frequencia' && (
            <div className="space-y-5">
              {/* Barra de Filtro de Curso e Ações */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#070A11] p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Curso:
                  </label>
                  <select
                    value={matriculaSelecionadaId || ''}
                    onChange={(e) => setMatriculaSelecionadaId(Number(e.target.value))}
                    className="w-full sm:w-80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <optgroup label="Cursos Atuais">
                      {perfil?.cursosAtuais.map((c) => (
                        <option key={c.matriculaId} value={c.matriculaId}>
                          [{c.escolaSigla}] {c.cursoNome} ({c.turmaCodigo})
                        </option>
                      ))}
                    </optgroup>
                    {perfil?.historicoCursos && perfil.historicoCursos.length > 0 && (
                      <optgroup label="Histórico">
                        {perfil.historicoCursos.map((c) => (
                          <option key={c.matriculaId} value={c.matriculaId}>
                            [{c.escolaSigla}] {c.cursoNome} (Concluído)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Bento Cards Minimalistas */}
              {cursoSelecionado ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Assiduidade
                      </span>
                      <div
                        className={`text-xl font-bold font-mono mt-1 ${
                          (cursoSelecionado.frequencia?.porcentagemFrequencia ?? 100) >= 75
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {cursoSelecionado.frequencia?.porcentagemFrequencia ?? 100}%
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Meta: 75%</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Aulas Totais
                      </span>
                      <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                        {cursoSelecionado.frequencia?.totalAulas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Registradas no diário</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Presenças
                      </span>
                      <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {cursoSelecionado.frequencia?.totalPresencas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        +{cursoSelecionado.frequencia?.totalJustificadas || 0} justificada(s)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Faltas
                      </span>
                      <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                        {cursoSelecionado.frequencia?.totalFaltas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        {cursoSelecionado.frequencia?.faltasConsecutivas || 0} consecutiva(s)
                      </span>
                    </div>
                  </div>

                  {/* Tabela do Diário de Presenças */}
                  <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-[#0D1220]">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Diário de Chamadas ({cursoSelecionado.presencas?.length || 0} registros)
                      </span>
                      <span className="font-mono text-[11px]">
                        {cursoSelecionado.cursoNome} • {cursoSelecionado.turmaCodigo}
                      </span>
                    </div>

                    {cursoSelecionado.presencas?.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                        Nenhum registro de chamada lançado até o momento.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/60 dark:bg-[#080B13] text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800/70">
                            <tr>
                              <th className="py-2.5 px-4">Data</th>
                              <th className="py-2.5 px-4">Status</th>
                              <th className="py-2.5 px-4">Conteúdo</th>
                              <th className="py-2.5 px-4">Justificativa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {cursoSelecionado.presencas?.map((p, idx) => (
                              <tr key={p.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200 font-medium">
                                  {formatarData(p.dataAula)}
                                </td>
                                <td className="py-3 px-4">
                                  {p.status === 'PRESENTE' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                                      Presente
                                    </span>
                                  )}
                                  {p.status === 'FALTA' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40">
                                      Falta
                                    </span>
                                  )}
                                  {p.status === 'JUSTIFICADA' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40">
                                      Justificada
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                  {p.conteudoMinistrado || 'Aula regular'}
                                </td>
                                <td className="py-3 px-4 text-slate-400 dark:text-slate-500 italic">
                                  {p.justificativa || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                  Nenhum curso selecionado.
                </div>
              )}
            </div>
          )}

          {/* ABA 3: HISTÓRICO ESCOLAR */}
          {abaAtiva === 'historico' && (
            <div className="space-y-4">
              {perfil?.historicoCursos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-[#0E1322] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                  Nenhum curso finalizado ou anterior no histórico deste estudante.
                </div>
              ) : (
                perfil?.historicoCursos.map((curso) => (
                  <div
                    key={curso.matriculaId}
                    className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-[#0D1220] hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getCorTemaEscola(
                            curso.escolaSigla || curso.escolaCorTema
                          )}`}
                        >
                          {curso.escolaSigla || 'GERAL'}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{curso.cursoNome}</h4>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                          ({curso.turmaCodigo})
                        </span>
                      </div>

                      <div>
                        {curso.formado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Formado</span>
                          </span>
                        ) : curso.desistenteFaltas ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40">
                            <span>Desistente por Faltas</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                            {curso.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong>Escola:</strong> {curso.escolaNome}</span>
                      <span><strong>Modalidade:</strong> {curso.modalidade || 'Livre'}</span>
                      <span><strong>Período:</strong> {formatarData(curso.dataInicio)} a {formatarData(curso.dataTermino)}</span>
                    </div>

                    {curso.presencas && curso.presencas.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Frequência final: <strong className="text-slate-700 dark:text-slate-300">{curso.frequencia?.porcentagemFrequencia}%</strong> ({curso.frequencia?.totalPresencas} de {curso.frequencia?.totalAulas} aulas)
                        </span>
                        <button
                          onClick={() => {
                            setMatriculaSelecionadaId(curso.matriculaId);
                            setAbaAtiva('frequencia');
                          }}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        >
                          Ver diário →
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Rodapé Minimalista */}
        <div className="bg-slate-50/50 dark:bg-[#070A11] border-t border-slate-100 dark:border-slate-800/80 px-6 py-3.5 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium text-xs transition cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
