import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { auditApi } from '../services/api';
import { PageHeader } from '../components/layout/PageHeader';
import {
  User,
  Shield,
  Clock,
  History,
  Mail,
  Calendar,
  CheckCircle,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    try {
      setLoadingLogs(true);
      const res = await auditApi.list({ limit: 15 });
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={t('nav.profile', 'User Account & Security Audit')}
        subtitle="Manage personal access credentials, role-based capabilities, and review immutable activity logs."
        badge="Session Identity"
      />

      {/* User Profile Card */}
      <div className="bg-white dark:bg-[#082216] p-6 sm:p-7 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-emerald-600/20 flex-shrink-0">
          {user?.full_name?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-50">{user?.full_name}</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-slate-500 dark:text-emerald-300/70 mt-1">
                <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{user?.email}</span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 self-center sm:self-auto capitalize">
              {user?.role} Privileges
            </span>
          </div>

          <div className="pt-4 border-t border-emerald-100 dark:border-emerald-900/40 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-emerald-300/70">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Auth Schema: JWT Bearer Token</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Account Created:{' '}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Security & Operational Audit Log</h3>
              <p className="text-xs text-slate-500">Immutable chronological record of administrative actions</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            {auditLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Timestamp (IST)</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loadingLogs ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No security audit records logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{log.user_email || 'System Daemon'}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-[10px] text-slate-700 border border-slate-200/60">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium">{log.entity}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-sm truncate">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
