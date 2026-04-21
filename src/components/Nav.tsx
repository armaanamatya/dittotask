'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export function Nav() {
  const { currentUser, allUsers, setCurrentUser, loading } = useUser();
  const pathname = usePathname();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = allUsers.find((u) => u.id === e.target.value) ?? null;
    setCurrentUser(user);
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        pathname === href
          ? 'text-rose-500 font-semibold'
          : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-14">
      <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-rose-500 font-bold text-base tracking-tight flex items-center gap-2"
        >
          <span className="w-6 h-6 bg-rose-500 text-white text-xs font-bold rounded flex items-center justify-center">
            D
          </span>
          Ditto Lab
        </Link>

        <div className="flex items-center gap-5">
          {currentUser && (
            <>
              {navLink('/dashboard', 'Dashboard')}
              {navLink('/insights', 'Insights')}
            </>
          )}

          {!loading && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 hidden sm:block">|</span>
              <select
                value={currentUser?.id ?? ''}
                onChange={handleUserChange}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-200 cursor-pointer max-w-36"
              >
                <option value="" disabled>
                  Select user
                </option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
