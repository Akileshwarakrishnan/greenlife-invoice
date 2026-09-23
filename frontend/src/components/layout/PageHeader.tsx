import type { ReactNode } from "react";
export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
}) => (
  <div className="page-heading">
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div className="page-heading-actions">{actions}</div>}
  </div>
);
