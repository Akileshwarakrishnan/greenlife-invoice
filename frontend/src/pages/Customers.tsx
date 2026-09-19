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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={isTamil ? 'வாடிக்கையாளர் பட்டியல் & பாக்கி கணக்கு' : 'Customer Accounts & Ledger'}
        subtitle={isTamil ? 'வாடிக்கையாளர்களின் விவரங்கள், முகவரி மற்றும் பாக்கி பண விபரம்' : 'Manage store customers, contact numbers, addresses, and pending dues'}
        badge={isTamil ? 'வாடிக்கையாளர் கணக்கு' : 'Customer Ledger'}
        actions={
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-5 py-3 bg-[#284B35] hover:bg-[#1E3827] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#F5C242]" />
            <span>+ {isTamil ? 'புதிய வாடிக்கையாளர் சேர்க்க' : 'Add New Customer'}</span>
          </button>
        }
      />

      {/* Quick Summary Pill & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#C9DFCF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'பெயர், தொலைபேசி அல்லது ஊர் கொண்டு தேடவும்...' : 'Search by name, phone, or town...'}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#284B35] focus:bg-white"
          />
        </div>

        {/* Due Filter Toggle & Total Counter */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className={`px-4 py-2 rounded-2xl text-xs font-black border-2 flex items-center space-x-2 cursor-pointer transition-all ${
              filterDueOnly
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-white border-[#C9DFCF] text-slate-700 hover:bg-[#E4EFE7]'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span>{isTamil ? 'பாக்கி உள்ளவர்கள் மட்டும்' : 'Show Outstanding Dues Only'}</span>
          </button>

          <div className="px-4 py-2 bg-[#EBF3ED] rounded-2xl border border-[#C9DFCF] text-xs font-bold text-[#284B35]">
            <span>{isTamil ? 'மொத்த பாக்கி:' : 'Total Outstanding:'} </span>
            <span className="font-black text-sm text-[#284B35]">₹{totalOutstandingDue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm">
            {isTamil ? 'விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading customer list...'}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm bg-white rounded-3xl border border-[#C9DFCF] p-8">
            {isTamil ? 'வாடிக்கையாளர்கள் யாரும் இல்லை. "+ புதிய வாடிக்கையாளர் சேர்க்க" கிளிக் செய்யவும்.' : 'No customers found. Click "+ Add New Customer" to register one.'}
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-6 border border-[#C9DFCF] shadow-xs hover:shadow-md hover:border-[#284B35] transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E4EFE7] text-[#284B35] font-black text-base flex items-center justify-center flex-shrink-0">
                      {c.name ? c.name[0].toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                        {c.name}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        {c.customer_code || `CUST-${c.id}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 text-slate-400 hover:text-[#284B35] hover:bg-[#E4EFE7] rounded-xl transition-colors cursor-pointer"
                    title={isTamil ? 'திருத்த' : 'Edit Customer'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contact details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-slate-800">{c.phone}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {c.address}, {c.city || 'Kangeyam'} - {c.pincode || '638701'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance & Action Buttons */}
              <div className="pt-4 border-t border-[#E4EFE7] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                      {isTamil ? 'பாக்கி இருப்பு' : 'Account Balance'}
                    </span>
                    <span
                      className={`font-black text-base ${
                        (c.previous_balance || 0) > 0 ? 'text-amber-800' : 'text-emerald-700'
                      }`}
                    >
                      {(c.previous_balance || 0) > 0
                        ? `₹${c.previous_balance.toLocaleString('en-IN')} பாக்கி`
                        : 'பாக்கி இல்லை (₹0)'}
                    </span>
                  </div>

                  {c.gst_number && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-mono font-bold">
                      GST: {c.gst_number}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Link
                    to="/orders/new"
                    className="flex-1 py-2 px-3 bg-[#E4EFE7] hover:bg-[#284B35] text-[#284B35] hover:text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'பில் போடுங்க' : 'Bill Order'}</span>
                  </Link>

                  <a
                    href={`https://wa.me/91${(c.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] rounded-xl transition-colors cursor-pointer"
                    title={isTamil ? 'வாட்ஸ்அப் செய்தி அனுப்ப' : 'WhatsApp'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-[#C9DFCF]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingCustomer
                  ? (isTamil ? 'வாடிக்கையாளர் தகவலை மாற்ற' : 'Update Customer Record')
                  : (isTamil ? 'புதிய வாடிக்கையாளர் சேர்க்க' : 'Add New Customer')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'வாடிக்கையாளர் பெயர் *' : 'Customer Name *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isTamil ? 'எ.கா. ராஜா' : 'e.g. Raja'}
                    className="w-full px-3.5 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'தொலைபேசி எண் *' : 'Phone Number *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98421 88990"
                    className="w-full px-3.5 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  {isTamil ? 'முகவரி *' : 'Address *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isTamil ? 'கதவு எண், தெரு...' : 'Street / Door number...'}
                  className="w-full px-3.5 py-2 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'ஊர்' : 'City/Town'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'மாவட்டம்' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'பின்கோடு' : 'Pincode'}
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'முந்தைய பாக்கி பணம் (₹)' : 'Opening Balance (₹)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={previousBalance}
                    onChange={(e) => setPreviousBalance(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-sm font-black text-[#284B35]"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'GST எண் (இருந்தால்)' : 'GST Number (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full px-3 py-2 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#284B35] hover:bg-[#1E3827] text-white font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60"
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
