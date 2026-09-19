'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertOctagon } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6 p-4 bg-red-500/10 rounded-full">
        <AlertOctagon className="w-16 h-16 text-red-500" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black mb-4 text-(--foreground) tracking-tight">Oops! Algo salió mal</h1>
      <p className="text-gray-400 max-w-md mb-8">
        Ha ocurrido un error inesperado al procesar tu solicitud. Por favor intenta nuevamente.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Intentar de nuevo
      </button>
    </div>
  );
}
