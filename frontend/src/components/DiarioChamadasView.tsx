'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Turma,
  TurmaMateria,
  ChamadaItem,
  ChamadaResumo,
  ChamadaDetalhe,
  LoginResponse,
  api,
  formatarCpfMascara,
} from '@/lib/api';
import Link from 'next/link';
import { NotificacoesPopover } from '@/components/NotificacoesPopover';
import { ModalGerenciarMaterias } from '@/components/ModalGerenciarMaterias';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  BookOpen,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Plus,
  ArrowLeft,
  Search,
  Save,
  CheckCheck,
  Shield,
  Layers,
  ChevronRight,
  Edit3,
  Users,
  UserPlus,
  Eye,
  Info,
  CalendarDays,
} from 'lucide-react';

interface DiarioChamadasViewProps {
  escolaId: number | null;
  turmas: Turma[];
  usuarioLogado: LoginResponse | null;
}

type ModoVisualizacao = 'lista' | 'nova_chamada' | 'foco_dia';

export function DiarioChamadasView({
  escolaId,
  turmas,
  usuarioLogado,
}: DiarioChamadasViewProps) {
  // Verificação estrita de permissão (apenas ADMIN e ENCARREGADA da Secretaria)
  const temPermissao =
    usuarioLogado?.role === 'ROLE_ADMIN' ||
    usuarioLogado?.role === 'ROLE_ENCARREGADA';

  // Filtrar turmas da escola ativa
  const turmasEscola = useMemo(() => {
    if (!escolaId) return turmas;
    return turmas.filter((t) => t.escolaId === escolaId);
  }, [turmas, escolaId]);

  // Estados de seleção
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<number | null>(
    null
  );
  const [materiaSelecionadaId, setMateriaSelecionadaId] = useState<number | null>(
    null
  );

  // Estados de navegação interna
  const [modo, setModo] = useState<ModoVisualizacao>('lista');

  // Dados carregados da API
  const [historicoChamadas, setHistoricoChamadas] = useState<ChamadaResumo[]>(
    []
  );
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  // Estado para formulário de chamada (Nova / Edição)
  const [dataAulaForm, setDataAulaForm] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [responsavelNome, setResponsavelNome] = useState(
    usuarioLogado?.nome || ''
  );
  const [conteudoMinistrado, setConteudoMinistrado] = useState('');
  const [itensChamada, setItensChamada] = useState<ChamadaItem[]>([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { carregarDadosEscola } = useApp();

  // Modal para cadastrar e gerenciar matérias da turma
  const [modalMateriasAberto, setModalMateriasAberto] = useState(false);
  const [materiasLocaisMap, setMateriasLocaisMap] = useState<Record<number, TurmaMateria[]>>({});

  // Estado para visualização focada do dia
  const [chamadaFocada, setChamadaFocada] = useState<ChamadaDetalhe | null>(
    null
  );
  const [loadingFoco, setLoadingFoco] = useState(false);

  // Feedback do sistema
  const [mensagemFeedback, setMensagemFeedback] = useState<{
    tipo: 'sucesso' | 'erro' | 'aviso';
    texto: string;
  } | null>(null);

  // Seleciona primeira turma automaticamente se houver
  useEffect(() => {
    if (turmasEscola.length > 0 && !turmaSelecionadaId) {
      setTurmaSelecionadaId(turmasEscola[0].id || null);
    }
  }, [turmasEscola, turmaSelecionadaId]);

  // Turma atual selecionada
  const turmaAtual = useMemo(() => {
    return turmasEscola.find((t) => t.id === turmaSelecionadaId) || null;
  }, [turmasEscola, turmaSelecionadaId]);

  // Carregar matérias atualizadas da turma selecionada
  useEffect(() => {
    if (turmaSelecionadaId) {
      api.getMateriasTurma(turmaSelecionadaId)
        .then((mats) => {
          setMateriasLocaisMap((prev) => ({ ...prev, [turmaSelecionadaId]: mats }));
        })
        .catch(() => {});
    }
  }, [turmaSelecionadaId]);

  // Matérias da turma atual (com fallback para cache em memória ou dados da turma)
  const materiasTurma = useMemo(() => {
    if (!turmaAtual?.id) return [];
    if (materiasLocaisMap[turmaAtual.id] !== undefined) {
      return materiasLocaisMap[turmaAtual.id];
    }
    return turmaAtual.materias || [];
  }, [turmaAtual, materiasLocaisMap]);

  // Sincroniza após cadastro ou edição de matéria
  const handleMateriasAtualizadas = async () => {
    if (turmaAtual && turmaAtual.id) {
      const idTurma = turmaAtual.id;
      try {
        const mats = await api.getMateriasTurma(idTurma);
        setMateriasLocaisMap((prev) => ({ ...prev, [idTurma]: mats }));
        if (mats.length > 0 && !mats.some((m) => m.id === materiaSelecionadaId)) {
          setMateriaSelecionadaId(mats[0].id || null);
        }
      } catch {}
    }
    carregarDadosEscola();
    setMensagemFeedback({
      tipo: 'sucesso',
      texto: 'Grade de matérias da turma sincronizada com sucesso!',
    });
  };

  // Seleciona primeira matéria da turma automaticamente quando a turma muda
  useEffect(() => {
    if (materiasTurma.length > 0) {
      // Se a matéria atualmente selecionada não pertencer a esta turma, seleciona a primeira
      const materiaExiste = materiasTurma.some(
        (m) => m.id === materiaSelecionadaId
      );
      if (!materiaExiste) {
        setMateriaSelecionadaId(materiasTurma[0].id || null);
      }
    } else {
      setMateriaSelecionadaId(null);
    }
  }, [materiasTurma, materiaSelecionadaId]);

  // Matéria atual selecionada
  const materiaAtual = useMemo(() => {
    return materiasTurma.find((m) => m.id === materiaSelecionadaId) || null;
  }, [materiasTurma, materiaSelecionadaId]);

  // Preenche nome do responsável padrão quando o usuário logado mudar
  useEffect(() => {
    if (usuarioLogado?.nome && !responsavelNome) {
      setResponsavelNome(usuarioLogado.nome);
    }
  }, [usuarioLogado, responsavelNome]);

  // Carregar histórico de chamadas ao mudar turma e matéria
  useEffect(() => {
    if (!turmaSelecionadaId || !materiaSelecionadaId) {
      setHistoricoChamadas([]);
      return;
    }

    const carregarHistorico = async () => {
      setLoadingHistorico(true);
      try {
        const dados = await api.listarChamadas(
          turmaSelecionadaId,
          materiaSelecionadaId
        );
        setHistoricoChamadas(dados);
      } catch (err: any) {
        setMensagemFeedback({
          tipo: 'erro',
          texto: err.message || 'Erro ao carregar histórico de chamadas.',
        });
      } finally {
        setLoadingHistorico(false);
      }
    };

    carregarHistorico();
  }, [turmaSelecionadaId, materiaSelecionadaId]);

  // Limpa feedback automaticamente após 4 segundos
  useEffect(() => {
    if (mensagemFeedback) {
      const timer = setTimeout(() => setMensagemFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensagemFeedback]);

  // Iniciar Nova Chamada
  const handleIniciarNovaChamada = async (dataPredefinida?: string) => {
    if (!turmaSelecionadaId || !materiaSelecionadaId) return;

    const dataAlvo =
      dataPredefinida || new Date().toISOString().split('T')[0];
    setDataAulaForm(dataAlvo);
    if (materiaAtual?.professorResponsavel) {
      setResponsavelNome(materiaAtual.professorResponsavel);
    } else if (usuarioLogado?.nome && (!responsavelNome || responsavelNome === '')) {
      setResponsavelNome(usuarioLogado.nome);
    }
    setLoadingItens(true);
    setModo('nova_chamada');

    try {
      const alunos = await api.obterAlunosParaChamada(
        turmaSelecionadaId,
        materiaSelecionadaId,
        dataAlvo
      );
      setItensChamada(alunos);
      if (alunos.length === 0) {
        setMensagemFeedback(null);
      }
    } catch (err: any) {
      console.warn('Erro ao carregar lista de alunos para chamada:', err);
      setItensChamada([]);
      setMensagemFeedback(null);
    } finally {
      setLoadingItens(false);
    }
  };

  // Focar na chamada do dia X
  const handleFocarChamadaDia = async (data: string) => {
    if (!materiaSelecionadaId) return;
    setLoadingFoco(true);
    setModo('foco_dia');

    try {
      const detalhe = await api.obterDetalheChamada(materiaSelecionadaId, data);
      setChamadaFocada(detalhe);
    } catch (err: any) {
      setMensagemFeedback({
        tipo: 'erro',
        texto: err.message || 'Erro ao carregar detalhes da chamada.',
      });
      setModo('lista');
    } finally {
      setLoadingFoco(false);
    }
  };

  // Alternar presença de um aluno
  const handleTogglePresenca = (matriculaId: number, novoStatus: 'PRESENTE' | 'FALTA' | 'JUSTIFICADA') => {
    setItensChamada((prev) =>
      prev.map((item) =>
        item.matriculaId === matriculaId ? { ...item, status: novoStatus } : item
      )
    );
  };

  // Ações em massa
  const handleMarcarTodos = (status: 'PRESENTE' | 'FALTA') => {
    setItensChamada((prev) => prev.map((item) => ({ ...item, status })));
  };

  // Salvar chamada
  const handleSalvarChamada = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turmaSelecionadaId || !materiaSelecionadaId) {
      setMensagemFeedback({
        tipo: 'erro',
        texto: 'Selecione uma turma e uma matéria.',
      });
      return;
    }

    if (!responsavelNome.trim()) {
      setMensagemFeedback({
        tipo: 'erro',
        texto: 'Por favor, informe o nome do responsável pelo registro da chamada.',
      });
      return;
    }

    if (!dataAulaForm) {
      setMensagemFeedback({
        tipo: 'erro',
        texto: 'Por favor, selecione a data da chamada.',
      });
      return;
    }

    if (itensChamada.length === 0) {
      setMensagemFeedback({
        tipo: 'aviso',
        texto: 'Atenção: Não é possível registrar chamada em uma turma sem alunos cadastrados. Confirme matrículas na turma antes de continuar.',
      });
      return;
    }

    setSalvando(true);
    try {
      const detalheSalvo = await api.salvarChamada({
        turmaId: turmaSelecionadaId,
        materiaId: materiaSelecionadaId,
        dataAula: dataAulaForm,
        responsavelRegistro: responsavelNome.trim(),
        conteudoMinistrado: conteudoMinistrado.trim() || undefined,
        itens: itensChamada,
      });

      setMensagemFeedback({
        tipo: 'sucesso',
        texto: `Chamada do dia ${formatarDataBrasileira(dataAulaForm)} registrada com sucesso por ${responsavelNome}!`,
      });

      // Atualiza histórico
      const historicoAtualizado = await api.listarChamadas(
        turmaSelecionadaId,
        materiaSelecionadaId
      );
      setHistoricoChamadas(historicoAtualizado);

      // Direciona imediatamente para a visão focada do dia X
      setChamadaFocada(detalheSalvo);
      setModo('foco_dia');
    } catch (err: any) {
      setMensagemFeedback({
        tipo: 'erro',
        texto: err.message || 'Erro ao salvar chamada.',
      });
    } finally {
      setSalvando(false);
    }
  };

  // Formatador de data
  const formatarDataBrasileira = (isoDate: string) => {
    if (!isoDate) return '';
    const partes = isoDate.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return isoDate;
  };

  // Se não tiver permissão
  if (!temPermissao) {
    return (
      <main className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Acesso Restrito ao Diário de Chamadas
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Por normas institucionais e diretrizes da Secretaria de Cultura, apenas
            <strong> Administradores</strong> e <strong>Encarregadas</strong> possuem
            permissão para realizar ou auditar as chamadas das turmas.
          </p>
        </div>
      </main>
    );
  }

  // Estatísticas em tempo real no formulário
  const totalAlunosForm = itensChamada.length;
  const presentesForm = itensChamada.filter((i) => i.status === 'PRESENTE').length;
  const faltasForm = itensChamada.filter((i) => i.status === 'FALTA').length;
  const pctPresencaForm =
    totalAlunosForm > 0
      ? Math.round((presentesForm / totalAlunosForm) * 100)
      : 0;

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast de Feedback */}
      {mensagemFeedback && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-md animate-in fade-in duration-200 ${
            mensagemFeedback.tipo === 'sucesso'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-700 dark:text-emerald-200'
              : mensagemFeedback.tipo === 'aviso'
              ? 'bg-amber-50 border border-amber-300 text-amber-900 dark:bg-amber-950/80 dark:border-amber-700 dark:text-amber-200'
              : 'bg-rose-50 border border-rose-300 text-rose-900 dark:bg-rose-950/80 dark:border-rose-700 dark:text-rose-200'
          }`}
        >
          {mensagemFeedback.tipo === 'sucesso' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : mensagemFeedback.tipo === 'aviso' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{mensagemFeedback.texto}</span>
        </div>
      )}

      {/* SELETOR DE ESCOPO: TURMA E MATÉRIA (Sempre disponível no topo quando não estiver em foco_dia) */}
      {modo !== 'foco_dia' && (
        <section className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <CalendarDays className="w-4 h-4" />
                </span>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Diário de Classe & Chamadas
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecione a turma e a matéria para gerenciar o registro de presenças dos alunos.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {turmaAtual && (
                <div title={`Alertas e Notificações da Turma ${turmaAtual.codigo}`}>
                  <NotificacoesPopover
                    escolaId={escolaId}
                    turmaId={turmaAtual.id}
                    turmaNome={turmaAtual.codigo}
                  />
                </div>
              )}

              {turmaAtual && materiaAtual && modo === 'lista' && (
                <button
                  type="button"
                  onClick={() => handleIniciarNovaChamada()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Chamada</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid de Seletores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seletor de Turma */}
            <div>
              <label
                htmlFor="select-turma"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                1. Selecione a Turma
              </label>
              {turmasEscola.length === 0 ? (
                <div className="text-xs text-slate-400 p-2.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Nenhuma turma encontrada nesta escola.
                </div>
              ) : (
                <select
                  id="select-turma"
                  value={turmaSelecionadaId || ''}
                  onChange={(e) => {
                    setTurmaSelecionadaId(Number(e.target.value));
                    setModo('lista');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition cursor-pointer"
                >
                  {turmasEscola.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} — {t.cursoNome || 'Sem curso'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Seletor de Matéria (Independência Cronológica) */}
            <div>
              <label
                htmlFor="select-materia"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                2. Selecione a Matéria (Componente Curricular)
              </label>
              {materiasTurma.length === 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Esta turma ainda não possui matérias cadastradas.</span>
                  </div>
                  {turmaAtual && (
                    <button
                      type="button"
                      onClick={() => setModalMateriasAberto(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cadastrar Matéria</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    id="select-materia"
                    value={materiaSelecionadaId || ''}
                    onChange={(e) => {
                      setMateriaSelecionadaId(Number(e.target.value));
                      setModo('lista');
                    }}
                    className="flex-1 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition cursor-pointer"
                  >
                    {materiasTurma.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setModalMateriasAberto(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
                    title="Adicionar ou gerenciar matérias desta turma"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="hidden sm:inline">Nova Matéria</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chips de Matérias para Seleção Rápida */}
          {materiasTurma.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mr-1">
                Matérias da Turma:
              </span>
              {materiasTurma.map((m) => {
                const ativa = m.id === materiaSelecionadaId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMateriaSelecionadaId(m.id || null);
                      setModo('lista');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      ativa
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m.nome}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setModalMateriasAberto(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 border border-dashed border-amber-300 dark:border-amber-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                title="Cadastrar mais matérias nesta turma"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar Matéria</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* VISÃO 1: HISTÓRICO DE CHAMADAS REGISTRADAS                                  */}
      {/* ========================================================================= */}
      {modo === 'lista' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Chamadas Registradas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {materiaAtual
                  ? `Histórico de aulas para: ${materiaAtual.nome}`
                  : 'Selecione uma matéria acima para visualizar o histórico.'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              Total: {historicoChamadas.length} {historicoChamadas.length === 1 ? 'aula' : 'aulas'}
            </span>
          </div>

          {loadingHistorico ? (
            <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-8 text-center">
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Carregando diário de chamadas...
              </p>
            </div>
          ) : historicoChamadas.length === 0 ? (
            <div className="bg-white dark:bg-[#0D1322] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Nenhuma chamada registrada para esta matéria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {materiaAtual
                  ? `Comece a registrar a frequência dos alunos na matéria "${materiaAtual.nome}".`
                  : 'Selecione uma matéria acima para começar.'}
              </p>
              {turmaAtual && materiaAtual && (
                <button
                  type="button"
                  onClick={() => handleIniciarNovaChamada()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Realizar Primeira Chamada</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historicoChamadas.map((ch) => (
                <div
                  key={`${ch.materiaId}-${ch.dataAula}`}
                  className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-400/80 dark:hover:border-amber-600/80 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Topo do card: Data + Badge de Presença */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        </span>
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                            Data da Aula
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {formatarDataBrasileira(ch.dataAula)}
                          </h4>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                          ch.percentualPresenca >= 75
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}
                      >
                        {ch.percentualPresenca}%
                      </span>
                    </div>

                    {/* Responsável pelo Registro */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {ch.responsavelRegistro?.charAt(0)?.toUpperCase() || 'R'}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none">
                          Registrado por
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {ch.responsavelRegistro || 'Não informado'}
                        </span>
                      </div>
                    </div>

                    {/* Resumo de Presenças */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-2">
                        <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                          Presentes
                        </span>
                        <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                          {ch.totalPresentes}
                        </span>
                      </div>
                      <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl p-2">
                        <span className="block text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">
                          Faltas
                        </span>
                        <span className="text-sm font-extrabold text-rose-800 dark:text-rose-300">
                          {ch.totalFaltas}
                        </span>
                      </div>
                    </div>

                    {ch.conteudoMinistrado && (
                      <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                        "{ch.conteudoMinistrado}"
                      </p>
                    )}
                  </div>

                  {/* Ações do Card */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleFocarChamadaDia(ch.dataAula)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Focar Chamada</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIniciarNovaChamada(ch.dataAula)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Editar chamada"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* VISÃO 2: NOVA CHAMADA / FORMULÁRIO DE REGISTRO                           */}
      {/* ========================================================================= */}
      {modo === 'nova_chamada' && (
        <form onSubmit={handleSalvarChamada} className="space-y-6">
          {/* Barra de Ações Superior */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModo('lista')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                title="Voltar ao diário"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Realizar Chamada de Aula
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {turmaAtual?.codigo} • {materiaAtual?.nome}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setModo('lista')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando || !responsavelNome.trim() || itensChamada.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:cursor-not-allowed"
                title={itensChamada.length === 0 ? 'Não há alunos cadastrados nesta turma' : undefined}
              >
                {salvando ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : itensChamada.length === 0 ? (
                  <>
                    <Users className="w-4 h-4 opacity-70" />
                    <span>Sem Alunos na Turma</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Chamada</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CAIXINHA DO RESPONSÁVEL (SOLICITAÇÃO PRINCIPAL DO USUÁRIO) + DADOS DA AULA */}
          <div className="bg-white dark:bg-[#0D1322] border border-amber-300 dark:border-amber-700/60 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Identificação do Registro & Controle
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  O nome informado será gravado em cada presença deste dia para auditoria institucional.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Caixinha do Nome do Responsável */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="input-responsavel"
                    className="block text-xs font-extrabold text-slate-800 dark:text-slate-200"
                  >
                    Professor / Responsável pela Chamada Deste Dia <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {materiaAtual?.professorResponsavel && materiaAtual.professorResponsavel !== responsavelNome && (
                      <button
                        type="button"
                        onClick={() => setResponsavelNome(materiaAtual.professorResponsavel!)}
                        className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer"
                      >
                        Usar Prof. da Matéria: {materiaAtual.professorResponsavel}
                      </button>
                    )}
                    {usuarioLogado?.nome && usuarioLogado.nome !== responsavelNome && (
                      <button
                        type="button"
                        onClick={() => setResponsavelNome(usuarioLogado.nome)}
                        className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition cursor-pointer"
                      >
                        Usar Meu Usuário ({usuarioLogado.nome})
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="input-responsavel"
                    type="text"
                    required
                    value={responsavelNome}
                    onChange={(e) => setResponsavelNome(e.target.value)}
                    placeholder="Nome do professor ou educador que ministrou a aula..."
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  />
                  {responsavelNome.trim() && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {!responsavelNome.trim() && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                    É obrigatório colocar o nome de quem realizou a chamada antes de salvar.
                  </p>
                )}
              </div>

              {/* Data da Aula */}
              <div>
                <label
                  htmlFor="input-data-aula"
                  className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1.5"
                >
                  Data da Aula <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-data-aula"
                  type="date"
                  required
                  value={dataAulaForm}
                  onChange={(e) => {
                    const novaData = e.target.value;
                    setDataAulaForm(novaData);
                    handleIniciarNovaChamada(novaData);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition cursor-pointer"
                />
              </div>

              {/* Conteúdo Ministrado (Opcional) */}
              <div className="md:col-span-3">
                <label
                  htmlFor="input-conteudo"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Conteúdo / Observações da Aula (Opcional)
                </label>
                <input
                  id="input-conteudo"
                  type="text"
                  maxLength={500}
                  value={conteudoMinistrado}
                  onChange={(e) => setConteudoMinistrado(e.target.value)}
                  placeholder="Ex: Prática cênica de improvisação e composição de personagens"
                  className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Barra de Ações em Massa e Métricas em Tempo Real (Apenas se houver alunos) */}
          {itensChamada.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ações Rápidas:
                </span>
                <button
                  type="button"
                  onClick={() => handleMarcarTodos('PRESENTE')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Todos Presentes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarcarTodos('FALTA')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Todos Faltaram</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono font-bold">
                <span className="text-slate-600 dark:text-slate-400">
                  Total: {totalAlunosForm}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  Presentes: {presentesForm}
                </span>
                <span className="text-rose-700 dark:text-rose-400">
                  Faltas: {faltasForm}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {pctPresencaForm}% freq.
                </span>
              </div>
            </div>
          )}

          {/* Lista de Alunos da Chamada / Aviso Amigável de Turma Sem Alunos */}
          {loadingItens ? (
            <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-8 text-center">
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Carregando lista de alunos da turma...
              </p>
            </div>
          ) : itensChamada.length === 0 ? (
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border-2 border-dashed border-amber-300/80 dark:border-amber-800/70 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Turma Sem Alunos Matriculados</span>
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Nenhum estudante cadastrado nesta turma
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  A turma <strong className="text-slate-900 dark:text-white">{turmaAtual?.codigo}</strong> ainda não possui alunos matriculados para a matéria <strong className="text-slate-900 dark:text-white">{materiaAtual?.nome}</strong>.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Para realizar a chamada e registrar presenças, é necessário confirmar as matrículas dos alunos primeiro.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <Link
                  href="/matriculas"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-sm transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ir para Matrículas & Fila</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setModo('lista')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 active:scale-95 text-xs font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Histórico</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
              {itensChamada.map((item, index) => {
                const isPresente = item.status === 'PRESENTE';
                const isFalta = item.status === 'FALTA';
                const isJustificada = item.status === 'JUSTIFICADA';

                return (
                  <div
                    key={item.matriculaId}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition"
                  >
                    {/* Aluno Identificação */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block truncate">
                          {item.alunoNome}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {item.alunoCpf && (
                            <span>CPF: {formatarCpfMascara(item.alunoCpf)}</span>
                          )}
                          <span>• Matrícula #{item.matriculaId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botões Táteis de Alternância de Presença */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePresenca(item.matriculaId, 'PRESENTE')}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isPresente
                            ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-500/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Marcar presença"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Presente</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePresenca(item.matriculaId, 'FALTA')}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isFalta
                            ? 'bg-rose-600 text-white shadow-xs scale-102 ring-2 ring-rose-500/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Marcar falta"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Faltou</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePresenca(item.matriculaId, 'JUSTIFICADA')}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          isJustificada
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Falta Justificada"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Justificada</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rodapé de Envio */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModo('lista')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || !responsavelNome.trim() || itensChamada.length === 0}
              title={itensChamada.length === 0 ? 'Não há alunos nesta turma para registrar chamada' : undefined}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {salvando ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Chamada</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* VISÃO 3: TELA FOCADA DA CHAMADA DO DIA X (SOLICITAÇÃO EXPLÍCITA)           */}
      {/* ========================================================================= */}
      {modo === 'foco_dia' && chamadaFocada && (
        <section className="space-y-6">
          {/* Topo / Voltar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setModo('lista')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Diário de Chamadas</span>
            </button>

            <button
              type="button"
              onClick={() => handleIniciarNovaChamada(chamadaFocada.dataAula)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Chamada deste Dia</span>
            </button>
          </div>

          {/* Painel Cabeçalho da Chamada Focada */}
          <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400">
                  {chamadaFocada.turmaCodigo} • {chamadaFocada.cursoNome}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Chamada da Aula: {chamadaFocada.materiaNome}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                  <span>Data: {formatarDataBrasileira(chamadaFocada.dataAula)}</span>
                </div>
              </div>

              {/* CARD DESTACADO: QUEM FEZ A CHAMADA */}
              <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 shrink-0 min-w-[240px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Responsável pelo Registro
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {chamadaFocada.responsavelRegistro || 'Não informado'}
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                  ✓ Registro histórico inalterável do dia
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Preserva a autoria de quem realizou a chamada nesta data, imutável mesmo se houver troca de professor na matéria.
                </span>
              </div>
            </div>

            {chamadaFocada.conteudoMinistrado && (
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">
                  Conteúdo Ministrado:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                  "{chamadaFocada.conteudoMinistrado}"
                </p>
              </div>
            )}

            {/* KPIs de Presença */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                  Total de Alunos
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {chamadaFocada.totalAlunos}
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  Presentes
                </span>
                <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">
                  {chamadaFocada.totalPresentes}
                </span>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-800 text-center">
                <span className="block text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">
                  Faltas
                </span>
                <span className="text-xl font-black text-rose-800 dark:text-rose-300">
                  {chamadaFocada.totalFaltas}
                </span>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
                <span className="block text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                  Frequência
                </span>
                <span className="text-xl font-black text-amber-800 dark:text-amber-300 font-mono">
                  {chamadaFocada.percentualPresenca}%
                </span>
              </div>
            </div>
          </div>

          {/* LISTA DE ALUNOS COM PRESENTE OU FALTOU */}
          <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Lista de Presença Individual dos Alunos
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {chamadaFocada.itens.length} alunos listados
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {chamadaFocada.itens.map((item, idx) => (
                <div
                  key={item.matriculaId}
                  className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block truncate">
                        {item.alunoNome}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.alunoCpf && (
                          <span>CPF: {formatarCpfMascara(item.alunoCpf)}</span>
                        )}
                        <span>• Matrícula #{item.matriculaId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge de Status Visual */}
                  <div>
                    {item.status === 'PRESENTE' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-extrabold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>PRESENTE</span>
                      </span>
                    )}

                    {item.status === 'FALTA' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold text-xs">
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>FALTOU</span>
                      </span>
                    )}

                    {item.status === 'JUSTIFICADA' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-extrabold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>JUSTIFICADA</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal de Cadastro / Gestão de Matérias */}
      <ModalGerenciarMaterias
        isOpen={modalMateriasAberto}
        turma={turmaAtual}
        onClose={() => setModalMateriasAberto(false)}
        onMateriasAtualizadas={handleMateriasAtualizadas}
      />
    </main>
  );
}
