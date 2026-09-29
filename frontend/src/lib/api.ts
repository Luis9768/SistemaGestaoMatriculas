const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Escola {
  id: number;
  nome: string;
  sigla: string;
  descricao?: string;
  corTema?: string; // violet, rose, blue, amber
  ativa?: boolean;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_ENCARREGADA';
  escolaId?: number;
  escolaNome?: string;
  escolaSigla?: string;
  ativo?: boolean;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  id: number;
  nome: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_ENCARREGADA';
  escolaId?: number;
  escolaNome?: string;
  escolaSigla?: string;
}

export interface RecuperacaoResposta {
  mensagem: string;
  email: string;
  emailMascarado: string;
}

export interface RedefinirSenhaPayload {
  email: string;
  codigo: string;
  novaSenha: string;
  confirmacaoSenha: string;
}

export interface Responsavel {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  grauParentesco?: string;
}

export interface Disciplina {
  id?: number;
  cursoId?: number;
  nome: string;
  cargaHoraria: number;
  descricao?: string;
  professorResponsavel?: string;
}

export interface Curso {
  id?: number;
  escolaId?: number;
  escolaNome?: string;
  escolaSigla?: string;
  nome: string;
  descricao?: string;
  tipo: 'OFICINA' | 'REGULAR';
  modalidade?: 'FORMACAO' | 'NUCLEO' | 'OFICINA';
  duracaoMeses: number;
  cargaHoraria: number;
  ativo?: boolean;
  disciplinas?: Disciplina[];
}

export interface Turma {
  id?: number;
  cursoId: number;
  cursoNome?: string;
  escolaId?: number;
  escolaNome?: string;
  escolaSigla?: string;
  codigo: string;
  dataAberturaMatricula: string;
  dataFechamentoMatricula: string;
  dataInicioAulas: string;
  dataFimAulas: string;
  vagasTotais: number;
  vagasOcupadas?: number;
  idadeMinima?: number;
  idadeMaxima?: number;
  diasToleranciaSuplencia?: number;
  suplenciaAberta?: boolean;
  status?: 'ABERTA' | 'FECHADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  matriculaAberta?: boolean;
}

export interface Aluno {
  id?: number;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  menorDeIdade?: boolean;
  responsavel?: Responsavel;
  consentimentoLgpd?: boolean;
  dataConsentimentoLgpd?: string;
  consentimentoUsoImagem?: boolean;
  termoPapelEntregue?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Matricula {
  id: number;
  alunoId: number;
  alunoNome: string;
  alunoCpf: string;
  alunoEmail: string;
  turmaId: number;
  turmaCodigo: string;
  cursoNome: string;
  escolaId?: number;
  escolaNome?: string;
  escolaSigla?: string;
  responsavelNome?: string;
  responsavelTelefone?: string;
  dataMatricula: string;
  canalOrigem: 'PRESENCIAL' | 'FORMS' | 'SITE' | 'PLANILHA' | 'CULTURA_AZ';
  status: 'PENDENTE' | 'INSCRITO' | 'EM_SELECAO' | 'APROVADO' | 'CONFIRMADA' | 'CANCELADA' | 'DESISTENTE_FALTAS' | 'FILA_ESPERA';
  observacoes?: string;
}

export interface ImportacaoResultado {
  totalLinhas: number;
  sucesso: number;
  ignoradas: number;
  falhas: number;
  logs: string[];
}

export interface RegistroPresenca {
  id?: number;
  matriculaId: number;
  dataAula: string;
  status: 'PRESENTE' | 'FALTA' | 'JUSTIFICADA';
  justificativa?: string;
  conteudoMinistrado?: string;
}

export interface ResumoFrequencia {
  totalAulas: number;
  totalPresencas: number;
  totalFaltas: number;
  totalJustificadas: number;
  porcentagemFrequencia: number;
  faltasConsecutivas: number;
  riscoDesistencia: boolean;
  atingiuLimiteFaltas: boolean;
}

export interface StatusDistribuicao {
  status: string;
  label: string;
  quantidade: number;
  percentual: number;
  cor: string;
}

export interface CursoStats {
  cursoId: number;
  cursoNome: string;
  escolaSigla: string;
  escolaCorTema: string;
  modalidade: string;
  totalInscricoes: number;
  totalMatriculas: number;
  totalEvasoes: number;
  totalConcluidos: number;
  taxaEvasao: number;
}

export interface DashboardStats {
  totalGeral: number;
  totalInscricoes: number;
  totalMatriculados: number;
  totalEvasoes: number;
  totalCancelados: number;
  totalFormados: number;
  totalFilaEspera: number;
  taxaEvasao: number;
  taxaConclusao: number;
  taxaOcupacaoVagas: number;
  totalVagas: number;
  vagasOcupadas: number;
  totalCursos: number;
  totalTurmas: number;
  distribuicaoStatus: StatusDistribuicao[];
  cursosStats: CursoStats[];
}

export interface AlunoTurmaFrequencia {
  alunoId: number;
  matriculaId: number;
  alunoNome: string;
  alunoCpf: string;
  menorDeIdade: boolean;
  statusMatricula: string;
  totalAulas: number;
  presencas: number;
  faltas: number;
  justificadas: number;
  porcentagemPresenca: number;
  faltasConsecutivas: number;
  riscoDesistencia: boolean;
  atingiuLimiteFaltas: boolean;
}

export interface TurmaDashboard {
  turmaId: number;
  turmaCodigo: string;
  cursoNome: string;
  modalidade: string;
  escolaNome: string;
  escolaSigla: string;
  escolaCorTema: string;
  vagasTotais: number;
  vagasOcupadas: number;
  taxaOcupacao: number;
  totalAulasRegistradas: number;
  somaPresencas: number;
  somaFaltas: number;
  somaJustificadas: number;
  totalRegistrosPresenca: number;
  taxaAssiduidadeTurma: number;
  totalAlunos: number;
  alunosEmRiscoFaltas: number;
  alunosDesistentes: number;
  alunos: AlunoTurmaFrequencia[];
}

export interface MatriculaItemPerfil {
  matriculaId: number;
  turmaId: number;
  turmaNome: string;
  turmaCodigo: string;
  cursoNome: string;
  modalidade?: 'FORMACAO' | 'NUCLEO' | 'OFICINA';
  escolaNome: string;
  escolaSigla: string;
  escolaCorTema: string;
  dataMatricula: string;
  dataInicio?: string;
  dataTermino?: string;
  horario?: string;
  diasSemana?: string;
  status: string;
  formado: boolean;
  desistenteFaltas: boolean;
  frequencia: ResumoFrequencia;
  presencas: RegistroPresenca[];
}

export interface PerfilAluno {
  aluno: Aluno;
  cursosAtuais: MatriculaItemPerfil[];
  historicoCursos: MatriculaItemPerfil[];
  totalCursosConcluidos: number;
  totalCursosAtivos: number;
}

export interface InscricaoExternaPayload {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  responsavelNome?: string;
  responsavelCpf?: string;
  responsavelTelefone?: string;
  responsavelEmail?: string;
  responsavelParentesco?: string;
  turmaId: number;
  canalOrigem: 'PRESENCIAL' | 'FORMS' | 'SITE' | 'PLANILHA' | 'CULTURA_AZ';
  observacoes?: string;
  consentimentoLgpd?: boolean;
  consentimentoUsoImagem?: boolean;
  termoPapelEntregue?: boolean;
}

export const formatarCpfMascara = (cpf?: string): string => {
  if (!cpf) return '-';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.substring(0, 3)}.***.***-${clean.substring(9)}`;
  }
  return cpf;
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sigma_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Autenticação
  async login(email: string, senha: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Credenciais inválidas' }));
      throw new Error(err.message || 'Falha no login');
    }
    const data: LoginResponse = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('sigma_jwt_token', data.token);
      localStorage.setItem('sigma_user', JSON.stringify(data));
      localStorage.setItem('sigma_token_timestamp', Date.now().toString());
    }
    return data;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sigma_jwt_token');
      localStorage.removeItem('sigma_user');
      localStorage.removeItem('sigma_token_timestamp');
    }
  },

  async solicitarRecuperacaoSenha(email: string): Promise<RecuperacaoResposta> {
    const res = await fetch(`${API_BASE}/auth/esqueci-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao solicitar código de recuperação' }));
      throw new Error(err.message || 'Erro ao solicitar código de recuperação');
    }
    return res.json();
  },

  async validarCodigoRecuperacao(email: string, codigo: string): Promise<{ valido: boolean; mensagem: string }> {
    const res = await fetch(`${API_BASE}/auth/validar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codigo }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Código de verificação incorreto ou expirado' }));
      throw new Error(err.message || 'Código de verificação incorreto ou expirado');
    }
    return res.json();
  },

  async redefinirSenha(payload: RedefinirSenhaPayload): Promise<{ sucesso: boolean; mensagem: string }> {
    const res = await fetch(`${API_BASE}/auth/redefinir-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao redefinir senha' }));
      throw new Error(err.message || 'Erro ao redefinir senha');
    }
    return res.json();
  },

  getUsuarioSalvo(): LoginResponse | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sigma_jwt_token');
      const timestamp = localStorage.getItem('sigma_token_timestamp');
      if (!token) return null;

      // Validação estrita de expiração: máximo de 2 horas (7.200.000 ms)
      const MAX_DURACAO_MS = 2 * 60 * 60 * 1000;
      if (timestamp) {
        const idadeMs = Date.now() - Number(timestamp);
        if (idadeMs > MAX_DURACAO_MS) {
          this.logout();
          return null;
        }
      }

      const raw = localStorage.getItem('sigma_user');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  getTempoRestanteSessao(): { minutos: number; expirado: boolean } {
    if (typeof window !== 'undefined') {
      const timestamp = localStorage.getItem('sigma_token_timestamp');
      if (!timestamp) return { minutos: 0, expirado: true };
      const MAX_DURACAO_MS = 2 * 60 * 60 * 1000;
      const passado = Date.now() - Number(timestamp);
      const restante = MAX_DURACAO_MS - passado;
      if (restante <= 0) return { minutos: 0, expirado: true };
      return { minutos: Math.floor(restante / 60000), expirado: false };
    }
    return { minutos: 0, expirado: true };
  },

  // Escolas
  async getEscolas(): Promise<Escola[]> {
    const res = await fetch(`${API_BASE}/escolas`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar escolas');
    return res.json();
  },

  // Cursos
  async getCursos(escolaId?: number, tipo?: string): Promise<Curso[]> {
    const params = new URLSearchParams();
    if (escolaId) params.append('escolaId', escolaId.toString());
    if (tipo) params.append('tipo', tipo);
    const res = await fetch(`${API_BASE}/cursos?${params.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar cursos');
    return res.json();
  },

  async createCurso(data: Curso): Promise<Curso> {
    const res = await fetch(`${API_BASE}/cursos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao criar curso' }));
      throw new Error(err.message || 'Erro ao criar curso');
    }
    return res.json();
  },

  async addDisciplina(cursoId: number, data: Disciplina): Promise<Disciplina> {
    const res = await fetch(`${API_BASE}/cursos/${cursoId}/disciplinas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao adicionar disciplina' }));
      throw new Error(err.message || 'Erro ao adicionar disciplina');
    }
    return res.json();
  },

  async removeDisciplina(cursoId: number, disciplinaId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/cursos/${cursoId}/disciplinas/${disciplinaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erro ao remover disciplina');
  },

  async getDisciplinas(cursoId: number): Promise<Disciplina[]> {
    const res = await fetch(`${API_BASE}/cursos/${cursoId}/disciplinas`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar disciplinas');
    return res.json();
  },

  // Turmas
  async getTurmas(cursoId?: number, escolaId?: number, apenasAbertas?: boolean): Promise<Turma[]> {
    const params = new URLSearchParams();
    if (cursoId) params.append('cursoId', cursoId.toString());
    if (escolaId) params.append('escolaId', escolaId.toString());
    if (apenasAbertas) params.append('apenasAbertas', 'true');
    const res = await fetch(`${API_BASE}/turmas?${params.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar turmas');
    return res.json();
  },

  async createTurma(data: Turma): Promise<Turma> {
    const res = await fetch(`${API_BASE}/turmas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao criar turma' }));
      throw new Error(err.message || 'Erro ao criar turma');
    }
    return res.json();
  },

  // Alunos (Paginado com busca por Nome, E-mail, CPF, Global ou por Escola)
  async getAlunosPaginado(
    page: number = 0,
    size: number = 10,
    escolaId?: number,
    busca?: string,
    nome?: string,
    email?: string,
    cpf?: string
  ): Promise<PageResponse<Aluno>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (escolaId) params.append('escolaId', escolaId.toString());
    if (busca) params.append('busca', busca);
    if (nome) params.append('nome', nome);
    if (email) params.append('email', email);
    if (cpf) params.append('cpf', cpf);

    const res = await fetch(`${API_BASE}/alunos?${params.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erro ao pesquisar alunos');
    return res.json();
  },

  async createAluno(data: Aluno): Promise<Aluno> {
    const res = await fetch(`${API_BASE}/alunos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao cadastrar aluno' }));
      throw new Error(err.message || 'Erro ao cadastrar aluno');
    }
    return res.json();
  },

  // Matrículas
  async getMatriculas(escolaId?: number, canal?: string, status?: string): Promise<Matricula[]> {
    const params = new URLSearchParams();
    if (escolaId) params.append('escolaId', escolaId.toString());
    if (canal) params.append('canal', canal);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/matriculas?${params.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar matrículas');
    return res.json();
  },

  async inscreverExterno(payload: InscricaoExternaPayload): Promise<Matricula> {
    const res = await fetch(`${API_BASE}/matriculas/inscrever`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao realizar matrícula' }));
      throw new Error(err.message || 'Erro ao realizar matrícula');
    }
    return res.json();
  },

  async cancelarMatricula(id: number): Promise<Matricula> {
    const res = await fetch(`${API_BASE}/matriculas/${id}/cancelar`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao cancelar matrícula' }));
      throw new Error(err.message || 'Erro ao cancelar matrícula');
    }
    return res.json();
  },

  async desligarPorFaltas(id: number, motivo?: string): Promise<Matricula> {
    const params = new URLSearchParams();
    if (motivo) params.append('motivo', motivo);
    const res = await fetch(`${API_BASE}/matriculas/${id}/desligar-faltas?${params.toString()}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao registrar desligamento por faltas' }));
      throw new Error(err.message || 'Erro ao registrar desligamento por faltas');
    }
    return res.json();
  },

  async promoverSuplente(id: number): Promise<Matricula> {
    const res = await fetch(`${API_BASE}/matriculas/${id}/promover-suplente`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao promover suplente para matrícula ativa' }));
      throw new Error(err.message || 'Erro ao promover suplente para matrícula ativa');
    }
    return res.json();
  },

  // Importação
  async importarPlanilha(file: File): Promise<ImportacaoResultado> {
    const formData = new FormData();
    formData.append('file', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('sigma_jwt_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/importacao/planilha`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Falha ao importar planilha' }));
      throw new Error(err.message || 'Falha ao importar planilha');
    }
    return res.json();
  },

  downloadModeloCsvUrl(): string {
    return `${API_BASE}/importacao/modelo-csv`;
  },

  // Perfil do Aluno e Frequência
  async getPerfilAluno(alunoId: number): Promise<PerfilAluno> {
    const res = await fetch(`${API_BASE}/alunos/${alunoId}/perfil`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao carregar perfil do aluno' }));
      throw new Error(err.message || 'Erro ao carregar perfil do aluno');
    }
    return res.json();
  },

  async registrarPresenca(matriculaId: number, presenca: Partial<RegistroPresenca>): Promise<RegistroPresenca> {
    const res = await fetch(`${API_BASE}/alunos/matriculas/${matriculaId}/presencas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(presenca),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao registrar frequência' }));
      throw new Error(err.message || 'Erro ao registrar frequência');
    }
    return res.json();
  },

  // Dashboard de Evasões, Matrículas e Soma de Presenças
  async getDashboardStats(escolaId?: number): Promise<DashboardStats | null> {
    const params = new URLSearchParams();
    if (escolaId) params.append('escolaId', escolaId.toString());
    const res = await fetch(`${API_BASE}/dashboard/stats?${params.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return null;
      }
      const err = await res.json().catch(() => ({ message: 'Erro ao carregar dados do dashboard' }));
      throw new Error(err.message || 'Erro ao carregar dados do dashboard');
    }
    return res.json();
  },

  async getDashboardTurma(turmaId: number): Promise<TurmaDashboard | null> {
    const res = await fetch(`${API_BASE}/dashboard/turma/${turmaId}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return null;
      }
      const err = await res.json().catch(() => ({ message: 'Erro ao carregar dashboard da turma' }));
      throw new Error(err.message || 'Erro ao carregar dashboard da turma');
    }
    return res.json();
  },
};
