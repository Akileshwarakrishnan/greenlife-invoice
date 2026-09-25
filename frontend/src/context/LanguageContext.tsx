import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Brand & Header
  'brand.name': {
    en: 'GreenLife Natural Foods',
    ta: 'கிரீன்லைஃப் இயற்கை உணவுகள்',
  },
  'brand.tagline': {
    en: 'Traditional Cold Pressed Oils & Pure Organic Store',
    ta: 'மரச்செக்கு எண்ணெய் & பாரம்பரிய இயற்கை அங்காடி',
  },
  'brand.portal': {
    en: 'Simple Store Billing & Customer Book',
    ta: 'எளிய பில்லிங் & வாடிக்கையாளர் கணக்கு புத்தகம்',
  },

  // Navigation (Simple 5 core items)
  'nav.dashboard': { en: 'Home', ta: 'முகப்பு' },
  'nav.new_order': { en: 'Create Bill', ta: 'புதிய பில்' },
  'nav.orders': { en: 'Orders', ta: 'ஆர்டர்கள்' },
  'nav.invoices': { en: 'Bills List', ta: 'பில்கள்' },
  'nav.customers': { en: 'Customers', ta: 'வாடிக்கையாளர்கள்' },
  'nav.products': { en: 'Products & Stock', ta: 'பொருட்கள்' },
  'nav.reports': { en: 'Sales Summary', ta: 'விற்பனை கணக்கு' },
  'nav.ai_extract': { en: 'Scan Paper Bill', ta: 'பில் ஸ்கேன்' },
  'nav.automation': { en: 'Message Service', ta: 'செய்தி சேவை' },
  'nav.manual': { en: 'How to Use', ta: 'பயன்பாட்டு வழிகாட்டி' },
  'nav.settings': { en: 'Store Settings', ta: 'அமைப்புகள்' },
  'nav.profile': { en: 'My Profile', ta: 'சுயவிவரம்' },
  'nav.more': { en: 'More Tools', ta: 'கூடுதல்' },
  'nav.logout': { en: 'Sign Out', ta: 'வெளியேறு' },
  'nav.ai_assistant': { en: 'Store Assistant', ta: 'உதவியாளர்' },

  // Role Badges
  'role.admin': { en: 'Owner / Admin', ta: 'கடை உரிமையாளர்' },
  'role.staff': { en: 'Billing Staff', ta: 'பில் போடுபவர்' },

  // Common Actions
  'action.search': { en: 'Search by name or phone...', ta: 'பெயர் அல்லது போன் நம்பர் தேடுக...' },
  'action.filter': { en: 'Filter', ta: 'வடிகட்டு' },
  'action.save': { en: 'Save', ta: 'சேமிக்க' },
  'action.cancel': { en: 'Cancel', ta: 'ரத்து செய்' },
  'action.delete': { en: 'Delete', ta: 'நீக்கு' },
  'action.edit': { en: 'Edit', ta: 'மாற்று' },
  'action.view': { en: 'View Bill', ta: 'பில் பார்க்க' },
  'action.print': { en: 'Print Bill', ta: 'பில் பிரிண்ட்' },
  'action.download_pdf': { en: 'Download Bill (PDF)', ta: 'பில் பதிவிறக்கு' },
  'action.whatsapp': { en: 'Send WhatsApp', ta: 'வாட்ஸ்அப் அனுப்பு' },
  'action.resend_invoice': { en: 'Resend Bill', ta: 'மீண்டும் அனுப்பு' },
  'action.add_item': { en: '+ Add Item', ta: '+ பொருள் சேர்' },
  'action.calculate': { en: 'Calculate', ta: 'கணக்கிடு' },
  'action.record_payment': { en: 'Receive Money', ta: 'பணம் வரவு வை' },
  'action.create_invoice': { en: 'Generate Bill', ta: 'பில் போடுங்க' },
  'action.export_csv': { en: 'Download Excel', ta: 'எக்செல் பதிவிறக்கு' },
  'action.retry': { en: 'Retry', ta: 'மீண்டும் செய்' },
  'action.refresh': { en: 'Refresh', ta: 'புதுப்பி' },
  'action.close': { en: 'Close', ta: 'மூடு' },

  // Dashboard Metrics (Easy for 55-year-old)
  'dash.overview': { en: "Today's Store Summary", ta: 'இன்றைய கடை கணக்கு விவரம்' },
  'dash.subtitle': {
    en: 'Quick view of today sales, customer balances, and simple billing.',
    ta: 'இன்றைய விற்பனை, வர வேண்டிய பாக்கி பணம் மற்றும் புதிய பில் போடும் வசதி.',
  },
  'dash.total_orders': { en: "Today's Bills", ta: 'இன்றைய பில்கள்' },
  'dash.invoices_issued': { en: 'Bills Given', ta: 'வழங்கிய பில்கள்' },
  'dash.pending_balance': { en: 'Customer Due (பாக்கி)', ta: 'வாடிக்கையாளர் பாக்கி பணம்' },
  'dash.month_revenue': { en: 'Today Collections', ta: 'இன்றைய வசூல் பணம்' },
  'dash.revenue_trend': { en: 'Sales Growth', ta: 'விற்பனை வளர்ச்சி' },
  'dash.recent_orders': { en: 'Recent Customer Bills', ta: 'சமீபத்திய பில்கள்' },
  'dash.recent_invoices': { en: 'Latest Invoices', ta: 'கடைசி பில்கள்' },

  // New Order / Billing Page (1-2-3 Simple Steps)
  'order.title': { en: 'Create Customer Bill', ta: 'புதிய பில் போடுங்க' },
  'order.subtitle': {
    en: 'Step 1: Choose Customer -> Step 2: Pick Products -> Step 3: Print & WhatsApp Bill',
    ta: 'படி 1: வாடிக்கையாளர் -> படி 2: பொருட்கள் -> படி 3: பில் அச்சிட்டு வாட்ஸ்அப் அனுப்பு',
  },
  'order.step1': { en: 'Step 1: Customer Details', ta: 'படி 1: வாடிக்கையாளர் விவரம்' },
  'order.step2': { en: 'Step 2: Select Products Bought', ta: 'படி 2: வாங்கிய பொருட்கள்' },
  'order.step3': { en: 'Step 3: Bill Total & Payment', ta: 'படி 3: பில் தொகை & பணம்' },
  'order.select_customer': { en: 'Select Customer', ta: 'வாடிக்கையாளரைத் தேர்வுசெய்' },
  'order.items': { en: 'Selected Items', ta: 'பொருட்கள் பட்டியல்' },
  'order.product': { en: 'Product Name', ta: 'பொருள்' },
  'order.qty': { en: 'Qty (அளவு)', ta: 'அளவு' },
  'order.unit': { en: 'Unit', ta: 'அலகு' },
  'order.price': { en: 'Price (விலை)', ta: 'விலை (₹)' },
  'order.total': { en: 'Total', ta: 'தொகை (₹)' },
  'order.courier': { en: 'Courier / Delivery (₹)', ta: 'கொரியர் கட்டணம் (₹)' },
  'order.previous_balance': { en: 'Old Pending Balance (₹)', ta: 'பழைய பாக்கி தொகை (₹)' },
  'order.subtotal': { en: 'Products Total', ta: 'பொருட்கள் மட்டும்' },
  'order.grand_total': { en: 'Final Bill Amount', ta: 'மொத்த பில் தொகை' },
  'order.amount_paid': { en: 'Amount Paid (கொடுத்த பணம்)', ta: 'இப்போது கொடுத்த பணம் (₹)' },
  'order.balance_due': { en: 'Balance Remaining (பாக்கி)', ta: 'மீதமுள்ள பாக்கி' },
  'order.payment_method': { en: 'Payment Mode', ta: 'பணம் கொடுத்த முறை' },
  'order.notes': { en: 'Notes / Remarks', ta: 'குறிப்பு' },
  'order.submit_btn': { en: 'Save, Print & WhatsApp Bill', ta: 'பில் அச்சிட்டு வாட்ஸ்அப் அனுப்பு' },

  // Invoices & Statuses
  'inv.title': { en: 'Customer Bills', ta: 'வாடிக்கையாளர் பில்கள்' },
  'inv.number': { en: 'Bill #', ta: 'பில் எண்' },
  'inv.date': { en: 'Date', ta: 'தேதி' },
  'inv.customer': { en: 'Customer', ta: 'வாடிக்கையாளர்' },
  'inv.amount': { en: 'Bill Total', ta: 'மொத்த தொகை' },
  'inv.paid': { en: 'Paid (கொடுத்தது)', ta: 'கொடுத்தது' },
  'inv.due': { en: 'Due (பாக்கி)', ta: 'பாக்கி' },
  'inv.status': { en: 'Payment Status', ta: 'நிலைமை' },
  'status.paid': { en: 'Full Paid (பணம் வந்தது)', ta: 'முழு பணம் வந்தது' },
  'status.partial': { en: 'Partial Paid (பாக்கி உள்ளது)', ta: 'பாதி பணம் வந்தது' },
  'status.pending': { en: 'Not Paid (பாக்கி)', ta: 'பாக்கி உள்ளது' },
  'status.overdue': { en: 'Due Delayed', ta: 'தாமதமான பாக்கி' },

  // Customers CRM
  'cust.title': { en: 'Customer Accounts & Phone Book', ta: 'வாடிக்கையாளர்கள் & பாக்கி கணக்கு' },
  'cust.add_btn': { en: '+ Add New Customer', ta: '+ புதிய வாடிக்கையாளர்' },
  'cust.name': { en: 'Customer Name', ta: 'வாடிக்கையாளர் பெயர்' },
  'cust.phone': { en: 'Mobile Number', ta: 'கைபேசி எண்' },
  'cust.balance': { en: 'Pending Due Amount', ta: 'வர வேண்டிய பாக்கி பணம்' },
  'cust.address': { en: 'Town / Address', ta: 'ஊர் / முகவரி' },

  // Products
  'prod.title': { en: 'Products & Stock Quantities', ta: 'கடை பொருட்கள் & இருப்பு' },
  'prod.add_btn': { en: 'Add New Product', ta: 'புதிய பொருள் சேர்' },
  'prod.name': { en: 'Product Name', ta: 'பொருள் பெயர்' },
  'prod.category': { en: 'Category', ta: 'வகை' },
  'prod.stock': { en: 'Stock Left', ta: 'மீதமுள்ள இருப்பு' },
  'prod.price': { en: 'Selling Price (₹)', ta: 'விற்பனை விலை (₹)' },

  // User Manual
  'manual.title': { en: 'Simple Guide on How to Use', ta: 'பயன்பாட்டு எளிய வழிகாட்டி' },
  'manual.subtitle': {
    en: 'Easy step-by-step instructions for billing, taking money, and printing receipts.',
    ta: 'பில் போடுவது, பணம் வரவு வைப்பது மற்றும் ரசீது அச்சிடுவதற்கான எளிய முறை.',
  },
  'manual.tab_staff': { en: 'Daily Billing Guide', ta: 'தினசரி பில் போடும் முறை' },
  'manual.tab_admin': { en: 'Owner Management Guide', ta: 'கடை உரிமையாளர் வழிகாட்டி' },
  'manual.tab_arch': { en: 'System Information', ta: 'அமைப்பு தகவல்கள்' },
  'manual.tab_faq': { en: 'Common Questions', ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள்' },

  // Settings
  'settings.title': { en: 'Store Details & Settings', ta: 'கடை விவரங்கள் & அமைப்புகள்' },
  'settings.merchant_info': { en: 'Store Name, Phone & GSTIN', ta: 'கடை பெயர், போன் & ஜி.எஸ்.டி' },
  'settings.n8n_status': { en: 'Automatic WhatsApp & Email', ta: 'தானியங்கி வாட்ஸ்அப் & மின்னஞ்சல்' },
  'settings.ai_status': { en: 'Paper Bill Scanner', ta: 'காகித பில் ஸ்கேனர்' },
  'settings.manual_link': { en: 'Read Easy Guide', ta: 'எளிய வழிகாட்டியைப் படிக்க' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('greenlife_language');
    return (saved === 'ta' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('greenlife_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string, defaultText?: string) => defaultText || key,
    };
  }
  return context;
};
