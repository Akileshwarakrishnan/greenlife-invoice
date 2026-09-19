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
    return <div className="p-12 text-center text-xs text-emerald-800">Loading system configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* NEW: Operational User Manual Banner with Admin Area & Staff Area */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isTamil ? 'கிரீன்லைஃப் செயல்பாட்டு வழிகாட்டி & கையேடு' : 'GreenLife Operations & Service Manual'}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {isTamil
                  ? 'பணியாளர்கள் மற்றும் நிர்வாகிகளுக்கான பயன்பாட்டு வழிமுறைகள் மற்றும் சேவைகள் விபரம்.'
                  : 'Role-based operational guides for Staff and Administrators detailing orders, invoices, calculations, and automations.'}
              </p>
            </div>
          </div>

          <Link
            to="/manual"
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-900 font-bold rounded-xl text-xs shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <span>{isTamil ? 'முழு கையேட்டைத் திற' : 'Open Complete Manual'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Admin Area vs Staff Area Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-white/10 rounded-xl border border-white/15 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-200">
              <UserCheck className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider">
                {isTamil ? 'பணியாளர் பகுதி (Staff Area Usage)' : 'Staff Area Operational Usage'}
              </h4>
            </div>
            <ul className="text-xs text-emerald-100/90 space-y-1 text-[11px] leading-relaxed list-disc pl-4">
              <li>{isTamil ? 'ஆர்டர் உள்ளீடு & வாடிக்கையாளர் முந்தைய நிலுவைத் தொகை சரிபார்ப்பு.' : 'Create new orders & auto-retrieve previous customer balance.'}</li>
              <li>{isTamil ? 'நேரலை கட்டணக் கணக்கீடு: ₹600 + ₹400 நிலுவை + ₹60 கொரியர் = ₹1,060.' : 'Live arithmetic calculation (Subtotal + Courier + Balance = Total).'}</li>
              <li>{isTamil ? 'வரி ரசீது அச்சிடுதல் & PDF பதிவிறக்கம்.' : 'Print official tax invoices & download ReportLab PDF sheets.'}</li>
              <li>{isTamil ? 'வாட்ஸ்அப் & மின்னஞ்சல் மூலம் ரசீது அனுப்புதல்.' : 'Send invoices automatically via WhatsApp and Email.'}</li>
            </ul>
          </div>

          <div className="p-4 bg-white/10 rounded-xl border border-white/15 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider">
                {isTamil ? 'நிர்வாகி பகுதி (Admin Area Governance)' : 'Admin Area System Governance'}
              </h4>
            </div>
            <ul className="text-xs text-emerald-100/90 space-y-1 text-[11px] leading-relaxed list-disc pl-4">
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
        className="bg-white p-6 sm:p-7 rounded-2xl border border-emerald-100 shadow-xs space-y-6"
      >
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isTamil ? 'வணிக அடையாளம் & ரசீது அச்சு விபரங்கள்' : 'Merchant Entity & Invoicing Metadata'}
            </h2>
            <p className="text-xs text-slate-500">
              {isTamil
                ? 'வரி ரசீதுகள் மற்றும் வாடிக்கையாளர் அறிவிப்புகளில் அச்சிடப்படும் தகவல்கள்.'
                : 'Printed on computer-generated tax invoices, payment requests, and transactional notifications.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {isTamil ? 'நிறுவனத்தின் பெயர்' : 'Company / Brand Name'}
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {isTamil ? 'முழக்கம் / வாசகம்' : 'Brand Tagline'}
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-600 mb-1">
              {isTamil ? 'பதிவு செய்யப்பட்ட முகவரி' : 'Registered Address'}
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {isTamil ? 'தொடர்பு கைபேசி எண்' : 'Support Phone'}
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Billing Email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {isTamil ? 'ஜிஎஸ்டி அடையாளம் (GSTIN)' : 'GSTIN Identification'}
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {isTamil ? 'UPI கட்டண VPA முகவரி' : 'UPI Payment VPA'}
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {isTamil ? 'ரசீது எண் முன்னொட்டு (Prefix)' : 'Invoice Number Prefix'}
            </label>
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? (isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (isTamil ? 'அமைப்புகளைச் சேமி' : 'Save Configuration')}</span>
          </button>
        </div>
      </form>

      {/* Automation & AI Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* n8n Status */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Workflow className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {isTamil ? 'n8n ஆட்டோமேஷன் நிலைகள்' : 'n8n Ingress Webhooks'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Webhook:</span>
              <span className="font-mono text-slate-700 text-[11px] truncate max-w-[240px]">
                {settings?.automation.n8n_webhook_url}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email Webhook:</span>
              <span className="font-mono text-slate-700 text-[11px] truncate max-w-[240px]">
                {settings?.automation.n8n_email_webhook_url}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">WhatsApp Webhook:</span>
              <span className="font-mono text-slate-700 text-[11px] truncate max-w-[240px]">
                {settings?.automation.n8n_whatsapp_webhook_url}
              </span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50/50 text-emerald-900 rounded-xl font-medium border border-emerald-200/60 flex items-center justify-between">
            <span>Offline Mock Fallback:</span>
            <span className="font-bold text-emerald-700">
              {settings?.automation.mock_fallback ? 'Active & Resilient' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* AI Provider Status */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {isTamil ? 'AI தொழில்நுட்ப அமைப்பு' : 'AI Intelligence Core'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Ready
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Provider:</span>
              <span className="font-semibold text-slate-900">{settings?.ai.ai_provider.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Deployed Model:</span>
              <span className="font-mono text-slate-700 text-[11px]">{settings?.ai.ai_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gateway URL:</span>
              <span className="font-mono text-slate-700 text-[11px] truncate max-w-[240px]">
                {settings?.ai.ai_base_url}
              </span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50/50 text-emerald-900 rounded-xl font-medium border border-emerald-200/60 flex items-center justify-between">
            <span>Authentication Credential:</span>
            {settings?.ai.ai_api_key_configured ? (
              <span className="text-emerald-700 font-bold">API Key Provisioned</span>
            ) : (
              <span className="text-emerald-700/80 font-medium">Heuristic Local Mock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
