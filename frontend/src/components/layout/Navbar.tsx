import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Sun,
  Moon,
  Languages,
  Sparkles,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export const Navbar = ({
  onToggleSidebar,
  onOpenAiAssistant,
}: {
  onToggleSidebar: () => void;
  onOpenAiAssistant: () => void;
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { pathname } = useLocation();
  const ta = language === "ta";
  const titles: Record<string, string> = {
    "/": ta ? "முகப்பு" : "Overview",
    "/orders/new": ta ? "புதிய பில்" : "Create invoice",
    "/invoices": ta ? "பில்கள்" : "Invoices",
    "/customers": ta ? "வாடிக்கையாளர்கள்" : "Customers",
    "/products": ta ? "பொருட்கள்" : "Products & stock",
    "/purchases": ta ? "கொள்முதல்" : "Purchases",
    "/reports": ta ? "அறிக்கைகள்" : "Reports",
    "/settings": ta ? "அமைப்புகள்" : "Store settings",
    "/orders": ta ? "ஆர்டர்கள்" : "Orders",
    "/profile": ta ? "சுயவிவரம்" : "Your profile",
    "/manual": ta ? "வழிகாட்டி" : "Store guide",
    "/ai-extraction": ta ? "பில் ஸ்கேன்" : "Scan a bill",
    "/automation": ta ? "தானியக்கம்" : "Automations",
  };
  return (
    <header className="workspace-navbar no-print">
      <div className="breadcrumb">
        <button
          className="icon-button mobile-menu"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>
        <span className="breadcrumb-store">{ta ? "என் கடை" : "My store"}</span>
        <ChevronRight size={14} className="breadcrumb-store" />
        <span>
          {titles[pathname] || (ta ? "பில் விவரம்" : "Invoice details")}
        </span>
      </div>
      <div className="navbar-actions">
        <button className="assistant-button" onClick={onOpenAiAssistant} aria-label={ta ? "AI உதவியாளர்" : "Ask assistant"}>
          <Sparkles size={16} />
          <span>{ta ? "AI உதவியாளர்" : "Ask assistant"}</span>
        </button>
        <span className="navbar-divider" />
        <button className="language-button" onClick={toggleLanguage}>
          <Languages size={16} />
          <span>{ta ? "English" : "தமிழ்"}</span>
        </button>
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link
          to="/manual"
          className="icon-button desktop-help"
          aria-label="Help and guide"
        >
          <BookOpen size={18} />
        </Link>
      </div>
    </header>
  );
};
