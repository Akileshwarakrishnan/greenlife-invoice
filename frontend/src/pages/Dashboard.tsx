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
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#284B35] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-sm font-bold border border-[#F5C242] animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#F5C242]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Welcome Banner - Warm Organic Store Greeting */}
      <div className="bg-[#284B35] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-[#1E3827]">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#346845] rounded-full blur-2xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#F5C242] text-[#284B35] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-[#284B35]" />
              <span>{isTamil ? 'கிரீன்லைஃப் இயற்கை அங்காடி' : 'GreenLife Natural Foods'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {isTamil ? 'வணக்கம்! இன்றைய கடை கணக்கு' : 'Welcome! Store Daily Overview'}
            </h1>

            <p className="text-sm sm:text-base text-[#D4E8DA] max-w-2xl font-medium">
              {isTamil
                ? 'இன்றைய விற்பனை, பில்கள் மற்றும் வாடிக்கையாளர் பாக்கி விவரங்களை கீழே எளிதாகக் காணலாம்.'
                : "Easily track today's collections, customer billing, and pending balances."}
            </p>

            <div className="flex items-center space-x-2 text-xs text-[#E4EFE7]/80 pt-1 font-semibold">
              <Calendar className="w-4 h-4 text-[#F5C242]" />
              <span>{todayDateString}</span>
            </div>
          </div>

          {/* Direct Big Quick Action Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/orders/new"
              className="inline-flex items-center justify-center space-x-3 px-6 py-4 bg-[#F5C242] hover:bg-[#E8AA28] text-[#284B35] font-black rounded-2xl text-base shadow-lg shadow-black/10 transition-transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-6 h-6 text-[#284B35]" />
              <span>{isTamil ? '+ புதிய பில் போடுங்க' : '+ Create New Bill'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Chunky Store Action Shortcuts (Dead simple for 55-year-old shop owner) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Action 1: Create Bill */}
        <Link
          to="/orders/new"
          className="group bg-white rounded-3xl p-5 border-2 border-[#C9DFCF] hover:border-[#284B35] hover:shadow-md transition-all flex items-center space-x-4 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#E4EFE7] group-hover:bg-[#284B35] text-[#284B35] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
            <PlusCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#346845] uppercase tracking-wide block">
              {isTamil ? 'வேகமான பில்லிங்' : 'Fast Billing'}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#284B35] transition-colors leading-tight">
              {isTamil ? 'புதிய பில் போடுங்க' : 'Make New Bill'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isTamil ? 'பொருட்கள் சேர்த்து ரசீது தர' : 'Quick 1-minute billing'}
            </p>
          </div>
        </Link>

        {/* Action 2: Customer Due */}
        <Link
          to="/customers"
          className="group bg-white rounded-3xl p-5 border-2 border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all flex items-center space-x-4 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-amber-500 text-amber-800 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide block">
              {isTamil ? 'கணக்கு பாக்கி' : 'Pending Dues'}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-800 transition-colors leading-tight">
              {isTamil ? 'வாடிக்கையாளர் பாக்கி' : 'Customer Balances'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isTamil ? 'பாக்கி வைத்துள்ளோர் பட்டியல்' : 'Check unpaid balances'}
            </p>
          </div>
        </Link>

        {/* Action 3: Products & Stock */}
        <Link
          to="/products"
          className="group bg-white rounded-3xl p-5 border-2 border-[#C9DFCF] hover:border-[#284B35] hover:shadow-md transition-all flex items-center space-x-4 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#E4EFE7] group-hover:bg-[#284B35] text-[#284B35] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#346845] uppercase tracking-wide block">
              {isTamil ? 'பொருட்கள் இருப்பு' : 'Inventory'}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#284B35] transition-colors leading-tight">
              {isTamil ? 'பொருட்கள் & விலை' : 'Products & Prices'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isTamil ? 'ஸ்டாக் மற்றும் விலை பார்க்க' : 'View stock and prices'}
            </p>
          </div>
        </Link>
      </div>

      {/* 4 Big Friendly Metric Cards (with huge numbers and clear Tamil/English labels) */}
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

      {/* Sales Growth Chart (Clean, Warm & Easy to Read) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#C9DFCF] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {isTamil ? 'விற்பனை வளர்ச்சி விவரம்' : 'Sales & Collection Trend'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isTamil ? 'தினசரி மற்றும் வாராந்திர வியாபார வளர்ச்சி வரைபடம்' : 'Daily and weekly store collection overview'}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#E4EFE7] p-1.5 rounded-2xl border border-[#C9DFCF] self-start sm:self-auto">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  period === p
                    ? 'bg-[#284B35] text-white shadow-xs'
                    : 'text-[#284B35] hover:bg-[#D4E8DA]'
                }`}
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
                  <stop offset="5%" stopColor="#284B35" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#284B35" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4EFE7" />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid #C9DFCF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, isTamil ? 'விற்பனை' : 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#284B35"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#sageRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simplified Recent Customer Bills - Senior Friendly with 1-Click Print & WhatsApp */}
      <div className="bg-white rounded-3xl border border-[#C9DFCF] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E4EFE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-slate-900">
              {isTamil ? 'சமீபத்திய பில்கள் (Recent Customer Bills)' : 'Recent Customer Bills'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isTamil ? 'கடைசியாக வாடிக்கையாளர்களுக்கு வழங்கப்பட்ட பில்கள்' : 'Invoices recently issued with 1-click print and WhatsApp sharing'}
            </p>
          </div>

          <Link
            to="/invoices"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#E4EFE7] hover:bg-[#D4E8DA] text-[#284B35] font-bold text-xs rounded-xl transition-all self-start sm:self-auto cursor-pointer"
          >
            <span>{isTamil ? 'அனைத்து பில்களையும் பார்க்க' : 'View All Invoices'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-semibold text-sm">
            {isTamil ? 'இதுவரை பில்கள் எதுவும் இல்லை. "+ புதிய பில் போடுங்க" கிளிக் செய்யவும்.' : 'No invoices yet. Click "+ Create New Bill" to make one.'}
          </div>
        ) : (
          <div className="divide-y divide-[#E4EFE7]">
            {recentInvoices.map((inv) => {
              const isPaid = inv.payment_status === 'paid';
              return (
                <div
                  key={inv.id}
                  className="p-5 sm:p-6 hover:bg-[#F9FCFA] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Customer & Bill details */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#E4EFE7] text-[#284B35] flex items-center justify-center font-black text-base flex-shrink-0">
                      {inv.customer_name ? inv.customer_name[0].toUpperCase() : 'C'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-base text-slate-900">
                          {inv.customer_name}
                        </h4>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{inv.invoice_number}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                        <span>📞 {inv.customer_phone || 'No phone'}</span>
                        <span>📅 {inv.invoice_date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Amount & Status */}
                  <div className="flex items-center space-x-4 sm:space-x-6 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                        {isTamil ? 'தொகை' : 'Total'}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                        ₹{inv.grand_total.toLocaleString('en-IN')}
                      </span>
                      {inv.balance_due > 0 && (
                        <span className="text-xs font-bold text-amber-700 block">
                          {isTamil ? `பாக்கி: ₹${inv.balance_due}` : `Due: ₹${inv.balance_due}`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <Badge status={inv.payment_status} />
                    </div>

                    {/* Right: Senior-Friendly Big Action Buttons (View, Print, WhatsApp) */}
                    <div className="flex items-center space-x-2">
                      {/* View Button */}
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="px-3 py-2 bg-[#E4EFE7] hover:bg-[#D4E8DA] text-[#284B35] font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                        title={isTamil ? 'பில் விவரம் பார்க்க' : 'View Bill'}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden md:inline">{isTamil ? 'பார்க்க' : 'View'}</span>
                      </Link>

                      {/* Print Button */}
                      <button
                        type="button"
                        onClick={() => handlePrint(inv.id)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                        title={isTamil ? 'பில் பிரிண்ட் எடுக்க' : 'Print Invoice'}
                      >
                        <Printer className="w-4 h-4 text-slate-700" />
                        <span className="hidden md:inline">{isTamil ? 'பிரிண்ட்' : 'Print'}</span>
                      </button>

                      {/* WhatsApp Button */}
                      <button
                        type="button"
                        onClick={() => handleWhatsAppSend(inv)}
                        className="px-3 py-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
                        title={isTamil ? 'வாட்ஸ்அப் அனுப்ப' : 'Send WhatsApp'}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden md:inline">வாட்ஸ்அப்</span>
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
