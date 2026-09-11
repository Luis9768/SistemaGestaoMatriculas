const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Curso {
  id?: number;
  nome: string;
  descricao?: string;
  tipo: 'OFICINA' | 'REGULAR';
  duracaoMeses: number;
  cargaHoraria: number;
  ativo?: boolean;
}

export interface Turma {
  id?: number;
  cursoId: number;
  cursoNome?: string;
  codigo: string;
  dataAberturaMatricula: string;
  dataFechamentoMatricula: string;
  dataInicioAulas: string;
  dataFimAulas: string;
  vagasTotais: number;
  vagasOcupadas?: number;
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
  dataMatricula: string;
  canalOrigem: 'PRESENCIAL' | 'FORMS' | 'SITE' | 'PLANILHA';
  status: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA';
  observacoes?: string;
}

export interface ImportacaoResultado {
  totalLinhas: number;
  sucesso: number;
  ignoradas: number;
  falhas: number;
  logs: string[];
}

export interface InscricaoExternaPayload {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  turmaId: number;
  canalOrigem: 'PRESENCIAL' | 'FORMS' | 'SITE' | 'PLANILHA';
  observacoes?: string;
}

export const api = {
  // Cursos
  async getCursos(): Promise<Curso[]> {
    const res = await fetch(`${API_BASE}/cursos`);
    if (!res.ok) throw new Error('Erro ao buscar cursos');
    return res.json();
  },

  async createCurso(data: Curso): Promise<Curso> {
    const res = await fetch(`${API_BASE}/cursos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao criar curso' }));
      throw new Error(err.message || 'Erro ao criar curso');
    }
    return res.json();
  },

  // Turmas
  async getTurmas(cursoId?: number, apenasAbertas?: boolean): Promise<Turma[]> {
    const params = new URLSearchParams();
    if (cursoId) params.append('cursoId', cursoId.toString());
    if (apenasAbertas) params.append('apenasAbertas', 'true');
    const res = await fetch(`${API_BASE}/turmas?${params.toString()}`);
    if (!res.ok) throw new Error('Erro ao buscar turmas');
    return res.json();
  },

  async createTurma(data: Turma): Promise<Turma> {
    const res = await fetch(`${API_BASE}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao criar turma' }));
      throw new Error(err.message || 'Erro ao criar turma');
    }
    return res.json();
  },

  // Alunos
  async getAlunos(): Promise<Aluno[]> {
    const res = await fetch(`${API_BASE}/alunos`);
    if (!res.ok) throw new Error('Erro ao buscar alunos');
    return res.json();
  },

  // Matrículas
  async getMatriculas(canal?: string, status?: string): Promise<Matricula[]> {
    const params = new URLSearchParams();
    if (canal) params.append('canal', canal);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/matriculas?${params.toString()}`);
    if (!res.ok) throw new Error('Erro ao buscar matrículas');
    return res.json();
  },

  async inscreverExterno(payload: InscricaoExternaPayload): Promise<Matricula> {
    const res = await fetch(`${API_BASE}/matriculas/inscrever`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao cancelar matrícula' }));
      throw new Error(err.message || 'Erro ao cancelar matrícula');
    }
    return res.json();
  },

  // Importação
  async importarPlanilha(file: File): Promise<ImportacaoResultado> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/importacao/planilha`, {
      method: 'POST',
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
};
