import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  Package,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const Login = () => {
  const root = useRef<HTMLElement>(null);
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const ta = language === "ta";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [slide, setSlide] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".intro-reveal", {
          y: 22,
          opacity: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
        });
        gsap.fromTo(
          ".story-word",
          { opacity: 0.18 },
          {
            opacity: 1,
            stagger: 0.15,
            scrollTrigger: {
              trigger: ".brand-story",
              start: "top 78%",
              end: "bottom 65%",
              scrub: 1,
            },
          },
        );
      });
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          ScrollTrigger.create({
            trigger: ".workflow-section",
            start: "top 140px",
            end: "bottom 530px",
            pin: ".workflow-heading",
            pinSpacing: false,
          });
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [language], revertOnUpdate: true },
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(
        detail ||
          (ta
            ? "உள்நுழைய முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
            : "Unable to sign in. Check your details and try again."),
      );
    } finally {
      setLoading(false);
    }
  };
  const features = [
    {
      icon: ReceiptText,
      title: ta ? "எளிமையான பில்லிங்." : "Beautifully simple billing.",
      text: ta
        ? "பொருட்களைத் தேர்ந்தெடுத்து, துல்லியமான பில்களை நொடிகளில் உருவாக்குங்கள்."
        : "From the first item to the final receipt. Create clear, accurate invoices in a few thoughtful steps.",
      detail: ta
        ? "பில்கள், கட்டணங்கள், ரசீதுகள்"
        : "Invoices, payments & receipts",
    },
    {
      icon: Package,
      title: ta ? "ஒவ்வொரு பொருளும் கணக்கில்." : "Every product, in place.",
      text: ta
        ? "இருப்பு, விலை மற்றும் கொள்முதல் விவரங்களை ஒரே இடத்தில் நிர்வகிக்கவும்."
        : "Keep your oils, grains and everyday essentials organised, with prices and stock always close at hand.",
      detail: ta ? "பொருட்கள் மற்றும் இருப்பு" : "Products, stock & purchases",
    },
    {
      icon: Users,
      title: ta ? "நல்ல உறவுகள் வளரட்டும்." : "Good relationships grow.",
      text: ta
        ? "வாடிக்கையாளர் விவரங்கள் மற்றும் பாக்கித் தொகைகளை எளிதாகக் கண்காணிக்கவும்."
        : "Know your customers, follow up on balances and give every regular a more personal experience.",
      detail: ta ? "வாடிக்கையாளர்கள் மற்றும் பாக்கி" : "Customers & balances",
    },
  ];
  const steps = ta
    ? [
        [
          "வாடிக்கையாளரைத் தேர்ந்தெடுக்கவும்",
          "சேமித்த வாடிக்கையாளரைத் தேர்ந்தெடுக்கவும் அல்லது புதியவரைச் சேர்க்கவும்.",
        ],
        [
          "பொருட்களைச் சேர்க்கவும்",
          "பொருட்கள், அளவு மற்றும் தள்ளுபடியை உள்ளிடவும். மொத்தம் தானாகக் கணக்கிடப்படும்.",
        ],
        [
          "பில்லை உருவாக்கவும்",
          "விவரங்களைச் சரிபார்த்து, பில்லை உருவாக்கி அச்சிடவும்.",
        ],
      ]
    : [
        [
          "A familiar face. A fresh order.",
          "Choose a returning customer or add someone new. Their details and previous balance are ready when you are.",
        ],
        [
          "A little of everything good.",
          "Add products, quantities and discounts. Your totals are calculated as you go, so you can focus on the customer.",
        ],
        [
          "A receipt. And a reason to return.",
          "Review the order, create the invoice and print a clear receipt. Every payment stays connected to the bill.",
        ],
      ];
  const story = ta
    ? "இயற்கையின் நன்மை. உங்கள் வியாபாரத்தில் ஒவ்வொரு நாளும்."
    : "Rooted in nature. Made for the way you work.";

  return (
    <main ref={root} className="auth-site overflow-x-hidden w-full max-w-full">
      <a href="#sign-in" className="skip-link">
        Skip to sign in
      </a>
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
        <div className="public-nav-links">
          <a href="#why-greenlife">
            {ta ? "ஏன் கிரீன்லைஃப்" : "A simpler workday"}
          </a>
          <a href="#workflow">{ta ? "செயல்முறை" : "How it works"}</a>
        </div>
        <button className="language-button" onClick={toggleLanguage}>
          {ta ? "English" : "தமிழ்"} <ArrowUpRight size={14} />
        </button>
      </nav>
      <section className="login-hero">
        <div className="hero-editorial">
          <div className="hero-copy intro-reveal">
            <p className="eyebrow">
              {ta
                ? "இயற்கையுடன் இணைந்த வியாபாரம்"
                : "NATURALLY BETTER BUSINESS"}
            </p>
            <h1 className="w-full max-w-5xl">
              {ta ? (
                <>
                  நல்ல வியாபாரம்.
                  <br />
                  <em>இயல்பாகவே.</em>
                </>
              ) : (
                <>
                  Good things.
                  <br />
                  <em>Growing together.</em>
                </>
              )}
            </h1>
            <p className="hero-description">
              {ta
                ? "இயற்கை உணவுகள் மீதான உங்கள் அக்கறைக்கு, எளிமையான கடை நிர்வாகம்."
                : "You care for the little things. We help you take care of the business."}
            </p>
          </div>
          <div className="forest-frame intro-reveal">
            <img
              src="/images/forest.jpg"
              width="1400"
              height="933"
              alt="Sunlight finding its way through a lush green forest"
              fetchPriority="high"
            />
            <div className="forest-caption">
              <span>
                {ta
                  ? "நல்ல வேர்கள். நல்ல வளர்ச்சி."
                  : "Good roots. Better days."}
              </span>
              <ArrowUpRight size={28} strokeWidth={1} />
            </div>
          </div>
          <a href="#why-greenlife" className="explore-link intro-reveal">
            <span className="round-arrow">
              <ArrowDown size={17} />
            </span>
            {ta ? "மேலும் அறிய" : "A little more about GreenLife"}
          </a>
        </div>
        <div className="login-form-column intro-reveal" id="sign-in">
          <div className="login-form-heading">
            <span className="small-sprout">
              <Leaf size={23} strokeWidth={1.5} />
            </span>
            <p className="eyebrow">
              {ta ? "உங்கள் பணியிடம்" : "YOUR DAILY WORKSPACE"}
            </p>
            <h2>{ta ? "மீண்டும் வருக." : "Welcome back."}</h2>
            <p>
              {ta
                ? "உங்கள் கடையின் புதிய நாளைத் தொடங்குங்கள்."
                : "A fresh day. A little less admin."}
            </p>
          </div>
          <form onSubmit={submit} className="auth-form">
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <label htmlFor="login-email">
              {ta ? "மின்னஞ்சல் முகவரி" : "Email address"}
            </label>
            <div className="input-with-icon">
              <Mail size={17} />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@greenlife.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="label-row">
              <label htmlFor="login-password">
                {ta ? "கடவுச்சொல்" : "Password"}
              </label>
              <button
                type="button"
                className="text-button"
                onClick={() => setHelp(!help)}
                aria-expanded={help}
              >
                {ta ? "உதவி வேண்டுமா?" : "Need help?"}
              </button>
            </div>
            <div className="input-with-icon">
              <LockKeyhole size={17} />
              <input
                id="login-password"
                name="password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                placeholder={
                  ta ? "கடவுச்சொல்லை உள்ளிடவும்" : "Enter your password"
                }
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {help && (
              <p className="form-help" role="status">
                {ta
                  ? "கணக்கு உதவிக்கு உங்கள் கடை நிர்வாகியை அணுகவும். கீழே மாதிரி கணக்கையும் பயன்படுத்தலாம்."
                  : "Contact your store administrator for account access, or use a demo account below to explore."}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="primary-button sign-in-button"
            >
              <span>
                {loading
                  ? ta
                    ? "உள்நுழைகிறது…"
                    : "Signing you in…"
                  : ta
                    ? "உள்நுழைய"
                    : "Sign in to your workspace"}
              </span>
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="demo-divider">
            <span>
              {ta
                ? "முதன்முறை வருகையா? முயற்சிக்கவும்"
                : "Just looking? Make yourself at home."}
            </span>
          </div>
          <div className="demo-buttons">
            {(["admin", "staff"] as const).map((role) => (
              <button
                key={role}
                type="button"
                disabled={loading}
                onClick={() => {
                  setEmail(`${role}@greenlife.com`);
                  setPassword(`${role}123`);
                  setError("");
                }}
              >
                <span>
                  {role === "admin" ? (
                    <ShieldCheck size={17} />
                  ) : (
                    <Users size={17} />
                  )}
                  {role === "admin"
                    ? ta
                      ? "நிர்வாகி மாதிரி"
                      : "Admin demo"
                    : ta
                      ? "ஊழியர் மாதிரி"
                      : "Staff demo"}
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
          <p className="signup-prompt">
            {ta ? "புதிய கணக்கு வேண்டுமா?" : "New to the team?"}{" "}
            <Link to="/signup">
              {ta ? "கணக்கு உருவாக்க" : "Create an account"}{" "}
              <ArrowUpRight size={13} />
            </Link>
          </p>
          <div className="secure-note">
            <LockKeyhole size={13} />{" "}
            {ta
              ? "பாதுகாப்பான அணுகல். உங்கள் வியாபாரத்திற்காக."
              : "Secure access. Thoughtfully built for your business."}
          </div>
        </div>
      </section>
      <div
        className="nature-marquee"
        aria-label="Cold-pressed oils, wholesome grains, natural goodness"
      >
        <div aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              Cold-pressed oils <Leaf /> Wholesome grains <Leaf /> Natural
              goodness <Leaf /> Everyday care <Leaf />
            </span>
          ))}
        </div>
      </div>
      <section className="features-section" id="why-greenlife">
        <div className="section-intro">
          <p className="eyebrow">
            {ta ? "உங்கள் நாளை எளிதாக்க" : "LESS BUSYWORK. MORE GOOD WORK."}
          </p>
          <h2>
            {ta ? (
              "கடைக்குத் தேவையான அனைத்தும்."
            ) : (
              <>
                Room to grow.
                <br />
                Less to juggle.
              </>
            )}
          </h2>
          <p>
            {ta
              ? "பில்லிங் முதல் இருப்பு வரை, அனைத்தும் ஒரே இடத்தில்."
              : "The everyday essentials for your store, brought together in one considered workspace."}
          </p>
        </div>
        <div
          className="feature-accordion"
          style={{
            gridTemplateColumns: `${activeFeature === 0 ? "1.4" : "1"}fr ${activeFeature === 1 ? "1.4" : "1"}fr ${activeFeature === 2 ? "1.4" : "1"}fr`,
          }}
        >
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveFeature(i)}
              onMouseEnter={() => setActiveFeature(i)}
              onFocus={() => setActiveFeature(i)}
              aria-expanded={activeFeature === i}
              className={`feature-panel ${activeFeature === i ? "is-expanded" : ""}`}
            >
              <f.icon size={28} strokeWidth={1.4} />
              <span className="feature-detail">{f.detail}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <ArrowUpRight className="feature-arrow" size={23} />
            </button>
          ))}
        </div>
      </section>
      <section className="brand-story">
        <p aria-label={story}>
          {story.split(" ").map((word, i) => (
            <span className="story-word" key={i} aria-hidden="true">
              {word}{" "}
            </span>
          ))}
        </p>
        <Leaf size={54} strokeWidth={1} />
      </section>
      <section className="workflow-section" id="workflow">
        <div className="workflow-heading">
          <p className="eyebrow">
            {ta ? "எளிய செயல்முறை" : "A NATURAL RHYTHM"}
          </p>
          <h2>
            {ta ? (
              "சிறிய படிகள். நல்ல நாட்கள்."
            ) : (
              <>
                Small steps.
                <br />
                Better days.
              </>
            )}
          </h2>
          <p>
            {ta
              ? "ஒரு ஆர்டரை எளிதாக பில்லாக மாற்றுங்கள்."
              : "From a friendly hello to a finished bill. Find a flow that feels like second nature."}
          </p>
          <a href="#sign-in" className="text-link">
            {ta ? "தொடங்குங்கள்" : "Find your flow"} <ArrowRight size={17} />
          </a>
        </div>
        <div className="workflow-carousel">
          <div className="workflow-image">
            <img
              src="/images/greenlife-landscape.jpg"
              alt="Quiet mountain landscape"
              loading="lazy"
              width="1920"
              height="1080"
            />
            <span>{ta ? "வளர இடமுண்டு." : "A little space to breathe."}</span>
          </div>
          <div className="workflow-copy" aria-live="polite">
            <span className="step-count">
              {String(slide + 1).padStart(2, "0")} / 03
            </span>
            <h3>{steps[slide][0]}</h3>
            <p>{steps[slide][1]}</p>
          </div>
          <div className="carousel-controls">
            <div className="carousel-dots">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={slide === i ? "active" : ""}
                  aria-label={`Show step ${i + 1}`}
                  aria-pressed={slide === i}
                />
              ))}
            </div>
            <div>
              <button
                className="icon-button"
                aria-label="Previous step"
                onClick={() => setSlide((slide + 2) % 3)}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Next step"
                onClick={() => setSlide((slide + 1) % 3)}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <footer className="public-footer">
        <div>
          <Leaf size={25} />
          <h2>
            {ta ? "நல்ல நாளைத் தொடங்குங்கள்." : "Let’s make today a good day."}
          </h2>
          <a href="#sign-in" className="primary-button">
            {ta ? "உங்கள் பணியிடத்திற்குச் செல்ல" : "Open your workspace"}
            <ArrowUpRight size={19} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} GreenLife Natural Foods</span>
          <span>Rooted in nature. Made with care.</span>
          <span>
            <Check size={14} /> {ta ? "தமிழ் & English" : "English & தமிழ்"}
          </span>
        </div>
      </footer>
    </main>
  );
};
