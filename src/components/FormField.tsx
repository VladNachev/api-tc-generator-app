import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  helper?: string;
  children: ReactNode;
}

export function FormField({ label, helper, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      {children}
      {helper ? <span className="mt-1.5 block text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

export const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200';
