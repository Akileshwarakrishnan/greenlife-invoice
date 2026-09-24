import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/api';
import { Product } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  PlusCircle,
  Search,
  Edit2,
  Package,
  X,
  FilePlus,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Sparkles,
  ClipboardPaste,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';

export const Products: React.FC = () => {
  const { language, t } = useLanguage();
  const isTamil = language === 'ta';

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Smart Tamil Paste Space State
  const [pasteText, setPasteText] = useState('');
  const [parsingText, setParsingText] = useState(false);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);
  const [isPasteSpaceOpen, setIsPasteSpaceOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('Cold Pressed Oils');
  const [unit, setUnit] = useState('liter');
  const [price, setPrice] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Keep the complete catalog so filtering cannot remove category choices.
      const catalog: Product[] = [];
      const pageSize = 100;
      while (true) {
        const res = await productApi.list({
          active_only: false,
          skip: catalog.length,
          limit: pageSize,
        });
        catalog.push(...res.data);
        if (res.data.length < pageSize) break;
      }
      setProducts(catalog);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setSku('');
    setName('');
    setNameTa('');
    setNameEn('');
    setCategory('Cold Pressed Oils');
    setUnit('kg');
    setPrice(0);
    setTaxPercentage(0);
    setStockQuantity(50);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku || '');
    setName(p.name);
    setNameTa(p.name_ta || '');
    setNameEn(p.name_en || '');
    setCategory(p.category);
    setUnit(p.unit);
    setPrice(p.price);
    setTaxPercentage(p.tax_percentage);
    setStockQuantity(p.stock_quantity);
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleInsertSample = () => {
    setPasteText(
      `இட்லி பொடி 250 கிராம் 200\nநாட்டு சர்க்கரை 1 கிலோ 90\nமரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380\nசுக்கு காபி பொடி 100 கிராம் 85\nகருப்பு கவுனி அரிசி 2 kg 280`
    );
    setBatchSuccessMessage(null);
  };

  const handleParseText = async () => {
    if (!pasteText.trim()) return;
    setParsingText(true);
    setBatchSuccessMessage(null);
    try {
      const res = await productApi.parseText(pasteText);
      setParsedItems(res.data.items);
    } catch (err: any) {
      alert(
        isTamil
          ? 'உரையை பிரித்தெடுப்பதில் பிழை: ' + (err.response?.data?.detail || err.message)
          : 'Failed to parse text: ' + (err.response?.data?.detail || err.message)
      );
    } finally {
      setParsingText(false);
    }
  };

  const handleUpdateParsedItem = (index: number, field: string, value: any) => {
    const updated = [...parsedItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'name_ta' || field === 'name_en') {
      const ta = field === 'name_ta' ? value : updated[index].name_ta;
      const en = field === 'name_en' ? value : updated[index].name_en;
      updated[index].name = ta && en ? `${ta} / ${en}` : (ta || en);
    }
    setParsedItems(updated);
  };

  const handleRemoveParsedItem = (index: number) => {
    setParsedItems(parsedItems.filter((_, i) => i !== index));
  };

  const handleSaveBatchToDatabase = async () => {
    if (parsedItems.length === 0) return;
    setSavingBatch(true);
    setBatchSuccessMessage(null);
    try {
      const payload = parsedItems.map((item) => ({
        name: item.name,
        name_ta: item.name_ta,
        name_en: item.name_en,
        category: item.category || 'General',
        unit: item.unit || 'kg',
        price: Number(item.price) || 0,
        stock_quantity: Number(item.stock_quantity) || 100,
        tax_percentage: Number(item.tax_percentage) || 0,
        description: item.description,
      }));

      await productApi.createBatch(payload);
      setBatchSuccessMessage(
        isTamil
          ? `✓ ${payload.length} பொருட்கள் வெற்றிகரமாக இருப்புப் பட்டியலில் சேர்க்கப்பட்டன!`
          : `✓ Successfully saved ${payload.length} products to database!`
      );
      setParsedItems([]);
      setPasteText('');
      loadProducts();
    } catch (err: any) {
      alert(
        isTamil
          ? 'டேட்டாபேஸில் சேமிப்பதில் பிழை: ' + (err.response?.data?.detail || err.message)
          : 'Failed to save to database: ' + (err.response?.data?.detail || err.message)
      );
    } finally {
      setSavingBatch(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        sku: sku || undefined,
        name,
        name_ta: nameTa || undefined,
        name_en: nameEn || undefined,
        category,
        unit,
        price: Number(price),
        tax_percentage: Number(taxPercentage),
        stock_quantity: Number(stockQuantity),
        description: description || undefined,
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
      } else {
        await productApi.create(payload);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      alert('Failed to save product: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      (p.sku && p.sku.toLowerCase().includes(s))
    );
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" style={{ background: 'transparent' }}>
      <PageHeader
        title={isTamil ? 'பொருட்கள் & விலை பட்டியல்' : 'Products & Stock Catalog'}
        subtitle={isTamil ? 'இயற்கை உணவுப் பொருட்களின் விலை, அளவு மற்றும் இருப்பு விவரங்களை நிர்வகிக்க' : 'Manage organic products, units, retail prices, and inventory stock'}
        badge={isTamil ? 'பொருட்கள் இருப்பு' : 'Inventory'}
        actions={
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-5 py-3 font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            style={{ background: '#2D6A4F', color: 'white' }}
          >
            <PlusCircle className="w-4 h-4" style={{ color: '#C68B3A' }} />
            <span>{isTamil ? 'புதிய பொருள் சேர்க்க' : 'Add New Product'}</span>
          </button>
        }
      />

      {/* SMART WHATSAPP / TAMIL PASTE SPACE */}
      <div className="rounded-3xl border-2 p-5 sm:p-6 shadow-sm space-y-4" style={{ background: 'white', borderColor: 'rgba(45,106,79,0.30)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: '#EEEAE0' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs" style={{ background: '#2D6A4F', color: '#C68B3A' }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center space-x-2" style={{ color: '#1C1A15' }}>
                <span>{isTamil ? 'வாட்ஸ்அப் / தமிழ் உரை மூலம் பொருட்கள் சேர்க்க' : 'Smart WhatsApp / Tamil Paste Space'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
                  {isTamil ? 'தானியங்கி தமிழ் & ஆங்கிலம்' : 'Auto Bilingual'}
                </span>
              </h2>
              <p className="text-xs font-medium" style={{ color: '#8C8880' }}>
                {isTamil
                  ? 'வாட்ஸ்அப் மெசேஜ் அல்லது பட்டியலை இங்கே ஒட்டினால், சிஸ்டம் தானாகவே தமிழ்+ஆங்கில பெயர், எடை மற்றும் விலையை உரிய காலத்தில் சேர்க்கும்!'
                  : 'Paste a product list to add names, quantities and prices together. Review every item before saving.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPasteSpaceOpen(!isPasteSpaceOpen)}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            style={{ background: '#EBF5EE', color: '#2D6A4F' }}
          >
            {isPasteSpaceOpen ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>{isTamil ? 'மறைக்க' : 'Minimize'}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>{isTamil ? 'திறக்க (Open)' : 'Expand'}</span>
              </>
            )}
          </button>
        </div>

        {isPasteSpaceOpen && (
          <div className="space-y-4 pt-1">
            {batchSuccessMessage && (
              <div className="p-4 border-2 font-black rounded-2xl flex items-center space-x-3 text-sm" style={{ background: '#EBF5EE', borderColor: '#B7D9C4', color: '#2D6A4F' }}>
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#2D6A4F' }} />
                <span>{batchSuccessMessage}</span>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={4}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={
                  isTamil
                    ? `பொருட்களை இங்கே ஒட்டவும்...\nஎடுத்துக்காட்டு:\nஇட்லி பொடி 250 கிராம் 200\nநாட்டு சர்க்கரை 1 கிலோ 90\nமரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380\nசுக்கு காபி பொடி 100 கிராம் 85`
                    : `Paste items here...\nExample:\nஇட்லி பொடி 250 கிராம் 200\nநாட்டு சர்க்கரை 1 கிலோ 90\nமரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380`
                }
                className="w-full p-4 border-2 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden transition-all shadow-inner leading-relaxed"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleInsertSample}
                  className="px-3.5 py-2 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                  style={{ background: '#EBF5EE', color: '#2D6A4F' }}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'எடுத்துக்காட்டு உரை (Sample)' : 'Insert Sample'}</span>
                </button>

                {pasteText && (
                  <button
                    type="button"
                    onClick={() => { setPasteText(''); setParsedItems([]); setBatchSuccessMessage(null); }}
                    className="px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    style={{ color: '#4A4740', background: 'transparent' }}
                  >
                    {isTamil ? 'அழி' : 'Clear'}
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={parsingText || !pasteText.trim()}
                onClick={handleParseText}
                className="px-5 py-2.5 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                style={{ background: '#2D6A4F', color: 'white' }}
              >
                {parsingText ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#C68B3A' }} />
                    <span>{isTamil ? 'பிரித்தெடுக்கப்படுகிறது...' : 'Parsing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" style={{ color: '#C68B3A' }} />
                    <span>{isTamil ? 'விவரங்களை பிரித்தெடு ✨' : 'Review product details'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Parsed Items Preview Table */}
            {parsedItems.length > 0 && (
              <div className="pt-4 border-t space-y-4" style={{ borderColor: '#EEEAE0' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#2D6A4F' }}></span>
                    <h3 className="font-black text-sm" style={{ color: '#1C1A15' }}>
                      {isTamil ? `பிரித்தெடுக்கப்பட்ட விவரங்கள் (${parsedItems.length} பொருட்கள்):` : `Parsed Product Items (${parsedItems.length} items):`}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: '#8C8880' }}>
                    {isTamil ? 'தேவைப்பட்டால் எழுத்துக்கள்/விலையை மாற்றலாம்' : 'Review & adjust any value before saving to DB'}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border-2" style={{ borderColor: '#EEEAE0' }}>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="font-black text-[11px] uppercase tracking-wider" style={{ background: '#EEEAE0', color: '#4A4740' }}>
                        <th className="p-3">#</th>
                        <th className="p-3">{isTamil ? 'தமிழ் பெயர்' : 'Tamil Name'}</th>
                        <th className="p-3">{isTamil ? 'ஆங்கில பெயர்' : 'English Name'}</th>
                        <th className="p-3">{isTamil ? 'அளவீட்டு அலகு (Unit)' : 'Unit / Weight'}</th>
                        <th className="p-3">{isTamil ? 'விலை (₹)' : 'Price (₹)'}</th>
                        <th className="p-3">{isTamil ? 'வகை (Category)' : 'Category'}</th>
                        <th className="p-3">{isTamil ? 'இருப்பு' : 'Stock'}</th>
                        <th className="p-3 text-center">{isTamil ? 'நீக்கு' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ background: 'white', borderColor: '#EEEAE0' }}>
                      {parsedItems.map((item, idx) => (
                        <tr key={idx} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F5EF'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                          <td className="p-3 font-black" style={{ color: '#8C8880' }}>{idx + 1}</td>
                          <td className="p-2 min-w-[150px]">
                            <input
                              type="text"
                              value={item.name_ta || ''}
                              onChange={(e) => handleUpdateParsedItem(idx, 'name_ta', e.target.value)}
                              className="w-full px-2.5 py-1.5 border rounded-xl font-bold text-xs focus:outline-hidden"
                              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                            />
                          </td>
                          <td className="p-2 min-w-[170px]">
                            <input
                              type="text"
                              value={item.name_en || ''}
                              onChange={(e) => handleUpdateParsedItem(idx, 'name_en', e.target.value)}
                              className="w-full px-2.5 py-1.5 border rounded-xl font-bold text-xs focus:outline-hidden"
                              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                            />
                          </td>
                          <td className="p-2 min-w-[110px]">
                            <input
                              type="text"
                              value={item.unit || 'kg'}
                              onChange={(e) => handleUpdateParsedItem(idx, 'unit', e.target.value)}
                              className="w-full px-2 py-1.5 border rounded-xl font-black text-xs text-center focus:outline-hidden"
                              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#2D6A4F' }}
                            />
                          </td>
                          <td className="p-2 min-w-[110px]">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 font-bold" style={{ color: '#8C8880' }}>₹</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={item.price}
                                onChange={(e) => handleUpdateParsedItem(idx, 'price', Number(e.target.value))}
                                className="w-full pl-6 pr-2 py-1.5 border rounded-xl font-black text-xs focus:outline-hidden"
                                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#2D6A4F' }}
                              />
                            </div>
                          </td>
                          <td className="p-2 min-w-[140px]">
                            <input
                              type="text"
                              value={item.category || 'General'}
                              onChange={(e) => handleUpdateParsedItem(idx, 'category', e.target.value)}
                              className="w-full px-2.5 py-1.5 border rounded-xl font-bold text-xs focus:outline-hidden"
                              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#4A4740' }}
                            />
                          </td>
                          <td className="p-2 min-w-[90px]">
                            <input
                              type="number"
                              min="0"
                              value={item.stock_quantity}
                              onChange={(e) => handleUpdateParsedItem(idx, 'stock_quantity', Number(e.target.value))}
                              className="w-full px-2 py-1.5 border rounded-xl font-bold text-xs text-center focus:outline-hidden"
                              style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveParsedItem(idx)}
                              className="p-1.5 rounded-lg transition-colors cursor-pointer"
                              title={isTamil ? 'நீக்கு' : 'Remove'}
                              style={{ color: '#8C8880' }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Big Chunky Save-to-Database CTA */}
                <div className="p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border" style={{ background: '#EEEAE0', borderColor: '#EEEAE0' }}>
                  <div className="flex items-center space-x-2 text-xs font-black" style={{ color: '#2D6A4F' }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                    <span>
                      {isTamil
                        ? `மொத்தம் ${parsedItems.length} பொருட்கள் டேட்டாபேஸில் சேர்க்கத் தயாராக உள்ளன.`
                        : `Total ${parsedItems.length} products ready to be inserted into database.`}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={savingBatch}
                    onClick={handleSaveBatchToDatabase}
                    className="w-full sm:w-auto px-6 py-3 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                    style={{ background: '#2D6A4F', color: 'white' }}
                  >
                    {savingBatch ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#C68B3A' }} />
                        <span>{isTamil ? 'டேட்டாபேஸில் சேமிக்கப்படுகிறது...' : 'Saving to Database...'}</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" style={{ color: '#C68B3A' }} />
                        <span>{isTamil ? 'இருப்புப் பட்டியலில் சேமி (Save All to Database)' : 'Save All to Database'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter & Category Pills */}
      <div className="p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between" style={{ background: 'white', border: '1px solid #EEEAE0' }}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: '#8C8880' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'பொருளின் பெயர் அல்லது வகை கொண்டு தேடவும்...' : 'Search product name or category...'}
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden"
            style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
          />
        </div>

        {/* Categories Bar */}
        <div role="group" aria-label={isTamil ? 'பொருள் வகைகள்' : 'Product categories'} className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoryFilter('')}
            aria-pressed={categoryFilter === ''}
            className="px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs"
            style={{
              background: categoryFilter === '' ? '#2D6A4F' : '#EEEAE0',
              color: categoryFilter === '' ? 'white' : '#4A4740'
            }}
          >
            {isTamil ? 'அனைத்து பொருட்கள்' : 'All Products'}
          </button>

          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              aria-pressed={categoryFilter === c}
              className="px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs"
              style={{
                background: categoryFilter === c ? '#2D6A4F' : '#EEEAE0',
                color: categoryFilter === c ? 'white' : '#4A4740'
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center font-semibold text-sm" style={{ color: '#8C8880' }}>
            {isTamil ? 'பொருட்கள் பட்டியல் ஏற்றப்படுகிறது...' : 'Loading products...'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center font-semibold text-sm rounded-3xl border p-8" style={{ background: 'white', borderColor: '#EEEAE0', color: '#8C8880' }}>
            {isTamil ? 'பொருட்கள் எதுவும் இல்லை. "+ புதிய பொருள் சேர்க்க" கிளிக் செய்யவும்.' : 'No products found.'}
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLowStock = p.stock_quantity <= 10;
            return (
              <div
                key={p.id}
                className="rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between space-y-4"
                style={{ background: 'white', borderColor: '#EEEAE0' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2D6A4F'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(45,106,79,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EEEAE0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#EBF5EE', color: '#2D6A4F' }}>
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: '#8C8880' }}>
                          {p.category}
                        </span>
                        <h3 className="font-black text-base sm:text-lg leading-tight" style={{ color: '#1C1A15' }}>
                          {p.name}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded-xl transition-colors cursor-pointer"
                      title={isTamil ? 'விலை / விவரம் திருத்த' : 'Edit Product'}
                      style={{ color: '#8C8880', background: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#2D6A4F'; e.currentTarget.style.background = '#EBF5EE'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#8C8880'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {p.description && (
                    <p className="mt-3 text-xs line-clamp-2 font-medium" style={{ color: '#8C8880' }}>
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Price & Stock Display */}
                <div className="pt-4 border-t space-y-3" style={{ borderColor: '#EEEAE0' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] block font-bold uppercase tracking-wider" style={{ color: '#8C8880' }}>
                        {isTamil ? 'விற்பனை விலை' : 'Retail Price'}
                      </span>
                      <div className="text-xl sm:text-2xl font-black" style={{ color: '#2D6A4F' }}>
                        ₹{p.price}{' '}
                        <span className="text-xs font-semibold" style={{ color: '#8C8880' }}>/ {p.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] block font-bold uppercase tracking-wider" style={{ color: '#8C8880' }}>
                        {isTamil ? 'இருப்பு' : 'In Stock'}
                      </span>
                      <span
                        className="inline-block px-2.5 py-1 rounded-xl text-xs font-black"
                        style={{
                          background: isLowStock ? '#FDF3E3' : '#EBF5EE',
                          color: isLowStock ? '#C68B3A' : '#2D6A4F',
                          border: isLowStock ? '1px solid #C68B3A' : 'none'
                        }}
                      >
                        {p.stock_quantity} {p.unit}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action to Bill this Product */}
                  <Link
                    to="/orders/new"
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    style={{ background: '#EBF5EE', color: '#2D6A4F' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#2D6A4F'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#EBF5EE'; e.currentTarget.style.color = '#2D6A4F'; }}
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'இப்பொருளுக்கு பில் போட' : 'Bill this Item'}</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28, 26, 21, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border" style={{ background: 'white', borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#EEEAE0' }}>
              <h3 className="font-black text-base" style={{ color: '#1C1A15' }}>
                {editingProduct
                  ? (isTamil ? 'பொருள் தகவலை மாற்ற' : 'Update Product')
                  : (isTamil ? 'புதிய பொருள் சேர்க்க' : 'Add New Product')}
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
              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'பொருளின் முழு பெயர் (காட்சி பெயர்) *' : 'Display Name (e.g. தமிழ் / English) *'}
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isTamil ? 'எ.கா. நாட்டு சர்க்கரை / Country Sugar' : 'e.g. நாட்டு சர்க்கரை / Country Sugar'}
                  className="w-full px-3.5 py-2.5 border-2 rounded-xl text-sm font-bold focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'தமிழ் பெயர் (தனித்திறன்)' : 'Tamil Name'}
                  </label>
                  <input
                    type="text"
                    value={nameTa}
                    onChange={(e) => {
                      setNameTa(e.target.value);
                      if (!editingProduct && !name) setName(e.target.value);
                    }}
                    placeholder={isTamil ? 'எ.கா. நாட்டு சர்க்கரை' : 'e.g. நாட்டு சர்க்கரை'}
                    className="w-full px-3.5 py-2 border-2 rounded-xl text-xs font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>

                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'ஆங்கில பெயர் (English Name)' : 'English Name'}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Country Sugar"
                    className="w-full px-3.5 py-2 border-2 rounded-xl text-xs font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'பொருளின் வகை *' : 'Category *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={isTamil ? 'எ.கா. எண்ணெய்கள், சர்க்கரை' : 'e.g. Traditional Oils, Grains'}
                    className="w-full px-3.5 py-2 border-2 rounded-xl text-xs font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>

                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'அளவீட்டு அலகு (Unit) *' : 'Unit *'}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2 border-2 rounded-xl text-xs font-bold focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  >
                    <option value="kg">kg (கிலோ)</option>
                    <option value="liter">liter (லிட்டர்)</option>
                    <option value="packet">packet (பாக்கெட்)</option>
                    <option value="bottle">bottle (பாட்டில்)</option>
                    <option value="gram">gram (கிராம்)</option>
                    <option value="piece">piece (எண்ணிக்கை)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'விற்பனை விலை (₹) *' : 'Retail Price (₹) *'}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border-2 rounded-xl text-base font-black focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#2D6A4F' }}
                  />
                </div>

                <div>
                  <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                    {isTamil ? 'கையிருப்பு அளவு *' : 'Stock Quantity *'}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border-2 rounded-xl text-base font-black focus:outline-hidden"
                    style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-black mb-1" style={{ color: '#4A4740' }}>
                  {isTamil ? 'விளக்கம் (தேவைப்பட்டால்)' : 'Description (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isTamil ? 'பாரம்பரிய இயற்கை தயாரிப்பு...' : 'Pure natural cold pressed...'}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
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
                    : editingProduct
                    ? (isTamil ? 'விலை / இருப்பு மாற்றுக' : 'Update Product')
                    : (isTamil ? 'பொருளைச் சேமி' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
