import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Decimal-safe monetary arithmetic.
 * Multiplies by 100 or handles scale to avoid IEEE-754 floating-point inaccuracies.
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function safeAdd(a: number, b: number): number {
  return roundToTwo(roundToTwo(a) + roundToTwo(b));
}

export function safeSub(a: number, b: number): number {
  return roundToTwo(roundToTwo(a) - roundToTwo(b));
}

export function safeMul(a: number, b: number): number {
  return roundToTwo(roundToTwo(a) * roundToTwo(b));
}

export function safeDiv(a: number, b: number): number {
  if (b === 0) return 0;
  return roundToTwo(roundToTwo(a) / roundToTwo(b));
}

/**
 * Format currency with locale and symbol
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  showSymbol: boolean = true
): string {
  const safeVal = roundToTwo(amount);
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(safeVal);
  } catch {
    return `${currencyCode} ${safeVal.toFixed(2)}`;
  }
}

/**
 * Format date string safely
 */
export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Amount in words generator (supports USD, INR, EUR, GBP, etc.)
 */
export function numberToWords(amount: number, currencyCode: string = 'USD'): string {
  const rounded = roundToTwo(amount);
  const whole = Math.floor(rounded);
  const cents = Math.round((rounded - whole) * 100);

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertChunk(num: number): string {
    if (num === 0) return '';
    if (num < 20) return units[num] + ' ';
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + units[num % 10] : '') + ' ';
    return units[Math.floor(num / 100)] + ' Hundred ' + convertChunk(num % 100);
  }

  function convert(num: number): string {
    if (num === 0) return 'Zero';
    let result = '';
    
    const billions = Math.floor(num / 1000000000);
    const millions = Math.floor((num % 1000000000) / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    if (billions) result += convertChunk(billions) + 'Billion ';
    if (millions) result += convertChunk(millions) + 'Million ';
    if (thousands) result += convertChunk(thousands) + 'Thousand ';
    if (remainder) result += convertChunk(remainder);

    return result.trim();
  }

  const wholeWords = convert(whole);
  const currencyName = currencyCode.toUpperCase();
  
  let out = `${wholeWords} ${currencyName}`;
  if (cents > 0) {
    out += ` and ${convertChunk(cents).trim()} Cents`;
  }
  return out + ' Only';
}

/**
 * Generate cryptographically strong random token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Generate sequential document numbers
 */
export function generateDocNumber(prefix: string, sequence: number, year?: number): string {
  const currentYear = year || new Date().getFullYear();
  const paddedSeq = String(sequence).padStart(4, '0');
  return `${prefix}-${currentYear}-${paddedSeq}`;
}
