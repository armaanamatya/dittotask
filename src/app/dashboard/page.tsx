'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { QuestCard } from '@/components/QuestCard';
import { FeedbackForm } from '@/components/FeedbackForm';
import type { DashboardData, DashboardMatch, MicroQuestFeedback } from '@/lib/types';

export default function DashboardPage() {
  const { currentUser, loading: userLoading } = useUser();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = useCallback(() => {
    if (!currentUser) return;
    fetch(`/api/dashboard?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setDataLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, userLoading, router]);

  useEffect(() => {
    if (currentUser) {
      setDataLoading(true);
      fetchData();
    }
  }, [currentUser, fetchData]);

  if (userLoading || dataLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
        <div className="h-64 bg-white rounded-2xl animate-pulse border border-slate-100" />
        <div className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100" />
      </div>
    );
  }

  if (!data) return null;

  const { user, matches } = data;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {user.major} · Age {user.age}
            </p>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{user.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {user.interests.split(',').map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user.name[0]}
          </div>
        </div>
      </div>

      {/* Matches */}
      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">No matches yet</p>
          <p className="text-slate-300 text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
            Your Micro-Quests
          </p>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              userId={user.id}
              onFeedbackSubmit={fetchData}
            />
          ))}
        </>
      )}
    </div>
  );
}

function MatchCard({
  match,
  userId,
  onFeedbackSubmit,
}: {
  match: DashboardMatch;
  userId: string;
  onFeedbackSubmit: () => void;
}) {
  const { partner, session, status } = match;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Partner header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {partner.name[0]}
          </div>
          <div>
            <p className="text-xs text-slate-400">Your match</p>
            <p className="font-semibold text-slate-800 leading-tight">{partner.name}</p>
            <p className="text-xs text-slate-400">{partner.major}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="p-6 space-y-5">
        {session ? (
          <>
            <QuestCard template={session.template} />

            {session.myFeedback ? (
              <div className="space-y-3">
                <FeedbackSummary feedback={session.myFeedback} />
                {!session.partnerFeedback ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-sm text-amber-700 font-medium">
                      Waiting for {partner.name} to submit their feedback...
                    </p>
                    <p className="text-xs text-amber-500 mt-0.5">
                      You'll both see the outcome once they do.
                    </p>
                  </div>
                ) : (
                  <MatchOutcome status={status} partnerName={partner.name} />
                )}
              </div>
            ) : (
              <FeedbackForm
                sessionId={session.id}
                userId={userId}
                onSubmit={onFeedbackSubmit}
              />
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">
            Quest not yet assigned.
          </p>
        )}
      </div>
    </div>
  );
}

function FeedbackSummary({ feedback }: { feedback: MicroQuestFeedback }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
      <p className="text-sm font-semibold text-emerald-700">Your feedback submitted</p>
      <div className="flex gap-4 mt-1.5 text-xs text-emerald-600">
        <span>Chemistry {feedback.chemistry}/5</span>
        <span>Comfort {feedback.comfort}/5</span>
        <span className="capitalize">Real date: {feedback.wouldDoRealDate}</span>
      </div>
      {feedback.comment && (
        <p className="text-xs text-emerald-600 mt-1.5 italic">"{feedback.comment}"</p>
      )}
    </div>
  );
}

function MatchOutcome({ status, partnerName }: { status: string; partnerName: string }) {
  if (status === 'real-date-recommended') {
    return (
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl p-5 text-white text-center">
        <p className="text-2xl mb-1">&#10024;</p>
        <p className="font-bold text-lg">Real date recommended!</p>
        <p className="text-sm text-rose-100 mt-1">
          Both you and {partnerName} are feeling it. Time to plan something real.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
      <p className="font-semibold text-slate-700">Quest complete</p>
      <p className="text-sm text-slate-500 mt-1">
        Not quite the right match this time — but your feedback helps us find you a better one.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    'pending-quest': { label: 'Quest Active', className: 'bg-amber-100 text-amber-700' },
    'quest-completed': { label: 'Quest Done', className: 'bg-slate-100 text-slate-600' },
    'real-date-recommended': {
      label: 'Date Recommended',
      className: 'bg-emerald-100 text-emerald-700',
    },
  };
  const { label, className } = map[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
}
