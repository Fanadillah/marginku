import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: number;
  text: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const Icon =
    toast.type === 'error'
      ? AlertCircle
      : toast.type === 'info'
        ? Info
        : CheckCircle2;

  const iconColor =
    toast.type === 'error'
      ? 'text-rose-400'
      : toast.type === 'info'
        ? 'text-sky-400'
        : 'text-emerald-400';

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xl border border-zinc-800 dark:border-zinc-200 text-xs font-semibold">
        <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
        <span className="leading-snug">{toast.text}</span>
      </div>
    </div>
  );
};
