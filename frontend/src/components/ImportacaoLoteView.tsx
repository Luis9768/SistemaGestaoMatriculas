'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Loader2,
  X,
} from 'lucide-react';
import { ImportacaoResultado, api } from '@/lib/api';

interface ImportacaoLoteViewProps {
  onUploadPlanilha: (file: File) => Promise<ImportacaoResultado>;
}

export function ImportacaoLoteView({ onUploadPlanilha }: ImportacaoLoteViewProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<ImportacaoResultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) return;

    try {
      setImportando(true);
      setErro(null);
      const res = await onUploadPlanilha(arquivo);
      setResultado(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar arquivo.';
      setErro(msg);
    } finally {
      setImportando(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setArquivo(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header com contraste pleno em modo claro e escuro */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Automação de Importação em Lote
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          Substitua digitação manual. Envie planilhas Excel (.xlsx) ou CSV com as colunas padronizadas para alimentar o sistema automaticamente com deduplicação por CPF.
        </p>
      </div>

      {/* Card principal com tema adaptativo */}
      <div className="bg-white dark:bg-[#121110] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#262422] shadow-xs space-y-6">
        {/* Bloco Modelo CSV */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-slate-50 dark:bg-stone-900/60 border border-slate-200/90 dark:border-stone-800/80 rounded-xl gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              Planilha Modelo Padronizada
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Cabeçalhos aceitos: Nome, CPF, Email, Telefone, CodigoTurma, CanalOrigem.
            </p>
          </div>
          <a
            href={api.downloadModeloCsvUrl()}
            download="modelo_matriculas.csv"
            className="px-4 py-2 bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 hover:bg-slate-100 dark:hover:bg-stone-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-2xs whitespace-nowrap cursor-pointer transition active:scale-98"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Baixar Modelo CSV</span>
          </a>
        </div>

        {erro && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{erro}</span>
          </div>
        )}

        {/* Área de Seleção de Arquivo */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-stone-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-stone-900/40'
            }`}
          >
            <FileSpreadsheet className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-3" />
            
            {arquivo ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {arquivo.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setArquivo(null);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200/50 dark:hover:bg-stone-800 transition cursor-pointer"
                  title="Remover arquivo selecionado"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block text-sm font-bold text-slate-800 dark:text-zinc-200 cursor-pointer">
                <span>Clique para selecionar o arquivo (.xlsx, .xls ou .csv)</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            )}

            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
              Formatos aceitos: Microsoft Excel (.xlsx, .xls) ou CSV UTF-8
            </p>
          </div>

          <button
            type="submit"
            disabled={importando || !arquivo}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-stone-800 disabled:text-slate-400 dark:disabled:text-zinc-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed active:scale-98"
          >
            {importando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando e deduplicando registros...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Iniciar Processamento Automático</span>
              </>
            )}
          </button>
        </form>

        {/* Resultado do Processamento */}
        {resultado && (
          <div className="mt-8 border-t border-slate-200 dark:border-stone-800/80 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Resultado do Processamento:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-stone-900/50 p-4 rounded-xl border border-slate-200 dark:border-stone-800">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  Total Linhas
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {resultado.totalLinhas}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                  Sucesso
                </span>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  {resultado.sucesso}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                  Duplicadas
                </span>
                <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">
                  {resultado.ignoradas}
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-800/60">
                <span className="text-[11px] text-rose-800 dark:text-rose-300 font-bold uppercase tracking-wider">
                  Falhas
                </span>
                <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">
                  {resultado.falhas}
                </p>
              </div>
            </div>

            <div className="bg-[#0B0F17] dark:bg-[#070709] border border-slate-800 text-slate-200 p-4 rounded-xl text-xs font-mono max-h-48 overflow-y-auto space-y-1.5">
              {resultado.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('sucesso')
                      ? 'text-emerald-400'
                      : log.includes('Ignorada')
                      ? 'text-amber-400'
                      : log.includes('Falha') || log.includes('Erro')
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
