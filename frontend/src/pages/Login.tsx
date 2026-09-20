/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* redesign: Login.tsx · genre: editorial · theme: Garden
 * macrostructure: Split-screen Workbench
 * all colors/fonts inlined to bypass global body overrides in index.css
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Lock, Mail, ArrowRight, Languages, ShieldCheck, Sparkles, Clock } from 'lucide-react';

// Garden theme — hardcoded to bypass index.css body overrides
const G = {
  paper:        '#F7F5EF',
  paper2:       '#EEEAE0',
  ink:          '#1C1A15',
  ink2:         '#4A4740',
  inkMuted:     '#8C8880',
  accent:       '#2D6A4F',
  accentHover:  '#235C42',
  accentLight:  '#EBF5EE',
  accentBorder: '#B7D9C4',
  panel:        '#1B3A2A',
  amber:        '#C68B3A',
  errorBg:      '#FEF3F2',
  errorBorder:  '#FECDCA',
  errorText:    '#B42318',
  fontDisplay:  "'Georgia', 'Times New Roman', serif",
  fontBody:     "'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif",
};

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
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
    <>
      {/* ── MOBILE PHONE VIEW (< lg): Leafora Botanical Glassmorphism App ── */}
      <div
        className="lg:hidden min-h-screen relative flex flex-col justify-between p-5 overflow-hidden text-white"
        style={{
          background: 'radial-gradient(circle at 50% 15%, #183827 0%, #0D2015 45%, #061009 100%)',
          fontFamily: G.fontBody,
        }}
      >
        {/* Soft atmospheric ambient light rings */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#4E8765]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#2D6A4F]/25 blur-3xl pointer-events-none" />

        {/* Top bar with Language Toggle */}
        <div className="flex items-center justify-between z-10 pt-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Leaf className="w-4 h-4 text-[#A3C9A8]" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-white/80">GreenLife</span>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white/90 active:scale-95 transition-all"
          >
            <Languages className="w-3.5 h-3.5 text-[#A3C9A8]" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
        </div>

        {/* Center Floating Glass Card (Screen 1 from Leafora reference) */}
        <div className="my-auto z-10 py-6">
          <div
            className="w-full max-w-sm mx-auto rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.07)',
              borderColor: 'rgba(255, 255, 255, 0.16)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
            }}
          >
            {/* Botanical Emblem & Title */}
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 border"
                style={{
                  background: 'linear-gradient(135deg, rgba(78, 135, 101, 0.4) 0%, rgba(45, 106, 79, 0.2) 100%)',
                  borderColor: 'rgba(163, 201, 168, 0.3)',
                  boxShadow: '0 8px 24px rgba(45, 106, 79, 0.35)',
                }}
              >
                <Leaf className="w-8 h-8 text-[#A3C9A8]" />
              </div>

              <h1
                className="text-3xl font-normal tracking-tight text-white mb-1.5"
                style={{ fontFamily: G.fontDisplay }}
              >
                GreenLife
              </h1>
              <p className="text-xs font-medium tracking-wide text-[#A3C9A8]">
                {isTamil ? 'இயற்கை அங்காடி' : 'Bring Nature Home'}
              </p>
              <p className="text-[11px] text-white/60 mt-1 max-w-xs mx-auto">
                {isTamil ? 'தூய மரச்செக்கு எண்ணெய் & இயற்கை உணவுப் பொருட்கள்' : 'Pure organic cold-pressed oils & traditional foods.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-white/70 mb-1.5">
                  {isTamil ? 'மின்னஞ்சல்' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@greenlife.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-bold text-white placeholder-white/40 border transition-all focus:outline-none focus:border-[#A3C9A8]"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-white/70 mb-1.5">
                  {isTamil ? 'கடவுச்சொல்' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-bold text-white placeholder-white/40 border transition-all focus:outline-none focus:border-[#A3C9A8]"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                    }}
                  />
                </div>
              </div>

              {/* Big Pill Button from Screen 1 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 rounded-full font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #A3C9A8 0%, #4E8765 100%)',
                  color: '#0D2015',
                  boxShadow: '0 8px 24px rgba(78, 135, 101, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                }}
              >
                <span>
                  {loading
                    ? (isTamil ? 'உள்நுழைகிறது...' : 'Signing in...')
                    : (isTamil ? 'உள்நுழைக →' : 'Get Started →')}
                </span>
              </button>
            </form>

            {/* Quick Demo Fill Chips */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <span className="block text-[10px] font-bold text-center uppercase tracking-wider text-white/50 mb-2.5">
                {isTamil ? 'விரைவு அணுகல்' : '1-Tap Quick Access'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@greenlife.com', 'admin123')}
                  className="py-2 px-3 rounded-xl text-[11px] font-bold text-[#A3C9A8] border transition-all active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(163, 201, 168, 0.3)',
                  }}
                >
                  👑 {isTamil ? 'நிர்வாகி' : 'Admin Demo'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('staff@greenlife.com', 'staff123')}
                  className="py-2 px-3 rounded-xl text-[11px] font-bold text-white/80 border transition-all active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  👤 {isTamil ? 'பணியாளர்' : 'Staff Demo'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom indicator dots (Screen 1 footer) */}
        <div className="flex items-center justify-center space-x-1.5 pb-2 z-10">
          <div className="w-6 h-1.5 rounded-full bg-[#A3C9A8]" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>

      {/* ── DESKTOP & LAPTOP VIEW (lg:flex): 100% UNTOUCHED ORIGINAL SPLIT SCREEN ── */}
      <div style={{
        minHeight: '100vh',
        background: G.paper,
        fontFamily: G.fontBody,
        overflowX: 'hidden',
      }} className="hidden lg:flex w-full">

        {/* ── Left Brand Panel (desktop only) ── */}
        <div style={{
          background: G.panel,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }} className="lg:flex lg:flex-col lg:w-[44%] xl:w-[40%]">

          {/* Pure-CSS organic rings */}
          {[
            { b:'-12%', r:'-22%', w:'78%' },
            { b:'-6%',  r:'-13%', w:'60%' },
            { b:'2%',   r:'-5%',  w:'44%' },
            { t:'-18%', l:'-18%', w:'58%' },
          ].map((ring, i) => (
            <div key={i} style={{
              position:'absolute',
              bottom: ring.b, right: ring.r,
              top: ring.t,    left: ring.l,
              width: ring.w,  paddingBottom: ring.w,
              borderRadius:'50%',
              border:`1px solid rgba(255,255,255,${0.04 + i * 0.01})`,
              pointerEvents:'none',
            }} />
          ))}

          {/* Language toggle */}
          <div style={{ position:'absolute', top:24, left:24, zIndex:20 }}>
            <button
              onClick={toggleLanguage}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 12px',
                background:'rgba(255,255,255,0.08)',
                border:'1px solid rgba(255,255,255,0.14)',
                borderRadius:8,
                color:'rgba(255,255,255,0.75)',
                fontFamily: G.fontBody,
                fontSize:12, fontWeight:600, cursor:'pointer',
              }}
            >
              <Languages size={13} />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>

          {/* Botanical brand block */}
          <div style={{
            position:'relative', zIndex:10,
            padding:'80px 48px 48px',
            flex:1, display:'flex', flexDirection:'column',
            justifyContent:'space-between',
          }}>
            <div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'6px 14px',
                background:'rgba(255,255,255,0.08)',
                border:'1px solid rgba(255,255,255,0.12)',
                borderRadius:999, marginBottom:32,
              }}>
                <Leaf size={14} color={G.amber} />
                <span style={{
                  fontFamily: G.fontBody, fontSize:11, fontWeight:700,
                  letterSpacing:'0.12em', textTransform:'uppercase',
                  color:'rgba(255,255,255,0.85)',
                }}>
                  {isTamil ? 'இயற்கை அங்காடி' : 'Traditional Foods'}
                </span>
              </div>

              <h1 style={{
                fontFamily: G.fontDisplay,
                fontSize:'clamp(2rem,3.2vw,2.8rem)',
                fontWeight:400, fontStyle:'normal',
                color:'#FFFFFF', lineHeight:1.15,
                margin:'0 0 16px', letterSpacing:'-0.01em',
              }}>
                GreenLife<br />Natural Foods
              </h1>

              <p style={{
                fontFamily: G.fontBody,
                fontSize:14, lineHeight:1.65,
                color:'rgba(255,255,255,0.60)',
                margin:'0 0 40px', maxWidth:320,
              }}>
                {isTamil
                  ? 'மரச்செக்கு எண்ணெய், மூலிகைப் பொடிகள் மற்றும் பாரம்பரிய சிறுதானியங்கள்.'
                  : 'Pure cold-pressed oils, spice podis, and farm-fresh organic millets.'}
              </p>

              {/* Trust signals */}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { icon: ShieldCheck, en: '100% Chemical & Sulphur Free', ta: '100% ரசாயனம் மற்றும் சல்பர் அற்றது' },
                  { icon: Sparkles,    en: 'Traditional Chekku Cold Pressed', ta: 'பாரம்பரிய மரச்செக்கு முறை' },
                  { icon: Clock,       en: 'Instant GST & POS Billing', ta: 'உடனடி ஜிஎஸ்டி மற்றும் பில்லிங்' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{
                        width:28, height:28, borderRadius:8,
                        background:'rgba(255,255,255,0.08)',
                        border:'1px solid rgba(255,255,255,0.12)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        flexShrink:0,
                      }}>
                        <Icon size={14} color={G.amber} />
                      </div>
                      <span style={{
                        fontFamily: G.fontBody, fontSize:13,
                        color:'rgba(255,255,255,0.80)', fontWeight:500,
                      }}>
                        {isTamil ? item.ta : item.en}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom brand note */}
            <div style={{ paddingTop:32 }}>
              <p style={{
                fontFamily: G.fontBody, fontSize:11,
                color:'rgba(255,255,255,0.35)', margin:0,
                letterSpacing:'0.04em',
              }}>
                Kangeyam · Tirupur · Tamil Nadu · Est. 2024
              </p>
            </div>
          </div>

          {/* Amber bottom rule */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            height:3, background: G.amber, opacity:0.75,
          }} />
        </div>

        {/* ── Right Form Panel (desktop only) ── */}
        <div style={{
          flex:1, display:'flex', flexDirection:'column',
          background: G.paper, minHeight:'100vh', position:'relative',
        }}>

          {/* Form — centred vertically */}
          <div style={{
            flex:1, display:'flex', alignItems:'center',
            justifyContent:'center', padding:'48px 24px',
          }}>
            <div style={{ width:'100%', maxWidth:360 }}>

            {/* Heading */}
            <div style={{ marginBottom:36 }}>
              <p style={{
                fontFamily: G.fontBody,
                fontSize:10, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.14em',
                color: G.amber, margin:'0 0 8px',
              }}>
                {isTamil ? 'கணக்கு அணுகல்' : 'Account Access'}
              </p>
              <h2 style={{
                fontFamily: G.fontDisplay,
                fontSize:'clamp(1.6rem,4vw,2rem)',
                fontWeight:400, fontStyle:'normal',
                color: G.ink, margin:0, lineHeight:1.2,
              }}>
                {isTamil ? 'உள்நுழைக' : 'Sign in'}
              </h2>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom:20, padding:'12px 16px',
                background: G.errorBg,
                border:`1px solid ${G.errorBorder}`,
                borderRadius:12, color: G.errorText,
                fontFamily: G.fontBody, fontSize:12, fontWeight:500,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Email */}
              <div>
                <label style={{
                  display:'block', fontFamily: G.fontBody,
                  fontSize:10, fontWeight:700,
                  textTransform:'uppercase', letterSpacing:'0.08em',
                  color: G.ink2, marginBottom:8,
                }}>
                  {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                </label>
                <div style={{ position:'relative' }}>
                  <Mail size={15} color={G.inkMuted} style={{
                    position:'absolute', left:14, top:'50%',
                    transform:'translateY(-50%)', pointerEvents:'none',
                  }} />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@greenlife.com"
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    style={{
                      width:'100%', boxSizing:'border-box',
                      paddingLeft:42, paddingRight:14,
                      paddingTop:12, paddingBottom:12,
                      background:'#FFFFFF',
                      border:`1.5px solid ${emailFocus ? G.accent : G.paper2}`,
                      borderRadius:12,
                      boxShadow: emailFocus ? `0 0 0 3px rgba(45,106,79,0.12)` : 'none',
                      fontFamily: G.fontBody, fontSize:14,
                      color: G.ink, outline:'none',
                      transition:'border-color 0.15s, box-shadow 0.15s',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display:'block', fontFamily: G.fontBody,
                  fontSize:10, fontWeight:700,
                  textTransform:'uppercase', letterSpacing:'0.08em',
                  color: G.ink2, marginBottom:8,
                }}>
                  {isTamil ? 'கடவுச்சொல்' : 'Password'}
                </label>
                <div style={{ position:'relative' }}>
                  <Lock size={15} color={G.inkMuted} style={{
                    position:'absolute', left:14, top:'50%',
                    transform:'translateY(-50%)', pointerEvents:'none',
                  }} />
                  <input
                    type="password" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onFocus={() => setPassFocus(true)}
                    onBlur={() => setPassFocus(false)}
                    style={{
                      width:'100%', boxSizing:'border-box',
                      paddingLeft:42, paddingRight:14,
                      paddingTop:12, paddingBottom:12,
                      background:'#FFFFFF',
                      border:`1.5px solid ${passFocus ? G.accent : G.paper2}`,
                      borderRadius:12,
                      boxShadow: passFocus ? `0 0 0 3px rgba(45,106,79,0.12)` : 'none',
                      fontFamily: G.fontBody, fontSize:14,
                      color: G.ink, outline:'none',
                      transition:'border-color 0.15s, box-shadow 0.15s',
                    }}
                  />
                </div>
              </div>

              {/* Remember + Forgot row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <label style={{
                  display:'flex', alignItems:'center', gap:8,
                  fontFamily: G.fontBody, fontSize:13,
                  color: G.ink2, cursor:'pointer',
                }}>
                  <input
                    type="checkbox" checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: G.accent, width:15, height:15 }}
                  />
                  {isTamil ? 'என்னை நினைவில் கொள்' : 'Remember me'}
                </label>
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    alert(isTamil
                      ? 'கடவுச்சொல் மீட்டமைக்க admin@greenlife.com ஐத் தொடர்பு கொள்ளவும்.'
                      : 'Contact system administrator at admin@greenlife.com for password reset.');
                  }}
                  style={{
                    fontFamily: G.fontBody, fontSize:12, fontWeight:600,
                    color: G.accent, textDecoration:'none',
                  }}
                >
                  {isTamil ? 'கடவுச்சொல் மறந்ததா?' : 'Forgot password?'}
                </a>
              </div>

              {/* Sign In button */}
              <button
                type="submit" disabled={loading}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  padding:'14px 20px',
                  background: loading ? G.inkMuted : G.accent,
                  color:'#FFFFFF',
                  border:'none', borderRadius:12,
                  fontFamily: G.fontBody, fontSize:14, fontWeight:600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(45,106,79,0.38)',
                  transition:'background 0.15s, box-shadow 0.15s',
                  marginTop:4,
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = G.accentHover; }}
                onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = G.accent; }}
              >
                <span>
                  {loading
                    ? (isTamil ? 'சரிபார்க்கிறது...' : 'Authenticating...')
                    : (isTamil ? 'உள்நுழைக' : 'Sign In to Dashboard')}
                </span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Demo Access */}
            <div style={{
              marginTop:28, paddingTop:24,
              borderTop:`1px solid ${G.paper2}`,
            }}>
              <p style={{
                fontFamily: G.fontBody, fontSize:10, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.14em',
                color: G.inkMuted, textAlign:'center', margin:'0 0 14px',
              }}>
                {isTamil ? 'ஒரு-கிளிக் சோதனை அணுகல்' : 'One-Click Demo Access'}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@greenlife.com', 'admin123')}
                  style={{
                    padding:'11px 12px',
                    background: G.accentLight,
                    border:`1.5px solid ${G.accentBorder}`,
                    borderRadius:12, color: G.accent,
                    fontFamily: G.fontBody, fontSize:12, fontWeight:600,
                    cursor:'pointer', textAlign:'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#D8EDE1')}
                  onMouseLeave={e => (e.currentTarget.style.background = G.accentLight)}
                >
                  👑 {isTamil ? 'நிர்வாகி (Admin)' : 'Admin Demo'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('staff@greenlife.com', 'staff123')}
                  style={{
                    padding:'11px 12px',
                    background: G.paper2,
                    border:`1.5px solid #D4CFC5`,
                    borderRadius:12, color: G.ink2,
                    fontFamily: G.fontBody, fontSize:12, fontWeight:600,
                    cursor:'pointer', textAlign:'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#E4DFDA')}
                  onMouseLeave={e => (e.currentTarget.style.background = G.paper2)}
                >
                  👤 {isTamil ? 'பணியாளர் (Staff)' : 'Staff Demo'}
                </button>
              </div>
            </div>

            {/* Sign up link */}
            <p style={{
              marginTop:24, textAlign:'center',
              fontFamily: G.fontBody, fontSize:12, color: G.inkMuted,
            }}>
              {isTamil ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
              <Link to="/signup" style={{
                color: G.accent, fontWeight:600, textDecoration:'none',
              }}>
                {isTamil ? 'புதிய கணக்கு பதிவு' : 'Create an account'}
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  </>
);
};
