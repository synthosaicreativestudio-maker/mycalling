'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center z-10 relative">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-6">
        <AlertCircle className="h-10 w-10" />
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/5 opacity-75"></span>
      </div>
      
      <h1 className="font-serif text-3xl md:text-4xl text-[#E8ECF0] mb-4">
        Что-то пошло не так
      </h1>
      
      <p className="max-w-md text-sm md:text-base text-gray-400 mb-8 leading-relaxed">
        Произошла непредвиденная ошибка при загрузлочном рендеринге страницы.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition font-medium border border-white/10 shadow-lg shadow-black/20"
        >
          <RotateCcw className="h-4 w-4" />
          Попробовать снова
        </button>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white transition font-medium shadow-lg shadow-[#3B82F6]/20"
        >
          <Home className="h-4 w-4" />
          На главную
        </Link>
      </div>
    </div>
  );
}
