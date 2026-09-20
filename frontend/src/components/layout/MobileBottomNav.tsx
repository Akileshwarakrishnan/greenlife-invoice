import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Package, Plus, FileText, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav: React.FC = () => {
  const { language } = useLanguage();
  const isTamil = language === 'ta';
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: isTamil ? 'முகப்பு' : 'Home',
      icon: Home,
      exact: true,
    },
    {
      to: '/products',
      label: isTamil ? 'பொருட்கள்' : 'Store',
      icon: Package,
    },
    {
      to: '/orders/new',
      label: isTamil ? 'பில்' : 'New Bill',
      icon: Plus,
      isSpecial: true,
    },
    {
      to: '/invoices',
      label: isTamil ? 'ரசீது' : 'Bills',
      icon: FileText,
    },
    {
      to: '/profile',
      label: isTamil ? 'சுயவிபரம்' : 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-3 pb-safe pt-2 transition-all"
      aria-label="Mobile Bottom Navigation"
    >
      <div
        className="max-w-md mx-auto mb-2 px-3 py-2 rounded-3xl flex items-center justify-around shadow-2xl border backdrop-blur-2xl"
        style={{
          background: 'rgba(15, 30, 21, 0.88)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          if (item.isSpecial) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #4E8765 0%, #2D6A4F 100%)',
                    boxShadow: '0 8px 20px rgba(45, 106, 79, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Icon className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
                <span
                  className="text-[10px] font-extrabold tracking-wide mt-1 text-[#A3C9A8]"
                >
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all"
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/15 text-[#A3C9A8] shadow-inner'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                  isActive
                    ? 'font-black text-[#A3C9A8]'
                    : 'font-semibold text-white/50'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
