'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '../lib/auth-client';
import { LogOut, User } from 'lucide-react';

export default function HeaderAuth() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          router.refresh();
        }
      }
    });
  };

  if (isPending) {
    return <span className="text-sm text-slate-500 font-sans">Загрузка...</span>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/report"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition duration-300 font-sans"
        >
          <User className="h-4 w-4 text-[var(--accent-svg-1)]" />
          <span>{session.user.name || 'Личный кабинет'}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition duration-200"
          title="Выйти из аккаунта"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Выйти</span>
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth"
      className="text-sm font-medium text-slate-400 hover:text-white transition duration-300 font-sans"
    >
      Личный кабинет
    </Link>
  );
}
