import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { customerApi, productApi, orderApi } from '../services/api';
import { Customer, Product, OrderItem } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  Plus,
  Minus,
  Trash2,
  Calculator,
  UserPlus,
  AlertCircle,
  ArrowRight,
  User,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Truck,
  Phone,
  MapPin,
  Check,
  Package,
  ClipboardPaste,
  RefreshCw,
  X
} from 'lucide-react';

export const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const isTamil = language === 'ta';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  
  // Order Line Items
  const [items, setItems] = useState<OrderItem[]>([
    {
      product_id: undefined,
      product_name: '',
      unit: 'kg',
      unit_price: 0,
      quantity: 1,
      tax_percentage: 0,
      discount: 0,
      total_amount: 0,
    },
  ]);

  // Totals & Adjustments
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [includePreviousBalance, setIncludePreviousBalance] = useState<boolean>(true);
  const [courierCharges, setCourierCharges] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<'store' | 'courier'>('store');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>('paid');
  const [partialAmountPaid, setPartialAmountPaid] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [notes, setNotes] = useState<string>('');
  
  // Quick Add Customer Modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // WhatsApp Order Paste Modal
  const [showWhatsAppOrderModal, setShowWhatsAppOrderModal] = useState(false);
  const [whatsAppText, setWhatsAppText] = useState('');
  const [parsingWhatsApp, setParsingWhatsApp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (location.state && location.state.extracted) {
      const ext = location.state.extracted;
      if (ext.courier_charge !== undefined) {
        setCourierCharges(ext.courier_charge);
        if (ext.courier_charge > 0) setDeliveryType('courier');
      }
      if (ext.previous_balance !== undefined) setPreviousBalance(ext.previous_balance);
      if (ext.discount !== undefined) setDiscountAmount(ext.discount);
      if (ext.items && ext.items.length > 0) {
        setItems(
          ext.items.map((i: any) => ({
            product_name: i.product,
            unit: i.unit || 'kg',
            unit_price: i.price || 0,
            quantity: i.quantity || 1,
            tax_percentage: 0,
            discount: 0,
            total_amount: (i.quantity || 1) * (i.price || 0),
          }))
        );
      }
    }
  }, [location.state]);

  const loadInitialData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        customerApi.list(),
        productApi.list({ active_only: true }),
      ]);
      setCustomers(cRes.data);
      setProducts(pRes.data);

      if (cRes.data.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(cRes.data[0].id);
        setPreviousBalance(cRes.data[0].previous_balance || 0);
      }
    } catch (err) {
      console.error('Failed to load customers or products:', err);
    }
  };

  const handleCustomerChange = (customerId: number) => {
    setSelectedCustomerId(customerId);
    const c = customers.find((cust) => cust.id === customerId);
    if (c) {
      setPreviousBalance(c.previous_balance || 0);
    }
  };

  const handleAddProductFromCatalog = (product: Product) => {
    const existingIndex = items.findIndex((i) => i.product_id === product.id);
    if (existingIndex >= 0) {
      const newItems = [...items];
      const newQty = (newItems[existingIndex].quantity || 0) + 1;
      newItems[existingIndex].quantity = newQty;
      newItems[existingIndex].total_amount = Number((newQty * product.price).toFixed(2));
      setItems(newItems);
      return;
    }
    if (items.length === 1 && !items[0].product_name && items[0].unit_price === 0) {
      setItems([
        {
          product_id: product.id,
          product_name: product.name,
          unit: product.unit || 'kg',
          unit_price: product.price,
          quantity: 1,
          tax_percentage: product.tax_percentage || 0,
          discount: 0,
          total_amount: product.price,
        },
      ]);
      return;
    }
    setItems([
      ...items,
      {
        product_id: product.id,
        product_name: product.name,
        unit: product.unit || 'kg',
        unit_price: product.price,
        quantity: 1,
        tax_percentage: product.tax_percentage || 0,
        discount: 0,
        total_amount: product.price,
      },
    ]);
  };

  const mergeItemsDeduplicated = (existingList: OrderItem[], incomingList: OrderItem[]): OrderItem[] => {
    const base =
      existingList.length === 1 && !existingList[0].product_name && Number(existingList[0].unit_price) === 0
        ? []
        : [...existingList];

    const result = [...base];
    for (const inc of incomingList) {
      const matchIndex = result.findIndex(
        (ex) =>
          (inc.product_id && ex.product_id && ex.product_id === inc.product_id) ||
          (ex.product_name &&
            inc.product_name &&
            ex.product_name.trim().toLowerCase() === inc.product_name.trim().toLowerCase())
      );
      if (matchIndex >= 0) {
        const existingItem = result[matchIndex];
        const newQty = (Number(existingItem.quantity) || 0) + (Number(inc.quantity) || 1);
        const price = Number(inc.unit_price) || Number(existingItem.unit_price) || 0;
        result[matchIndex] = {
          ...existingItem,
          quantity: newQty,
          unit_price: price,
          total_amount: Number((newQty * price).toFixed(2)),
        };
      } else {
        result.push(inc);
      }
    }
    return result;
  };

  const handleProductSelect = (index: number, productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    // Check if another row already has this product to avoid duplicate rows
    const existingIndex = items.findIndex((item, i) => i !== index && item.product_id === productId);
    if (existingIndex >= 0) {
      const newItems = [...items];
      const curQty = Number(newItems[existingIndex].quantity) || 1;
      const addQty = Number(newItems[index].quantity) || 1;
      const totalQty = curQty + addQty;
      newItems[existingIndex].quantity = totalQty;
      newItems[existingIndex].total_amount = Number((totalQty * prod.price).toFixed(2));
      if (newItems.length > 1) {
        newItems.splice(index, 1);
      }
      setItems(newItems);
      return;
    }

    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const price = prod.price;
    const lineTotal = Number((qty * price).toFixed(2));
    newItems[index] = {
      product_id: prod.id,
      product_name: prod.name,
      unit: prod.unit,
      unit_price: price,
      quantity: qty,
      tax_percentage: prod.tax_percentage || 0,
      discount: 0,
      total_amount: lineTotal,
    };
    setItems(newItems);
  };

  const handleQuantityStep = (index: number, delta: number) => {
    const newItems = [...items];
    const currentQty = Number(newItems[index].quantity) || 1;
    const newQty = Math.max(1, currentQty + delta);
    newItems[index].quantity = newQty;
    const price = Number(newItems[index].unit_price) || 0;
    newItems[index].total_amount = Number((newQty * price).toFixed(2));
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const disc = Number(item.discount) || 0;
    const lineBase = Math.max(0, qty * price - disc);
    item.total_amount = Number(lineBase.toFixed(2));
    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        product_id: undefined,
        product_name: '',
        unit: 'kg',
        unit_price: 0,
        quantity: 1,
        tax_percentage: 0,
        discount: 0,
        total_amount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      setItems([
        {
          product_id: undefined,
          product_name: '',
          unit: 'kg',
          unit_price: 0,
          quantity: 1,
          tax_percentage: 0,
          discount: 0,
          total_amount: 0,
        },
      ]);
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleDeliveryToggle = (type: 'store' | 'courier') => {
    setDeliveryType(type);
    if (type === 'store') setCourierCharges(0);
    else setCourierCharges(60);
  };

  const subtotal = Number(
    items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price) || 0), 0).toFixed(2)
  );
  const appliedPreviousBalance = includePreviousBalance ? Number(previousBalance || 0) : 0;
  const grandTotal = Number((subtotal + appliedPreviousBalance + Number(courierCharges || 0) - Number(discountAmount || 0)).toFixed(2));

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    try {
      const res = await customerApi.create({
        name: newCustName,
        phone: newCustPhone,
        address: newCustAddress || 'Direct Store Visit',
        city: 'Kangeyam',
        district: 'Tirupur',
        state: 'Tamil Nadu',
        previous_balance: 0,
      });
      setCustomers([res.data, ...customers]);
      setSelectedCustomerId(res.data.id);
      setPreviousBalance(0);
      setShowAddCustomer(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustAddress('');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add customer');
    }
  };

  const handleParseAndAddWhatsAppOrder = async () => {
    if (!whatsAppText.trim()) return;
    setParsingWhatsApp(true);
    try {
      const res = await productApi.parseText(whatsAppText);
      const parsed = res.data.items;
      if (parsed.length > 0) {
        const newOrderItems: OrderItem[] = parsed.map((p) => {
          const matchedProd = products.find(
            (sp) =>
              (p.name_ta && sp.name.toLowerCase().includes(p.name_ta.toLowerCase())) ||
              (p.name_en && sp.name.toLowerCase().includes(p.name_en.toLowerCase()))
          );
          const unitPrice = p.price > 0 ? p.price : (matchedProd ? matchedProd.price : 0);
          const qty = p.quantity > 0 ? p.quantity : 1;
          const lineTotal = Number((qty * unitPrice).toFixed(2));
          return {
            product_id: matchedProd ? matchedProd.id : undefined,
            product_name: p.name,
            unit: p.unit || (matchedProd ? matchedProd.unit : 'kg'),
            unit_price: unitPrice,
            quantity: qty,
            tax_percentage: 0,
            discount: 0,
            total_amount: lineTotal,
          };
        });
        const deduplicatedList = mergeItemsDeduplicated(items, newOrderItems);
        setItems(deduplicatedList);
        setShowWhatsAppOrderModal(false);
        setWhatsAppText('');
      }
    } catch (err: any) {
      alert(
        isTamil
          ? 'வாட்ஸ்அப் உரையை பிரித்தெடுப்பதில் பிழை: ' + (err.response?.data?.detail || err.message)
          : 'Failed to parse order: ' + (err.response?.data?.detail || err.message)
      );
    } finally {
      setParsingWhatsApp(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    if (!selectedCustomerId) {
      setError(isTamil ? 'வாடிக்கையாளரைத் தேர்வு செய்யவும்.' : 'Please select a customer.');
      return;
    }
    const validItems = items.filter((i) => i.product_name.trim() && i.quantity > 0);
    if (validItems.length === 0) {
      setError(isTamil ? 'தயவுசெய்து குறைந்தது ஒரு பொருளையாவது பில்லில் சேர்க்கவும்.' : 'Please add at least one product with name and quantity.');
      return;
    }
    if (paymentStatus === 'partially_paid') {
      if (partialAmountPaid === '' || Number(partialAmountPaid) <= 0) {
        setError(isTamil ? 'தயவுசெய்து வாடிக்கையாளர் தற்போது செலுத்திய தொகையை (Paid Amount) உள்ளிடவும்.' : 'Please enter the amount paid by the customer.');
        return;
      }
      if (Number(partialAmountPaid) >= grandTotal) {
        setError(isTamil ? 'முழுத் தொகையும் செலுத்தப்பட்டால் "முழு பணம் கொடுத்தார்" (Paid in Full) தேர்வு செய்யவும்.' : 'Paid amount equals or exceeds grand total. Please select "Paid in Full".');
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const computedAmountPaid = paymentStatus === 'paid' ? grandTotal : paymentStatus === 'partially_paid' ? Number(partialAmountPaid) || 0 : 0.0;
      const payload = {
        customer_id: Number(selectedCustomerId),
        items: validItems.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          unit: i.unit || 'kg',
          unit_price: Number(i.unit_price),
          quantity: Number(i.quantity),
          tax_percentage: Number(i.tax_percentage || 0),
          discount: Number(i.discount || 0),
        })),
        courier_charges: Number(courierCharges || 0),
        previous_balance: appliedPreviousBalance,
        discount_amount: Number(discountAmount || 0),
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        amount_paid: computedAmountPaid,
        notes: notes || undefined,
        auto_generate_invoice: true,
      };
      const res = await orderApi.create(payload);
      if (res.data.invoice_id) navigate(`/invoices/${res.data.invoice_id}`);
      else navigate('/invoices');
    } catch (err: any) {
      setError(err.response?.data?.detail || (isTamil ? 'பில் உருவாக்குவதில் பிழை ஏற்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும்.' : 'Failed to create order.'));
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === Number(selectedCustomerId));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12" style={{ background: 'transparent' }}>
      <PageHeader
        title={isTamil ? 'புதிய பில் போடுங்க' : 'Create Customer Bill'}
        subtitle={isTamil ? 'வாடிக்கையாளரைத் தேர்வு செய்து, பொருட்களைத் தட்டி 1 நிமிடத்தில் பில் கொடுங்கள்' : 'Select customer, tap organic items, and issue bill immediately'}
        badge={isTamil ? 'எளிய பில்லிங்' : 'Quick Store Billing'}
      />

      {error && (
        <div className="p-4 border-2 font-bold rounded-2xl flex items-center space-x-3 text-sm" style={{ background: '#FDF3E3', borderColor: '#C68B3A', color: '#1C1A15' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#C68B3A' }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-7">
        {/* STEP 1: CUSTOMER SELECTION */}
        <div className="p-6 sm:p-7 rounded-3xl border shadow-xs space-y-5" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ background: '#2D6A4F', color: 'white' }}>
                1
              </span>
              <h2 className="text-lg font-black" style={{ color: '#1C1A15' }}>
                {isTamil ? 'வாடிக்கையாளர் யார்?' : 'Step 1: Who is the Customer?'}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCustomer(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 font-black text-xs rounded-xl transition-all cursor-pointer self-start sm:self-auto"
              style={{ background: '#EBF5EE', color: '#2D6A4F' }}
            >
              <UserPlus className="w-4 h-4" style={{ color: '#2D6A4F' }} />
              <span>+ {isTamil ? 'புதிய வாடிக்கையாளர் சேர்க்க' : 'Add New Customer'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: '#2D6A4F' }}>
                {isTamil ? 'வாடிக்கையாளரைத் தேர்ந்தெடுக்கவும் *' : 'Choose Customer *'}
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 rounded-2xl text-sm font-bold focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              >
                <option value="">{isTamil ? '-- வாடிக்கையாளரைத் தேர்வு செய்யவும் --' : '-- Choose Customer --'}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-4 border rounded-2xl space-y-1.5 text-xs" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#4A4740' }}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm" style={{ color: '#2D6A4F' }}>{selectedCustomer.name}</span>
                  <span className="font-bold">📞 {selectedCustomer.phone}</span>
                </div>
                <p className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8C8880' }} />
                  <span className="truncate">{selectedCustomer.address}, {selectedCustomer.city || 'Kangeyam'}</span>
                </p>

                {selectedCustomer.previous_balance > 0 ? (
                  <div className="mt-2 p-2.5 border rounded-xl font-bold flex items-center justify-between" style={{ background: '#FDF3E3', borderColor: '#C68B3A', color: '#C68B3A' }}>
                    <span className="flex items-center space-x-1.5">
                      <span>⚠️ {isTamil ? 'முந்தைய பாக்கி பணம்:' : 'Old Balance Due:'}</span>
                      <span className="text-base font-black">₹{selectedCustomer.previous_balance}</span>
                    </span>
                    <label className="inline-flex items-center space-x-1.5 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePreviousBalance}
                        onChange={(e) => setIncludePreviousBalance(e.target.checked)}
                        className="rounded"
                      />
                      <span>{isTamil ? 'பில்லில் சேர்க்க' : 'Add to bill'}</span>
                    </label>
                  </div>
                ) : (
                  <div className="text-[11px] font-bold flex items-center space-x-1" style={{ color: '#2D6A4F' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
                    <span>{isTamil ? 'முந்தைய பாக்கி எதுவும் இல்லை (Clean Record)' : 'No old pending balance'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: PRODUCTS & QUANTITY */}
        <div className="p-6 sm:p-7 rounded-3xl border shadow-xs space-y-6" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ background: '#2D6A4F', color: 'white' }}>
                2
              </span>
              <div>
                <h2 className="text-lg font-black" style={{ color: '#1C1A15' }}>
                  {isTamil ? 'பொருட்கள் சேர்க்கவும்' : 'Step 2: Add Items to Bill'}
                </h2>
                <p className="text-xs font-medium" style={{ color: '#8C8880' }}>
                  {isTamil ? 'கீழே உள்ள பொருட்களைத் தட்டினால் தானாக பில்லில் ஏறும்' : 'Tap items below to add instantly, or adjust with + / -'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowWhatsAppOrderModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                style={{ background: '#2D6A4F', color: 'white' }}
              >
                <ClipboardPaste className="w-4 h-4" style={{ color: '#C68B3A' }} />
                <span>+ {isTamil ? 'வாட்ஸ்அப் ஆர்டர் ஒட்டுக' : 'Paste WhatsApp Order'}</span>
              </button>

              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center space-x-2 px-4 py-2 font-black text-xs rounded-xl transition-all cursor-pointer"
                style={{ background: '#EBF5EE', color: '#2D6A4F' }}
              >
                <Plus className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span>+ {isTamil ? 'வேறு பொருள் சேர்க்க' : 'Add Custom Item'}</span>
              </button>
            </div>
          </div>

          {products.length > 0 && (
            <div>
              <span className="text-xs font-black uppercase tracking-wider block mb-2.5" style={{ color: '#8C8880' }}>
                {isTamil ? 'கடைப் பொருட்கள் (தட்டினால் உடனே சேரும்):' : 'Store Catalog (Tap to add):'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {products.slice(0, 8).map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAddProductFromCatalog(prod)}
                    className="p-3 border-2 rounded-2xl text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between group"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2D6A4F'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#EEEAE0'}
                  >
                    <span className="font-extrabold text-xs sm:text-sm line-clamp-1" style={{ color: '#1C1A15' }}>
                      {prod.name}
                    </span>
                    <span className="text-xs font-black mt-1" style={{ color: '#2D6A4F' }}>
                      ₹{prod.price} <span className="text-[10px] font-semibold" style={{ color: '#8C8880' }}>/ {prod.unit}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <span className="text-xs font-black uppercase tracking-wider block" style={{ color: '#2D6A4F' }}>
              {isTamil ? 'பில்லில் உள்ள பொருட்கள்:' : 'Items in Bill:'}
            </span>

            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 border-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}
              >
                <div className="flex-1 space-y-1.5">
                  <select
                    value={item.product_id || ''}
                    onChange={(e) => handleProductSelect(index, Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-hidden"
                    style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  >
                    <option value="">{isTamil ? '-- பொருளைத் தேர்ந்தெடுக்கவும் --' : '-- Choose from catalog --'}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price} / {p.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={item.product_name}
                    onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                    placeholder={isTamil ? 'பொருளின் பெயர் (எ.கா. நாட்டு சர்க்கரை)' : 'Item name (e.g. Country Sugar)'}
                    className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold focus:outline-hidden"
                    style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-24">
                    <span className="text-[10px] font-bold uppercase block" style={{ color: '#8C8880' }}>
                      {isTamil ? 'விலை (₹)' : 'Price (₹)'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border rounded-xl text-xs font-black focus:outline-hidden"
                      style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
                    />
                  </div>

                  <div className="w-16">
                    <span className="text-[10px] font-bold uppercase block" style={{ color: '#8C8880' }}>
                      {isTamil ? 'அளவு' : 'Unit'}
                    </span>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-xl text-xs font-bold text-center focus:outline-hidden"
                      style={{ background: 'white', borderColor: '#EEEAE0', color: '#4A4740' }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase block text-center" style={{ color: '#8C8880' }}>
                      {isTamil ? 'எண்ணிக்கை' : 'Quantity'}
                    </span>
                    <div className="flex items-center space-x-1.5 border-2 rounded-2xl p-1" style={{ background: 'white', borderColor: '#EEEAE0' }}>
                      <button
                        type="button"
                        onClick={() => handleQuantityStep(index, -1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-base cursor-pointer transition-colors"
                        style={{ background: '#F7F5EF', color: '#4A4740' }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-12 text-center text-sm font-black bg-transparent focus:outline-hidden"
                        style={{ color: '#2D6A4F' }}
                      />

                      <button
                        type="button"
                        onClick={() => handleQuantityStep(index, 1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-base cursor-pointer transition-colors"
                        style={{ background: '#EBF5EE', color: '#2D6A4F' }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right pl-3 pr-1 min-w-[90px]">
                    <span className="text-[10px] font-bold uppercase block" style={{ color: '#8C8880' }}>
                      {isTamil ? 'கூடுதல்' : 'Total'}
                    </span>
                    <span className="text-base sm:text-lg font-black block" style={{ color: '#1C1A15' }}>
                      ₹{item.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="p-2 rounded-xl cursor-pointer transition-colors"
                    title={isTamil ? 'பொருளை நீக்க' : 'Remove item'}
                    style={{ color: '#8C8880' }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 3: ARITHMETIC BREAKDOWN & PAYMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl border shadow-xs space-y-5" style={{ background: 'white', borderColor: '#EEEAE0' }}>
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ background: '#2D6A4F', color: 'white' }}>
                3
              </span>
              <h2 className="text-lg font-black" style={{ color: '#1C1A15' }}>
                {isTamil ? 'பணம் & விநியோகம்' : 'Step 3: Payment & Delivery'}
              </h2>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider" style={{ color: '#2D6A4F' }}>
                {isTamil ? 'விற்பனை வகை:' : 'Delivery Type:'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDeliveryToggle('store')}
                  className="p-3.5 rounded-2xl border-2 text-left font-bold text-xs flex items-center space-x-2.5 transition-all cursor-pointer"
                  style={{
                    background: deliveryType === 'store' ? '#EBF5EE' : 'white',
                    borderColor: deliveryType === 'store' ? '#2D6A4F' : '#EEEAE0',
                    color: deliveryType === 'store' ? '#2D6A4F' : '#4A4740'
                  }}
                >
                  <ShoppingBag className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  <span>{isTamil ? 'நேரடி கடை விற்பனை (₹0)' : 'Direct Store (₹0)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeliveryToggle('courier')}
                  className="p-3.5 rounded-2xl border-2 text-left font-bold text-xs flex items-center space-x-2.5 transition-all cursor-pointer"
                  style={{
                    background: deliveryType === 'courier' ? '#EBF5EE' : 'white',
                    borderColor: deliveryType === 'courier' ? '#2D6A4F' : '#EEEAE0',
                    color: deliveryType === 'courier' ? '#2D6A4F' : '#4A4740'
                  }}
                >
                  <Truck className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  <span>{isTamil ? 'கொரியர் பார்சல் (+₹60)' : 'Courier (+₹60)'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider" style={{ color: '#2D6A4F' }}>
                {isTamil ? 'வாடிக்கையாளர் பணம் கொடுத்தாரா?' : 'Payment Status:'}
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'paid', label: isTamil ? 'முழு பணம் கொடுத்தார்' : 'Paid in Full' },
                  { id: 'pending', label: isTamil ? 'பாக்கி உள்ளது (Due)' : 'Keep as Due' },
                  { id: 'partially_paid', label: isTamil ? 'பாதி பணம் கொடுத்தார்' : 'Partially Paid' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPaymentStatus(s.id)}
                    className="py-3 px-2 rounded-2xl border-2 font-black text-xs text-center transition-all cursor-pointer"
                    style={{
                      background: paymentStatus === s.id ? '#2D6A4F' : 'white',
                      borderColor: paymentStatus === s.id ? '#2D6A4F' : '#EEEAE0',
                      color: paymentStatus === s.id ? 'white' : '#4A4740'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentStatus === 'partially_paid' && (
              <div className="p-4 sm:p-5 border-2 rounded-2xl space-y-3 shadow-xs" style={{ background: '#FDF3E3', borderColor: '#C68B3A' }}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider" style={{ color: '#C68B3A' }}>
                    {isTamil ? 'வாடிக்கையாளர் செலுத்திய தொகை (₹) *' : 'Amount Paid by Customer Now (₹) *'}
                  </label>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full uppercase" style={{ background: '#F7F5EF', color: '#C68B3A' }}>
                    {isTamil ? 'பாதி பணம்' : 'Partial Due'}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-black" style={{ color: '#C68B3A' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    step="any"
                    value={partialAmountPaid}
                    onChange={(e) => setPartialAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={isTamil ? 'எ.கா. 400' : 'e.g. 400'}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border-2 rounded-xl text-lg font-black focus:outline-hidden"
                    style={{ borderColor: '#C68B3A', color: '#1C1A15' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border" style={{ borderColor: '#C68B3A' }}>
                    <span className="text-[10px] font-bold block uppercase" style={{ color: '#8C8880' }}>
                      {isTamil ? 'செலுத்திய தொகை' : 'Paid Now'}
                    </span>
                    <span className="text-base font-black" style={{ color: '#2D6A4F' }}>
                      ₹{(Number(partialAmountPaid) || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border" style={{ borderColor: '#C68B3A' }}>
                    <span className="text-[10px] font-bold block uppercase" style={{ color: '#8C8880' }}>
                      {isTamil ? 'மீதமுள்ள பாக்கி (Due)' : 'Remaining Due'}
                    </span>
                    <span className="text-base font-black" style={{ color: '#C68B3A' }}>
                      ₹{Math.max(0, grandTotal - (Number(partialAmountPaid) || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider" style={{ color: '#2D6A4F' }}>
                {isTamil ? 'பணம் செலுத்திய விதம்:' : 'Payment Method:'}
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'cash', label: isTamil ? 'ரொக்கம் (Cash)' : 'Cash' },
                  { id: 'upi', label: isTamil ? 'GPay / UPI' : 'UPI / GPay' },
                  { id: 'bank_transfer', label: isTamil ? 'வங்கி கணக்கு' : 'Bank Transfer' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className="py-2.5 px-2 rounded-2xl border-2 font-bold text-xs text-center transition-all cursor-pointer"
                    style={{
                      background: paymentMethod === m.id ? '#EBF5EE' : 'white',
                      borderColor: paymentMethod === m.id ? '#2D6A4F' : '#EEEAE0',
                      color: paymentMethod === m.id ? '#2D6A4F' : '#4A4740'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: '#2D6A4F' }}>
                {isTamil ? 'குறிப்புகள் (தேவைப்பட்டால்):' : 'Store Notes (Optional):'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isTamil ? 'பேக்கிங் அல்லது வாடிக்கையாளர் குறிப்பு...' : 'Remarks or delivery note...'}
                className="w-full px-3.5 py-2.5 border rounded-2xl text-xs font-semibold focus:outline-hidden"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col justify-between space-y-6 border" style={{ background: '#1B3A2A', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2" style={{ color: '#C68B3A' }}>
                <Calculator className="w-5 h-5" />
                <h3 className="font-black text-sm tracking-wider uppercase">
                  {isTamil ? 'பில் கணக்கு விபரம்' : 'Bill Amount Summary'}
                </h3>
              </div>

              <div className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                <div className="flex justify-between items-center">
                  <span>{isTamil ? 'பொருட்களின் மதிப்பு:' : 'Items Subtotal:'}</span>
                  <span className="font-bold text-base text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {appliedPreviousBalance > 0 && (
                  <div className="flex justify-between items-center font-bold" style={{ color: '#C68B3A' }}>
                    <span>{isTamil ? '+ முந்தைய பாக்கி பணம்:' : '+ Old Due Balance:'}</span>
                    <span className="text-base">+ ₹{appliedPreviousBalance.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {courierCharges > 0 && (
                  <div className="flex justify-between items-center">
                    <span>{isTamil ? '+ கொரியர் / டெலிவரி கட்டணம்:' : '+ Courier Charges:'}</span>
                    <span className="font-bold text-white">+ ₹{courierCharges.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center" style={{ color: '#2D6A4F' }}>
                    <span>{isTamil ? '- தள்ளுபடி (Discount):' : '- Discount:'}</span>
                    <span className="font-bold">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-4 border-t flex flex-col space-y-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {isTamil ? 'மொத்தம் செலுத்த வேண்டிய தொகை' : 'TOTAL BILL AMOUNT'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black" style={{ color: '#C68B3A' }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-5 font-black rounded-2xl text-base sm:text-lg tracking-wide shadow-lg transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-60 active:scale-95"
              style={{ background: '#C68B3A', color: '#1C1A15' }}
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>
                {loading
                  ? (isTamil ? 'பில் தயாராகிறது...' : 'Generating Bill...')
                  : (isTamil ? 'பில்லைச் சேமித்து பிரிண்ட் எடுங்க' : 'Save Bill & Print Now')}
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE FLOATING STICKY CHECKOUT DOCK (< lg only) */}
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40 bg-[#0E2016]/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/60 block">
              {isTamil ? 'மொத்த பில் தொகை' : 'Grand Total'}
            </span>
            <span className="text-xl font-black text-[#E2A04A]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 shadow-lg active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #52B788 0%, #2D6A4F 100%)', color: 'white' }}
          >
            <Check className="w-4 h-4" />
            <span>{loading ? (isTamil ? 'தயாராகிறது...' : 'Generating...') : (isTamil ? 'பில் சேமி & பிரிண்ட்' : 'Save & Print')}</span>
          </button>
        </div>
      </form>

      {/* Quick Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28, 26, 21, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border" style={{ borderColor: '#EEEAE0' }}>
            <div className="flex items-center space-x-2" style={{ color: '#2D6A4F' }}>
              <UserPlus className="w-5 h-5" />
              <h3 className="font-black text-base" style={{ color: '#1C1A15' }}>
                {isTamil ? 'புதிய வாடிக்கையாளர் விபரம்' : 'Add New Customer'}
              </h3>
            </div>

            <form onSubmit={handleQuickAddCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'பெயர் *' : 'Customer Name *'}
                </label>
                <input
                  required
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder={isTamil ? 'எ.கா. ராஜா' : 'e.g. Raja'}
                  className="w-full px-3.5 py-2.5 border-2 rounded-xl text-sm font-bold focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'கைபேசி எண் *' : 'Phone Number *'}
                </label>
                <input
                  required
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="98421 88990"
                  className="w-full px-3.5 py-2.5 border-2 rounded-xl text-sm font-bold focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'முகவரி / ஊர்' : 'Address / Town'}
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder={isTamil ? 'காங்கேயம், திருப்பூர்' : 'Kangeyam, Tirupur'}
                  className="w-full px-3.5 py-2.5 border-2 rounded-xl text-sm font-semibold focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t" style={{ borderColor: '#EEEAE0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="px-4 py-2.5 font-bold rounded-xl cursor-pointer"
                  style={{ background: '#F7F5EF', color: '#4A4740' }}
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-black rounded-xl cursor-pointer shadow-md"
                  style={{ background: '#2D6A4F', color: 'white' }}
                >
                  {isTamil ? 'சேமி' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASTE WHATSAPP ORDER MODAL */}
      {showWhatsAppOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28, 26, 21, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border" style={{ borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#EEEAE0' }}>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
                  <ClipboardPaste className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base" style={{ color: '#1C1A15' }}>
                  {isTamil ? 'வாட்ஸ்அப் ஆர்டர் ஒட்டுக' : 'Paste WhatsApp Order'}
                </h3>
              </div>
              <button
                onClick={() => setShowWhatsAppOrderModal(false)}
                className="p-1 rounded-lg cursor-pointer"
                style={{ color: '#8C8880' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-medium leading-relaxed" style={{ color: '#4A4740' }}>
              {isTamil
                ? 'வாடிக்கையாளர் வாட்ஸ்அப்பில் அனுப்பிய ஆர்டர் உரையை அப்படியே இங்கே ஒட்டவும். தமிழ் மற்றும் ஆங்கிலத்தில் தானாகவே பில்லில் சேர்க்கப்படும்.'
                : 'Paste customer WhatsApp order text here. Items will be extracted and auto-added to the bill.'}
            </p>

            <textarea
              rows={5}
              value={whatsAppText}
              onChange={(e) => setWhatsAppText(e.target.value)}
              placeholder={
                isTamil
                  ? `எடுத்துக்காட்டு:\nஇட்லி பொடி 250 கிராம் 200\nநாட்டு சர்க்கரை 2 கிலோ 180\nமரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380`
                  : `Example:\nஇட்லி பொடி 250 கிராம் 200\nநாட்டு சர்க்கரை 2 கிலோ 180`
              }
              className="w-full p-4 border-2 rounded-2xl text-xs font-semibold focus:outline-hidden"
              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
            />

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() =>
                  setWhatsAppText(
                    `இட்லி பொடி 250 கிராம் 200\nநாட்டு சர்க்கரை 2 கிலோ 180\nமரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380`
                  )
                }
                className="text-xs font-bold hover:underline cursor-pointer"
                style={{ color: '#2D6A4F' }}
              >
                {isTamil ? 'மாதிரி உரை (Sample)' : 'Sample text'}
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppOrderModal(false)}
                  className="px-4 py-2.5 font-bold rounded-xl text-xs cursor-pointer"
                  style={{ background: '#F7F5EF', color: '#4A4740' }}
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>

                <button
                  type="button"
                  disabled={parsingWhatsApp || !whatsAppText.trim()}
                  onClick={handleParseAndAddWhatsAppOrder}
                  className="px-5 py-2.5 font-black rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                  style={{ background: '#2D6A4F', color: 'white' }}
                >
                  {parsingWhatsApp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#C68B3A' }} />
                      <span>{isTamil ? 'பிரித்தெடுக்கப்படுகிறது...' : 'Parsing...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" style={{ color: '#C68B3A' }} />
                      <span>{isTamil ? 'பில்லில் சேர்க்க' : 'Add to Bill'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
