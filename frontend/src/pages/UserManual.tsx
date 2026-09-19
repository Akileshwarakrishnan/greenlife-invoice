import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/layout/PageHeader';
import {
  BookOpen,
  UserCheck,
  ShieldCheck,
  Calculator,
  Printer,
  Workflow,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Search,
  CheckCircle2,
  FileText,
  HelpCircle,
  Layers,
  ArrowRight,
  Download,
  PhoneCall,
  Mail,
  Sliders,
  Database
} from 'lucide-react';

export const UserManual: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'staff' | 'admin' | 'arch' | 'faq'>('staff');
  const [searchQuery, setSearchQuery] = useState('');

  const isTamil = language === 'ta';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Print & Quick Actions */}
      <PageHeader
        title={isTamil ? 'கிரீன்லைஃப் செயல்பாட்டு & சேவை கையேடு' : 'GreenLife Operations & Service Manual'}
        subtitle={
          isTamil
            ? 'பணியாளர்கள் மற்றும் நிர்வாகிகளுக்கான விரிவான பயன்பாட்டு வழிகாட்டி: ஆர்டர் செயலாக்கம், கணக்கீட்டு முறைகள், n8n ஆட்டோமேஷன் மற்றும் AI சேவைகள்.'
            : 'Comprehensive operational manual for Staff and Administrators detailing order workflows, financial arithmetic, n8n automation pipelines, and AI intelligence.'
        }
        badge={isTamil ? 'அதிகாரப்பூர்வ கையேடு v1.0' : 'Official Enterprise Manual v1.0'}
        actions={
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>{isTamil ? 'கையேட்டை அச்சிடு' : 'Print Manual'}</span>
          </button>
        }
      />

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{isTamil ? 'பணியாளர் கையேடு (Staff Area)' : 'Staff Area Manual'}</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isTamil ? 'நிர்வாகி கையேடு (Admin Area)' : 'Admin Area Manual'}</span>
          </button>

          <button
            onClick={() => setActiveTab('arch')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'arch'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isTamil ? 'கட்டமைப்பு & சேவைகள்' : 'Services & Architecture'}</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isTamil ? 'கேள்வி & பதில் (FAQ)' : 'Quick FAQ'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTamil ? 'கையேட்டில் தேடுக...' : 'Search manual topics...'}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-emerald-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STAFF AREA MANUAL */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Highlight banner */}
          <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl text-white shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <UserCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isTamil ? 'பணியாளர் செயல்பாட்டு வழிகாட்டி (Staff Operations)' : 'Staff Operational Procedures'}
              </h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-3xl leading-relaxed">
                {isTamil
                  ? 'பணியாளர்கள் வாடிக்கையாளர் ஆர்டர்களை உள்ளீடு செய்தல், முந்தைய நிலுவைத் தொகையைச் சரிபார்த்தல், நேரலை கட்டணக் கணக்கீடு, வரி ரசீதுகளை அச்சிடுதல் மற்றும் கொடுப்பனவுகளைப் பதிவு செய்தல் ஆகியவற்றுக்கான வழிகாட்டுதல்கள்.'
                  : 'Daily workflow guidelines for Store Staff: customer verification, live arithmetic calculation, PDF tax invoice generation, payment capture, and notification dispatch.'}
              </p>
            </div>
          </div>

          {/* Step 1: Order Creation & Arithmetic */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm">
                {isTamil ? 'படி 1: புதிய ஆர்டர் & நேரலை கட்டணக் கணக்கீடு' : 'Step 1: Order Placement & Exact Real-Time Calculation'}
              </h4>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                {isTamil
                  ? 'ஆர்டர் உருவாக்கும் திரையில் (Create Order), வாடிக்கையாளரைத் தேர்ந்தெடுத்தவுடன் அவர்களின் முந்தைய நிலுவைத் தொகை (Previous Balance) தானாகவே காண்பிக்கப்படும்.'
                  : 'When selecting an existing customer on the New Order page, their outstanding previous balance is automatically fetched and locked into the calculation pipeline.'}
              </p>

              {/* Exact Formula Box */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 font-mono text-[11px] text-emerald-950">
                <div className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                  {isTamil ? 'கணக்கீட்டு சூத்திரம் (Financial Formula)' : 'Core Arithmetic Calculation Formula'}
                </div>
                <div>
                  1. Line Item Subtotal = Quantity × Unit Price (Rate per Kg/Liter)
                </div>
                <div>
                  2. Order Subtotal = Sum of all item amounts
                </div>
                <div>
                  3. <b>Grand Total</b> = Order Subtotal + Courier Charges + Customer Previous Balance + Tax GST - Discounts
                </div>
                <div>
                  4. <b>Balance Remaining</b> = Grand Total - Amount Paid Now
                </div>
              </div>

              {/* Concrete Example */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-800 text-xs">
                  {isTamil ? 'உதாரண கணக்கீடு (Prompt Reference Example):' : 'Verified Production Example:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
                  <div>• 3 kg Marachekku Groundnut Oil @ ₹200/kg = <b>₹600.00</b></div>
                  <div>• Previous Balance = <b>₹400.00</b></div>
                  <div>• Courier Charges = <b>₹60.00</b></div>
                  <div>• Total Grand Amount = <b>₹1,060.00</b></div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Invoices & PDF */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Printer className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm">
                {isTamil ? 'படி 2: கணினி வரி ரசீது (PDF Tax Invoice) அச்சிடுதல்' : 'Step 2: Tax Invoice Printing & PDF Generation'}
              </h4>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                {isTamil
                  ? 'ஆர்டர் உறுதி செய்யப்பட்டவுடன், கணினியானது பிரத்யேக வரி ரசீதை (INV-0001) தானாக உருவாக்குகிறது. இதில் கிரீன்லைஃப் லோகோ, வாடிக்கையாளர் முகவரி, ஜிஎஸ்டி மற்றும் UPI QR விபரங்கள் அச்சிடப்படும்.'
                  : 'Upon order confirmation, a sequential GST-compliant Tax Invoice is generated immediately via pure-Python ReportLab, featuring organic GreenLife branding, itemized breakdowns, UPI VPA, and courier details.'}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <b>{isTamil ? 'நேரடி அச்சு (Print Invoice):' : 'Browser Print:'}</b>{' '}
                  {isTamil ? 'ரசீது பக்கத்தில் Print பொத்தானை அழுத்தினால் நேரடியாக அச்சுப்பொறிக்கு அனுப்பலாம்.' : 'Click "Print Invoice" on any invoice view for an executive A4 printable sheet.'}
                </li>
                <li>
                  <b>{isTamil ? 'PDF பதிவிறக்கம் (Download PDF):' : 'Download Vector PDF:'}</b>{' '}
                  {isTamil ? 'Download PDF பொத்தான் மூலம் வாடிக்கையாளருக்கு அனுப்பக்கூடிய PDF கோப்பை பதிவிறக்கலாம்.' : 'Click "Download PDF" to save the high-resolution vector PDF file locally.'}
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3: Payments & Notifications */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm">
                {isTamil ? 'படி 3: பணம் பெறுதல் & வாடிக்கையாளர் அறிவிப்புகள்' : 'Step 3: Recording Payments & Automated Customer Notifications'}
              </h4>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                {isTamil
                  ? 'வாடிக்கையாளர் UPI, GPay, ரொக்கம் அல்லது வங்கி மூலம் பணம் செலுத்தியவுடன், Invoices பக்கத்தில் உள்ள "Record Payment" பொத்தானை அழுத்தி பதிவிடுங்கள். இதன் மூலம் நிலுவைத் தொகை உடனடியாகக் குறையும்.'
                  : 'Capture customer settlements directly via the "Record Payment" modal on the Invoices ledger. Supports UPI, GPay, Cash, and Bank Transfer with transaction reference numbers.'}
              </p>
              <p>
                {isTamil
                  ? 'ரசீதை வாடிக்கையாளரின் வாட்ஸ்அப் அல்லது மின்னஞ்சலுக்கு மீண்டும் அனுப்ப "Resend" பொத்தானை அழுத்தலாம். n8n ஆட்டோமேஷன் மூலம் சில நொடிகளில் வாடிக்கையாளருக்கு சென்றுவிடும்.'
                  : 'Trigger instant customer re-delivery via WhatsApp Cloud API or SMTP Email via the "Resend" action. The n8n automation engine dispatches the payload in real-time.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADMIN AREA MANUAL */}
      {/* ========================================================================= */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl text-white shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isTamil ? 'நிர்வாகி செயல்பாட்டு வழிகாட்டி (Administrator Operations)' : 'Administrator Governance & Architecture'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {isTamil
                  ? 'தயாரிப்பு விலை நிர்ணயம், இருப்பு எச்சரிக்கைகள், n8n ஆட்டோமேஷன் பைப்லைன்கள், வணிக அமைப்புகள் மற்றும் நிதி அறிக்கைகளை நிர்வகிப்பதற்கான முழுமையான கையேடு.'
                  : 'Full governance manual for Business Administrators: product catalog, stock thresholds, merchant settings, n8n automation workflows, and financial statements.'}
              </p>
            </div>
          </div>

          {/* Section 1: Products & Stock */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm">
                {isTamil ? '1. தயாரிப்பு மேலாண்மை & இருப்பு விழிப்பூட்டல்' : '1. Product Catalog & Inventory Thresholds'}
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isTamil
                ? 'Products பக்கத்தில் புதிய இயற்கை உணவுப் பொருட்களைச் சேர்க்கலாம். ஒவ்வொரு பொருளுக்கும் "Low Stock Threshold" (குறைந்த இருப்பு அளவு) நிர்ணயிக்க முடியும். இருப்பு குறையும் போது முகப்பில் விழிப்பூட்டல் காட்டப்படும்.'
                : 'Maintain the organic inventory catalog on the Products screen. Each product contains price per unit (kg, liter, bottle), GST tax percentage, and a Low Stock Threshold that alerts the dashboard when inventory dips below minimum safety volume.'}
            </p>
          </div>

          {/* Section 2: n8n Automation Workflows */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-emerald-900">
              <Workflow className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm">
                {isTamil ? '2. n8n ஆட்டோமேஷன் பைப்லைன்கள் (5 Workflows)' : '2. n8n Workflow Automation Pipelines'}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-1">
                <div className="font-bold text-emerald-900">01. Order Processing</div>
                <p className="text-slate-600 text-[11px]">
                  {isTamil ? 'ஆர்டர் உருவானதும் ரசீது கணக்கீடு மற்றும் தகவல்களை ஒருங்கிணைக்கிறது.' : 'Triggered on order placement; coordinates PDF generation, customer updates, and notification routing.'}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-1">
                <div className="font-bold text-emerald-900">02. Email Invoice Delivery</div>
                <p className="text-slate-600 text-[11px]">
                  {isTamil ? 'PDF ரசீதை இணைத்து வாடிக்கையாளருக்கு மின்னஞ்சல் அனுப்புகிறது.' : 'Generates responsive HTML email and transmits the ReportLab PDF invoice via SMTP.'}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-1">
                <div className="font-bold text-emerald-900">03. WhatsApp Notification</div>
                <p className="text-slate-600 text-[11px]">
                  {isTamil ? 'வாட்ஸ்அப் மூலம் தொகையைத் தெரிவித்து UPI கட்டண இணைப்பை அனுப்புகிறது.' : 'Formats customer greeting, invoice balance, and UPI payment link via WhatsApp Cloud API.'}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-1">
                <div className="font-bold text-emerald-900">04. AI Invoice Extraction</div>
                <p className="text-slate-600 text-[11px]">
                  {isTamil ? 'பழைய ரசீதுகளைப் புகைப்படம் எடுத்து பதிவேற்றினால் தானாகப் பிரிக்கிறது.' : 'Processes uploaded scanned receipts through multimodal vision OCR into draft orders.'}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-1 sm:col-span-2">
                <div className="font-bold text-emerald-900">05. Error Handler & Dead Letter Queue (DLQ)</div>
                <p className="text-slate-600 text-[11px]">
                  {isTamil ? 'ஏதேனும் பிழை ஏற்பட்டால் ஆர்டரை இழக்காமல் நிர்வாகிக்குத் தகவல் தெரிவிக்கிறது.' : 'Catches network timeouts or external failures, records error logs, and alerts administration without losing customer transactions.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Business Settings */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm">
                {isTamil ? '3. வணிக அடையாளம் & ஜிஎஸ்டி அமைப்புகள்' : '3. Merchant Settings, GSTIN & UPI Payment VPA'}
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isTamil
                ? 'Settings திரையில் நிறுவனத்தின் பெயர், முகவரி, ஜிஎஸ்டி எண் (GSTIN), மற்றும் UPI VPA (உதா: greenlife@okaxis) ஆகியவற்றை மாற்றியமைக்கலாம். இங்கு மாற்றப்படும் விபரங்கள் உடனடியாக அனைத்து ரசீதுகளிலும் தோன்றும்.'
                : 'Configure merchant details in Settings: Company Name, Registered Address, Support Phone, GSTIN Identification, UPI Payment VPA, and sequential invoice numbering prefix (e.g., INV). Changes immediately reflect on generated PDF invoices.'}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SERVICES & ARCHITECTURE */}
      {/* ========================================================================= */}
      {activeTab === 'arch' && (
        <div className="space-y-6">
          <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl text-white shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Database className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isTamil ? 'தொழில்நுட்ப கட்டமைப்பு & சேவைகள்' : 'Enterprise Technology Stack & Service Decoupling'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {isTamil
                  ? 'React 19, FastAPI, ReportLab, SQLite/PostgreSQL, மற்றும் n8n ஆகியவற்றின் கட்டமைப்பு மற்றும் தடையற்ற இயக்க முறைகள்.'
                  : 'Architectural overview of FastAPI backend, React frontend, pure-Python ReportLab rendering, zero-config database fallbacks, and n8n orchestration.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">FastAPI Python Backend</h4>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                High-performance asynchronous Python 3.12+ engine running on port 8000. Houses arithmetic calculations, JWT token verification, and ORM database sessions.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">ReportLab Pure-Python Engine</h4>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Generates crisp vector PDF tax invoices in-memory without requiring external GTK3 or Cairo C libraries, ensuring cross-platform stability on Windows and Linux.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">n8n Automation & Fallback</h4>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Automates email attachments and WhatsApp messaging. Includes a zero-crash mock fallback allowing full offline testing when external n8n instances are unreachable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QUICK FAQ */}
      {/* ========================================================================= */}
      {activeTab === 'faq' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-emerald-950 uppercase tracking-wider mb-4">
            {isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள் (Frequently Asked Questions)' : 'Frequently Asked Questions & Troubleshooting'}
          </h3>

          <div className="space-y-3 text-xs">
            <details className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-xl cursor-pointer group">
              <summary className="font-bold text-slate-900 flex items-center justify-between">
                <span>{isTamil ? 'கேள்வி: முந்தைய நிலுவைத் தொகை எவ்வாறு கணக்கிடப்படுகிறது?' : 'Q: How does the system compute customer previous balance?'}</span>
                <span className="text-emerald-700 text-base font-bold group-open:rotate-90 transition-transform">›</span>
              </summary>
              <p className="mt-2 text-slate-600 leading-relaxed pt-2 border-t border-emerald-100">
                {isTamil
                  ? 'பதில்: ஒரு வாடிக்கையாளருக்கு முந்தைய ஆர்டர்களில் செலுத்தப்படாத தொகை இருப்பின், புதிய ஆர்டர் போடும் போது அது தானாகவே கணக்கில் சேர்க்கப்பட்டு, இறுதித் தொகையாக (Grand Total) காண்பிக்கப்படும்.'
                  : 'A: The customer ledger automatically tallies unpaid portions of all previous invoices. When initiating a new order, this balance is retrieved and added to the current order items subtotal and courier charges.'}
              </p>
            </details>

            <details className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-xl cursor-pointer group">
              <summary className="font-bold text-slate-900 flex items-center justify-between">
                <span>{isTamil ? 'கேள்வி: n8n ஆட்டோமேஷன் சர்வர் இயங்காத போது என்ன நிகழும்?' : 'Q: What happens if the n8n server is offline?'}</span>
                <span className="text-emerald-700 text-base font-bold group-open:rotate-90 transition-transform">›</span>
              </summary>
              <p className="mt-2 text-slate-600 leading-relaxed pt-2 border-t border-emerald-100">
                {isTamil
                  ? 'பதில்: கிரீன்லைஃப் அமைப்பில் தானியங்கி மோக் ஃபால்பேக் (Mock Fallback) உள்ளது. n8n இயங்காவிட்டாலும் கூட ஆர்டர்கள் மற்றும் ரசீதுகள் வெற்றிகரமாக உருவாகிவிடும், எந்தத் தடங்கலும் ஏற்படாது.'
                  : 'A: The backend features an automatic resilient mock fallback. If n8n webhooks do not respond within 2 seconds, the order and invoice save safely and a diagnostic log is recorded without interrupting the user.'}
              </p>
            </details>

            <details className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-xl cursor-pointer group">
              <summary className="font-bold text-slate-900 flex items-center justify-between">
                <span>{isTamil ? 'கேள்வி: மொழியை மாற்றியமைப்பது எப்படி?' : 'Q: How to switch between Tamil and English?'}</span>
                <span className="text-emerald-700 text-base font-bold group-open:rotate-90 transition-transform">›</span>
              </summary>
              <p className="mt-2 text-slate-600 leading-relaxed pt-2 border-t border-emerald-100">
                {isTamil
                  ? 'பதில்: திரையின் மேல் பகுதியில் உள்ள "தமிழ் | EN" பொத்தானை அழுத்தினால் முழு பயன்பாடும் உடனடியாகத் தமிழில் அல்லது ஆங்கிலத்தில் மாறும்.'
                  : 'A: Simply click the "EN | தமிழ்" language toggle located on the top navigation bar. The entire interface, menus, buttons, and manual dynamically update instantly.'}
              </p>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};
