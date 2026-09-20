import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Menu,
  Sparkles,
  PlusCircle,
  LogOut,
  Sun,
  Moon,
  Leaf,
  Languages,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAiAssistant }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTamil = language === 'ta';

  return (
    <header className="h-18 bg-[#F7F5EF]/95 dark:bg-[#0D1B11]/95 backdrop-blur-md border-b border-[#EEEAE0] dark:border-[#1F3828] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2.5 rounded-2xl text-[#2D6A4F] dark:text-[#52B788] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-[#2D6A4F] text-white">
            <Leaf className="w-5 h-5 text-[#E2A04A]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-tight text-[#1C1A15] dark:text-[#F4F7F4]">
                {t('brand.name')}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs bg-[#C68B3A] text-[#1C1A15]">
                {isTamil ? 'இயற்கை' : 'ORGANIC'}
              </span>
            </div>
            <p className="text-xs font-medium hidden sm:block text-[#4A4740] dark:text-[#A8CBB1]">
              {t('brand.tagline')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Language Switcher (EN | தமிழ்) */}
        <button
          onClick={toggleLanguage}
          title={isTamil ? 'Switch to English' : 'தமிழுக்கு மாறுக'}
          className="flex items-center space-x-1.5 px-3.5 py-2 border rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs bg-white dark:bg-[#15271B] border-[#EEEAE0] dark:border-[#233D2B] text-[#2D6A4F] dark:text-[#F4F7F4]"
        >
          <Languages className="w-4 h-4 text-[#2D6A4F] dark:text-[#E2A04A]" />
          <span className="tracking-wide">
            {language === 'en' ? 'தமிழ்' : 'English'}
          </span>
        </button>

        {/* Dark / Light Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={
            isDark
              ? (isTamil ? 'பகல் முறைக்கு மாறுக (Switch to Light Mode)' : 'Switch to Light Mode')
              : (isTamil ? 'இரவு முறைக்கு மாறுக (Switch to Dark Mode)' : 'Switch to Dark Mode')
          }
          className="flex items-center space-x-1.5 px-3 py-2 border rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs bg-white dark:bg-[#15271B] border-[#EEEAE0] dark:border-[#233D2B] text-[#2D6A4F] dark:text-[#F4F7F4]"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-[#E2A04A]" />
              <span className="hidden sm:inline font-black text-[#F4F7F4]">{isTamil ? 'பகல்' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#2D6A4F]" />
              <span className="hidden sm:inline font-black text-[#1C1A15]">{isTamil ? 'இரவு' : 'Dark'}</span>
            </>
          )}
        </button>

        {/* User Manual Shortcut */}
        <Link
          to="/manual"
          title={t('nav.manual')}
          className="p-2.5 rounded-2xl text-[#2D6A4F] dark:text-[#A8CBB1] hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden md:flex items-center"
        >
          <BookOpen className="w-5 h-5" />
        </Link>

        {/* Big Prominent "Create Bill" Button */}
        <Link
          to="/orders/new"
          className="flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all transform active:scale-95 bg-[#2D6A4F] hover:bg-[#235C42] text-white shadow-md shadow-[#2D6A4F]/25"
        >
          <div className="w-5 h-5 rounded-full bg-[#E2A04A] text-[#1C1A15] flex items-center justify-center font-black text-xs">
            +
          </div>
          <span>{t('nav.new_order')}</span>
        </Link>

        {/* User profile avatar */}
        <div className="flex items-center pl-1 sm:pl-2 border-l border-[#EEEAE0] dark:border-[#233D2B]">
          <Link
            to="/profile"
            className="flex items-center space-x-2 p-1 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full font-black flex items-center justify-center text-sm border-2 shadow-2xs bg-[#EBF5EE] dark:bg-[#1A3523] border-[#B7D9C4] dark:border-[#2E523A] text-[#2D6A4F] dark:text-[#52B788]">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-[#2D6A4F] dark:text-[#A8CBB1] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-colors cursor-pointer ml-1"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
