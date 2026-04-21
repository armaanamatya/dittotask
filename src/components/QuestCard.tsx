import type { MicroQuestTemplate } from '@/lib/types';

export function QuestCard({ template }: { template: MicroQuestTemplate }) {
  return (
    <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800">{template.title}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge>{template.suggestedDurationMinutes} min</Badge>
            <Badge>{template.suggestedContext}</Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-4">{template.description}</p>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Reflection Prompts
        </p>
        <ol className="space-y-2">
          {template.reflectionPrompts.map((prompt, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-rose-400 font-bold text-sm flex-shrink-0 mt-px">
                {i + 1}.
              </span>
              <span className="text-sm text-slate-700 leading-snug">{prompt}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-white border border-rose-200 text-rose-600 px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}
