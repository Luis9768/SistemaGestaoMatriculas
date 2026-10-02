'use client';

import React from 'react';
import { CertificadoData } from '@/lib/api';
import { X, Printer, Award, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

interface ModalCertificadoProps {
  certificado: CertificadoData;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalCertificado({ certificado, isOpen, onClose }: ModalCertificadoProps) {
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
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Barra Superior de Ações (Oculta na Impressão) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Certificado Oficial de Conclusão de Curso
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Padrão MEC / Lei 9.394/96 (LDB Art. 42) • Autenticidade Digital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
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

        {/* Área do Documento do Certificado */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/60 dark:bg-slate-950 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div
            id="area-impressao-certificado"
            className="w-full max-w-[920px] bg-[#FFFDF9] text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border-[10px] border-double border-[#8B7355] relative flex flex-col justify-between print:shadow-none print:border-[8px] print:m-0 print:p-8 print:w-full print:rounded-none"
            style={{ minHeight: '620px' }}
          >
            {/* Marca d'água de fundo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <Award className="w-[450px] h-[450px] text-slate-900" />
            </div>

            {/* Cabeçalho Oficial */}
            <div className="text-center space-y-1.5 relative z-10 border-b-2 border-[#8B7355]/40 pb-5">
              <div className="inline-flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-[#8B7355]" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-700">
                  Prefeitura Municipal de Santo André • Secretaria de Cultura
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-serif">
                {certificado.escolaNome}
              </h1>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8B7355]">
                Rede Oficial de Escolas Livres de Santo André • CNPJ 46.522.942/0001-30
              </p>
            </div>

            {/* Título Principal */}
            <div className="text-center my-6 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-slate-900 font-serif uppercase">
                Certificado de Formação Artística
              </h2>
              <div className="w-24 h-0.5 bg-[#8B7355] mx-auto mt-2" />
            </div>

            {/* Texto de Concessão do Certificado */}
            <div className="text-justify text-xs sm:text-sm leading-relaxed text-slate-800 space-y-4 my-4 relative z-10 font-serif">
              <p>
                Certificamos que{' '}
                <strong className="text-base text-slate-950 font-sans tracking-tight">
                  {certificado.alunoNome}
                </strong>
                , portador(a) do CPF nº <strong>{certificado.alunoCpf}</strong>, concluiu com êxito e
                aproveitamento pedagógico o curso de formação artística{' '}
                <strong className="text-slate-950 font-sans uppercase">
                  {certificado.cursoNome}
                </strong>{' '}
                (Turma {certificado.turmaCodigo}), realizado no período letivo de{' '}
                <strong>{certificado.periodoRealizacao}</strong>, totalizando a carga horária de{' '}
                <strong>
                  {certificado.cargaHorariaTotal} horas ({certificado.cargaHorariaExtenso})
                </strong>
                .
              </p>

              <p>
                O(A) concluinte obteve frequência de{' '}
                <strong>{certificado.porcentagemFrequencia.toFixed(1)}%</strong> ({certificado.presencasConfirmadas} presenças apuradas em {certificado.totalAulas} aulas ministradas), cumprindo integralmente as diretrizes pedagógicas e a exigência institucional de frequência mínima de 75%.
              </p>
            </div>

            {/* Grade Curricular / Matérias Concluídas */}
            {certificado.materiasConcluidas && certificado.materiasConcluidas.length > 0 && (
              <div className="my-3 p-3 bg-[#FBF7EE] border border-[#E5DAC6] rounded-lg relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B573E] mb-2 flex items-center justify-between border-b border-[#E5DAC6] pb-1">
                  <span>Componentes Curriculares & Matérias Concluídas</span>
                  <span>Aproveitamento Satisfatório</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-700">
                  {certificado.materiasConcluidas.map((m, idx) => (
                    <div key={m.id || idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B7355] shrink-0" />
                      <span className="truncate font-medium">{m.nome}</span>
                      {m.duracaoEstimada && (
                        <span className="text-slate-500 font-mono text-[9px]">({m.duracaoEstimada})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amparo Legal e Autenticidade */}
            <div className="text-[10px] text-slate-600 border-t border-[#8B7355]/30 pt-3 flex flex-col sm:flex-row justify-between gap-2 relative z-10">
              <div className="space-y-0.5">
                <p><strong>Fundamentação Legal:</strong> {certificado.amparoLegal}</p>
                <p className="font-mono text-[9px] text-slate-500">
                  {certificado.numeroRegistroLivro} • Autenticidade: {certificado.codigoAutenticidade}
                </p>
              </div>
              <div className="text-right sm:shrink-0 font-medium text-slate-700">
                {certificado.cidadeUfExpedicao}, {certificado.dataExpedicaoFormatada}.
              </div>
            </div>

            {/* Linhas de Assinaturas Oficiais */}
            <div className="grid grid-cols-3 gap-6 pt-10 mt-6 relative z-10 text-center text-[10px]">
              <div className="border-t border-slate-700 pt-1.5">
                <p className="font-bold text-slate-900">Coordenação Pedagógica</p>
                <p className="text-slate-600 text-[9px]">{certificado.escolaNome}</p>
              </div>
              <div className="border-t border-slate-700 pt-1.5">
                <p className="font-bold text-slate-900">Direção das Escolas Livres</p>
                <p className="text-slate-600 text-[9px]">Secretaria de Cultura</p>
              </div>
              <div className="border-t border-slate-700 pt-1.5">
                <p className="font-bold text-slate-900">Secretaria de Cultura</p>
                <p className="text-slate-600 text-[9px]">Prefeitura de Santo André</p>
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
          #area-impressao-certificado,
          #area-impressao-certificado * {
            visibility: visible;
          }
          #area-impressao-certificado {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
            background: white !important;
            border: 6px double #8b7355 !important;
            page-break-after: avoid;
          }
          @page {
            size: landscape;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}
