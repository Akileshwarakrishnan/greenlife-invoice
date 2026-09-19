import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, invoiceApi } from '../services/api';
import { Order } from '../types';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  PlusCircle,
  FileText,
  Eye,
  Download,
  ShoppingBag,
  Printer
} from 'lucide-react';

export const Orders: React.FC = () => {
  const { language, t } = useLanguage();
  const isTamil = language === 'ta';

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.list({ status: statusFilter || undefined });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const s = search.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(s) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={isTamil ? 'ஆர்டர்கள் & பில் கணக்கு' : 'Orders & Booking Ledger'}
        subtitle={isTamil ? 'வாடிக்கையாளர்களின் ஆர்டர்கள் மற்றும் உருவான பில்களின் தொகுப்பு' : 'Review customer orders, items booked, and invoice linkages'}
        badge={isTamil ? 'ஆர்டர்கள்' : 'Orders'}
        actions={
          <Link
            to="/orders/new"
            className="flex items-center space-x-2 px-5 py-3 bg-[#284B35] hover:bg-[#1E3827] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#F5C242]" />
            <span>+ {isTamil ? 'புதிய பில் போடுங்க' : 'New Order'}</span>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#C9DFCF] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'ஆர்டர் எண் அல்லது வாடிக்கையாளர் பெயர்...' : 'Search by order # or customer...'}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#284B35] focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-black text-[#284B35]">
            {isTamil ? 'வடிகட்டுக:' : 'Filter:'}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-2xl text-xs font-bold text-slate-800"
          >
            <option value="">{isTamil ? 'அனைத்து ஆர்டர்களும்' : 'All Statuses'}</option>
            <option value="confirmed">{isTamil ? 'உறுதி செய்யப்பட்டது' : 'Confirmed'}</option>
            <option value="dispatched">{isTamil ? 'அனுப்பப்பட்டது' : 'Dispatched'}</option>
            <option value="delivered">{isTamil ? 'சேர்க்கப்பட்டது' : 'Delivered'}</option>
            <option value="cancelled">{isTamil ? 'ரத்து' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#C9DFCF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E4EFE7] text-[#284B35] font-black uppercase tracking-wider border-b border-[#C9DFCF]">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">{isTamil ? 'தேதி' : 'Date'}</th>
                <th className="px-5 py-3.5">{isTamil ? 'வாடிக்கையாளர்' : 'Customer'}</th>
                <th className="px-5 py-3.5">{isTamil ? 'பொருட்கள்' : 'Items'}</th>
                <th className="px-5 py-3.5 text-right">{isTamil ? 'கூடுதல்' : 'Subtotal'}</th>
                <th className="px-5 py-3.5 text-right">{isTamil ? 'மொத்தம்' : 'Grand Total'}</th>
                <th className="px-5 py-3.5 text-center">{isTamil ? 'கட்டணம்' : 'Payment'}</th>
                <th className="px-5 py-3.5 text-center">{isTamil ? 'பில் எண்' : 'Invoice'}</th>
                <th className="px-5 py-3.5 text-right">{isTamil ? 'செயல்கள்' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4EFE7] text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-bold">
                    {isTamil ? 'ஆர்டர்கள் ஏற்றப்படுகின்றன...' : 'Loading orders...'}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-bold">
                    {isTamil ? 'ஆர்டர்கள் எதுவும் கிடைக்கவில்லை.' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F9FCFA] transition-colors">
                    <td className="px-5 py-4 font-black font-mono text-[#284B35]">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-semibold">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-900">
                      {order.customer_name || 'Customer'}
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate font-medium">
                      {order.items?.map((i) => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ')}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-600">
                      ₹{order.subtotal.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right font-black text-slate-950 text-sm">
                      ₹{order.grand_total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge status={order.payment_status} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      {order.invoice_number ? (
                        <Link
                          to={`/invoices/${order.invoice_id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-[#E4EFE7] hover:bg-[#D4E8DA] text-[#284B35] rounded-xl font-black text-xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>#{order.invoice_number}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">பில் இல்லை</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {order.invoice_id && (
                        <>
                          <Link
                            to={`/invoices/${order.invoice_id}`}
                            className="p-2 text-slate-400 hover:text-[#284B35] hover:bg-[#E4EFE7] rounded-xl inline-block transition-colors"
                            title={isTamil ? 'பில் பார்க்க' : 'View Invoice'}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => window.open(invoiceApi.getPdfUrl(order.invoice_id!), '_blank')}
                            className="p-2 text-slate-400 hover:text-[#284B35] hover:bg-[#E4EFE7] rounded-xl inline-block transition-colors cursor-pointer"
                            title={isTamil ? 'பிரிண்ட்' : 'Print'}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
