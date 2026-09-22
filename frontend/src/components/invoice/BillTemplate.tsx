import React from 'react';
import { Invoice } from '../../types';
import { numberToWordsInr } from '../../utils/numberToWords';
import { Landmark } from 'lucide-react';

interface BillTemplateProps {
  invoice: Invoice;
  mode?: 'bill' | 'quotation';
}

export const BillTemplate: React.FC<BillTemplateProps> = ({ invoice, mode = 'bill' }) => {
  const isQuotation = mode === 'quotation';
  const subtotal = invoice.subtotal || 0;
  const courierCharges = invoice.courier_charges || 0;
  const previousBalance = invoice.previous_balance || 0;
  const taxAmount = invoice.tax_amount || 0;
  const discountAmount = invoice.discount_amount || 0;
  const grandTotal =
    invoice.grand_total !== undefined
      ? invoice.grand_total
      : Math.round((subtotal + previousBalance + courierCharges + taxAmount - discountAmount) * 100) / 100;
  const paymentMethod = (invoice.payment_method || 'cash').toLowerCase();
  
  const isWalkIn = courierCharges === 0;
  const isCourier = courierCharges > 0;

  const wordsAmount = numberToWordsInr(grandTotal);

  return (
    <div className="print-sheet bg-white text-slate-900 border-2 border-[#284B35] rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-lg print:shadow-none print:border-2 print:border-[#284B35] print:p-6 print:rounded-2xl max-w-4xl mx-auto space-y-3.5 sm:space-y-4 font-sans leading-tight">
      {/* 1. TOP REGISTRATION ROW */}
      <div className="flex justify-between items-center text-xs font-bold text-slate-800 border-b border-transparent pb-1">
        <span>FSSAI: 22416495000038</span>
        <span>MSME: TN28D0028521</span>
      </div>

      {/* 2. STORE BRANDING HEADER WITH GODDESS LAKSHMI */}
      <div className="flex items-center justify-between gap-4 pt-1">
        {/* Left: Lakshmi Logo */}
        <div className="w-20 sm:w-24 flex-shrink-0 flex items-center justify-center">
          <img
            src="/lakshmi_logo.png"
            alt="Goddess Lakshmi"
            className="w-16 sm:w-20 h-auto object-contain"
          />
        </div>

        {/* Center: Title & Address */}
        <div className="flex-1 text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#284B35] tracking-tight">
            கிரீன் லைப் நேச்சுரல் புட்ஸ்
          </h1>
          <h2 className="text-2xl sm:text-4xl font-black text-[#284B35] tracking-wide">
            GREENLIFE NATURAL FOODS
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            64, சத்திரம் வீதி, உடுமலைப்பேட்டை – 642126.
          </p>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-center space-x-3">
            <span>📞 97887 94692</span>
            <span>|</span>
            <span>✉ E.Mail : rvs.arumugam@yahoo.com</span>
          </p>
        </div>

        {/* Right placeholder to keep center balanced */}
        <div className="w-20 sm:w-24 flex-shrink-0 hidden sm:block"></div>
      </div>

      {/* 3. BILL META BAR */}
      <div className="grid grid-cols-12 items-center border-t-2 border-b border-[#284B35] py-2 text-xs sm:text-sm font-bold">
        <div className="col-span-4 font-mono font-bold text-slate-900">
          <span>No. &nbsp;</span>
          <span>{invoice.invoice_number || 'GLNF/25-26/0712'}</span>
        </div>

        <div className="col-span-4 text-center">
          <span className="inline-block px-4 py-1 rounded-md bg-[#E4EFE7] text-[#284B35] font-black italic border border-[#284B35] tracking-wide text-xs sm:text-sm shadow-2xs">
            {isQuotation ? 'PRODUCT QUOTATION' : 'CASH / CREDIT BILL'}
          </span>
        </div>

        <div className="col-span-4 text-right text-slate-900">
          <span>Date : &nbsp;</span>
          <span>{invoice.invoice_date}</span>
        </div>
      </div>

      {/* 4. CUSTOMER PARTICULARS BOX */}
      <div className="border-b border-[#284B35] pb-3 text-xs sm:text-sm space-y-1">
        <div className="flex">
          <span className="w-24 font-bold text-slate-800 flex-shrink-0">Name &nbsp;&nbsp;&nbsp;:</span>
          <span className="font-extrabold text-slate-900 uppercase">{invoice.customer_name}</span>
        </div>

        <div className="flex items-start">
          <span className="w-24 font-bold text-slate-800 flex-shrink-0">Address :</span>
          <span className="text-slate-700 leading-normal">{invoice.customer_address}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between pt-1">
          <div className="flex">
            <span className="w-24 font-bold text-slate-800 flex-shrink-0">Mobile &nbsp;&nbsp;:</span>
            <span className="font-bold text-slate-900">{invoice.customer_phone || '—'}</span>
          </div>

          <div className="flex pr-4">
            <span className="font-bold text-slate-800">GST : &nbsp;</span>
            <span className="font-bold text-slate-900">{invoice.customer_gstin || 'Not Applicable'}</span>
          </div>
        </div>
      </div>

      {/* Quotation Greeting if Quotation mode */}
      {isQuotation && (
        <div className="text-xs text-slate-700 italic bg-[#E4EFE7]/50 p-2 rounded-lg border border-[#C9DFCF]">
          Dear Sir / Madam, We thank you for your inquiry. Please find below our best quotation for the products you are interested in.
        </div>
      )}

      {/* 5. CURRENT BILL ITEMS TABLE */}
      <div className="border border-[#284B35] overflow-x-auto rounded-md">
        <table className="w-full min-w-[500px] sm:min-w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#E4EFE7] text-[#284B35] font-black border-b border-[#284B35] text-center">
              <th className="p-2 border-r border-[#284B35] w-12">Mrp.</th>
              <th className="p-2 border-r border-[#284B35] text-left">Particulars</th>
              <th className="p-2 border-r border-[#284B35] w-28">Kg./Ltr./Unit</th>
              <th className="p-2 border-r border-[#284B35] w-14">Qty</th>
              <th className="p-2 border-r border-[#284B35] w-24 text-right">Rate (₹)</th>
              <th className="p-2 w-28 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#284B35]/30 text-slate-900">
            {invoice.items?.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-2 border-r border-[#284B35] text-center font-bold">{idx + 1}</td>
                <td className="p-2 border-r border-[#284B35] font-extrabold text-slate-900">
                  {item.product_name}
                </td>
                <td className="p-2 border-r border-[#284B35] text-center font-semibold">{item.unit || 'kg'}</td>
                <td className="p-2 border-r border-[#284B35] text-center font-black">{item.quantity}</td>
                <td className="p-2 border-r border-[#284B35] text-right font-bold">
                  {item.unit_price.toFixed(2)}
                </td>
                <td className="p-2 text-right font-black text-slate-950">
                  {item.total_amount.toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="border-t-2 border-[#284B35] font-black bg-white">
              <td colSpan={5} className="p-2 text-right uppercase border-r border-[#284B35]">
                {isQuotation ? 'TOTAL QUOTATION' : 'TOTAL'}
              </td>
              <td className="p-2 text-right text-sm font-black text-slate-950">
                {subtotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. OLD BILL DETAILS (PREVIOUS INVOICE) - Matches reference image */}
      {!isQuotation && (
        <div className="border border-[#284B35] rounded-md overflow-hidden">
          {/* Banner */}
          <div className="bg-[#284B35] text-white text-center py-1 font-black text-xs uppercase tracking-wider">
            OLD BILL DETAILS (Previous Invoice)
          </div>

          <div className="flex justify-between items-center px-3 py-1 bg-white text-xs font-bold border-b border-[#284B35]">
            <span>Old Bill No. &nbsp; {previousBalance > 0 ? 'GLNF-OLD-DUE' : '—'}</span>
            <span>Old Bill Date : {previousBalance > 0 ? 'Previous Ledger' : '—'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] sm:min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E4EFE7] text-[#284B35] font-black border-b border-[#284B35] text-center">
                  <th className="p-1.5 border-r border-[#284B35] w-12">Mrp.</th>
                  <th className="p-1.5 border-r border-[#284B35] text-left">Particulars</th>
                  <th className="p-1.5 border-r border-[#284B35] w-28">Kg./Ltr./Unit</th>
                  <th className="p-1.5 border-r border-[#284B35] w-14">Qty</th>
                  <th className="p-1.5 border-r border-[#284B35] w-24 text-right">Rate (₹)</th>
                  <th className="p-1.5 w-28 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {previousBalance > 0 ? (
                  <tr>
                    <td className="p-1.5 border-r border-[#284B35] text-center font-bold">1</td>
                    <td className="p-1.5 border-r border-[#284B35] font-bold text-slate-800">
                      முந்தைய பாக்கி நிலுவை (Previous Customer Due)
                    </td>
                    <td className="p-1.5 border-r border-[#284B35] text-center">Account</td>
                    <td className="p-1.5 border-r border-[#284B35] text-center font-bold">1</td>
                    <td className="p-1.5 border-r border-[#284B35] text-right font-bold">{previousBalance.toFixed(2)}</td>
                    <td className="p-1.5 text-right font-black">{previousBalance.toFixed(2)}</td>
                  </tr>
                ) : (
                  <tr>
                    <td className="p-1.5 border-r border-[#284B35] text-center text-slate-400">—</td>
                    <td className="p-1.5 border-r border-[#284B35] text-slate-500 italic">
                      முந்தைய பாக்கி எதுவும் இல்லை (No Old Pending Balance)
                    </td>
                    <td className="p-1.5 border-r border-[#284B35] text-center text-slate-400">—</td>
                    <td className="p-1.5 border-r border-[#284B35] text-center text-slate-400">—</td>
                    <td className="p-1.5 border-r border-[#284B35] text-right font-bold">0.00</td>
                    <td className="p-1.5 text-right font-bold">0.00</td>
                  </tr>
                )}
                <tr className="border-t border-[#284B35] font-black bg-white">
                  <td colSpan={5} className="p-1.5 text-right uppercase border-r border-[#284B35]">
                    OLD BILL TOTAL
                  </td>
                  <td className="p-1.5 text-right text-xs font-black text-slate-950">
                    {previousBalance.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. BOTTOM 4-BOX SECTION (DELIVERY MODE | PAYMENT MODE | COURIER DETAILS | BILL SUMMARY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 text-xs print:grid-cols-12 print:gap-2">
        {/* Box 1: DELIVERY MODE */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-3 print:col-span-3 border border-[#284B35] rounded-md p-2 space-y-2">
          <div className="font-black text-center border-b border-[#284B35] pb-1 uppercase tracking-wide text-[#284B35]">
            DELIVERY MODE
          </div>
          <div className="space-y-1.5 font-semibold text-slate-800">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" readOnly checked={isWalkIn} className="accent-[#284B35]" />
              <span>Walk-in</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" readOnly checked={isCourier} className="accent-[#284B35]" />
              <span>Courier</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" readOnly checked={false} className="accent-[#284B35]" />
              <span>Home Delivery</span>
            </label>
          </div>
        </div>

        {/* Box 2: PAYMENT MODE */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-3 print:col-span-3 border border-[#284B35] rounded-md p-2 space-y-2">
          <div className="font-black text-center border-b border-[#284B35] pb-1 uppercase tracking-wide text-[#284B35]">
            PAYMENT MODE
          </div>
          <div className="space-y-1.5 font-semibold text-slate-800">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" readOnly checked={paymentMethod === 'cash'} className="accent-[#284B35]" />
              <span>Cash</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" readOnly checked={paymentMethod === 'upi'} className="accent-[#284B35]" />
              <span>UPI</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" readOnly checked={paymentMethod === 'bank_transfer'} className="accent-[#284B35]" />
              <span>Bank Transfer</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" readOnly checked={paymentMethod === 'credit'} className="accent-[#284B35]" />
              <span>Credit</span>
            </label>
          </div>
        </div>

        {/* Box 3: COURIER DETAILS */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-3 print:col-span-3 border border-[#284B35] rounded-md p-2 space-y-2">
          <div className="font-black text-center border-b border-[#284B35] pb-1 uppercase tracking-wide text-[#284B35]">
            COURIER DETAILS
          </div>
          <div className="space-y-2 text-[11px] text-slate-700">
            <p>Courier Partner : {isCourier ? 'ST Courier / Professional' : '................'}</p>
            <p>Tracking No. : {isCourier ? `TRK-${(invoice.invoice_number || '').slice(-4)}` : '................'}</p>
          </div>
        </div>

        {/* Box 4: BILL SUMMARY */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-3 print:col-span-3 border border-[#284B35] rounded-md overflow-hidden flex flex-col justify-between">
          <div className="bg-[#284B35] text-white text-center py-1 font-black text-xs uppercase tracking-wide">
            {isQuotation ? 'QUOTATION SUMMARY' : 'BILL SUMMARY'}
          </div>

          <div className="divide-y divide-[#284B35] text-xs font-semibold">
            <div className="flex justify-between p-1.5">
              <span>Product Total</span>
              <span className="font-bold">₹ {subtotal.toFixed(2)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between p-1.5 text-slate-800">
                <span>GST / Tax (வரி)</span>
                <span className="font-bold text-[#284B35]">+₹ {taxAmount.toFixed(2)}</span>
              </div>
            )}
            {previousBalance > 0 && (
              <div className="flex justify-between p-1.5 text-slate-800">
                <span>Old Due (பாக்கி)</span>
                <span className="font-bold">+₹ {previousBalance.toFixed(2)}</span>
              </div>
            )}
            {courierCharges > 0 && (
              <div className="flex justify-between p-1.5 text-slate-800">
                <span>Courier Charges</span>
                <span className="font-bold">+₹ {courierCharges.toFixed(2)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between p-1.5 text-emerald-800">
                <span>Discount (தள்ளுபடி)</span>
                <span className="font-bold text-emerald-700">-₹ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between p-1.5 bg-[#E4EFE7] font-black text-slate-950">
              <span className="uppercase">GRAND TOTAL</span>
              <span className="text-sm font-black text-[#284B35]">₹ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. RUPEES IN WORDS & SIGNATURE */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-2 text-xs">
        <div className="space-y-1">
          <p className="font-bold text-slate-800">
            <span>Rupees (in words) : &nbsp;</span>
            <span className="font-extrabold text-slate-950 underline decoration-dotted">
              {wordsAmount}
            </span>
          </p>
        </div>

        <div className="text-right sm:pr-4">
          <div className="w-36 border-b border-slate-700 pb-1 mb-1 ml-auto"></div>
          <p className="font-bold text-slate-700 text-[11px]">Proprietor</p>
          <p className="font-black text-slate-950 text-sm">RVS.Arumugam</p>
        </div>
      </div>

      {/* 9. BANK DETAILS FOOTER BOX (SBI UDUMALPET) */}
      <div className="bg-[#E4EFE7] border border-[#284B35] rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-[#284B35] font-bold relative overflow-hidden">
        <div className="flex items-center space-x-3 z-10">
          <div className="w-8 h-8 rounded-xl bg-[#284B35] text-white flex items-center justify-center flex-shrink-0">
            <Landmark className="w-4 h-4 text-[#F5C242]" />
          </div>
          <div className="space-y-0.5">
            <p className="font-black">
              BANK: SBI BRANCH - UDUMALPET , IFSC: SBIN0000944
            </p>
            <p className="font-black">
              A/C NAME: GREEN LIFE NATURAL FOODS. C/C : 35949191474
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 z-10">
          <img src="/leaf_right.png" alt="organic leaves" className="h-8 object-contain" />
        </div>
      </div>
    </div>
  );
};
