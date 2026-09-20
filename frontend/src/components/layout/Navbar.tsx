import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Menu,
  Sun,
  Moon,
  Leaf,
  Languages,
  BookOpen,
  ArrowLeft,
  LogOut,
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
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTamil = language === 'ta';
  const isRoot = location.pathname === '/';

  return (
    <header className="h-16 sm:h-18 bg-[#F7F5EF]/95 dark:bg-[#0D1B11]/95 backdrop-blur-md border-b border-[#EEEAE0] dark:border-[#1F3828] sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs transition-colors duration-200 w-full max-w-full">
      {/* Left section: Side dashboard button, Back button, and Brand */}
      <div className="flex items-center space-x-1.5 sm:space-x-3">
        {/* Side Dashboard (Menu) Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[#2D6A4F] dark:text-[#52B788] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
          title={isTamil ? 'பக்கப்பட்டி' : 'Side Dashboard'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Back Button (shown on mobile when not at root '/') */}
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            className="lg:hidden p-2 rounded-xl text-[#2D6A4F] dark:text-[#52B788] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Go Back"
            title={isTamil ? 'பின்னே செல்க' : 'Back'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Brand Icon & Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm bg-[#2D6A4F] text-white flex-shrink-0">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#E2A04A]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base font-black tracking-tight text-[#1C1A15] dark:text-[#F4F7F4] truncate max-w-[130px] sm:max-w-none">
                {t('brand.name')}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs bg-[#C68B3A] text-[#1C1A15] hidden sm:inline-block">
                {isTamil ? 'இயற்கை' : 'ORGANIC'}
              </span>
            </div>
            <p className="text-xs font-medium hidden md:block text-[#4A4740] dark:text-[#A8CBB1]">
              {t('brand.tagline')}
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Toggles (Language & Theme on Mobile; + Create Bill & Profile on Desktop) */}
      <div className="flex items-center space-x-1.5 sm:space-x-3">
        {/* Language Switcher (EN | தமிழ்) */}
        <button
          onClick={toggleLanguage}
          title={isTamil ? 'Switch to English' : 'தமிழுக்கு மாறுக'}
          className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 border rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs bg-white dark:bg-[#15271B] border-[#EEEAE0] dark:border-[#233D2B] text-[#2D6A4F] dark:text-[#F4F7F4] active:scale-95"
        >
          <Languages className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#E2A04A]" />
          <span className="tracking-wide text-[11px] sm:text-xs">
            {language === 'en' ? 'தமிழ்' : 'English'}
          </span>
        </button>

        {/* Dark / Light Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={
            isDark
              ? (isTamil ? 'பகல் முறைக்கு மாறுக' : 'Switch to Light Mode')
              : (isTamil ? 'இரவு முறைக்கு மாறுக' : 'Switch to Dark Mode')
          }
          className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 border rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs bg-white dark:bg-[#15271B] border-[#EEEAE0] dark:border-[#233D2B] text-[#2D6A4F] dark:text-[#F4F7F4] active:scale-95"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#E2A04A]" />
              <span className="hidden md:inline font-black text-[#F4F7F4]">{isTamil ? 'பகல்' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span className="hidden md:inline font-black text-[#1C1A15]">{isTamil ? 'இரவு' : 'Dark'}</span>
            </>
          )}
        </button>

        {/* User Manual Shortcut (Desktop only) */}
        <Link
          to="/manual"
          title={t('nav.manual')}
          className="p-2.5 rounded-2xl text-[#2D6A4F] dark:text-[#A8CBB1] hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden lg:flex items-center"
        >
          <BookOpen className="w-5 h-5" />
        </Link>

        {/* Big Prominent "Create Bill" Button (DESKTOP ONLY: on mobile, MobileBottomNav has it) */}
        <Link
          to="/orders/new"
          className="hidden lg:flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all transform active:scale-95 bg-[#2D6A4F] hover:bg-[#235C42] text-white shadow-md shadow-[#2D6A4F]/25"
        >
          <div className="w-5 h-5 rounded-full bg-[#E2A04A] text-[#1C1A15] flex items-center justify-center font-black text-xs">
            +
          </div>
          <span>{t('nav.new_order')}</span>
        </Link>

        {/* User profile avatar & logout (DESKTOP ONLY: on mobile, Profile is in MobileBottomNav) */}
        <div className="hidden lg:flex items-center pl-1 sm:pl-2 border-l border-[#EEEAE0] dark:border-[#233D2B]">
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
