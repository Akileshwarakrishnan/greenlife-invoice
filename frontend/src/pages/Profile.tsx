import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ShieldCheck,
  LogOut
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isTamil = language === 'ta';
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
    <div className="space-y-6 max-w-5xl mx-auto" style={{ background: 'transparent' }}>
      <PageHeader
        title={t('nav.profile', 'User Account & Security Audit')}
        subtitle="Manage personal access credentials, role-based capabilities, and review immutable activity logs."
        badge="Session Identity"
      />

      {/* User Profile Card */}
      <div className="p-6 sm:p-7 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0" style={{ background: '#2D6A4F', color: 'white' }}>
          {user?.full_name?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h2 className="text-xl font-bold" style={{ color: '#1C1A15' }}>{user?.full_name}</h2>
                <span className="w-2 h-2 rounded-full" style={{ background: '#2D6A4F' }}></span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs mt-1" style={{ color: '#8C8880' }}>
                <Mail className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
                <span>{user?.email}</span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold border self-center sm:self-auto capitalize" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
              {user?.role} Privileges
            </span>
          </div>

          <div className="pt-4 border-t flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs" style={{ borderColor: '#EEEAE0', color: '#8C8880' }}>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" style={{ color: '#2D6A4F' }} />
              <span>Auth Schema: JWT Bearer Token</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4" style={{ color: '#8C8880' }} />
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

      {/* Session Management & Quick Logout */}
      <div
        className="p-5 sm:p-6 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: 'white', borderColor: '#EEEAE0' }}
      >
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-3 rounded-2xl flex-shrink-0" style={{ background: '#FEF2F2', color: '#DC2626' }}>
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>
              {isTamil ? 'அமர்வு மேலாண்மை (Session Identity)' : 'Active Session & Security'}
            </h3>
            <p className="text-xs" style={{ color: '#8C8880' }}>
              {isTamil ? 'பயன்பாட்டில் இருந்து பாதுகாப்பாக வெளியேறவும்' : 'Sign out from this device to protect confidential store accounts'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm(isTamil ? 'நிச்சயமாக வெளியேற விரும்புகிறீர்களா?' : 'Are you sure you want to sign out?')) {
              logout();
              navigate('/login');
            }
          }}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          style={{ background: '#DC2626', color: 'white' }}
        >
          <LogOut className="w-4 h-4" />
          <span>{isTamil ? 'கணக்கிலிருந்து வெளியேறு (Sign Out)' : 'Sign Out of Store'}</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#EEEAE0' }}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl" style={{ background: '#F7F5EF', color: '#4A4740' }}>
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>Security & Operational Audit Log</h3>
              <p className="text-xs" style={{ color: '#8C8880' }}>Immutable chronological record of administrative actions</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
            {auditLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="font-semibold uppercase tracking-wider text-[11px] border-b" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
              <tr>
                <th className="px-5 py-3.5">Timestamp (IST)</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#EEEAE0', color: '#4A4740' }}>
              {loadingLogs ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center" style={{ color: '#8C8880' }}>
                    Loading security audit trail...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center" style={{ color: '#8C8880' }}>
                    No security audit records logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F5EF'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'} style={{ background: 'white' }}>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px]" style={{ color: '#8C8880' }}>
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#1C1A15' }}>{log.user_email || 'System Daemon'}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#4A4740' }}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#8C8880' }}>{log.entity}</td>
                    <td className="px-5 py-3.5 max-w-sm truncate">{log.details}</td>
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
