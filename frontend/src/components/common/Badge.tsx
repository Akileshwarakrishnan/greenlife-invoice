import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const s = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200/80';

  if (['paid', 'delivered', 'success', 'sent', 'active'].includes(s)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['pending', 'confirmed', 'running', 'processing'].includes(s)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (['partially_paid', 'dispatched'].includes(s)) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200/80';
  } else if (['cancelled', 'failed', 'inactive'].includes(s)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
  }

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border tracking-wide shadow-2xs ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80"></span>
      {formatText(status)}
    </span>
  );
};
