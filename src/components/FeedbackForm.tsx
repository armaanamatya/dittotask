'use client';

import { useState } from 'react';

type RealDateChoice = 'yes' | 'maybe' | 'no';

interface Props {
  sessionId: string;
  userId: string;
  onSubmit: () => void;
}

export function FeedbackForm({ sessionId, userId, onSubmit }: Props) {
  const [chemistry, setChemistry] = useState(0);
  const [comfort, setComfort] = useState(0);
  const [wouldDoRealDate, setWouldDoRealDate] = useState<RealDateChoice | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = chemistry > 0 && comfort > 0 && wouldDoRealDate !== null;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          chemistry,
          comfort,
          wouldDoRealDate,
          comment: comment || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        return;
      }

      onSubmit();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-5 space-y-5">
      <h3 className="font-semibold text-slate-800">Rate the vibes</h3>

      <div className="space-y-4">
        <StarRating
          label="Chemistry"
          hint="How naturally did the conversation flow?"
          value={chemistry}
          onChange={setChemistry}
        />
        <StarRating
          label="Comfort"
          hint="How at ease did you feel around them?"
          value={comfort}
          onChange={setComfort}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Would you go on a real date?</p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: 'yes', label: 'Yes!', active: 'bg-emerald-500 border-emerald-500 text-white' },
              { value: 'maybe', label: 'Maybe...', active: 'bg-amber-400 border-amber-400 text-white' },
              { value: 'no', label: 'No', active: 'bg-slate-500 border-slate-500 text-white' },
            ] as const
          ).map(({ value, label, active }) => (
            <button
              key={value}
              onClick={() => setWouldDoRealDate(value)}
              className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                wouldDoRealDate === value
                  ? active
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1.5">
          Any thoughts?{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What stood out? What felt off? Anything you'd want the matcher to know..."
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none h-20 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}

function StarRating({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered || value);
          return (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              className={`text-2xl transition-all hover:scale-110 ${
                filled ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {filled ? '★' : '☆'}
            </button>
          );
        })}
        {value > 0 && (
          <span className="text-sm text-slate-400 self-center ml-1">{value}/5</span>
        )}
      </div>
    </div>
  );
}
