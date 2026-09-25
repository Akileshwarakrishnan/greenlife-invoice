import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Leaf,
  Package,
  Plus,
  Printer,
  ReceiptText,
  ScanLine,
  Users,
  Wallet,
  RefreshCw,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { reportApi, invoiceApi } from "../services/api";
import type { DashboardStats, Invoice } from "../types";
import { Badge } from "../components/common/Badge";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

type Period = "daily" | "weekly" | "monthly";
interface RevenuePoint {
  label: string;
  revenue: number;
}
const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const Dashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const ta = language === "ta";
  const root = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [chart, setChart] = useState<RevenuePoint[]>([]);
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chartError, setChartError] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([reportApi.getDashboardStats(), invoiceApi.list({ limit: 5 })])
      .then(([summary, recent]) => {
        if (active) {
          setStats(summary.data);
          setInvoices(recent.data);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);
  useEffect(() => {
    let active = true;
    reportApi
      .getRevenueChart(period)
      .then((res) => {
        if (active) setChart(res.data);
      })
      .catch(() => {
        if (active) setChartError(true);
      })
      .finally(() => {
        if (active) setChartLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period, reload]);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".dashboard-enter", {
          y: 15,
          opacity: 0,
          duration: 0.6,
          stagger: 0.07,
          ease: "power2.out",
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  const retry = () => {
    setLoading(true);
    setError(false);
    setChartLoading(true);
    setChartError(false);
    setReload((n) => n + 1);
  };
  const value = (number: number | undefined, currency = false) =>
    loading
      ? "—"
      : error
        ? "Unavailable"
        : currency
          ? money(number || 0)
          : (number || 0).toLocaleString("en-IN");
  const metrics = [
    {
      label: ta ? "இன்றைய வசூல்" : "Collected today",
      value: value(stats?.today_revenue, true),
      detail: ta ? "இன்றைய விற்பனை வருவாய்" : "Your daily sales revenue",
      icon: Wallet,
      accent: true,
    },
    {
      label: ta ? "இந்த மாத வருவாய்" : "Revenue this month",
      value: value(stats?.this_month_revenue, true),
      detail: ta ? "மாதத்தின் மொத்த விற்பனை" : "A little progress, every day",
      icon: CalendarDays,
    },
    {
      label: ta ? "பாக்கித் தொகை" : "Outstanding balance",
      value: value(stats?.pending_payments, true),
      detail: ta ? "வசூலிக்க வேண்டிய தொகை" : "Customer payments to collect",
      icon: Clock3,
    },
    {
      label: ta ? "மொத்த வாடிக்கையாளர்கள்" : "Your customers",
      value: value(stats?.total_customers),
      detail: ta ? "உங்கள் கடையின் சமூகம்" : "The people behind your growth",
      icon: Users,
    },
  ];
  const hasRevenue = chart.some((point) => point.revenue > 0);
  return (
    <div className="dashboard" ref={root}>
      <section className="dashboard-welcome dashboard-enter">
        <div>
          <p className="eyebrow">
            {ta
              ? "ஒவ்வொரு நாளும், சிறிது வளர்ச்சி."
              : "A LITTLE GROWTH, EVERY DAY."}
          </p>
          <h1>
            {ta ? (
              "உங்கள் கடை, ஒரே பார்வையில்."
            ) : (
              <>
                Your store, <span>at a glance.</span>
              </>
            )}
          </h1>
          <p>
            {ta
              ? `வணக்கம், ${user?.full_name || "நண்பரே"}. இன்றைய வியாபாரத்தைப் பார்க்கலாம்.`
              : `Welcome back, ${user?.full_name?.split(" ")[0] || "there"}. Let’s make room for a good day.`}
          </p>
        </div>
        <div className="welcome-actions">
          <span className="date-label">
            <CalendarDays size={15} />
            {new Date().toLocaleDateString(ta ? "ta-IN" : "en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <Link to="/orders/new" className="primary-button">
            <Plus size={17} />
            {ta ? "புதிய பில்" : "Create invoice"}
          </Link>
        </div>
      </section>
      {error && (
        <div className="form-error" role="alert">
          {ta
            ? "தகவலைப் பெற முடியவில்லை."
            : "We couldn’t load your store data."}
          <button className="text-button" onClick={retry}>
            <RefreshCw size={14} />
            {ta ? "மீண்டும் முயற்சி" : "Try again"}
          </button>
        </div>
      )}
      <section
        className="metrics-grid dashboard-enter"
        aria-label="Store summary"
        aria-busy={loading}
      >
        {metrics.map(
          ({ label, value: display, detail, icon: Icon, accent }) => (
            <article
              key={label}
              className={`metric ${accent ? "metric-primary" : ""}`}
            >
              <div className="metric-top">
                <span>{label}</span>
                <Icon size={18} strokeWidth={1.6} />
              </div>
              <strong>{display}</strong>
              <p>
                <span className="metric-dot" />
                {detail}
              </p>
            </article>
          ),
        )}
      </section>
      <div className="dashboard-middle dashboard-enter">
        <section className="revenue-panel surface">
          <div className="panel-heading">
            <div>
              <h2>{ta ? "விற்பனை வளர்ச்சி" : "A view of your growth"}</h2>
              <p>
                {ta
                  ? "காலப்போக்கில் உங்கள் வருவாய்"
                  : "Your revenue, over time"}
              </p>
            </div>
            <div className="segmented-control" aria-label="Revenue period">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  aria-pressed={period === p}
                  onClick={() => {
                    if (p !== period) {
                      setChartLoading(true);
                      setChartError(false);
                      setPeriod(p);
                    }
                  }}
                  className={period === p ? "active" : ""}
                >
                  {p === "daily"
                    ? ta
                      ? "நாள்"
                      : "Daily"
                    : p === "weekly"
                      ? ta
                        ? "வாரம்"
                        : "Weekly"
                      : ta
                        ? "மாதம்"
                        : "Monthly"}
                </button>
              ))}
            </div>
          </div>
          <div className="revenue-total">
            <strong>
              {chartLoading
                ? "—"
                : chartError
                  ? "—"
                  : money(chart.reduce((sum, point) => sum + point.revenue, 0))}
            </strong>
            <span>
              <i />
              {ta ? "வருவாய்" : "Revenue in this period"}
            </span>
          </div>
          <div className="revenue-chart" aria-busy={chartLoading}>
            {chartError ? (
              <div className="chart-empty">
                {ta
                  ? "வரைபடத்தைப் பெற முடியவில்லை."
                  : "The revenue chart is unavailable."}
                <button className="text-button" onClick={retry}>
                  Retry
                </button>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chart}
                    margin={{ top: 12, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="growth-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#62816b"
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="95%"
                          stopColor="#62816b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--line)"
                      strokeDasharray="3 5"
                    />
                    <XAxis
                    dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      minTickGap={32}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      tickFormatter={(v) => `₹${v}`}
                      domain={hasRevenue ? [0, "auto"] : [0, 1000]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        borderRadius: 10,
                        color: "var(--ink)",
                      }}
                      formatter={(v) => [
                        money(Number(v)),
                        ta ? "வருவாய்" : "Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#678d70"
                      strokeWidth={2.5}
                      fill="url(#growth-fill)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                {!hasRevenue && !chartLoading && (
                  <div className="chart-empty">
                    <span>
                      <Leaf size={21} strokeWidth={1.4} />
                    </span>
                    <strong>
                      {ta
                        ? "வளர்ச்சி இங்கே தொடங்குகிறது"
                        : "Good things start somewhere."}
                    </strong>
                    <p>
                      {ta
                        ? "முதல் விற்பனைக்குப் பிறகு உங்கள் வரைபடம் இங்கே தோன்றும்."
                        : "Your first sale will bring this chart to life."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="chart-footer">
            <span>
              {ta
                ? "ஒவ்வொரு விற்பனையும் முக்கியம்."
                : "Every sale is a small step forward."}
            </span>
            <Link to="/reports">
              {ta ? "அறிக்கைகள்" : "Explore reports"}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
        <aside className="daily-panel">
          <div className="daily-photo">
            <img src="/images/forest.jpg" alt="Sunlit green forest" />
            <span>
              <Leaf size={22} strokeWidth={1.3} />
              <small>
                {ta ? "இயல்பான வளர்ச்சி." : "A natural way to grow."}
              </small>
            </span>
          </div>
          <div className="daily-content">
            <p className="eyebrow">
              {ta ? "சிறிய நினைவூட்டல்" : "A MOMENT FOR YOUR STORE"}
            </p>
            <h2>
              {ta ? "சிறிய கவனம். பெரிய மாற்றம்." : "The little things matter."}
            </h2>
            <Link to="/products" className="daily-task">
              <span className="task-icon">
                <Package size={18} />
              </span>
              <span>
                {ta ? "இருப்பைச் சரிபார்க்க" : "Check your shelves"}
                <small>
                  {loading || error
                    ? "—"
                    : stats?.low_stock_products
                      ? `${stats.low_stock_products} ${ta ? "பொருட்களுக்கு இருப்பு தேவை" : "products running low"}`
                      : ta
                        ? "இருப்பு குறைவு இல்லை"
                        : "No low-stock alerts"}
                </small>
              </span>
              <ArrowUpRight size={17} />
            </Link>
            <Link to="/customers" className="daily-task">
              <span className="task-icon">
                <Users size={18} />
              </span>
              <span>
                {ta ? "வாடிக்கையாளர்களுடன் இணைய" : "Keep in touch"}
                <small>
                  {ta
                    ? "வாடிக்கையாளர் விவரங்களைக் காண்க"
                    : "Review customers & balances"}
                </small>
              </span>
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </aside>
      </div>
      <section className="recent-panel surface dashboard-enter">
        <div className="panel-heading">
          <div>
            <h2>{ta ? "சமீபத்திய பில்கள்" : "Fresh from your counter"}</h2>
            <p>
              {ta
                ? "உங்கள் சமீபத்திய பில்கள், ஒரே இடத்தில்."
                : "Your latest invoices, all in one place."}
            </p>
          </div>
          <Link to="/invoices" className="text-link">
            {ta ? "அனைத்தும்" : "All invoices"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="invoice-empty" role="status">
            {ta ? "பில்கள் ஏற்றப்படுகின்றன…" : "Loading your invoices…"}
          </div>
        ) : error ? (
          <div className="invoice-empty">
            {ta
              ? "பில்களைப் பெற முடியவில்லை."
              : "Your invoices could not be loaded."}
          </div>
        ) : invoices.length === 0 ? (
          <div className="invoice-empty">
            <span className="empty-receipt">
              <ReceiptText size={28} strokeWidth={1.2} />
              <span>
                <Check size={11} />
              </span>
            </span>
            <div>
              <h3>
                {ta
                  ? "உங்கள் முதல் பில்லுக்கு தயார்."
                  : "Ready for your first invoice."}
              </h3>
              <p>
                {ta
                  ? "ஒரு வாடிக்கையாளரைத் தேர்ந்தெடுத்து, சில பொருட்களைச் சேர்க்கவும்."
                  : "Choose a customer, add a few good things, and you’re on your way."}
              </p>
            </div>
            <Link to="/orders/new" className="outline-button">
              {ta ? "பில் உருவாக்க" : "Let’s create one"}
              <Plus size={16} />
            </Link>
          </div>
        ) : (
          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>{ta ? "வாடிக்கையாளர்" : "Customer"}</th>
                  <th>{ta ? "பில்" : "Invoice"}</th>
                  <th>{ta ? "தேதி" : "Date"}</th>
                  <th>{ta ? "நிலை" : "Status"}</th>
                  <th>{ta ? "தொகை" : "Amount"}</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="customer-cell"
                      >
                        <span className="user-avatar">
                          {inv.customer_name?.[0] || "C"}
                        </span>
                        {inv.customer_name}
                      </Link>
                    </td>
                    <td>{inv.invoice_number}</td>
                    <td>{inv.invoice_date}</td>
                    <td>
                      <Badge status={inv.payment_status} />
                    </td>
                    <td className="amount-cell">{money(inv.grand_total)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          aria-label={`Print invoice ${inv.invoice_number}`}
                          onClick={() =>
                            window.open(
                              invoiceApi.getPdfUrl(inv.id),
                              "_blank",
                              "noopener",
                            )
                          }
                        >
                          <Printer size={16} />
                        </button>
                        <Link
                          className="icon-button"
                          aria-label={`View invoice ${inv.invoice_number}`}
                          to={`/invoices/${inv.id}`}
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <div className="workspace-quicklinks dashboard-enter">
        <Link to="/ai-extraction">
          <span className="task-icon">
            <ScanLine size={20} />
          </span>
          <span>
            <strong>
              {ta
                ? "காகிதத்திலிருந்து பணியிடத்திற்கு."
                : "From paper to workspace."}
            </strong>
            <small>
              {ta
                ? "பழைய பில்லை ஸ்கேன் செய்யுங்கள்"
                : "Turn a paper bill into a draft order"}
            </small>
          </span>
          <ArrowRight size={18} />
        </Link>
        <Link to="/products">
          <span className="task-icon">
            <Package size={20} />
          </span>
          <span>
            <strong>
              {ta ? "ஒவ்வொரு பொருளும் கணக்கில்." : "Everything in its place."}
            </strong>
            <small>
              {ta
                ? "பொருட்கள் மற்றும் விலைகளை நிர்வகிக்க"
                : "Manage your products and prices"}
            </small>
          </span>
          <ArrowRight size={18} />
        </Link>
      </div>
      <footer className="workspace-footer">
        <span>
          <Leaf size={14} /> GreenLife Natural Foods
        </span>
        <span>
          {ta
            ? "இயற்கையுடன் வளர்வோம்."
            : "Rooted in nature. Made for your everyday."}
        </span>
      </footer>
    </div>
  );
};
