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
  carregarDadosEscola: () => Promise<void>;
  carregarMatriculas: () => Promise<void>;
  carregarDadosIniciais: (userAtivo?: LoginResponse | null) => Promise<void>;
  handleLogout: () => void;
  handlePromoverSuplente: (matriculaId: number, alunoNome: string) => Promise<void>;
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
  abrirModalPerfil: (alunoId: number) => void;
  abrirModalLgpd: (aba?: 'geral' | 'alunos') => void;
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
    diasToleranciaSuplencia: 60,
  });

  // Modal Perfil & LGPD
  const [perfilAlunoId, setPerfilAlunoId] = useState<number | null>(null);
  const [showModalPerfil, setShowModalPerfil] = useState(false);
  const [showModalLgpd, setShowModalLgpd] = useState(false);
  const [lgpdAbaInicial, setLgpdAbaInicial] = useState<'geral' | 'alunos'>('geral');

  const setEscolaSelecionada = (id: number | null) => {
    setEscolaSelecionadaState(id);
    api.setEscolaAtivaId(id);
  };

  useEffect(() => {
    const user = api.getUsuarioSalvo();
    if (user) {
      setUsuarioLogado(user);
      const savedEscolaId = api.getEscolaAtivaId();
      if (savedEscolaId) {
        setEscolaSelecionadaState(savedEscolaId);
      } else if (user.role === 'ROLE_ENCARREGADA' && user.escolaId) {
        setEscolaSelecionadaState(user.escolaId);
        api.setEscolaAtivaId(user.escolaId);
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
      if (activeUser) {
        setUsuarioLogado(activeUser);
        if (activeUser.role === 'ROLE_ENCARREGADA' && activeUser.escolaId) {
          setEscolaSelecionadaState(activeUser.escolaId);
          api.setEscolaAtivaId(activeUser.escolaId);
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
        api.getCursos(),
        api.getTurmas(undefined, undefined, !isAuth),
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
      if (usuarioLogado || api.getUsuarioSalvo()) {
        const [c, t] = await Promise.all([
          api.getCursos(escolaSelecionada || undefined),
          api.getTurmas(undefined, escolaSelecionada || undefined),
        ]);
        setCursos(c);
        setTurmas(t);

        if (c.length > 0 && (!novaTurma.cursoId || !c.some((cur) => cur.id === novaTurma.cursoId))) {
          setNovaTurma((prev) => ({ ...prev, cursoId: c[0]?.id || 0 }));
        }
      } else {
        const [c, t] = await Promise.all([
          api.getCursos(escolaSelecionada || undefined),
          api.getTurmas(undefined, escolaSelecionada || undefined, true),
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

  const handleLogout = () => {
    api.logout();
    setUsuarioLogado(null);
    setEscolaSelecionadaState(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.replace('/login');
    }
  };

  const handlePromoverSuplente = async (matriculaId: number, alunoNome: string) => {
    if (!confirm(`Deseja promover o suplente ${alunoNome} para vaga efetiva nesta turma?`)) return;
    try {
      await api.promoverSuplente(matriculaId);
      mostrarFeedback('sucesso', `Suplente ${alunoNome} promovido com sucesso para vaga efetiva!`);
      await carregarDadosEscola();
    } catch (e: any) {
      mostrarFeedback('erro', e.message || 'Erro ao promover suplente.');
    }
  };

  const handleCancelarMatricula = async (matriculaId: number) => {
    if (!confirm('Deseja realmente cancelar esta matrícula? A vaga será liberada imediatamente para o próximo da fila de espera.')) return;
    try {
      await api.cancelarMatricula(matriculaId);
      mostrarFeedback('sucesso', 'Matrícula cancelada e vaga disponibilizada para a fila de espera.');
      await carregarDadosEscola();
    } catch (e: any) {
      mostrarFeedback('erro', e.message || 'Erro ao cancelar matrícula.');
    }
  };

  const handleSalvarCursoComDisciplinas = async (cursoData: Curso) => {
    const salvo = await api.createCurso(cursoData);
    mostrarFeedback('sucesso', `Curso "${salvo.nome}" cadastrado com sucesso!`);
    await carregarDadosEscola();
  };

  const handleCriarTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTurma(novaTurma);
      setShowModalTurma(false);
      mostrarFeedback('sucesso', `Turma ${novaTurma.codigo} aberta com sucesso!`);
      await carregarDadosEscola();
    } catch (e: any) {
      mostrarFeedback('erro', 'Erro ao criar turma: ' + e.message);
    }
  };

  const handleSubmeterInscricao = async (payload: InscricaoExternaPayload) => {
    await api.inscreverExterno(payload);
    mostrarFeedback('sucesso', 'Inscrição confirmada com sucesso!');
    await carregarDadosEscola();
  };

  const handleUploadPlanilha = async (file: File): Promise<ImportacaoResultado> => {
    const res = await api.importarPlanilha(file);
    mostrarFeedback('sucesso', `Processamento concluído: ${res.sucesso} matrículas importadas com sucesso!`);
    await carregarDadosEscola();
    return res;
  };

  const abrirModalNovaTurma = (cursoId?: number) => {
    if (cursoId) {
      setTurmaCursoPreSelecionadoId(cursoId);
      setNovaTurma((prev) => ({ ...prev, cursoId }));
    }
    setShowModalTurma(true);
  };

  const abrirModalPerfil = (alunoId: number) => {
    setPerfilAlunoId(alunoId);
    setShowModalPerfil(true);
  };

  const abrirModalLgpd = (aba: 'geral' | 'alunos' = 'geral') => {
    setLgpdAbaInicial(aba);
    setShowModalLgpd(true);
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
        carregarDadosEscola,
        carregarMatriculas,
        carregarDadosIniciais,
        handleLogout,
        handlePromoverSuplente,
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
