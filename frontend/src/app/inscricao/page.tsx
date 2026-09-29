'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { InscricaoPublicaView } from '@/components/InscricaoPublicaView';

function InscricaoContent() {
  const searchParams = useSearchParams();
  const turmaParam = searchParams.get('turma');
  const turmaId = turmaParam ? Number(turmaParam) : undefined;

  const {
    turmas,
    turmaCursoPreSelecionadoId,
    handleSubmeterInscricao,
    abrirModalLgpd,
  } = useApp();

  return (
    <InscricaoPublicaView
      turmas={turmas}
      turmaPreSelecionadaId={turmaId || turmaCursoPreSelecionadoId || undefined}
      onSubmeterInscricao={handleSubmeterInscricao}
      onOpenLgpd={(aba) => abrirModalLgpd(aba)}
    />
  );
}

export default function InscricaoPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Carregando formulário de inscrição...</div>}>
        <InscricaoContent />
      </Suspense>
    </AppLayout>
  );
}
