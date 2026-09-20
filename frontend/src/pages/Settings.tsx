import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingsApi } from '../services/api';
import { SystemSettings } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  Settings as SettingsIcon,
  Building,
  Workflow,
  Cpu,
  CheckCircle2,
  Save,
  ShieldCheck,
  UserCheck,
  BookOpen,
  ArrowRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Business form state
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [gstin, setGstin] = useState('');
  const [upiId, setUpiId] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');

  const isTamil = language === 'ta';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.get();
      setSettings(res.data);
      const b = res.data.business;
      setBusinessName(b.business_name);
      setTagline(b.business_tagline);
      setAddress(b.business_address);
      setPhone(b.business_phone);
      setEmail(b.business_email);
      setWebsite(b.business_website);
      setGstin(b.business_gstin);
      setUpiId(b.business_upi_id);
      setInvoicePrefix(b.invoice_prefix);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateBusiness({
        business_name: businessName,
        business_tagline: tagline,
        business_address: address,
        business_phone: phone,
        business_email: email,
        business_website: website,
        business_gstin: gstin,
        business_upi_id: upiId,
        invoice_prefix: invoicePrefix,
      });
      setStatusMsg(isTamil ? 'வணிக அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன.' : 'Business configuration updated successfully.');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      alert('Failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs" style={{ color: '#2D6A4F' }}>Loading system configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto" style={{ background: 'transparent' }}>
      <PageHeader
        title={isTamil ? 'அமைப்புகள் & வணிக மேலாண்மை' : 'System & Merchant Settings'}
        subtitle={
          isTamil
            ? 'வணிக விபரங்கள், ஜிஎஸ்டி தகவல், n8n ஆட்டோமேஷன் மற்றும் AI அமைப்புகளை நிர்வகியுங்கள்.'
            : 'Manage merchant entity details, tax identification, n8n webhook web listeners, and AI intelligence engines.'
        }
        badge={isTamil ? 'நிறுவன அமைப்புகள்' : 'Enterprise Settings'}
      />

      {statusMsg && (
        <div className="p-3.5 border text-xs rounded-2xl flex items-center space-x-2" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#2D6A4F' }} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Operational User Manual Banner */}
      <div className="p-6 rounded-2xl shadow-sm space-y-4" style={{ background: '#1B3A2A', color: 'rgba(255,255,255,0.85)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <BookOpen className="w-6 h-6" style={{ color: '#C68B3A' }} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isTamil ? 'கிரீன்லைஃப் செயல்பாட்டு வழிகாட்டி & கையேடு' : 'GreenLife Operations & Service Manual'}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {isTamil
                  ? 'பணியாளர்கள் மற்றும் நிர்வாகிகளுக்கான பயன்பாட்டு வழிமுறைகள் மற்றும் சேவைகள் விபரம்.'
                  : 'Role-based operational guides for Staff and Administrators detailing orders, invoices, calculations, and automations.'}
              </p>
            </div>
          </div>

          <Link
            to="/manual"
            className="flex items-center space-x-2 px-4 py-2 font-bold rounded-xl text-xs shadow-sm transition-all self-start sm:self-auto cursor-pointer"
            style={{ background: '#F7F5EF', color: '#1C1A15' }}
          >
            <span>{isTamil ? 'முழு கையேட்டைத் திற' : 'Open Complete Manual'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border space-y-2" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" style={{ color: '#C68B3A' }} />
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                {isTamil ? 'பணியாளர் பகுதி (Staff Area Usage)' : 'Staff Area Operational Usage'}
              </h4>
            </div>
            <ul className="text-xs space-y-1 text-[11px] leading-relaxed list-disc pl-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <li>{isTamil ? 'ஆர்டர் உள்ளீடு & வாடிக்கையாளர் முந்தைய நிலுவைத் தொகை சரிபார்ப்பு.' : 'Create new orders & auto-retrieve previous customer balance.'}</li>
              <li>{isTamil ? 'நேரலை கட்டணக் கணக்கீடு: ₹600 + ₹400 நிலுவை + ₹60 கொரியர் = ₹1,060.' : 'Live arithmetic calculation (Subtotal + Courier + Balance = Total).'}</li>
              <li>{isTamil ? 'வரி ரசீது அச்சிடுதல் & PDF பதிவிறக்கம்.' : 'Print official tax invoices & download ReportLab PDF sheets.'}</li>
              <li>{isTamil ? 'வாட்ஸ்அப் & மின்னஞ்சல் மூலம் ரசீது அனுப்புதல்.' : 'Send invoices automatically via WhatsApp and Email.'}</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border space-y-2" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" style={{ color: '#C68B3A' }} />
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                {isTamil ? 'நிர்வாகி பகுதி (Admin Area Governance)' : 'Admin Area System Governance'}
              </h4>
            </div>
            <ul className="text-xs space-y-1 text-[11px] leading-relaxed list-disc pl-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <li>{isTamil ? 'பணியாளர் அனுமதிகள் & பயனர் கணக்கு மேலாண்மை (RBAC).' : 'Manage user privileges and staff roles (Admin vs Staff).'}</li>
              <li>{isTamil ? 'தயாரிப்பு விலை நிர்ணயம் & குறைந்த இருப்பு விழிப்பூட்டல்கள்.' : 'Control inventory prices, GST percentages & low-stock alerts.'}</li>
              <li>{isTamil ? 'n8n ஆட்டோமேஷன் வெப்ஹூக்குகள் & மோக் ஃபால்பேக் கட்டுப்பாடு.' : 'Manage 5 n8n pipelines, webhook endpoints & mock fallback.'}</li>
              <li>{isTamil ? 'விற்பனை அறிக்கைகள் & ஒரு-கிளிக் CSV ஏற்றுமதி.' : 'Access aggregated sales statements & 1-click CSV data export.'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Business Information Card */}
      <form
        onSubmit={handleSaveBusiness}
        className="p-6 sm:p-7 rounded-2xl border shadow-xs space-y-6"
        style={{ background: 'white', borderColor: '#EEEAE0' }}
      >
        <div className="flex items-center space-x-2.5 pb-4 border-b" style={{ borderColor: '#EEEAE0' }}>
          <div className="p-2 rounded-xl border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#1C1A15' }}>
              {isTamil ? 'வணிக அடையாளம் & ரசீது அச்சு விபரங்கள்' : 'Merchant Entity & Invoicing Metadata'}
            </h2>
            <p className="text-xs" style={{ color: '#8C8880' }}>
              {isTamil
                ? 'வரி ரசீதுகள் மற்றும் வாடிக்கையாளர் அறிவிப்புகளில் அச்சிடப்படும் தகவல்கள்.'
                : 'Printed on computer-generated tax invoices, payment requests, and transactional notifications.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
              {isTamil ? 'நிறுவனத்தின் பெயர்' : 'Company / Brand Name'}
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-bold focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
              {isTamil ? 'முழக்கம் / வாசகம்' : 'Brand Tagline'}
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
              {isTamil ? 'பதிவு செய்யப்பட்ட முகவரி' : 'Registered Address'}
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
              {isTamil ? 'தொடர்பு கைபேசி எண்' : 'Support Phone'}
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
              {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Billing Email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
              {isTamil ? 'ஜிஎஸ்டி அடையாளம் (GSTIN)' : 'GSTIN Identification'}
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-mono focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
              {isTamil ? 'UPI கட்டண VPA முகவரி' : 'UPI Payment VPA'}
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-medium focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
              {isTamil ? 'ரசீது எண் முன்னொட்டு (Prefix)' : 'Invoice Number Prefix'}
            </label>
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-mono focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t" style={{ borderColor: '#EEEAE0' }}>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 font-semibold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            style={{ background: '#2D6A4F', color: 'white' }}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? (isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (isTamil ? 'அமைப்புகளைச் சேமி' : 'Save Configuration')}</span>
          </button>
        </div>
      </form>

      {/* Automation & AI Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl border shadow-xs space-y-3.5 text-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#EEEAE0' }}>
            <div className="flex items-center space-x-2" style={{ color: '#2D6A4F' }}>
              <Workflow className="w-4 h-4" />
              <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>
                {isTamil ? 'n8n ஆட்டோமேஷன் நிலைகள்' : 'n8n Ingress Webhooks'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
              Active
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#8C8880' }}>Order Webhook:</span>
              <span className="font-mono text-[11px] truncate max-w-[240px]" style={{ color: '#4A4740' }}>
                {settings?.automation.n8n_webhook_url}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#8C8880' }}>Email Webhook:</span>
              <span className="font-mono text-[11px] truncate max-w-[240px]" style={{ color: '#4A4740' }}>
                {settings?.automation.n8n_email_webhook_url}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#8C8880' }}>WhatsApp Webhook:</span>
              <span className="font-mono text-[11px] truncate max-w-[240px]" style={{ color: '#4A4740' }}>
                {settings?.automation.n8n_whatsapp_webhook_url}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl font-medium border flex items-center justify-between" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
            <span>Offline Mock Fallback:</span>
            <span className="font-bold">
              {settings?.automation.mock_fallback ? 'Active & Resilient' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border shadow-xs space-y-3.5 text-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#EEEAE0' }}>
            <div className="flex items-center space-x-2" style={{ color: '#2D6A4F' }}>
              <Cpu className="w-4 h-4" />
              <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>
                {isTamil ? 'AI தொழில்நுட்ப அமைப்பு' : 'AI Intelligence Core'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
              Ready
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#8C8880' }}>Active Provider:</span>
              <span className="font-semibold" style={{ color: '#1C1A15' }}>{settings?.ai.ai_provider.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#8C8880' }}>Deployed Model:</span>
              <span className="font-mono text-[11px]" style={{ color: '#4A4740' }}>{settings?.ai.ai_model}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#8C8880' }}>Gateway URL:</span>
              <span className="font-mono text-[11px] truncate max-w-[240px]" style={{ color: '#4A4740' }}>
                {settings?.ai.ai_base_url}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl font-medium border flex items-center justify-between" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
            <span>Authentication Credential:</span>
            {settings?.ai.ai_api_key_configured ? (
              <span className="font-bold">API Key Provisioned</span>
            ) : (
              <span className="font-medium">Heuristic Local Mock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
