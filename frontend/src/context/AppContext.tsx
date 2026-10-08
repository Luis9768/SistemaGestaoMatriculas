'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  api,
  Escola,
  Curso,
  Turma,
  Matricula,
  Aluno,
  PageResponse,
  LoginResponse,
  ImportacaoResultado,
  InscricaoExternaPayload,
} from '@/lib/api';

interface AppContextType {
  usuarioLogado: LoginResponse | null;
  escolas: Escola[];
  escolaSelecionada: number | null;
  setEscolaSelecionada: (id: number | null) => void;
  escolaAtualObj: Escola | null;
  cursos: Curso[];
  turmas: Turma[];
  matriculas: Matricula[];
  loading: boolean;
  refreshing: boolean;
  feedbackMsg: { tipo: 'sucesso' | 'erro'; texto: string } | null;
  tempoRestanteMin: number;
  mostrarFeedback: (tipo: 'sucesso' | 'erro', texto: string) => void;
  fecharFeedback: () => void;
  carregarDadosEscola: () => Promise<void>;
  carregarMatriculas: () => Promise<void>;
  carregarDadosIniciais: (userAtivo?: LoginResponse | null) => Promise<void>;
  handleLogout: () => void;
  handleCancelarMatricula: (matriculaId: number) => Promise<void>;
  handleSalvarCursoComDisciplinas: (cursoData: Curso) => Promise<void>;
  handleCriarTurma: (e: React.FormEvent) => Promise<void>;
  handleSubmeterInscricao: (payload: InscricaoExternaPayload) => Promise<void>;
  handleUploadPlanilha: (file: File) => Promise<ImportacaoResultado>;
  // Alunos
  paginaAlunos: PageResponse<Aluno>;
  paginaAtualAlunos: number;
  buscaAlunoTermo: string;
  loadingAlunos: boolean;
  setBuscaAlunoTermo: (termo: string) => void;
  setPaginaAtualAlunos: (pag: number) => void;
  carregarAlunosPaginados: (pagina?: number, buscaOverride?: string) => Promise<void>;
  // Modals
  showModalTurma: boolean;
  setShowModalTurma: (show: boolean) => void;
  novaTurma: Turma;
  setNovaTurma: React.Dispatch<React.SetStateAction<Turma>>;
  turmaCursoPreSelecionadoId: number | null;
  setTurmaCursoPreSelecionadoId: (id: number | null) => void;
  abrirModalNovaTurma: (cursoId?: number) => void;
  abrirModalPerfil: (alunoId: number, autoDeclaracaoMatriculaId?: number | null) => void;
  abrirModalLgpd: (aba?: 'geral' | 'alunos') => void;
  showModalPerfil: boolean;
  setShowModalPerfil: (show: boolean) => void;
  perfilAlunoId: number | null;
  autoDeclaracaoMatriculaId: number | null;
  setAutoDeclaracaoMatriculaId: (id: number | null) => void;
  turmaDetalhesModal: Turma | null;
  abrirModalDetalhesTurma: (turmaOuId: Turma | number) => Promise<void>;
  fecharModalDetalhesTurma: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [usuarioLogado, setUsuarioLogado] = useState<LoginResponse | null>(null);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [escolaSelecionada, setEscolaSelecionadaState] = useState<number | null>(null);

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [tempoRestanteMin, setTempoRestanteMin] = useState<number>(120);

  // Alunos
  const [paginaAlunos, setPaginaAlunos] = useState<PageResponse<Aluno>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: true,
  });
  const [paginaAtualAlunos, setPaginaAtualAlunos] = useState(0);
  const [buscaAlunoTermo, setBuscaAlunoTermo] = useState('');
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  // Modal Turma
  const [showModalTurma, setShowModalTurma] = useState(false);
  const [turmaCursoPreSelecionadoId, setTurmaCursoPreSelecionadoId] = useState<number | null>(null);
  const [novaTurma, setNovaTurma] = useState<Turma>({
    cursoId: 0,
    codigo: '',
    dataAberturaMatricula: '',
    dataFechamentoMatricula: '',
    dataInicioAulas: '',
    dataFimAulas: '',
    vagasTotais: 30,
    idadeMinima: undefined,
    idadeMaxima: undefined,
    materiasNomes: [],
  });

  // Modal Perfil & LGPD
  const [perfilAlunoId, setPerfilAlunoId] = useState<number | null>(null);
  const [autoDeclaracaoMatriculaId, setAutoDeclaracaoMatriculaId] = useState<number | null>(null);
  const [showModalPerfil, setShowModalPerfil] = useState(false);
  const [showModalLgpd, setShowModalLgpd] = useState(false);
  const [lgpdAbaInicial, setLgpdAbaInicial] = useState<'geral' | 'alunos'>('geral');

  // Modal Detalhes Turma
  const [turmaDetalhesModal, setTurmaDetalhesModal] = useState<Turma | null>(null);

  const setEscolaSelecionada = (id: number | null) => {
    const user = usuarioLogado || api.getUsuarioSalvo();
    if (user?.role === 'ROLE_ENCARREGADA') {
      const permittedIds: number[] = user.escolasIds?.length
        ? user.escolasIds
        : (user.escolas?.map((e) => e.id) || (user.escolaId ? [user.escolaId] : []));

      if (id !== null && permittedIds.includes(id)) {
        setEscolaSelecionadaState(id);
        api.setEscolaAtivaId(id);
        return;
      }
      if (id === null) {
        setEscolaSelecionadaState(null);
        api.setEscolaAtivaId(null);
        return;
      }
      const fallback = permittedIds[0] || null;
      setEscolaSelecionadaState(fallback);
      api.setEscolaAtivaId(fallback);
      return;
    }
    setEscolaSelecionadaState(id);
    api.setEscolaAtivaId(id);
  };

  useEffect(() => {
    const user = api.getUsuarioSalvo();
    if (user) {
      setUsuarioLogado(user);
      if (user.role === 'ROLE_ENCARREGADA') {
        const permittedIds: number[] = user.escolasIds?.length
          ? user.escolasIds
          : (user.escolas?.map((e) => e.id) || (user.escolaId ? [user.escolaId] : []));

        const savedEscolaId = api.getEscolaAtivaId();
        if (savedEscolaId && permittedIds.includes(savedEscolaId)) {
          setEscolaSelecionadaState(savedEscolaId);
        } else if (permittedIds.length === 1) {
          setEscolaSelecionadaState(permittedIds[0]);
          api.setEscolaAtivaId(permittedIds[0]);
        } else {
          setEscolaSelecionadaState(null);
          api.setEscolaAtivaId(null);
        }
      } else {
        const savedEscolaId = api.getEscolaAtivaId();
        if (savedEscolaId) {
          setEscolaSelecionadaState(savedEscolaId);
        }
      }
      const { minutos } = api.getTempoRestanteSessao();
      setTempoRestanteMin(minutos);
      carregarDadosIniciais(user);
    } else {
      setUsuarioLogado(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!usuarioLogado) return;
    const interval = setInterval(() => {
      const user = api.getUsuarioSalvo();
      if (!user) {
        handleLogout();
        mostrarFeedback('erro', 'Sua sessão expirou (limite de 2 horas). Faça login novamente.');
      } else {
        const { minutos } = api.getTempoRestanteSessao();
        setTempoRestanteMin(minutos);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [usuarioLogado]);

  useEffect(() => {
    if (escolaSelecionada !== null && usuarioLogado) {
      // Boas Práticas & LGPD: Rotas institucionais e de autenticação NÃO devem carregar
      // dados sensíveis (alunos/matrículas) antecipadamente.
      if (pathname === '/direcionamento' || pathname === '/login' || pathname === '/') {
        return;
      }
      carregarDadosEscola();
      if (pathname === '/alunos') {
        carregarAlunosPaginados(0);
      } else if (pathname === '/matriculas') {
        carregarMatriculas();
      }
    }
  }, [escolaSelecionada, pathname]);

  const carregarDadosIniciais = async (userAtivo?: LoginResponse | null) => {
    setLoading(true);
    try {
      const activeUser = userAtivo !== undefined ? userAtivo : (usuarioLogado || api.getUsuarioSalvo());
      let escolaFiltro: number | undefined = undefined;

      if (activeUser) {
        setUsuarioLogado(activeUser);
        if (activeUser.role === 'ROLE_ENCARREGADA') {
          const permittedIds: number[] = activeUser.escolasIds?.length
            ? activeUser.escolasIds
            : (activeUser.escolas?.map((e) => e.id) || (activeUser.escolaId ? [activeUser.escolaId] : []));

          const savedEscolaId = api.getEscolaAtivaId();
          if (savedEscolaId && permittedIds.includes(savedEscolaId)) {
            escolaFiltro = savedEscolaId;
            setEscolaSelecionadaState(savedEscolaId);
          } else if (permittedIds.length === 1) {
            escolaFiltro = permittedIds[0];
            setEscolaSelecionadaState(permittedIds[0]);
            api.setEscolaAtivaId(permittedIds[0]);
          } else {
            escolaFiltro = undefined;
            setEscolaSelecionadaState(null);
            api.setEscolaAtivaId(null);
          }
        } else {
          const savedEscolaId = api.getEscolaAtivaId();
          if (savedEscolaId) {
            escolaFiltro = savedEscolaId;
            setEscolaSelecionadaState(savedEscolaId);
          }
        }
        const { minutos } = api.getTempoRestanteSessao();
        setTempoRestanteMin(minutos);
      } else {
        setUsuarioLogado(null);
      }

      // Carrega exclusivamente escolas, cursos e turmas gerais (metadados públicos sem dados pessoais)
      const esc = await api.getEscolas();
      setEscolas(esc);
      const isAuth = !!activeUser;
      const [c, t] = await Promise.all([
        api.getCursos(escolaFiltro),
        api.getTurmas(undefined, escolaFiltro, !isAuth),
      ]);
      setCursos(c);
      setTurmas(t);
      // NUNCA carrega api.getMatriculas() ou api.getAlunos() no boot inicial!
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao carregar dados: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosEscola = async () => {
    setRefreshing(true);
    try {
      const activeUser = usuarioLogado || api.getUsuarioSalvo();
      const permittedIds: number[] = activeUser?.escolasIds?.length
        ? activeUser.escolasIds
        : (activeUser?.escolas?.map((e) => e.id) || (activeUser?.escolaId ? [activeUser.escolaId] : []));

      let escolaFiltro = escolaSelecionada || undefined;
      if (activeUser?.role === 'ROLE_ENCARREGADA') {
        if (escolaSelecionada && permittedIds.includes(escolaSelecionada)) {
          escolaFiltro = escolaSelecionada;
        } else if (permittedIds.length > 0) {
          escolaFiltro = permittedIds[0];
        } else if (activeUser.escolaId) {
          escolaFiltro = activeUser.escolaId;
        }
      }

      if (activeUser) {
        const [c, t] = await Promise.all([
          api.getCursos(escolaFiltro),
          api.getTurmas(undefined, escolaFiltro),
        ]);
        setCursos(c);
        setTurmas(t);

        if (c.length > 0 && (!novaTurma.cursoId || !c.some((cur) => cur.id === novaTurma.cursoId))) {
          setNovaTurma((prev) => ({ ...prev, cursoId: c[0]?.id || 0 }));
        }
      } else {
        const [c, t] = await Promise.all([
          api.getCursos(escolaFiltro),
          api.getTurmas(undefined, escolaFiltro, true),
        ]);
        setCursos(c);
        setTurmas(t);
      }
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao sincronizar dados da escola: ' + e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const carregarMatriculas = async () => {
    setRefreshing(true);
    try {
      const m = await api.getMatriculas(escolaSelecionada || undefined);
      setMatriculas(m);
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao carregar matrículas: ' + e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const carregarAlunosPaginados = async (pagina: number = 0, buscaOverride?: string) => {
    setLoadingAlunos(true);
    try {
      const termo = buscaOverride !== undefined ? buscaOverride : buscaAlunoTermo;
      const res = await api.getAlunosPaginado(
        pagina,
        10,
        escolaSelecionada || undefined,
        termo || undefined
      );
      setPaginaAlunos(res);
      setPaginaAtualAlunos(pagina);
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao pesquisar alunos: ' + e.message);
    } finally {
      setLoadingAlunos(false);
    }
  };

  const mostrarFeedback = (tipo: 'sucesso' | 'erro', texto: string) => {
    setFeedbackMsg({ tipo, texto });
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  const fecharFeedback = () => {
    setFeedbackMsg(null);
  };

  const handleLogout = async () => {
    await api.logout();
    setUsuarioLogado(null);
    setEscolaSelecionadaState(null);
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    } else {
      router.replace('/login');
    }
  };

  const handleCancelarMatricula = async (matriculaId: number) => {
    if (!confirm('Deseja realmente cancelar esta matrícula? A vaga na turma será liberada imediatamente.')) return;
    try {
      await api.cancelarMatricula(matriculaId);
      setMatriculas((prev) =>
        prev.map((m) => (m.id === matriculaId ? { ...m, status: 'CANCELADA' } : m))
      );
      mostrarFeedback('sucesso', 'Matrícula cancelada com sucesso. A vaga foi liberada na turma.');
      await Promise.all([carregarMatriculas(), carregarDadosEscola()]);
    } catch (e: any) {
      mostrarFeedback('erro', e.message || 'Erro ao cancelar matrícula.');
    }
  };

  const handleSalvarCursoComDisciplinas = async (cursoData: Curso) => {
    const activeUser = usuarioLogado || api.getUsuarioSalvo();
    if (activeUser?.role === 'ROLE_ENCARREGADA') {
      const permittedIds: number[] = activeUser?.escolasIds?.length
        ? activeUser.escolasIds
        : (activeUser?.escolas?.map((e) => e.id) || (activeUser?.escolaId ? [activeUser.escolaId] : []));
      if (cursoData.escolaId && !permittedIds.includes(cursoData.escolaId)) {
        mostrarFeedback('erro', 'Você não possui permissão para cadastrar cursos nesta escola.');
        return;
      }
    }
    const salvo = await api.createCurso(cursoData);
    mostrarFeedback('sucesso', `Curso "${salvo.nome}" cadastrado com sucesso!`);
    await carregarDadosEscola();
  };

  const handleCriarTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activeUser = usuarioLogado || api.getUsuarioSalvo();
      if (activeUser?.role === 'ROLE_ENCARREGADA') {
        const permittedIds: number[] = activeUser?.escolasIds?.length
          ? activeUser.escolasIds
          : (activeUser?.escolas?.map((e) => e.id) || (activeUser?.escolaId ? [activeUser.escolaId] : []));
        const cursoEscolhido = cursos.find((c) => c.id === novaTurma.cursoId);
        if (cursoEscolhido?.escolaId && !permittedIds.includes(cursoEscolhido.escolaId)) {
          mostrarFeedback('erro', 'Você não possui permissão para abrir turmas nesta escola.');
          return;
        }
      }

      await api.createTurma(novaTurma);
      setShowModalTurma(false);
      setNovaTurma({
        cursoId: cursos[0]?.id || 0,
        codigo: '',
        dataAberturaMatricula: '',
        dataFechamentoMatricula: '',
        dataInicioAulas: '',
        dataFimAulas: '',
        vagasTotais: 30,
        idadeMinima: undefined,
        idadeMaxima: undefined,
        materiasNomes: [],
      });
      mostrarFeedback('sucesso', `Turma ${novaTurma.codigo} aberta com sucesso!`);
      await carregarDadosEscola();
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao criar turma: ' + e.message);
    }
  };

  const handleSubmeterInscricao = async (payload: InscricaoExternaPayload) => {
    await api.inscreverExterno(payload);
    mostrarFeedback('sucesso', 'Matrícula realizada com sucesso!');
    await carregarDadosEscola();
  };

  const handleUploadPlanilha = async (file: File): Promise<ImportacaoResultado> => {
    const res = await api.importarPlanilha(file);
    mostrarFeedback('sucesso', `Processamento concluído: ${res.sucesso} matrículas importadas com sucesso!`);
    await carregarDadosEscola();
    return res;
  };

  const abrirModalNovaTurma = (cursoId?: number) => {
    const activeUser = usuarioLogado || api.getUsuarioSalvo();
    const permittedIds: number[] = activeUser?.escolasIds?.length
      ? activeUser.escolasIds
      : (activeUser?.escolas?.map((e) => e.id) || (activeUser?.escolaId ? [activeUser.escolaId] : []));

    const isEncarregada = activeUser?.role === 'ROLE_ENCARREGADA';
    const cursosPermitidos = isEncarregada && permittedIds.length > 0
      ? cursos.filter((c) => !c.escolaId || permittedIds.includes(c.escolaId))
      : cursos;

    let targetCursoId = cursoId;
    if (targetCursoId) {
      if (isEncarregada && permittedIds.length > 0) {
        const cursoAlvo = cursos.find((c) => c.id === targetCursoId);
        if (cursoAlvo?.escolaId && !permittedIds.includes(cursoAlvo.escolaId)) {
          mostrarFeedback('erro', 'Você não possui permissão para abrir turmas para esta escola.');
          return;
        }
      }
    } else {
      targetCursoId = cursosPermitidos[0]?.id || 0;
    }

    if (targetCursoId) {
      setTurmaCursoPreSelecionadoId(targetCursoId);
      setNovaTurma((prev) => ({ ...prev, cursoId: targetCursoId }));
    }
    setShowModalTurma(true);
  };

  const abrirModalPerfil = (alunoId: number, autoDecId?: number | null) => {
    setPerfilAlunoId(alunoId);
    setAutoDeclaracaoMatriculaId(autoDecId || null);
    setShowModalPerfil(true);
  };

  const abrirModalLgpd = (aba: 'geral' | 'alunos' = 'geral') => {
    setLgpdAbaInicial(aba);
    setShowModalLgpd(true);
  };

  const abrirModalDetalhesTurma = async (turmaOuId: Turma | number) => {
    if (typeof turmaOuId === 'object' && turmaOuId !== null) {
      setTurmaDetalhesModal(turmaOuId);
      return;
    }
    const id = Number(turmaOuId);
    if (!id) return;
    const jaCarregada = turmas.find((t) => t.id === id);
    if (jaCarregada) {
      setTurmaDetalhesModal(jaCarregada);
      return;
    }
    try {
      const turmaBuscada = await api.getTurmaPorId(id);
      setTurmaDetalhesModal(turmaBuscada);
    } catch (e) {
      console.warn('Erro ao carregar turma por ID:', e);
    }
  };

  const fecharModalDetalhesTurma = () => {
    setTurmaDetalhesModal(null);
  };

  const escolaAtualObj = escolas.find((e) => e.id === escolaSelecionada) || null;

  return (
    <AppContext.Provider
      value={{
        usuarioLogado,
        escolas,
        escolaSelecionada,
        setEscolaSelecionada,
        escolaAtualObj,
        cursos,
        turmas,
        matriculas,
        loading,
        refreshing,
        feedbackMsg,
        tempoRestanteMin,
        mostrarFeedback,
        fecharFeedback,
        carregarDadosEscola,
        carregarMatriculas,
        carregarDadosIniciais,
        handleLogout,
        handleCancelarMatricula,
        handleSalvarCursoComDisciplinas,
        handleCriarTurma,
        handleSubmeterInscricao,
        handleUploadPlanilha,
        paginaAlunos,
        paginaAtualAlunos,
        buscaAlunoTermo,
        loadingAlunos,
        setBuscaAlunoTermo,
        setPaginaAtualAlunos,
        carregarAlunosPaginados,
        showModalTurma,
        setShowModalTurma,
        novaTurma,
        setNovaTurma,
        turmaCursoPreSelecionadoId,
        setTurmaCursoPreSelecionadoId,
        abrirModalNovaTurma,
        abrirModalPerfil,
        abrirModalLgpd,
        showModalPerfil,
        setShowModalPerfil,
        perfilAlunoId,
        autoDeclaracaoMatriculaId,
        setAutoDeclaracaoMatriculaId,
        turmaDetalhesModal,
        abrirModalDetalhesTurma,
        fecharModalDetalhesTurma,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
