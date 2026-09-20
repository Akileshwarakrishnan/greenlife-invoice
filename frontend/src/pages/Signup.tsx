import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Lock, Mail, User, ArrowRight, Globe } from 'lucide-react';

export const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup({ full_name: fullName, email, password, role });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#1B3A2A' }}>
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(45,106,79,0.2)' }}></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(27,58,42,0.4)' }}></div>

      {/* Language Switcher Top-Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs"
          style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(45,106,79,0.3)', color: '#B7D9C4' }}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden relative z-10" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <div className="p-8 text-center border-b" style={{ background: '#1B3A2A', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="inline-flex p-3 rounded-2xl mb-3 shadow-md" style={{ background: '#2D6A4F' }}>
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: 'white' }}>{t('brand.name', 'GreenLife Natural Foods')}</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {t('brand.tagline', 'Pure, Traditional & Unadulterated Wellness')}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 border text-xs font-semibold rounded-xl" style={{ background: '#FDF3E3', borderColor: '#C68B3A', color: '#C68B3A' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#4A4740' }}>
                {t('cust.name', 'Full Name')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: '#8C8880' }} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Kavitha Shanmugam"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#4A4740' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: '#8C8880' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@greenlife.com"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#4A4740' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: '#8C8880' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#4A4740' }}>
                Role Assignment
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              >
                <option value="staff">{t('role.staff', 'Staff Access')}</option>
                <option value="admin">{t('role.admin', 'Admin Access')}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 font-bold rounded-xl text-xs tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              style={{ background: '#2D6A4F', color: 'white' }}
            >
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs" style={{ color: '#8C8880' }}>
            Already have an account?{' '}
            <Link to="/login" className="hover:underline font-bold" style={{ color: '#2D6A4F' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
