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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={isTamil ? 'பில்கள் & ரசீதுகள் வரலாறு' : 'Invoices & Billing Ledger'}
        subtitle={isTamil ? 'அனைத்து வாடிக்கையாளர் பில்கள், பிரிண்ட் மற்றும் பாக்கி வசூல் விவரங்கள்' : 'Manage tax invoices, inspect PDF documents, record payments, and print receipts'}
        badge={isTamil ? 'பில் கணக்கு' : 'Billing Ledger'}
        actions={
          <Link
            to="/orders/new"
            className="flex items-center space-x-2 px-5 py-3 bg-[#284B35] hover:bg-[#1E3827] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4 text-[#F5C242]" />
            <span>+ {isTamil ? 'புதிய பில் போடுங்க' : 'Create New Bill'}</span>
          </Link>
        }
      />

      {notificationMsg && (
        <div className="p-4 bg-[#E4EFE7] border-2 border-[#C9DFCF] text-[#284B35] text-sm font-bold rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-[#284B35] flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#C9DFCF] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'பில் எண் அல்லது வாடிக்கையாளர் பெயர்...' : 'Search by bill # or customer name...'}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#284B35] focus:bg-white"
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
                  ? 'bg-[#284B35] text-white shadow-xs'
                  : 'bg-[#E4EFE7] text-[#284B35] hover:bg-[#D4E8DA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List / Cards */}
      <div className="bg-white rounded-3xl border border-[#C9DFCF] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-semibold text-sm">
            {isTamil ? 'பில்கள் ஏற்றப்படுகின்றன...' : 'Loading invoices...'}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-semibold text-sm p-8">
            {isTamil ? 'பில்கள் எதுவும் கிடைக்கவில்லை.' : 'No invoices found.'}
          </div>
        ) : (
          <div className="divide-y divide-[#E4EFE7]">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 sm:p-6 hover:bg-[#F9FCFA] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Bill & Customer Info */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E4EFE7] text-[#284B35] flex items-center justify-center font-black text-base flex-shrink-0">
                    {inv.customer_name ? inv.customer_name[0].toUpperCase() : 'C'}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                        {inv.customer_name}
                      </h3>
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                        #{inv.invoice_number}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                      <span>📞 {inv.customer_phone || 'No phone'}</span>
                      <span>📅 {inv.invoice_date}</span>
                      <span>💳 {inv.payment_method.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Amounts & Actions */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between lg:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                      {isTamil ? 'பில் தொகை' : 'Bill Total'}
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

                  {/* 1-Click Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View */}
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="px-3 py-2 bg-[#E4EFE7] hover:bg-[#D4E8DA] text-[#284B35] font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
                      title={isTamil ? 'பில் விபரம் பார்க்க' : 'View Bill'}
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isTamil ? 'பார்க்க' : 'View'}</span>
                    </Link>

                    {/* Print */}
                    <button
                      type="button"
                      onClick={() => handlePrint(inv.id)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
                      title={isTamil ? 'பிரிண்ட் எடுக்க' : 'Print Invoice'}
                    >
                      <Printer className="w-4 h-4 text-slate-700" />
                      <span>{isTamil ? 'பிரிண்ட்' : 'Print'}</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleWhatsAppSend(inv)}
                      className="px-3 py-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
                      title={isTamil ? 'வாட்ஸ்அப் அனுப்ப' : 'Send WhatsApp'}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>வாட்ஸ்அப்</span>
                    </button>

                    {/* Record Payment Button if due > 0 */}
                    {inv.balance_due > 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(inv)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl flex items-center space-x-1 shadow-sm cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-[#C9DFCF]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-[#284B35]">
                <CreditCard className="w-5 h-5 text-[#284B35]" />
                <h3 className="font-black text-base text-slate-900">
                  {isTamil ? 'பாக்கி பணம் வரவு வைக்க' : 'Record Payment Receipt'}
                </h3>
              </div>
              <button
                onClick={() => setActivePaymentInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#EBF3ED] rounded-2xl text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>{isTamil ? 'வாடிக்கையாளர்:' : 'Customer:'}</span>
                <span className="font-bold text-slate-900">{activePaymentInvoice.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>{isTamil ? 'பில் எண்:' : 'Invoice #:'}</span>
                <span className="font-bold font-mono">#{activePaymentInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between text-amber-800 font-black text-sm pt-1 border-t border-[#C9DFCF]">
                <span>{isTamil ? 'மொத்த பாக்கி:' : 'Balance Due:'}</span>
                <span>₹{activePaymentInvoice.balance_due.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  {isTamil ? 'பெறப்பட்ட தொகை (₹) *' : 'Amount Received (₹) *'}
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  max={activePaymentInvoice.balance_due}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-lg font-black text-[#284B35]"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  {isTamil ? 'செலுத்தும் முறை *' : 'Payment Method *'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl font-bold"
                >
                  <option value="cash">{isTamil ? 'ரொக்கம் (Cash)' : 'Cash'}</option>
                  <option value="upi">{isTamil ? 'GPay / UPI' : 'UPI'}</option>
                  <option value="bank_transfer">{isTamil ? 'வங்கி கணக்கு' : 'Bank Transfer'}</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  {isTamil ? 'குறிப்புகள் (தேவைப்பட்டால்)' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActivePaymentInvoice(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="px-5 py-2.5 bg-[#284B35] hover:bg-[#1E3827] text-white font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60"
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
