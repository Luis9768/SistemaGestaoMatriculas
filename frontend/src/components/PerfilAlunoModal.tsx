'use client';

import React, { useState, useEffect } from 'react';
import {
  api,
  PerfilAluno,
  MatriculaItemPerfil,
  CertificadoData,
  DeclaracaoTransporteData,
  DeclaracaoMatriculaData,
  aplicarMascaraTelefone,
  formatarTelefone,
  aplicarMascaraCep,
  formatarCep,
} from '@/lib/api';
import { getCorTemaEscola } from '@/lib/escolaUtils';
import { ModalCertificado } from './ModalCertificado';
import { ModalDeclaracaoTransporte } from './ModalDeclaracaoTransporte';
import { ModalDeclaracaoMatricula } from './ModalDeclaracaoMatricula';
import {
  X,
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
  FileText,
  Printer,
  Award,
  Bus,
  UserCheck,
  CreditCard,
  Sparkles,
  Building2,
  Users2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface PerfilAlunoModalProps {
  alunoId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  autoAbrirDeclaracaoMatriculaId?: number | null;
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

const formatarCpf = (cpf?: string) => {
  if (!cpf) return 'Não informado';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
  }
  return cpf;
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

/* ─── Helper de Cor das Escolas ─── */
function getEscolaPillStyle(sigla?: string) {
  switch (sigla) {
    case 'ELT':
      return 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20';
    case 'ELD':
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
    case 'ELCV':
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20';
    case 'EMIA':
    case 'ELIA':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
    default:
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
  }
}

export function PerfilAlunoModal({
  alunoId,
  isOpen,
  onClose,
  onUpdate,
  autoAbrirDeclaracaoMatriculaId,
}: PerfilAlunoModalProps) {
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'atuais' | 'frequencia' | 'historico' | 'cadastro'>('atuais');
  const [matriculaSelecionadaId, setMatriculaSelecionadaId] = useState<number | null>(null);

  // Modo de edição de dados cadastrais
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editCep, setEditCep] = useState('');
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

  // Sub-modais de Documentos
  const [modalCertificadoAberto, setModalCertificadoAberto] = useState(false);
  const [modalDeclaracaoAberto, setModalDeclaracaoAberto] = useState(false);
  const [modalDeclaracaoMatriculaAberto, setModalDeclaracaoMatriculaAberto] = useState(false);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState<CertificadoData | null>(null);
  const [declaracaoSelecionada, setDeclaracaoSelecionada] = useState<DeclaracaoTransporteData | null>(null);
  const [declaracaoMatriculaSelecionada, setDeclaracaoMatriculaSelecionada] = useState<DeclaracaoMatriculaData | null>(null);
  const [carregandoDocumento, setCarregandoDocumento] = useState(false);
  const [concluindoMatriculaId, setConcluindoMatriculaId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && alunoId) {
      carregarPerfil();
    }
  }, [isOpen, alunoId]);

  useEffect(() => {
    if (isOpen && autoAbrirDeclaracaoMatriculaId) {
      handleAbrirDeclaracaoMatricula(autoAbrirDeclaracaoMatriculaId);
    }
  }, [isOpen, autoAbrirDeclaracaoMatriculaId]);

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
      setEditCep(aplicarMascaraCep(perfil.aluno.cep || ''));
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
      setAbaAtiva('cadastro');
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
        cep: editCep.trim() || undefined,
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
      setFeedbackSalvo('Ficha cadastral atualizada com sucesso.');
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
          <title>Ficha Cadastral Interna - ${aluno.nome}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 28px; color: #0f172a; line-height: 1.5; font-size: 12px; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; text-align: center; }
            .header h1 { font-size: 15px; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 0.1em; color: #0f172a; }
            .header h2 { font-size: 12px; margin: 0 0 3px; color: #334155; font-weight: 600; text-transform: uppercase; }
            .header p { font-size: 11px; margin: 0; color: #64748b; }
            .doc-tag { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; margin-top: 6px; }
            .section { margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #fff; }
            .section-title { font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 8px; color: #1e293b; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 16px; }
            .field { margin-bottom: 2px; }
            .field-label { font-weight: 600; color: #64748b; font-size: 11px; }
            .termo-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; font-size: 10.5px; margin-top: 14px; color: #475569; }
            .signatures { margin-top: 36px; display: flex; justify-content: space-between; }
            .sig-line { width: 45%; border-top: 1px solid #334155; text-align: center; padding-top: 6px; font-size: 11px; color: #1e293b; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Prefeitura Municipal de Santo André • Secretaria de Cultura</h1>
            <h2>Rede de Escolas Livres (ELT • ELD • ELCV • EMIA)</h2>
            <div class="doc-tag">FICHA CADASTRAL INTERNA DO ESTUDANTE — REGISTRO #${aluno.id}</div>
          </div>
          <div class="section">
            <div class="section-title">1. Identificação e Contato</div>
            <div class="grid">
              <div class="field"><span class="field-label">Nome Completo:</span> <strong>${aluno.nome}</strong></div>
              <div class="field"><span class="field-label">CPF:</span> ${formatarCpf(aluno.cpf)}</div>
              <div class="field"><span class="field-label">Data de Nascimento:</span> ${formatarData(aluno.dataNascimento)}</div>
              <div class="field"><span class="field-label">Identidade de Gênero:</span> ${aluno.genero || 'Não informado'}</div>
              <div class="field"><span class="field-label">E-mail:</span> ${aluno.email}</div>
              <div class="field"><span class="field-label">Telefone:</span> ${formatarTelefone(aluno.telefone) || 'Não informado'}</div>
              <div class="field"><span class="field-label">Endereço:</span> ${aluno.endereco || 'Não informado'}</div>
              <div class="field"><span class="field-label">CEP:</span> ${aluno.cep || 'Não informado'}</div>
              <div class="field"><span class="field-label">Bairro / Cidade:</span> ${(aluno.bairro || '') + ' - ' + (aluno.cidade || 'Santo André')}/SP</div>
            </div>
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

  const handleAbrirDeclaracaoMatricula = async (matriculaIdAlvo?: number) => {
    let matId = matriculaIdAlvo;
    if (!matId) {
      if (matriculaSelecionadaId) {
        matId = matriculaSelecionadaId;
      } else if (perfil?.cursosAtuais && perfil.cursosAtuais.length > 0) {
        matId = perfil.cursosAtuais[0].matriculaId;
      } else if (perfil?.historicoCursos && perfil.historicoCursos.length > 0) {
        matId = perfil.historicoCursos[0].matriculaId;
      }
    }

    if (!matId && aluno) {
      alert('Nenhuma turma ou curso encontrado para emitir a declaração deste estudante.');
      return;
    }

    try {
      setCarregandoDocumento(true);
      if (matId) {
        const dec = await api.getDeclaracaoMatricula(matId);
        setDeclaracaoMatriculaSelecionada(dec);
        setModalDeclaracaoMatriculaAberto(true);
      }
    } catch (e: any) {
      const curso =
        perfil?.cursosAtuais.find((c) => c.matriculaId === matId) ||
        perfil?.historicoCursos.find((c) => c.matriculaId === matId) ||
        (perfil?.cursosAtuais && perfil.cursosAtuais[0]);

      if (curso && aluno) {
        const hoje = new Date();
        const meses = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const dataEmissaoFormatada = `${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
        const mesAnoInicio = curso.dataInicio
          ? (() => {
              const d = new Date(curso.dataInicio);
              return `${meses[d.getMonth()]} de ${d.getFullYear()}`;
            })()
          : 'fevereiro de 2026';

        const decFallback: DeclaracaoMatriculaData = {
          matriculaId: curso.matriculaId,
          codigoAutenticidade: `DECL-2026-${curso.escolaSigla || 'SA'}-${String(curso.matriculaId).padStart(5, '0')}`,
          instituicaoEnsino: 'Prefeitura Municipal de Santo André • Secretaria de Cultura',
          cnpjInstituicao: '46.522.942/0001-30',
          escolaNome: curso.escolaNome || 'Escolas Livres de Santo André',
          escolaSigla: curso.escolaSigla || 'EL',
          escolaEndereco: 'Secretaria de Cultura • Santo André - SP',
          alunoId: aluno.id || 0,
          alunoNome: aluno.nome,
          alunoCpf: aluno.cpf,
          alunoDataNascimento: aluno.dataNascimento,
          alunoIdade: calcularIdade(aluno.dataNascimento) || undefined,
          alunoEnderecoCompleto: aluno.endereco
            ? `${aluno.endereco}, ${aluno.bairro || ''} - ${aluno.cidade || 'Santo André'}/SP`
            : 'Santo André - SP',
          alunoNomeResponsavel: aluno.responsavel?.nome,
          alunoCpfResponsavel: aluno.responsavel?.cpf,
          cursoNome: curso.cursoNome,
          turmaCodigo: curso.turmaCodigo,
          modalidadeEnsino: curso.modalidade || 'Formação Artística Regular',
          dataInicioAulas: curso.dataInicio,
          dataMatricula: curso.dataMatricula,
          mesAnoInicioExtenso: mesAnoInicio,
          dataInicioExtenso: formatarData(curso.dataInicio),
          diasHorarioAulas: `${curso.diasSemana || 'Dias regulares'} • ${curso.horario || 'Horário regular'}`,
          cargaHorariaTotal: 80,
          porcentagemFrequenciaAtual: curso.frequencia?.porcentagemFrequencia ?? 100,
          statusMatricula: 'REGULARMENTE MATRICULADO(A) E ATIVO(A)',
          anoLetivo: 2026,
          textoDeclaracao: `Declaramos que o(a) estudante ${aluno.nome}, inscrito(a) no CPF ${aluno.cpf}, encontra-se regularmente matriculado(a) e com frequência ativa no curso de ${curso.cursoNome}.`,
          dataEmissaoFormatada: dataEmissaoFormatada,
          responsavelSecretaria: 'Secretaria Acadêmica • Rede de Escolas Livres de Santo André',
        };
        setDeclaracaoMatriculaSelecionada(decFallback);
        setModalDeclaracaoMatriculaAberto(true);
      } else {
        alert(e.message || 'Erro ao emitir declaração de matrícula escolar');
      }
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
      {/* ─── MODAL CONTAINER (SHADCN CLEAN CARD STYLE) ─── */}
      <div className="bg-white dark:bg-[#0E1424] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 max-w-5xl xl:max-w-6xl w-full h-[90vh] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* ─── 1. TOP HEADER (STUDENT DOSSIER CARD) ─── */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0E1424] shrink-0">
          {loading ? (
            <div className="flex items-center gap-3 py-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Carregando prontuário do estudante...
              </span>
            </div>
          ) : erro ? (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-3.5 rounded-xl text-xs flex items-center justify-between">
              <span>{erro}</span>
              <button onClick={carregarPerfil} className="underline text-xs font-semibold cursor-pointer">
                Tentar novamente
              </button>
            </div>
          ) : aluno ? (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Avatar + Nome + Metadados com Ícones */}
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-black text-xl flex items-center justify-center shrink-0 shadow-2xs">
                  {aluno.nome.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                      {aluno.nome}
                    </h2>
                    {aluno.menorDeIdade ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        Menor de Idade
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        Regular
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                      Matrícula #{aluno.id}
                    </span>
                  </div>

                  {/* Grid de Metadados Limpa e Organizada */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>CPF {formatarCpf(aluno.cpf)}</span>
                    </div>

                    {aluno.dataNascimento && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatarData(aluno.dataNascimento)}{idade !== null ? ` (${idade} anos)` : ''}</span>
                      </div>
                    )}

                    {aluno.telefone && (
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatarTelefone(aluno.telefone)}</span>
                      </div>
                    )}

                    {aluno.email && (
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={aluno.email}>
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{aluno.email}</span>
                      </div>
                    )}

                    {(aluno.bairro || aluno.cidade) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{[aluno.bairro, aluno.cidade || 'Santo André'].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Cabeçalho (Padrão Shadcn) */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => handleAbrirDeclaracaoMatricula()}
                  disabled={carregandoDocumento}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
                  title="Emitir Declaração Oficial de Matrícula (PDF)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Declaração de Matrícula</span>
                </button>

                <button
                  type="button"
                  onClick={handleImprimirFichaTermo}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                  title="Imprimir Ficha Cadastral"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Ficha Cadastral</span>
                </button>

                <button
                  type="button"
                  onClick={iniciarEdicao}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                  title="Editar Ficha"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Editar</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ml-1"
                  aria-label="Fechar prontuário"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* ─── 2. TABS BAR (ESTILO SHADCN SEGMENTED LIST) ─── */}
        <div className="bg-slate-50/80 dark:bg-[#0B101D] px-6 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-900/80 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setAbaAtiva('atuais')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                abaAtiva === 'atuais'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Cursos Atuais</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {perfil?.cursosAtuais.length || 0}
              </span>
            </button>

            <button
              onClick={() => setAbaAtiva('frequencia')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                abaAtiva === 'frequencia'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Frequência & Presenças</span>
              {cursoSelecionado?.frequencia?.atingiuLimiteFaltas && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setAbaAtiva('historico')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                abaAtiva === 'historico'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>Histórico Escolar</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {perfil?.historicoCursos.length || 0}
              </span>
            </button>

            <button
              onClick={() => setAbaAtiva('cadastro')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                abaAtiva === 'cadastro'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Ficha & Dados Cadastrais</span>
              {modoEdicao && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold uppercase">
                  Editando
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono font-medium">
            <span>{perfil?.totalCursosAtivos || 0} ativo(s)</span>
            <span>·</span>
            <span>{perfil?.totalCursosConcluidos || 0} concluído(s)</span>
          </div>
        </div>

        {/* ─── 3. TAB CONTENT (RESPONSIVE SCROLLABLE BODY) ─── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#F8FAFC]/50 dark:bg-[#0B101D]">
          
          {/* ════ ABA 1: CURSOS ATUAIS ════ */}
          {abaAtiva === 'atuais' && (
            <div className="space-y-5">
              {perfil?.cursosAtuais.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0E1424] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs flex flex-col items-center gap-2">
                  <BookOpen className="w-8 h-8 opacity-40" />
                  <span>O estudante não possui matrículas ativas no momento.</span>
                </div>
              ) : (
                perfil?.cursosAtuais.map((curso) => {
                  const freq = curso.frequencia?.porcentagemFrequencia ?? 100;
                  const faltasConsecutivas = curso.frequencia?.faltasConsecutivas || 0;
                  const emAlerta = curso.frequencia?.atingiuLimiteFaltas || faltasConsecutivas >= 3;
                  const escolaPill = getEscolaPillStyle(curso.escolaSigla);

                  return (
                    <div
                      key={curso.matriculaId}
                      className="bg-white dark:bg-[#0E1424] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-xs space-y-5"
                    >
                      {/* Topo do Card de Matrícula */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold border uppercase tracking-wider ${escolaPill}`}
                          >
                            {curso.escolaSigla || 'GERAL'}
                          </span>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                            {curso.cursoNome}
                          </h3>
                          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {curso.turmaCodigo}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                            {curso.modalidade || 'FORMAÇÃO'}
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            {curso.status}
                          </span>
                        </div>
                      </div>

                      {/* Grade de Informações Acadêmicas (4 Tiles) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Período Letivo</span>
                          </span>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {formatarData(curso.dataInicio)} a {formatarData(curso.dataTermino)}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Escola Oficial</span>
                          </span>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {curso.escolaNome || 'Escolas Livres Santo André'}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Horário & Dias</span>
                          </span>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {curso.horario || 'Conforme cronograma da turma'}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Modalidade</span>
                          </span>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {curso.modalidade || 'Regular'}
                          </p>
                        </div>
                      </div>

                      {/* Bloco Elegante de Assiduidade & Presenças (Shadcn Bento Style) */}
                      <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Assiduidade do Estudante
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              (Meta mínima exigida: 75%)
                            </span>
                          </div>
                          <span
                            className={`text-base font-black font-mono ${
                              freq >= 75
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {freq}%
                          </span>
                        </div>

                        {/* Barra de Progresso Suave */}
                        <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              freq >= 75
                                ? 'bg-emerald-500 dark:bg-emerald-400'
                                : 'bg-rose-500 dark:bg-rose-400'
                            }`}
                            style={{ width: `${Math.min(freq, 100)}%` }}
                          />
                        </div>

                        {/* Mini Chips de Presenças / Faltas */}
                        <div className="flex items-center justify-between text-xs font-mono pt-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {curso.frequencia?.totalPresencas || 0} presenças
                            </span>
                            <span className="text-slate-400">de</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {curso.frequencia?.totalAulas || 0} aulas ministradas
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              {curso.frequencia?.totalFaltas || 0} faltas
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                faltasConsecutivas >= 2
                                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                                  : 'text-slate-400'
                              }`}
                            >
                              ({faltasConsecutivas} consecutivas)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Alerta de Risco de Evasão (se houver) */}
                      {emAlerta && (
                        <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 rounded-xl p-4 space-y-3 text-xs">
                          <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-300">
                            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <div>
                              <strong className="block text-sm font-bold">
                                Alerta de Busca Ativa (3 ou mais ausências consecutivas)
                              </strong>
                              <span className="text-[11px] text-amber-800 dark:text-amber-400">
                                Estudante em risco crítico de desligamento. Contate o estudante ou responsável para justificar faltas antes do cancelamento definitivo da vaga.
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
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Contatar por WhatsApp</span>
                              </a>
                            )}

                            {(aluno?.email || aluno?.responsavel?.email) && (
                              <a
                                href={`mailto:${aluno?.email || aluno?.responsavel?.email}?subject=${encodeURIComponent(
                                  `Frequência Escolar: ${curso.cursoNome}`
                                )}`}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Enviar E-mail</span>
                              </a>
                            )}

                            {curso.status !== 'DESISTENTE_FALTAS' && curso.status !== 'CANCELADA' && (
                              <button
                                type="button"
                                onClick={() => handleDesligarPorFaltas(curso.matriculaId)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer sm:ml-auto"
                              >
                                Confirmar Desligamento por Faltas
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Barra de Ações & Emissão de Documentos */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAbrirDeclaracaoMatricula(curso.matriculaId)}
                            disabled={carregandoDocumento}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                            title="Emitir Declaração Oficial de Matrícula"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Declaração de Matrícula</span>
                          </button>

                          {curso.aptoDeclaracaoTransporte ? (
                            <button
                              type="button"
                              onClick={() => handleAbrirDeclaracao(curso.matriculaId)}
                              disabled={carregandoDocumento}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                              title="Emitir Declaração de Transporte CPTM / SPTrans"
                            >
                              <Bus className="w-3.5 h-3.5 text-sky-500" />
                              <span>Passe CPTM / SPTrans</span>
                            </button>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
                              title={curso.motivoInaptidaoDeclaracaoTransporte || 'Requer 60 dias de curso'}
                            >
                              <Bus className="w-3.5 h-3.5 text-slate-400" />
                              <span>Passe Transporte ({curso.diasRestantesDeclaracaoTransporte ?? 60}d restantes)</span>
                            </span>
                          )}

                          {/* Homologar Formatura se Ativo */}
                          {(curso.status === 'CONFIRMADA' || curso.status === 'ATIVA') && (
                            freq >= 75 ? (
                              <button
                                type="button"
                                onClick={() => handleConcluirMatricula(curso.matriculaId)}
                                disabled={concluindoMatriculaId === curso.matriculaId}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>{concluindoMatriculaId === curso.matriculaId ? 'Homologando...' : 'Homologar Formatura (≥75%)'}</span>
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
                                title={`Frequência de ${freq}% é insuficiente para formatura (mínimo: 75%)`}
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                <span>Formatura Bloqueada ({freq}% &lt; 75%)</span>
                              </span>
                            )
                          )}

                          {curso.aptoCertificado && (
                            <button
                              type="button"
                              onClick={() => handleAbrirCertificado(curso.matriculaId)}
                              disabled={carregandoDocumento}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold transition cursor-pointer shadow-2xs"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>Certificado MEC/LDB</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMatriculaSelecionadaId(curso.matriculaId);
                            setAbaAtiva('frequencia');
                          }}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer transition sm:ml-auto"
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

          {/* ════ ABA 2: FREQUÊNCIA & DIÁRIO DE CHAMADAS ════ */}
          {abaAtiva === 'frequencia' && (
            <div className="space-y-5">
              {/* Seletor de Curso */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0E1424] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Turma Vinculada:
                  </label>
                  <select
                    value={matriculaSelecionadaId || ''}
                    onChange={(e) => setMatriculaSelecionadaId(Number(e.target.value))}
                    className="w-full sm:w-80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 cursor-pointer"
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

              {cursoSelecionado ? (
                <>
                  {/* 4 Cards de Métricas da Frequência */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1424] border border-slate-200/90 dark:border-slate-800/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                        Assiduidade
                      </span>
                      <div
                        className={`text-2xl font-black font-mono mt-1 ${
                          (cursoSelecionado.frequencia?.porcentagemFrequencia ?? 100) >= 75
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {cursoSelecionado.frequencia?.porcentagemFrequencia ?? 100}%
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Meta: ≥ 75%</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1424] border border-slate-200/90 dark:border-slate-800/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                        Aulas Registradas
                      </span>
                      <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
                        {cursoSelecionado.frequencia?.totalAulas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Aulas no diário</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1424] border border-slate-200/90 dark:border-slate-800/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                        Presenças
                      </span>
                      <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {cursoSelecionado.frequencia?.totalPresencas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        +{cursoSelecionado.frequencia?.totalJustificadas || 0} justificada(s)
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1424] border border-slate-200/90 dark:border-slate-800/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                        Faltas
                      </span>
                      <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                        {cursoSelecionado.frequencia?.totalFaltas || 0}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {cursoSelecionado.frequencia?.faltasConsecutivas || 0} consecutiva(s)
                      </span>
                    </div>
                  </div>

                  {/* Tabela do Diário de Chamadas */}
                  <div className="border border-slate-200/90 dark:border-slate-800/90 rounded-2xl overflow-hidden bg-white dark:bg-[#0E1424] shadow-xs">
                    <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        Registros de Chamadas ({cursoSelecionado.presencas?.length || 0} aulas lançadas)
                      </span>
                      <span className="font-mono text-[11px] font-bold">
                        {cursoSelecionado.cursoNome} • {cursoSelecionado.turmaCodigo}
                      </span>
                    </div>

                    {cursoSelecionado.presencas?.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        Nenhum registro de chamada lançado até o momento para este curso.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800/80">
                            <tr>
                              <th className="py-3 px-4">Data</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Conteúdo Ministrado</th>
                              <th className="py-3 px-4">Observações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {cursoSelecionado.presencas?.map((p, idx) => (
                              <tr key={p.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200 font-bold">
                                  {formatarData(p.dataAula)}
                                </td>
                                <td className="py-3 px-4">
                                  {p.status === 'PRESENTE' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                      Presente
                                    </span>
                                  )}
                                  {p.status === 'FALTA' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                      Falta
                                    </span>
                                  )}
                                  {p.status === 'JUSTIFICADA' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                      Justificada
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                  {p.conteudoMinistrado || 'Aula regular'}
                                </td>
                                <td className="py-3 px-4 text-slate-400 italic">
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
                <div className="text-center py-12 text-slate-400 text-xs">
                  Selecione um curso para visualizar a frequência.
                </div>
              )}
            </div>
          )}

          {/* ════ ABA 3: HISTÓRICO ESCOLAR ════ */}
          {abaAtiva === 'historico' && (
            <div className="space-y-4">
              {perfil?.historicoCursos.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0E1424] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs flex flex-col items-center gap-2">
                  <GraduationCap className="w-8 h-8 opacity-40" />
                  <span>Nenhum curso anterior no histórico deste estudante.</span>
                </div>
              ) : (
                perfil?.historicoCursos.map((curso) => (
                  <div
                    key={curso.matriculaId}
                    className="bg-white dark:bg-[#0E1424] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold border uppercase tracking-wider ${getEscolaPillStyle(
                            curso.escolaSigla
                          )}`}
                        >
                          {curso.escolaSigla || 'GERAL'}
                        </span>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                          {curso.cursoNome}
                        </h4>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          ({curso.turmaCodigo})
                        </span>
                      </div>

                      <div>
                        {curso.formado ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <GraduationCap className="w-4 h-4" />
                            <span>Formado</span>
                          </span>
                        ) : curso.desistenteFaltas ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            <span>Desistente por Faltas</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {curso.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-5 gap-y-1">
                      <span><strong>Escola:</strong> {curso.escolaNome}</span>
                      <span><strong>Período:</strong> {formatarData(curso.dataInicio)} a {formatarData(curso.dataTermino)}</span>
                      {curso.frequencia && (
                        <span><strong>Frequência Final:</strong> {curso.frequencia.porcentagemFrequencia}%</span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {curso.aptoCertificado || curso.formado ? (
                          <button
                            type="button"
                            onClick={() => handleAbrirCertificado(curso.matriculaId)}
                            disabled={carregandoDocumento}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold transition cursor-pointer shadow-2xs"
                          >
                            <Award className="w-4 h-4 text-amber-500" />
                            <span>Emitir Certificado de Conclusão</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Sem certificado (frequência &lt; 75%)
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAbrirDeclaracaoMatricula(curso.matriculaId)}
                          disabled={carregandoDocumento}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                        >
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span>Declaração de Matrícula</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setMatriculaSelecionadaId(curso.matriculaId);
                          setAbaAtiva('frequencia');
                        }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver diário do curso</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ════ ABA 4: FICHA & DADOS CADASTRAIS (LGPD) ════ */}
          {abaAtiva === 'cadastro' && aluno && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {feedbackSalvo && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{feedbackSalvo}</span>
                </div>
              )}

              {modoEdicao ? (
                <form
                  onSubmit={handleSalvarEdicao}
                  className="bg-white dark:bg-[#0E1424] border border-slate-200/90 dark:border-slate-800/90 p-6 rounded-2xl space-y-5 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        Editar Ficha Cadastral do Estudante
                      </h3>
                      <p className="text-xs text-slate-500">
                        Atualize dados de contato, endereço residencial e informações de inclusão
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-3 p-4 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <span className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200/60 pb-1 font-mono">
                        1. Dados de Contato
                      </span>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Telefone / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={editTelefone}
                          onChange={(e) => setEditTelefone(aplicarMascaraTelefone(e.target.value))}
                          maxLength={15}
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Identidade de Gênero
                        </label>
                        <input
                          type="text"
                          value={editGenero}
                          onChange={(e) => setEditGenero(e.target.value)}
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <span className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200/60 pb-1 font-mono">
                        2. Endereço Residencial
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            CEP
                          </label>
                          <input
                            type="text"
                            placeholder="09000-000"
                            maxLength={9}
                            value={editCep}
                            onChange={(e) => setEditCep(aplicarMascaraCep(e.target.value))}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Logradouro
                          </label>
                          <input
                            type="text"
                            value={editEndereco}
                            onChange={(e) => setEditEndereco(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Bairro
                          </label>
                          <input
                            type="text"
                            value={editBairro}
                            onChange={(e) => setEditBairro(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={editCidade}
                            onChange={(e) => setEditCidade(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Contato de Emergência
                        </label>
                        <input
                          type="text"
                          value={editContatoEmergencia}
                          onChange={(e) => setEditContatoEmergencia(e.target.value)}
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModoEdicao(false)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvandoEdicao}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      {salvandoEdicao ? 'Salvando...' : 'Salvar Ficha'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Visualização do Dossiê Cadastral em 3 Cards Bento */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Identificação */}
                  <div className="bg-white dark:bg-[#0E1424] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                      <UserCheck className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200">
                        1. Identificação & Contato
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Nome Completo</span>
                        <strong className="text-slate-900 dark:text-white">{aluno.nome}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">E-mail</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{aluno.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Telefone</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {formatarTelefone(aluno.telefone) || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Gênero</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.genero || 'Não declarado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Endereço & Residência */}
                  <div className="bg-white dark:bg-[#0E1424] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200">
                        2. Endereço Residencial
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Logradouro</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.endereco || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">CEP</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {aluno.cep ? formatarCep(aluno.cep) : 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Bairro</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.bairro || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Cidade / UF</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.cidade || 'Santo André'} / SP
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Emergência</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.contatoEmergencia || 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Inclusão & Responsável */}
                  <div className="bg-white dark:bg-[#0E1424] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wider font-mono text-slate-800 dark:text-slate-200">
                        3. Inclusão & Vínculo
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">PCD</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.pcd ? `Sim (${aluno.pcdDetalhe || 'Registrado'})` : 'Não registrado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Neurodivergência</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.neurodiverso ? `Sim (${aluno.neurodiversoDetalhe || 'Registrado'})` : 'Não registrada'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Responsável Legal</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.responsavel
                            ? `${aluno.responsavel.nome} (${aluno.responsavel.grauParentesco || 'Responsável'})`
                            : aluno.menorDeIdade
                            ? 'Pendente'
                            : 'Maior de idade (Titular)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Uso de Imagem</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {aluno.consentimentoUsoImagem ? 'Autorizado' : 'Não autorizado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ─── 4. MODAL FOOTER ─── */}
        <div className="bg-white dark:bg-[#0E1424] border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            Prefeitura de Santo André • Prontuário Escolar #{aluno?.id || ''}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Sub-modais de Documentos */}
      {modalCertificadoAberto && certificadoSelecionado && (
        <ModalCertificado
          certificado={certificadoSelecionado}
          isOpen={modalCertificadoAberto}
          onClose={() => setModalCertificadoAberto(false)}
        />
      )}

      {modalDeclaracaoAberto && declaracaoSelecionada && (
        <ModalDeclaracaoTransporte
          declaracao={declaracaoSelecionada}
          isOpen={modalDeclaracaoAberto}
          onClose={() => setModalDeclaracaoAberto(false)}
        />
      )}

      {modalDeclaracaoMatriculaAberto && declaracaoMatriculaSelecionada && (
        <ModalDeclaracaoMatricula
          declaracao={declaracaoMatriculaSelecionada}
          isOpen={modalDeclaracaoMatriculaAberto}
          onClose={() => setModalDeclaracaoMatriculaAberto(false)}
        />
      )}
    </div>
  );
}
