import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Lock, Mail, ArrowRight, Languages } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const isTamil = language === 'ta';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          (isTamil
            ? 'உள்நுழைவு தோல்வியடைந்தது. உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லைச் சரிபார்க்கவும்.'
            : 'Failed to sign in. Please verify your email and password.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#071F15] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-green-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Language Switcher Top Corner */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-200 rounded-xl text-xs font-bold border border-white/15 backdrop-blur-md transition-all cursor-pointer"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-8 bg-gradient-to-b from-[#0F3524] to-[#0A261A] text-white text-center relative">
          <div className="inline-flex p-3 bg-emerald-600 rounded-2xl mb-3 shadow-md shadow-emerald-950/60">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">{t('brand.name')}</h2>
          <p className="text-xs text-emerald-200/80 mt-1 font-medium">
            {t('brand.portal')}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@greenlife.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-emerald-200/80 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isTamil ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-emerald-200/80 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium">{isTamil ? 'என்னை நினைவில் கொள்' : 'Remember me'}</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert(isTamil ? 'கடவுச்சொல் மீட்டமைக்க admin@greenlife.com ஐத் தொடர்பு கொள்ளவும்.' : 'Contact system administrator at admin@greenlife.com for password reset.');
                }}
                className="text-emerald-700 hover:text-emerald-800 font-bold"
              >
                {isTamil ? 'கடவுச்சொல் மறந்ததா?' : 'Forgot password?'}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs tracking-wide shadow-md shadow-emerald-200 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? (isTamil ? 'சரிபார்க்கிறது...' : 'Authenticating...') : (isTamil ? 'உள்நுழைக' : 'Sign In to Dashboard')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              {isTamil ? 'ஒரு-கிளிக் சோதனை அணுகல்' : 'One-Click Demo Access'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@greenlife.com', 'admin123')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
              >
                👑 {isTamil ? 'நிர்வாகி (Admin)' : 'Admin Demo'}
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('staff@greenlife.com', 'staff123')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
              >
                👤 {isTamil ? 'பணியாளர் (Staff)' : 'Staff Demo'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            {isTamil ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
            <Link to="/signup" className="text-emerald-700 hover:underline font-bold">
              {isTamil ? 'புதிய கணக்கு பதிவு' : 'Create an account'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
