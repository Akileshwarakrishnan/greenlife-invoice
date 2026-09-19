import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoiceApi } from '../services/api';
import { Invoice } from '../types';
import { BillTemplate } from '../components/invoice/BillTemplate';
import { useLanguage } from '../context/LanguageContext';
import {
  Printer,
  Download,
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  FileText,
  FileSpreadsheet
} from 'lucide-react';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const isTamil = language === 'ta';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [templateMode, setTemplateMode] = useState<'bill' | 'quotation'>('bill');
  const [loading, setLoading] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoice(Number(id));
    }
  }, [id]);

  const loadInvoice = async (invoiceId: number) => {
    try {
      setLoading(true);
      const res = await invoiceApi.get(invoiceId);
      setInvoice(res.data);
    } catch (err) {
      console.error('Failed to load invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppSend = async () => {
    if (!invoice) return;
    try {
      await invoiceApi.resend(invoice.id, 'whatsapp');
      setNotificationMsg(isTamil ? 'வாட்ஸ்அப் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது!' : 'WhatsApp notification sent successfully!');
      setTimeout(() => setNotificationMsg(null), 4000);
      loadInvoice(invoice.id);
    } catch (err) {
      const phoneDigits = (invoice.customer_phone || '').replace(/\D/g, '');
      const text = encodeURIComponent(
        `வணக்கம் ${invoice.customer_name},\nகிரீன்லைஃப் இயற்கை அங்காடியில் வாங்கியதற்கான பில் எண்: ${invoice.invoice_number}\nமொத்த தொகை: ₹${invoice.grand_total}\nபாக்கி: ₹${invoice.balance_due}\nநன்றி!`
      );
      window.open(`https://wa.me/91${phoneDigits}?text=${text}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#284B35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-[#284B35]">
            {isTamil ? 'பில் ஏற்றப்படுகிறது...' : 'Loading bill...'}
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-10 text-center bg-white rounded-3xl border border-[#C9DFCF] max-w-lg mx-auto">
        <p className="text-base font-black text-slate-800">
          {isTamil ? 'பில் விவரம் கிடைக்கவில்லை.' : 'Invoice not found.'}
        </p>
        <Link
          to="/invoices"
          className="text-xs text-[#284B35] font-black mt-3 inline-block bg-[#E4EFE7] px-4 py-2 rounded-xl"
        >
          {isTamil ? '← பில்கள் பட்டியலுக்குத் திரும்புக' : 'Return to Invoices'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action & Template Switcher Bar (Hidden during Print) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-3xl border border-[#C9DFCF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Back Link & Template Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/invoices"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#E4EFE7] hover:bg-[#D4E8DA] text-[#284B35] rounded-xl text-xs font-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isTamil ? 'பில்கள்' : 'Invoices'}</span>
          </Link>

          {/* Template Mode Switcher */}
          <div className="flex items-center space-x-1 bg-[#E4EFE7] p-1 rounded-2xl border border-[#C9DFCF]">
            <button
              type="button"
              onClick={() => setTemplateMode('bill')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                templateMode === 'bill'
                  ? 'bg-[#284B35] text-white shadow-xs'
                  : 'text-[#284B35] hover:bg-white/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isTamil ? 'விற்பனை ரசீது (Bill)' : 'Cash/Credit Bill'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTemplateMode('quotation')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                templateMode === 'quotation'
                  ? 'bg-[#284B35] text-white shadow-xs'
                  : 'text-[#284B35] hover:bg-white/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isTamil ? 'விலைப்புள்ளி (Quotation)' : 'Quotation'}</span>
            </button>
          </div>
        </div>

        {/* Right: Big Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#284B35] hover:bg-[#1E3827] text-white rounded-2xl text-xs sm:text-sm font-black shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-[#F5C242]" />
            <span>{isTamil ? 'பிரிண்ட் எடுங்க' : 'Print Invoice'}</span>
          </button>

          <button
            onClick={handleWhatsAppSend}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl text-xs sm:text-sm font-black shadow-md cursor-pointer transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isTamil ? 'வாட்ஸ்அப்' : 'WhatsApp'}</span>
          </button>

          <a
            href={invoiceApi.getPdfUrl(invoice.id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-[#E4EFE7] text-[#284B35] border-2 border-[#C9DFCF] rounded-2xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {notificationMsg && (
        <div className="no-print p-4 bg-[#E4EFE7] border-2 border-[#C9DFCF] text-[#284B35] text-sm font-bold rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-[#284B35] flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* RENDER THE OFFICIAL CLIENT BILL / QUOTATION TEMPLATE */}
      <BillTemplate invoice={invoice} mode={templateMode} />
    </div>
  );
};
