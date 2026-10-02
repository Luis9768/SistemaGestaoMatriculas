'use client';

import React, { useState, useEffect } from 'react';
import {
  api,
  PerfilAluno,
  MatriculaItemPerfil,
  CertificadoData,
  DeclaracaoTransporteData,
  aplicarMascaraTelefone,
  formatarTelefone,
} from '@/lib/api';
import { getCorTemaEscola } from '@/lib/escolaUtils';
import { ModalCertificado } from './ModalCertificado';
import { ModalDeclaracaoTransporte } from './ModalDeclaracaoTransporte';
import {
  X,
  Plus,
  Mail,
  Phone,
  Edit3,
  Calendar,
  AlertTriangle,
  MessageCircle,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  MapPin,
  HeartHandshake,
  Camera,
  FileCheck,
  Printer,
  Award,
  Bus,
} from 'lucide-react';

interface PerfilAlunoModalProps {
  alunoId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const formatarData = (dataStr?: string) => {
  if (!dataStr) return 'Não informada';
  const clean = dataStr.split('T')[0];
  const partes = clean.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};

const calcularIdade = (dataNasc?: string) => {
  if (!dataNasc) return null;
  const nasc = new Date(dataNasc);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return isNaN(idade) ? null : idade;
};

export function PerfilAlunoModal({
  alunoId,
  isOpen,
  onClose,
  onUpdate,
}: PerfilAlunoModalProps) {
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'atuais' | 'frequencia' | 'historico'>('atuais');
  const [matriculaSelecionadaId, setMatriculaSelecionadaId] = useState<number | null>(null);

  // Modo de edição de dados cadastrais, endereço e inclusão
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editBairro, setEditBairro] = useState('');
  const [editCidade, setEditCidade] = useState('');
  const [editGenero, setEditGenero] = useState('');
  const [editNeurodiverso, setEditNeurodiverso] = useState(false);
  const [editNeurodiversoDetalhe, setEditNeurodiversoDetalhe] = useState('');
  const [editPcd, setEditPcd] = useState(false);
  const [editPcdDetalhe, setEditPcdDetalhe] = useState('');
  const [editContatoEmergencia, setEditContatoEmergencia] = useState('');
  const [editConsentimentoUsoImagem, setEditConsentimentoUsoImagem] = useState(false);
  const [editTermoPapelEntregue, setEditTermoPapelEntregue] = useState(true);
  const [editRespTelefone, setEditRespTelefone] = useState('');
  const [editRespEmail, setEditRespEmail] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [feedbackSalvo, setFeedbackSalvo] = useState<string | null>(null);

  // Estados para emissão de Certificado e Declaração CPTM / SPTrans
  const [modalCertificadoAberto, setModalCertificadoAberto] = useState(false);
  const [modalDeclaracaoAberto, setModalDeclaracaoAberto] = useState(false);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState<CertificadoData | null>(null);
  const [declaracaoSelecionada, setDeclaracaoSelecionada] = useState<DeclaracaoTransporteData | null>(null);
  const [carregandoDocumento, setCarregandoDocumento] = useState(false);
  const [concluindoMatriculaId, setConcluindoMatriculaId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && alunoId) {
      carregarPerfil();
    }
  }, [isOpen, alunoId]);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await api.getPerfilAluno(alunoId);
      setPerfil(data);
      if (data.cursosAtuais && data.cursosAtuais.length > 0) {
        setMatriculaSelecionadaId(data.cursosAtuais[0].matriculaId);
      } else if (data.historicoCursos && data.historicoCursos.length > 0) {
        setMatriculaSelecionadaId(data.historicoCursos[0].matriculaId);
      }
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = () => {
    if (perfil?.aluno) {
      setEditEmail(perfil.aluno.email || '');
      setEditTelefone(aplicarMascaraTelefone(perfil.aluno.telefone || ''));
      setEditEndereco(perfil.aluno.endereco || '');
      setEditBairro(perfil.aluno.bairro || '');
      setEditCidade(perfil.aluno.cidade || '');
      setEditGenero(perfil.aluno.genero || '');
      setEditNeurodiverso(Boolean(perfil.aluno.neurodiverso));
      setEditNeurodiversoDetalhe(perfil.aluno.neurodiversoDetalhe || '');
      setEditPcd(Boolean(perfil.aluno.pcd));
      setEditPcdDetalhe(perfil.aluno.pcdDetalhe || '');
      setEditContatoEmergencia(perfil.aluno.contatoEmergencia || '');
      setEditConsentimentoUsoImagem(Boolean(perfil.aluno.consentimentoUsoImagem));
      setEditTermoPapelEntregue(perfil.aluno.termoPapelEntregue ?? true);
      setEditRespTelefone(aplicarMascaraTelefone(perfil.aluno.responsavel?.telefone || ''));
      setEditRespEmail(perfil.aluno.responsavel?.email || '');
      setModoEdicao(true);
      setFeedbackSalvo(null);
    }
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvandoEdicao(true);
      await api.atualizarAluno(alunoId, {
        nome: perfil?.aluno?.nome,
        cpf: perfil?.aluno?.cpf,
        email: editEmail.trim(),
        telefone: editTelefone.trim() || undefined,
        endereco: editEndereco.trim() || undefined,
        bairro: editBairro.trim() || undefined,
        cidade: editCidade.trim() || undefined,
        genero: editGenero || undefined,
        neurodiverso: editNeurodiverso,
        neurodiversoDetalhe: editNeurodiverso ? editNeurodiversoDetalhe.trim() || undefined : undefined,
        pcd: editPcd,
        pcdDetalhe: editPcd ? editPcdDetalhe.trim() || undefined : undefined,
        contatoEmergencia: editContatoEmergencia.trim() || undefined,
        consentimentoUsoImagem: editConsentimentoUsoImagem,
        termoPapelEntregue: editTermoPapelEntregue,
        responsavel: perfil?.aluno?.responsavel
          ? {
              ...perfil.aluno.responsavel,
              telefone: editRespTelefone.trim() || undefined,
              email: editRespEmail.trim() || undefined,
            }
          : undefined,
      });
      setFeedbackSalvo('Ficha cadastral e conformidade LGPD atualizadas com sucesso.');
      setModoEdicao(false);
      await carregarPerfil();
      if (onUpdate) onUpdate();
      setTimeout(() => setFeedbackSalvo(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar dados');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleImprimirFichaTermo = () => {
    if (!aluno) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha Oficial de Matrícula & Termo LGPD - ${aluno.nome}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; font-size: 13px; }
            h1 { font-size: 17px; margin: 0 0 4px; text-transform: uppercase; color: #0f172a; }
            h2 { font-size: 13px; margin: 0 0 16px; color: #475569; font-weight: normal; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 18px; }
            .section { margin-bottom: 16px; }
            .section-title { font-weight: bold; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; color: #334155; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
            .field { margin-bottom: 3px; }
            .field-label { font-weight: 600; color: #475569; }
            .termo-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; font-size: 11px; margin-top: 15px; }
            .signatures { margin-top: 45px; display: flex; justify-content: space-between; }
            .sig-line { width: 45%; border-top: 1px solid #334155; text-align: center; padding-top: 6px; font-size: 11px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Prefeitura de Santo André • Secretaria de Cultura</h1>
            <h2>Escolas Livres de Santo André (ELT • ELD • ELCV • EMIA) — Ficha Oficial de Matrícula</h2>
          </div>
          <div class="section">
            <div class="section-title">1. Dados do Estudante (Matrícula #${aluno.id})</div>
            <div class="grid">
              <div class="field"><span class="field-label">Nome Completo:</span> ${aluno.nome}</div>
              <div class="field"><span class="field-label">CPF:</span> ${aluno.cpf || 'Não informado'}</div>
              <div class="field"><span class="field-label">Data de Nascimento:</span> ${formatarData(aluno.dataNascimento)}</div>
              <div class="field"><span class="field-label">Gênero:</span> ${aluno.genero || 'Não informado'}</div>
              <div class="field"><span class="field-label">E-mail:</span> ${aluno.email}</div>
              <div class="field"><span class="field-label">Telefone:</span> ${formatarTelefone(aluno.telefone) || 'Não informado'}</div>
              <div class="field"><span class="field-label">Endereço Residencial:</span> ${aluno.endereco || 'Não informado'}</div>
              <div class="field"><span class="field-label">Bairro / Município:</span> ${(aluno.bairro || '') + ' - ' + (aluno.cidade || 'Santo André')}</div>
              <div class="field"><span class="field-label">Contato de Emergência:</span> ${aluno.contatoEmergencia || 'Não informado'}</div>
            </div>
          </div>
          ${aluno.responsavel ? `
          <div class="section">
            <div class="section-title">2. Responsável Legal (Art. 14 LGPD - Menor de Idade)</div>
            <div class="grid">
              <div class="field"><span class="field-label">Nome do Responsável:</span> ${aluno.responsavel.nome}</div>
              <div class="field"><span class="field-label">Parentesco:</span> ${aluno.responsavel.grauParentesco || 'Responsável Legal'}</div>
              <div class="field"><span class="field-label">CPF:</span> ${aluno.responsavel.cpf || 'Não informado'}</div>
              <div class="field"><span class="field-label">Telefone:</span> ${formatarTelefone(aluno.responsavel.telefone) || 'Não informado'}</div>
              <div class="field"><span class="field-label">E-mail:</span> ${aluno.responsavel.email || 'Não informado'}</div>
            </div>
          </div>` : ''}
          <div class="section">
            <div class="section-title">3. Inclusão, Acessibilidade e Imagem (Art. 11 LGPD)</div>
            <div class="grid">
              <div class="field"><span class="field-label">Pessoa com Deficiência (PCD):</span> ${aluno.pcd ? `Sim (${aluno.pcdDetalhe || 'Não especificado'})` : 'Não'}</div>
              <div class="field"><span class="field-label">Neurodivergência:</span> ${aluno.neurodiverso ? `Sim (${aluno.neurodiversoDetalhe || 'Não especificado'})` : 'Não'}</div>
              <div class="field"><span class="field-label">Uso Institucional de Imagem:</span> ${aluno.consentimentoUsoImagem ? 'Autorizado' : 'Não Autorizado'}</div>
            </div>
          </div>
          <div class="termo-box">
            <strong>DECLARAÇÃO E TERMO DE COMPROMISSO DE FREQUÊNCIA:</strong><br/>
            Declaro verídicas as informações prestadas. Estou ciente de que as ausências são acompanhadas pela Secretaria e 3 faltas consecutivas injustificadas geram alerta pedagógico de evasão. Autorizo expressamente o tratamento dos dados pessoais e sensíveis para fins estritamente pedagógicos e de saúde (Art. 7º, 11 e 14 da Lei 13.709/2018 - LGPD).
          </div>
          <div class="signatures">
            <div class="sig-line">Assinatura do(a) Aluno(a) ou Responsável Legal</div>
            <div class="sig-line">Secretaria da Escola Livre / Santo André<br/>Data: ____/____/2026</div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };


  const handleDesligarPorFaltas = async (matriculaId: number) => {
    if (
      !confirm(
        'Deseja confirmar o cancelamento da vaga deste aluno por limite de faltas consecutivas? A vaga será disponibilizada para suplência.'
      )
    ) {
      return;
    }
    try {
      await api.desligarPorFaltas(matriculaId);
      alert('Desligamento confirmado com sucesso.');
      await carregarPerfil();
      if (onUpdate) onUpdate();
    } catch (e: any) {
      alert(e.message || 'Erro ao processar desligamento');
    }
  };

  const handleAbrirCertificado = async (matriculaId: number) => {
    try {
      setCarregandoDocumento(true);
      const cert = await api.getCertificado(matriculaId);
      setCertificadoSelecionado(cert);
      setModalCertificadoAberto(true);
    } catch (e: any) {
      alert(e.message || 'Erro ao emitir certificado de conclusão');
    } finally {
      setCarregandoDocumento(false);
    }
  };

  const handleAbrirDeclaracao = async (matriculaId: number) => {
    try {
      setCarregandoDocumento(true);
      const dec = await api.getDeclaracaoTransporte(matriculaId);
      setDeclaracaoSelecionada(dec);
      setModalDeclaracaoAberto(true);
    } catch (e: any) {
      alert(e.message || 'Erro ao emitir declaração de transporte');
    } finally {
      setCarregandoDocumento(false);
    }
  };

  const handleConcluirMatricula = async (matriculaId: number) => {
    if (
      !confirm(
        'Deseja homologar a conclusão deste curso para o aluno? Requer no mínimo 75% de frequência para aprovação e formatura.'
      )
    ) {
      return;
    }
    try {
      setConcluindoMatriculaId(matriculaId);
      await api.concluirMatricula(matriculaId);
      alert('Conclusão de curso e formatura homologadas com sucesso!');
      await carregarPerfil();
      if (onUpdate) onUpdate();
    } catch (e: any) {
      alert(e.message || 'Erro ao homologar conclusão de curso');
    } finally {
      setConcluindoMatriculaId(null);
    }
  };

  if (!isOpen) return null;

  const aluno = perfil?.aluno;
  const cursoSelecionado =
    perfil?.cursosAtuais.find((c) => c.matriculaId === matriculaSelecionadaId) ||
    perfil?.historicoCursos.find((c) => c.matriculaId === matriculaSelecionadaId);

  const idade = calcularIdade(aluno?.dataNascimento);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/80 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Cabeçalho do Prontuário */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0D1220]">
          {loading ? (
            <div className="flex items-center gap-2.5 py-6">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Carregando prontuário do estudante...</span>
            </div>
          ) : erro ? (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-4 rounded-xl text-xs flex items-center justify-between">
              <span>{erro}</span>
              <button onClick={carregarPerfil} className="underline text-xs font-semibold">Tentar novamente</button>
            </div>
          ) : aluno ? (
            <div className="space-y-4">
              
              {/* Linha 1: Monograma + Nome + Status + Ações (Editar Contatos / Fechar) */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm flex items-center justify-center shrink-0 select-none shadow-xs">
                    {aluno.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {aluno.nome}
                      </h2>
                      {aluno.menorDeIdade ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40">
                          Menor de Idade
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                          Regular
                        </span>
                      )}
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                        Matrícula #{aluno.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImprimirFichaTermo}
                    title="Imprimir Ficha Cadastral e Termo de Matrícula (PDF)"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="hidden sm:inline">Imprimir Termo (PDF)</span>
                  </button>

                  {!modoEdicao && (
                    <button
                      onClick={iniciarEdicao}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Editar Contato</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    aria-label="Fechar prontuário"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mensagem de Feedback de Edição */}
              {feedbackSalvo && (
                <div className="px-3.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{feedbackSalvo}</span>
                </div>
              )}

              {/* Modo de Edição em Linha */}
              {modoEdicao ? (
                <form
                  onSubmit={handleSalvarEdicao}
                  className="bg-slate-50 dark:bg-[#070A11] border border-slate-200/90 dark:border-slate-800 p-4 rounded-xl space-y-3.5 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-200/70 dark:border-slate-800/70 pb-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Atualizar Ficha Cadastral e Conformidade LGPD
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Alterações refletem imediatamente na ficha
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        E-mail do Estudante *
                      </label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={editTelefone}
                        onChange={(e) => setEditTelefone(aplicarMascaraTelefone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Logradouro e Número
                        </label>
                        <input
                          type="text"
                          value={editEndereco}
                          onChange={(e) => setEditEndereco(e.target.value)}
                          placeholder="Rua, número e complemento"
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={editBairro}
                          onChange={(e) => setEditBairro(e.target.value)}
                          placeholder="Bairro"
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={editCidade}
                          onChange={(e) => setEditCidade(e.target.value)}
                          placeholder="Santo André"
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Identidade de Gênero
                      </label>
                      <input
                        type="text"
                        value={editGenero}
                        onChange={(e) => setEditGenero(e.target.value)}
                        placeholder="Ex: Mulher Cis, Homem Cis, Não-Binário"
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Contato de Emergência
                      </label>
                      <input
                        type="text"
                        value={editContatoEmergencia}
                        onChange={(e) => setEditContatoEmergencia(e.target.value)}
                        placeholder="Nome e telefone de emergência"
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Toggles de Inclusão e LGPD */}
                    <div className="sm:col-span-2 p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="edit-pcd"
                          checked={editPcd}
                          onChange={(e) => setEditPcd(e.target.checked)}
                          className="rounded text-violet-600"
                        />
                        <label htmlFor="edit-pcd" className="text-xs font-semibold cursor-pointer">
                          Estudante PCD
                        </label>
                      </div>
                      {editPcd && (
                        <input
                          type="text"
                          value={editPcdDetalhe}
                          onChange={(e) => setEditPcdDetalhe(e.target.value)}
                          placeholder="Especifique a deficiência"
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                        />
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <input
                          type="checkbox"
                          id="edit-neuro"
                          checked={editNeurodiverso}
                          onChange={(e) => setEditNeurodiverso(e.target.checked)}
                          className="rounded text-violet-600"
                        />
                        <label htmlFor="edit-neuro" className="text-xs font-semibold cursor-pointer">
                          Estudante Neurodivergente
                        </label>
                      </div>
                      {editNeurodiverso && (
                        <input
                          type="text"
                          value={editNeurodiversoDetalhe}
                          onChange={(e) => setEditNeurodiversoDetalhe(e.target.value)}
                          placeholder="Especifique (TEA, TDAH, etc.)"
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                        />
                      )}

                      <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editConsentimentoUsoImagem}
                            onChange={(e) => setEditConsentimentoUsoImagem(e.target.checked)}
                            className="rounded text-blue-600"
                          />
                          <span>Autorização de Imagem e Voz (LGPD)</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editTermoPapelEntregue}
                            onChange={(e) => setEditTermoPapelEntregue(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span>Ficha Física Entregue</span>
                        </label>
                      </div>
                    </div>

                    {aluno.responsavel && (
                      <>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Telefone do Responsável ({aluno.responsavel.grauParentesco || 'Responsável'})
                          </label>
                          <input
                            type="text"
                            value={editRespTelefone}
                            onChange={(e) => setEditRespTelefone(aplicarMascaraTelefone(e.target.value))}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                            E-mail do Responsável
                          </label>
                          <input
                            type="email"
                            value={editRespEmail}
                            onChange={(e) => setEditRespEmail(e.target.value)}
                            placeholder="responsavel@exemplo.com"
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setModoEdicao(false)}
                      className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvandoEdicao}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
                    >
                      {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Visualização Clean e Completa da Ficha e Conformidade LGPD */
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{aluno.email || 'E-mail não cadastrado'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{formatarTelefone(aluno.telefone)}</span>
                    </div>

                    {aluno.dataNascimento && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {formatarData(aluno.dataNascimento)}
                          {idade !== null && (
                            <span className="text-slate-400 ml-1">({idade} anos)</span>
                          )}
                        </span>
                      </div>
                    )}

                    {aluno.genero && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span>Gênero: <strong className="text-slate-700 dark:text-slate-300">{aluno.genero}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Endereço e Emergência */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {(aluno.endereco || aluno.bairro || aluno.cidade) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          {[aluno.endereco, aluno.bairro, aluno.cidade].filter(Boolean).join(' - ')}
                        </span>
                      </div>
                    )}

                    {aluno.contatoEmergencia && (
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                        <span>🚨 Emergência: {aluno.contatoEmergencia}</span>
                      </div>
                    )}

                    {aluno.responsavel && (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50">
                          {aluno.responsavel.grauParentesco || 'Responsável'}
                        </span>
                        <strong className="text-slate-700 dark:text-slate-200">
                          {aluno.responsavel.nome}
                        </strong>
                        {aluno.responsavel.telefone && (
                          <span className="font-mono">{formatarTelefone(aluno.responsavel.telefone)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Badges de Inclusão e Conformidade LGPD */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {aluno.pcd && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50 text-[11px] font-semibold">
                        <HeartHandshake className="w-3 h-3" />
                        <span>PCD: {aluno.pcdDetalhe || 'Registrado'}</span>
                      </span>
                    )}

                    {aluno.neurodiverso && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 text-[11px] font-semibold">
                        <span>🧠 Neurodivergente: {aluno.neurodiversoDetalhe || 'Registrado'}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>LGPD: Consentimento Geral Ativo (Art. 7º)</span>
                    </span>

                    {(aluno.pcd || aluno.neurodiverso) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-[11px] font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>LGPD Dados Sensíveis (Art. 11): Autorizado</span>
                      </span>
                    )}

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                      aluno.consentimentoUsoImagem
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800/50'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      <Camera className="w-3 h-3" />
                      <span>Uso de Imagem: {aluno.consentimentoUsoImagem ? 'Autorizado' : 'Não Autorizado'}</span>
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                      aluno.termoPapelEntregue
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                    }`}>
                      <FileCheck className="w-3 h-3" />
                      <span>{aluno.termoPapelEntregue ? '📄 Termo Físico em Papel (Arquivado)' : '📄 Termo Físico: Pendente'}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Barra de Segmento de Abas */}
        <div className="bg-slate-50/70 dark:bg-[#070A11] px-6 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-900/80 p-1 rounded-xl text-xs">
            <button
              onClick={() => setAbaAtiva('atuais')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'atuais'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>Cursos Atuais</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {perfil?.cursosAtuais.length || 0}
              </span>
            </button>

            <button
              onClick={() => setAbaAtiva('frequencia')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'frequencia'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>Frequência & Presenças</span>
              {cursoSelecionado?.frequencia?.atingiuLimiteFaltas && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              onClick={() => setAbaAtiva('historico')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                abaAtiva === 'historico'
                  ? 'bg-white dark:bg-[#151C2C] text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>Histórico Escolar</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {perfil?.historicoCursos.length || 0}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
            <span>{perfil?.totalCursosAtivos || 0} ativo(s)</span>
            <span>•</span>
            <span>{perfil?.totalCursosConcluidos || 0} concluído(s)</span>
          </div>
        </div>

        {/* Conteúdo com macro-espaçamento limpo */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white dark:bg-[#0B0F19]">
          
          {/* ABA 1: CURSOS ATUAIS */}
          {abaAtiva === 'atuais' && (
            <div className="space-y-4">
              {perfil?.cursosAtuais.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-[#0E1322] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                  O estudante não possui matrículas ativas no momento.
                </div>
              ) : (
                perfil?.cursosAtuais.map((curso) => {
                  const freq = curso.frequencia?.porcentagemFrequencia ?? 100;
                  const faltasConsecutivas = curso.frequencia?.faltasConsecutivas || 0;
                  const emAlerta = curso.frequencia?.atingiuLimiteFaltas || faltasConsecutivas >= 3;

                  return (
                    <div
                      key={curso.matriculaId}
                      className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-[#0D1220] hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
                    >
                      {/* Topo do Card de Curso */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getCorTemaEscola(
                              curso.escolaSigla || curso.escolaCorTema
                            )}`}
                          >
                            {curso.escolaSigla || 'GERAL'}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            {curso.cursoNome}
                          </h3>
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                            ({curso.turmaCodigo})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700">
                            {curso.modalidade || 'FORMAÇÃO'}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                            {curso.status}
                          </span>
                        </div>
                      </div>

                      {/* Informações de Período e Horário */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <div>
                          <strong className="text-slate-600 dark:text-slate-300 font-medium">Período Letivo:</strong>{' '}
                          {formatarData(curso.dataInicio)} até {formatarData(curso.dataTermino)}
                        </div>
                        <div>
                          <strong className="text-slate-600 dark:text-slate-300 font-medium">Escola Oficial:</strong>{' '}
                          {curso.escolaNome}
                        </div>
                      </div>

                      {/* Barra de Progresso de Frequência */}
                      <div className="bg-slate-50/70 dark:bg-[#070A11] p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Assiduidade do Estudante
                          </span>
                          <span className={`font-mono font-bold ${freq >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {freq}%
                          </span>
                        </div>

                        <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              freq >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(freq, 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                          <span>{curso.frequencia?.totalPresencas || 0} presenças de {curso.frequencia?.totalAulas || 0} aulas</span>
                          <span>{curso.frequencia?.totalFaltas || 0} faltas ({faltasConsecutivas} consecutivas)</span>
                        </div>
                      </div>

                      {/* Alerta de Risco de Evasão (se houver) */}
                      {emAlerta && (
                        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl space-y-3 text-xs">
                          <div className="flex items-start gap-2 text-amber-900 dark:text-amber-300">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                            <div>
                              <strong className="block">Alerta de Faltas Consecutivas (3 ou mais)</strong>
                              <span className="text-[11px] text-amber-800 dark:text-amber-400">
                                Recomenda-se tentativa de contato antes do cancelamento definitivo da matrícula.
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {(aluno?.telefone || aluno?.responsavel?.telefone) && (
                              <a
                                href={`https://wa.me/55${(aluno?.telefone || aluno?.responsavel?.telefone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Olá ${aluno?.nome}, somos da secretaria da ${curso.escolaNome || 'Escola Livre'}. Notamos ausências consecutivas na turma ${curso.turmaCodigo} (${curso.cursoNome}). Gostaríamos de conversar para apoiá-lo a manter sua vaga ativa.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            {(aluno?.email || aluno?.responsavel?.email) && (
                              <a
                                href={`mailto:${aluno?.email || aluno?.responsavel?.email}?subject=${encodeURIComponent(
                                  `Frequência: ${curso.cursoNome}`
                                )}`}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>E-mail</span>
                              </a>
                            )}

                            {curso.status !== 'DESISTENTE_FALTAS' && curso.status !== 'CANCELADA' && (
                              <button
                                type="button"
                                onClick={() => handleDesligarPorFaltas(curso.matriculaId)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition cursor-pointer sm:ml-auto"
                              >
                                Desligar por Faltas
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ações de Documentos Oficiais e Frequência */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Declaração de Transporte CPTM / SPTrans */}
                          {curso.aptoDeclaracaoTransporte ? (
                            <button
                              type="button"
                              onClick={() => handleAbrirDeclaracao(curso.matriculaId)}
                              disabled={carregandoDocumento}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 text-xs font-semibold transition cursor-pointer"
                              title="Emitir Declaração de Estudante para passe escolar CPTM / SPTrans"
                            >
                              <Bus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              <span>Declaração CPTM / SPTrans</span>
                            </button>
                          ) : (
                            <div
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800 text-xs cursor-not-allowed"
                              title={curso.motivoInaptidaoDeclaracaoTransporte || 'Necessário 2 meses de curso'}
                            >
                              <Bus className="w-3.5 h-3.5 text-slate-400" />
                              <span>Declaração CPTM/SPTrans ({curso.diasRestantesDeclaracaoTransporte ?? 60}d restantes)</span>
                            </div>
                          )}

                          {/* Homologar Formatura se Ativo */}
                          {curso.status === 'ATIVA' && (
                            freq >= 75 ? (
                              <button
                                type="button"
                                onClick={() => handleConcluirMatricula(curso.matriculaId)}
                                disabled={concluindoMatriculaId === curso.matriculaId}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                                title="Homologar conclusão com aproveitamento (>=75% de presença)"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>{concluindoMatriculaId === curso.matriculaId ? 'Homologando...' : 'Homologar Formatura (≥75%)'}</span>
                              </button>
                            ) : (
                              <div
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800 text-xs cursor-not-allowed"
                                title={`Frequência de ${freq}% é insuficiente para formatura (mínimo exigido: 75%)`}
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                <span>Formatura Bloqueada ({freq}% &lt; 75%)</span>
                              </div>
                            )
                          )}

                          {/* Certificado caso já homologado */}
                          {curso.aptoCertificado && (
                            <button
                              type="button"
                              onClick={() => handleAbrirCertificado(curso.matriculaId)}
                              disabled={carregandoDocumento}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold transition cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Certificado MEC/LDB</span>
                            </button>
                          )}
                        </div>

                        {/* Link direto para a aba de frequência */}
                        <button
                          onClick={() => {
                            setMatriculaSelecionadaId(curso.matriculaId);
                            setAbaAtiva('frequencia');
                          }}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition sm:ml-auto"
                        >
                          <span>Ver diário completo</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ABA 2: FREQUÊNCIA & PRESENÇAS FILTRADAS POR CURSO */}
          {abaAtiva === 'frequencia' && (
            <div className="space-y-5">
              {/* Barra de Filtro de Curso e Ações */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#070A11] p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Curso:
                  </label>
                  <select
                    value={matriculaSelecionadaId || ''}
                    onChange={(e) => setMatriculaSelecionadaId(Number(e.target.value))}
                    className="w-full sm:w-80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <optgroup label="Cursos Atuais">
                      {perfil?.cursosAtuais.map((c) => (
                        <option key={c.matriculaId} value={c.matriculaId}>
                          [{c.escolaSigla}] {c.cursoNome} ({c.turmaCodigo})
                        </option>
                      ))}
                    </optgroup>
                    {perfil?.historicoCursos && perfil.historicoCursos.length > 0 && (
                      <optgroup label="Histórico">
                        {perfil.historicoCursos.map((c) => (
                          <option key={c.matriculaId} value={c.matriculaId}>
                            [{c.escolaSigla}] {c.cursoNome} (Concluído)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Bento Cards Minimalistas */}
              {cursoSelecionado ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Assiduidade
                      </span>
                      <div
                        className={`text-xl font-bold font-mono mt-1 ${
                          (cursoSelecionado.frequencia?.porcentagemFrequencia ?? 100) >= 75
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {cursoSelecionado.frequencia?.porcentagemFrequencia ?? 100}%
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Meta: 75%</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Aulas Totais
                      </span>
                      <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                        {cursoSelecionado.frequencia?.totalAulas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Registradas no diário</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Presenças
                      </span>
                      <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {cursoSelecionado.frequencia?.totalPresencas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        +{cursoSelecionado.frequencia?.totalJustificadas || 0} justificada(s)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0D1220] border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Faltas
                      </span>
                      <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                        {cursoSelecionado.frequencia?.totalFaltas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        {cursoSelecionado.frequencia?.faltasConsecutivas || 0} consecutiva(s)
                      </span>
                    </div>
                  </div>

                  {/* Tabela do Diário de Presenças */}
                  <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-[#0D1220]">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Diário de Chamadas ({cursoSelecionado.presencas?.length || 0} registros)
                      </span>
                      <span className="font-mono text-[11px]">
                        {cursoSelecionado.cursoNome} • {cursoSelecionado.turmaCodigo}
                      </span>
                    </div>

                    {cursoSelecionado.presencas?.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                        Nenhum registro de chamada lançado até o momento.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/60 dark:bg-[#080B13] text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800/70">
                            <tr>
                              <th className="py-2.5 px-4">Data</th>
                              <th className="py-2.5 px-4">Status</th>
                              <th className="py-2.5 px-4">Conteúdo</th>
                              <th className="py-2.5 px-4">Justificativa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {cursoSelecionado.presencas?.map((p, idx) => (
                              <tr key={p.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200 font-medium">
                                  {formatarData(p.dataAula)}
                                </td>
                                <td className="py-3 px-4">
                                  {p.status === 'PRESENTE' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                                      Presente
                                    </span>
                                  )}
                                  {p.status === 'FALTA' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40">
                                      Falta
                                    </span>
                                  )}
                                  {p.status === 'JUSTIFICADA' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40">
                                      Justificada
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                  {p.conteudoMinistrado || 'Aula regular'}
                                </td>
                                <td className="py-3 px-4 text-slate-400 dark:text-slate-500 italic">
                                  {p.justificativa || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                  Nenhum curso selecionado.
                </div>
              )}
            </div>
          )}

          {/* ABA 3: HISTÓRICO ESCOLAR */}
          {abaAtiva === 'historico' && (
            <div className="space-y-4">
              {perfil?.historicoCursos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-[#0E1322] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                  Nenhum curso finalizado ou anterior no histórico deste estudante.
                </div>
              ) : (
                perfil?.historicoCursos.map((curso) => (
                  <div
                    key={curso.matriculaId}
                    className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-[#0D1220] hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getCorTemaEscola(
                            curso.escolaSigla || curso.escolaCorTema
                          )}`}
                        >
                          {curso.escolaSigla || 'GERAL'}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{curso.cursoNome}</h4>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                          ({curso.turmaCodigo})
                        </span>
                      </div>

                      <div>
                        {curso.formado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Formado</span>
                          </span>
                        ) : curso.desistenteFaltas ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40">
                            <span>Desistente por Faltas</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                            {curso.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong>Escola:</strong> {curso.escolaNome}</span>
                      <span><strong>Modalidade:</strong> {curso.modalidade || 'Livre'}</span>
                      <span><strong>Período:</strong> {formatarData(curso.dataInicio)} a {formatarData(curso.dataTermino)}</span>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Certificado Oficial (LDB 9.394/96) */}
                        {curso.aptoCertificado || curso.formado ? (
                          <button
                            type="button"
                            onClick={() => handleAbrirCertificado(curso.matriculaId)}
                            disabled={carregandoDocumento}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold transition cursor-pointer shadow-2xs"
                            title="Emitir Certificado Oficial de Conclusão com Grade Curricular e Livro de Registro"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>📜 Emitir Certificado de Conclusão</span>
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700"
                            title={curso.motivoInaptidaoCertificado || 'Não apto ao certificado por frequência insuficiente'}
                          >
                            <span>Sem certificado ({curso.motivoInaptidaoCertificado || 'frequência < 75%'})</span>
                          </span>
                        )}

                        {/* Declaração de Transporte CPTM / SPTrans */}
                        {curso.aptoDeclaracaoTransporte && (
                          <button
                            type="button"
                            onClick={() => handleAbrirDeclaracao(curso.matriculaId)}
                            disabled={carregandoDocumento}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 text-xs font-semibold transition cursor-pointer"
                            title="Emitir Declaração Estudantil para passe escolar CPTM / SPTrans"
                          >
                            <Bus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Declaração CPTM / SPTrans</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 sm:ml-auto text-xs text-slate-500 dark:text-slate-400">
                        {curso.frequencia && (
                          <span>
                            Frequência: <strong className="text-slate-700 dark:text-slate-300">{curso.frequencia.porcentagemFrequencia}%</strong>
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setMatriculaSelecionadaId(curso.matriculaId);
                            setAbaAtiva('frequencia');
                          }}
                          className="font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1"
                        >
                          <span>Ver diário</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Rodapé Minimalista */}
        <div className="bg-slate-50/50 dark:bg-[#070A11] border-t border-slate-100 dark:border-slate-800/80 px-6 py-3.5 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium text-xs transition cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Modal de Certificado Oficial de Conclusão */}
      {modalCertificadoAberto && certificadoSelecionado && (
        <ModalCertificado
          certificado={certificadoSelecionado}
          isOpen={modalCertificadoAberto}
          onClose={() => setModalCertificadoAberto(false)}
        />
      )}

      {/* Modal de Declaração Estudantil CPTM / SPTrans */}
      {modalDeclaracaoAberto && declaracaoSelecionada && (
        <ModalDeclaracaoTransporte
          declaracao={declaracaoSelecionada}
          isOpen={modalDeclaracaoAberto}
          onClose={() => setModalDeclaracaoAberto(false)}
        />
      )}
    </div>
  );
}
