import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'indigo' | 'emerald' | 'amber' | 'violet' | 'sky';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
}) => {
  const variantStyles = {
    indigo: {
      iconBg: 'bg-[#EBF3ED] text-[#284B35]',
    },
    emerald: {
      iconBg: 'bg-[#EBF3ED] text-[#284B35]',
    },
    amber: {
      iconBg: 'bg-[#FEF9C3] text-[#B45309]',
    },
    violet: {
      iconBg: 'bg-[#E5EFE7] text-[#1E3A27]',
    },
    sky: {
      iconBg: 'bg-[#EBF3ED] text-[#284B35]',
    },
  };

  const style = variantStyles[variant] || variantStyles.emerald;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#152B1D] border border-[#C9DFCF]/80 dark:border-[#2D5A3D] shadow-sm hover:shadow-md transition-all flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#4B8359] dark:text-[#A8CBB1]">{title}</p>
        <h3 className="text-3xl sm:text-4xl font-black text-[#1E3A27] dark:text-[#F1F7F3] tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs font-medium text-[#6B9F78] dark:text-[#CCE1D2]">{subtitle}</p>}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${style.iconBg}`}>
        <Icon className="w-7 h-7" />
      </div>
    </div>
  );
};
