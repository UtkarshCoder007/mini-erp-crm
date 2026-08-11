import type { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-xl overflow-hidden">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-[#22262F] text-gray-400 text-left">{children}</thead>;
}

export function TRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={`border-t border-[#2A2E38] ${onClick ? 'cursor-pointer hover:bg-[#22262F]/50' : ''}`}
    >
      {children}
    </tr>
  );
}

export function TH({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

export function TD({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-gray-200 ${className}` }>{children}</td>;
}