import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Languages, Leaf, LockKeyhole, Mail, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export const Login = () => {
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const ta = language === "ta";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password }, remember);
      navigate("/");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(detail || (ta ? "உள்நுழைய முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Unable to sign in. Check your details and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reference-login">
      <header className="login-header">
        <Link to="/login" className="login-wordmark" aria-label="GreenLife Natural Foods">
          <Leaf size={23} strokeWidth={1.5} aria-hidden="true" />
          <span>GreenLife<small>{ta ? "இயற்கை உணவுகள்" : "Natural Foods"}</small></span>
        </Link>
        <button type="button" className="login-language" onClick={toggleLanguage}>
          <Languages size={15} aria-hidden="true" />{ta ? "English" : "தமிழ்"}
        </button>
      </header>
      <section className="login-welcome" aria-labelledby="login-welcome-heading">
        <div className="login-welcome-copy">
          <p className="login-welcome-label">{ta ? "உங்கள் கடைக்கான இடம்" : "The everyday workspace"}</p>
          <h2 id="login-welcome-heading">{ta ? "உங்கள் கடை. எல்லாம் ஒரே இடத்தில்." : <>Your store.<br /> All in one place.</>}</h2>
          <p className="login-welcome-description">{ta ? "விற்பனை, சரக்கு மற்றும் கணக்குகளை எளிதாக நிர்வகிக்கவும்." : "A simpler way to manage your sales, keep track of stock, and stay on top of the day."}</p>
          <p className="login-welcome-details">{ta ? "பில்லிங் · சரக்கு · அறிக்கைகள்" : "Billing · Inventory · Reports"}</p>
        </div>
      </section>
      <section className="login-form-panel" aria-labelledby="sign-in-heading">
        <div className="login-form-inner">

          <h1 id="sign-in-heading">{ta ? "உள்நுழைய" : "Sign in"}</h1>
          <p className="login-intro">{ta ? "உங்கள் கடை கணக்கை அணுகவும்." : "Welcome back to your store."}</p>
          <form onSubmit={submit} className="auth-form">
            {error && <p className="form-error" role="alert">{error}</p>}
            <label htmlFor="login-email">{ta ? "மின்னஞ்சல் முகவரி" : "Email address"}</label>
            <div className="input-with-icon">
              <Mail size={16} aria-hidden="true" />
              <input id="login-email" name="email" type="email" autoComplete="username" placeholder="you@greenlife.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <label htmlFor="login-password">{ta ? "கடவுச்சொல்" : "Password"}</label>
            <div className="input-with-icon">
              <LockKeyhole size={16} aria-hidden="true" />
              <input id="login-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" placeholder={ta ? "கடவுச்சொல்லை உள்ளிடவும்" : "Enter your password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"}>
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="login-options">
              <label className="login-remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />{ta ? "என்னை நினைவில் கொள்" : "Remember me"}</label>
              <button type="button" className="login-help" onClick={() => setHelp(!help)} aria-expanded={help} aria-controls="login-help-text">{ta ? "கடவுச்சொல் மறந்ததா?" : "Forgot password?"}</button>
            </div>
            {help && <p id="login-help-text" className="form-help" role="status">{ta ? "கணக்கு உதவிக்கு உங்கள் கடை நிர்வாகியை அணுகவும். கீழே மாதிரி கணக்கையும் பயன்படுத்தலாம்." : "Contact your store administrator for account access, or use a demo account below to explore."}</p>}
            <button type="submit" disabled={loading} className="login-submit"><span>{loading ? (ta ? "உள்நுழைகிறது…" : "Signing you in…") : (ta ? "உள்நுழைய" : "Sign in to Dashboard")}</span><ArrowRight size={17} aria-hidden="true" /></button>
          </form>
          <div className="login-demo-title">{ta ? "மாதிரி கணக்குகள்" : "Demo accounts"}</div>
          <div className="demo-buttons">
            {(["admin", "staff"] as const).map((role) => (
              <button key={role} type="button" disabled={loading} onClick={() => { setEmail(`${role}@greenlife.com`); setPassword(`${role}123`); setError(""); }}>
                {role === "admin" ? <ShieldCheck size={14} aria-hidden="true" /> : <Users size={14} aria-hidden="true" />}
                {role === "admin" ? (ta ? "நிர்வாகி மாதிரி" : "Admin demo") : (ta ? "ஊழியர் மாதிரி" : "Staff demo")}
              </button>
            ))}
          </div>
          <p className="signup-prompt">{ta ? "கணக்கு இல்லையா?" : "Don’t have an account?"} <Link to="/signup">{ta ? "கணக்கு உருவாக்க" : "Create an account"}</Link></p>
        </div>
      </section>
    </main>
  );
};
