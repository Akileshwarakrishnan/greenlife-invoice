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
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#2D6A4F' }}></div>
          <p className="text-sm font-bold" style={{ color: '#2D6A4F' }}>
            {isTamil ? 'பில் ஏற்றப்படுகிறது...' : 'Loading bill...'}
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-10 text-center rounded-3xl border max-w-lg mx-auto" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <p className="text-base font-black" style={{ color: '#1C1A15' }}>
          {isTamil ? 'பில் விவரம் கிடைக்கவில்லை.' : 'Invoice not found.'}
        </p>
        <Link
          to="/invoices"
          className="text-xs font-black mt-3 inline-block px-4 py-2 rounded-xl"
          style={{ background: '#EBF5EE', color: '#2D6A4F' }}
        >
          {isTamil ? '← பில்கள் பட்டியலுக்குத் திரும்புக' : 'Return to Invoices'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-36 sm:pb-16" style={{ background: 'transparent' }}>
      <div className="no-print p-4 sm:p-5 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/invoices"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-colors"
            style={{ background: '#EBF5EE', color: '#2D6A4F' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isTamil ? 'பில்கள்' : 'Invoices'}</span>
          </Link>

          <div className="flex items-center space-x-1 p-1 rounded-2xl border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4' }}>
            <button
              type="button"
              onClick={() => setTemplateMode('bill')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer"
              style={{
                background: templateMode === 'bill' ? '#2D6A4F' : 'transparent',
                color: templateMode === 'bill' ? 'white' : '#2D6A4F'
              }}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isTamil ? 'விற்பனை ரசீது (Bill)' : 'Cash/Credit Bill'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTemplateMode('quotation')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer"
              style={{
                background: templateMode === 'quotation' ? '#2D6A4F' : 'transparent',
                color: templateMode === 'quotation' ? 'white' : '#2D6A4F'
              }}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isTamil ? 'விலைப்புள்ளி (Quotation)' : 'Quotation'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-md cursor-pointer transition-all"
            style={{ background: '#2D6A4F', color: 'white' }}
          >
            <Printer className="w-4 h-4" style={{ color: '#C68B3A' }} />
            <span>{isTamil ? 'பிரிண்ட் எடுங்க' : 'Print Invoice'}</span>
          </button>

          <button
            onClick={handleWhatsAppSend}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-md cursor-pointer transition-all"
            style={{ background: '#2D6A4F', color: 'white' }}
          >
            <MessageSquare className="w-4 h-4" style={{ color: '#C68B3A' }} />
            <span>{isTamil ? 'வாட்ஸ்அப்' : 'WhatsApp'}</span>
          </button>

          <a
            href={invoiceApi.getPdfUrl(invoice.id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-4 py-2.5 border-2 rounded-2xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all"
            style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {notificationMsg && (
        <div className="no-print p-4 border-2 text-sm font-bold rounded-2xl flex items-center space-x-2" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#2D6A4F' }} />
          <span>{notificationMsg}</span>
        </div>
      )}

      <BillTemplate invoice={invoice} mode={templateMode} />
    </div>
  );
};
