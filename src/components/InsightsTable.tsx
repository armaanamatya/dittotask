import type { InsightRow } from '@/lib/types';

export function InsightsTable({ insights }: { insights: InsightRow[] }) {
  if (insights.length === 0) {
    return (
      <p className="text-slate-400 text-center py-12">No quest data yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-left">
            <th className="px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide w-2/5">
              Quest
            </th>
            <th className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide text-center">
              Sessions
            </th>
            <th className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide text-center">
              Completed
            </th>
            <th className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide text-center">
              Avg Chemistry
            </th>
            <th className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide text-center">
              Avg Comfort
            </th>
            <th className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide text-center">
              Both → Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {insights.map((row) => (
            <tr key={row.templateId} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-4">
                <p className="font-medium text-slate-800">{row.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{row.suggestedContext}</p>
              </td>
              <td className="px-4 py-4 text-center text-slate-600">{row.totalSessions}</td>
              <td className="px-4 py-4 text-center text-slate-600">{row.completedSessions}</td>
              <td className="px-4 py-4 text-center">
                <Score value={row.avgChemistry} max={5} />
              </td>
              <td className="px-4 py-4 text-center">
                <Score value={row.avgComfort} max={5} />
              </td>
              <td className="px-4 py-4 text-center">
                <Percent value={row.bothPositivePercent} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Score({ value, max }: { value: number | null; max: number }) {
  if (value === null) return <span className="text-slate-300 font-medium">—</span>;
  const color =
    value >= 4 ? 'text-emerald-600' : value >= 3 ? 'text-amber-600' : 'text-slate-500';
  return (
    <span className={`font-semibold ${color}`}>
      {value}
      <span className="text-slate-300 font-normal">/{max}</span>
    </span>
  );
}

function Percent({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-300 font-medium">—</span>;
  const color =
    value >= 75 ? 'text-emerald-600' : value >= 50 ? 'text-amber-600' : 'text-slate-500';
  return <span className={`font-semibold ${color}`}>{value}%</span>;
}
