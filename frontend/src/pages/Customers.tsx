import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../services/api';
import { Customer } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  UserPlus,
  Search,
  Edit2,
  Phone,
  Mail,
  MapPin,
  X,
  FilePlus,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const Customers: React.FC = () => {
  const { language, t } = useLanguage();
  const isTamil = language === 'ta';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kangeyam');
  const [district, setDistrict] = useState('Tirupur');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('638701');
  const [gstNumber, setGstNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerApi.list();
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('Kangeyam');
    setDistrict('Tirupur');
    setState('Tamil Nadu');
    setPincode('638701');
    setGstNumber('');
    setNotes('');
    setPreviousBalance(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address);
    setCity(c.city || 'Kangeyam');
    setDistrict(c.district || 'Tirupur');
    setState(c.state || 'Tamil Nadu');
    setPincode(c.pincode || '638701');
    setGstNumber(c.gst_number || '');
    setNotes(c.notes || '');
    setPreviousBalance(c.previous_balance || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name,
        phone,
        email: email || undefined,
        address,
        city,
        district,
        state,
        pincode,
        gst_number: gstNumber || undefined,
        notes: notes || undefined,
        previous_balance: Number(previousBalance || 0),
      };

      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, payload);
      } else {
        await customerApi.create(payload);
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const s = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s) ||
      (c.city && c.city.toLowerCase().includes(s));

    if (filterDueOnly) {
      return matchesSearch && (c.previous_balance || 0) > 0;
    }
    return matchesSearch;
  });

  const totalOutstandingDue = customers.reduce((sum, c) => sum + (c.previous_balance || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" style={{ background: 'transparent' }}>
      <PageHeader
        title={isTamil ? 'வாடிக்கையாளர் பட்டியல் & பாக்கி கணக்கு' : 'Customer Accounts & Ledger'}
        subtitle={isTamil ? 'வாடிக்கையாளர்களின் விவரங்கள், முகவரி மற்றும் பாக்கி பண விபரம்' : 'Manage store customers, contact numbers, addresses, and pending dues'}
        badge={isTamil ? 'வாடிக்கையாளர் கணக்கு' : 'Customer Ledger'}
        actions={
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-5 py-3 font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            style={{ background: '#2D6A4F', color: 'white' }}
          >
            <UserPlus className="w-4 h-4" style={{ color: '#C68B3A' }} />
            <span>+ {isTamil ? 'புதிய வாடிக்கையாளர் சேர்க்க' : 'Add New Customer'}</span>
          </button>
        }
      />

      {/* Quick Summary Pill & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: 'white', border: '1px solid #EEEAE0' }}>
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: '#8C8880' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'பெயர், தொலைபேசி அல்லது ஊர் கொண்டு தேடவும்...' : 'Search by name, phone, or town...'}
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden"
            style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
          />
        </div>

        {/* Due Filter Toggle & Total Counter */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className="px-4 py-2 rounded-2xl text-xs font-black border-2 flex items-center space-x-2 cursor-pointer transition-all"
            style={{
              background: filterDueOnly ? '#FDF3E3' : 'white',
              borderColor: filterDueOnly ? '#C68B3A' : '#EEEAE0',
              color: filterDueOnly ? '#C68B3A' : '#4A4740'
            }}
          >
            <Clock className="w-4 h-4" style={{ color: '#C68B3A' }} />
            <span>{isTamil ? 'பாக்கி உள்ளவர்கள் மட்டும்' : 'Show Outstanding Dues Only'}</span>
          </button>

          <div className="px-4 py-2 rounded-2xl border text-xs font-bold" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
            <span>{isTamil ? 'மொத்த பாக்கி:' : 'Total Outstanding:'} </span>
            <span className="font-black text-sm" style={{ color: '#2D6A4F' }}>₹{totalOutstandingDue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center font-semibold text-sm" style={{ color: '#8C8880' }}>
            {isTamil ? 'விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading customer list...'}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center font-semibold text-sm rounded-3xl border p-8" style={{ background: 'white', borderColor: '#EEEAE0', color: '#8C8880' }}>
            {isTamil ? 'வாடிக்கையாளர்கள் யாரும் இல்லை. "+ புதிய வாடிக்கையாளர் சேர்க்க" கிளிக் செய்யவும்.' : 'No customers found. Click "+ Add New Customer" to register one.'}
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between space-y-4"
              style={{ background: 'white', borderColor: '#EEEAE0' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2D6A4F'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(45,106,79,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EEEAE0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center flex-shrink-0" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
                      {c.name ? c.name[0].toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg leading-tight" style={{ color: '#1C1A15' }}>
                        {c.name}
                      </h3>
                      <span className="text-[11px] font-bold font-mono" style={{ color: '#8C8880' }}>
                        {c.customer_code || `CUST-${c.id}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 rounded-xl transition-colors cursor-pointer"
                    title={isTamil ? 'திருத்த' : 'Edit Customer'}
                    style={{ color: '#8C8880', background: 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#2D6A4F'; e.currentTarget.style.background = '#EBF5EE'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#8C8880'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contact details */}
                <div className="mt-4 space-y-2 text-xs font-medium" style={{ color: '#4A4740' }}>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#8C8880' }} />
                    <span className="font-bold" style={{ color: '#1C1A15' }}>{c.phone}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8C8880' }} />
                    <span className="line-clamp-2">
                      {c.address}, {c.city || 'Kangeyam'} - {c.pincode || '638701'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance & Action Buttons */}
              <div className="pt-4 border-t space-y-3" style={{ borderColor: '#EEEAE0' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] block font-bold uppercase tracking-wider" style={{ color: '#8C8880' }}>
                      {isTamil ? 'பாக்கி இருப்பு' : 'Account Balance'}
                    </span>
                    <span
                      className="font-black text-base"
                      style={{ color: (c.previous_balance || 0) > 0 ? '#C68B3A' : '#2D6A4F' }}
                    >
                      {(c.previous_balance || 0) > 0
                        ? `₹${c.previous_balance.toLocaleString('en-IN')} பாக்கி`
                        : 'பாக்கி இல்லை (₹0)'}
                    </span>
                  </div>

                  {c.gst_number && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold" style={{ background: '#F7F5EF', color: '#4A4740' }}>
                      GST: {c.gst_number}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Link
                    to="/orders/new"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    style={{ background: '#EBF5EE', color: '#2D6A4F' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#2D6A4F'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#EBF5EE'; e.currentTarget.style.color = '#2D6A4F'; }}
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'பில் போடுங்க' : 'Bill Order'}</span>
                  </Link>

                  <a
                    href={`https://wa.me/91${(c.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl transition-colors cursor-pointer"
                    title={isTamil ? 'வாட்ஸ்அப் செய்தி அனுப்ப' : 'WhatsApp'}
                    style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#128C7E' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 211, 102, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)'}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28, 26, 21, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border" style={{ background: 'white', borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#EEEAE0' }}>
              <h3 className="font-black text-base" style={{ color: '#1C1A15' }}>
                {editingCustomer
                  ? (isTamil ? 'வாடிக்கையாளர் தகவலை மாற்ற' : 'Update Customer Record')
                  : (isTamil ? 'புதிய வாடிக்கையாளர் சேர்க்க' : 'Add New Customer')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg cursor-pointer"
                style={{ color: '#8C8880' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'வாடிக்கையாளர் பெயர் *' : 'Customer Name *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isTamil ? 'எ.கா. ராஜா' : 'e.g. Raja'}
                    className="w-full px-3.5 py-2.5 border-2 rounded-xl text-sm font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'தொலைபேசி எண் *' : 'Phone Number *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98421 88990"
                    className="w-full px-3.5 py-2.5 border-2 rounded-xl text-sm font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'முகவரி *' : 'Address *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isTamil ? 'கதவு எண், தெரு...' : 'Street / Door number...'}
                  className="w-full px-3.5 py-2 border-2 rounded-xl text-sm font-semibold focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'ஊர்' : 'City/Town'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'மாவட்டம்' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'பின்கோடு' : 'Pincode'}
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'முந்தைய பாக்கி பணம் (₹)' : 'Opening Balance (₹)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={previousBalance}
                    onChange={(e) => setPreviousBalance(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border-2 rounded-xl text-sm font-black focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#2D6A4F' }}
                  />
                </div>
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'GST எண் (இருந்தால்)' : 'GST Number (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t" style={{ borderColor: '#EEEAE0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 font-bold rounded-xl cursor-pointer"
                  style={{ background: '#F7F5EF', color: '#4A4740' }}
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  style={{ background: '#2D6A4F', color: 'white' }}
                >
                  {submitting
                    ? (isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...')
                    : editingCustomer
                    ? (isTamil ? 'மாற்றங்களைச் சேமி' : 'Update Customer')
                    : (isTamil ? 'வாடிக்கையாளரைச் சேமி' : 'Save Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
