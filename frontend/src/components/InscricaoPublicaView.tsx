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
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Turma, InscricaoExternaPayload } from '@/lib/api';

interface InscricaoPublicaViewProps {
  turmas: Turma[];
  turmaPreSelecionadaId?: number;
  alunoMenorDeIdade: boolean;
  onSubmeterInscricao: (payload: InscricaoExternaPayload) => Promise<void>;
  onOpenLgpd: (aba: 'geral' | 'alunos') => void;
  onVoltarLogin?: () => void;
}

export function InscricaoPublicaView({
  turmas,
  turmaPreSelecionadaId,
  alunoMenorDeIdade,
  onSubmeterInscricao,
  onOpenLgpd,
  onVoltarLogin,
}: InscricaoPublicaViewProps) {
  const [turmaId, setTurmaId] = useState<number>(turmaPreSelecionadaId || (turmas[0]?.id || 0));
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [canalOrigem, setCanalOrigem] = useState<'PRESENCIAL' | 'FORMS' | 'SITE' | 'CULTURA_AZ'>('SITE');
  const [observacoes, setObservacoes] = useState('');

  // Menores
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelCpf, setResponsavelCpf] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [responsavelParentesco, setResponsavelParentesco] = useState('Mãe');

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
        responsavelNome: alunoMenorDeIdade ? responsavelNome.trim() : undefined,
        responsavelCpf: alunoMenorDeIdade ? responsavelCpf.trim() : undefined,
        responsavelTelefone: alunoMenorDeIdade ? responsavelTelefone.trim() : undefined,
        responsavelParentesco: alunoMenorDeIdade ? responsavelParentesco : undefined,
        consentimentoLgpd: true,
        consentimentoUsoImagem: aceiteUsoImagem,
        termoPapelEntregue: true,
      });

      setSucesso(true);
    } catch (err: any) {
      setErro(err.message || 'Falha ao efetuar inscrição.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sucesso) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-emerald-300 shadow-xl text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Inscrição Confirmada com Sucesso!</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
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
          }}
          className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          Realizar Nova Inscrição
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header Acolhedor */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-3xl p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Educação Pública Municipal e Acolhimento</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Ficha de Inscrição — Escolas Livres de Santo André
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
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Formulário em Seções Elegantes */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: OFERTA DA TURMA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Turma Desejada</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Selecione o Curso / Turma *</label>
            <select
              required
              value={turmaId}
              onChange={(e) => setTurmaId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Identificação do Aluno</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nome Completo do Aluno *</label>
              <input
                type="text"
                required
                placeholder="Ex: Beatriz Lima"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">CPF do Aluno *</label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Data de Nascimento *</label>
              <input
                type="date"
                required
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail de Contato *</label>
              <input
                type="email"
                required
                placeholder="aluno@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Canal de Origem</label>
              <select
                value={canalOrigem}
                onChange={(e) => setCanalOrigem(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
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
        {alunoMenorDeIdade && (
          <div className="bg-amber-50/80 rounded-3xl p-6 sm:p-8 border border-amber-300 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center space-x-2 text-amber-950 font-bold text-sm">
              <Baby className="w-5 h-5 text-amber-700" />
              <span>Aluno Menor de Idade Detectado — Dados do Responsável Legal</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Em cumprimento ao Art. 14 da LGPD e ao Estatuto da Criança e do Adolescente, é indispensável a identificação formal do responsável legal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-amber-950 mb-1">Nome do Responsável Legal *</label>
                <input
                  type="text"
                  required={alunoMenorDeIdade}
                  placeholder="Nome do pai, mãe ou tutor"
                  value={responsavelNome}
                  onChange={(e) => setResponsavelNome(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-amber-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">CPF do Responsável *</label>
                <input
                  type="text"
                  required={alunoMenorDeIdade}
                  placeholder="000.000.000-00"
                  value={responsavelCpf}
                  onChange={(e) => setResponsavelCpf(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-amber-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">Telefone do Responsável *</label>
                <input
                  type="text"
                  required={alunoMenorDeIdade}
                  placeholder="(11) 98888-7777"
                  value={responsavelTelefone}
                  onChange={(e) => setResponsavelTelefone(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-amber-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">Grau de Parentesco *</label>
                <select
                  value={responsavelParentesco}
                  onChange={(e) => setResponsavelParentesco(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-amber-300 rounded-xl"
                >
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Avó/Avô">Avó/Avô</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                </select>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-amber-900 border-t border-amber-200/80 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>O termo físico assinado é recolhido e arquivado em pasta física na secretaria da escola.</span>
            </div>
          </div>
        )}

        {/* SEÇÃO 3: TERMOS DE PROTEÇÃO DE DADOS (LGPD) */}
        <div className="bg-emerald-50/70 rounded-3xl p-6 sm:p-8 border border-emerald-300 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Termos de Proteção de Dados (LGPD) & Consentimento</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={aceiteLgpdGeral}
                onChange={(e) => setAceiteLgpdGeral(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="leading-snug">
                <strong className="text-slate-900">[Obrigatório]</strong> Li e concordo com a{' '}
                <button
                  type="button"
                  onClick={() => onOpenLgpd('geral')}
                  className="text-blue-700 hover:text-blue-900 underline font-bold inline cursor-pointer"
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
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="leading-snug">
                <strong className="text-slate-900">[Obrigatório]</strong> Autorizo o tratamento de dados acadêmicos e registros de frequência escolar conforme o{' '}
                <button
                  type="button"
                  onClick={() => onOpenLgpd('alunos')}
                  className="text-emerald-800 hover:text-emerald-950 underline font-bold inline cursor-pointer"
                >
                  Termo de Privacidade dos Alunos
                </button>
                .
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-emerald-200/80">
              <input
                type="checkbox"
                checked={aceiteUsoImagem}
                onChange={(e) => setAceiteUsoImagem(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="leading-snug text-slate-600">
                <span className="font-semibold text-slate-800">[Opcional]</span> Autorizo o registro em foto e vídeo exclusivamente para avaliações pedagógicas, ensaios e mostras públicas oficiais das Escolas Livres.
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
          <span>{submitting ? 'Confirmando Inscrição...' : 'Concluir Inscrição do Aluno'}</span>
        </button>
      </form>
    </div>
  );
}
