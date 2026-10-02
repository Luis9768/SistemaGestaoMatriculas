'use client';

import React from 'react';
import { DeclaracaoTransporteData } from '@/lib/api';
import { X, Printer, Train, Bus, Building2, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';

interface ModalDeclaracaoTransporteProps {
  declaracao: DeclaracaoTransporteData;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalDeclaracaoTransporte({ declaracao, isOpen, onClose }: ModalDeclaracaoTransporteProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Barra Superior de Ações (Oculta na Impressão) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
              <Train className="w-5 h-5" />
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Declaração Estudantil para Transporte (CPTM / SPTrans)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Padrão Oficial de Concessão de Passe Escolar • Vínculo Ativo &gt; 60 dias
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área do Documento da Declaração (Padrão A4 Retrato) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/60 dark:bg-slate-950 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div
            id="area-impressao-declaracao"
            className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-300 relative flex flex-col justify-between print:shadow-none print:border-none print:m-0 print:p-6 print:w-full print:rounded-none"
            style={{ minHeight: '850px' }}
          >
            {/* Cabeçalho Oficial Timbrado */}
            <div>
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="inline-flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-800" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">
                    Prefeitura Municipal de Santo André • Secretaria de Cultura
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black uppercase text-slate-950">
                  {declaracao.escolaNome}
                </h1>
                <p className="text-[10px] text-slate-600 font-mono">
                  {declaracao.escolaEndereco}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  CNPJ Mantenedora: {declaracao.cnpjInstituicao} • Secretaria Escolar Central
                </p>
              </div>

              {/* Título do Documento */}
              <div className="text-center my-6">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-950 underline decoration-2 underline-offset-4">
                  Declaração de Matrícula e Frequência Escolar
                </h2>
                <p className="text-[11px] font-bold text-sky-800 uppercase tracking-wider mt-1">
                  Finalidade: Benefício Tarifário de Transporte Estudantil (CPTM • SPTrans • EMTU)
                </p>
              </div>

              {/* Seção 1: Dados do Estudante */}
              <div className="space-y-3 text-xs text-slate-800">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                  <div className="font-bold uppercase text-[10px] text-slate-500 tracking-wider border-b border-slate-200 pb-1">
                    1. Identificação do(a) Estudante
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div><strong>Nome Completo:</strong> {declaracao.alunoNome}</div>
                    <div><strong>CPF:</strong> {declaracao.alunoCpf}</div>
                    <div><strong>Data de Nascimento:</strong> {declaracao.alunoDataNascimento || 'Não informada'}</div>
                    {declaracao.alunoNomeResponsavel && (
                      <div><strong>Responsável Legal (Art. 14 LGPD):</strong> {declaracao.alunoNomeResponsavel}</div>
                    )}
                    <div className="sm:col-span-2">
                      <strong>Endereço Residencial Declarado:</strong> {declaracao.alunoEnderecoCompleto}
                    </div>
                  </div>
                </div>

                {/* Seção 2: Dados Acadêmicos e Regime de Aulas */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                  <div className="font-bold uppercase text-[10px] text-slate-500 tracking-wider border-b border-slate-200 pb-1">
                    2. Dados do Curso e Cronograma Presencial
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div><strong>Curso / Formação:</strong> {declaracao.cursoNome}</div>
                    <div><strong>Código da Turma:</strong> {declaracao.turmaCodigo}</div>
                    <div><strong>Modalidade:</strong> {declaracao.modalidadeEnsino}</div>
                    <div><strong>Carga Horária Semanal:</strong> {declaracao.cargaHorariaSemanal} horas semanais</div>
                    <div><strong>Carga Horária Total:</strong> {declaracao.cargaHorariaTotal} horas</div>
                    <div><strong>Dias e Horários das Aulas:</strong> {declaracao.horarioTurnoAulas}</div>
                    <div><strong>Data de Início das Aulas:</strong> {declaracao.dataInicioAulas}</div>
                    <div><strong>Previsão de Término:</strong> {declaracao.dataPrevisaoTermino}</div>
                  </div>
                </div>

                {/* Seção 3: Texto Oficial de Vínculo Efetivo (> 60 dias) */}
                <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-lg text-xs leading-relaxed text-sky-950 font-serif text-justify">
                  <p className="mb-2">
                    {declaracao.textoDeclaracao}
                  </p>
                  <div className="text-[11px] font-sans font-semibold text-sky-900 flex flex-wrap gap-4 pt-1 border-t border-sky-200/80">
                    <span>• Tempo de Curso Cumprido: <strong>{declaracao.diasCursadosCumpridos} dias ativos</strong> (&gt; 60 dias)</span>
                    <span>• Frequência Apurada: <strong>{declaracao.porcentagemFrequenciaAtual.toFixed(1)}% de assiduidade</strong></span>
                    <span>• Situação Atual: <strong>{declaracao.statusMatricula}</strong></span>
                  </div>
                </div>

                {/* Órgãos e Finalidade */}
                <div className="text-[11px] text-slate-600 space-y-1 pt-2">
                  <p><strong>Destinatários:</strong> {declaracao.orgaosDestinatarios}.</p>
                  <p><strong>Observação Legal:</strong> {declaracao.finalidade}</p>
                  <p className="text-amber-800 font-medium"><strong>Validade:</strong> {declaracao.validadeDeclaracao}</p>
                </div>
              </div>
            </div>

            {/* Rodapé Oficial, Data e Assinatura */}
            <div className="pt-8 border-t border-slate-300 mt-6 space-y-6">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Santo André - SP, {declaracao.dataEmissaoFormatada}.</span>
                <span className="font-mono text-[10px]">Autenticidade: {declaracao.codigoAutenticidade}</span>
              </div>

              <div className="grid grid-cols-2 gap-8 text-center text-xs pt-8">
                <div className="border-t border-slate-800 pt-2">
                  <p className="font-bold text-slate-900">{declaracao.responsavelSecretaria}</p>
                  <p className="text-[10px] text-slate-500">Secretaria de Cultura • Santo André</p>
                </div>

                <div className="border-t border-slate-800 pt-2">
                  <p className="font-bold text-slate-900">Carimbo e Assinatura do Responsável</p>
                  <p className="text-[10px] text-slate-500">Visto de Validação SPTrans / CPTM</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Estilos Específicos para Impressão */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #area-impressao-declaracao,
          #area-impressao-declaracao * {
            visibility: visible;
          }
          #area-impressao-declaracao {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
            background: white !important;
            page-break-after: avoid;
          }
          @page {
            size: portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
