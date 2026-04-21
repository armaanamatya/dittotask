'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import type { User } from '@/lib/types';

export default function Home() {
  const { currentUser, allUsers, setCurrentUser, loading } = useUser();
  const router = useRouter();

  const handleSelectUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId) ?? null;
    setCurrentUser(user);
  };

  return (
    <main className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-rose-50 via-pink-50 to-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-5">
        {/* Brand */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500 text-white text-2xl font-bold mb-4 shadow-lg shadow-rose-200">
            D
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ditto Lab</h1>
          <p className="text-slate-500 mt-1 text-sm">Micro-Quest Chemistry Lab</p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            How it works
          </p>
          <div className="space-y-3">
            <Step n={1} text="Get matched with someone. No swiping, no endless browsing." />
            <Step
              n={2}
              text="Complete a low-stakes micro-quest together — a café chat, an art walk, a book swap."
            />
            <Step
              n={3}
              text="Rate the vibes. We use your feedback to decide if a real date is worth it."
            />
          </div>
        </div>

        {/* User selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Demo login
          </p>
          <p className="text-sm text-slate-500 mb-4">Pick a user to explore the app</p>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {allUsers.map((u) => (
                <UserButton
                  key={u.id}
                  user={u}
                  selected={currentUser?.id === u.id}
                  onSelect={handleSelectUser}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => currentUser && router.push('/dashboard')}
            disabled={!currentUser}
            className="mt-5 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {currentUser ? `Enter as ${currentUser.name}` : 'Select a user to continue'}
          </button>
        </div>
      </div>
    </main>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <p className="text-sm text-slate-600 leading-snug">{text}</p>
    </div>
  );
}

function UserButton({
  user,
  selected,
  onSelect,
}: {
  user: User;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(user.id)}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
        selected
          ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-300'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            selected
              ? 'bg-rose-500 text-white'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {user.name[0]}
        </div>
        <div>
          <p className={`font-medium text-sm ${selected ? 'text-rose-700' : 'text-slate-700'}`}>
            {user.name}
          </p>
          <p className="text-xs text-slate-400">
            {user.major} · Age {user.age}
          </p>
        </div>
      </div>
    </button>
  );
}
