'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { AlunosPesquisaView } from '@/components/AlunosPesquisaView';

export default function AlunosPage() {
  const router = useRouter();
  const {
    paginaAlunos,
    paginaAtualAlunos,
    buscaAlunoTermo,
    loadingAlunos,
    escolaAtualObj,
    escolaSelecionada,
    setBuscaAlunoTermo,
    setPaginaAtualAlunos,
    carregarAlunosPaginados,
    abrirModalPerfil,
    setEscolaSelecionada,
  } = useApp();

  useEffect(() => {
    carregarAlunosPaginados(paginaAtualAlunos);
  }, [escolaSelecionada]);

  return (
    <AppLayout>
      <AlunosPesquisaView
        paginaAlunos={paginaAlunos}
        paginaAtualAlunos={paginaAtualAlunos}
        buscaAlunoTermo={buscaAlunoTermo}
        loadingAlunos={loadingAlunos}
        escolaAtualObj={escolaAtualObj}
        onBuscarAlunos={(termo) => {
          setBuscaAlunoTermo(termo);
          setPaginaAtualAlunos(0);
          carregarAlunosPaginados(0, termo);
        }}
        onMudarPagina={(pag) => setPaginaAtualAlunos(pag)}
        onCadastrarNovoAluno={() => router.push('/inscricao')}
        onOpenPerfilAluno={(id) => abrirModalPerfil(id)}
        onVerTodasEscolas={() => setEscolaSelecionada(null)}
      />
    </AppLayout>
  );
}
