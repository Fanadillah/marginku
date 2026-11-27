import React from 'react';

interface CurrencyInputProps {
  label?: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  compact?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  hint,
  value,
  onChange,
  placeholder = '0',
  id,
  compact = false,
  disabled = false,
  autoFocus = false,
}) => {
  const formatted = value > 0 ? new Intl.NumberFormat('id-ID').format(Math.round(value)) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    if (!digitsOnly) {
      onChange(0);
      return;
    }
    const parsed = parseInt(digitsOnly, 10);
    onChange(Number.isFinite(parsed) ? parsed : 0);
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
        <span
          className={`pointer-events-none absolute left-3 select-none font-semibold text-zinc-400 dark:text-zinc-500 ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          autoFocus={autoFocus}
          value={formatted}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 text-zinc-950 dark:text-zinc-50 tabular-nums font-semibold placeholder:font-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-lime-400/30 focus:border-zinc-900 dark:focus:border-lime-400 transition-colors disabled:opacity-50 ${
            compact ? 'pl-8 pr-3 py-2 text-sm' : 'pl-9 pr-3.5 py-2.5 text-sm'
          }`}
        />
      </div>
      {hint && (
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
    </div>
  );
};
