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
  const [isPasteSpaceOpen, setIsPasteSpaceOpen] = useState(true);

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
  }, [categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.list({
        category: categoryFilter || undefined,
        active_only: false,
      });
      setProducts(res.data);
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
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      (p.sku && p.sku.toLowerCase().includes(s))
    );
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={isTamil ? 'பொருட்கள் & விலை பட்டியல்' : 'Products & Stock Catalog'}
        subtitle={isTamil ? 'இயற்கை உணவுப் பொருட்களின் விலை, அளவு மற்றும் இருப்பு விவரங்களை நிர்வகிக்க' : 'Manage organic products, units, retail prices, and inventory stock'}
        badge={isTamil ? 'பொருட்கள் இருப்பு' : 'Inventory'}
        actions={
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-5 py-3 bg-[#284B35] hover:bg-[#1E3827] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#F5C242]" />
            <span>+ {isTamil ? 'புதிய பொருள் சேர்க்க' : 'Add New Product'}</span>
          </button>
        }
      />

      {/* SMART WHATSAPP / TAMIL PASTE SPACE */}
      <div className="bg-white rounded-3xl border-2 border-[#284B35]/30 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4EFE7] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#284B35] text-[#F5C242] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>{isTamil ? 'வாட்ஸ்அப் / தமிழ் உரை மூலம் பொருட்கள் சேர்க்க' : 'Smart WhatsApp / Tamil Paste Space'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E4EFE7] text-[#284B35] font-black uppercase">
                  {isTamil ? 'தானியங்கி தமிழ் & ஆங்கிலம்' : 'Auto Bilingual'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isTamil
                  ? 'வாட்ஸ்அப் மெசேஜ் அல்லது பட்டியலை இங்கே ஒட்டினால், சிஸ்டம் தானாகவே தமிழ்+ஆங்கில பெயர், எடை மற்றும் விலையை உரிய காலத்தில் சேர்க்கும்!'
                  : 'Paste WhatsApp product list here — auto-extracts Tamil & English names, unit/kg, and price into DB columns!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPasteSpaceOpen(!isPasteSpaceOpen)}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-[#E4EFE7] hover:bg-[#D4E8DA] text-[#284B35] text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
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
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-black rounded-2xl flex items-center space-x-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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
                className="w-full p-4 bg-[#F9FCFA] border-2 border-[#C9DFCF] focus:border-[#284B35] focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all shadow-inner leading-relaxed"
              />
            </div>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleInsertSample}
                  className="px-3.5 py-2 bg-[#E4EFE7] hover:bg-[#D4E8DA] text-[#284B35] font-black text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'எடுத்துக்காட்டு உரை (Sample)' : 'Insert Sample'}</span>
                </button>

                {pasteText && (
                  <button
                    type="button"
                    onClick={() => { setPasteText(''); setParsedItems([]); setBatchSuccessMessage(null); }}
                    className="px-3 py-2 text-slate-500 hover:text-rose-600 text-xs font-bold rounded-xl transition-all cursor-pointer hover:bg-slate-100"
                  >
                    {isTamil ? 'அழி' : 'Clear'}
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={parsingText || !pasteText.trim()}
                onClick={handleParseText}
                className="px-5 py-2.5 bg-[#284B35] hover:bg-[#1E3827] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
              >
                {parsingText ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#F5C242]" />
                    <span>{isTamil ? 'பிரித்தெடுக்கப்படுகிறது...' : 'Parsing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#F5C242]" />
                    <span>{isTamil ? 'விவரங்களை பிரித்தெடு ✨' : 'Parse Product Details ✨'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Parsed Items Preview Table */}
            {parsedItems.length > 0 && (
              <div className="pt-4 border-t border-[#E4EFE7] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="font-black text-sm text-slate-900">
                      {isTamil ? `பிரித்தெடுக்கப்பட்ட விவரங்கள் (${parsedItems.length} பொருட்கள்):` : `Parsed Product Items (${parsedItems.length} items):`}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {isTamil ? 'தேவைப்பட்டால் எழுத்துக்கள்/விலையை மாற்றலாம்' : 'Review & adjust any value before saving to DB'}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border-2 border-[#C9DFCF]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#E4EFE7] text-[#284B35] font-black text-[11px] uppercase tracking-wider">
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
                    <tbody className="divide-y divide-[#E4EFE7] bg-white">
                      {parsedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F9FCFA]">
                          <td className="p-3 font-black text-slate-400">{idx + 1}</td>
                          <td className="p-2 min-w-[150px]">
                            <input
                              type="text"
                              value={item.name_ta || ''}
                              onChange={(e) => handleUpdateParsedItem(idx, 'name_ta', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:outline-hidden"
                            />
                          </td>
                          <td className="p-2 min-w-[170px]">
                            <input
                              type="text"
                              value={item.name_en || ''}
                              onChange={(e) => handleUpdateParsedItem(idx, 'name_en', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:outline-hidden"
                            />
                          </td>
                          <td className="p-2 min-w-[110px]">
                            <input
                              type="text"
                              value={item.unit || 'kg'}
                              onChange={(e) => handleUpdateParsedItem(idx, 'unit', e.target.value)}
                              className="w-full px-2 py-1.5 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl font-black text-[#284B35] text-xs text-center focus:bg-white focus:outline-hidden"
                            />
                          </td>
                          <td className="p-2 min-w-[110px]">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={item.price}
                                onChange={(e) => handleUpdateParsedItem(idx, 'price', Number(e.target.value))}
                                className="w-full pl-6 pr-2 py-1.5 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl font-black text-[#284B35] text-xs focus:bg-white focus:outline-hidden"
                              />
                            </div>
                          </td>
                          <td className="p-2 min-w-[140px]">
                            <input
                              type="text"
                              value={item.category || 'General'}
                              onChange={(e) => handleUpdateParsedItem(idx, 'category', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl font-bold text-slate-700 text-xs focus:bg-white focus:outline-hidden"
                            />
                          </td>
                          <td className="p-2 min-w-[90px]">
                            <input
                              type="number"
                              min="0"
                              value={item.stock_quantity}
                              onChange={(e) => handleUpdateParsedItem(idx, 'stock_quantity', Number(e.target.value))}
                              className="w-full px-2 py-1.5 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl font-bold text-slate-800 text-xs text-center focus:bg-white focus:outline-hidden"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveParsedItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title={isTamil ? 'நீக்கு' : 'Remove'}
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
                <div className="p-4 bg-[#E4EFE7] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#C9DFCF]">
                  <div className="flex items-center space-x-2 text-xs font-black text-[#284B35]">
                    <CheckCircle2 className="w-4 h-4 text-[#284B35]" />
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
                    className="w-full sm:w-auto px-6 py-3 bg-[#284B35] hover:bg-[#1E3827] text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                  >
                    {savingBatch ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#F5C242]" />
                        <span>{isTamil ? 'டேட்டாபேஸில் சேமிக்கப்படுகிறது...' : 'Saving to Database...'}</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4 text-[#F5C242]" />
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
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#C9DFCF] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTamil ? 'பொருளின் பெயர் அல்லது வகை கொண்டு தேடவும்...' : 'Search product name or category...'}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#284B35] focus:bg-white"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === ''
                ? 'bg-[#284B35] text-white shadow-xs'
                : 'bg-[#E4EFE7] text-[#284B35] hover:bg-[#D4E8DA]'
            }`}
          >
            {isTamil ? 'அனைத்து பொருட்கள்' : 'All Products'}
          </button>

          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-[#284B35] text-white shadow-xs'
                  : 'bg-[#E4EFE7] text-[#284B35] hover:bg-[#D4E8DA]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm">
            {isTamil ? 'பொருட்கள் பட்டியல் ஏற்றப்படுகிறது...' : 'Loading products...'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm bg-white rounded-3xl border border-[#C9DFCF] p-8">
            {isTamil ? 'பொருட்கள் எதுவும் இல்லை. "+ புதிய பொருள் சேர்க்க" கிளிக் செய்யவும்.' : 'No products found.'}
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLowStock = p.stock_quantity <= 10;
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-6 border border-[#C9DFCF] shadow-xs hover:shadow-md hover:border-[#284B35] transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E4EFE7] text-[#284B35] flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {p.category}
                        </span>
                        <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                          {p.name}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 text-slate-400 hover:text-[#284B35] hover:bg-[#E4EFE7] rounded-xl transition-colors cursor-pointer"
                      title={isTamil ? 'விலை / விவரம் திருத்த' : 'Edit Product'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {p.description && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2 font-medium">
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Price & Stock Display */}
                <div className="pt-4 border-t border-[#E4EFE7] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                        {isTamil ? 'விற்பனை விலை' : 'Retail Price'}
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-[#284B35]">
                        ₹{p.price}{' '}
                        <span className="text-xs text-slate-500 font-semibold">/ {p.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                        {isTamil ? 'இருப்பு' : 'In Stock'}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black ${
                          isLowStock
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-[#E4EFE7] text-[#284B35]'
                        }`}
                      >
                        {p.stock_quantity} {p.unit}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action to Bill this Product */}
                  <Link
                    to="/orders/new"
                    className="w-full py-2.5 px-3 bg-[#E4EFE7] hover:bg-[#284B35] text-[#284B35] hover:text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-[#C9DFCF]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingProduct
                  ? (isTamil ? 'பொருள் தகவலை மாற்ற' : 'Update Product')
                  : (isTamil ? 'புதிய பொருள் சேர்க்க' : 'Add New Product')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  {isTamil ? 'பொருளின் முழு பெயர் (காட்சி பெயர்) *' : 'Display Name (e.g. தமிழ் / English) *'}
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isTamil ? 'எ.கா. நாட்டு சர்க்கரை / Country Sugar' : 'e.g. நாட்டு சர்க்கரை / Country Sugar'}
                  className="w-full px-3.5 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
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
                    className="w-full px-3.5 py-2 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'ஆங்கில பெயர் (English Name)' : 'English Name'}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Country Sugar"
                    className="w-full px-3.5 py-2 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'பொருளின் வகை *' : 'Category *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={isTamil ? 'எ.கா. எண்ணெய்கள், சர்க்கரை' : 'e.g. Traditional Oils, Grains'}
                    className="w-full px-3.5 py-2 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'அளவீட்டு அலகு (Unit) *' : 'Unit *'}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-xs font-bold"
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
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'விற்பனை விலை (₹) *' : 'Retail Price (₹) *'}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-base font-black text-[#284B35]"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    {isTamil ? 'கையிருப்பு அளவு *' : 'Stock Quantity *'}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F9FCFA] border-2 border-[#C9DFCF] rounded-xl text-base font-black text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  {isTamil ? 'விளக்கம் (தேவைப்பட்டால்)' : 'Description (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isTamil ? 'பாரம்பரிய இயற்கை தயாரிப்பு...' : 'Pure natural cold pressed...'}
                  className="w-full px-3.5 py-2 bg-[#F9FCFA] border border-[#C9DFCF] rounded-xl text-xs"
                />
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
