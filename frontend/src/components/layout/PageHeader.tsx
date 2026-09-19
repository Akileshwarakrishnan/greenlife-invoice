import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#C9DFCF] dark:border-[#2D5A3D]">
      <div>
        {badge && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#FEF9C3] text-[#1E3A27] border border-[#F5C242]/80 shadow-2xs mb-2">
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1E3A27] dark:text-[#F1F7F3]">{title}</h1>
        {subtitle && <p className="text-sm font-semibold text-[#3A6345] dark:text-[#A8CBB1] mt-1">{subtitle}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
};
