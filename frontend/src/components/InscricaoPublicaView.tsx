'use client';

import React, { useState } from 'react';
import {
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  ShieldCheck,
  Baby,
  UserCheck,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  HeartHandshake,
} from 'lucide-react';
import {
  Turma,
  InscricaoExternaPayload,
  calcularIdade,
  aplicarMascaraCpf,
  aplicarMascaraTelefone,
  aplicarMascaraCep,
} from '@/lib/api';

interface InscricaoPublicaViewProps {
  turmas: Turma[];
  turmaPreSelecionadaId?: number;
  alunoMenorDeIdade?: boolean;
  onSubmeterInscricao: (payload: InscricaoExternaPayload) => Promise<void>;
  onOpenLgpd: (aba: 'geral' | 'alunos') => void;
  onVoltarLogin?: () => void;
}

export function InscricaoPublicaView({
  turmas,
  turmaPreSelecionadaId,
  alunoMenorDeIdade: alunoMenorDeIdadeProp,
  onSubmeterInscricao,
  onOpenLgpd,
  onVoltarLogin,
}: InscricaoPublicaViewProps) {
  const [turmaId, setTurmaId] = useState<number>(turmaPreSelecionadaId || (turmas[0]?.id || 0));

  React.useEffect(() => {
    if (turmaPreSelecionadaId) {
      setTurmaId(turmaPreSelecionadaId);
    } else if (!turmaId && turmas.length > 0 && turmas[0]?.id) {
      setTurmaId(turmas[0].id);
    }
  }, [turmaPreSelecionadaId, turmas]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [canalOrigem, setCanalOrigem] = useState<'PRESENCIAL' | 'FORMS' | 'SITE' | 'CULTURA_AZ'>('SITE');
  const [observacoes, setObservacoes] = useState('');

  // Endereço Residencial
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Santo André');

  // Inclusão & Outras Perguntas
  const [genero, setGenero] = useState('');
  const [neurodiverso, setNeurodiverso] = useState(false);
  const [neurodiversoDetalhe, setNeurodiversoDetalhe] = useState('');
  const [pcd, setPcd] = useState(false);
  const [pcdDetalhe, setPcdDetalhe] = useState('');
  const [contatoEmergencia, setContatoEmergencia] = useState('');

  // Menores
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelCpf, setResponsavelCpf] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [responsavelEmail, setResponsavelEmail] = useState('');
  const [responsavelParentesco, setResponsavelParentesco] = useState('Mãe');

  // Cálculo dinâmico da idade com base na data de nascimento
  const infoIdade = calcularIdade(dataNascimento);
  const isMenor = dataNascimento ? infoIdade.isMenor : (alunoMenorDeIdadeProp ?? false);

  // LGPD
  const [aceiteLgpdGeral, setAceiteLgpdGeral] = useState(false);
  const [aceiteLgpdAluno, setAceiteLgpdAluno] = useState(false);
  const [aceiteUsoImagem, setAceiteUsoImagem] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceiteLgpdGeral || !aceiteLgpdAluno) {
      setErro('É obrigatório assinalar os termos de proteção de dados (LGPD) para prosseguir.');
      return;
    }

    if (isMenor) {
      if (!responsavelNome.trim() || !responsavelCpf.trim()) {
        setErro('Para alunos menores de 18 anos, é obrigatório preencher o Nome e o CPF do responsável legal.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setErro(null);
      await onSubmeterInscricao({
        nome: nome.trim(),
        cpf: cpf.trim(),
        email: email.trim(),
        telefone: telefone.trim() || undefined,
        dataNascimento: dataNascimento || undefined,
        turmaId: Number(turmaId),
        canalOrigem,
        observacoes: observacoes.trim() || undefined,
        responsavelNome: isMenor ? responsavelNome.trim() : undefined,
        responsavelCpf: isMenor ? responsavelCpf.trim() : undefined,
        responsavelTelefone: isMenor ? (responsavelTelefone.trim() || undefined) : undefined,
        responsavelEmail: isMenor ? (responsavelEmail.trim() || undefined) : undefined,
        responsavelParentesco: isMenor ? responsavelParentesco : undefined,
        endereco: endereco.trim() || undefined,
        bairro: bairro.trim() || undefined,
        cidade: cidade.trim() || undefined,
        cep: cep.trim() || undefined,
        genero: genero.trim() || undefined,
        neurodiverso,
        neurodiversoDetalhe: neurodiverso ? (neurodiversoDetalhe.trim() || undefined) : undefined,
        pcd,
        pcdDetalhe: pcd ? (pcdDetalhe.trim() || undefined) : undefined,
        contatoEmergencia: contatoEmergencia.trim() || undefined,
        consentimentoLgpd: true,
        consentimentoUsoImagem: aceiteUsoImagem,
        termoPapelEntregue: true,
      });

      setSucesso(true);
    } catch (err: any) {
      setErro(err.message || 'Falha ao efetuar matrícula.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sucesso) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white dark:bg-[#121214] rounded-3xl p-8 border border-emerald-300 dark:border-emerald-800/80 shadow-xl text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Matrícula Confirmada com Sucesso!</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Os dados de <strong>{nome}</strong> foram registrados com sucesso no SIGMA das Escolas Livres de Santo André. Um e-mail com as instruções de início das aulas e confirmação pedagógica foi encaminhado.
        </p>
        <button
          onClick={() => {
            setSucesso(false);
            setNome('');
            setCpf('');
            setEmail('');
            setTelefone('');
            setDataNascimento('');
            setEndereco('');
            setCep('');
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
          }}
          className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 transition cursor-pointer"
        >
          Realizar Nova Matrícula
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header Acolhedor */}
      <div className="bg-gradient-to-r from-[#121214] via-[#18181b] to-[#121214] rounded-3xl p-8 text-white border border-[#27272a] shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Educação Pública Municipal e Acolhimento</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Ficha de Matrícula — Escolas Livres de Santo André
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Preencha os dados cadastrais para ingressar nos cursos gratuitos de Teatro, Dança, Cinema e Iniciação Artística da Prefeitura Municipal de Santo André.
            </p>
          </div>
          {onVoltarLogin && (
            <button
              type="button"
              onClick={onVoltarLogin}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition cursor-pointer shrink-0"
            >
              ← Acesso da Secretaria
            </button>
          )}
        </div>
      </div>

      {erro && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Formulário em Seções Elegantes */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: OFERTA DA TURMA */}
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Turma Desejada</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Selecione o Curso / Turma *</label>
            <select
              required
              value={turmaId}
              onChange={(e) => setTurmaId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
            >
              <option value="">Selecione a turma disponível...</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.escolaSigla}] {t.codigo} — {t.cursoNome} ({t.vagasOcupadas}/{t.vagasTotais} vagas ocupadas)
                  {t.idadeMinima ? ` [Faixa: ${t.idadeMinima} a ${t.idadeMaxima || 99} anos]` : ''}
                  {t.matriculaAberta ? ' [ABERTA]' : ' [FECHADA]'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SEÇÃO 2: DADOS PESSOAIS DO ALUNO */}
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Identificação do Aluno</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo do Aluno *</label>
              <input
                type="text"
                required
                placeholder="Ex: Beatriz Lima"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">CPF do Aluno *</label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(aplicarMascaraCpf(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento *</label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition [color-scheme:light] dark:[color-scheme:dark]"
              />
              {dataNascimento && infoIdade.idade !== null && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {isMenor ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                      <Baby className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{infoIdade.texto} — Menor de idade (Preenchimento do responsável legal ativado abaixo)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{infoIdade.texto} — Aluno Maior de 18 anos (Dispensa responsável legal)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail de Contato *</label>
              <input
                type="email"
                required
                placeholder="aluno@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp *</label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                maxLength={15}
                value={telefone}
                onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Canal de Origem</label>
              <select
                value={canalOrigem}
                onChange={(e) => setCanalOrigem(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              >
                <option value="SITE">Site Oficial das Escolas Livres</option>
                <option value="CULTURA_AZ">Plataforma Cultura AZ</option>
                <option value="PRESENCIAL">Secretaria Presencial</option>
                <option value="FORMS">Formulários Externos</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEÇÃO CONDICIONAL: RESPONSÁVEL LEGAL PARA MENORES DE IDADE */}
        {isMenor && (
          <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-3xl p-6 sm:p-8 border border-amber-300 dark:border-amber-800 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 text-amber-950 dark:text-amber-200 font-bold text-sm">
              <Baby className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>Aluno Menor de Idade Detectado ({infoIdade.texto}) — Dados do Responsável Legal</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Em cumprimento ao Art. 14 da LGPD e ao Estatuto da Criança e do Adolescente (ECA), é obrigatório cadastrar formalmente os dados do responsável legal pelo aluno.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">Nome do Responsável Legal *</label>
                <input
                  type="text"
                  required={isMenor}
                  placeholder="Nome completo do pai, mãe ou tutor"
                  value={responsavelNome}
                  onChange={(e) => setResponsavelNome(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">CPF do Responsável *</label>
                <input
                  type="text"
                  required={isMenor}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={responsavelCpf}
                  onChange={(e) => setResponsavelCpf(aplicarMascaraCpf(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 font-mono transition"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">Telefone do Responsável *</label>
                <input
                  type="text"
                  required={isMenor}
                  placeholder="(11) 98888-7777"
                  maxLength={15}
                  value={responsavelTelefone}
                  onChange={(e) => setResponsavelTelefone(aplicarMascaraTelefone(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">Grau de Parentesco *</label>
                <select
                  value={responsavelParentesco}
                  onChange={(e) => setResponsavelParentesco(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Avó/Avô">Avó/Avô</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                  <option value="Outro Responsável">Outro Responsável</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">E-mail do Responsável (Opcional)</label>
                <input
                  type="email"
                  placeholder="responsavel@exemplo.com"
                  value={responsavelEmail}
                  onChange={(e) => setResponsavelEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-amber-900 dark:text-amber-300 border-t border-amber-200/80 dark:border-amber-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>O termo físico assinado é recolhido e arquivado em pasta física na secretaria da escola.</span>
            </div>
          </div>
        )}

        {/* SEÇÃO: ENDEREÇO RESIDENCIAL */}
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Endereço Residencial</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Informe o CEP e endereço de residência do aluno para composição do dossiê escolar municipal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">CEP</label>
              <input
                type="text"
                placeholder="09000-000"
                maxLength={9}
                value={cep}
                onChange={(e) => setCep(aplicarMascaraCep(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Logradouro e Número</label>
              <input
                type="text"
                placeholder="Ex: Rua Coronel Oliveira Lima, 123"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
              <input
                type="text"
                placeholder="Ex: Centro, Vila Assunção, Campestre"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Município</label>
              <input
                type="text"
                placeholder="Santo André"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO: INCLUSÃO, ACESSIBILIDADE & CONTATO DE EMERGÊNCIA */}
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
            <HeartHandshake className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <span>Inclusão, Acessibilidade & Contato de Emergência</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Informações utilizadas pela coordenação pedagógica para garantir acolhimento inclusivo e contato imediato em emergências.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Identidade de Gênero</label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              >
                <option value="">Selecione...</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Não-binário">Não-binário</option>
                <option value="Travesti / Mulher Trans">Travesti / Mulher Trans</option>
                <option value="Homem Trans">Homem Trans</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contato de Emergência</label>
              <input
                type="text"
                placeholder="Ex: Maria (Avó) - (11) 97777-6666"
                value={contatoEmergencia}
                onChange={(e) => setContatoEmergencia(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            {/* Neurodiversidade */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={neurodiverso}
                  onChange={(e) => setNeurodiverso(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                />
                <span>Pessoa Neurodiversa? (ex: Autismo, TDAH, Dislexia)</span>
              </label>
              {neurodiverso && (
                <input
                  type="text"
                  placeholder="Especifique para apoio pedagógico (ex: TEA nível 1, TDAH)"
                  value={neurodiversoDetalhe}
                  onChange={(e) => setNeurodiversoDetalhe(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 transition"
                />
              )}
            </div>

            {/* PCD */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={pcd}
                  onChange={(e) => setPcd(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Pessoa com Deficiência (PCD)?</span>
              </label>
              {pcd && (
                <input
                  type="text"
                  placeholder="Especifique a deficiência e necessidades de acessibilidade"
                  value={pcdDetalhe}
                  onChange={(e) => setPcdDetalhe(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 transition"
                />
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: TERMOS DE PROTEÇÃO DE DADOS (LGPD) */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-3xl p-6 sm:p-8 border border-emerald-300 dark:border-emerald-800/60 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-950 dark:text-emerald-300 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Termos de Proteção de Dados (LGPD) & Consentimento</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={aceiteLgpdGeral}
                onChange={(e) => setAceiteLgpdGeral(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="leading-snug">
                <strong className="text-slate-900 dark:text-white">[Obrigatório]</strong> Li e concordo com a{' '}
                <button
                  type="button"
                  onClick={() => onOpenLgpd('geral')}
                  className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 underline font-bold inline cursor-pointer"
                >
                  Política Geral de Privacidade (LGPD)
                </button>{' '}
                da Prefeitura de Santo André, para viabilizar as políticas públicas culturais.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={aceiteLgpdAluno}
                onChange={(e) => setAceiteLgpdAluno(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="leading-snug">
                <strong className="text-slate-900 dark:text-white">[Obrigatório]</strong> Autorizo o tratamento de dados acadêmicos e registros de frequência escolar conforme o{' '}
                <button
                  type="button"
                  onClick={() => onOpenLgpd('alunos')}
                  className="text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 underline font-bold inline cursor-pointer"
                >
                  Termo de Privacidade dos Alunos
                </button>
                .
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
              <input
                type="checkbox"
                checked={aceiteUsoImagem}
                onChange={(e) => setAceiteUsoImagem(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="leading-snug text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">[Opcional]</span> Autorizo o registro em foto e vídeo exclusivamente para avaliações pedagógicas, ensaios e mostras públicas oficiais das Escolas Livres.
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-950/20 transition cursor-pointer flex items-center justify-center space-x-2"
        >
          <Send className="w-5 h-5 text-slate-950" />
          <span>{submitting ? 'Confirmando Matrícula...' : 'Efetivar Matrícula do Aluno'}</span>
        </button>
      </form>
    </div>
  );
}
