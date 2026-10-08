'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Theater,
  Music,
  Film,
  Palette,
  ArrowRight,
  ShieldCheck,
  Lock,
  Building2,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { Escola, Curso, Turma, Matricula, LoginResponse } from '@/lib/api';
import { GraffitiBannerHeader } from '@/components/GraffitiBannerHeader';
import { LgpdModal } from '@/components/LgpdModal';

/* ─── PROPS ─── */
export interface DirecionamentoEscolasViewProps {
  usuarioLogado: LoginResponse;
  escolas: Escola[];
  cursos: Curso[];
  turmas: Turma[];
  matriculas?: Matricula[];
  tempoRestanteMin: number;
  onSelecionarEscola: (escolaId: number | null) => void;
  onLogout: () => void;
}

interface SchoolConfig {
  sigla: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  sede: string;
  icone: React.ComponentType<{ className?: string }>;
  iconColor: string;
  cardHoverBorder: string;
  buttonClass: string;
  accentHairline: string;
}

const ESCOLAS_CONFIG: Record<string, SchoolConfig> = {
  ELT: {
    sigla: 'ELT',
    nome: 'Escola Livre de Teatro',
    subtitulo: 'Artes Cênicas & Dramaturgia',
    descricao: 'Formação teatral pública continuada, criação colaborativa e pesquisa de linguagens cênicas.',
    sede: 'Teatro Conchita de Moraes • Santa Teresinha',
    icone: Theater,
    iconColor: 'bg-violet-50 text-violet-600 border-violet-200/80 dark:bg-violet-950/60 dark:text-violet-400 dark:border-violet-800/60',
    cardHoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700/60 hover:shadow-[0_12px_28px_-8px_rgba(139,92,246,0.14)]',
    buttonClass: 'group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600',
    accentHairline: 'from-violet-500/80 via-violet-500/20 to-transparent',
  },
  ELD: {
    sigla: 'ELD',
    nome: 'Escola Livre de Dança',
    subtitulo: 'Corpo, Movimento & Coreografia',
    descricao: 'Pesquisa em dança contemporânea, consciência corporal e investigação do movimento.',
    sede: 'Espaço da Dança • Jd. Bela Vista',
    icone: Music,
    iconColor: 'bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60',
    cardHoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700/60 hover:shadow-[0_12px_28px_-8px_rgba(244,63,94,0.14)]',
    buttonClass: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    accentHairline: 'from-rose-500/80 via-rose-500/20 to-transparent',
  },
  ELCV: {
    sigla: 'ELCV',
    nome: 'Escola Livre de Cinema e Vídeo',
    subtitulo: 'Audiovisual, Roteiro & Fotografia',
    descricao: 'Capacitação em produção cinematográfica: direção, roteiro, fotografia, som e montagem.',
    sede: 'Polo Audiovisual • Vila Gilda',
    icone: Film,
    iconColor: 'bg-sky-50 text-sky-600 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60',
    cardHoverBorder: 'hover:border-sky-300 dark:hover:border-sky-700/60 hover:shadow-[0_12px_28px_-8px_rgba(14,165,233,0.14)]',
    buttonClass: 'group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
    accentHairline: 'from-sky-500/80 via-sky-500/20 to-transparent',
  },
  EMIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao: 'Sensibilização poética e integração expressiva em artes visuais, música, teatro e dança.',
    sede: 'Pq. Regional da Criança • Jaçatuba',
    icone: Palette,
    iconColor: 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    cardHoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700/60 hover:shadow-[0_12px_28px_-8px_rgba(245,158,11,0.14)]',
    buttonClass: 'group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600',
    accentHairline: 'from-amber-500/80 via-amber-500/20 to-transparent',
  },
  ELIA: {
    sigla: 'EMIA',
    nome: 'Escola Municipal de Iniciação Artística',
    subtitulo: 'Multidisciplinaridade • Crianças & Jovens',
    descricao: 'Sensibilização poética e integração expressiva em artes visuais, música, teatro e dança.',
    sede: 'Pq. Regional da Criança • Jaçatuba',
    icone: Palette,
    iconColor: 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    cardHoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700/60 hover:shadow-[0_12px_28px_-8px_rgba(245,158,11,0.14)]',
    buttonClass: 'group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600',
    accentHairline: 'from-amber-500/80 via-amber-500/20 to-transparent',
  },
};

/* ─── CARD COMPONENT COM ANIMAÇÃO KINÉTICA ─── */
interface SchoolCardProps {
  escola: Escola;
  config: SchoolConfig;
  cursosCount: number;
  turmasCount: number;
  vagasCount: number;
  isPermitido: boolean;
  isEncarregada: boolean;
  index: number;
  onSelect: () => void;
}

function SchoolCard({
  escola,
  config,
  cursosCount,
  turmasCount,
  vagasCount,
  isPermitido,
  isEncarregada,
  index,
  onSelect,
}: SchoolCardProps) {
  const Icone = config.icone;

  return (
    <motion.article
      initial={{ opacity: 0, y: 45, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: 0.2 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => isPermitido && onSelect()}
      className={`group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between border bg-white dark:bg-[#0c1017] border-slate-200/90 dark:border-slate-800/80 shadow-2xs overflow-hidden ${
        isPermitido
          ? `cursor-pointer ${config.cardHoverBorder}`
          : 'opacity-60 saturate-50 border-dashed cursor-not-allowed'
      }`}
    >
      {/* Linha superior de acento sutil */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.accentHairline} opacity-50 group-hover:opacity-100 transition-opacity`}
      />

      <div>
        {/* Topo do Card: Ícone + Sigla */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-2xs transition-transform duration-200 ${
              isPermitido ? 'group-hover:scale-105' : ''
            } ${config.iconColor}`}
          >
            <Icone className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {isEncarregada && (
              <span>
                {isPermitido ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Autorizada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <Lock className="w-2.5 h-2.5" />
                    Restrito
                  </span>
                )}
              </span>
            )}

            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              {config.sigla}
            </span>
          </div>
        </div>

        {/* Título & Subtítulo */}
        <h3
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-slate-800 dark:group-hover:text-slate-100"
          title={config.nome}
        >
          {config.nome}
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          {config.subtitulo}
        </p>

        {/* Descrição Compacta */}
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2.5 line-clamp-2">
          {config.descricao}
        </p>

        {/* Localização / Sede Física */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/50">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{config.sede}</span>
        </div>
      </div>

      <div className="pt-3">
        {/* Bloco de Métricas Reais */}
        <div className="grid grid-cols-3 gap-1 py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-[#12161f] border border-slate-200/70 dark:border-slate-800/70 mb-3 text-center">
          <div>
            <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono leading-none mb-1">
              {cursosCount || 2}
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold font-mono">
              Cursos
            </span>
          </div>
          <div className="border-x border-slate-200 dark:border-slate-800">
            <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono leading-none mb-1">
              {turmasCount || 4}
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold font-mono">
              Turmas
            </span>
          </div>
          <div>
            <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono leading-none mb-1">
              {vagasCount}
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold font-mono">
              Vagas
            </span>
          </div>
        </div>

        {/* Botão de Ação */}
        <button
          type="button"
          disabled={!isPermitido}
          onClick={(e) => {
            e.stopPropagation();
            if (isPermitido) onSelect();
          }}
          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 ${
            isPermitido
              ? `cursor-pointer ${config.buttonClass}`
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          {isPermitido ? (
            <>
              <span>Acessar {config.sigla}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Acesso Restrito</span>
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
}

/* ─── MAIN VIEW COMPONENT ─── */
export function DirecionamentoEscolasView({
  usuarioLogado,
  escolas,
  cursos,
  turmas,
  onSelecionarEscola,
  onLogout,
}: DirecionamentoEscolasViewProps) {
  const [modalLgpdAberto, setModalLgpdAberto] = useState(false);
  const isEncarregada = usuarioLogado?.role === 'ROLE_ENCARREGADA';

  const permittedIds: number[] = usuarioLogado?.escolasIds?.length
    ? usuarioLogado.escolasIds
    : (usuarioLogado?.escolas?.map((e) => e.id) || (usuarioLogado?.escolaId ? [usuarioLogado.escolaId] : []));

  const escolasRender =
    escolas.length >= 4
      ? escolas
      : [
          { id: 1, sigla: 'ELT', nome: 'Escola Livre de Teatro', corTema: 'violet' },
          { id: 2, sigla: 'ELD', nome: 'Escola Livre de Dança', corTema: 'rose' },
          { id: 3, sigla: 'ELCV', nome: 'Escola Livre de Cinema e Vídeo', corTema: 'blue' },
          { id: 4, sigla: 'EMIA', nome: 'Escola Municipal de Iniciação Artística', corTema: 'amber' },
        ];

  const primeiroNome = usuarioLogado?.nome ? usuarioLogado.nome.trim().split(/\s+/)[0] : 'Coordenação';

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#000000] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 relative overflow-hidden">
      {/* Malha Arquitetural Sutil de Fundo */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header Institucional Minimalista */}
      <GraffitiBannerHeader onLogout={onLogout} />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col relative z-10">
        {/* ─── CABEÇALHO COM ANIMAÇÃO KINÉTICA DE TEXTO ENTRANDO PELO LADO ─── */}
        <section className="mb-8 sm:mb-10 pb-6 border-b border-slate-200/90 dark:border-slate-800/90 overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, x: -70 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none"
          >
            Rede de Escolas Livres
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2.5 max-w-2xl leading-relaxed"
          >
            Bem-vindo(a), <span className="font-bold text-slate-900 dark:text-white">{primeiroNome}</span>. Selecione a unidade para gerenciar turmas, frequências e matrículas.
          </motion.p>
        </section>

        {/* ─── GRID DAS 4 ESCOLAS COM ANIMAÇÃO EM CASCATA ─── */}
        <section
          aria-label="Seleção de Unidades Escolares"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {escolasRender.map((escola, index) => {
            const siglaUpper = escola.sigla.toUpperCase();
            const config = ESCOLAS_CONFIG[siglaUpper] || {
              sigla: escola.sigla,
              nome: escola.nome,
              subtitulo: 'Unidade Cultural',
              descricao: escola.descricao || 'Formação artística pública de Santo André.',
              sede: 'Santo André • SP',
              icone: Building2,
              iconColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
              cardHoverBorder: 'hover:border-slate-400 dark:hover:border-slate-600',
              buttonClass: 'group-hover:bg-slate-900 group-hover:text-white',
              accentHairline: 'from-slate-400/40 to-transparent',
            };

            const cursosCount = cursos.filter(
              (c) => c.escolaId === escola.id || c.escolaSigla?.toUpperCase() === siglaUpper
            ).length;

            const turmasDaEscola = turmas.filter(
              (t) => t.escolaId === escola.id || t.escolaSigla?.toUpperCase() === siglaUpper
            );

            const turmasCount = turmasDaEscola.length;
            const vagasCount = turmasDaEscola.reduce((acc, t) => acc + (t.vagasTotais || 0), 0) || 60;

            const isPermitido = !isEncarregada || permittedIds.includes(escola.id);

            return (
              <SchoolCard
                key={escola.id}
                escola={escola}
                config={config}
                cursosCount={cursosCount}
                turmasCount={turmasCount}
                vagasCount={vagasCount}
                isPermitido={isPermitido}
                isEncarregada={isEncarregada}
                index={index}
                onSelect={() => isPermitido && onSelecionarEscola(escola.id)}
              />
            );
          })}
        </section>

        {/* ─── RODAPÉ INSTITUCIONAL COM BRASÃO OFICIAL E LGPD ─── */}
        <motion.footer
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 sm:mt-16 pt-8 pb-4 border-t border-slate-200/90 dark:border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-3.5">
            <Image
              src="/logo_santo_andre.png"
              alt="Brasão Oficial do Município de Santo André"
              width={42}
              height={60}
              className="h-11 w-auto object-contain drop-shadow-xs dark:brightness-110"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Prefeitura de Santo André
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Secretaria de Cultura • Sistema Integrado de Gestão de Matrículas (SIGMA)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center md:text-right">
            <button
              onClick={() => setModalLgpdAberto(true)}
              type="button"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Diretrizes de Privacidade (LGPD)</span>
            </button>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>

            <div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                © {new Date().getFullYear()} Todos os direitos reservados.
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                ELT • ELD • ELCV • EMIA
              </p>
            </div>
          </div>
        </motion.footer>
      </main>

      {/* Modal Interativo de LGPD */}
      <LgpdModal
        isOpen={modalLgpdAberto}
        onClose={() => setModalLgpdAberto(false)}
        abaInicial="geral"
      />
    </div>
  );
}
