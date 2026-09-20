import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportApi, invoiceApi, orderApi } from '../services/api';
import { DashboardStats, Invoice } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingBag,
  FileCheck,
  Clock,
  IndianRupee,
  PlusCircle,
  Eye,
  Printer,
  MessageSquare,
  Users,
  Package,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isTamil = language === 'ta';

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadChart(period);
  }, [period]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, invoicesRes] = await Promise.all([
        reportApi.getDashboardStats(),
        invoiceApi.list({ limit: 6 }),
      ]);
      setStats(statsRes.data);
      setRecentInvoices(invoicesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const loadChart = async (p: 'daily' | 'weekly' | 'monthly') => {
    try {
      const res = await reportApi.getRevenueChart(p);
      setChartData(res.data);
    } catch (err) {
      console.error('Failed to load revenue chart:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrint = (invoiceId: number) => {
    window.open(invoiceApi.getPdfUrl(invoiceId), '_blank');
  };

  const handleWhatsAppSend = async (inv: Invoice) => {
    try {
      await invoiceApi.resend(inv.id, 'whatsapp');
      showToast(isTamil ? `பில் ${inv.invoice_number} வாட்ஸ்அப்பில் அனுப்பப்பட்டது!` : `Bill ${inv.invoice_number} sent via WhatsApp!`);
    } catch (err) {
      // Fallback: direct WhatsApp Web link
      const phoneDigits = (inv.customer_phone || '').replace(/\D/g, '');
      const text = encodeURIComponent(
        `வணக்கம் ${inv.customer_name},\nகிரீன்லைஃப் இயற்கை அங்காடியில் வாங்கியதற்கான பில் எண்: ${inv.invoice_number}\nமொத்த தொகை: ₹${inv.grand_total}\nபாக்கி: ₹${inv.balance_due}\nநன்றி!`
      );
      window.open(`https://wa.me/91${phoneDigits}?text=${text}`, '_blank');
    }
  };

  const todayDateString = new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-7 max-w-7xl mx-auto" style={{ background: 'transparent' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-sm font-bold border animate-bounce" style={{ background: '#2D6A4F', color: 'white', borderColor: '#C68B3A' }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: '#C68B3A' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border" style={{ background: '#1B3A2A', color: 'white', borderColor: 'rgba(255,255,255,0.10)' }}>
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full blur-2xl opacity-50 pointer-events-none" style={{ background: '#2D6A4F' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider" style={{ background: '#C68B3A', color: '#1C1A15' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ fill: '#1C1A15' }} />
              <span>{isTamil ? 'கிரீன்லைஃப் இயற்கை அங்காடி' : 'GreenLife Natural Foods'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug" style={{ color: 'white', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {isTamil ? 'வணக்கம்! இன்றைய கடை கணக்கு' : 'Welcome! Store Daily Overview'}
            </h1>

            <p className="text-sm sm:text-base max-w-2xl font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {isTamil
                ? 'இன்றைய விற்பனை, பில்கள் மற்றும் வாடிக்கையாளர் பாக்கி விவரங்களை கீழே எளிதாகக் காணலாம்.'
                : "Easily track today's collections, customer billing, and pending balances."}
            </p>

            <div className="flex items-center space-x-2 text-xs pt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <Calendar className="w-4 h-4" style={{ color: '#C68B3A' }} />
              <span>{todayDateString}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/orders/new"
              className="inline-flex items-center justify-center space-x-3 px-6 py-4 font-black rounded-2xl text-base shadow-lg transition-transform active:scale-95 cursor-pointer"
              style={{ background: '#C68B3A', color: '#1C1A15' }}
            >
              <PlusCircle className="w-6 h-6" style={{ color: '#1C1A15' }} />
              <span>{isTamil ? '+ புதிய பில் போடுங்க' : '+ Create New Bill'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Chunky Store Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/orders/new"
          className="group rounded-3xl p-5 border-2 hover:shadow-md transition-all flex items-center space-x-4 cursor-pointer"
          style={{ background: 'white', borderColor: '#EEEAE0' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
            <PlusCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wide block" style={{ color: '#2D6A4F' }}>
              {isTamil ? 'வேகமான பில்லிங்' : 'Fast Billing'}
            </span>
            <h3 className="text-base sm:text-lg font-black transition-colors leading-tight" style={{ color: '#1C1A15' }}>
              {isTamil ? 'புதிய பில் போடுங்க' : 'Make New Bill'}
            </h3>
            <p className="text-xs font-medium" style={{ color: '#8C8880' }}>
              {isTamil ? 'பொருட்கள் சேர்த்து ரசீது தர' : 'Quick 1-minute billing'}
            </p>
          </div>
        </Link>

        <Link
          to="/customers"
          className="group rounded-3xl p-5 border-2 hover:shadow-md transition-all flex items-center space-x-4 cursor-pointer"
          style={{ background: 'white', borderColor: '#EEEAE0' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0" style={{ background: '#FDF3E3', color: '#C68B3A' }}>
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wide block" style={{ color: '#C68B3A' }}>
              {isTamil ? 'கணக்கு பாக்கி' : 'Pending Dues'}
            </span>
            <h3 className="text-base sm:text-lg font-black transition-colors leading-tight" style={{ color: '#1C1A15' }}>
              {isTamil ? 'வாடிக்கையாளர் பாக்கி' : 'Customer Balances'}
            </h3>
            <p className="text-xs font-medium" style={{ color: '#8C8880' }}>
              {isTamil ? 'பாக்கி வைத்துள்ளோர் பட்டியல்' : 'Check unpaid balances'}
            </p>
          </div>
        </Link>

        <Link
          to="/products"
          className="group rounded-3xl p-5 border-2 hover:shadow-md transition-all flex items-center space-x-4 cursor-pointer"
          style={{ background: 'white', borderColor: '#EEEAE0' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
            <Package className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wide block" style={{ color: '#2D6A4F' }}>
              {isTamil ? 'பொருட்கள் இருப்பு' : 'Inventory'}
            </span>
            <h3 className="text-base sm:text-lg font-black transition-colors leading-tight" style={{ color: '#1C1A15' }}>
              {isTamil ? 'பொருட்கள் & விலை' : 'Products & Prices'}
            </h3>
            <p className="text-xs font-medium" style={{ color: '#8C8880' }}>
              {isTamil ? 'ஸ்டாக் மற்றும் விலை பார்க்க' : 'View stock and prices'}
            </p>
          </div>
        </Link>
      </div>

      {/* 4 Big Friendly Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isTamil ? 'இன்றைய வசூல் பணம்' : "Today's Collections"}
          value={`₹${((stats?.today_revenue ?? stats?.this_month_revenue) || 0).toLocaleString('en-IN')}`}
          subtitle={isTamil ? `மாத வசூல்: ₹${(stats?.this_month_revenue || 0).toLocaleString('en-IN')}` : `Month Total: ₹${(stats?.this_month_revenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          variant="emerald"
        />
        <StatCard
          title={isTamil ? 'இன்றைய பில்கள்' : "Today's Bills"}
          value={`${stats?.total_invoices || 0}`}
          subtitle={isTamil ? `${stats?.paid_invoices || 0} பில்கள் முழு பணம் பெற்றது` : `${stats?.paid_invoices || 0} bills paid in full`}
          icon={FileCheck}
          variant="emerald"
        />
        <StatCard
          title={isTamil ? 'வாடிக்கையாளர் பாக்கி பணம்' : 'Customer Due (பாக்கி)'}
          value={`₹${(stats?.pending_payments || 0).toLocaleString('en-IN')}`}
          subtitle={isTamil ? 'உடனே வசூலிக்க வேண்டியவை' : 'Outstanding dues to collect'}
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title={isTamil ? 'மொத்த வாடிக்கையாளர்கள்' : 'Total Store Customers'}
          value={`${stats?.total_customers || 0}`}
          subtitle={isTamil ? 'பதிவு செய்யப்பட்ட வாடிக்கையாளர்கள்' : 'Registered customer accounts'}
          icon={Users}
          variant="emerald"
        />
      </div>

      {/* Sales Growth Chart */}
      <div className="rounded-3xl p-6 sm:p-7 shadow-xs border" style={{ background: 'white', borderColor: '#EEEAE0', borderRadius: '12px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: '#1C1A15', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {isTamil ? 'விற்பனை வளர்ச்சி விவரம்' : 'Sales & Collection Trend'}
            </h2>
            <p className="text-xs sm:text-sm font-medium" style={{ color: '#8C8880' }}>
              {isTamil ? 'தினசரி மற்றும் வாராந்திர வியாபார வளர்ச்சி வரைபடம்' : 'Daily and weekly store collection overview'}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl border self-start sm:self-auto" style={{ background: '#EEEAE0', borderColor: '#EEEAE0' }}>
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer"
                style={{
                  background: period === p ? '#2D6A4F' : '#EEEAE0',
                  color: period === p ? 'white' : '#1C1A15'
                }}
              >
                {p === 'daily' ? (isTamil ? 'தினசரி' : 'Daily') : p === 'weekly' ? (isTamil ? 'வாராந்திர' : 'Weekly') : (isTamil ? 'மாதாந்திர' : 'Monthly')}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sageRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEAE0" />
              <XAxis
                dataKey="date"
                stroke="#8C8880"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#8C8880"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid #EEEAE0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1C1A15'
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, isTamil ? 'விற்பனை' : 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2D6A4F"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#sageRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Customer Bills */}
      <div className="rounded-3xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0', borderRadius: '12px' }}>
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: '#EEEAE0', background: '#EEEAE0' }}>
          <div>
            <h3 className="font-black text-lg" style={{ color: '#4A4740' }}>
              {isTamil ? 'சமீபத்திய பில்கள் (Recent Customer Bills)' : 'Recent Customer Bills'}
            </h3>
            <p className="text-xs sm:text-sm font-medium" style={{ color: '#4A4740' }}>
              {isTamil ? 'கடைசியாக வாடிக்கையாளர்களுக்கு வழங்கப்பட்ட பில்கள்' : 'Invoices recently issued with 1-click print and WhatsApp sharing'}
            </p>
          </div>

          <Link
            to="/invoices"
            className="inline-flex items-center space-x-1.5 px-4 py-2 font-bold text-xs rounded-xl transition-all self-start sm:self-auto cursor-pointer"
            style={{ background: '#2D6A4F', color: 'white' }}
          >
            <span>{isTamil ? 'அனைத்து பில்களையும் பார்க்க' : 'View All Invoices'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-10 text-center font-semibold text-sm" style={{ color: '#8C8880' }}>
            {isTamil ? 'இதுவரை பில்கள் எதுவும் இல்லை. "+ புதிய பில் போடுங்க" கிளிக் செய்யவும்.' : 'No invoices yet. Click "+ Create New Bill" to make one.'}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#EEEAE0' }}>
            {recentInvoices.map((inv) => {
              const isPaid = inv.payment_status === 'paid';
              return (
                <div
                  key={inv.id}
                  className="p-5 sm:p-6 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15271B] hover:bg-[#F7F5EF] dark:hover:bg-[#1C3324]"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 bg-[#EBF5EE] dark:bg-[#1A3523] text-[#2D6A4F] dark:text-[#52B788]">
                      {inv.customer_name ? inv.customer_name[0].toUpperCase() : 'C'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-base text-[#1C1A15] dark:text-[#F4F7F4]">
                          {inv.customer_name}
                        </h4>
                        <span className="text-xs font-mono font-bold text-[#8C8880] dark:text-[#95AC9B]">
                          #{inv.invoice_number}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1 font-medium text-[#8C8880] dark:text-[#95AC9B]">
                        <span>📞 {inv.customer_phone || 'No phone'}</span>
                        <span>📅 {inv.invoice_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 sm:space-x-6 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold block uppercase tracking-wider text-[#8C8880] dark:text-[#95AC9B]">
                        {isTamil ? 'தொகை' : 'Total'}
                      </span>
                      <span className="text-xl sm:text-2xl font-black block text-[#1C1A15] dark:text-[#F4F7F4]">
                        ₹{inv.grand_total.toLocaleString('en-IN')}
                      </span>
                      {inv.balance_due > 0 && (
                        <span className="text-xs font-bold block text-[#C68B3A] dark:text-[#E2A04A]">
                          {isTamil ? `பாக்கி: ₹${inv.balance_due}` : `Due: ₹${inv.balance_due}`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <Badge status={inv.payment_status} />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="px-3 py-2 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors bg-[#2D6A4F] text-white hover:bg-[#235C42]"
                        title={isTamil ? 'பில் விவரம் பார்க்க' : 'View Bill'}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden md:inline">{isTamil ? 'பார்க்க' : 'View'}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handlePrint(inv.id)}
                        className="px-3 py-2 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors bg-[#EEEAE0] dark:bg-[#1C3324] text-[#4A4740] dark:text-[#D1DDD4] hover:opacity-85"
                        title={isTamil ? 'பில் பிரிண்ட் எடுக்க' : 'Print Invoice'}
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden md:inline">{isTamil ? 'பிரிண்ட்' : 'Print'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWhatsAppSend(inv)}
                        className="px-3 py-2 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors bg-[#25D366] text-white hover:opacity-90"
                        title={isTamil ? 'வாட்ஸ்அப் அனுப்ப' : 'Send WhatsApp'}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden md:inline">{isTamil ? 'வாட்ஸ்அப்' : 'WhatsApp'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
