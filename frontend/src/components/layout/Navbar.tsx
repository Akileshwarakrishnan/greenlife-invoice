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
    <header className="h-18 bg-[#E4EFE7]/95 dark:bg-[#152B1D]/95 backdrop-blur-md border-b border-[#C9DFCF] dark:border-[#1F422E] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2.5 rounded-2xl text-[#284B35] dark:text-[#CCE1D2] hover:bg-white/60 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#284B35] text-white flex items-center justify-center shadow-sm shadow-[#284B35]/20">
            <Leaf className="w-5 h-5 text-[#F5C242]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black text-[#1E3A27] dark:text-[#F1F7F3] tracking-tight">
                {t('brand.name')}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5C242] text-[#1E3A27] shadow-2xs">
                {isTamil ? 'இயற்கை' : 'ORGANIC'}
              </span>
            </div>
            <p className="text-xs text-[#346845] dark:text-[#A8CBB1] font-medium hidden sm:block">
              {t('brand.tagline')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Language Switcher (EN | தமிழ்) - Extra readable pill */}
        <button
          onClick={toggleLanguage}
          title={isTamil ? 'Switch to English' : 'தமிழுக்கு மாறுக'}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#1E3A27] hover:bg-[#F5F9F6] text-[#284B35] dark:text-[#F1F7F3] border border-[#C9DFCF] dark:border-[#2D5A3D] rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <Languages className="w-4 h-4 text-[#284B35] dark:text-[#F5C242]" />
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
          className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-[#1E3A27] hover:bg-[#F5F9F6] dark:hover:bg-[#254832] text-[#284B35] dark:text-[#F1F7F3] border border-[#C9DFCF] dark:border-[#2D5A3D] rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-[#F5C242]" />
              <span className="hidden sm:inline font-black">{isTamil ? 'பகல்' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#284B35]" />
              <span className="hidden sm:inline font-black">{isTamil ? 'இரவு' : 'Dark'}</span>
            </>
          )}
        </button>

        {/* User Manual Shortcut */}
        <Link
          to="/manual"
          title={t('nav.manual')}
          className="p-2.5 text-[#284B35] dark:text-[#CCE1D2] hover:bg-white/60 dark:hover:bg-[#1E3A27] rounded-2xl transition-colors hidden md:flex items-center"
        >
          <BookOpen className="w-5 h-5" />
        </Link>

        {/* Big Prominent "Create Bill" Button for Elder Client */}
        <Link
          to="/orders/new"
          className="flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#284B35] hover:bg-[#1E3A27] text-white rounded-full text-xs sm:text-sm font-black shadow-md shadow-[#284B35]/25 transition-all transform active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-[#F5C242] text-[#1E3A27] flex items-center justify-center font-black text-xs">
            +
          </div>
          <span>{t('nav.new_order')}</span>
        </Link>

        {/* User profile avatar */}
        <div className="flex items-center pl-1 sm:pl-2 border-l border-[#C9DFCF] dark:border-[#2D5A3D]">
          <Link
            to="/profile"
            className="flex items-center space-x-2 p-1 rounded-2xl hover:bg-white/60 dark:hover:bg-[#1E3A27] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-white dark:bg-[#1E3A27] text-[#284B35] dark:text-[#CCE1D2] font-black flex items-center justify-center text-sm border-2 border-[#C9DFCF] dark:border-[#2D5A3D] shadow-2xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-[#284B35] dark:text-[#CCE1D2] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-colors cursor-pointer ml-1"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
