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
    <div className="space-y-6 max-w-7xl mx-auto pb-12" style={{ background: 'transparent' }}>
      <PageHeader
        title={isTamil ? 'ஆர்டர்கள் & பில் கணக்கு' : 'Orders & Booking Ledger'}
        subtitle={isTamil ? 'வாடிக்கையாளர்களின் ஆர்டர்கள் மற்றும் உருவான பில்களின் தொகுப்பு' : 'Review customer orders, items booked, and invoice linkages'}
        badge={isTamil ? 'ஆர்டர்கள்' : 'Orders'}
        actions={
          <Link
            to="/orders/new"
            className="flex items-center space-x-2 px-5 py-3 font-black rounded-2xl text-xs sm:text-sm transition-all cursor-pointer"
            style={{ background: '#2D6A4F', color: 'white' }}
          >
            <PlusCircle className="w-4 h-4" style={{ color: '#C68B3A' }} />
            <span>+ {isTamil ? 'புதிய பில் போடுங்க' : 'New Order'}</span>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row gap-3 items-center justify-between" style={{ background: 'white', border: '1px solid #EEEAE0', borderRadius: '12px' }}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: '#8C8880' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'ஆர்டர் எண் அல்லது வாடிக்கையாளர் பெயர்...' : 'Search by order # or customer...'}
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden"
            style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-black" style={{ color: '#1C1A15' }}>
            {isTamil ? 'வடிகட்டுக:' : 'Filter:'}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 border-2 rounded-2xl text-xs font-bold"
            style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
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
      <div className="rounded-3xl border overflow-hidden" style={{ background: 'white', border: '1px solid #EEEAE0', borderRadius: '12px' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="font-black uppercase tracking-wider border-b" style={{ background: '#EEEAE0', color: '#4A4740', borderColor: '#EEEAE0' }}>
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
            <tbody className="divide-y" style={{ borderColor: '#EEEAE0', color: '#1C1A15' }}>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center font-bold" style={{ color: '#8C8880' }}>
                    {isTamil ? 'ஆர்டர்கள் ஏற்றப்படுகின்றன...' : 'Loading orders...'}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center font-bold" style={{ color: '#8C8880' }}>
                    {isTamil ? 'ஆர்டர்கள் எதுவும் கிடைக்கவில்லை.' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="transition-colors bg-white dark:bg-[#15271B] hover:bg-[#F7F5EF] dark:hover:bg-[#1C3324]">
                    <td className="px-5 py-4 font-black font-mono" style={{ color: '#1C1A15' }}>
                      {order.order_number}
                    </td>
                    <td className="px-5 py-4 font-semibold" style={{ color: '#4A4740' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 font-extrabold" style={{ color: '#1C1A15' }}>
                      {order.customer_name || 'Customer'}
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate font-medium" style={{ color: '#4A4740' }}>
                      {order.items?.map((i) => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ')}
                    </td>
                    <td className="px-5 py-4 text-right font-bold" style={{ color: '#4A4740' }}>
                      ₹{order.subtotal.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right font-black text-sm" style={{ color: '#1C1A15' }}>
                      ₹{order.grand_total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge status={order.payment_status} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      {order.invoice_number ? (
                        <Link
                          to={`/invoices/${order.invoice_id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl font-black text-xs transition-colors"
                          style={{ background: '#EBF5EE', color: '#2D6A4F' }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>#{order.invoice_number}</span>
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold" style={{ color: '#8C8880' }}>பில் இல்லை</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {order.invoice_id && (
                        <>
                          <Link
                            to={`/invoices/${order.invoice_id}`}
                            className="p-2 rounded-xl inline-block transition-colors"
                            title={isTamil ? 'பில் பார்க்க' : 'View Invoice'}
                            style={{ color: '#4A4740', background: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#2D6A4F'; e.currentTarget.style.background = '#EBF5EE'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#4A4740'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => window.open(invoiceApi.getPdfUrl(order.invoice_id!), '_blank')}
                            className="p-2 rounded-xl inline-block transition-colors cursor-pointer"
                            title={isTamil ? 'பிரிண்ட்' : 'Print'}
                            style={{ color: '#4A4740', background: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#2D6A4F'; e.currentTarget.style.background = '#EBF5EE'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#4A4740'; e.currentTarget.style.background = 'transparent'; }}
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
