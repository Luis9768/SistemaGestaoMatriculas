'use client';

import React from 'react';
import {
  Building2,
  GraduationCap,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Escola, Curso, Turma } from '@/lib/api';

interface EscolasCampusViewProps {
  escolas: Escola[];
  cursos: Curso[];
  turmas: Turma[];
  onFiltrarEscola: (escolaId: number | null) => void;
  onVerCursosEscola: (escolaId: number) => void;
}

export function EscolasCampusView({
  escolas,
  cursos,
  turmas,
  onFiltrarEscola,
  onVerCursosEscola,
}: EscolasCampusViewProps) {
  const getDetalhesEscola = (sigla: string) => {
    switch (sigla) {
      case 'ELT':
        return {
          nomeCompleto: 'Escola Livre de Teatro',
          subtitulo: 'Teatro Conchita de Moraes • Formação de Atores e Pesquisa da Cena',
          descricao:
            'Polo histórico de experimentação dramatúrgica e processos colaborativos do Grande ABC. Forma profissionais em atuação, iluminação, dramaturgia e encenação.',
          bgCard: 'from-[#2E1065]/90 via-[#1E1B4B] to-[#09090b]',
          accentBorder: 'border-violet-500/50 hover:border-violet-400',
          accentBadge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
          accentButton: 'bg-violet-600 hover:bg-violet-500 text-white',
          tag: 'Arte Cênica & Dramaturgia',
          iconeBg: 'bg-violet-500/20 text-violet-300',
        };
      case 'ELD':
        return {
          nomeCompleto: 'Escola Livre de Dança',
          subtitulo: 'Movimento, Corpo e Dança Contemporânea Pública',
          descricao:
            'Espaço público pioneiro dedicado à formação em dança contemporânea, consciência corporal, processos coreográficos e circulação artística municipal.',
          bgCard: 'from-[#4C0519]/90 via-[#2A0815] to-[#09090b]',
          accentBorder: 'border-rose-500/50 hover:border-rose-400',
          accentBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          accentButton: 'bg-rose-600 hover:bg-rose-500 text-white',
          tag: 'Dança & Expressão Corporal',
          iconeBg: 'bg-rose-500/20 text-rose-300',
        };
      case 'ELCV':
        return {
          nomeCompleto: 'Escola Livre de Cinema e Vídeo',
          subtitulo: 'Audiovisual Público, Direção, Roteiro e Cineclube',
          descricao:
            'A primeira escola pública municipal de cinema do país. Oferece cursos de formação em direção, roteiro, operação de câmera, montagem e exibição crítica.',
          bgCard: 'from-[#082F49]/90 via-[#0C1B2A] to-[#09090b]',
          accentBorder: 'border-cyan-500/50 hover:border-cyan-400',
          accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          accentButton: 'bg-cyan-600 hover:bg-cyan-500 text-white',
          tag: 'Cinema & Audiovisual',
          iconeBg: 'bg-cyan-500/20 text-cyan-300',
        };
      case 'ELIA':
      case 'EMIA':
        return {
          nomeCompleto: 'Escola Municipal de Iniciação Artística',
          subtitulo: 'Infância, Juventude, Artes Visuais e Música Integrada',
          descricao:
            'Focada na sensibilização estética desde a infância até a juventude através de ateliês de artes visuais, música, jogos dramáticos e experimentação multidisciplinar.',
          bgCard: 'from-[#451A03]/90 via-[#261206] to-[#09090b]',
          accentBorder: 'border-amber-500/50 hover:border-amber-400',
          accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          accentButton: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold',
          tag: 'Artes Integradas & Infância',
          iconeBg: 'bg-amber-500/20 text-amber-300',
        };
      default:
        return {
          nomeCompleto: 'Escola Livre de Cultura',
          subtitulo: 'Rede Pública Municipal de Santo André',
          descricao: 'Formação cultural gratuita e de excelência.',
          bgCard: 'from-zinc-900 via-zinc-800 to-black',
          accentBorder: 'border-zinc-700',
          accentBadge: 'bg-zinc-700 text-zinc-300',
          accentButton: 'bg-blue-600 text-white',
          tag: 'Cultura Geral',
          iconeBg: 'bg-zinc-700 text-zinc-300',
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Cultural */}
      <div className="bg-gradient-to-r from-[#121214] via-[#18181b] to-[#121214] rounded-3xl p-8 text-white border border-[#27272a] shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Municipal das Artes</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              As 4 Escolas Livres de Cultura
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              O patrimônio formativo público de Santo André. Conheça as quatro instituições de formação artística gratuita, seus cursos, corpo pedagógico e ofertas ativas.
            </p>
          </div>

          <button
            onClick={() => onFiltrarEscola(null)}
            className="px-5 py-3 bg-white text-slate-950 font-black text-xs rounded-2xl hover:bg-slate-100 transition shadow-md self-start sm:self-auto cursor-pointer"
          >
            Ver Todas as Escolas Integradas
          </button>
        </div>
      </div>

      {/* Grid Imersivo das 4 Escolas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {escolas.map((esc) => {
          const info = getDetalhesEscola(esc.sigla);
          const cursosDaEscola = cursos.filter((c) => c.escolaId === esc.id);
          const turmasDaEscola = turmas.filter((t) => t.escolaSigla === esc.sigla);
          const turmasAbertas = turmasDaEscola.filter((t) => t.matriculaAberta);

          return (
            <div
              key={esc.id}
              className={`bg-gradient-to-br ${info.bgCard} text-white rounded-3xl p-8 border ${info.accentBorder} shadow-lg transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group`}
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-black tracking-tight text-white">{esc.sigla}</span>
                    <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${info.accentBadge}`}>
                      {info.tag}
                    </span>
                  </div>

                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${info.iconeBg}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">{esc.nome}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{info.subtitulo}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{info.descricao}</p>

                {/* Métricas da Unidade */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Cursos</div>
                    <div className="text-lg font-black text-white mt-0.5">{cursosDaEscola.length}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Turmas Totais</div>
                    <div className="text-lg font-black text-white mt-0.5">{turmasDaEscola.length}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Abertas Agora</div>
                    <div className="text-lg font-black text-emerald-300 mt-0.5">{turmasAbertas.length}</div>
                  </div>
                </div>
              </div>

              {/* Ações da Escola */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 relative z-10">
                <button
                  onClick={() => onFiltrarEscola(esc.id)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-md ${info.accentButton}`}
                >
                  <span>Filtrar no {esc.sigla}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onVerCursosEscola(esc.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver Grade Curricular</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
