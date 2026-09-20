/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* redesign: Login.tsx · genre: editorial · theme: Garden
 * macrostructure: Split-screen Workbench
 * all colors/fonts inlined to bypass global body overrides in index.css
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Lock, Mail, ArrowRight, Languages } from 'lucide-react';

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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: G.paper,
      fontFamily: G.fontBody,
      overflowX: 'hidden',
    }}>

      {/* ── Left Brand Panel (desktop only) ── */}
      <div style={{
        background: G.panel,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }} className="hidden lg:flex lg:flex-col lg:w-[44%] xl:w-[40%]">

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

        {/* Brand identity — vertically centred */}
        <div style={{
          flex:1, display:'flex', flexDirection:'column',
          justifyContent:'center', padding:'0 48px',
          position:'relative', zIndex:10,
        }}>
          {/* Logo badge */}
          <div style={{
            width:56, height:56, borderRadius:16,
            background: G.accent,
            display:'flex', alignItems:'center', justifyContent:'center',
            marginBottom:28,
            boxShadow:'0 8px 32px rgba(0,0,0,0.35)',
          }}>
            <Leaf size={26} color="#fff" />
          </div>

          {/* Brand name — large serif, roman only */}
          <h1 style={{
            fontFamily: G.fontDisplay,
            fontSize:'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight:400, fontStyle:'normal',
            color:'#FAFAF8',
            lineHeight:1.15,
            margin:'0 0 10px',
          }}>
            {t('brand.name')}
          </h1>

          {/* Sub tagline */}
          <p style={{
            fontFamily: G.fontBody,
            fontSize:13, color:'rgba(255,255,255,0.48)',
            margin:'0 0 36px', letterSpacing:'0.02em',
          }}>
            {isTamil ? 'இயற்கை உணவு பில்லிங் அமைப்பு' : 'Organic Food Billing System'}
          </p>

          {/* Trust signals */}
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {[
              { icon:'🌿', en:'Tamil & English bilingual invoices',       ta:'தமிழ் & ஆங்கிலம் இரு மொழி பில்கள்' },
              { icon:'📄', en:'Official cash & credit bill PDFs',         ta:'ரொக்க & கடன் பில் PDF கள்' },
              { icon:'⚖️', en:'Partial payment & balance tracking',       ta:'பாதி பணம் & மீதி கணக்கு நடவடிக்கை' },
            ].map(item => (
              <div key={item.en} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <span style={{ fontSize:18, lineHeight:1, marginTop:2 }}>{item.icon}</span>
                <span style={{
                  fontFamily: G.fontBody, fontSize:13,
                  color:'rgba(255,255,255,0.55)', lineHeight:1.5,
                }}>
                  {isTamil ? item.ta : item.en}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Amber bottom rule */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0,
          height:3, background: G.amber, opacity:0.75,
        }} />
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        background: G.paper, minHeight:'100vh', position:'relative',
      }}>

        {/* Mobile-only language toggle */}
        <div style={{ position:'absolute', top:20, right:20, zIndex:20 }}
             className="lg:hidden">
          <button
            onClick={toggleLanguage}
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'6px 12px',
              background: G.paper2,
              border:`1px solid ${G.accentBorder}`,
              borderRadius:8, color: G.accent,
              fontFamily: G.fontBody, fontSize:12, fontWeight:600, cursor:'pointer',
            }}
          >
            <Languages size={13} />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
        </div>

        {/* Mobile brand strip */}
        <div style={{
          borderBottom:`1px solid ${G.paper2}`,
          padding:'36px 24px 20px',
          display:'flex', alignItems:'center', gap:12,
        }} className="lg:hidden">
          <div style={{
            width:36, height:36, borderRadius:10,
            background: G.accent,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Leaf size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: G.fontBody, fontWeight:600, fontSize:14, color: G.ink }}>
            {t('brand.name')}
          </span>
        </div>

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
  );
};
