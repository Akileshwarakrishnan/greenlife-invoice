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
    <div className="space-y-6 max-w-7xl mx-auto" style={{ background: 'transparent' }}>
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
            className="flex items-center space-x-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            style={{ background: 'white', borderColor: '#EEEAE0', color: '#4A4740' }}
          >
            <Printer className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            <span>{isTamil ? 'கையேட்டை அச்சிடு' : 'Print Manual'}</span>
          </button>
        }
      />

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: '#EEEAE0' }}>
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('staff')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            style={{ background: activeTab === 'staff' ? '#2D6A4F' : 'transparent', color: activeTab === 'staff' ? 'white' : '#4A4740' }}
          >
            <UserCheck className="w-4 h-4" />
            <span>{isTamil ? 'பணியாளர் கையேடு (Staff Area)' : 'Staff Area Manual'}</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            style={{ background: activeTab === 'admin' ? '#2D6A4F' : 'transparent', color: activeTab === 'admin' ? 'white' : '#4A4740' }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isTamil ? 'நிர்வாகி கையேடு (Admin Area)' : 'Admin Area Manual'}</span>
          </button>

          <button
            onClick={() => setActiveTab('arch')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            style={{ background: activeTab === 'arch' ? '#2D6A4F' : 'transparent', color: activeTab === 'arch' ? 'white' : '#4A4740' }}
          >
            <Layers className="w-4 h-4" />
            <span>{isTamil ? 'கட்டமைப்பு & சேவைகள்' : 'Services & Architecture'}</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
            style={{ background: activeTab === 'faq' ? '#2D6A4F' : 'transparent', color: activeTab === 'faq' ? 'white' : '#4A4740' }}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isTamil ? 'கேள்வி & பதில் (FAQ)' : 'Quick FAQ'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5" style={{ color: '#8C8880' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTamil ? 'கையேட்டில் தேடுக...' : 'Search manual topics...'}
            className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs focus:outline-hidden"
            style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
          />
        </div>
      </div>

      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl shadow-sm flex items-start space-x-4" style={{ background: '#1B3A2A', color: 'white' }}>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <UserCheck className="w-6 h-6" style={{ color: '#C68B3A' }} />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isTamil ? 'பணியாளர் செயல்பாட்டு வழிகாட்டி (Staff Operations)' : 'Staff Operational Procedures'}
              </h3>
              <p className="text-xs mt-1 max-w-3xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {isTamil
                  ? 'பணியாளர்கள் வாடிக்கையாளர் ஆர்டர்களை உள்ளீடு செய்தல், முந்தைய நிலுவைத் தொகையைச் சரிபார்த்தல், நேரலை கட்டணக் கணக்கீடு, வரி ரசீதுகளை அச்சிடுதல் மற்றும் கொடுப்பனவுகளைப் பதிவு செய்தல் ஆகியவற்றுக்கான வழிகாட்டுதல்கள்.'
                  : 'Daily workflow guidelines for Store Staff: customer verification, live arithmetic calculation, PDF tax invoice generation, payment capture, and notification dispatch.'}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border shadow-xs space-y-4" style={{ background: 'white', borderColor: '#EEEAE0' }}>
            <div className="flex items-center space-x-2" style={{ color: '#2D6A4F' }}>
              <Calculator className="w-5 h-5" />
              <h4 className="font-bold text-sm">
                {isTamil ? 'படி 1: புதிய ஆர்டர் & நேரலை கட்டணக் கணக்கீடு' : 'Step 1: Order Placement & Exact Real-Time Calculation'}
              </h4>
            </div>

            <div className="text-xs space-y-2 leading-relaxed" style={{ color: '#4A4740' }}>
              <p>
                {isTamil
                  ? 'ஆர்டர் உருவாக்கும் திரையில் (Create Order), வாடிக்கையாளரைத் தேர்ந்தெடுத்தவுடன் அவர்களின் முந்தைய நிலுவைத் தொகை (Previous Balance) தானாகவே காண்பிக்கப்படும்.'
                  : 'When selecting an existing customer on the New Order page, their outstanding previous balance is automatically fetched and locked into the calculation pipeline.'}
              </p>

              <div className="p-4 border rounded-xl space-y-2 font-mono text-[11px]" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#1C1A15' }}>
                <div className="font-bold uppercase tracking-wider text-[10px]" style={{ color: '#2D6A4F' }}>
                  {isTamil ? 'கணக்கீட்டு சூத்திரம் (Financial Formula)' : 'Core Arithmetic Calculation Formula'}
                </div>
                <div>1. Line Item Subtotal = Quantity × Unit Price (Rate per Kg/Liter)</div>
                <div>2. Order Subtotal = Sum of all item amounts</div>
                <div>3. <b>Grand Total</b> = Order Subtotal + Courier Charges + Customer Previous Balance + Tax GST - Discounts</div>
                <div>4. <b>Balance Remaining</b> = Grand Total - Amount Paid Now</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border shadow-xs space-y-4" style={{ background: 'white', borderColor: '#EEEAE0' }}>
            <div className="flex items-center space-x-2" style={{ color: '#2D6A4F' }}>
              <Printer className="w-5 h-5" />
              <h4 className="font-bold text-sm">
                {isTamil ? 'படி 2: கணினி வரி ரசீது (PDF Tax Invoice) அச்சிடுதல்' : 'Step 2: Tax Invoice Printing & PDF Generation'}
              </h4>
            </div>

            <div className="text-xs space-y-2 leading-relaxed" style={{ color: '#4A4740' }}>
              <p>
                {isTamil
                  ? 'ஆர்டர் உறுதி செய்யப்பட்டவுடன், கணினியானது பிரத்யேக வரி ரசீதை (INV-0001) தானாக உருவாக்குகிறது. இதில் கிரீன்லைஃப் லோகோ, வாடிக்கையாளர் முகவரி, ஜிஎஸ்டி மற்றும் UPI QR விபரங்கள் அச்சிடப்படும்.'
                  : 'Upon order confirmation, a sequential GST-compliant Tax Invoice is generated immediately via pure-Python ReportLab, featuring organic GreenLife branding, itemized breakdowns, UPI VPA, and courier details.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl shadow-sm flex items-start space-x-4" style={{ background: '#1B3A2A', color: 'white' }}>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <ShieldCheck className="w-6 h-6" style={{ color: '#C68B3A' }} />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isTamil ? 'நிர்வாகி செயல்பாட்டு வழிகாட்டி (Administrator Operations)' : 'Administrator Governance & Architecture'}
              </h3>
              <p className="text-xs mt-1 max-w-3xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {isTamil
                  ? 'தயாரிப்பு விலை நிர்ணயம், இருப்பு எச்சரிக்கைகள், n8n ஆட்டோமேஷன் பைப்லைன்கள், வணிக அமைப்புகள் மற்றும் நிதி அறிக்கைகளை நிர்வகிப்பதற்கான முழுமையான கையேடு.'
                  : 'Full governance manual for Business Administrators: product catalog, stock thresholds, merchant settings, n8n automation workflows, and financial statements.'}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border shadow-xs space-y-3" style={{ background: 'white', borderColor: '#EEEAE0' }}>
            <div className="flex items-center space-x-2" style={{ color: '#2D6A4F' }}>
              <ShoppingBag className="w-5 h-5" />
              <h4 className="font-bold text-sm">
                {isTamil ? '1. தயாரிப்பு மேலாண்மை & இருப்பு விழிப்பூட்டல்' : '1. Product Catalog & Inventory Thresholds'}
              </h4>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#4A4740' }}>
              {isTamil
                ? 'Products பக்கத்தில் புதிய இயற்கை உணவுப் பொருட்களைச் சேர்க்கலாம். ஒவ்வொரு பொருளுக்கும் "Low Stock Threshold" (குறைந்த இருப்பு அளவு) நிர்ணயிக்க முடியும். இருப்பு குறையும் போது முகப்பில் விழிப்பூட்டல் காட்டப்படும்.'
                : 'Maintain the organic inventory catalog on the Products screen. Each product contains price per unit (kg, liter, bottle), GST tax percentage, and a Low Stock Threshold that alerts the dashboard when inventory dips below minimum safety volume.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'arch' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl shadow-sm flex items-start space-x-4" style={{ background: '#1B3A2A', color: 'white' }}>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Database className="w-6 h-6" style={{ color: '#C68B3A' }} />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isTamil ? 'தொழில்நுட்ப கட்டமைப்பு & சேவைகள்' : 'Enterprise Technology Stack & Service Decoupling'}
              </h3>
              <p className="text-xs mt-1 max-w-3xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {isTamil
                  ? 'React 19, FastAPI, ReportLab, SQLite/PostgreSQL, மற்றும் n8n ஆகியவற்றின் கட்டமைப்பு மற்றும் தடையற்ற இயக்க முறைகள்.'
                  : 'Architectural overview of FastAPI backend, React frontend, pure-Python ReportLab rendering, zero-config database fallbacks, and n8n orchestration.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="p-6 sm:p-8 rounded-2xl border shadow-xs space-y-4" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: '#1C1A15' }}>
            {isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள் (Frequently Asked Questions)' : 'Frequently Asked Questions & Troubleshooting'}
          </h3>

          <div className="space-y-3 text-xs">
            <details className="p-4 border rounded-xl cursor-pointer group" style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}>
              <summary className="font-bold flex items-center justify-between" style={{ color: '#1C1A15' }}>
                <span>{isTamil ? 'கேள்வி: முந்தைய நிலுவைத் தொகை எவ்வாறு கணக்கிடப்படுகிறது?' : 'Q: How does the system compute customer previous balance?'}</span>
                <span className="text-base font-bold transition-transform group-open:rotate-90" style={{ color: '#2D6A4F' }}>›</span>
              </summary>
              <p className="mt-2 leading-relaxed pt-2 border-t" style={{ borderColor: '#EEEAE0', color: '#4A4740' }}>
                {isTamil
                  ? 'பதில்: ஒரு வாடிக்கையாளருக்கு முந்தைய ஆர்டர்களில் செலுத்தப்படாத தொகை இருப்பின், புதிய ஆர்டர் போடும் போது அது தானாகவே கணக்கில் சேர்க்கப்பட்டு, இறுதித் தொகையாக (Grand Total) காண்பிக்கப்படும்.'
                  : 'A: The customer ledger automatically tallies unpaid portions of all previous invoices. When initiating a new order, this balance is retrieved and added to the current order items subtotal and courier charges.'}
              </p>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};
