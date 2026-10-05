'use client';

import React, { useState } from 'react';
import {
  X,
  Baby,
  UserCheck,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Phone,
  Mail,
  User,
  MapPin,
  HeartHandshake,
  Camera,
  FileCheck,
} from 'lucide-react';
import {
  api,
  Aluno,
  calcularIdade,
  aplicarMascaraCpf,
  aplicarMascaraTelefone,
  aplicarMascaraCep,
} from '@/lib/api';

interface ModalCadastrarAlunoProps {
  isOpen: boolean;
  onClose: () => void;
  onAlunoCadastrado: () => void;
}

export function ModalCadastrarAluno({
  isOpen,
  onClose,
  onAlunoCadastrado,
}: ModalCadastrarAlunoProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  // Endereço Residencial
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

  // Responsável Legal (para menores de idade)
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelCpf, setResponsavelCpf] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [responsavelEmail, setResponsavelEmail] = useState('');
  const [responsavelParentesco, setResponsavelParentesco] = useState('Mãe');

  // LGPD & Conformidade Legal
  const [aceiteLgpd, setAceiteLgpd] = useState(true);
  const [aceiteLgpdSensiveis, setAceiteLgpdSensiveis] = useState(true);
  const [aceiteUsoImagem, setAceiteUsoImagem] = useState(false);
  const [termoPapelEntregue, setTermoPapelEntregue] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Cálculo reativo e dinâmico da idade
  const infoIdade = calcularIdade(dataNascimento);
  const isMenor = dataNascimento ? infoIdade.isMenor : false;

  if (!isOpen) return null;

  const resetForm = () => {
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
    setAceiteLgpdSensiveis(true);
    setAceiteUsoImagem(false);
    setTermoPapelEntregue(true);
    setErro(null);
    setSucesso(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (isMenor) {
      if (!responsavelNome.trim() || !responsavelCpf.trim()) {
        setErro('Para alunos menores de 18 anos, é obrigatório preencher o Nome e o CPF do responsável legal conforme o Art. 14 da LGPD.');
        return;
      }
    }

    if ((pcd || neurodiverso) && !aceiteLgpdSensiveis) {
      setErro('Para cadastrar informações de PCD ou Neurodiversidade, é obrigatório consentir com o tratamento de dados de acessibilidade (Art. 11 da LGPD).');
      return;
    }

    try {
      setSubmitting(true);

      const novoAluno: Aluno = {
        nome: nome.trim(),
        cpf: cpf.trim(),
        email: email.trim(),
        telefone: telefone.trim() || undefined,
        dataNascimento: dataNascimento || undefined,
        menorDeIdade: isMenor,
        endereco: endereco.trim() || undefined,
        bairro: bairro.trim() || undefined,
        cidade: cidade.trim() || undefined,
        cep: cep.trim() || undefined,
        genero: genero.trim() || undefined,
        neurodiverso,
        neurodiversoDetalhe: neurodiverso ? neurodiversoDetalhe.trim() || undefined : undefined,
        pcd,
        pcdDetalhe: pcd ? pcdDetalhe.trim() || undefined : undefined,
        contatoEmergencia: contatoEmergencia.trim() || undefined,
        responsavel: isMenor
          ? {
              nome: responsavelNome.trim(),
              cpf: responsavelCpf.trim(),
              telefone: responsavelTelefone.trim() || undefined,
              email: responsavelEmail.trim() || undefined,
              grauParentesco: responsavelParentesco,
            }
          : undefined,
        consentimentoLgpd: aceiteLgpd,
        consentimentoLgpdDadosSensiveis: aceiteLgpdSensiveis,
        consentimentoUsoImagem: aceiteUsoImagem,
        termoPapelEntregue: termoPapelEntregue,
      };

      await api.createAluno(novoAluno);
      setSucesso(true);
      setTimeout(() => {
        onAlunoCadastrado();
        handleClose();
      }, 1400);
    } catch (err: any) {
      setErro(err.message || 'Erro ao realizar cadastro do aluno.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Topo do Modal */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Cadastrar Novo Aluno</h2>
              <p className="text-xs text-slate-400">
                Cadastro centralizado no SIGMA das Escolas Livres de Santo André
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white rounded-full p-2 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {sucesso ? (
            <div className="py-12 text-center space-y-3 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Aluno Cadastrado com Sucesso!</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                O registro de <strong>{nome}</strong> foi salvo com sucesso. Atualizando listagem...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {erro && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{erro}</span>
                </div>
              )}

              {/* Informações Básicas do Aluno */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Dados Pessoais do Aluno</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Beatriz Lima"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(aplicarMascaraCpf(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>

                  {/* Feedback visual imediato do cálculo de idade */}
                  {dataNascimento && infoIdade.idade !== null && (
                    <div className="sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      {isMenor ? (
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 font-medium">
                          <Baby className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>
                            <strong>{infoIdade.texto}</strong> — Menor de 18 anos detectado. O preenchimento do responsável legal foi ativado abaixo.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-200 font-medium">
                          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>
                            <strong>{infoIdade.texto}</strong> — Aluno maior de 18 anos. Dispensa preenchimento de responsável legal.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="aluno@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="(11) 99999-9999"
                      value={telefone}
                      onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço Residencial */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Endereço Residencial</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      placeholder="09000-000"
                      maxLength={9}
                      value={cep}
                      onChange={(e) => setCep(aplicarMascaraCep(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Logradouro e Número
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Rua Coronel Oliveira Lima, 123"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Centro, Vila Assunção, Campestre"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Município
                    </label>
                    <input
                      type="text"
                      placeholder="Santo André"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Inclusão & Acessibilidade */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                  <HeartHandshake className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Inclusão, Acessibilidade & Emergência</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Identidade de Gênero
                    </label>
                    <select
                      value={genero}
                      onChange={(e) => setGenero(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 dark:text-white"
                    >
                      <option value="">Selecione ou deixe em branco</option>
                      <option value="Mulher Cisgênero">Mulher Cisgênero</option>
                      <option value="Homem Cisgênero">Homem Cisgênero</option>
                      <option value="Mulher Transgênero / Travesti">Mulher Transgênero / Travesti</option>
                      <option value="Homem Transgênero">Homem Transgênero</option>
                      <option value="Pessoa Não-Binária">Pessoa Não-Binária</option>
                      <option value="Outro">Outro</option>
                      <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contato de Emergência
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos (Irmão) - (11) 97777-6666"
                      value={contatoEmergencia}
                      onChange={(e) => setContatoEmergencia(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 dark:text-white"
                    />
                  </div>

                  {/* Toggles de Acessibilidade */}
                  <div className="sm:col-span-2 p-3 bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/40 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="check-pcd"
                        checked={pcd}
                        onChange={(e) => setPcd(e.target.checked)}
                        className="rounded text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="check-pcd" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                        Estudante com Deficiência (PCD)
                      </label>
                    </div>
                    {pcd && (
                      <input
                        type="text"
                        placeholder="Especifique a deficiência para adaptação pedagógica (ex: auditiva, visual, física)"
                        value={pcdDetalhe}
                        onChange={(e) => setPcdDetalhe(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-700 rounded-lg text-xs"
                      />
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-violet-200/50 dark:border-violet-800/30">
                      <input
                        type="checkbox"
                        id="check-neuro"
                        checked={neurodiverso}
                        onChange={(e) => setNeurodiverso(e.target.checked)}
                        className="rounded text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="check-neuro" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                        Estudante Neurodivergente
                      </label>
                    </div>
                    {neurodiverso && (
                      <input
                        type="text"
                        placeholder="Especifique (ex: TEA - Espectro Autista, TDAH, Dislexia, Altas Habilidades)"
                        value={neurodiversoDetalhe}
                        onChange={(e) => setNeurodiversoDetalhe(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-700 rounded-lg text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Seção Condicional: Responsável Legal para Menores de Idade */}
              {isMenor && (
                <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-300 dark:border-amber-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center space-x-2 text-amber-950 dark:text-amber-200 font-bold text-sm">
                    <Baby className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>Dados do Responsável Legal (Obrigatório para Menores - Art. 14 LGPD)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    Conforme o Art. 14 da Lei Geral de Proteção de Dados (LGPD) e o ECA, o cadastro de crianças e adolescentes exige identificação e consentimento expresso por pelo menos um dos pais ou responsável legal.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">
                        Nome do Responsável *
                      </label>
                      <input
                        type="text"
                        required={isMenor}
                        placeholder="Nome completo do pai, mãe ou tutor"
                        value={responsavelNome}
                        onChange={(e) => setResponsavelNome(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">
                        CPF do Responsável *
                      </label>
                      <input
                        type="text"
                        required={isMenor}
                        maxLength={14}
                        placeholder="000.000.000-00"
                        value={responsavelCpf}
                        onChange={(e) => setResponsavelCpf(aplicarMascaraCpf(e.target.value))}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">
                        Telefone do Responsável
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="(11) 98888-7777"
                        value={responsavelTelefone}
                        onChange={(e) => setResponsavelTelefone(aplicarMascaraTelefone(e.target.value))}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">
                        Grau de Parentesco *
                      </label>
                      <select
                        value={responsavelParentesco}
                        onChange={(e) => setResponsavelParentesco(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 dark:text-white"
                      >
                        <option value="Mãe">Mãe</option>
                        <option value="Pai">Pai</option>
                        <option value="Avó/Avô">Avó/Avô</option>
                        <option value="Tutor Legal">Tutor Legal</option>
                        <option value="Outro Responsável">Outro Responsável</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-amber-950 dark:text-amber-200 mb-1">
                        E-mail do Responsável (Opcional)
                      </label>
                      <input
                        type="email"
                        placeholder="responsavel@exemplo.com"
                        value={responsavelEmail}
                        onChange={(e) => setResponsavelEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Termos de Proteção de Dados (LGPD - Lei 13.709/2018) */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Conformidade com a LGPD (Lei nº 13.709/2018)</span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-start space-x-2.5">
                    <input
                      type="checkbox"
                      id="modal-lgpd"
                      checked={aceiteLgpd}
                      onChange={(e) => setAceiteLgpd(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="modal-lgpd" className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer font-medium">
                      <strong>Termo de Privacidade (Art. 7º, I):</strong> Declaro consentimento expresso e inequívoco para tratamento dos dados cadastrais pela Secretaria de Cultura de Santo André exclusivamente para fins escolares e acadêmicos.
                    </label>
                  </div>

                  {(pcd || neurodiverso) && (
                    <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                      <input
                        type="checkbox"
                        id="modal-lgpd-sensiveis"
                        checked={aceiteLgpdSensiveis}
                        onChange={(e) => setAceiteLgpdSensiveis(e.target.checked)}
                        className="mt-0.5 rounded text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="modal-lgpd-sensiveis" className="text-[11px] text-violet-900 dark:text-violet-300 leading-relaxed cursor-pointer font-medium">
                        <strong>Dados Sensíveis de Acessibilidade (Art. 11, I):</strong> Autorizo expressamente o tratamento das informações de saúde/deficiência para fins de suporte pedagógico especializado, adaptação de espaços e inclusão escolar.
                      </label>
                    </div>
                  )}

                  <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <input
                      type="checkbox"
                      id="modal-imagem"
                      checked={aceiteUsoImagem}
                      onChange={(e) => setAceiteUsoImagem(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="modal-imagem" className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer">
                      <strong>Autorização de Imagem e Voz (Opcional):</strong> Autorizo a captação e veiculação de fotos/vídeos em atividades letivas estritamente para divulgação cultural institucional da Prefeitura de Santo André sem fins comerciais.
                    </label>
                  </div>

                  <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <input
                      type="checkbox"
                      id="modal-papel"
                      checked={termoPapelEntregue}
                      onChange={(e) => setTermoPapelEntregue(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="modal-papel" className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed cursor-pointer">
                      <strong>Ficha Física de Matrícula:</strong> Termo impresso e assinado entregue ou arquivado fisicamente na Secretaria da Escola.
                    </label>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Cadastrar Aluno</span>
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
