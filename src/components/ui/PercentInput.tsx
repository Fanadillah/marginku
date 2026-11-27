import React, { useEffect, useState } from 'react';

interface PercentInputProps {
  label?: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  compact?: boolean;
  max?: number;
}

export const PercentInput: React.FC<PercentInputProps> = ({
  label,
  hint,
  value,
  onChange,
  placeholder = '0',
  id,
  compact = false,
  max = 99.9,
}) => {
  const [text, setText] = useState<string>(value === 0 ? '' : String(value).replace('.', ','));

  useEffect(() => {
    const normalized = text.replace(',', '.');
    const numeric = parseFloat(normalized);
    if (value === 0 && (text === '' || text === '0')) return;
    if (!Number.isNaN(numeric) && numeric === value) return;
    setText(value === 0 ? '' : String(value).replace('.', ','));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.,]/g, '');
    // Allow only one decimal separator
    const parts = raw.split(/[.,]/);
    const cleaned =
      parts.length > 1 ? `${parts[0]},${parts.slice(1).join('').slice(0, 2)}` : parts[0];

    setText(cleaned);

    if (!cleaned) {
      onChange(0);
      return;
    }
    const parsed = parseFloat(cleaned.replace(',', '.'));
    if (Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(0, parsed)));
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 text-zinc-950 dark:text-zinc-50 tabular-nums font-semibold placeholder:font-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-lime-400/30 focus:border-zinc-900 dark:focus:border-lime-400 transition-colors ${
            compact ? 'pl-3 pr-7 py-2 text-sm' : 'pl-3.5 pr-8 py-2.5 text-sm'
          }`}
        />
        <span
          className={`pointer-events-none absolute right-3 select-none font-semibold text-zinc-400 dark:text-zinc-500 ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          %
        </span>
      </div>
      {hint && (
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
    </div>
  );
};
