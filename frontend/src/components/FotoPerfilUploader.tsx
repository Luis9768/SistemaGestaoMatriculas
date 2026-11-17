'use client';

import React, { useRef, useState } from 'react';
import { Camera, Trash2, Link as LinkIcon, Image as ImageIcon, Upload } from 'lucide-react';

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
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mostrarCampoUrl, setMostrarCampoUrl] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);

  const inicial = nomeUsuario?.trim() ? nomeUsuario.trim().charAt(0).toUpperCase() : 'U';

  const processarArquivo = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErroUpload('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    // Limite de 2.5 MB para imagens em base64
    if (file.size > 2.5 * 1024 * 1024) {
      setErroUpload('A imagem deve ter no máximo 2.5 MB.');
      return;
    }

    setErroUpload(null);

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
  };

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processarArquivo(file);
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processarArquivo(file);
    }
  };

  const handleRemoverFoto = () => {
    onChangeFotoUrl('');
    setErroUpload(null);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative space-y-2 p-3 rounded-xl border transition-all duration-150 ${
        isDragging
          ? 'border-dashed border-zinc-400 dark:border-zinc-500 bg-zinc-100/90 dark:bg-zinc-800/80 ring-2 ring-zinc-300 dark:ring-zinc-700'
          : 'border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40'
      }`}
    >
      {/* Overlay minimalista ao arrastar */}
      {isDragging && (
        <div className="absolute inset-0 z-20 rounded-xl bg-zinc-100/95 dark:bg-zinc-900/95 flex flex-col items-center justify-center gap-1.5 pointer-events-none border-2 border-dashed border-zinc-400 dark:border-zinc-500">
          <Upload className="w-5 h-5 text-zinc-600 dark:text-zinc-300 animate-bounce" />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
            Solte a foto aqui
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
            PNG, JPG ou WebP até 2.5 MB
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs block">
          Foto de Perfil
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMostrarCampoUrl((prev) => !prev)}
          className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{mostrarCampoUrl ? 'Ocultar URL' : 'Inserir Link'}</span>
        </button>
      </div>

      <div className="flex items-center gap-3.5">
        {/* Preview Circular da Foto */}
        <div className="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={`Foto de ${nomeUsuario || 'usuário'}`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="font-sans font-bold text-lg text-zinc-700 dark:text-zinc-200 select-none">
              {inicial}
            </span>
          )}
        </div>

        {/* Controles de Ação */}
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={disabled}
            onChange={handleArquivoSelecionado}
            className="hidden"
          />

          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-400" />
            <span>{fotoUrl ? 'Alterar Foto' : 'Carregar Foto'}</span>
          </button>

          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 select-none">
            ou arraste aqui
          </span>

          {fotoUrl && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemoverFoto}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer disabled:opacity-50 ml-auto"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remover</span>
            </button>
          )}
        </div>
      </div>

      {/* Campo Opcional para Inserir URL Direta */}
      {mostrarCampoUrl && (
        <div className="pt-1.5 animate-in fade-in duration-150">
          <div className="relative">
            <input
              type="url"
              disabled={disabled}
              placeholder="https://exemplo.com/foto.jpg"
              value={fotoUrl}
              onChange={(e) => onChangeFotoUrl(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            />
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
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
