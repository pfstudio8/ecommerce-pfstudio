import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 p-4 bg-yellow-400/10 rounded-full">
        <AlertCircle className="w-16 h-16 text-yellow-400" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black mb-4 text-(--foreground) tracking-tight">Página no encontrada</h1>
      <p className="text-gray-400 max-w-md mb-8">
        La página que estás buscando no existe, ha sido movida o está temporalmente inaccesible.
      </p>
      <Link 
        href="/"
        className="px-8 py-3 bg-main text-white font-bold rounded-lg hover:bg-main/90 transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] flex items-center gap-2"
      >
        <Home className="w-5 h-5" />
        Volver al inicio
      </Link>
    </div>
  );
}
