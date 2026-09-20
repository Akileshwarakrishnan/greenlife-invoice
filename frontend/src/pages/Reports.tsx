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
  ArrowUpRight
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'customers' | 'payments'>('sales');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

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

  const tabs = [
    { id: 'sales', label: 'Sales Ledger', icon: Calendar },
    { id: 'products', label: 'Product Volume', icon: Package },
    { id: 'customers', label: 'Customer Insights', icon: Users },
    { id: 'payments', label: 'Payment Distribution', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto" style={{ background: 'transparent' }}>
      <PageHeader
        title={t('nav.reports', 'Business Analytics & Reports')}
        subtitle="Financial ledgers, product velocity metrics, customer lifetime value, and payment breakdowns."
        badge="Financial Intelligence"
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
              href={reportApi.getExportCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              style={{ background: '#2D6A4F', color: 'white' }}
            >
              <Download className="w-4 h-4" />
              <span>{t('action.export_csv', 'Export CSV')}</span>
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

          {/* Tab 2: Products Report */}
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
