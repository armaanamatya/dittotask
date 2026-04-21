'use client';

import { useEffect, useState } from 'react';
import { InsightsTable } from '@/components/InsightsTable';
import type { InsightRow } from '@/lib/types';

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insights')
      .then((r) => r.json())
      .then((data) => {
        setInsights(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quest Insights</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Track which micro-quests generate the strongest chemistry — and feed that signal into a
          smarter AI matcher.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <InsightsTable insights={insights} />
      )}

      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-slate-800">How this feeds the AI matcher</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Each row is a training signal. Quests with high average chemistry and comfort scores —
          combined with a high real-date conversion rate — get weighted more heavily when assigning
          future sessions. In v2, we layer in personality overlap from user profiles to predict
          which quest type fits which pair, and surface it automatically at match time.
        </p>
        <div className="flex gap-4 text-xs text-slate-500 pt-1">
          <span>
            <span className="font-semibold text-emerald-600">Green</span> = strong signal
          </span>
          <span>
            <span className="font-semibold text-amber-600">Amber</span> = moderate
          </span>
          <span>
            <span className="font-semibold text-slate-400">—</span> = no data yet
          </span>
        </div>
      </div>
    </div>
  );
}
