import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export const Signup = () => {
  const { signup } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const ta = language === "ta";
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ full_name: fullName, email, password, role });
      navigate("/");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ||
          (ta
            ? "கணக்கை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
            : "We couldn’t create your account. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-site signup-site overflow-x-hidden w-full max-w-full">
      <nav className="public-nav" aria-label="Main navigation">
        <Link to="/login" className="brand">
          <span className="brand-symbol">
            <Leaf size={23} strokeWidth={1.5} />
          </span>
          <span>
            greenlife<span className="brand-period">.</span>
            <small>NATURAL FOODS</small>
          </span>
        </Link>
        <button className="language-button" onClick={toggleLanguage}>
          {ta ? "English" : "தமிழ்"}
          <ArrowUpRight size={14} />
        </button>
      </nav>
      <section className="login-hero signup-hero">
        <div className="hero-editorial">
          <div className="hero-copy">
            <p className="eyebrow">
              {ta ? "ஒன்றாக வளர்வோம்" : "THERE’S ROOM TO GROW"}
            </p>
            <h1 className="w-full max-w-5xl">
              {ta ? (
                <>
                  ஒரு புதிய தொடக்கம்.
                  <br />
                  <em>ஒன்றாக.</em>
                </>
              ) : (
                <>
                  A fresh start.
                  <br />
                  <em>A shared purpose.</em>
                </>
              )}
            </h1>
            <p className="hero-description">
              {ta
                ? "உங்கள் குழுவுடன் இணையுங்கள். கடை நிர்வாகத்தை எளிதாக்குங்கள்."
                : "Join your team. Bring a little more ease to the everyday."}
            </p>
          </div>
          <div className="forest-frame">
            <img
              src="/images/forest.jpg"
              alt="Warm sunlight through a green forest"
              width="1400"
              height="933"
            />
            <div className="forest-caption">
              <span>
                {ta ? "ஒன்றாக, இயல்பாக." : "Better together. Naturally."}
              </span>
              <Leaf size={27} strokeWidth={1.3} />
            </div>
          </div>
          <Link to="/login" className="explore-link">
            <span className="round-arrow">
              <ArrowLeft size={17} />
            </span>
            {ta ? "உள்நுழைவுக்குத் திரும்ப" : "Back to sign in"}
          </Link>
        </div>
        <div className="login-form-column">
          <div className="login-form-heading">
            <p className="eyebrow">
              {ta ? "குழுவில் இணையுங்கள்" : "MAKE YOURSELF AT HOME"}
            </p>
            <h2>{ta ? "கணக்கு உருவாக்க." : "Join the team."}</h2>
            <p>
              {ta
                ? "தொடங்க சில விவரங்கள் போதும்."
                : "A few details, and you’re on your way."}
            </p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <label htmlFor="signup-name">
              {ta ? "முழுப் பெயர்" : "Full name"}
            </label>
            <div className="input-with-icon">
              <UserRound size={17} />
              <input
                id="signup-name"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={ta ? "உங்கள் பெயர்" : "Your full name"}
              />
            </div>
            <label htmlFor="signup-email">
              {ta ? "மின்னஞ்சல் முகவரி" : "Email address"}
            </label>
            <div className="input-with-icon">
              <Mail size={17} />
              <input
                id="signup-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@greenlife.com"
              />
            </div>
            <label htmlFor="signup-password">
              {ta ? "கடவுச்சொல்" : "Password"}
            </label>
            <div className="input-with-icon">
              <LockKeyhole size={17} />
              <input
                id="signup-password"
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  ta ? "குறைந்தது 6 எழுத்துகள்" : "At least 6 characters"
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <label htmlFor="signup-role">
              {ta ? "உங்கள் பங்கு" : "Your role"}
            </label>
            <select
              id="signup-role"
              className="auth-select"
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "staff")}
            >
              <option value="staff">{ta ? "ஊழியர்" : "Staff member"}</option>
              <option value="admin">{ta ? "நிர்வாகி" : "Administrator"}</option>
            </select>
            <button
              className="primary-button sign-in-button"
              disabled={loading}
            >
              {loading
                ? ta
                  ? "உருவாக்குகிறது…"
                  : "Creating your account…"
                : ta
                  ? "கணக்கு உருவாக்க"
                  : "Create your account"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="signup-prompt">
            {ta ? "ஏற்கனவே கணக்கு உள்ளதா?" : "Already part of the team?"}{" "}
            <Link to="/login">
              {ta ? "உள்நுழைய" : "Sign in"}
              <ArrowUpRight size={13} />
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};
