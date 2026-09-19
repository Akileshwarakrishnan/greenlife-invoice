import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../services/api';
import { ExtractedInvoiceData } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  User,
  ShoppingBag,
  Plus,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';

export const AiExtraction: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable extracted data
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcessExtraction = async () => {
    if (!file) return;
    setExtracting(true);
    setError(null);

    try {
      const res = await aiApi.extractInvoice(file);
      setExtractedData(res.data.data);
      setConfidence(res.data.confidence_score);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Failed to extract invoice data. Please check file format.'
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleCustomerFieldChange = (field: string, val: string) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      customer: {
        ...extractedData.customer,
        [field]: val,
      },
    });
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    if (!extractedData) return;
    const newItems = [...extractedData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: val,
    };
    setExtractedData({
      ...extractedData,
      items: newItems,
    });
  };

  const handleRemoveItem = (index: number) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      items: extractedData.items.filter((_, i) => i !== index),
    });
  };

  const handleAddItem = () => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      items: [
        ...extractedData.items,
        { product: 'Cold Pressed Groundnut Oil', quantity: 1, unit: 'liter', price: 240, total: 240 },
      ],
    });
  };

  const handleConvertToOrder = () => {
    if (!extractedData) return;
    navigate('/orders/new', { state: { extracted: extractedData } });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={t('nav.ai_extract', 'AI Invoice OCR Extraction')}
        subtitle="Upload paper receipts, supplier bills, or PDF vouchers to automatically extract items, amounts, and customer profiles."
        badge="Multimodal OCR Intelligence"
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`bg-white dark:bg-[#082216] rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-400 shadow-xs'
        }`}
      >
        <input
          type="file"
          id="invoiceUploadInput"
          accept=".pdf,image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-emerald-50">
              {file ? file.name : 'Drop invoice document or click to browse'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-1">
              Supports scanned PDF files, PNG, JPG, or JPEG vouchers (max 10MB)
            </p>
          </div>

          <div className="flex justify-center items-center space-x-3 pt-2">
            <label
              htmlFor="invoiceUploadInput"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Browse Files
            </label>

            <button
              onClick={handleProcessExtraction}
              disabled={!file || extracting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {extracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Document Fields...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Extraction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Review & Edit Extracted Results */}
      {extractedData && (
        <div className="bg-white dark:bg-[#082216] rounded-2xl p-6 sm:p-7 border border-emerald-100 dark:border-emerald-900/40 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-900/40">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-emerald-50">Review & Correct Extracted Data</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-emerald-300/70 mt-0.5">
                AI extracted fields with {confidence ? `${(confidence * 100).toFixed(0)}%` : '96%'} confidence.
                Verify and edit any value before creating an order.
              </p>
            </div>

            <button
              onClick={handleConvertToOrder}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Convert to Draft Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Form for Customer Fields */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-emerald-300 flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Customer Identification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-emerald-300/80 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={extractedData.customer?.name || ''}
                  onChange={(e) => handleCustomerFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl text-slate-900 dark:text-emerald-50 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-emerald-300/80 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={extractedData.customer?.phone || ''}
                  onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl text-slate-900 dark:text-emerald-50 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-emerald-300/80 mb-1">Email Address</label>
                <input
                  type="email"
                  value={extractedData.customer?.email || ''}
                  onChange={(e) => handleCustomerFieldChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl text-slate-900 dark:text-emerald-50 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-600 dark:text-emerald-300/80 mb-1">Billing & Delivery Address</label>
                <input
                  type="text"
                  value={extractedData.customer?.address || ''}
                  onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl text-slate-900 dark:text-emerald-50 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Form for Extracted Items */}
          <div className="space-y-3 pt-4 border-t border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-emerald-300 flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Extracted Line Items ({extractedData.items.length})</span>
              </h4>

              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {extractedData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/70 dark:bg-emerald-950/20 border border-slate-200/80 dark:border-emerald-900/40 rounded-xl grid grid-cols-12 gap-3 items-center text-xs"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold mb-0.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={item.product}
                      onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#082216] border border-slate-200 dark:border-emerald-800/40 rounded-lg font-medium text-slate-900 dark:text-emerald-50"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold mb-0.5">
                      Qty
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#082216] border border-slate-200 dark:border-emerald-800/40 rounded-lg font-bold text-slate-900 dark:text-emerald-50"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold mb-0.5">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#082216] border border-slate-200 dark:border-emerald-800/40 rounded-lg text-slate-700 dark:text-emerald-200"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold mb-0.5">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, 'price', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#082216] border border-slate-200 dark:border-emerald-800/40 rounded-lg font-bold text-slate-900 dark:text-emerald-50"
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier & Previous Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-100 dark:border-emerald-900/40 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-emerald-300/80 mb-1">
                Extracted Previous Balance (₹)
              </label>
              <input
                type="number"
                step="any"
                value={extractedData.previous_balance || 0}
                onChange={(e) =>
                  setExtractedData({
                    ...extractedData,
                    previous_balance: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl font-medium text-slate-900 dark:text-emerald-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-emerald-300/80 mb-1">
                Extracted Courier Charges (₹)
              </label>
              <input
                type="number"
                step="any"
                value={extractedData.courier_charge || 0}
                onChange={(e) =>
                  setExtractedData({
                    ...extractedData,
                    courier_charge: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 rounded-xl font-medium text-slate-900 dark:text-emerald-50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleConvertToOrder}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Transfer to New Order & Generate Invoice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
