/**
 * Number to words converter for Indian currency (INR)
 * e.g. 400 -> "Four Hundred Only"
 *      1060 -> "One Thousand Sixty Only"
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const tens = TENS[Math.floor(n / 10)];
  const ones = ONES[n % 10];
  return `${tens} ${ones}`.trim();
}

function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  let res = '';
  if (hundreds > 0) {
    res += `${ONES[hundreds]} Hundred`;
    if (rem > 0) {
      res += ` and ${twoDigits(rem)}`;
    }
  } else {
    res = twoDigits(rem);
  }
  return res.trim();
}

export function numberToWordsInr(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) {
    return 'Zero Only';
  }

  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  if (rupees === 0 && paise === 0) {
    return 'Zero Only';
  }

  const crore = Math.floor(rupees / 10000000);
  let rem = rupees % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh > 0) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rem > 0) parts.push(threeDigits(rem));

  const rupeesStr = parts.join(' ').trim();

  if (paise > 0) {
    const paiseStr = `${twoDigits(paise)} Paise`;
    if (rupeesStr) {
      return `${rupeesStr} Rupees and ${paiseStr} Only`;
    }
    return `${paiseStr} Only`;
  }

  return `${rupeesStr} Only`;
}
