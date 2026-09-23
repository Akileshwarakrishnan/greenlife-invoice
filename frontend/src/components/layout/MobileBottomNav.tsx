import { NavLink } from "react-router-dom";
import { Home, Package, Plus, FileText, User } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
export const MobileBottomNav = () => {
  const { language } = useLanguage();
  const ta = language === "ta";
  const items = [
    ["/", ta ? "முகப்பு" : "Home", Home],
    ["/products", ta ? "பொருட்கள்" : "Stock", Package],
    ["/orders/new", ta ? "புதிய பில்" : "New bill", Plus],
    ["/invoices", ta ? "பில்கள்" : "Invoices", FileText],
    ["/profile", ta ? "சுயவிவரம்" : "Profile", User],
  ] as const;
  return (
    <nav className="mobile-dock no-print" aria-label="Mobile navigation">
      {items.map(([to, label, Icon]) => (
        <NavLink
          end={to === "/"}
          to={to}
          key={to}
          className={({ isActive }) =>
            `${isActive ? "active" : ""} ${to === "/orders/new" ? "dock-create" : ""}`
          }
        >
          <span>
            <Icon size={20} strokeWidth={1.7} />
          </span>
          <small>{label}</small>
        </NavLink>
      ))}
    </nav>
  );
};
