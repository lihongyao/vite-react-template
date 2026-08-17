import { localeMap } from '@/i18n/config';
import i18n from '@/i18n/instance';

const POINTS_PER_FIAT_UNIT = 1;

export const FiatCurrencySymbol = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  HKD: 'HK$',
  TWD: 'NT$',
  KRW: '₩',
  SGD: 'S$',
  AUD: 'A$',
  NZD: 'NZ$',
  CAD: 'CA$',
  CHF: 'CHF',

  BRL: 'R$',
  MXN: '$',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
  UYU: '$U',

  INR: '₹',
  PKR: '₨',
  BDT: '৳',
  LKR: 'Rs',
  NPR: 'रू',

  IDR: 'Rp',
  MYR: 'RM',
  THB: '฿',
  VND: '₫',
  PHP: '₱',

  TRY: '₺',
  RUB: '₽',
  UAH: '₴',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  ISK: 'kr',

  ILS: '₪',
  SAR: '﷼',
  AED: 'د.إ',
  QAR: 'ر.ق',
  KWD: 'د.ك',
  BHD: 'د.ب',
  OMR: 'ر.ع.',

  EGP: 'E£',
  ZAR: 'R',
  NGN: '₦',
  KES: 'KSh',
  GHS: 'GH₵',
  ZMW: 'ZK',
  ETB: 'Br',
  MAD: 'د.م.',
  TND: 'د.ت',
  DZD: 'دج',
} as const;

type FiatCurrencyCode = keyof typeof FiatCurrencySymbol;

/**
 * 将积分换算并格式化为当前 app 配置的法币。
 * 数字格式和符号位置跟随当前语言，币种符号固定使用 FiatCurrencySymbol 的配置。
 */
export function point2Fiat({ value, showSymbol = true }: { value: number; showSymbol?: boolean }) {
  const currencyCode = 'BRL';
  const currencySymbol = FiatCurrencySymbol[currencyCode as FiatCurrencyCode];
  const fiatValue = value / POINTS_PER_FIAT_UNIT;
  const currentLocale = i18n.resolvedLanguage ?? i18n.language;
  const resolvedLocale = currentLocale ? (localeMap[currentLocale] ?? currentLocale) : undefined;
  const fractionDigits = Number.isInteger(fiatValue)
    ? { maximumFractionDigits: 0, minimumFractionDigits: 0 }
    : {};
  const formatter = new Intl.NumberFormat(resolvedLocale, {
    ...(currencySymbol ? { style: 'currency', currency: currencyCode } : {}),
    ...fractionDigits,
  });

  return formatter
    .formatToParts(fiatValue)
    .filter(({ type }) => showSymbol || type !== 'currency')
    .map(({ type, value: partValue }) =>
      type === 'currency' ? (currencySymbol ?? partValue) : partValue,
    )
    .join('')
    .trim();
}
