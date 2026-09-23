import { useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  ScanText,
  Settings,
  X,
  BookOpen,
  Leaf,
  LogOut,
  Truck,
  Plus,
  ArrowUpRight,
  Workflow,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isAdmin, logout, user } = useAuth();
  const { language } = useLanguage();
  const ta = language === "ta";
  const navigate = useNavigate();
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const elements =
          panel.current?.querySelectorAll<HTMLElement>("a, button");
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [isOpen, onClose]);
  const items = [
    ["/", ta ? "முகப்பு" : "Overview", LayoutDashboard],
    ["/invoices", ta ? "பில்கள்" : "Invoices", FileText],
    ["/orders", ta ? "ஆர்டர்கள்" : "Orders", Truck],
    ["/customers", ta ? "வாடிக்கையாளர்கள்" : "Customers", Users],
    ["/products", ta ? "பொருட்கள் & இருப்பு" : "Products & stock", Package],
    ["/purchases", ta ? "கொள்முதல்" : "Purchases", Truck],
    ["/reports", ta ? "அறிக்கைகள்" : "Reports", BarChart3],
  ] as const;
  const toolItems = [
    ["/ai-extraction", ta ? "பில் ஸ்கேன்" : "Scan a bill", ScanText],
    ...(isAdmin
      ? [
          ["/automation", ta ? "தானியக்கம்" : "Automations", Workflow] as const,
          [
            "/settings",
            ta ? "அமைப்புகள்" : "Store settings",
            Settings,
          ] as const,
        ]
      : []),
    ["/manual", ta ? "உதவி" : "Help & guide", BookOpen],
  ] as const;
  return (
    <>
      {isOpen && (
        <button
          className="sidebar-backdrop"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside
        ref={panel}
        className={`workspace-sidebar ${isOpen ? "is-open" : ""}`}
        aria-label="Store navigation"
      >
        <div className="sidebar-brand-row">
          <Link to="/" className="brand" onClick={onClose}>
            <span className="brand-symbol">
              <Leaf size={23} strokeWidth={1.5} />
            </span>
            <span>
              greenlife<span className="brand-period">.</span>
              <small>NATURAL FOODS</small>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="icon-button mobile-menu"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>
        <Link
          to="/orders/new"
          onClick={onClose}
          className="primary-button sidebar-create"
        >
          <Plus size={18} />
          {ta ? "புதிய பில்" : "Create invoice"}
          <span className="shortcut">+</span>
        </Link>
        <nav className="sidebar-links">
          <p className="nav-label">{ta ? "பணியிடம்" : "WORKSPACE"}</p>
          {items.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.6} />
              <span>{label}</span>
              <span className="active-dot" />
            </NavLink>
          ))}
          <p className="nav-label tools-label">
            {ta ? "கருவிகள்" : "TOOLS & SUPPORT"}
          </p>
          {toolItems.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.6} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/manual" className="sidebar-note" onClick={onClose}>
            <Leaf size={21} strokeWidth={1.3} />
            <span>
              {ta ? "வளர, ஒரு சிறிய உதவி." : "A little help to grow."}
              <small>{ta ? "கடை வழிகாட்டி" : "Explore your store guide"}</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>
          <div className="sidebar-account">
            <Link to="/profile" onClick={onClose}>
              <span className="user-avatar">{user?.full_name?.[0] || "G"}</span>
              <span>
                {user?.full_name || "GreenLife"}
                <small>
                  {isAdmin
                    ? ta
                      ? "நிர்வாகி"
                      : "Store administrator"
                    : ta
                      ? "ஊழியர்"
                      : "Store team"}
                </small>
              </span>
            </Link>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
