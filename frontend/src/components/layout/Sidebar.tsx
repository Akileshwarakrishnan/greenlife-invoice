import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Leaf
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const isTamil = language === 'ta';

  const primaryItems = [
    { label: t('nav.dashboard'), to: '/', icon: LayoutDashboard },
    { label: t('nav.new_order'), to: '/orders/new', icon: PlusCircle, isSpecial: true },
    { label: t('nav.invoices'), to: '/invoices', icon: FileText },
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
          className="fixed inset-0 z-40 bg-[#1E3A27]/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-68 bg-[#EBF3ED] dark:bg-[#152B1D] text-[#1E3A27] dark:text-[#F1F7F3] flex flex-col border-r border-[#C9DFCF] dark:border-[#1F422E] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-[#C9DFCF] dark:border-[#1F422E] bg-white/70 dark:bg-[#112419]/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#284B35] flex items-center justify-center text-white shadow-sm shadow-[#284B35]/20">
              <Leaf className="w-5 h-5 text-[#F5C242]" />
            </div>
            <div>
              <span className="font-black text-sm text-[#1E3A27] dark:text-[#F1F7F3] block leading-tight">
                GreenLife Foods
              </span>
              <span className="text-[11px] font-bold text-[#4B8359] dark:text-[#A8CBB1]">
                {isTamil ? 'இயற்கை அங்காடி' : 'Natural Foods Store'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-[#284B35] hover:bg-[#C9DFCF] rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Main tasks section */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4B8359] dark:text-[#A8CBB1] px-3 mb-2 block">
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
                            ? 'bg-[#284B35] text-white shadow-md shadow-[#284B35]/25 scale-[1.02]'
                            : 'bg-white dark:bg-[#1E3A27] text-[#284B35] dark:text-[#F1F7F3] border-2 border-[#284B35] hover:bg-[#284B35] hover:text-white shadow-xs'
                        }`
                      }
                    >
                      <div className="w-6 h-6 rounded-full bg-[#F5C242] text-[#1E3A27] flex items-center justify-center font-black text-xs flex-shrink-0">
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
                    className={({ isActive }) =>
                      `flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-[#284B35] text-white shadow-sm shadow-[#284B35]/20 font-black'
                          : 'text-[#284B35] dark:text-[#CCE1D2] hover:bg-white/80 dark:hover:bg-[#1E3A27]'
                      }`
                    }
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
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4B8359] dark:text-[#A8CBB1] px-3 mb-2 block">
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
                    className={({ isActive }) =>
                      `flex items-center space-x-3.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-[#284B35] text-white shadow-sm shadow-[#284B35]/20 font-black'
                          : 'text-[#3A6345] dark:text-[#A8CBB1] hover:bg-white/80 dark:hover:bg-[#1E3A27]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer info badge */}
        <div className="p-4 border-t border-[#C9DFCF] dark:border-[#1F422E] bg-white/60 dark:bg-[#112419]/60">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#1E3A27] border border-[#C9DFCF] dark:border-[#2D5A3D] space-y-1 text-center">
            <span className="text-xs font-black text-[#284B35] dark:text-[#F1F7F3] block">
              {isTamil ? 'கிரீன்லைஃப் இயற்கை பில்லிங்' : 'GreenLife Store System'}
            </span>
            <p className="text-[11px] text-[#4B8359] dark:text-[#A8CBB1] font-semibold">
              {isTamil ? 'எளிய கடை கணக்கு' : 'Easy Retail Billing'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
