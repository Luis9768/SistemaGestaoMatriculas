'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  UserCheck,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User,
  MapPin,
  ExternalLink,
  Loader2,
  Sparkles,
  ShieldCheck,
  Baby,
} from 'lucide-react';
import {
  api,
  Turma,
  Aluno,
  InscricaoExternaPayload,
  calcularIdade,
  aplicarMascaraCpf,
  aplicarMascaraTelefone,
  aplicarMascaraCep,
} from '@/lib/api';

interface ModalMatricularTurmaProps {
  isOpen: boolean;
  turma: Turma | null;
  onClose: () => void;
  onMatriculaSucesso: () => void;
}

export function ModalMatricularTurma({
  isOpen,
  turma,
  onClose,
  onMatriculaSucesso,
}: ModalMatricularTurmaProps) {
  const router = useRouter();
  const searchInputId = useId();

  // Abas: 'existente' | 'novo'
  const [abaAtiva, setAbaAtiva] = useState<'existente' | 'novo'>('existente');

  // --- ABA 1: ALUNO EXISTENTE ---
  const [buscaAluno, setBuscaAluno] = useState('');
  const [alunosEncontrados, setAlunosEncontrados] = useState<Aluno[]>([]);
  const [buscandoAlunos, setBuscandoAlunos] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [canalOrigemExistente, setCanalOrigemExistente] = useState<
    'PRESENCIAL' | 'FORMS' | 'SITE' | 'CULTURA_AZ'
  >('PRESENCIAL');
  const [observacoesExistente, setObservacoesExistente] = useState('');

  // --- ABA 2: NOVO ALUNO ---
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [canalOrigemNovo, setCanalOrigemNovo] = useState<
    'PRESENCIAL' | 'FORMS' | 'SITE' | 'CULTURA_AZ'
  >('PRESENCIAL');
  const [observacoesNovo, setObservacoesNovo] = useState('');

  // Endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Santo André');

  // Inclusão & Acessibilidade
  const [genero, setGenero] = useState('');
  const [neurodiverso, setNeurodiverso] = useState(false);
  const [neurodiversoDetalhe, setNeurodiversoDetalhe] = useState('');
  const [pcd, setPcd] = useState(false);
  const [pcdDetalhe, setPcdDetalhe] = useState('');
  const [contatoEmergencia, setContatoEmergencia] = useState('');

  // Menor de idade
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelCpf, setResponsavelCpf] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [responsavelEmail, setResponsavelEmail] = useState('');
  const [responsavelParentesco, setResponsavelParentesco] = useState('Mãe');

  // Termos
  const [aceiteLgpd, setAceiteLgpd] = useState(true);

  // Estados de feedback
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Cálculo reativo de menor de idade
  const infoIdade = calcularIdade(dataNascimento);
  const isMenor = dataNascimento ? infoIdade.isMenor : false;

  // Busca de alunos cadastrados com debounce
  useEffect(() => {
    if (!isOpen || abaAtiva !== 'existente') return;

    if (!buscaAluno.trim() || buscaAluno.trim().length < 2) {
      setAlunosEncontrados([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscandoAlunos(true);
      try {
        const res = await api.getAlunosPaginado(0, 6, undefined, buscaAluno.trim());
        setAlunosEncontrados(res.content || []);
      } catch {
        setAlunosEncontrados([]);
      } finally {
        setBuscandoAlunos(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [buscaAluno, isOpen, abaAtiva]);

  // Limpeza de campos ao fechar ou abrir
  const resetForm = () => {
    setAbaAtiva('existente');
    setBuscaAluno('');
    setAlunosEncontrados([]);
    setAlunoSelecionado(null);
    setObservacoesExistente('');
    setNome('');
    setCpf('');
    setEmail('');
    setTelefone('');
    setDataNascimento('');
    setCep('');
    setEndereco('');
    setBairro('');
    setCidade('Santo André');
    setGenero('');
    setNeurodiverso(false);
    setNeurodiversoDetalhe('');
    setPcd(false);
    setPcdDetalhe('');
    setContatoEmergencia('');
    setResponsavelNome('');
    setResponsavelCpf('');
    setResponsavelTelefone('');
    setResponsavelEmail('');
    setResponsavelParentesco('Mãe');
    setAceiteLgpd(true);
    setErro(null);
    setSucesso(false);
    setCarregando(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !turma) return null;

  const vagasRestantes = Math.max(0, turma.vagasTotais - (turma.vagasOcupadas ?? 0));

  // --- SUBMISSÃO ABA 1: ALUNO EXISTENTE ---
  const handleSubmitExistente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!alunoSelecionado?.id) {
      setErro('Por favor, selecione um aluno na lista para matricular.');
      return;
    }

    setCarregando(true);
    try {
      await api.matricular({
        alunoId: alunoSelecionado.id,
        turmaId: turma.id!,
        canalOrigem: canalOrigemExistente,
        observacoes: observacoesExistente.trim() || undefined,
      });

      setSucesso(true);
      setTimeout(() => {
        onMatriculaSucesso();
        handleClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar matrícula';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  // --- SUBMISSÃO ABA 2: NOVO ALUNO ---
  const handleSubmitNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || !cpf.trim()) {
      setErro('Preencha os campos obrigatórios: Nome Completo e CPF.');
      return;
    }

    if (isMenor && (!responsavelNome.trim() || !responsavelCpf.trim())) {
      setErro('Para participantes menores de 18 anos, é obrigatório informar o Responsável Legal.');
      return;
    }

    if (!aceiteLgpd) {
      setErro('É obrigatório assinalar os termos de proteção de dados (LGPD) para prosseguir.');
      return;
    }

    setCarregando(true);
    try {
      const payload: InscricaoExternaPayload = {
        turmaId: turma.id!,
        nome: nome.trim(),
        cpf: cpf.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        dataNascimento: dataNascimento || undefined,
        canalOrigem: canalOrigemNovo,
        observacoes: observacoesNovo.trim() || undefined,
        cep: cep.trim() || undefined,
        endereco: endereco.trim() || undefined,
        bairro: bairro.trim() || undefined,
        cidade: cidade.trim() || undefined,
        genero: genero || undefined,
        neurodiverso,
        neurodiversoDetalhe: neurodiverso ? neurodiversoDetalhe.trim() : undefined,
        pcd,
        pcdDetalhe: pcd ? pcdDetalhe.trim() : undefined,
        contatoEmergencia: contatoEmergencia.trim() || undefined,
        responsavelNome: isMenor ? responsavelNome.trim() : undefined,
        responsavelCpf: isMenor ? responsavelCpf.trim() : undefined,
        responsavelTelefone: isMenor ? responsavelTelefone.trim() : undefined,
        responsavelEmail: isMenor ? responsavelEmail.trim() : undefined,
        consentimentoLgpd: true,
        consentimentoLgpdDadosSensiveis: true,
        consentimentoUsoImagem: false,
      };

      await api.inscreverExterno(payload);

      setSucesso(true);
      setTimeout(() => {
        onMatriculaSucesso();
        handleClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar e matricular aluno';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-white dark:bg-[#121110] border border-stone-200/90 dark:border-[#262422] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* CABEÇALHO DO MODAL */}
        <div className="p-5 sm:p-6 border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-50/70 dark:bg-[#161514] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                {turma.codigo}
              </span>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {turma.escolaSigla || 'Rede de Escolas Livres'}
              </span>
            </div>

            <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-white mt-1.5 leading-snug">
              Matrícula — {turma.cursoNome}
            </h2>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
              {turma.diasHorariosLocal && <span>{turma.diasHorariosLocal}</span>}
              {turma.idadeMinima && (
                <span>
                  · {turma.idadeMinima}
                  {turma.idadeMaxima ? ` a ${turma.idadeMaxima}` : '+'} anos
                </span>
              )}
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                · {vagasRestantes} {vagasRestantes === 1 ? 'vaga livre' : 'vagas livres'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Atalho para abrir formulário em página inteira */}
            <button
              type="button"
              onClick={() => {
                handleClose();
                router.push(`/inscricao?turma=${turma.id}`);
              }}
              title="Abrir em página inteira"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              title="Fechar"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FEEDBACK DE SUCESSO OU ERRO */}
        {sucesso && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Matrícula realizada com sucesso! Atualizando turmas e vagas...</span>
          </div>
        )}

        {erro && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* SELETOR DE ABAS */}
        <div className="px-5 sm:px-6 pt-4 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAbaAtiva('existente');
              setErro(null);
            }}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              abaAtiva === 'existente'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Aluno Cadastrado</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAbaAtiva('novo');
              setErro(null);
            }}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              abaAtiva === 'novo'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Aluno (Ficha Completa)</span>
          </button>
        </div>

        {/* CORPO DO FORMULÁRIO (SCROLLÁVEL) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* ABA 1: MATRICULAR ALUNO EXISTENTE */}
          {abaAtiva === 'existente' && (
            <form onSubmit={handleSubmitExistente} className="space-y-4">
              <div>
                <label htmlFor={searchInputId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Buscar Aluno no Sistema
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id={searchInputId}
                    type="text"
                    value={buscaAluno}
                    onChange={(e) => setBuscaAluno(e.target.value)}
                    placeholder="Digite o nome, CPF ou e-mail do aluno..."
                    className="w-full pl-10 pr-9 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  {buscandoAlunos && (
                    <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 animate-spin" />
                  )}
                </div>
              </div>

              {/* LISTA DE RESULTADOS DA BUSCA */}
              {alunosEncontrados.length > 0 && !alunoSelecionado && (
                <div className="border border-stone-200 dark:border-stone-800 rounded-xl divide-y divide-stone-100 dark:divide-stone-800/60 max-h-48 overflow-y-auto bg-stone-50/50 dark:bg-stone-900/50">
                  {alunosEncontrados.map((aluno) => (
                    <button
                      key={aluno.id}
                      type="button"
                      onClick={() => {
                        setAlunoSelecionado(aluno);
                        setBuscaAluno(aluno.nome);
                      }}
                      className="w-full p-2.5 text-left flex items-center justify-between hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {aluno.nome}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          CPF: {aluno.cpf} {aluno.email ? `· ${aluno.email}` : ''}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        Selecionar →
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* CARTÃO DO ALUNO SELECIONADO */}
              {alunoSelecionado && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {alunoSelecionado.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        {alunoSelecionado.nome}
                      </p>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300">
                        CPF: {alunoSelecionado.cpf} · Tel: {alunoSelecionado.telefone || 'Não informado'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAlunoSelecionado(null);
                      setBuscaAluno('');
                    }}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
                  >
                    Trocar
                  </button>
                </div>
              )}

              {/* CANAL DE ATENDIMENTO & OBSERVAÇÕES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Canal de Inscrição / Atendimento
                  </label>
                  <select
                    value={canalOrigemExistente}
                    onChange={(e) =>
                      setCanalOrigemExistente(
                        e.target.value as 'PRESENCIAL' | 'FORMS' | 'SITE' | 'CULTURA_AZ'
                      )
                    }
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="PRESENCIAL">Presencial na Secretaria</option>
                    <option value="FORMS">Formulário Oficial</option>
                    <option value="SITE">Portal Online</option>
                    <option value="CULTURA_AZ">Plataforma Cultura AZ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Observações (Opcional)
                  </label>
                  <input
                    type="text"
                    value={observacoesExistente}
                    onChange={(e) => setObservacoesExistente(e.target.value)}
                    placeholder="Ex: Aluno transferido, atendimento presencial..."
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* BOTÃO DE CONFIRMAÇÃO */}
              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={carregando || !alunoSelecionado}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processando Matrícula...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Matrícula</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ABA 2: NOVO ALUNO (FICHA CADASTRAL COMPLETA) */}
          {abaAtiva === 'novo' && (
            <form onSubmit={handleSubmitNovo} className="space-y-4">
              {/* DADOS PESSOAIS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Dados do Estudante</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome civil ou social do participante..."
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(aplicarMascaraCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {dataNascimento && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                        Idade calculada: {infoIdade.idade} anos{' '}
                        {isMenor && <span className="text-amber-500 font-semibold">(Menor de 18 anos)</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="estudante@email.com"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))}
                      placeholder="(11) 90000-0000"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO RESPONSÁVEL LEGAL (SE MENOR DE IDADE) */}
              {isMenor && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5" />
                    <span>Responsável Legal Obrigatório (Menor de 18 anos)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Nome do Responsável *
                      </label>
                      <input
                        type="text"
                        required={isMenor}
                        value={responsavelNome}
                        onChange={(e) => setResponsavelNome(e.target.value)}
                        placeholder="Nome completo do responsável..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        CPF do Responsável *
                      </label>
                      <input
                        type="text"
                        required={isMenor}
                        value={responsavelCpf}
                        onChange={(e) => setResponsavelCpf(aplicarMascaraCpf(e.target.value))}
                        placeholder="000.000.000-00"
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Telefone do Responsável
                      </label>
                      <input
                        type="tel"
                        value={responsavelTelefone}
                        onChange={(e) => setResponsavelTelefone(aplicarMascaraTelefone(e.target.value))}
                        placeholder="(11) 90000-0000"
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Grau de Parentesco
                      </label>
                      <select
                        value={responsavelParentesco}
                        onChange={(e) => setResponsavelParentesco(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs"
                      >
                        <option value="Mãe">Mãe</option>
                        <option value="Pai">Pai</option>
                        <option value="Avó/Avô">Avó / Avô</option>
                        <option value="Tutor Legal">Tutor Legal</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ENDEREÇO RESIDENCIAL */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Endereço Residencial</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => setCep(aplicarMascaraCep(e.target.value))}
                      placeholder="09000-000"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Logradouro e Número
                    </label>
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Rua, Avenida, número e complemento..."
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Bairro"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* CONFORMIDADE LGPD */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aceiteLgpd}
                    onChange={(e) => setAceiteLgpd(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                    Declaro ciência sobre o tratamento de dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD) para fins acadêmicos e pedagógicos da Secretaria de Cultura de Santo André.
                  </span>
                </label>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={carregando}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cadastrando & Matriculando...</span>
                    </>
                  ) : (
                    <>
                      <span>Cadastrar & Matricular Aluno</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
