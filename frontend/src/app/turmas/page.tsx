'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { TurmasOfertasView } from '@/components/TurmasOfertasView';

function TurmasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get('busca') || '';
  const turmaIdParam = searchParams.get('turmaId') ? Number(searchParams.get('turmaId')) : null;

  const {
    turmas,
    cursos,
    escolas,
    escolaSelecionada,
    abrirModalNovaTurma,
    carregarDadosEscola,
  } = useApp();

  return (
    <TurmasOfertasView
      turmas={turmas}
      cursos={cursos}
      escolas={escolas}
      escolaSelecionada={escolaSelecionada}
      termoBuscaInicial={buscaParam}
      destacarTurmaId={turmaIdParam}
      onAbrirModalTurma={() => abrirModalNovaTurma()}
      onMatricularNaTurma={(turmaId) => {
        router.push(`/inscricao?turma=${turmaId}`);
      }}
      onTurmasAtualizadas={carregarDadosEscola}
    />
  );
}

export default function TurmasPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Carregando turmas e vagas disponíveis...
          </div>
        }
      >
        <TurmasContent />
      </Suspense>
    </AppLayout>
  );
}
