'use client';

import React from 'react';
import { DeclaracaoMatriculaData } from '@/lib/api';
import { X, Printer, Building2, FileText } from 'lucide-react';

interface ModalDeclaracaoMatriculaProps {
  declaracao: DeclaracaoMatriculaData;
  isOpen: boolean;
  onClose: () => void;
}

const formatarCpf = (cpf?: string) => {
  if (!cpf) return 'Não informado';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
  }
  return cpf;
};

const formatarData = (dataStr?: string) => {
  if (!dataStr) return 'Não informada';
  const clean = dataStr.split('T')[0];
  const partes = clean.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};

export function ModalDeclaracaoMatricula({ declaracao, isOpen, onClose }: ModalDeclaracaoMatriculaProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    // Abordagem isolada e limpa: abre uma janela de impressão dedicada
    // garantindo exatamente 1 folha de papel A4 sem repetições de páginas ocultas do fundo
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Declaração Oficial de Matrícula - ${declaracao.alunoNome}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 16mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Times New Roman", Times, serif;
              color: #0f172a;
              background: #fff;
              line-height: 1.6;
              font-size: 13px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .document {
              max-width: 740px;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              text-align: center;
            }
            .header .inst-top {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              color: #1e293b;
            }
            .header .inst-sub {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #475569;
              margin-top: 2px;
            }
            .header .escola-nome {
              font-size: 16px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #020617;
              margin-top: 4px;
            }
            .header .escola-end {
              font-size: 9.5px;
              color: #64748b;
              font-family: monospace;
              margin-top: 2px;
            }
            .header .meta {
              font-size: 9.5px;
              color: #64748b;
              margin-top: 2px;
            }
            .title-box {
              text-align: center;
              margin: 8px 0;
            }
            .title-box h1 {
              font-size: 17px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #020617;
              font-family: Georgia, serif;
            }
            .title-box .divider {
              width: 80px;
              height: 2px;
              background: #0f172a;
              margin: 4px auto;
            }
            .title-box p {
              font-size: 10.5px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #475569;
            }
            .auth-bar {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 6px 12px;
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
              font-family: monospace;
              color: #334155;
            }
            .auth-bar strong {
              color: #0f172a;
            }
            .body-text {
              font-family: Georgia, serif;
              text-align: justify;
              font-size: 12.5px;
              line-height: 1.7;
              color: #0f172a;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .body-text p {
              text-indent: 20px;
            }
            .legal-box {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 8px 12px;
              font-size: 11px;
              font-family: -apple-system, sans-serif;
              color: #334155;
              text-indent: 0 !important;
            }
            .date-line {
              text-align: right;
              font-family: Georgia, serif;
              font-size: 11.5px;
              margin-top: 6px;
              color: #1e293b;
            }
            .footer-grid {
              border-top: 1px solid #cbd5e1;
              padding-top: 18px;
              margin-top: 10px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              align-items: center;
              text-align: center;
            }
            .sig-col {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .sig-line {
              width: 240px;
              border-top: 2px solid #0f172a;
              padding-top: 5px;
            }
            .sig-line .name {
              font-weight: bold;
              font-size: 11px;
              text-transform: uppercase;
            }
            .sig-line .sub {
              font-size: 9.5px;
              color: #64748b;
            }
            .stamp-box {
              width: 220px;
              height: 68px;
              border: 2px dashed #94a3b8;
              border-radius: 6px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin: 0 auto;
              background: #f8fafc;
            }
            .stamp-box .tag {
              font-size: 8.5px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #334155;
            }
            .stamp-box .sub {
              font-size: 8px;
              color: #64748b;
              margin-top: 1px;
            }
            .val-footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #64748b;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="document">
            <div class="header">
              <div class="inst-top">Prefeitura Municipal de Santo André</div>
              <div class="inst-sub">Secretaria de Cultura • Rede de Escolas Livres</div>
              <div class="escola-nome">${declaracao.escolaNome || 'Escolas Livres de Santo André'}</div>
              <div class="escola-end">${declaracao.escolaEndereco || 'Santo André - SP'}</div>
              <div class="meta">CNPJ Mantenedora: ${declaracao.cnpjInstituicao || '46.522.942/0001-30'} • Secretaria Escolar Central</div>
            </div>

            <div class="title-box">
              <h1>Declaração de Matrícula e Frequência</h1>
              <div class="divider"></div>
              <p>Ano Letivo de ${declaracao.anoLetivo || 2026} • Registro Escolar Oficial</p>
            </div>

            <div class="auth-bar">
              <div>MATRÍCULA ESCOLAR: <strong>#${declaracao.matriculaId}</strong></div>
              <div>AUTENTICIDADE: <strong>${declaracao.codigoAutenticidade}</strong></div>
            </div>

            <div class="body-text">
              <p>
                Declaramos, para os devidos fins de direito e comprovação a que se fizer necessário ou perante quem de direito, a pedido da parte interessada, que o(a) estudante <strong>${declaracao.alunoNome.toUpperCase()}</strong>, inscrito(a) no Cadastro de Pessoas Físicas (CPF) sob o nº <strong>${formatarCpf(declaracao.alunoCpf)}</strong>, nascido(a) em <strong>${formatarData(declaracao.alunoDataNascimento)}</strong>${declaracao.alunoIdade ? ` (${declaracao.alunoIdade} anos)` : ''}, residente e domiciliado(a) em ${declaracao.alunoEnderecoCompleto}, encontra-se <strong>regularmente matriculado(a) e com frequência ativa</strong> nesta unidade escolar municipal.
              </p>

              <p>
                Certificamos que o(a) referido(a) estudante cursa o programa de <strong>${declaracao.cursoNome}</strong> (Modalidade: ${declaracao.modalidadeEnsino}), integrando a <strong>Turma ${declaracao.turmaCodigo}</strong>, desenvolvendo suas atividades pedagógicas nesta instituição de ensino <strong>desde ${declaracao.mesAnoInicioExtenso}</strong>${declaracao.dataInicioExtenso ? ` (com início das atividades letivas em ${declaracao.dataInicioExtenso})` : ''}, cumprindo carga horária curricular de <strong>${declaracao.cargaHorariaTotal} horas</strong> em regime presencial, com aulas no período <strong>${declaracao.diasHorarioAulas}</strong>.
              </p>

              <p>
                Informamos outrossim que o(a) estudante mantém situação escolar <strong>${declaracao.statusMatricula}</strong>, demonstrando regularidade de frequência com índice de assiduidade apurado de <strong>${declaracao.porcentagemFrequenciaAtual ? declaracao.porcentagemFrequenciaAtual.toFixed(1) : '100.0'}%</strong>, em conformidade com o regimento escolar das Escolas Livres de Santo André, não constando penalidades disciplinares ou impedimentos acadêmicos até a presente data.
              </p>

              ${declaracao.alunoNomeResponsavel ? `
                <div class="legal-box">
                  <strong>REPRESENTAÇÃO LEGAL (ART. 14 LGPD):</strong> Estudante menor de idade, devidamente assistido(a) / representado(a) por seu(sua) responsável legal, <strong>${declaracao.alunoNomeResponsavel}</strong>${declaracao.alunoCpfResponsavel ? `, inscrito(a) no CPF sob o nº ${formatarCpf(declaracao.alunoCpfResponsavel)}` : ''}.
                </div>
              ` : ''}

              <p>
                Por ser a expressão fiel da verdade e dos assentamentos constantes nos arquivos da Secretaria Escolar desta instituição, firmamos e chancelamos a presente declaração.
              </p>
            </div>

            <div class="date-line">
              Santo André - SP, ${declaracao.dataEmissaoFormatada}.
            </div>

            <div class="footer-grid">
              <div class="sig-col">
                <div class="sig-line">
                  <div class="name">${declaracao.responsavelSecretaria}</div>
                  <div class="sub">Secretaria de Cultura • Prefeitura de Santo André</div>
                </div>
              </div>

              <div>
                <div class="stamp-box">
                  <div class="tag">[ Visto e Carimbo Institucional ]</div>
                  <div class="sub">${declaracao.escolaSigla || 'EL'} • CNPJ ${declaracao.cnpjInstituicao || '46.522.942/0001-30'}</div>
                </div>
              </div>
            </div>

            <div class="val-footer">
              <span>Documento emitido eletronicamente pelo Sistema de Gestão de Matrículas das Escolas Livres.</span>
              <span>Código de Validação: <strong>${declaracao.codigoAutenticidade}</strong></span>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-4xl w-full h-[94vh] max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Barra Superior de Ações (Oculta na Impressão) */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center border border-emerald-800/60">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Declaração Oficial de Matrícula e Frequência
              </h2>
              <p className="text-[11px] text-slate-400">
                Padrão Escolar Oficial • Secretaria de Cultura de Santo André
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer ml-1"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Visualização com Scroll Limpo */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-950 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          {/* Folha Oficial A4 (Container Único e Fechado) */}
          <div
            id="area-impressao-declaracao-matricula"
            className="w-full max-w-[760px] bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-200 shrink-0 space-y-6 my-auto print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:rounded-none"
          >
            {/* Topo: Timbre Oficial Municipal */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="inline-flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-900" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
                  Prefeitura Municipal de Santo André
                </span>
              </div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                Secretaria de Cultura • Rede de Escolas Livres
              </h2>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-950 pt-0.5">
                {declaracao.escolaNome}
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">
                {declaracao.escolaEndereco}
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 font-medium pt-0.5">
                <span>CNPJ Mantenedora: {declaracao.cnpjInstituicao}</span>
                <span>•</span>
                <span>Secretaria Escolar Central</span>
              </div>
            </div>

            {/* Título Oficial do Documento */}
            <div className="text-center my-4">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-[0.12em] text-slate-950 font-serif">
                Declaração de Matrícula e Frequência
              </h2>
              <div className="w-24 h-0.5 bg-slate-900 mx-auto mt-1.5 mb-1.5" />
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Ano Letivo de {declaracao.anoLetivo || 2026} • Registro Escolar Oficial
              </p>
            </div>

            {/* Informações de Autenticidade e Registro */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono">
              <div>
                <span className="text-slate-400 font-sans uppercase text-[10px] font-bold tracking-wider">Matrícula Escolar: </span>
                <strong className="text-slate-900 font-bold">#{declaracao.matriculaId}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-sans uppercase text-[10px] font-bold tracking-wider">Autenticidade: </span>
                <strong className="text-slate-900">{declaracao.codigoAutenticidade}</strong>
              </div>
            </div>

            {/* Corpo do Texto da Declaração (Padrão Escolar Formal em Prosa) */}
            <div className="text-justify text-sm leading-[1.8] text-slate-900 space-y-3.5 font-serif">
              <p>
                Declaramos, para os devidos fins de direito e comprovação a que se fizer necessário ou perante quem de direito, a pedido da parte interessada, que o(a) estudante <strong className="font-sans font-bold uppercase">{declaracao.alunoNome}</strong>, inscrito(a) no Cadastro de Pessoas Físicas (CPF) sob o nº <strong className="font-mono font-bold">{formatarCpf(declaracao.alunoCpf)}</strong>, nascido(a) em <strong className="font-sans font-semibold">{formatarData(declaracao.alunoDataNascimento)}</strong>{declaracao.alunoIdade ? ` (${declaracao.alunoIdade} anos)` : ''}, residente e domiciliado(a) em {declaracao.alunoEnderecoCompleto}, encontra-se <strong className="font-semibold underline decoration-1 underline-offset-2">regularmente matriculado(a) e com frequência ativa</strong> nesta unidade escolar municipal.
              </p>

              <p>
                Certificamos que o(a) referido(a) estudante cursa o programa de <strong className="font-sans font-bold">{declaracao.cursoNome}</strong> (Modalidade: {declaracao.modalidadeEnsino}), integrando a <strong className="font-sans font-bold">Turma {declaracao.turmaCodigo}</strong>, desenvolvendo suas atividades pedagógicas nesta instituição de ensino <strong className="font-sans font-bold">desde {declaracao.mesAnoInicioExtenso}</strong>{declaracao.dataInicioExtenso ? ` (com início das atividades letivas em ${declaracao.dataInicioExtenso})` : ''}, cumprindo carga horária curricular de <strong>{declaracao.cargaHorariaTotal} horas</strong> em regime presencial, com aulas no período <strong className="font-sans font-semibold">{declaracao.diasHorarioAulas}</strong>.
              </p>

              <p>
                Informamos outrossim que o(a) estudante mantém situação escolar <strong className="font-sans font-bold uppercase text-emerald-800">{declaracao.statusMatricula}</strong>, demonstrando regularidade de frequência com índice de assiduidade apurado de <strong className="font-mono font-bold">{declaracao.porcentagemFrequenciaAtual ? declaracao.porcentagemFrequenciaAtual.toFixed(1) : '100.0'}%</strong>, em conformidade com o regimento escolar das Escolas Livres de Santo André, não constando penalidades disciplinares ou impedimentos acadêmicos até a presente data.
              </p>

              {declaracao.alunoNomeResponsavel && (
                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-sans text-slate-700">
                  <strong className="text-slate-900 uppercase">Representação Legal (Art. 14 LGPD):</strong> Estudante menor de idade, devidamente assistido(a) / representado(a) por seu(sua) responsável legal, <strong className="text-slate-900">{declaracao.alunoNomeResponsavel}</strong>{declaracao.alunoCpfResponsavel ? `, inscrito(a) no CPF sob o nº ${formatarCpf(declaracao.alunoCpfResponsavel)}` : ''}.
                </div>
              )}

              <p className="pt-1">
                Por ser a expressão fiel da verdade e dos assentamentos constantes nos arquivos da Secretaria Escolar desta instituição, firmamos e chancelamos a presente declaração.
              </p>
            </div>

            {/* Data por Extenso */}
            <div className="text-right text-xs font-serif text-slate-800 pt-2">
              Santo André - SP, {declaracao.dataEmissaoFormatada}.
            </div>

            {/* Rodapé: Assinatura da Secretaria e Carimbo Institucional */}
            <div className="pt-8 border-t border-slate-300 mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center text-xs">
                
                {/* Coluna 1: Assinatura da Secretaria Escolar */}
                <div className="flex flex-col items-center justify-end">
                  <div className="w-60 border-t-2 border-slate-900 pt-1.5">
                    <p className="font-bold text-slate-950 uppercase font-sans text-xs">
                      {declaracao.responsavelSecretaria}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Secretaria de Cultura • Prefeitura de Santo André
                    </p>
                  </div>
                </div>

                {/* Coluna 2: Carimbo Oficial e Visto */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-52 h-18 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-slate-500 p-2 text-center select-none bg-slate-50/50">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
                      [ Visto e Carimbo Institucional ]
                    </span>
                    <span className="text-[8px] text-slate-500 mt-0.5">
                      {declaracao.escolaSigla} • CNPJ {declaracao.cnpjInstituicao}
                    </span>
                  </div>
                </div>

              </div>

              {/* Aviso de Autenticação Digital e Validação */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-500">
                <span>Documento emitido eletronicamente pelo Sistema de Gestão de Matrículas das Escolas Livres.</span>
                <span className="font-mono font-semibold text-slate-700">Código de Validação: {declaracao.codigoAutenticidade}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Regras CSS Específicas para Impressão via Ctrl+P direta */}
      <style jsx global>{`
        @media print {
          html, body {
            height: 100% !important;
            overflow: hidden !important;
            background: white !important;
          }
          body * {
            visibility: hidden !important;
          }
          #area-impressao-declaracao-matricula,
          #area-impressao-declaracao-matricula * {
            visibility: visible !important;
          }
          #area-impressao-declaracao-matricula {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
