// Currency formatting utilities
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CHF: 'CHF',
  CNY: '¥',
  KRW: '₩',
  BRL: 'R$',
  MXN: '$',
  SGD: 'S$',
  HKD: 'HK$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RUB: '₽',
  TRY: '₺',
  ZAR: 'R',
  THB: '฿',
  MYR: 'RM',
  IDR: 'Rp',
  PHP: '₱',
  VND: '₫',
  EGP: 'E£',
  NGN: '₦',
  KES: 'KSh',
  GHS: 'GH₵',
  MAD: 'MAD',
  TND: 'TND',
  DZD: 'DZD',
  LYD: 'LYD',
  SDG: 'SDG',
  ETB: 'ETB',
  UGX: 'UGX',
  TZS: 'TSh',
  MWK: 'MWK',
  ZMW: 'ZK',
  BWP: 'P',
  NAM: 'N$',
  SZL: 'E',
  LSL: 'L',
  ZWL: 'Z$',
  BIF: 'FBu',
  RWF: 'FRw',
  CDF: 'FC',
  XAF: 'FCFA',
  XOF: 'CFA',
  GMD: 'D',
  GNF: 'FG',
  MRO: 'UM',
  MRU: 'UM',
  STN: 'Db',
  CVE: '$',
  GWP: 'CFA',
  GNS: 'FG',
  BDT: '৳',
  NPR: '₨',
  PKR: '₨',
  LKR: 'Rs',
  MMK: 'K',
  KHR: '៛',
  LAK: '₭',
  MNT: '₮',
  KZT: '₸',
  TMT: 'T',
  AZN: '₼',
  GEL: '₾',
  AMD: '֏',
  BYN: 'Br',
  MDL: 'L',
  UAH: '₴',
  RON: 'lei',
  BGN: 'лв',
  HRK: 'kn',
  RSD: 'дин.',
  MKD: 'ден',
  ALL: 'L',
  BAM: 'KM',
  XCD: '$',
  BBD: '$',
  JMD: '$',
  TTD: '$',
  BZD: '$',
  HTG: 'G',
  DOP: '$',
  PAB: 'B/.',
  NIO: 'C$',
  CRC: '₡',
  SVC: '$',
  GTQ: 'Q',
  HNL: 'L',
  PYG: '₲',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
  UYU: '$',
  VEF: 'Bs',
  VES: 'Bs',
  BOB: 'Bs',
  GYD: '$',
  SRD: '$',
  FJD: '$',
  PGK: 'K',
  WST: 'T',
  TOP: 'T$',
  VUV: 'VT',
  SBD: '$',
  KID: '$',
  TVD: '$',
  NCL: '₣',
  XPF: '₣',
  CFP: '₣',
  NZD: '$',
  XAU: 'XAU',
  XAG: 'XAG',
  XPT: 'XPT',
  XPD: 'XPD',
  BTC: '₿',
  ETH: 'Ξ',
  LTC: 'Ł',
  XRP: 'XRP',
  BCH: 'BCH',
  ADA: '₳',
  DOT: 'DOT',
  LINK: 'LINK',
  UNI: 'UNI',
  AAVE: 'AAVE',
  COMP: 'COMP',
  MKR: 'MKR',
  SNX: 'SNX',
  YFI: 'YFI',
  SUSHI: 'SUSHI',
  CRV: 'CRV',
  BAL: 'BAL',
  REN: 'REN',
  KNC: 'KNC',
  ZRX: 'ZRX',
  BAT: 'BAT',
  REP: 'REP',
  GNO: 'GNO',
  OMG: 'OMG',
  MANA: 'MANA',
  SAND: 'SAND',
  ENJ: 'ENJ',
  CHZ: 'CHZ',
  HOT: 'HOT',
  VET: 'VET',
  TRX: 'TRX',
  XLM: 'XLM',
  XMR: 'XMR',
  DASH: 'DASH',
  ZEC: 'ZEC',
  XTZ: 'XTZ',
  ALGO: 'ALGO',
  ATOM: 'ATOM',
  NEO: 'NEO',
  EOS: 'EOS',
  IOTA: 'IOTA',
  NANO: 'NANO',
  BNB: 'BNB',
  CAKE: 'CAKE',
  BUSD: 'BUSD',
  USDT: 'USDT',
  USDC: 'USDC',
  DAI: 'DAI',
  TUSD: 'TUSD',
  PAX: 'PAX',
  GUSD: 'GUSD',
  HUSD: 'HUSD',
  FRAX: 'FRAX',
  SUSD: 'SUSD',
  LUSD: 'LUSD',
  FEI: 'FEI',
  RAI: 'RAI',
  AMPL: 'AMPL',
  YAM: 'YAM',
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  KRW: 'South Korean Won',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  PLN: 'Polish Złoty',
  CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint',
  RUB: 'Russian Ruble',
  TRY: 'Turkish Lira',
  ZAR: 'South African Rand',
  THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit',
  IDR: 'Indonesian Rupiah',
  PHP: 'Philippine Peso',
  VND: 'Vietnamese Dong',
  EGP: 'Egyptian Pound',
  NGN: 'Nigerian Naira',
  KES: 'Kenyan Shilling',
  GHS: 'Ghanaian Cedi',
  MAD: 'Moroccan Dirham',
  TND: 'Tunisian Dinar',
  DZD: 'Algerian Dinar',
  LYD: 'Libyan Dinar',
  SDG: 'Sudanese Pound',
  ETB: 'Ethiopian Birr',
  UGX: 'Ugandan Shilling',
  TZS: 'Tanzanian Shilling',
  MWK: 'Malawian Kwacha',
  ZMW: 'Zambian Kwacha',
  BWP: 'Botswana Pula',
  NAM: 'Namibian Dollar',
  SZL: 'Eswatini Lilangeni',
  LSL: 'Lesotho Loti',
  ZWL: 'Zimbabwean Dollar',
  BIF: 'Burundian Franc',
  RWF: 'Rwandan Franc',
  CDF: 'Congolese Franc',
  XAF: 'Central African CFA Franc',
  XOF: 'West African CFA Franc',
  GMD: 'Gambian Dalasi',
  GNF: 'Guinean Franc',
  MRO: 'Mauritanian Ouguiya',
  MRU: 'Mauritanian Ouguiya',
  STN: 'São Tomé and Príncipe Dobra',
  CVE: 'Cape Verdean Escudo',
  GWP: 'Guinea-Bissau Peso',
  GNS: 'Guinean Syli',
  BDT: 'Bangladeshi Taka',
  NPR: 'Nepalese Rupee',
  PKR: 'Pakistani Rupee',
  LKR: 'Sri Lankan Rupee',
  MMK: 'Myanmar Kyat',
  KHR: 'Cambodian Riel',
  LAK: 'Lao Kip',
  MNT: 'Mongolian Tögrög',
  KZT: 'Kazakhstani Tenge',
  UZS: 'Uzbekistani Som',
  TJS: 'Tajikistani Somoni',
  TMT: 'Turkmenistan Manat',
  AZN: 'Azerbaijani Manat',
  GEL: 'Georgian Lari',
  AMD: 'Armenian Dram',
  BYN: 'Belarusian Ruble',
  MDL: 'Moldovan Leu',
  UAH: 'Ukrainian Hryvnia',
  RON: 'Romanian Leu',
  BGN: 'Bulgarian Lev',
  HRK: 'Croatian Kuna',
  RSD: 'Serbian Dinar',
  MKD: 'Macedonian Denar',
  ALL: 'Albanian Lek',
  BAM: 'Bosnia and Herzegovina Convertible Mark',
  XCD: 'East Caribbean Dollar',
  BBD: 'Barbadian Dollar',
  JMD: 'Jamaican Dollar',
  TTD: 'Trinidad and Tobago Dollar',
  BZD: 'Belize Dollar',
  HTG: 'Haitian Gourde',
  DOP: 'Dominican Peso',
  PAB: 'Panamanian Balboa',
  NIO: 'Nicaraguan Córdoba',
  CRC: 'Costa Rican Colón',
  SVC: 'Salvadoran Colón',
  GTQ: 'Guatemalan Quetzal',
  HNL: 'Honduran Lempira',
  PYG: 'Paraguayan Guaraní',
  ARS: 'Argentine Peso',
  CLP: 'Chilean Peso',
  COP: 'Colombian Peso',
  PEN: 'Peruvian Sol',
  UYU: 'Uruguayan Peso',
  VEF: 'Venezuelan Bolívar',
  VES: 'Venezuelan Bolívar',
  BOB: 'Bolivian Boliviano',
  GYD: 'Guyanese Dollar',
  SRD: 'Surinamese Dollar',
  FJD: 'Fijian Dollar',
  PGK: 'Papua New Guinean Kina',
  WST: 'Samoan Tālā',
  TOP: 'Tongan Paʻanga',
  VUV: 'Vanuatu Vatu',
  SBD: 'Solomon Islands Dollar',
  KID: 'Kiribati Dollar',
  TVD: 'Tuvaluan Dollar',
  NCL: 'New Caledonian Franc',
  XPF: 'CFP Franc',
  CFP: 'CFP Franc',
  NZD: 'New Zealand Dollar',
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  LTC: 'Litecoin',
  XRP: 'Ripple',
  BCH: 'Bitcoin Cash',
  ADA: 'Cardano',
  DOT: 'Polkadot',
  LINK: 'Chainlink',
  UNI: 'Uniswap',
  AAVE: 'Aave',
  COMP: 'Compound',
  MKR: 'Maker',
  SNX: 'Synthetix',
  YFI: 'Yearn.finance',
  SUSHI: 'SushiSwap',
  CRV: 'Curve',
  BAL: 'Balancer',
  REN: 'Ren',
  KNC: 'Kyber Network',
  ZRX: '0x',
  BAT: 'Basic Attention Token',
  REP: 'Augur',
  GNO: 'Gnosis',
  OMG: 'OMG Network',
  MANA: 'Decentraland',
  SAND: 'The Sandbox',
  ENJ: 'Enjin Coin',
  CHZ: 'Chiliz',
  HOT: 'Holo',
  VET: 'VeChain',
  TRX: 'TRON',
  XLM: 'Stellar',
  XMR: 'Monero',
  DASH: 'Dash',
  ZEC: 'Zcash',
  XTZ: 'Tezos',
  ALGO: 'Algorand',
  ATOM: 'Cosmos',
  NEO: 'Neo',
  EOS: 'EOS',
  IOTA: 'IOTA',
  NANO: 'Nano',
  BNB: 'Binance Coin',
  CAKE: 'PancakeSwap',
  BUSD: 'Binance USD',
  USDT: 'Tether',
  USDC: 'USD Coin',
  DAI: 'Dai',
  TUSD: 'TrueUSD',
  PAX: 'Paxos Standard',
  GUSD: 'Gemini Dollar',
  HUSD: 'HUSD',
  FRAX: 'Frax',
  SUSD: 'sUSD',
  LUSD: 'Liquity USD',
  FEI: 'Fei Protocol',
  RAI: 'Rai Reflex Index',
  AMPL: 'Ampleforth',
  YAM: 'Yam Finance',
};

// Format large numbers with K, L, Cr suffixes (Indian numbering system)
export const formatCompactNumber = (num: number): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const absNum = Math.abs(num);
  
  if (absNum < 100) {
    return num.toString();
  }
  
  if (absNum < 1000) {
    return num.toFixed(1);
  }
  
  if (absNum < 100000) {
    // Thousands (K)
    return (num / 1000).toFixed(1) + 'K';
  }
  
  if (absNum < 10000000) {
    // Lakhs (L)
    return (num / 100000).toFixed(1) + 'L';
  }
  
  if (absNum < 1000000000) {
    // Crores (Cr)
    return (num / 10000000).toFixed(1) + 'Cr';
  }
  
  // For very large numbers, use Cr with more precision
  return (num / 10000000).toFixed(2) + 'Cr';
};

// Format currency with compact number formatting for large values
export const formatCompactCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  // Handle NaN, null, or undefined values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_SYMBOLS[currency] || currency}0.00`;
  }
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  // Special handling for cryptocurrencies and precious metals
  if (['BTC', 'ETH', 'LTC', 'XRP', 'BCH', 'ADA', 'DOT', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR', 'SNX', 'YFI', 'SUSHI', 'CRV', 'BAL', 'REN', 'KNC', 'ZRX', 'BAT', 'REP', 'GNO', 'OMG', 'MANA', 'SAND', 'ENJ', 'CHZ', 'HOT', 'VET', 'TRX', 'XLM', 'XMR', 'DASH', 'ZEC', 'XTZ', 'ALGO', 'ATOM', 'NEO', 'EOS', 'IOTA', 'NANO', 'BNB', 'CAKE', 'BUSD', 'USDT', 'USDC', 'DAI', 'TUSD', 'PAX', 'GUSD', 'HUSD', 'FRAX', 'SUSD', 'LUSD', 'FEI', 'RAI', 'AMPL', 'YAM', 'XAU', 'XAG', 'XPT', 'XPD'].includes(currency)) {
    return `${symbol}${amount.toFixed(8)}`;
  }
  
  // Use compact formatting for amounts >= 100
  if (Math.abs(amount) >= 100) {
    return `${symbol}${formatCompactNumber(amount)}`;
  }
  
  // For traditional currencies, use Intl.NumberFormat for smaller amounts
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${symbol}${amount.toFixed(2)}`;
  }
};

// Format currency based on user preferences
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  // Handle NaN, null, or undefined values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_SYMBOLS[currency] || currency}0.00`;
  }
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  // Special handling for cryptocurrencies and precious metals
  if (['BTC', 'ETH', 'LTC', 'XRP', 'BCH', 'ADA', 'DOT', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR', 'SNX', 'YFI', 'SUSHI', 'CRV', 'BAL', 'REN', 'KNC', 'ZRX', 'BAT', 'REP', 'GNO', 'OMG', 'MANA', 'SAND', 'ENJ', 'CHZ', 'HOT', 'VET', 'TRX', 'XLM', 'XMR', 'DASH', 'ZEC', 'XTZ', 'ALGO', 'ATOM', 'NEO', 'EOS', 'IOTA', 'NANO', 'BNB', 'CAKE', 'BUSD', 'USDT', 'USDC', 'DAI', 'TUSD', 'PAX', 'GUSD', 'HUSD', 'FRAX', 'SUSD', 'LUSD', 'FEI', 'RAI', 'AMPL', 'YAM', 'XAU', 'XAG', 'XPT', 'XPD'].includes(currency)) {
    return `${symbol}${amount.toFixed(8)}`;
  }
  
  // Use compact formatting for amounts >= 100
  if (Math.abs(amount) >= 100) {
    return `${symbol}${formatCompactNumber(amount)}`;
  }
  
  // For traditional currencies, use Intl.NumberFormat
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${symbol}${amount.toFixed(2)}`;
  }
};

// Format currency without symbol (just the number)
export const formatCurrencyAmount = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return amount.toFixed(2);
  }
};

// Get currency symbol
export const getCurrencySymbol = (currency: string = 'USD'): string => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

// Get currency name
export const getCurrencyName = (currency: string = 'USD'): string => {
  return CURRENCY_NAMES[currency] || currency;
};

// Parse currency string to number
export const parseCurrency = (value: string): number => {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Available currencies for selection
export const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'TND' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DZD' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'LYD' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'SDG' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'ETB' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'UGX' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MWK' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
  { code: 'NAM', name: 'Namibian Dollar', symbol: 'N$' },
  { code: 'SZL', name: 'Eswatini Lilangeni', symbol: 'E' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: 'Z$' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG' },
  { code: 'MRO', name: 'Mauritanian Ouguiya', symbol: 'UM' },
  { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM' },
  { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$' },
  { code: 'GWP', name: 'Guinea-Bissau Peso', symbol: 'CFA' },
  { code: 'GNS', name: 'Guinean Syli', symbol: 'FG' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
  { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
  { code: 'BAM', name: 'Bosnia and Herzegovina Convertible Mark', symbol: 'KM' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: '$' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: '$' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: '$' },
  { code: 'BZD', name: 'Belize Dollar', symbol: '$' },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
  { code: 'DOP', name: 'Dominican Peso', symbol: '$' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
  { code: 'SVC', name: 'Salvadoran Colón', symbol: '$' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$' },
  { code: 'VEF', name: 'Venezuelan Bolívar', symbol: 'Bs' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs' },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: '$' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: '$' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: '$' },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K' },
  { code: 'WST', name: 'Samoan Tālā', symbol: 'T' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: '$' },
  { code: 'KID', name: 'Kiribati Dollar', symbol: '$' },
  { code: 'TVD', name: 'Tuvaluan Dollar', symbol: '$' },
  { code: 'NCL', name: 'New Caledonian Franc', symbol: '₣' },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣' },
  { code: 'CFP', name: 'CFP Franc', symbol: '₣' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
]; 