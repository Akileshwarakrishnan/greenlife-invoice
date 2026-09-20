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
    <div className="space-y-6 max-w-5xl mx-auto" style={{ background: 'transparent' }}>
      <PageHeader
        title={t('nav.ai_extract', 'AI Invoice OCR Extraction')}
        subtitle="Upload paper receipts, supplier bills, or PDF vouchers to automatically extract items, amounts, and customer profiles."
        badge="Multimodal OCR Intelligence"
      />

      {error && (
        <div className="p-4 border text-xs rounded-2xl flex items-center space-x-2" style={{ background: '#FDF3E3', borderColor: '#C68B3A', color: '#C68B3A' }}>
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
        className="rounded-2xl border-2 border-dashed p-8 text-center transition-all shadow-xs"
        style={{
          background: dragOver ? '#EBF5EE' : 'white',
          borderColor: dragOver ? '#2D6A4F' : '#EEEAE0',
        }}
        onMouseEnter={(e) => { if (!dragOver) e.currentTarget.style.borderColor = '#B7D9C4'; }}
        onMouseLeave={(e) => { if (!dragOver) e.currentTarget.style.borderColor = '#EEEAE0'; }}
      >
        <input
          type="file"
          id="invoiceUploadInput"
          accept=".pdf,image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xs" style={{ background: '#EBF5EE', color: '#2D6A4F', borderColor: '#B7D9C4' }}>
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold" style={{ color: '#1C1A15' }}>
              {file ? file.name : 'Drop invoice document or click to browse'}
            </h3>
            <p className="text-xs mt-1" style={{ color: '#8C8880' }}>
              Supports scanned PDF files, PNG, JPG, or JPEG vouchers (max 10MB)
            </p>
          </div>

          <div className="flex justify-center items-center space-x-3 pt-2">
            <label
              htmlFor="invoiceUploadInput"
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              style={{ background: '#F7F5EF', color: '#4A4740' }}
            >
              Browse Files
            </label>

            <button
              onClick={handleProcessExtraction}
              disabled={!file || extracting}
              className="px-5 py-2 disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
              style={{ background: '#2D6A4F', color: 'white' }}
            >
              {extracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#C68B3A' }} />
                  <span>Extracting Document Fields...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" style={{ color: '#C68B3A' }} />
                  <span>Run AI Extraction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Review & Edit Extracted Results */}
      {extractedData && (
        <div className="rounded-2xl p-6 sm:p-7 border shadow-xs space-y-6" style={{ background: 'white', borderColor: '#EEEAE0' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: '#EEEAE0' }}>
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                <h3 className="font-bold text-base" style={{ color: '#1C1A15' }}>Review & Correct Extracted Data</h3>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#8C8880' }}>
                AI extracted fields with {confidence ? `${(confidence * 100).toFixed(0)}%` : '96%'} confidence.
                Verify and edit any value before creating an order.
              </p>
            </div>

            <button
              onClick={handleConvertToOrder}
              className="px-5 py-2.5 font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              style={{ background: '#2D6A4F', color: 'white' }}
            >
              <span>Convert to Draft Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Form for Customer Fields */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2" style={{ color: '#4A4740' }}>
              <User className="w-4 h-4" style={{ color: '#2D6A4F' }} />
              <span>Customer Identification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: '#8C8880' }}>Customer Name</label>
                <input
                  type="text"
                  value={extractedData.customer?.name || ''}
                  onChange={(e) => handleCustomerFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: '#8C8880' }}>Phone Number</label>
                <input
                  type="text"
                  value={extractedData.customer?.phone || ''}
                  onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: '#8C8880' }}>Email Address</label>
                <input
                  type="email"
                  value={extractedData.customer?.email || ''}
                  onChange={(e) => handleCustomerFieldChange('email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold mb-1" style={{ color: '#8C8880' }}>Billing & Delivery Address</label>
                <input
                  type="text"
                  value={extractedData.customer?.address || ''}
                  onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium focus:outline-hidden"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
                />
              </div>
            </div>
          </div>

          {/* Form for Extracted Items */}
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: '#EEEAE0' }}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2" style={{ color: '#4A4740' }}>
                <ShoppingBag className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span>Extracted Line Items ({extractedData.items.length})</span>
              </h4>

              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                style={{ color: '#2D6A4F' }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {extractedData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-xl grid grid-cols-12 gap-3 items-center text-xs"
                  style={{ background: '#F7F5EF', borderColor: '#EEEAE0' }}
                >
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#8C8880' }}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={item.product}
                      onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg font-medium"
                      style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#8C8880' }}>
                      Qty
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-1.5 border rounded-lg font-bold"
                      style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#8C8880' }}>
                      Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                      style={{ background: 'white', borderColor: '#EEEAE0', color: '#4A4740' }}
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <label className="block text-[10px] font-semibold mb-0.5" style={{ color: '#8C8880' }}>
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, 'price', Number(e.target.value))}
                      className="w-full px-3 py-1.5 border rounded-lg font-bold"
                      style={{ background: 'white', borderColor: '#EEEAE0', color: '#1C1A15' }}
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg transition-colors cursor-pointer"
                      style={{ color: '#8C8880' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier & Previous Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-xs" style={{ borderColor: '#EEEAE0' }}>
            <div>
              <label className="block font-semibold mb-1" style={{ color: '#8C8880' }}>
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
                className="w-full px-3 py-2 border rounded-xl font-medium"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1" style={{ color: '#8C8880' }}>
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
                className="w-full px-3 py-2 border rounded-xl font-medium"
                style={{ background: '#F7F5EF', borderColor: '#EEEAE0', color: '#1C1A15' }}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleConvertToOrder}
              className="px-6 py-2.5 font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              style={{ background: '#2D6A4F', color: 'white' }}
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
