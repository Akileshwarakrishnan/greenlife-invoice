import React, { useEffect, useState } from 'react';
import { reportApi } from '../services/api';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart3,
  Download,
  Calendar,
  Package,
  Users,
  CreditCard,
  Printer,
  TrendingUp,
  ArrowUpRight,
  ReceiptText,
  Truck,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { t, language } = useLanguage();
  const isTamil = language === 'ta';

  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'customers' | 'payments' | 'tax'>('sales');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Annual Income Tax State
  const [selectedFy, setSelectedFy] = useState<string>('2025-2026');
  const [taxReport, setTaxReport] = useState<any>(null);
  const [loadingTax, setLoadingTax] = useState<boolean>(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (activeTab === 'tax') {
      loadTaxReport(selectedFy);
    }
  }, [activeTab, selectedFy]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [sRes, pRes, cRes, payRes] = await Promise.all([
        reportApi.getSales(),
        reportApi.getProducts(),
        reportApi.getCustomers(),
        reportApi.getPayments(),
      ]);
      setSalesData(sRes.data);
      setProductsData(pRes.data);
      setCustomersData(cRes.data);
      setPaymentsData(payRes.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTaxReport = async (fy: string) => {
    try {
      setLoadingTax(true);
      const res = await reportApi.getAnnualTax(fy);
      setTaxReport(res.data);
    } catch (err) {
      console.error('Failed to load annual tax report:', err);
    } finally {
      setLoadingTax(false);
    }
  };

  const tabs = [
    { id: 'sales', label: isTamil ? 'விற்பனை கணக்கு' : 'Sales Ledger', icon: Calendar },
    { id: 'tax', label: isTamil ? 'வருமான வரி & ஆடிட்டிங்' : 'Annual Income Tax (FY)', icon: ReceiptText },
    { id: 'products', label: isTamil ? 'சரக்கு அளவு' : 'Product Volume', icon: Package },
    { id: 'customers', label: isTamil ? 'வாடிக்கையாளர்' : 'Customer Insights', icon: Users },
    { id: 'payments', label: isTamil ? 'பணம் வரவு' : 'Payment Distribution', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto" style={{ background: 'transparent' }}>
      <PageHeader
        title={isTamil ? 'வணிக பகுப்பாய்வு & வரி அறிக்கைகள்' : 'Business Analytics & Reports'}
        subtitle={
          isTamil
            ? 'ஆண்டு வருமான வரி அறிக்கை, விற்பனை வரவு மற்றும் கொள்முதல் செலவு கணக்குகள்'
            : 'Financial ledgers, CA income tax filings, product velocity, and payment breakdowns.'
        }
        badge={isTamil ? 'நிதி நுண்ணறிவு' : 'Financial Intelligence'}
        actions={
          <>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              style={{ background: 'white', borderColor: '#EEEAE0', color: '#4A4740' }}
            >
              <Printer className="w-4 h-4" style={{ color: '#8C8880' }} />
              <span>{t('action.print', 'Print Statement')}</span>
            </button>

            <a
              href={activeTab === 'tax' ? reportApi.getAnnualTaxExportCsvUrl(selectedFy) : reportApi.getExportCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              style={{ background: '#2D6A4F', color: 'white' }}
            >
              <Download className="w-4 h-4" />
              <span>
                {activeTab === 'tax'
                  ? (isTamil ? 'CA வருமான வரி எக்செல் (.CSV)' : 'Download CA Tax Ledger')
                  : t('action.export_csv', 'Export CSV')}
              </span>
            </a>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex items-center space-x-1.5 border-b pb-2 overflow-x-auto" style={{ borderColor: '#EEEAE0' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
              style={{
                background: isActive ? '#2D6A4F' : 'transparent',
                color: isActive ? 'white' : '#4A4740',
                boxShadow: isActive ? '0 1px 2px rgba(45,106,79,0.2)' : 'none'
              }}
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? 'white' : '#8C8880' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs" style={{ color: '#8C8880' }}>Loading reporting analytics...</div>
      ) : (
        <>
          {/* Tab 1: Sales Report */}
          {activeTab === 'sales' && (
            <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#EEEAE0' }}>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>Daily Sales & Collections Ledger</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#8C8880' }}>Aggregated subtotal, tax, shipping, and realized collections.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                  {salesData.length} records
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="font-semibold uppercase tracking-wider text-[11px] border-b" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                    <tr>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-center">Invoices</th>
                      <th className="px-5 py-3.5 text-right">Subtotal</th>
                      <th className="px-5 py-3.5 text-right">Courier Charges</th>
                      <th className="px-5 py-3.5 text-right">Tax (GST)</th>
                      <th className="px-5 py-3.5 text-right">Net Billed</th>
                      <th className="px-5 py-3.5 text-right">Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#EEEAE0', color: '#4A4740' }}>
                    {salesData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-xs" style={{ color: '#8C8880' }}>
                          No sales data recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      salesData.map((row, i) => (
                        <tr key={i} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F5EF'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'} style={{ background: 'white' }}>
                          <td className="px-5 py-3.5 font-bold" style={{ color: '#1C1A15' }}>{row.date}</td>
                          <td className="px-5 py-3.5 text-center font-medium">{row.invoices_count}</td>
                          <td className="px-5 py-3.5 text-right font-medium" style={{ color: '#4A4740' }}>
                            ₹{row.subtotal.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-medium" style={{ color: '#4A4740' }}>
                            ₹{row.courier_charges.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-medium" style={{ color: '#4A4740' }}>
                            ₹{row.tax_amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold" style={{ color: '#1C1A15' }}>
                            ₹{row.net_sales.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold" style={{ color: '#2D6A4F' }}>
                            ₹{row.amount_collected.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Annual Income Tax Report (FY) */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              {/* Financial Year Selector & Executive Banner */}
              <div
                className="p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ background: 'white', borderColor: '#EEEAE0' }}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black" style={{ color: '#1C1A15', fontFamily: 'Georgia, serif' }}>
                      {isTamil ? 'ஆண்டு வருமான வரி & ஆடிட்டிங் கணக்கு' : 'Annual Income Tax Ledger & CA Dossier'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
                      {taxReport?.financial_year || selectedFy}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#8C8880' }}>
                    {isTamil
                      ? 'ஏப்ரல் 1 முதல் மார்ச் 31 வரையிலான விற்பனை வரவு மற்றும் கொள்முதல் செலவு கணக்கீடுகள்'
                      : `Financial Period: ${taxReport?.period_start || 'April 1'} to ${taxReport?.period_end || 'March 31'} (Sales vs Stock Purchases)`}
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <label className="text-xs font-bold whitespace-nowrap" style={{ color: '#4A4740' }}>
                    {isTamil ? 'நிதி ஆண்டு (FY):' : 'Select FY:'}
                  </label>
                  <select
                    value={selectedFy}
                    onChange={(e) => setSelectedFy(e.target.value)}
                    className="px-3.5 py-2 border rounded-xl text-xs font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  >
                    <option value="2026-2027">FY 2026–2027 (Current)</option>
                    <option value="2025-2026">FY 2025–2026</option>
                    <option value="2024-2025">FY 2024–2025</option>
                    <option value="2023-2024">FY 2023–2024</option>
                  </select>
                </div>
              </div>

              {/* 4 TAX COMPUTATION KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl border shadow-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: '#8C8880' }}>
                    <span>{isTamil ? 'மொத்த விற்பனை (Turnover)' : 'Gross Sales Turnover'}</span>
                    <div className="p-2 rounded-xl" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-black" style={{ color: '#1C1A15', fontFamily: 'Georgia, serif' }}>
                    ₹{Number(taxReport?.tax_summary?.gross_turnover || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: '#8C8880' }}>
                    {taxReport?.sales?.count || 0} {isTamil ? 'விற்பனை பில்கள்' : 'Customer bills'}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border shadow-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: '#8C8880' }}>
                    <span>{isTamil ? 'கொள்முதல் செலவு (COGS)' : 'Stock Purchases (COGS)'}</span>
                    <div className="p-2 rounded-xl" style={{ background: '#FDF3E3', color: '#C68B3A' }}>
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-black" style={{ color: '#C68B3A', fontFamily: 'Georgia, serif' }}>
                    ₹{Number(taxReport?.tax_summary?.deductible_stock_purchases || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: '#C68B3A' }}>
                    {taxReport?.purchases?.count || 0} {isTamil ? 'சரக்கு வரவு பில்கள்' : 'Inward stock bills'}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border shadow-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: '#8C8880' }}>
                    <span>{isTamil ? 'வரிக்குரிய நிகர லாபம்' : 'Taxable Net Income'}</span>
                    <div className="p-2 rounded-xl" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div
                    className="mt-2 text-xl sm:text-2xl font-black"
                    style={{
                      color: Number(taxReport?.tax_summary?.taxable_net_profit || 0) >= 0 ? '#2D6A4F' : '#B42318',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    ₹{Number(taxReport?.tax_summary?.taxable_net_profit || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: '#2D6A4F' }}>
                    {isTamil ? 'விற்பனை கழித்தல் கொள்முதல்' : 'Turnover minus Stock Cost'}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl border shadow-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: '#8C8880' }}>
                    <span>{isTamil ? 'ஜிஎஸ்டி வரி விவரம்' : 'Net GST Liability'}</span>
                    <div className="p-2 rounded-xl" style={{ background: '#F7F5EF', color: '#4A4740' }}>
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-black" style={{ color: '#1C1A15', fontFamily: 'Georgia, serif' }}>
                    ₹{Number(taxReport?.tax_summary?.net_gst_payable || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: '#8C8880' }}>
                    Output: ₹{Number(taxReport?.tax_summary?.gst_output_collected || 0).toFixed(0)} | Input: ₹{Number(taxReport?.tax_summary?.gst_input_tax_credit || 0).toFixed(0)}
                  </p>
                </div>
              </div>

              {/* DUAL AUDIT LEDGER GRIDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Bills Summary */}
                <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#EEEAE0' }}>
                    <div>
                      <h4 className="font-bold text-xs" style={{ color: '#1C1A15' }}>
                        {isTamil ? 'விற்பனை பில்கள் (Customer Sales Bills)' : 'Sales Revenue Bills'}
                      </h4>
                      <p className="text-[11px]" style={{ color: '#8C8880' }}>
                        {isTamil ? 'வாடிக்கையாளர்களுக்கு வழங்கப்பட்ட ரசீதுகள்' : 'Recent customer invoices in this financial year'}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
                      {taxReport?.sales?.count || 0} {isTamil ? 'பில்கள்' : 'bills'}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="font-semibold text-[11px] uppercase border-b" style={{ background: '#F7F5EF', color: '#4A4740', borderColor: '#EEEAE0' }}>
                        <tr>
                          <th className="px-3 py-2.5">{isTamil ? 'தேதி' : 'Date'}</th>
                          <th className="px-3 py-2.5">{isTamil ? 'பில் எண்' : 'Bill #'}</th>
                          <th className="px-3 py-2.5">{isTamil ? 'வாடிக்கையாளர்' : 'Customer'}</th>
                          <th className="px-3 py-2.5 text-right">{isTamil ? 'தொகை' : 'Total'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: '#EEEAE0' }}>
                        {(taxReport?.sales?.recent_bills || []).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-6 text-center text-xs" style={{ color: '#8C8880' }}>
                              {isTamil ? 'இந்த நிதி ஆண்டில் பில்கள் இல்லை' : 'No sales bills for this FY'}
                            </td>
                          </tr>
                        ) : (
                          taxReport.sales.recent_bills.map((b: any) => (
                            <tr key={b.id} className="hover:bg-[#F7F5EF]">
                              <td className="px-3 py-2 text-[11px]" style={{ color: '#8C8880' }}>{b.date}</td>
                              <td className="px-3 py-2 font-mono font-bold text-[11px]" style={{ color: '#2D6A4F' }}>{b.invoice_number}</td>
                              <td className="px-3 py-2 font-semibold truncate max-w-[120px]" style={{ color: '#1C1A15' }}>{b.customer_name}</td>
                              <td className="px-3 py-2 text-right font-black" style={{ color: '#1C1A15' }}>₹{Number(b.grand_total).toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock Inward Bills Summary */}
                <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#EEEAE0' }}>
                    <div>
                      <h4 className="font-bold text-xs" style={{ color: '#1C1A15' }}>
                        {isTamil ? 'சரக்கு கொள்முதல் பில்கள் (Inward Stock Bills)' : 'Stock Purchase Bills'}
                      </h4>
                      <p className="text-[11px]" style={{ color: '#8C8880' }}>
                        {isTamil ? 'விவசாயிகள் மற்றும் மில்களிடம் வாங்கிய பில்கள்' : 'Supplier bills, raw seeds, and copra inward'}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md border" style={{ background: '#FDF3E3', borderColor: '#F4D2A2', color: '#C68B3A' }}>
                      {taxReport?.purchases?.count || 0} {isTamil ? 'பில்கள்' : 'bills'}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="font-semibold text-[11px] uppercase border-b" style={{ background: '#F7F5EF', color: '#4A4740', borderColor: '#EEEAE0' }}>
                        <tr>
                          <th className="px-3 py-2.5">{isTamil ? 'தேதி' : 'Date'}</th>
                          <th className="px-3 py-2.5">{isTamil ? 'சப்ளையர் பில்' : 'Supplier Bill'}</th>
                          <th className="px-3 py-2.5">{isTamil ? 'விற்பனையாளர்' : 'Vendor'}</th>
                          <th className="px-3 py-2.5 text-right">{isTamil ? 'தொகை' : 'Total'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: '#EEEAE0' }}>
                        {(taxReport?.purchases?.recent_bills || []).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-6 text-center text-xs" style={{ color: '#8C8880' }}>
                              {isTamil ? 'இந்த நிதி ஆண்டில் கொள்முதல் பில்கள் இல்லை' : 'No purchase bills for this FY'}
                            </td>
                          </tr>
                        ) : (
                          taxReport.purchases.recent_bills.map((p: any) => (
                            <tr key={p.id} className="hover:bg-[#F7F5EF]">
                              <td className="px-3 py-2 text-[11px]" style={{ color: '#8C8880' }}>{p.date}</td>
                              <td className="px-3 py-2 font-mono font-bold text-[11px]" style={{ color: '#C68B3A' }}>{p.vendor_bill_number || '—'}</td>
                              <td className="px-3 py-2 font-semibold truncate max-w-[120px]" style={{ color: '#1C1A15' }}>{p.vendor_name}</td>
                              <td className="px-3 py-2 text-right font-black" style={{ color: '#C68B3A' }}>₹{Number(p.grand_total).toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Products Report */}
          {activeTab === 'products' && (
            <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#EEEAE0' }}>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>Product Sales Volume & Turnover</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#8C8880' }}>Top-selling items, order frequencies, and gross turnover.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                  {productsData.length} products
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="font-semibold uppercase tracking-wider text-[11px] border-b" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                    <tr>
                      <th className="px-5 py-3.5">Product Name</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5 text-center">Orders Placed</th>
                      <th className="px-5 py-3.5 text-center">Volume Sold</th>
                      <th className="px-5 py-3.5 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#EEEAE0', color: '#4A4740' }}>
                    {productsData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-xs" style={{ color: '#8C8880' }}>
                          No product sales volume logged.
                        </td>
                      </tr>
                    ) : (
                      productsData.map((p) => (
                        <tr key={p.product_id} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F5EF'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'} style={{ background: 'white' }}>
                          <td className="px-5 py-3.5 font-bold" style={{ color: '#1C1A15' }}>{p.product_name}</td>
                          <td className="px-5 py-3.5" style={{ color: '#8C8880' }}>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: '#F7F5EF', color: '#4A4740' }}>
                              {p.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-medium">{p.order_occurrences}</td>
                          <td className="px-5 py-3.5 text-center font-bold" style={{ color: '#1C1A15' }}>
                            {p.units_sold} {p.unit}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold" style={{ color: '#2D6A4F' }}>
                            ₹{p.total_revenue.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Customer Report */}
          {activeTab === 'customers' && (
            <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#EEEAE0' }}>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>Customer Lifetime Value & Receivables</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#8C8880' }}>Order history, aggregate spend, and pending credit balances.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                  {customersData.length} accounts
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="font-semibold uppercase tracking-wider text-[11px] border-b" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                    <tr>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Phone</th>
                      <th className="px-5 py-3.5 text-center">Total Orders</th>
                      <th className="px-5 py-3.5 text-right">Lifetime Spend</th>
                      <th className="px-5 py-3.5 text-right">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#EEEAE0', color: '#4A4740' }}>
                    {customersData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-xs" style={{ color: '#8C8880' }}>
                          No customer insights available.
                        </td>
                      </tr>
                    ) : (
                      customersData.map((c) => (
                        <tr key={c.customer_id} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F5EF'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'} style={{ background: 'white' }}>
                          <td className="px-5 py-3.5 font-bold" style={{ color: '#1C1A15' }}>{c.customer_name}</td>
                          <td className="px-5 py-3.5 font-mono" style={{ color: '#8C8880' }}>{c.phone}</td>
                          <td className="px-5 py-3.5 text-center font-medium">{c.total_orders}</td>
                          <td className="px-5 py-3.5 text-right font-bold" style={{ color: '#1C1A15' }}>
                            ₹{c.total_spent.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold">
                            <span
                              className="px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                              style={{
                                background: c.outstanding_balance > 0 ? '#FDF3E3' : '#EBF5EE',
                                color: c.outstanding_balance > 0 ? '#C68B3A' : '#2D6A4F',
                                borderColor: c.outstanding_balance > 0 ? '#C68B3A' : '#B7D9C4'
                              }}
                            >
                              ₹{c.outstanding_balance.toLocaleString('en-IN')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Payments Report */}
          {activeTab === 'payments' && (
            <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#EEEAE0' }}>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#1C1A15' }}>Settlement Method Distribution</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#8C8880' }}>Payment gateways, cash on delivery, and UPI transaction volume.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                  {paymentsData.length} channels
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="font-semibold uppercase tracking-wider text-[11px] border-b" style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#8C8880' }}>
                    <tr>
                      <th className="px-5 py-3.5">Payment Method</th>
                      <th className="px-5 py-3.5 text-center">Transactions Count</th>
                      <th className="px-5 py-3.5 text-right">Total Realized Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#EEEAE0', color: '#4A4740' }}>
                    {paymentsData.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-xs" style={{ color: '#8C8880' }}>
                          No payment distribution data found.
                        </td>
                      </tr>
                    ) : (
                      paymentsData.map((pm, i) => (
                        <tr key={i} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F5EF'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'} style={{ background: 'white' }}>
                          <td className="px-5 py-3.5 font-bold flex items-center space-x-2" style={{ color: '#1C1A15' }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: '#2D6A4F' }}></span>
                            <span>{pm.payment_method.toUpperCase()}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-medium">{pm.transactions_count}</td>
                          <td className="px-5 py-3.5 text-right font-bold" style={{ color: '#2D6A4F' }}>
                            ₹{pm.total_amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
