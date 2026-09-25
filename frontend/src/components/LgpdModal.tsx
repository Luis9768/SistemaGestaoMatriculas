'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Users,
  Baby,
  Building2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Printer,
} from 'lucide-react';

interface LgpdModalProps {
  isOpen: boolean;
  onClose: () => void;
  abaInicial?: 'geral' | 'alunos';
}

export function LgpdModal({ isOpen, onClose, abaInicial = 'geral' }: LgpdModalProps) {
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'alunos'>(abaInicial);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">Privacidade e Proteção de Dados (LGPD)</h2>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Lei 13.709/2018
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Prefeitura Municipal de Santo André • Secretaria de Cultura • SIGMA
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Imprimir documento"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Seletor de Abas de Termos */}
        <div className="bg-slate-100/80 px-6 py-2 border-b border-slate-200 flex space-x-3">
          <button
            onClick={() => setAbaAtiva('geral')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              abaAtiva === 'geral'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>1. Termo Geral de Privacidade (Prefeitura & SIGMA)</span>
          </button>

          <button
            onClick={() => setAbaAtiva('alunos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              abaAtiva === 'alunos'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>2. Termo de Dados dos Alunos & Menores (Escolas Livres)</span>
          </button>
        </div>

        {/* Conteúdo do Termo com Rolagem Suave */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-slate-700 text-xs leading-relaxed">
          {abaAtiva === 'geral' ? (
            <div className="space-y-6">
              {/* Badge de Destaque */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-blue-900 text-xs">
                    Controlador Institucional: Prefeitura Municipal de Santo André
                  </h4>
                  <p className="text-blue-800 text-[11px] leading-normal">
                    Este termo regula a coleta e tratamento de dados pessoais no Sistema de Gestão de Matrículas (SIGMA), operado pela Secretaria de Cultura para viabilizar as inscrições nas 4 Escolas Livres de Cultura (ELT, ELD, ELCV e ELIA) com total transparência e segurança jurídica.
                  </p>
                </div>
              </div>

              {/* Seção 1 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                  Bases Legais de Tratamento (Art. 7º da Lei 13.709/2018)
                </h3>
                <p>
                  O tratamento de dados pessoais de munícipes e servidores é respaldado pelas seguintes hipóteses da LGPD:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Art. 7º, Inciso III:</strong> Cumprimento e execução de políticas públicas culturais municipais previstas em leis, regulamentos e planos pedagógicos;</li>
                  <li><strong>Art. 7º, Inciso I:</strong> Consentimento livre, inequívoco e informado fornecido pelo titular no formulário de inscrição;</li>
                  <li><strong>Art. 7º, Inciso II:</strong> Cumprimento de obrigações legais e de prestação de contas junto aos órgãos de fiscalização pública.</li>
                </ul>
              </div>

              {/* Seção 2 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                  Salvaguardas de Segurança da Informação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" /> Autenticação Criptografada
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Tokens JWT com assinatura segura e expiração temporizada para operadores da secretaria e coordenação.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Mascaramento de CPFs
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Visualização protegida em telas e relatórios (ex: <code>123.***.***-09</code>) para impedir vazamento visual durante reuniões.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" /> PostgreSQL 16 Dedicado
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Banco de dados relacional com integridade referencial, isolamento de rede e rotinas diárias de backup.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Bloqueio de Acesso Anônimo
                    </span>
                    <p className="text-[11px] text-slate-500">
                      APIs de alunos, matrículas e dashboards respondem com <code>401 Não autorizado</code> sem credenciais da Secretaria.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção 3 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                  Direitos do Munícipe (Art. 18 da LGPD)
                </h3>
                <p>
                  O titular dos dados tem o direito de solicitar a confirmação do tratamento, acessar seus dados escolares, solicitar a retificação de contatos e obter esclarecimentos mediante requisição formal através do e-mail <code>privacidade.cultura@santoandre.sp.gov.br</code> ou na Ouvidoria Municipal.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Badge de Proteção de Menores */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start space-x-3">
                <Baby className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-900 text-xs">
                    Proteção Especial a Menores de 18 Anos — Art. 14 da LGPD
                  </h4>
                  <p className="text-emerald-800 text-[11px] leading-normal">
                    O cadastro de crianças e adolescentes (especialmente nas oficinas infantis da ELIA e núcleos jovens) é realizado no <strong>melhor interesse do menor</strong> e exige indispensavelmente o consentimento expresso e os dados de pelo menos um dos pais ou responsável legal.
                  </p>
                </div>
              </div>

              {/* Seção 1 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
                  Dados Coletados do Aluno e do Responsável
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Dados do Aluno:</strong> Nome completo, CPF, e-mail, telefone, data de nascimento para checagem da faixa etária permitida na turma, histórico acadêmico e presenças;</li>
                  <li><strong>Dados do Responsável Legal (Obrigatório para menores):</strong> Nome, CPF, grau de parentesco (mãe, pai, avô/avó, tutor legal) e telefone para emergências e acompanhamento pedagógico;</li>
                  <li><strong>Finalidade Exclusiva:</strong> Matrícula, segurança física no prédio das Escolas Livres, diário de presença e expedição de certificados.</li>
                </ul>
              </div>

              {/* Seção 2 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
                  Tratamento de Presenças e Regra de Assiduidade
                </h3>
                <p>
                  As Escolas Livres de Cultura mantêm cursos gratuitos custeados pelo Município. A assiduidade é acompanhada para fins pedagógicos:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px]">
                  <p className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded font-semibold text-[10px] bg-amber-100 text-amber-900 border border-amber-200 shrink-0">Alerta</span>
                    <span><strong>2 Faltas Consecutivas:</strong> O sistema notifica a secretaria para realizar acolhimento e buscar o motivo da ausência antes de qualquer desistência;</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded font-semibold text-[10px] bg-rose-100 text-rose-900 border border-rose-200 shrink-0">Cancelamento</span>
                    <span><strong>3 Faltas Consecutivas:</strong> Ocorrendo a 3ª falta consecutiva sem justificativa, a vaga é liberada automaticamente para convocação do próximo munícipe na fila de espera.</span>
                  </p>
                </div>
              </div>

              {/* Seção 3 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">3</span>
                  Autorização para Uso de Imagem Pedagógica e Mostras Artísticas
                </h3>
                <p>
                  Em cursos artísticos (Teatro, Dança, Cinema e Artes Visuais), podem ocorrer registros fotográficos e gravações em vídeo de ensaios e apresentações.
                </p>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <p>
                    • A autorização de imagem é <strong>opcional</strong> e restrita a fins de avaliação pedagógica, mostras públicas e divulgação cultural nos canais oficiais da Prefeitura de Santo André;
                  </p>
                  <p>
                    • É <strong>estritamente proibida</strong> qualquer exploração comercial ou veiculação descontextualizada de imagens de alunos ou crianças (ECA - Lei 8.069/1990).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Documentação oficial em conformidade com a ANPD e o Município de Santo André</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
          >
            Entendido e Ciente
          </button>
        </div>
      </div>
    </div>
  );
}
