import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-[#22262F] border border-[#2A2E38] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...inputProps } = props;
  return <input className={`${inputClass} ${className ?? ''}`} {...inputProps} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...textareaProps } = props;
  return <textarea className={`${inputClass} ${className ?? ''}`} {...textareaProps} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...selectProps } = props;
  return <select className={`${inputClass} ${className ?? ''}`} {...selectProps} />;
}