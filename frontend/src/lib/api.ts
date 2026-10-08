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
  escolasIds?: number[];
  escolas?: Escola[];
  ativo?: boolean;
}

export interface CadastrarUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  role: 'ROLE_ADMIN' | 'ROLE_ENCARREGADA';
  escolaId?: number;
  escolasIds?: number[];
}

export interface AtualizarUsuarioPayload {
  nome: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_ENCARREGADA';
  escolasIds?: number[];
  senha?: string;
  ativo?: boolean;
}

export interface AtualizarContatoPayload {
  email?: string;
  telefone?: string;
  responsavelNome?: string;
  responsavelTelefone?: string;
  responsavelEmail?: string;
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
  escolasIds?: number[];
  escolas?: Escola[];
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
  duracaoMeses?: number;
  duracaoEstimada?: string;
  cargaHoraria: number;
  ativo?: boolean;
  disciplinas?: Disciplina[];
}

export interface TurmaMateria {
  id?: number;
  turmaId?: number;
  nome: string;
  duracaoEstimada?: string;
  cargaHoraria?: number;
  professorResponsavel?: string;
  ordem?: number;
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
  status?: 'ABERTA' | 'FECHADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  matriculaAberta?: boolean;
  educadorResponsavel?: string;
  diasHorariosLocal?: string;
  materias?: TurmaMateria[];
  materiasNomes?: string[];
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
  endereco?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  genero?: string;
  neurodiverso?: boolean;
  neurodiversoDetalhe?: string;
  pcd?: boolean;
  pcdDetalhe?: string;
  contatoEmergencia?: string;
  consentimentoLgpd?: boolean;
  consentimentoLgpdDadosSensiveis?: boolean;
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
  alunoTelefone?: string;
  alunoMenorDeIdade?: boolean;
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
  status: 'CONFIRMADA' | 'CANCELADA' | 'DESISTENTE_FALTAS' | 'CONCLUIDA' | string;
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
  materiaId?: number;
  dataAula: string;
  status: 'PRESENTE' | 'FALTA' | 'JUSTIFICADA';
  justificativa?: string;
  conteudoMinistrado?: string;
  responsavelRegistro?: string;
}

export interface ChamadaItem {
  alunoId: number;
  alunoNome: string;
  alunoCpf?: string;
  matriculaId: number;
  status: 'PRESENTE' | 'FALTA' | 'JUSTIFICADA';
  justificativa?: string;
}

export interface SalvarChamadaPayload {
  turmaId: number;
  materiaId: number;
  dataAula: string;
  responsavelRegistro: string;
  conteudoMinistrado?: string;
  itens: ChamadaItem[];
}

export interface ChamadaResumo {
  turmaId: number;
  turmaCodigo: string;
  materiaId: number;
  materiaNome: string;
  dataAula: string;
  responsavelRegistro: string;
  conteudoMinistrado?: string;
  totalAlunos: number;
  totalPresentes: number;
  totalFaltas: number;
  totalJustificadas: number;
  percentualPresenca: number;
}

export interface ChamadaDetalhe {
  turmaId: number;
  turmaCodigo: string;
  cursoNome?: string;
  materiaId: number;
  materiaNome: string;
  dataAula: string;
  responsavelRegistro: string;
  conteudoMinistrado?: string;
  totalAlunos: number;
  totalPresentes: number;
  totalFaltas: number;
  totalJustificadas: number;
  percentualPresenca: number;
  itens: ChamadaItem[];
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

  // Regras Oficiais de Emissão de Documentos
  aptoCertificado?: boolean;
  motivoInaptidaoCertificado?: string;
  aptoDeclaracaoTransporte?: boolean;
  dataLiberacaoDeclaracaoTransporte?: string;
  diasRestantesDeclaracaoTransporte?: number;
  motivoInaptidaoDeclaracaoTransporte?: string;
  cargaHorariaTotal?: number;
  codigoRegistroLivro?: string;
}

export interface CertificadoData {
  matriculaId: number;
  codigoAutenticidade: string;
  numeroRegistroLivro: string;
  orgaoExpedidor: string;
  alunoId: number;
  alunoNome: string;
  alunoCpf: string;
  alunoDataNascimento?: string;
  escolaNome: string;
  escolaSigla: string;
  escolaCorTema?: string;
  cursoNome: string;
  cursoModalidade: string;
  cargaHorariaTotal: number;
  cargaHorariaExtenso: string;
  turmaCodigo: string;
  dataInicioAulas?: string;
  dataFimAulas?: string;
  periodoRealizacao: string;
  porcentagemFrequencia: number;
  totalAulas: number;
  presencasConfirmadas: number;
  materiasConcluidas: TurmaMateria[];
  amparoLegal: string;
  dataExpedicaoFormatada: string;
  cidadeUfExpedicao: string;
  signatarios: string[];
}

export interface DeclaracaoTransporteData {
  matriculaId: number;
  codigoAutenticidade: string;
  instituicaoEnsino: string;
  cnpjInstituicao: string;
  escolaNome: string;
  escolaSigla: string;
  escolaEndereco: string;
  alunoId: number;
  alunoNome: string;
  alunoCpf: string;
  alunoDataNascimento?: string;
  alunoEnderecoCompleto: string;
  alunoNomeResponsavel?: string;
  cursoNome: string;
  turmaCodigo: string;
  modalidadeEnsino: string;
  diasSemanaAulas: string;
  horarioTurnoAulas: string;
  cargaHorariaTotal: number;
  cargaHorariaSemanal: number;
  dataInicioAulas?: string;
  dataPrevisaoTermino?: string;
  diasCursadosCumpridos: number;
  porcentagemFrequenciaAtual: number;
  statusMatricula: string;
  orgaosDestinatarios: string;
  finalidade: string;
  textoDeclaracao: string;
  dataEmissaoFormatada: string;
  validadeDeclaracao: string;
  responsavelSecretaria: string;
}

export interface DeclaracaoMatriculaData {
  matriculaId: number;
  codigoAutenticidade: string;
  instituicaoEnsino: string;
  cnpjInstituicao: string;
  escolaNome: string;
  escolaSigla: string;
  escolaEndereco: string;
  alunoId: number;
  alunoNome: string;
  alunoCpf: string;
  alunoDataNascimento?: string;
  alunoIdade?: number;
  alunoEnderecoCompleto: string;
  alunoNomeResponsavel?: string;
  alunoCpfResponsavel?: string;
  cursoNome: string;
  turmaCodigo: string;
  modalidadeEnsino: string;
  dataInicioAulas?: string;
  dataMatricula?: string;
  mesAnoInicioExtenso: string;
  dataInicioExtenso?: string;
  diasHorarioAulas: string;
  cargaHorariaTotal: number;
  porcentagemFrequenciaAtual: number;
  statusMatricula: string;
  anoLetivo: number;
  textoDeclaracao: string;
  dataEmissaoFormatada: string;
  responsavelSecretaria: string;
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
  endereco?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  genero?: string;
  neurodiverso?: boolean;
  neurodiversoDetalhe?: string;
  pcd?: boolean;
  pcdDetalhe?: string;
  contatoEmergencia?: string;
  turmaId: number;
  canalOrigem: 'PRESENCIAL' | 'FORMS' | 'SITE' | 'PLANILHA' | 'CULTURA_AZ';
  observacoes?: string;
  consentimentoLgpd?: boolean;
  consentimentoLgpdDadosSensiveis?: boolean;
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

export interface IdadeInfo {
  idade: number | null;
  isMenor: boolean;
  texto: string;
}

export function calcularIdade(dataNascStr?: string): IdadeInfo {
  if (!dataNascStr) {
    return { idade: null, isMenor: false, texto: '' };
  }
  const partes = dataNascStr.split('-');
  if (partes.length < 3) {
    return { idade: null, isMenor: false, texto: '' };
  }
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const dia = parseInt(partes[2], 10);
  if (!ano || !mes || !dia) {
    return { idade: null, isMenor: false, texto: '' };
  }

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();

  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade--;
  }

  if (idade < 0 || idade > 130) {
    return { idade: null, isMenor: false, texto: '' };
  }

  const isMenor = idade < 18;
  const texto = `${idade} ${idade === 1 ? 'ano' : 'anos'}`;
  return { idade, isMenor, texto };
}

export const aplicarMascaraCpf = (valor: string): string => {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const aplicarMascaraTelefone = (valor: string): string => {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)})${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const formatarTelefone = (valor?: string): string => {
  if (!valor) return 'Não informado';
  const digits = valor.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length > 2 && digits.length < 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return valor;
};

export const aplicarMascaraCep = (valor: string): string => {
  const digits = valor.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const formatarCep = (valor?: string): string => {
  if (!valor) return 'Não informado';
  const digits = valor.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return valor;
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

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sigma_jwt_token');
      if (token) {
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (e) {
          console.warn('Servidor indisponível para logout remoto:', e);
        }
      }
      localStorage.removeItem('sigma_jwt_token');
      localStorage.removeItem('sigma_user');
      localStorage.removeItem('sigma_token_timestamp');
      localStorage.removeItem('sigma_escola_ativa_id');
      sessionStorage.clear();
    }
  },

  getEscolaAtivaId(): number | null {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('sigma_escola_ativa_id');
      return id ? Number(id) : null;
    }
    return null;
  },

  setEscolaAtivaId(id: number | null): void {
    if (typeof window !== 'undefined') {
      if (id !== null) {
        localStorage.setItem('sigma_escola_ativa_id', id.toString());
      } else {
        localStorage.removeItem('sigma_escola_ativa_id');
      }
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

  async getTurmaPorId(id: number): Promise<Turma> {
    const res = await fetch(`${API_BASE}/turmas/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar detalhes da turma');
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

  async getMateriasTurma(turmaId: number): Promise<TurmaMateria[]> {
    const res = await fetch(`${API_BASE}/turmas/${turmaId}/materias`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Erro ao listar matérias da turma');
    return res.json();
  },

  async adicionarMateriaTurma(
    turmaId: number,
    data: {
      nome: string;
      duracaoEstimada?: string;
      cargaHoraria?: number;
      professorResponsavel?: string;
      ordem?: number;
    }
  ): Promise<TurmaMateria> {
    const res = await fetch(`${API_BASE}/turmas/${turmaId}/materias`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao adicionar matéria' }));
      throw new Error(err.message || 'Erro ao adicionar matéria');
    }
    return res.json();
  },

  async atualizarMateriaTurma(
    turmaId: number,
    materiaId: number,
    data: {
      nome?: string;
      duracaoEstimada?: string;
      cargaHoraria?: number;
      professorResponsavel?: string;
      ordem?: number;
    }
  ): Promise<TurmaMateria> {
    const res = await fetch(`${API_BASE}/turmas/${turmaId}/materias/${materiaId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao atualizar matéria' }));
      throw new Error(err.message || 'Erro ao atualizar matéria');
    }
    return res.json();
  },

  async removerMateriaTurma(turmaId: number, materiaId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/turmas/${turmaId}/materias/${materiaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao remover matéria' }));
      throw new Error(err.message || 'Erro ao remover matéria');
    }
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
    const res = await fetch(`${API_BASE}/matriculas?${params.toString()}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
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

  async atualizarAluno(alunoId: number, dados: Partial<Aluno>): Promise<Aluno> {
    const res = await fetch(`${API_BASE}/alunos/${alunoId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao atualizar dados do aluno' }));
      throw new Error(err.message || 'Erro ao atualizar dados do aluno');
    }
    return res.json();
  },

  async atualizarContatoAluno(
    alunoId: number,
    dados: AtualizarContatoPayload
  ): Promise<Aluno> {
    const res = await fetch(`${API_BASE}/alunos/${alunoId}/contato`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao atualizar dados de contato do aluno' }));
      throw new Error(err.message || 'Erro ao atualizar dados de contato do aluno');
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

  // Gestão de Usuários (Professores e Encarregadas)
  async getUsuarios(role?: string): Promise<Usuario[]> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    const res = await fetch(`${API_BASE}/usuarios?${params.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao buscar usuários' }));
      throw new Error(err.message || 'Erro ao buscar usuários');
    }
    return res.json();
  },

  async cadastrarUsuario(payload: CadastrarUsuarioPayload): Promise<Usuario> {
    const res = await fetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao cadastrar usuário' }));
      throw new Error(err.message || 'Erro ao cadastrar usuário');
    }
    return res.json();
  },

  async atualizarUsuario(id: number, payload: AtualizarUsuarioPayload): Promise<Usuario> {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao atualizar usuário' }));
      throw new Error(err.message || 'Erro ao atualizar usuário');
    }
    return res.json();
  },

  async alternarStatusUsuario(id: number): Promise<Usuario> {
    const res = await fetch(`${API_BASE}/usuarios/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao alterar status do usuário' }));
      throw new Error(err.message || 'Erro ao alterar status do usuário');
    }
    return res.json();
  },

  // Módulo de Diário de Classe & Chamadas
  async obterAlunosParaChamada(turmaId: number, materiaId: number, data?: string): Promise<ChamadaItem[]> {
    const url = data
      ? `${API_BASE}/chamadas/turma/${turmaId}/materia/${materiaId}/alunos?data=${data}`
      : `${API_BASE}/chamadas/turma/${turmaId}/materia/${materiaId}/alunos`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao carregar lista de alunos' }));
      throw new Error(err.message || 'Erro ao carregar lista de alunos para a chamada');
    }
    return res.json();
  },

  async listarChamadas(turmaId: number, materiaId: number): Promise<ChamadaResumo[]> {
    const res = await fetch(`${API_BASE}/chamadas/turma/${turmaId}/materia/${materiaId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao listar chamadas' }));
      throw new Error(err.message || 'Erro ao listar histórico de chamadas da matéria');
    }
    return res.json();
  },

  async obterDetalheChamada(materiaId: number, data: string): Promise<ChamadaDetalhe> {
    const res = await fetch(`${API_BASE}/chamadas/materia/${materiaId}/detalhe?data=${data}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao buscar detalhe da chamada' }));
      throw new Error(err.message || 'Erro ao carregar detalhe da chamada do dia selecionado');
    }
    return res.json();
  },

  async salvarChamada(payload: SalvarChamadaPayload): Promise<ChamadaDetalhe> {
    const res = await fetch(`${API_BASE}/chamadas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao registrar chamada' }));
      throw new Error(err.message || 'Erro ao salvar chamada da turma');
    }
    return res.json();
  },

  // Conclusão de Curso (Formatura) e Emissão de Documentos Oficiais
  async concluirMatricula(matriculaId: number): Promise<Matricula> {
    const res = await fetch(`${API_BASE}/matriculas/${matriculaId}/concluir`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao concluir curso do estudante' }));
      throw new Error(err.message || 'Erro ao homologar formatura do estudante');
    }
    return res.json();
  },

  async getCertificado(matriculaId: number): Promise<CertificadoData> {
    const res = await fetch(`${API_BASE}/matriculas/${matriculaId}/certificado`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao gerar certificado de conclusão' }));
      throw new Error(err.message || 'Erro ao emitir certificado oficial de conclusão');
    }
    return res.json();
  },

  async getDeclaracaoTransporte(matriculaId: number): Promise<DeclaracaoTransporteData> {
    const res = await fetch(`${API_BASE}/matriculas/${matriculaId}/declaracao-transporte`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao emitir declaração de transporte' }));
      throw new Error(err.message || 'Erro ao emitir declaração para CPTM / SPTrans');
    }
    return res.json();
  },

  async getDeclaracaoMatricula(matriculaId: number): Promise<DeclaracaoMatriculaData> {
    const res = await fetch(`${API_BASE}/matriculas/${matriculaId}/declaracao-matricula`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao emitir declaração de matrícula' }));
      throw new Error(err.message || 'Erro ao emitir declaração de matrícula escolar');
    }
    return res.json();
  },

  async obterNotificacoes(escolaId?: number, turmaId?: number): Promise<Notificacao[]> {
    const params = new URLSearchParams();
    if (escolaId) params.append('escolaId', String(escolaId));
    if (turmaId) params.append('turmaId', String(turmaId));
    const qs = params.toString();
    const url = qs ? `${API_BASE}/notificacoes?${qs}` : `${API_BASE}/notificacoes`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao carregar notificações' }));
      throw new Error(err.message || 'Erro ao consultar notificações do sistema');
    }
    return res.json();
  },
};

export interface Notificacao {
  id: string;
  tipo: 'RISCO_FALTAS' | 'LIMITE_FALTAS' | 'DECLARACAO_PRONTA' | 'VAGA_DISPONIVEL' | 'AVISO_SISTEMA';
  nivel: 'URGENTE' | 'ALERTA' | 'INFO';
  titulo: string;
  mensagem: string;
  escolaId?: number;
  escolaSigla?: string;
  alunoId?: number;
  alunoNome?: string;
  turmaId?: number;
  turmaNome?: string;
  matriculaId?: number;
  acaoRotulo?: string;
  acaoTipo?: 'ABRIR_PERFIL' | 'ABRIR_TURMA' | 'EMITIR_DECLARACAO';
  dataHora: string;
}
