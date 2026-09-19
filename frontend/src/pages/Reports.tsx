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
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t('nav.reports', 'Business Analytics & Reports')}
        subtitle="Financial ledgers, product velocity metrics, customer lifetime value, and payment breakdowns."
        badge="Financial Intelligence"
        actions={
          <>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#082216] hover:bg-slate-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-emerald-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>{t('action.print', 'Print Statement')}</span>
            </button>

            <a
              href={reportApi.getExportCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('action.export_csv', 'Export CSV')}</span>
            </a>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex items-center space-x-1.5 border-b border-emerald-100 dark:border-emerald-900/40 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-emerald-300/80 hover:text-slate-900 dark:hover:text-emerald-100 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-emerald-400/60'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading reporting analytics...</div>
      ) : (
        <>
          {/* Tab 1: Sales Report */}
          {activeTab === 'sales' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Daily Sales & Collections Ledger</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Aggregated subtotal, tax, shipping, and realized collections.</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {salesData.length} records
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
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
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {salesData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                          No sales data recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      salesData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">{row.date}</td>
                          <td className="px-5 py-3.5 text-center font-medium">{row.invoices_count}</td>
                          <td className="px-5 py-3.5 text-right font-medium text-slate-600">
                            ₹{row.subtotal.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-medium text-slate-600">
                            ₹{row.courier_charges.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-medium text-slate-600">
                            ₹{row.tax_amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                            ₹{row.net_sales.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-emerald-600">
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Product Sales Volume & Turnover</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Top-selling items, order frequencies, and gross turnover.</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {productsData.length} products
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Product Name</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5 text-center">Orders Placed</th>
                      <th className="px-5 py-3.5 text-center">Volume Sold</th>
                      <th className="px-5 py-3.5 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {productsData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                          No product sales volume logged.
                        </td>
                      </tr>
                    ) : (
                      productsData.map((p) => (
                        <tr key={p.product_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">{p.product_name}</td>
                          <td className="px-5 py-3.5 text-slate-500">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-medium">{p.order_occurrences}</td>
                          <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                            {p.units_sold} {p.unit}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-emerald-700">
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Customer Lifetime Value & Receivables</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Order history, aggregate spend, and pending credit balances.</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {customersData.length} accounts
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Phone</th>
                      <th className="px-5 py-3.5 text-center">Total Orders</th>
                      <th className="px-5 py-3.5 text-right">Lifetime Spend</th>
                      <th className="px-5 py-3.5 text-right">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {customersData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                          No customer insights available.
                        </td>
                      </tr>
                    ) : (
                      customersData.map((c) => (
                        <tr key={c.customer_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">{c.customer_name}</td>
                          <td className="px-5 py-3.5 text-slate-500 font-mono">{c.phone}</td>
                          <td className="px-5 py-3.5 text-center font-medium">{c.total_orders}</td>
                          <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                            ₹{c.total_spent.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                c.outstanding_balance > 0
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              }`}
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Settlement Method Distribution</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Payment gateways, cash on delivery, and UPI transaction volume.</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {paymentsData.length} channels
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Payment Method</th>
                      <th className="px-5 py-3.5 text-center">Transactions Count</th>
                      <th className="px-5 py-3.5 text-right">Total Realized Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paymentsData.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-xs">
                          No payment distribution data found.
                        </td>
                      </tr>
                    ) : (
                      paymentsData.map((pm, i) => (
                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>{pm.payment_method.toUpperCase()}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-medium">{pm.transactions_count}</td>
                          <td className="px-5 py-3.5 text-right font-bold text-emerald-600">
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
