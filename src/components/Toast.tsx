'use client';
import { useEffect } from 'react';

export type ToastMessage = { text: string; type: 'error' | 'success' };

export function Toast({
  message,
  onDismiss,
}: {
  message: ToastMessage | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={`toast toast-${message.type}`} role="alert" aria-live="polite">
      {message.text}
    </div>
  );
}
