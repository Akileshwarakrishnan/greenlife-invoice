import React, { useEffect, useState, useRef } from 'react';
import { purchaseApi, productApi } from '../services/api';
import { Purchase, Product } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  Truck,
  Plus,
  Search,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  X,
  FileText,
  Package,
  Layers,
  ArrowDownLeft,
  Building2,
  RefreshCw,
  Camera,
  Upload,
  Sparkles
} from 'lucide-react';

export const Purchases: React.FC = () => {
  const { language } = useLanguage();
  const isTamil = language === 'ta';

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<any>({ total_bills: 0, total_amount: 0, total_paid: 0, total_due: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  // AI Bill Scanner State
  const [scanningBill, setScanningBill] = useState<boolean>(false);
  const [billImagePreview, setBillImagePreview] = useState<string | null>(null);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [vendorName, setVendorName] = useState('');
  const [vendorBillNumber, setVendorBillNumber] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Raw Materials');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [taxAmount, setTaxAmount] = useState<number | string>(0);
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<
    { item_name: string; product_id?: number; quantity: number; unit: string; unit_price: number; auto_update_stock: boolean }[]
  >([
    { item_name: '', quantity: 1, unit: 'kg', unit_price: 0, auto_update_stock: true }
  ]);

  useEffect(() => {
    loadData();
    loadCatalog();
  }, [search, categoryFilter, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        purchaseApi.list({
          search: search.trim() || undefined,
          category: categoryFilter || undefined,
          payment_status: statusFilter || undefined,
          limit: 100,
        }),
        purchaseApi.getStats(),
      ]);
      setPurchases(listRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const res = await productApi.list({ active_only: true });
      setCatalogProducts(res.data);
    } catch (err) {
      console.error('Failed to load catalog products:', err);
    }
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      { item_name: '', quantity: 1, unit: 'kg', unit_price: 0, auto_update_stock: true }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSelectProduct = (index: number, productId: number) => {
    const p = catalogProducts.find((cp) => cp.id === productId);
    if (!p) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      product_id: p.id,
      item_name: p.name,
      unit: p.unit || 'kg',
      unit_price: p.price || 0,
    };
    setItems(updated);
  };

  const itemsSubtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0
  );
  const numericTax = Number(taxAmount) || 0;
  const grandTotal = Math.round((itemsSubtotal + numericTax) * 100) / 100;
  const numericPaid = amountPaid === '' ? grandTotal : Number(amountPaid) || 0;
  const balanceDue = Math.max(0, Math.round((grandTotal - numericPaid) * 100) / 100);

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!vendorName.trim()) {
      alert(isTamil ? 'விற்பனையாளர் பெயரை உள்ளிடவும்' : 'Please enter vendor name');
      return;
    }
    const validItems = items.filter((i) => i.item_name.trim() && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      alert(isTamil ? 'குறைந்தது ஒரு பொருளையாவது சேர்க்கவும்' : 'Please add at least one item');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        vendor_name: vendorName.trim(),
        vendor_bill_number: vendorBillNumber.trim() || undefined,
        vendor_phone: vendorPhone.trim() || undefined,
        vendor_gstin: vendorGstin.trim() || undefined,
        purchase_date: purchaseDate,
        category,
        subtotal: itemsSubtotal,
        tax_amount: numericTax,
        grand_total: grandTotal,
        amount_paid: numericPaid,
        balance_due: balanceDue,
        payment_method: paymentMethod,
        payment_status: numericPaid >= grandTotal ? 'paid' : numericPaid > 0 ? 'partially_paid' : 'pending',
        notes: notes.trim() || undefined,
        items: validItems.map((it) => ({
          item_name: it.item_name.trim(),
          product_id: it.product_id,
          quantity: Number(it.quantity),
          unit: it.unit || 'kg',
          unit_price: Number(it.unit_price) || 0,
          total_amount: Number((Number(it.quantity) * Number(it.unit_price)).toFixed(2)),
          auto_update_stock: it.auto_update_stock,
        })),
      };

      await purchaseApi.create(payload);
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      alert(
        isTamil
          ? 'கொள்முதல் பதிவில் பிழை: ' + (err.response?.data?.detail || err.message)
          : 'Failed to record purchase: ' + (err.response?.data?.detail || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setVendorName('');
    setVendorBillNumber('');
    setVendorPhone('');
    setVendorGstin('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setCategory('Raw Materials');
    setPaymentMethod('bank_transfer');
    setTaxAmount(0);
    setAmountPaid('');
    setNotes('');
    setBillImagePreview(null);
    setScanSuccessMessage(null);
    setScanErrorMessage(null);
    setItems([{ item_name: '', quantity: 1, unit: 'kg', unit_price: 0, auto_update_stock: true }]);
  };

  const handleBillImageUpload = async (file: File) => {
    if (!file) return;
    try {
      setScanningBill(true);
      setScanErrorMessage(null);
      setScanSuccessMessage(null);

      // Create local image preview
      const previewUrl = URL.createObjectURL(file);
      setBillImagePreview(previewUrl);

      // Ensure modal is open so the user sees the extraction happening live
      setShowAddModal(true);

      const res = await purchaseApi.extractBill(file);
      const data = res.data?.data;
      if (data) {
        if (data.vendor_name) setVendorName(data.vendor_name);
        if (data.vendor_bill_number) setVendorBillNumber(data.vendor_bill_number);
        if (data.vendor_phone) setVendorPhone(data.vendor_phone);
        if (data.vendor_gstin) setVendorGstin(data.vendor_gstin);
        if (data.purchase_date) setPurchaseDate(data.purchase_date);
        if (data.category) setCategory(data.category);
        if (data.payment_method) setPaymentMethod(data.payment_method);
        if (data.tax_amount !== undefined) setTaxAmount(Number(data.tax_amount) || 0);
        if (data.amount_paid !== undefined) setAmountPaid(data.amount_paid);
        if (data.notes) setNotes(data.notes);

        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(
            data.items.map((it: any) => ({
              item_name: it.item_name || it.product || '',
              product_id: undefined,
              quantity: Number(it.quantity) || 1,
              unit: it.unit || 'kg',
              unit_price: Number(it.unit_price || it.price) || 0,
              auto_update_stock: it.auto_update_stock !== false,
            }))
          );
        }
        setScanSuccessMessage(
          isTamil
            ? 'பில் விவரங்கள் மற்றும் பொருட்கள் வெற்றிகரமாகப் பிரிக்கப்பட்டு அட்டவணையில் சேர்க்கப்பட்டன!'
            : 'Bill details and line items extracted and arranged in table successfully!'
        );
      }
    } catch (err: any) {
      console.error('Error scanning purchase bill:', err);
      setScanErrorMessage(
        isTamil
          ? 'பில் படம் ஸ்கேன் செய்வதில் பிழை ஏற்பட்டது. கைமுறையாக விவரங்களை நிரப்பவும்.'
          : 'Failed to extract bill image. You can enter details manually.'
      );
    } finally {
      setScanningBill(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(isTamil ? 'இந்த கொள்முதல் பதிவை நீக்க வேண்டுமா?' : 'Delete this purchase record?')) return;
    try {
      await purchaseApi.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" style={{ background: 'transparent' }}>
      <PageHeader
        title={isTamil ? 'சரக்கு கொள்முதல் & வரவு பில்கள்' : 'Stock Purchases & Inward Bills'}
        subtitle={
          isTamil
            ? 'விவசாயிகள், மில்கள் மற்றும் வெளி சப்ளையர்களிடம் வாங்கிய சரக்கு பில்கள் & வரவு கணக்கு'
            : 'Track stock purchases, raw seeds, packaging materials & farmer inward bills'
        }
        badge={isTamil ? 'கொள்முதல் மேலாண்மை' : 'Stock Inward Ledger'}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleBillImageUpload(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanningBill}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-black border-2 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}
              title={isTamil ? 'பில் புகைப்படம் எடுத்து விவரங்களை எடுக்க' : 'Snap or Upload Bill Photo'}
            >
              {scanningBill ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#2D6A4F]" />
              ) : (
                <Camera className="w-4 h-4 text-[#C68B3A]" />
              )}
              <span>
                {scanningBill
                  ? (isTamil ? 'பிரித்தெடுக்கிறது...' : 'Scanning...')
                  : (isTamil ? '📷 பில் படம் எடுக்க / சேர்க்க' : '📷 Snap Bill Photo')}
              </span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ background: '#2D6A4F', color: 'white' }}
            >
              <Plus className="w-4 h-4 text-[#C68B3A]" />
              <span>{isTamil ? 'புதிய கொள்முதல் சேர்' : 'Record Inward Bill'}</span>
            </button>
          </div>
        }
      />

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border shadow-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: '#8C8880' }}>
            <span>{isTamil ? 'மொத்த கொள்முதல்' : 'Total Purchases'}</span>
            <div className="p-2 rounded-xl" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black" style={{ color: '#1C1A15', fontFamily: 'Georgia, serif' }}>
            ₹{Number(stats.total_amount || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#8C8880' }}>
            {stats.total_bills || 0} {isTamil ? 'பில்கள் வரவு' : 'Inward bills'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border shadow-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: '#8C8880' }}>
            <span>{isTamil ? 'செலுத்திய தொகை' : 'Amount Paid'}</span>
            <div className="p-2 rounded-xl" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black" style={{ color: '#2D6A4F', fontFamily: 'Georgia, serif' }}>
            ₹{Number(stats.total_paid || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#2D6A4F' }}>
            {isTamil ? 'விற்பனையாளர்களுக்கு வழங்கியது' : 'Disbursed to suppliers'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border shadow-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: '#8C8880' }}>
            <span>{isTamil ? 'பாக்கி தொகை' : 'Supplier Balance Due'}</span>
            <div className="p-2 rounded-xl" style={{ background: '#FEF3F2', color: '#B42318' }}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black" style={{ color: '#B42318', fontFamily: 'Georgia, serif' }}>
            ₹{Number(stats.total_due || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#B42318' }}>
            {isTamil ? 'செலுத்த வேண்டிய பாக்கி' : 'Pending payables'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border shadow-xs" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: '#8C8880' }}>
            <span>{isTamil ? 'முக்கிய சரக்கு வகைகள்' : 'Categories'}</span>
            <div className="p-2 rounded-xl" style={{ background: '#FDF3E3', color: '#C68B3A' }}>
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-black truncate" style={{ color: '#1C1A15' }}>
            {isTamil ? 'விதைகள் & மரச்செக்கு copra' : 'Seeds, Copra & Packs'}
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#8C8880' }}>
            {isTamil ? 'சரக்கு இருப்புடன் தானியங்கி இணைப்பு' : 'Auto-linked with stock inventory'}
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl border shadow-xs flex flex-wrap items-center gap-3" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8C8880' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'சப்ளையர் பெயர் அல்லது பில் எண் தேடவும்...' : 'Search supplier name or bill number...'}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs font-medium focus:outline-hidden"
            style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-hidden"
          style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
        >
          <option value="">{isTamil ? 'அனைத்து வகைகள் (All Categories)' : 'All Categories'}</option>
          <option value="Raw Materials">{isTamil ? 'மூலப்பொருட்கள் (Raw Materials)' : 'Raw Materials'}</option>
          <option value="Copra & Oil Seeds">{isTamil ? 'எண்ணெய் விதைகள் & கொப்பரை' : 'Copra & Oil Seeds'}</option>
          <option value="Packaging & Bottles">{isTamil ? 'பாட்டில்கள் & கவர்கள் (Packaging)' : 'Packaging & Bottles'}</option>
          <option value="Wholesale Goods">{isTamil ? 'மொத்த சரக்கு (Wholesale Goods)' : 'Wholesale Goods'}</option>
          <option value="Transport & Freight">{isTamil ? 'போக்குவரத்து (Transport)' : 'Transport & Freight'}</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-hidden"
          style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
        >
          <option value="">{isTamil ? 'அனைத்து நிலைகள் (All Status)' : 'All Status'}</option>
          <option value="paid">{isTamil ? 'முழுவதும் செலுத்தப்பட்டது (Paid)' : 'Paid'}</option>
          <option value="partially_paid">{isTamil ? 'பகுதி செலுத்தியது (Partial)' : 'Partially Paid'}</option>
          <option value="pending">{isTamil ? 'பாக்கி (Pending)' : 'Pending'}</option>
        </select>
      </div>

      {/* PURCHASES TABLE */}
      <div className="rounded-2xl border shadow-xs overflow-hidden" style={{ background: 'white', borderColor: '#EEEAE0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="font-semibold uppercase tracking-wider text-[11px] border-b" style={{ background: '#EEEAE0', color: '#4A4740' }}>
              <tr>
                <th className="px-4 py-3.5">{isTamil ? 'தேதி' : 'Date'}</th>
                <th className="px-4 py-3.5">{isTamil ? 'விற்பனையாளர் / மில்' : 'Supplier / Mill'}</th>
                <th className="px-4 py-3.5">{isTamil ? 'பில் எண்' : 'Bill #'}</th>
                <th className="px-4 py-3.5">{isTamil ? 'சரக்கு வகை' : 'Category'}</th>
                <th className="px-4 py-3.5 text-right">{isTamil ? 'மொத்தம்' : 'Total (₹)'}</th>
                <th className="px-4 py-3.5 text-right">{isTamil ? 'செலுத்தியது' : 'Paid (₹)'}</th>
                <th className="px-4 py-3.5 text-right">{isTamil ? 'பாக்கி' : 'Balance Due (₹)'}</th>
                <th className="px-4 py-3.5 text-center">{isTamil ? 'நிலை' : 'Status'}</th>
                <th className="px-4 py-3.5 text-right">{isTamil ? 'செயல்' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#EEEAE0' }}>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center" style={{ color: '#8C8880' }}>
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: '#2D6A4F' }}></div>
                    <span>{isTamil ? 'கொள்முதல் விபரங்கள் ஏற்றப்படுகின்றன...' : 'Loading purchases...'}</span>
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center" style={{ color: '#8C8880' }}>
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm" style={{ color: '#1C1A15' }}>
                      {isTamil ? 'கொள்முதல் பில்கள் எதுவும் இல்லை' : 'No purchase bills found'}
                    </p>
                    <p className="text-xs mt-1">
                      {isTamil ? '"புதிய கொள்முதல் சேர்" பொத்தானை அழுத்தி பதிவிடவும்' : 'Click "Record Inward Bill" to add your first stock inward'}
                    </p>
                  </td>
                </tr>
              ) : (
                purchases.map((p) => {
                  const isPaid = p.payment_status === 'paid';
                  const isPartial = p.payment_status === 'partially_paid';

                  return (
                    <tr key={p.id} className="hover:bg-[#F7F5EF] transition-colors">
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: '#4A4740' }}>
                        {p.purchase_date}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold" style={{ color: '#1C1A15' }}>{p.vendor_name}</div>
                        {p.vendor_phone && <div className="text-[10px]" style={{ color: '#8C8880' }}>{p.vendor_phone}</div>}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold" style={{ color: '#2D6A4F' }}>
                        {p.vendor_bill_number || '—'}
                      </td>
                      <td className="px-4 py-3.5 font-semibold" style={{ color: '#4A4740' }}>
                        {p.category}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-sm" style={{ color: '#1C1A15' }}>
                        ₹{Number(p.grand_total).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold" style={{ color: '#2D6A4F' }}>
                        ₹{Number(p.amount_paid).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold" style={{ color: p.balance_due > 0 ? '#B42318' : '#8C8880' }}>
                        ₹{Number(p.balance_due).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border"
                          style={{
                            background: isPaid ? '#EBF5EE' : isPartial ? '#FDF3E3' : '#FEF3F2',
                            color: isPaid ? '#2D6A4F' : isPartial ? '#C68B3A' : '#B42318',
                            borderColor: isPaid ? '#B7D9C4' : isPartial ? '#F4D2A2' : '#FECDCA',
                          }}
                        >
                          {isPaid ? (isTamil ? 'செலுத்தியது' : 'Paid') : isPartial ? (isTamil ? 'பகுதி பாக்கி' : 'Partial') : (isTamil ? 'பாக்கி' : 'Pending')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD INWARD PURCHASE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ background: 'rgba(28, 26, 21, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5 border" style={{ borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#EEEAE0' }}>
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base" style={{ color: '#1C1A15' }}>
                    {isTamil ? 'புதிய சரக்கு கொள்முதல் பதிவு' : 'Record Outside Stock Purchase'}
                  </h3>
                  <p className="text-xs" style={{ color: '#8C8880' }}>
                    {isTamil ? 'விவசாயிகள் மற்றும் சப்ளையர்களிடமிருந்து சரக்கு வரவு' : 'Inward stock from farmers, copra mills & packaging suppliers'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-xl cursor-pointer" style={{ color: '#8C8880' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="space-y-4 text-xs">
              {/* AI BILL PHOTO SCANNER DROPZONE */}
              <div
                className="p-3.5 sm:p-4 rounded-2xl border-2 border-dashed transition-all"
                style={{
                  background: '#F7F5EF',
                  borderColor: billImagePreview ? '#2D6A4F' : '#B7D9C4',
                }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {billImagePreview ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#2D6A4F] flex-shrink-0 shadow-xs bg-white">
                        <img src={billImagePreview} alt="Bill Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setBillImagePreview(null);
                            setScanSuccessMessage(null);
                          }}
                          className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
                        <Camera className="w-5 h-5 text-[#2D6A4F]" />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-xs sm:text-sm flex items-center space-x-1.5" style={{ color: '#1C1A15' }}>
                        <span>{isTamil ? 'பில் புகைப்படம் / பில் சீட்டை இணைக்கவும் (AI OCR)' : 'Attach or Snap Purchase Bill (AI OCR)'}</span>
                        <Sparkles className="w-3.5 h-3.5 text-[#C68B3A]" />
                      </p>
                      <p className="text-[11px] font-medium" style={{ color: '#8C8880' }}>
                        {isTamil
                          ? 'படம் இணைத்தால் சப்ளையர் பெயர், பில் எண் மற்றும் பொருட்களை தானாகவே அட்டவணையில் பிரித்து அமைக்கும்'
                          : 'Attaching photo auto-extracts supplier, bill number, and item rows into the table'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="modal-bill-upload"
                      type="file"
                      accept="image/*,.pdf"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleBillImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <label
                      htmlFor="modal-bill-upload"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
                      style={{ background: '#2D6A4F', color: 'white' }}
                    >
                      {scanningBill ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C68B3A]" />
                          <span>{isTamil ? 'ஸ்கேன் ஆகிறது...' : 'Extracting...'}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-[#C68B3A]" />
                          <span>{billImagePreview ? (isTamil ? 'வேறு படம் மாற்றுக' : 'Change Photo') : (isTamil ? 'படம் சேர்க்க / எடுக்க' : 'Upload / Snap Photo')}</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {scanSuccessMessage && (
                  <div className="mt-2.5 p-2 rounded-xl text-xs font-bold flex items-center space-x-2 border" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#2D6A4F' }} />
                    <span>{scanSuccessMessage}</span>
                  </div>
                )}
                {scanErrorMessage && (
                  <div className="mt-2.5 p-2 rounded-xl text-xs font-bold flex items-center space-x-2 border" style={{ background: '#FEF3F2', borderColor: '#FECDCA', color: '#B42318' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#B42318' }} />
                    <span>{scanErrorMessage}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'சப்ளையர் / மில் பெயர் *' : 'Vendor / Farmer Name *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder={isTamil ? 'எ.கா. ஈரோடு ஆர்கானிக் மில்' : 'e.g. Erode Farmer Copra Mill'}
                    className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'விற்பனையாளர் பில் எண்' : 'Vendor Invoice / Bill No'}
                  </label>
                  <input
                    type="text"
                    value={vendorBillNumber}
                    onChange={(e) => setVendorBillNumber(e.target.value)}
                    placeholder="INV-2026-081"
                    className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'கைபேசி எண்' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    placeholder="98421 12345"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'கொள்முதல் தேதி *' : 'Purchase Date *'}
                  </label>
                  <input
                    required
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'சரக்கு வகை' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  >
                    <option value="Raw Materials">Raw Materials (மூலப்பொருள்)</option>
                    <option value="Copra & Oil Seeds">Copra & Seeds (விதைகள்)</option>
                    <option value="Packaging & Bottles">Packaging & Bottles (பாட்டில்கள்)</option>
                    <option value="Wholesale Goods">Wholesale Goods (மொத்த சரக்கு)</option>
                    <option value="Transport & Freight">Transport & Freight (போக்குவரத்து)</option>
                  </select>
                </div>
              </div>

              {/* LINE ITEMS TABLE */}
              <div className="pt-2 border-t" style={{ borderColor: '#EEEAE0' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs uppercase tracking-wider" style={{ color: '#2D6A4F' }}>
                    {isTamil ? 'சரக்கு விபரங்கள் (Items List)' : 'Purchased Items List'}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer"
                    style={{ background: '#EBF5EE', color: '#2D6A4F' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'பொருள் சேர்' : 'Add Line'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                      style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}
                    >
                      <div className="flex-1">
                        <input
                          required
                          type="text"
                          value={it.item_name}
                          onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                          placeholder={isTamil ? 'பொருள் பெயர் (எ.கா. நாட்டு எள்)' : 'Item name (e.g. Sesame Seeds Grade A)'}
                          className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold focus:outline-hidden bg-white"
                          style={{ borderColor: '#EEEAE0', color: '#1C1A15' }}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold text-center bg-white"
                            style={{ borderColor: '#EEEAE0', color: '#1C1A15' }}
                            placeholder="Qty"
                          />
                        </div>

                        <select
                          value={it.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="px-2 py-1.5 border rounded-lg text-xs font-semibold bg-white"
                          style={{ borderColor: '#EEEAE0', color: '#1C1A15' }}
                        >
                          <option value="kg">kg</option>
                          <option value="liter">liter</option>
                          <option value="g">g</option>
                          <option value="tin">tin</option>
                          <option value="bag">bag</option>
                          <option value="pcs">pcs</option>
                          <option value="bottle">bottle</option>
                        </select>

                        <div className="w-24">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={it.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold text-right bg-white"
                            style={{ borderColor: '#EEEAE0', color: '#1C1A15' }}
                            placeholder="Price"
                          />
                        </div>

                        <div className="w-24 text-right font-black text-xs whitespace-nowrap" style={{ color: '#2D6A4F' }}>
                          ₹{Number((it.quantity * it.unit_price).toFixed(2)).toLocaleString('en-IN')}
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTALS & PAYMENT */}
              <div className="p-4 rounded-2xl border space-y-3" style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                      {isTamil ? 'வரி / GST (₹)' : 'Tax / GST Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white"
                      style={{ borderColor: '#EEEAE0', color: '#1C1A15' }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                      {isTamil ? 'செலுத்திய தொகை (₹) *' : 'Amount Paid (₹) *'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder={`Full: ₹${grandTotal}`}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-black bg-white"
                      style={{ borderColor: '#EEEAE0', color: '#2D6A4F' }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                      {isTamil ? 'பணம் செலுத்திய விதம்' : 'Payment Method'}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-white"
                      style={{ borderColor: '#EEEAE0', color: '#1C1A15' }}
                    >
                      <option value="bank_transfer">{isTamil ? 'வங்கி பரிவர்த்தனை (Bank/NEFT)' : 'Bank Transfer / NEFT'}</option>
                      <option value="upi">{isTamil ? 'GPay / UPI' : 'UPI / GPay'}</option>
                      <option value="cash">{isTamil ? 'ரொக்கம் (Cash)' : 'Cash'}</option>
                      <option value="cheque">{isTamil ? 'காசோலை (Cheque)' : 'Cheque'}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: '#EEEAE0' }}>
                  <span className="font-bold" style={{ color: '#8C8880' }}>
                    {isTamil ? 'பொருட்கள் மதிப்பு: ' : 'Subtotal: '}₹{itemsSubtotal.toFixed(2)} + GST: ₹{numericTax.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black" style={{ color: '#1C1A15' }}>
                      {isTamil ? 'மொத்த பில் தொகை:' : 'Grand Total:'} ₹{grandTotal.toFixed(2)}
                    </span>
                    {balanceDue > 0 && (
                      <span className="text-xs font-bold text-rose-600">
                        ({isTamil ? 'பாக்கி: ' : 'Balance: '}₹{balanceDue.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'குறிப்புகள் / விவரங்கள்' : 'Remarks / Purchase Notes'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isTamil ? 'எடை, தரம், லாரி ரசீது எண்...' : 'Quality, lot number, transport LR number...'}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs font-medium focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t" style={{ borderColor: '#EEEAE0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 font-bold rounded-xl text-xs cursor-pointer"
                  style={{ background: '#F7F5EF', color: '#4A4740' }}
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 font-black rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                  style={{ background: '#2D6A4F', color: 'white' }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{isTamil ? 'கொள்முதல் பில் சேமி' : 'Save Purchase Bill'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Purchases;
