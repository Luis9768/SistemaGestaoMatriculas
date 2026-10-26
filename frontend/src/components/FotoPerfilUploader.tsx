'use client';

import React, { useRef, useState } from 'react';
import { Camera, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface FotoPerfilUploaderProps {
  fotoUrl: string;
  onChangeFotoUrl: (url: string) => void;
  nomeUsuario: string;
  disabled?: boolean;
}

export function FotoPerfilUploader({
  fotoUrl,
  onChangeFotoUrl,
  nomeUsuario,
  disabled = false,
}: FotoPerfilUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mostrarCampoUrl, setMostrarCampoUrl] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);

  const inicial = nomeUsuario?.trim() ? nomeUsuario.trim().charAt(0).toUpperCase() : 'U';

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErroUpload(null);

    // Limite de 2.5 MB para imagens em base64
    if (file.size > 2.5 * 1024 * 1024) {
      setErroUpload('A imagem deve ter no máximo 2.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChangeFotoUrl(dataUrl);
      }
    };
    reader.onerror = () => {
      setErroUpload('Erro ao processar imagem selecionada.');
    };
    reader.readAsDataURL(file);

    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleRemoverFoto = () => {
    onChangeFotoUrl('');
    setErroUpload(null);
  };

  return (
    <div className="space-y-2 p-3.5 rounded-2xl border border-slate-200/90 dark:border-[#27272a] bg-slate-50/60 dark:bg-[#09090b]/60">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
          Foto de Perfil
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMostrarCampoUrl((prev) => !prev)}
          className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{mostrarCampoUrl ? 'Ocultar URL' : 'Inserir Link de Imagem'}</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Preview Circular da Foto */}
        <div className="w-16 h-16 rounded-full border border-slate-200 dark:border-zinc-700/80 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={`Foto de ${nomeUsuario || 'usuário'}`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="font-sans font-bold text-xl text-slate-700 dark:text-zinc-200 select-none">
              {inicial}
            </span>
          )}
        </div>

        {/* Controles de Ação */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={disabled}
            onChange={handleArquivoSelecionado}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#18181b] hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span>{fotoUrl ? 'Alterar Foto' : 'Carregar Foto'}</span>
            </button>

            {fotoUrl && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleRemoverFoto}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remover</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            JPG, PNG ou WEBP. Sem foto, será exibida a inicial do nome.
          </p>
        </div>
      </div>

      {/* Campo Opcional para Inserir URL Direta */}
      {mostrarCampoUrl && (
        <div className="pt-2 animate-in fade-in duration-150">
          <div className="relative">
            <input
              type="url"
              disabled={disabled}
              placeholder="https://exemplo.com/minha-foto.jpg"
              value={fotoUrl}
              onChange={(e) => onChangeFotoUrl(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#18181b] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            />
            <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      )}

      {erroUpload && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
          {erroUpload}
        </p>
      )}
    </div>
  );
}
