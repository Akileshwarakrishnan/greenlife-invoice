import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoiceApi, paymentApi } from '../services/api';
import { Invoice } from '../types';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Download,
  Eye,
  CreditCard,
  CheckCircle2,
  Printer,
  MessageSquare,
  X,
  FilePlus,
  Clock,
  Check
} from 'lucide-react';

export const Invoices: React.FC = () => {
  const { language, t } = useLanguage();
  const isTamil = language === 'ta';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Record Payment Modal State
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Notification message
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.list({ status: statusFilter || undefined });
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handlePrint = (invoiceId: number) => {
    window.open(invoiceApi.getPdfUrl(invoiceId), '_blank');
  };

  const handleWhatsAppSend = async (inv: Invoice) => {
    try {
      await invoiceApi.resend(inv.id, 'whatsapp');
      showToast(isTamil ? `பில் ${inv.invoice_number} வாட்ஸ்அப்பில் அனுப்பப்பட்டது!` : `Bill ${inv.invoice_number} sent via WhatsApp!`);
    } catch (err) {
      const phoneDigits = (inv.customer_phone || '').replace(/\D/g, '');
      const text = encodeURIComponent(
        `வணக்கம் ${inv.customer_name},\nகிரீன்லைஃப் இயற்கை அங்காடியில் வாங்கியதற்கான பில் எண்: ${inv.invoice_number}\nமொத்த தொகை: ₹${inv.grand_total}\nபாக்கி: ₹${inv.balance_due}\nநன்றி!`
      );
      window.open(`https://wa.me/91${phoneDigits}?text=${text}`, '_blank');
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    setActivePaymentInvoice(inv);
    setPaymentAmount(inv.balance_due);
    setPaymentRef(`CASH-${Date.now().toString().slice(-6)}`);
    setPaymentNotes('கணக்கு நேர் செய்யப்பட்டது (Settled)');
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentInvoice || paymentAmount <= 0) return;

    setPaymentSubmitting(true);
    try {
      await paymentApi.create({
        invoice_id: activePaymentInvoice.id,
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        transaction_reference: paymentRef,
        notes: paymentNotes,
      });
      setActivePaymentInvoice(null);
      showToast(isTamil ? 'பாக்கி பணம் வெற்றிகரமாக வரவு வைக்கப்பட்டது!' : 'Payment recorded successfully!');
      loadInvoices();
    } catch (err: any) {
      alert('Payment failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const s = search.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(s) ||
      inv.customer_name.toLowerCase().includes(s) ||
      inv.customer_phone.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" style={{ background: 'transparent' }}>
      <PageHeader
        title={isTamil ? 'பில்கள் & ரசீதுகள் வரலாறு' : 'Invoices & Billing Ledger'}
        subtitle={isTamil ? 'அனைத்து வாடிக்கையாளர் பில்கள், பிரிண்ட் மற்றும் பாக்கி வசூல் விவரங்கள்' : 'Manage tax invoices, inspect PDF documents, record payments, and print receipts'}
        badge={isTamil ? 'பில் கணக்கு' : 'Billing Ledger'}
        actions={
          <Link
            to="/orders/new"
            className="flex items-center space-x-2 px-5 py-3 font-black rounded-2xl text-xs sm:text-sm transition-all cursor-pointer"
            style={{ background: '#2D6A4F', color: 'white', boxShadow: '0 4px 14px rgba(45,106,79,0.30)' }}
          >
            <FilePlus className="w-4 h-4" style={{ color: '#C68B3A' }} />
            <span>+ {isTamil ? 'புதிய பில் போடுங்க' : 'Create New Bill'}</span>
          </Link>
        }
      />

      {notificationMsg && (
        <div className="p-4 border-2 text-sm font-bold rounded-2xl flex items-center space-x-2" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#2D6A4F' }} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-[#15271B] border border-[#EEEAE0] dark:border-[#233D2B] rounded-2xl shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8880] dark:text-[#95AC9B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'பில் எண் அல்லது வாடிக்கையாளர் பெயர்...' : 'Search by bill # or customer name...'}
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden bg-[#F7F5EF] dark:bg-[#112016] border-[#EEEAE0] dark:border-[#233D2B] text-[#1C1A15] dark:text-[#F4F7F4]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: '', label: isTamil ? 'அனைத்தும்' : 'All Bills' },
            { id: 'pending', label: isTamil ? 'பாக்கி உள்ளவை' : 'Due Only' },
            { id: 'paid', label: isTamil ? 'முழு பணம் பெற்றது' : 'Paid in Full' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'bg-[#EEEAE0] dark:bg-[#1C3324] text-[#4A4740] dark:text-[#D1DDD4] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List / Cards */}
      <div className="border overflow-hidden bg-white dark:bg-[#15271B] border-[#EEEAE0] dark:border-[#233D2B] rounded-2xl shadow-2xs">
        {loading ? (
          <div className="py-16 text-center font-semibold text-sm text-[#8C8880] dark:text-[#95AC9B]">
            {isTamil ? 'பில்கள் ஏற்றப்படுகின்றன...' : 'Loading invoices...'}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center font-semibold text-sm p-8 text-[#8C8880] dark:text-[#95AC9B]">
            {isTamil ? 'பில்கள் எதுவும் கிடைக்கவில்லை.' : 'No invoices found.'}
          </div>
        ) : (
          <div className="divide-y divide-[#EEEAE0] dark:divide-[#233D2B]">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 sm:p-6 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#15271B] max-lg:bg-[#112419]/90 max-lg:backdrop-blur-md max-lg:border max-lg:border-white/10 max-lg:rounded-2xl max-lg:mb-3 hover:bg-[#F7F5EF] dark:hover:bg-[#1C3324]"
              >
                {/* Bill & Customer Info */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 bg-[#EBF5EE] dark:bg-[#1A3523] text-[#2D6A4F] dark:text-[#52B788]">
                    {inv.customer_name ? inv.customer_name[0].toUpperCase() : 'C'}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-[#1C1A15] dark:text-[#F4F7F4]">
                        {inv.customer_name}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#F7F5EF] dark:bg-[#1C3324] text-[#4A4740] dark:text-[#D1DDD4]">
                        #{inv.invoice_number}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1 font-medium text-[#8C8880] dark:text-[#95AC9B]">
                      <span>📞 {inv.customer_phone || 'No phone'}</span>
                      <span>📅 {inv.invoice_date}</span>
                      <span>💳 {inv.payment_method.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Amounts & Actions */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between lg:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold block uppercase tracking-wider text-[#8C8880] dark:text-[#95AC9B]">
                      {isTamil ? 'பில் தொகை' : 'Bill Total'}
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

                  {/* 1-Click Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View */}
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="px-3 py-2 font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors bg-[#EBF5EE] dark:bg-[#1A3523] text-[#2D6A4F] dark:text-[#52B788] hover:opacity-85"
                      title={isTamil ? 'பில் விபரம் பார்க்க' : 'View Bill'}
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isTamil ? 'பார்க்க' : 'View'}</span>
                    </Link>

                    {/* Print */}
                    <button
                      type="button"
                      onClick={() => handlePrint(inv.id)}
                      className="px-3 py-2 font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors bg-[#EEEAE0] dark:bg-[#1C3324] text-[#4A4740] dark:text-[#D1DDD4] hover:opacity-85"
                      title={isTamil ? 'பிரிண்ட் எடுக்க' : 'Print Invoice'}
                    >
                      <Printer className="w-4 h-4" />
                      <span>{isTamil ? 'பிரிண்ட்' : 'Print'}</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleWhatsAppSend(inv)}
                      className="px-3 py-2 font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
                      title={isTamil ? 'வாட்ஸ்அப் அனுப்ப' : 'Send WhatsApp'}
                      style={{ background: '#25D366', color: 'white' }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{isTamil ? 'வாட்ஸ்அப்' : 'WhatsApp'}</span>
                    </button>

                    {/* Record Payment Button if due > 0 */}
                    {inv.balance_due > 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(inv)}
                        className="px-3.5 py-2 font-black text-xs rounded-xl flex items-center space-x-1 shadow-sm cursor-pointer transition-colors"
                        style={{ background: '#C68B3A', color: 'white' }}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isTamil ? 'பாக்கி வசூல்' : 'Pay Due'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {activePaymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28, 26, 21, 0.6)' }}>
          <div className="rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border" style={{ background: 'white', borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#EEEAE0' }}>
              <div className="flex items-center space-x-2" style={{ color: '#2D6A4F' }}>
                <CreditCard className="w-5 h-5" />
                <h3 className="font-black text-base" style={{ color: '#1C1A15' }}>
                  {isTamil ? 'பாக்கி பணம் வரவு வைக்க' : 'Record Payment Receipt'}
                </h3>
              </div>
              <button
                onClick={() => setActivePaymentInvoice(null)}
                className="p-1 rounded-lg cursor-pointer"
                style={{ color: '#8C8880' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl text-xs space-y-1" style={{ background: '#F7F5EF', color: '#4A4740' }}>
              <div className="flex justify-between">
                <span>{isTamil ? 'வாடிக்கையாளர்:' : 'Customer:'}</span>
                <span className="font-bold" style={{ color: '#1C1A15' }}>{activePaymentInvoice.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>{isTamil ? 'பில் எண்:' : 'Invoice #:'}</span>
                <span className="font-bold font-mono">#{activePaymentInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t" style={{ color: '#C68B3A', borderColor: '#EEEAE0' }}>
                <span>{isTamil ? 'மொத்த பாக்கி:' : 'Balance Due:'}</span>
                <span>₹{activePaymentInvoice.balance_due.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'பெறப்பட்ட தொகை (₹) *' : 'Amount Received (₹) *'}
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  max={activePaymentInvoice.balance_due}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border-2 rounded-xl text-lg font-black"
                  style={{ background: 'white', borderColor: '#EEEAE0', color: '#2D6A4F' }}
                />
              </div>

              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'செலுத்தும் முறை *' : 'Payment Method *'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                  style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
                >
                  <option value="cash">{isTamil ? 'ரொக்கம் (Cash)' : 'Cash'}</option>
                  <option value="upi">{isTamil ? 'GPay / UPI' : 'UPI'}</option>
                  <option value="bank_transfer">{isTamil ? 'வங்கி கணக்கு' : 'Bank Transfer'}</option>
                </select>
              </div>

              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'குறிப்புகள் (தேவைப்பட்டால்)' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t" style={{ borderColor: '#EEEAE0' }}>
                <button
                  type="button"
                  onClick={() => setActivePaymentInvoice(null)}
                  className="px-4 py-2.5 font-bold rounded-xl cursor-pointer"
                  style={{ background: '#EEEAE0', color: '#4A4740' }}
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="px-5 py-2.5 font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  style={{ background: '#2D6A4F', color: 'white' }}
                >
                  {paymentSubmitting
                    ? (isTamil ? 'வரவு வைக்கப்படுகிறது...' : 'Processing...')
                    : (isTamil ? 'பணம் வரவு வைக்க' : 'Record Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
