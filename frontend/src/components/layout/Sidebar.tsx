import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  ScanText,
  Settings,
  PlusCircle,
  X,
  BookOpen,
  Leaf,
  LogOut,
  Truck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isTamil = language === 'ta';

  const primaryItems = [
    { label: t('nav.dashboard'), to: '/', icon: LayoutDashboard },
    { label: t('nav.new_order'), to: '/orders/new', icon: PlusCircle, isSpecial: true },
    { label: t('nav.invoices'), to: '/invoices', icon: FileText },
    { label: isTamil ? 'கொள்முதல்' : 'Purchases', to: '/purchases', icon: Truck },
    { label: t('nav.customers'), to: '/customers', icon: Users },
    { label: t('nav.products'), to: '/products', icon: Package },
  ];

  const secondaryItems = [
    { label: t('nav.reports'), to: '/reports', icon: BarChart3 },
    { label: t('nav.ai_extract'), to: '/ai-extraction', icon: ScanText },
    { label: t('nav.manual'), to: '/manual', icon: BookOpen },
    { label: t('nav.settings'), to: '/settings', icon: Settings, adminOnly: true },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 backdrop-blur-xs lg:hidden"
          style={{ background: 'rgba(27, 58, 42, 0.6)' }}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col border-r transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#13281C', color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: '#2D6A4F', color: 'white' }}>
              <Leaf className="w-5 h-5" style={{ color: '#C68B3A' }} />
            </div>
            <div>
              <span className="font-black text-sm block leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
                GreenLife Foods
              </span>
              <span className="text-[11px] font-bold" style={{ color: '#B7D9C4' }}>
                {isTamil ? 'இயற்கை அங்காடி' : 'Natural Foods Store'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Main tasks section */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 mb-2 block" style={{ color: 'rgba(255,255,255,0.40)' }}>
              {isTamil ? 'முக்கிய வேலைகள்' : 'MAIN ACTIONS'}
            </span>
            <div className="space-y-1.5">
              {primaryItems.map((item) => {
                const Icon = item.icon;
                if (item.isSpecial) {
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-black transition-all ${
                          isActive
                            ? 'scale-[1.02]'
                            : 'shadow-xs hover:opacity-90'
                        }`
                      }
                      style={({ isActive }) => ({
                        background: isActive ? '#C68B3A' : '#C68B3A',
                        color: isActive ? '#1C1A15' : '#1C1A15',
                        border: 'none',
                        fontWeight: 'bold'
                      })}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0" style={{ background: 'rgba(0,0,0,0.1)', color: 'inherit' }}>
                        +
                      </div>
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className="flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all"
                    style={({ isActive }) => ({
                      background: isActive ? '#2D6A4F' : 'transparent',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.70)'
                    })}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* More options section */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 mb-2 block" style={{ color: 'rgba(255,255,255,0.40)' }}>
              {isTamil ? 'கூடுதல் விவரங்கள்' : 'MORE OPTIONS'}
            </span>
            <div className="space-y-1">
              {secondaryItems.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className="flex items-center space-x-3.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all"
                    style={({ isActive }) => ({
                      background: isActive ? '#2D6A4F' : 'transparent',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.70)'
                    })}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer info badge & Logout button */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          <button
            onClick={() => {
              onClose();
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center space-x-2.5 px-4 py-3 rounded-2xl text-xs font-black transition-all active:scale-95 cursor-pointer"
            style={{
              background: 'rgba(239, 68, 68, 0.18)',
              color: '#FCA5A5',
              border: '1px solid rgba(239, 68, 68, 0.35)',
            }}
          >
            <LogOut className="w-4 h-4 text-[#FCA5A5]" />
            <span>{isTamil ? 'வெளியேறு (Logout)' : 'Sign Out / Logout'}</span>
          </button>

          <div className="p-3 rounded-2xl space-y-1 text-center" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <span className="text-xs font-black block" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {isTamil ? 'கிரீன்லைஃப் இயற்கை பில்லிங்' : 'GreenLife Store System'}
            </span>
            <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {isTamil ? 'எளிய கடை கணக்கு' : 'Easy Retail Billing'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
