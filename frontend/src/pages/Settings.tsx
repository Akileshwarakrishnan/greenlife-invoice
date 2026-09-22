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
  ExternalLink,
  Percent,
  Landmark,
  Award,
  FileText,
  Copy,
  Check,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Business form state
  const [businessName, setBusinessName] = useState('');
  const [businessNameTa, setBusinessNameTa] = useState('');
  const [proprietor, setProprietor] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [fssai, setFssai] = useState('');
  const [msme, setMsme] = useState('');
  const [gstin, setGstin] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('GLNF');

  const isTamil = language === 'ta';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.get();
      setSettings(res.data);
      const b = res.data.business;
      setBusinessName(b.business_name || 'GREENLIFE NATURAL FOODS');
      setBusinessNameTa(b.business_name_ta || 'கிரீன் லைப் நேச்சுரல் புட்ஸ்');
      setProprietor(b.business_proprietor || 'RVS.Arumugam');
      setTagline(b.business_tagline || '100% தூய இயற்கை & மரச்செக்கு பாரம்பரிய உணவுப் பொருட்கள்');
      setAddress(b.business_address || '64, சத்திரம் வீதி, உடுமலைப்பேட்டை – 642126.');
      setPhone(b.business_phone || '97887 94692');
      setEmail(b.business_email || 'rvs.arumugam@yahoo.com');
      setWebsite(b.business_website || 'www.greenlifefoods.com');
      setFssai(b.business_fssai || '22416495000038');
      setMsme(b.business_msme || 'TN28D0028521');
      setGstin(b.business_gstin || '');
      setBankName(b.business_bank_name || 'SBI BRANCH - UDUMALPET');
      setIfsc(b.business_ifsc || 'SBIN0000944');
      setAccountName(b.business_account_name || 'GREEN LIFE NATURAL FOODS');
      setAccountNumber(b.business_account_number || '35949191474');
      setUpiId(b.business_upi_id || 'greenlife@upi');
      setInvoicePrefix(b.invoice_prefix || 'GLNF');
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
        business_name_ta: businessNameTa,
        business_proprietor: proprietor,
        business_tagline: tagline,
        business_address: address,
        business_phone: phone,
        business_email: email,
        business_website: website,
        business_fssai: fssai,
        business_msme: msme,
        business_gstin: gstin,
        business_bank_name: bankName,
        business_ifsc: ifsc,
        business_account_name: accountName,
        business_account_number: accountNumber,
        business_upi_id: upiId,
        invoice_prefix: invoicePrefix,
      });
      setStatusMsg(isTamil ? 'கடை சுயவிவர அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன.' : 'Shop profile & credentials updated successfully.');
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
        title={isTamil ? 'கடை விபரங்கள் & சுயவிவரம்' : 'Shop Profile & Business Details'}
        subtitle={
          isTamil
            ? 'நமது கிரீன்லைஃப் கடையின் முழு விபரங்கள், அரசு உரிமங்கள், வங்கி கணக்கு மற்றும் அச்சு தகவல்கள்.'
            : 'Complete official shop identity profile, government credentials, SBI bank account, and invoicing metadata.'
        }
        badge={isTamil ? 'அதிகாரப்பூர்வ வணிக விபரம்' : 'Official Shop Identity'}
      />

      {statusMsg && (
        <div className="p-3.5 border text-xs rounded-2xl flex items-center space-x-2 shadow-xs" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#2D6A4F' }} />
          <span className="font-semibold">{statusMsg}</span>
        </div>
      )}

      {/* 🌟 ENTIRE DETAILS ABOUT OUR SHOP - OFFICIAL SHOWCASE CARD 🌟 */}
      <div className="p-6 sm:p-7 rounded-3xl border shadow-sm space-y-5" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: '#EEEAE0' }}>
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-serif text-xl font-bold text-white shadow-sm flex-shrink-0" style={{ background: '#2D6A4F' }}>
              GL
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-lg font-bold font-serif" style={{ color: '#1C1A15' }}>
                  {businessName || 'GREENLIFE NATURAL FOODS'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: '#FDF3E3', color: '#C68B3A', border: '1px solid rgba(198,139,58,0.3)' }}>
                  100% Organic & Wood Pressed
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: '#EBF5EE', color: '#2D6A4F', border: '1px solid #B7D9C4' }}>
                  FSSAI Verified
                </span>
              </div>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#2D6A4F' }}>
                {businessNameTa || 'கிரீன் லைப் நேச்சுரல் புட்ஸ்'}
              </p>
              <p className="text-[11px] italic mt-0.5" style={{ color: '#8C8880' }}>
                "{tagline || '100% தூய இயற்கை & மரச்செக்கு பாரம்பரிய உணவுப் பொருட்கள்'}"
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-start md:self-center">
            <div className="text-right text-[11px]">
              <span className="block text-[10px] uppercase font-semibold" style={{ color: '#8C8880' }}>Proprietor</span>
              <span className="font-bold text-xs" style={{ color: '#1C1A15' }}>{proprietor || 'RVS.Arumugam'}</span>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* FSSAI */}
          <div className="p-3.5 rounded-2xl border flex flex-col justify-between" style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8C8880' }}>FSSAI License</span>
              <Award className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono font-bold text-xs" style={{ color: '#1C1A15' }}>{fssai || '22416495000038'}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(fssai || '22416495000038', 'fssai')}
                className="p-1 rounded-md hover:bg-black/5 transition-all text-[10px] cursor-pointer"
                title="Copy FSSAI"
              >
                {copiedField === 'fssai' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
              </button>
            </div>
          </div>

          {/* MSME Udyam */}
          <div className="p-3.5 rounded-2xl border flex flex-col justify-between" style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8C8880' }}>MSME Udyam</span>
              <FileText className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono font-bold text-xs" style={{ color: '#1C1A15' }}>{msme || 'TN28D0028521'}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(msme || 'TN28D0028521', 'msme')}
                className="p-1 rounded-md hover:bg-black/5 transition-all text-[10px] cursor-pointer"
                title="Copy MSME"
              >
                {copiedField === 'msme' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
              </button>
            </div>
          </div>

          {/* Trade Category */}
          <div className="p-3.5 rounded-2xl border flex flex-col justify-between" style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8C8880' }}>
                {isTamil ? 'வணிக வகை' : 'Trade Category'}
              </span>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold text-xs" style={{ color: '#2D6A4F' }}>
                {isTamil ? 'மரச்செக்கு & இயற்கை உணவு' : '100% Traditional & Organic'}
              </span>
            </div>
          </div>

          {/* UPI ID */}
          <div className="p-3.5 rounded-2xl border flex flex-col justify-between" style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8C8880' }}>UPI Payment VPA</span>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono font-bold text-xs truncate max-w-[140px]" style={{ color: '#1C1A15' }}>{upiId || 'greenlife@upi'}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(upiId || 'greenlife@upi', 'upi')}
                className="p-1 rounded-md hover:bg-black/5 transition-all text-[10px] cursor-pointer"
                title="Copy UPI"
              >
                {copiedField === 'upi' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bank & Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          {/* SBI Bank Card */}
          <div className="p-4 rounded-2xl border space-y-2.5" style={{ background: '#EBF5EE', borderColor: '#B7D9C4' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span className="font-bold text-xs" style={{ color: '#1B3A2A' }}>
                  {isTamil ? 'அதிகாரப்பூர்வ எஸ்பிஐ வங்கி கணக்கு' : 'Official State Bank of India (SBI) Account'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: '#2D6A4F', color: 'white' }}>Current A/C</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-[10px] block" style={{ color: '#4A4740' }}>Account Name:</span>
                <span className="font-semibold text-xs" style={{ color: '#1C1A15' }}>{accountName || 'GREEN LIFE NATURAL FOODS'}</span>
              </div>
              <div>
                <span className="text-[10px] block" style={{ color: '#4A4740' }}>Bank & Branch:</span>
                <span className="font-semibold text-xs" style={{ color: '#1C1A15' }}>{bankName || 'SBI BRANCH - UDUMALPET'}</span>
              </div>
              <div>
                <span className="text-[10px] block" style={{ color: '#4A4740' }}>C/C Account No:</span>
                <div className="flex items-center space-x-1">
                  <span className="font-mono font-bold text-xs" style={{ color: '#1C1A15' }}>{accountNumber || '35949191474'}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accountNumber || '35949191474', 'acct')}
                    className="p-0.5 hover:bg-black/5 rounded cursor-pointer"
                  >
                    {copiedField === 'acct' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3 text-stone-400" />}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[10px] block" style={{ color: '#4A4740' }}>IFSC Code:</span>
                <div className="flex items-center space-x-1">
                  <span className="font-mono font-bold text-xs" style={{ color: '#1C1A15' }}>{ifsc || 'SBIN0000944'}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ifsc || 'SBIN0000944', 'ifsc')}
                    className="p-0.5 hover:bg-black/5 rounded cursor-pointer"
                  >
                    {copiedField === 'ifsc' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3 text-stone-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Address Card */}
          <div className="p-4 rounded-2xl border space-y-2" style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" style={{ color: '#C68B3A' }} />
              <span className="font-bold text-xs" style={{ color: '#1C1A15' }}>
                {isTamil ? 'கடை முகவரி & தொடர்பு' : 'Shop Address & Contacts'}
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed" style={{ color: '#4A4740' }}>
              📍 {address || '64, சத்திரம் வீதி, உடுமலைப்பேட்டை – 642126.'}
            </p>
            <div className="flex items-center space-x-4 pt-1 text-[11px]" style={{ color: '#4A4740' }}>
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" style={{ color: '#2D6A4F' }} />
                <span className="font-semibold">{phone || '97887 94692'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" style={{ color: '#2D6A4F' }} />
                <span className="font-semibold truncate max-w-[170px]">{email || 'rvs.arumugam@yahoo.com'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Operational User Manual Banner */}
      <div className="p-6 rounded-2xl shadow-xs space-y-4" style={{ background: '#1B3A2A', color: 'rgba(255,255,255,0.85)' }}>
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
            className="flex items-center space-x-2 px-4 py-2 font-bold rounded-xl text-xs shadow-xs transition-all self-start sm:self-auto cursor-pointer"
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

      {/* Business Information Edit Form */}
      <form
        onSubmit={handleSaveBusiness}
        className="p-6 sm:p-7 rounded-3xl border shadow-sm space-y-6"
        style={{ background: 'white', borderColor: '#EEEAE0' }}
      >
        <div className="flex items-center space-x-2.5 pb-4 border-b" style={{ borderColor: '#EEEAE0' }}>
          <div className="p-2.5 rounded-2xl border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#1C1A15' }}>
              {isTamil ? 'கடை சுயவிவரம் & அச்சு அமைப்புகளை மாற்று' : 'Edit Shop Profile & Invoicing Credentials'}
            </h2>
            <p className="text-xs" style={{ color: '#8C8880' }}>
              {isTamil
                ? 'பில்கள், ரசீதுகள் மற்றும் வாடிக்கையாளர் அறிவிப்புகளில் பிரதிபலிக்கும் தகவல்களை மாற்றலாம்.'
                : 'Modify identity details, tax IDs, and banking info displayed across printed invoices and receipts.'}
            </p>
          </div>
        </div>

        {/* Section 1: Brand & Ownership */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2D6A4F' }}>
            1. {isTamil ? 'வணிக அடையாளம் & உரிமையாளர்' : 'Brand Identity & Ownership'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'நிறுவனத்தின் பெயர் (English)' : 'Company Name (English)'}
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
                {isTamil ? 'வணிகப் பெயர் (தமிழ்)' : 'Business Name (Tamil)'}
              </label>
              <input
                type="text"
                value={businessNameTa}
                onChange={(e) => setBusinessNameTa(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'உரிமையாளர் பெயர் (Proprietor)' : 'Proprietor Name'}
              </label>
              <input
                type="text"
                value={proprietor}
                onChange={(e) => setProprietor(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'முழக்கம் / விளம்பர வாசகம் (Tagline)' : 'Brand Tagline'}
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address & Contact */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: '#EEEAE0' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2D6A4F' }}>
            2. {isTamil ? 'முகவரி & தொடர்பு விபரங்கள்' : 'Address & Communication'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-3">
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'கடை முகவரி' : 'Registered Address'}
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
                {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Official Email'}
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
                {isTamil ? 'இணையதளம்' : 'Website'}
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Government Licenses & Registrations */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: '#EEEAE0' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2D6A4F' }}>
            3. {isTamil ? 'அரசு உரிமங்கள் & பதிவு எண்கள்' : 'Statutory Licenses & Registrations'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'FSSAI உணவு உரிமம் எண்' : 'FSSAI License No.'}
              </label>
              <input
                type="text"
                value={fssai}
                onChange={(e) => setFssai(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'MSME பதிவு எண்' : 'MSME Registration No.'}
              </label>
              <input
                type="text"
                value={msme}
                onChange={(e) => setMsme(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'ஜிஎஸ்டி எண் (தேவைப்பட்டால்)' : 'GSTIN (Optional)'}
              </label>
              <input
                type="text"
                placeholder={isTamil ? 'விலக்கு அளிக்கப்பட்ட சில்லறை' : 'Exempted / Retail (Optional)'}
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'ரசீது முன்னொட்டு (Prefix)' : 'Invoice Prefix'}
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
        </div>

        {/* Section 4: Bank Details & UPI */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: '#EEEAE0' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2D6A4F' }}>
            4. {isTamil ? 'அதிகாரப்பூர்வ வங்கி கணக்கு & யுபிஐ விபரம்' : 'Settlement Bank & UPI Accounts'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'வங்கி பெயர் & கிளை' : 'Bank & Branch Name'}
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'கணக்கு வைத்திருப்பவர் பெயர்' : 'Account Name'}
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'வங்கி கணக்கு எண் (C/C No.)' : 'Current Account Number'}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'IFSC குறியீடு' : 'IFSC Code'}
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1" style={{ color: '#4A4740' }}>
                {isTamil ? 'UPI கட்டண VPA முகவரி' : 'UPI Payment VPA'}
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t" style={{ borderColor: '#EEEAE0' }}>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer hover:opacity-90"
            style={{ background: '#2D6A4F', color: 'white' }}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? (isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (isTamil ? 'அனைத்து அமைப்புகளையும் சேமி' : 'Save All Shop & Tax Settings')}</span>
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
