// ============================================================================
// PortfolioMap — fintech modules mock data
// Frontend-only fixture set powering the operational side of the platform:
// retail banking (accounts, cards, transactions, transfers), markets &
// trading (watchlist, indices, news), crypto, lending, insurance and goals.
// ============================================================================

// ---------- Accounts (multi-account banking layer) ----------
export type AccountKind = 'current' | 'savings' | 'brokerage' | 'crypto' | 'pension';

export interface Account {
  id: string;
  kind: AccountKind;
  name: string;
  iban?: string;
  currency: 'EUR' | 'USD' | 'GBP' | 'CHF';
  balance: number;            // in the account currency
  balanceEUR: number;         // converted for aggregation
  available: number;          // available balance after holds
  pendingOut: number;
  monthlyChange: number;      // EUR delta vs last month
  rateOrYield?: number;       // % p.a. (savings APY, pension TWR, brokerage YTD)
  provider: string;
  lastFour?: string;
  primary?: boolean;
}

export const accounts: Account[] = [
  { id: 'acc-1', kind: 'current',   name: 'PortfolioMap Current EUR',  iban: 'ES91 2100 0418 4502 0005 1332', currency: 'EUR', balance: 28_450.12,  balanceEUR: 28_450.12,  available: 28_120.00, pendingOut: 330.12, monthlyChange:  +1_240.50, provider: 'PortfolioMap Bank', lastFour: '4521', primary: true,  rateOrYield: 0.10 },
  { id: 'acc-2', kind: 'current',   name: 'Travel multi-currency USD',  iban: 'GB29 NWBK 6016 1331 9268 19',   currency: 'USD', balance:  6_120.00,  balanceEUR:  5_640.00,  available:  6_120.00, pendingOut:    0.00, monthlyChange:    -180.00, provider: 'Wise',                lastFour: '8830',                rateOrYield: 0.00 },
  { id: 'acc-3', kind: 'savings',   name: 'High-yield Savings',         iban: 'DE89 3704 0044 0532 0130 00',   currency: 'EUR', balance: 75_000.00,  balanceEUR: 75_000.00,  available: 75_000.00, pendingOut:    0.00, monthlyChange:  +3_125.00, provider: 'PortfolioMap Bank', lastFour: '0021',                rateOrYield: 4.20 },
  { id: 'acc-4', kind: 'brokerage', name: 'Master Multi-Asset Fund',    iban: undefined,                       currency: 'EUR', balance:1_200_000_000,balanceEUR:1_200_000_000,available:78_000_000,pendingOut:    0.00,monthlyChange:+18_400_000,provider: 'PortfolioMap Capital',                                  rateOrYield: 8.40 },
  { id: 'acc-5', kind: 'crypto',    name: 'Crypto Wallet',              iban: undefined,                       currency: 'EUR', balance: 42_180.55,  balanceEUR: 42_180.55,  available: 42_180.55, pendingOut:    0.00, monthlyChange:  +6_240.10, provider: 'PortfolioMap Crypto',                                  rateOrYield: 14.80 },
  { id: 'acc-6', kind: 'pension',   name: 'Personal Pension Plan 60/40', iban: undefined,                       currency: 'EUR', balance:184_750.00,  balanceEUR:184_750.00,  available:      0.00, pendingOut:    0.00, monthlyChange:  +2_810.00, provider: 'BlackRock LifePath',                                   rateOrYield: 6.10 },
];

export const accountKindLabels: Record<AccountKind, string> = {
  current:   'Current',
  savings:   'Savings',
  brokerage: 'Brokerage',
  crypto:    'Crypto',
  pension:   'Pension',
};

// ---------- Cards ----------
export type CardKind = 'debit' | 'credit' | 'virtual';
export type CardNetwork = 'Visa' | 'Mastercard' | 'Amex';

export interface PaymentCard {
  id: string;
  kind: CardKind;
  network: CardNetwork;
  label: string;            // shown on the card face ("Travel", "Daily", "Subscriptions")
  holder: string;
  lastFour: string;
  expiry: string;           // MM/YY
  linkedAccountId: string;
  monthlyLimit: number;     // EUR
  spentThisMonth: number;   // EUR
  status: 'active' | 'frozen' | 'pending';
  contactless: boolean;
  online: boolean;
  withdraw: boolean;
  appleGooglePay: boolean;
  rewardsRatePct?: number;  // e.g. 1.0% cashback
  color: 'graphite' | 'platinum' | 'titanium' | 'neon';
}

export const cards: PaymentCard[] = [
  { id: 'card-1', kind: 'debit',   network: 'Visa',       label: 'Daily',         holder: 'Maria Garcia', lastFour: '4521', expiry: '08/29', linkedAccountId: 'acc-1', monthlyLimit:  5_000, spentThisMonth: 1_842.30, status: 'active', contactless: true,  online: true,  withdraw: true,  appleGooglePay: true,  color: 'graphite' },
  { id: 'card-2', kind: 'debit',   network: 'Mastercard', label: 'Travel USD',    holder: 'Maria Garcia', lastFour: '8830', expiry: '11/27', linkedAccountId: 'acc-2', monthlyLimit:  3_000, spentThisMonth:   612.40, status: 'active', contactless: true,  online: true,  withdraw: true,  appleGooglePay: true,  color: 'platinum' },
  { id: 'card-3', kind: 'credit',  network: 'Visa',       label: 'Rewards',       holder: 'Maria Garcia', lastFour: '7745', expiry: '03/30', linkedAccountId: 'acc-1', monthlyLimit: 12_000, spentThisMonth: 3_410.00, status: 'active', contactless: true,  online: true,  withdraw: false, appleGooglePay: true,  rewardsRatePct: 1.5, color: 'titanium' },
  { id: 'card-4', kind: 'virtual', network: 'Mastercard', label: 'Subscriptions', holder: 'Maria Garcia', lastFour: '2299', expiry: '12/26', linkedAccountId: 'acc-1', monthlyLimit:  1_000, spentThisMonth:   148.91, status: 'active', contactless: false, online: true,  withdraw: false, appleGooglePay: false,                          color: 'neon'     },
  { id: 'card-5', kind: 'virtual', network: 'Visa',       label: 'Online ads',    holder: 'Maria Garcia', lastFour: '0033', expiry: '06/27', linkedAccountId: 'acc-1', monthlyLimit:  2_500, spentThisMonth:   980.00, status: 'frozen', contactless: false, online: true,  withdraw: false, appleGooglePay: false,                          color: 'graphite' },
  { id: 'card-6', kind: 'credit',  network: 'Amex',       label: 'Business Plat.',holder: 'Maria Garcia', lastFour: '5142', expiry: '04/28', linkedAccountId: 'acc-1', monthlyLimit: 25_000, spentThisMonth: 6_240.50, status: 'active', contactless: true,  online: true,  withdraw: false, appleGooglePay: true,  rewardsRatePct: 2.0, color: 'platinum' },
];

// ---------- Transactions ----------
export type TxnCategory =
  | 'Groceries' | 'Restaurants' | 'Transport' | 'Travel' | 'Subscriptions'
  | 'Salary' | 'Investments' | 'Transfer' | 'Housing' | 'Health' | 'Shopping'
  | 'Utilities' | 'Income' | 'Fees' | 'Other';

export type TxnDirection = 'in' | 'out';

export interface Transaction {
  id: string;
  accountId: string;
  cardId?: string;
  date: string;            // ISO
  merchant: string;
  category: TxnCategory;
  amount: number;          // signed in EUR (negative = outflow)
  currency: string;
  status: 'posted' | 'pending' | 'declined';
  direction: TxnDirection;
  notes?: string;
  countryCode?: string;
}

export const transactions: Transaction[] = [
  { id: 't-001', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-30T19:45:00', merchant: 'Mercadona',                  category: 'Groceries',     amount:  -68.42,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-002', accountId: 'acc-1', cardId: 'card-3', date: '2026-04-30T13:12:00', merchant: 'Iberia',                     category: 'Travel',        amount: -425.10,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES', notes: 'MAD-LHR return' },
  { id: 't-003', accountId: 'acc-1',                   date: '2026-04-30T09:00:00', merchant: 'PortfolioMap Capital · Salary', category: 'Salary',     amount:+5_400.00,    currency: 'EUR', status: 'posted',  direction: 'in',  countryCode: 'ES' },
  { id: 't-004', accountId: 'acc-1', cardId: 'card-4', date: '2026-04-29T22:01:00', merchant: 'Netflix',                    category: 'Subscriptions', amount:  -15.99,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'NL' },
  { id: 't-005', accountId: 'acc-1', cardId: 'card-4', date: '2026-04-29T22:00:00', merchant: 'Spotify Premium',            category: 'Subscriptions', amount:  -10.99,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'SE' },
  { id: 't-006', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-29T14:30:00', merchant: 'Glovo',                      category: 'Restaurants',   amount:  -22.40,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-007', accountId: 'acc-2', cardId: 'card-2', date: '2026-04-28T18:22:00', merchant: 'Apple Store NYC',            category: 'Shopping',      amount: -812.00,    currency: 'USD', status: 'posted',  direction: 'out', countryCode: 'US' },
  { id: 't-008', accountId: 'acc-1',                   date: '2026-04-28T11:00:00', merchant: 'Endesa Energía',             category: 'Utilities',     amount: -114.20,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-009', accountId: 'acc-1',                   date: '2026-04-27T20:14:00', merchant: 'Transfer to Savings',        category: 'Transfer',      amount:-2_000.00,    currency: 'EUR', status: 'posted',  direction: 'out' },
  { id: 't-010', accountId: 'acc-3',                   date: '2026-04-27T20:14:00', merchant: 'Transfer from Current',      category: 'Transfer',      amount:+2_000.00,    currency: 'EUR', status: 'posted',  direction: 'in'  },
  { id: 't-011', accountId: 'acc-1', cardId: 'card-3', date: '2026-04-27T12:08:00', merchant: 'Renfe AVE',                  category: 'Transport',     amount: -129.30,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-012', accountId: 'acc-4',                   date: '2026-04-26T16:40:00', merchant: 'JPM dividend',               category: 'Investments',   amount:+12_640.00,   currency: 'EUR', status: 'posted',  direction: 'in' },
  { id: 't-013', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-26T13:50:00', merchant: 'Carrefour',                  category: 'Groceries',     amount:  -54.30,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-014', accountId: 'acc-5',                   date: '2026-04-25T09:00:00', merchant: 'BTC stake reward',           category: 'Investments',   amount:   +84.21,    currency: 'EUR', status: 'posted',  direction: 'in'  },
  { id: 't-015', accountId: 'acc-1', cardId: 'card-6', date: '2026-04-25T15:21:00', merchant: 'Linear (Annual)',            category: 'Subscriptions', amount: -240.00,    currency: 'EUR', status: 'pending', direction: 'out', countryCode: 'US' },
  { id: 't-016', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-24T22:50:00', merchant: 'Casa Manolo',                category: 'Restaurants',   amount:  -84.10,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-017', accountId: 'acc-1', cardId: 'card-3', date: '2026-04-24T11:30:00', merchant: 'Booking.com — Hotel Plaza',  category: 'Travel',        amount: -812.00,    currency: 'EUR', status: 'posted',  direction: 'out' },
  { id: 't-018', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-23T08:05:00', merchant: 'Cabify',                     category: 'Transport',     amount:  -18.40,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-019', accountId: 'acc-1', cardId: 'card-4', date: '2026-04-22T22:00:00', merchant: 'iCloud+ 2TB',                category: 'Subscriptions', amount:   -9.99,    currency: 'EUR', status: 'posted',  direction: 'out' },
  { id: 't-020', accountId: 'acc-1', cardId: 'card-3', date: '2026-04-22T19:15:00', merchant: 'Decathlon',                  category: 'Shopping',      amount: -149.90,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-021', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-21T20:40:00', merchant: 'La Casa de la Mar',          category: 'Restaurants',   amount: -126.50,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-022', accountId: 'acc-1',                   date: '2026-04-21T09:00:00', merchant: 'Mortgage payment — Caixa',   category: 'Housing',       amount:-1_240.00,    currency: 'EUR', status: 'posted',  direction: 'out' },
  { id: 't-023', accountId: 'acc-1', cardId: 'card-6', date: '2026-04-20T17:45:00', merchant: 'Google Ads',                 category: 'Subscriptions', amount: -480.00,    currency: 'EUR', status: 'posted',  direction: 'out' },
  { id: 't-024', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-20T13:00:00', merchant: 'Pharmacy 24h',               category: 'Health',        amount:  -32.40,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-025', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-19T19:21:00', merchant: 'AliExpress',                 category: 'Shopping',      amount:  -67.80,    currency: 'EUR', status: 'declined', direction: 'out', countryCode: 'CN' },
  { id: 't-026', accountId: 'acc-1',                   date: '2026-04-18T14:00:00', merchant: 'Freelance invoice #2026-04', category: 'Income',        amount: +3_400.00,   currency: 'EUR', status: 'posted',  direction: 'in'  },
  { id: 't-027', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-17T20:11:00', merchant: 'Lidl',                       category: 'Groceries',     amount:  -42.10,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-028', accountId: 'acc-1', cardId: 'card-3', date: '2026-04-16T16:50:00', merchant: 'Vueling',                    category: 'Travel',        amount: -210.00,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-029', accountId: 'acc-1', cardId: 'card-1', date: '2026-04-15T09:45:00', merchant: 'Starbucks',                  category: 'Restaurants',   amount:   -4.80,    currency: 'EUR', status: 'posted',  direction: 'out', countryCode: 'ES' },
  { id: 't-030', accountId: 'acc-1',                   date: '2026-04-15T09:00:00', merchant: 'Tax refund AEAT',            category: 'Income',        amount:   +812.00,   currency: 'EUR', status: 'posted',  direction: 'in'  },
];

// ---------- Beneficiaries / payees for Transfers ----------
export interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bic?: string;
  bank: string;
  type: 'personal' | 'business' | 'tax-authority' | 'utility';
  lastUsed?: string;
  recurring?: boolean;
}

export const beneficiaries: Beneficiary[] = [
  { id: 'b-1', name: 'Carlos Ruiz',           iban: 'ES79 0049 0500 1029 9999 0011', bic: 'BSCHESMM', bank: 'Banco Santander',      type: 'personal',     lastUsed: '2026-04-20', recurring: false },
  { id: 'b-2', name: 'Comunidad de vecinos',  iban: 'ES89 2100 0418 4502 0001 2200', bic: 'CAIXESBB', bank: 'CaixaBank',            type: 'utility',      lastUsed: '2026-04-01', recurring: true  },
  { id: 'b-3', name: 'AEAT — Tax filing',     iban: 'ES88 9000 0001 2000 0123 4567', bic: undefined,  bank: 'Banco de España',      type: 'tax-authority',lastUsed: '2026-04-15', recurring: false },
  { id: 'b-4', name: 'TechFlow Labs SL',      iban: 'ES29 0182 5566 9001 1234 5678', bic: 'BBVAESMM', bank: 'BBVA',                 type: 'business',     lastUsed: '2026-04-10', recurring: false },
  { id: 'b-5', name: 'Endesa Energía',        iban: 'ES61 0019 1234 5678 9012 3456', bic: 'DEUTESBB', bank: 'Deutsche Bank',        type: 'utility',      lastUsed: '2026-04-28', recurring: true  },
  { id: 'b-6', name: 'Caixa Mortgage',        iban: 'ES60 2100 1111 2222 3333 4444', bic: 'CAIXESBB', bank: 'CaixaBank',            type: 'utility',      lastUsed: '2026-04-21', recurring: true  },
];

// ---------- Recurring payments / standing orders ----------
export interface RecurringPayment {
  id: string;
  beneficiaryId: string;
  amount: number;
  currency: 'EUR';
  cadence: 'monthly' | 'quarterly' | 'yearly';
  nextRunDate: string;
  reference: string;
  fromAccountId: string;
}

export const recurringPayments: RecurringPayment[] = [
  { id: 'rec-1', beneficiaryId: 'b-2', amount:    180.00, currency: 'EUR', cadence: 'monthly',   nextRunDate: '2026-05-01', reference: 'HOA April',         fromAccountId: 'acc-1' },
  { id: 'rec-2', beneficiaryId: 'b-5', amount:    114.20, currency: 'EUR', cadence: 'monthly',   nextRunDate: '2026-05-28', reference: 'Electricity',       fromAccountId: 'acc-1' },
  { id: 'rec-3', beneficiaryId: 'b-6', amount:  1_240.00, currency: 'EUR', cadence: 'monthly',   nextRunDate: '2026-05-21', reference: 'Mortgage',          fromAccountId: 'acc-1' },
  { id: 'rec-4', beneficiaryId: 'b-3', amount:  4_120.00, currency: 'EUR', cadence: 'quarterly', nextRunDate: '2026-07-20', reference: 'IRPF Q2',           fromAccountId: 'acc-1' },
];

// ---------- Markets: indices, watchlist, news ----------
export interface MarketIndex {
  id: string;
  name: string;
  level: number;
  changePct: number;       // intraday %
  changeAbs: number;
  currency: string;
  region: 'Europe' | 'North America' | 'APAC' | 'Emerging' | 'Global';
}

export const marketIndices: MarketIndex[] = [
  { id: 'idx-spx',  name: 'S&P 500',          level: 5_482.10, changePct: +0.42, changeAbs:  +22.91, currency: 'USD', region: 'North America' },
  { id: 'idx-ndx',  name: 'Nasdaq 100',       level:19_245.30, changePct: +0.71, changeAbs: +135.80, currency: 'USD', region: 'North America' },
  { id: 'idx-stox', name: 'EuroSTOXX 50',     level: 5_064.20, changePct: -0.18, changeAbs:   -9.10, currency: 'EUR', region: 'Europe'        },
  { id: 'idx-ibex', name: 'IBEX 35',          level:11_240.50, changePct: +0.32, changeAbs:  +35.40, currency: 'EUR', region: 'Europe'        },
  { id: 'idx-dax',  name: 'DAX 40',           level:18_412.00, changePct: -0.05, changeAbs:   -8.95, currency: 'EUR', region: 'Europe'        },
  { id: 'idx-ftse', name: 'FTSE 100',         level: 8_140.20, changePct: +0.22, changeAbs:  +17.80, currency: 'GBP', region: 'Europe'        },
  { id: 'idx-n225', name: 'Nikkei 225',       level:39_820.50, changePct: +1.02, changeAbs: +401.20, currency: 'JPY', region: 'APAC'          },
  { id: 'idx-hsi',  name: 'Hang Seng',        level:18_120.40, changePct: -0.44, changeAbs:  -80.20, currency: 'HKD', region: 'APAC'          },
  { id: 'idx-vix',  name: 'VIX',              level:    14.20, changePct: -3.10, changeAbs:   -0.45, currency: 'USD', region: 'Global'        },
  { id: 'idx-dxy',  name: 'US Dollar Index',  level:   104.55, changePct: -0.10, changeAbs:   -0.10, currency: 'USD', region: 'Global'        },
];

export interface WatchlistItem {
  ticker: string;
  name: string;
  assetClass: 'Equity' | 'ETF' | 'Crypto' | 'FX' | 'Commodity';
  lastPrice: number;
  currency: string;
  changePct: number;
  marketCap?: number;        // in EUR billions
  pe?: number;
  inPortfolio: boolean;
}

export const watchlist: WatchlistItem[] = [
  { ticker: 'AAPL',  name: 'Apple Inc',                 assetClass: 'Equity',    lastPrice:  214.50, currency: 'USD', changePct:  +0.84, marketCap: 3_280, pe: 32.1, inPortfolio: true  },
  { ticker: 'MSFT',  name: 'Microsoft Corp',            assetClass: 'Equity',    lastPrice:  378.20, currency: 'USD', changePct:  +1.12, marketCap: 2_810, pe: 35.4, inPortfolio: true  },
  { ticker: 'NVDA',  name: 'Nvidia Corp',               assetClass: 'Equity',    lastPrice:  870.40, currency: 'USD', changePct:  +2.40, marketCap: 2_140, pe: 68.2, inPortfolio: true  },
  { ticker: 'ASML',  name: 'ASML Holding NV',           assetClass: 'Equity',    lastPrice:  692.30, currency: 'EUR', changePct:  -0.32, marketCap:   270, pe: 38.6, inPortfolio: true  },
  { ticker: 'LVMH',  name: 'LVMH Moet Hennessy',        assetClass: 'Equity',    lastPrice:  685.40, currency: 'EUR', changePct:  +0.40, marketCap:   340, pe: 22.1, inPortfolio: true  },
  { ticker: 'TSLA',  name: 'Tesla Inc',                 assetClass: 'Equity',    lastPrice:  175.30, currency: 'USD', changePct:  -1.20, marketCap:   560, pe: 42.0, inPortfolio: false },
  { ticker: 'GOOGL', name: 'Alphabet Inc',              assetClass: 'Equity',    lastPrice:  155.80, currency: 'USD', changePct:  +0.62, marketCap: 1_910, pe: 25.7, inPortfolio: false },
  { ticker: 'META',  name: 'Meta Platforms',            assetClass: 'Equity',    lastPrice:  482.90, currency: 'USD', changePct:  +0.18, marketCap: 1_220, pe: 28.4, inPortfolio: false },
  { ticker: 'VTI',   name: 'Vanguard Total US Mkt ETF', assetClass: 'ETF',       lastPrice:  240.10, currency: 'USD', changePct:  +0.45, inPortfolio: true  },
  { ticker: 'BTC',   name: 'Bitcoin',                   assetClass: 'Crypto',    lastPrice:62_840.00, currency: 'EUR', changePct:  +1.42, marketCap: 1_240, inPortfolio: true  },
  { ticker: 'ETH',   name: 'Ethereum',                  assetClass: 'Crypto',    lastPrice: 3_120.00, currency: 'EUR', changePct:  -0.35, marketCap:   380, inPortfolio: true  },
  { ticker: 'EURUSD',name: 'EUR / USD',                 assetClass: 'FX',        lastPrice:    1.085, currency: '',    changePct:  +0.10, inPortfolio: false },
  { ticker: 'GLD',   name: 'Gold (spot)',               assetClass: 'Commodity', lastPrice: 2_348.00, currency: 'USD', changePct:  +0.62, inPortfolio: false },
  { ticker: 'BRENT', name: 'Brent Crude',               assetClass: 'Commodity', lastPrice:    82.40, currency: 'USD', changePct:  -1.18, inPortfolio: false },
];

export interface MarketNewsItem {
  id: string;
  source: string;
  headline: string;
  publishedAt: string;
  category: 'macro' | 'earnings' | 'commodities' | 'fx' | 'crypto' | 'rates';
  impact: 'low' | 'medium' | 'high';
  tickers?: string[];
}

export const marketNews: MarketNewsItem[] = [
  { id: 'n-01', source: 'Bloomberg',  headline: 'ECB holds rates steady, signals first cut in June',                   publishedAt: '2026-04-30T09:30:00', category: 'rates',       impact: 'high',   tickers: ['EURUSD','idx-stox'] },
  { id: 'n-02', source: 'Reuters',    headline: 'Nvidia tops Q1 estimates as AI capex remains buoyant',               publishedAt: '2026-04-30T07:15:00', category: 'earnings',    impact: 'high',   tickers: ['NVDA'] },
  { id: 'n-03', source: 'FT',         headline: 'Brent crude slides 1.2% on rising US inventory data',                publishedAt: '2026-04-30T06:00:00', category: 'commodities', impact: 'medium', tickers: ['BRENT'] },
  { id: 'n-04', source: 'WSJ',        headline: 'Bitcoin breaks 60K resistance amid post-halving accumulation',       publishedAt: '2026-04-29T18:45:00', category: 'crypto',      impact: 'medium', tickers: ['BTC'] },
  { id: 'n-05', source: 'Reuters',    headline: 'IBEX 35 closes flat as banks weigh on Spanish equities',             publishedAt: '2026-04-29T17:30:00', category: 'macro',       impact: 'low',    tickers: ['idx-ibex'] },
  { id: 'n-06', source: 'Bloomberg',  headline: 'Apple buyback expanded by $110B; iPhone 17 cycle commentary',        publishedAt: '2026-04-29T13:00:00', category: 'earnings',    impact: 'high',   tickers: ['AAPL'] },
  { id: 'n-07', source: 'CoinDesk',   headline: 'Ether spot ETF approval probability climbs to 75% (Polymarket)',     publishedAt: '2026-04-29T11:20:00', category: 'crypto',      impact: 'medium', tickers: ['ETH'] },
];

// ---------- Crypto holdings ----------
export interface CryptoHolding {
  ticker: string;
  name: string;
  amount: number;            // crypto units
  lastPriceEUR: number;
  exposureEUR: number;
  pnlPct: number;
  riskScore: 'low' | 'medium' | 'high';
  staked: boolean;
  apy?: number;
}

export const cryptoHoldings: CryptoHolding[] = [
  { ticker: 'BTC',   name: 'Bitcoin',            amount: 0.4521,  lastPriceEUR:62_840.00, exposureEUR:28_405.96, pnlPct: +18.40, riskScore: 'medium', staked: false                },
  { ticker: 'ETH',   name: 'Ethereum',           amount: 3.1200,  lastPriceEUR: 3_120.00, exposureEUR: 9_734.40, pnlPct:  +6.10, riskScore: 'medium', staked: true,  apy:  4.20 },
  { ticker: 'SOL',   name: 'Solana',             amount:18.4500,  lastPriceEUR:   158.20, exposureEUR: 2_918.79, pnlPct: +24.30, riskScore: 'high',   staked: true,  apy:  6.80 },
  { ticker: 'USDC',  name: 'USD Coin',           amount:920.0000, lastPriceEUR:     0.92, exposureEUR:   846.40, pnlPct:  +0.00, riskScore: 'low',    staked: true,  apy:  5.10 },
  { ticker: 'AVAX',  name: 'Avalanche',          amount:12.8000,  lastPriceEUR:    21.50, exposureEUR:   275.20, pnlPct: -10.20, riskScore: 'high',   staked: false                },
];

// ---------- Lending: loans, credit score, BNPL ----------
export interface Loan {
  id: string;
  kind: 'mortgage' | 'auto' | 'personal' | 'bnpl' | 'credit-line';
  label: string;
  principal: number;
  outstanding: number;
  currency: 'EUR';
  ratePct: number;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  status: 'active' | 'paid' | 'overdue';
}

export const loans: Loan[] = [
  { id: 'l-1', kind: 'mortgage',    label: 'Primary residence — Madrid', principal: 320_000, outstanding: 264_500, currency: 'EUR', ratePct: 2.85, startDate: '2021-06-15', endDate: '2046-06-15', monthlyPayment: 1_240.00, status: 'active' },
  { id: 'l-2', kind: 'auto',        label: 'Auto loan — EV',             principal:  42_000, outstanding:  18_400, currency: 'EUR', ratePct: 5.20, startDate: '2023-09-01', endDate: '2028-09-01', monthlyPayment:   620.00, status: 'active' },
  { id: 'l-3', kind: 'personal',    label: 'Home renovation',            principal:  18_000, outstanding:  11_200, currency: 'EUR', ratePct: 6.90, startDate: '2024-01-10', endDate: '2029-01-10', monthlyPayment:   355.00, status: 'active' },
  { id: 'l-4', kind: 'bnpl',        label: 'BNPL · Apple Vision Pro',    principal:   3_499, outstanding:   1_166, currency: 'EUR', ratePct: 0.00, startDate: '2026-02-15', endDate: '2026-08-15', monthlyPayment:   583.00, status: 'active' },
  { id: 'l-5', kind: 'credit-line', label: 'Revolving credit line',      principal:  20_000, outstanding:   4_200, currency: 'EUR', ratePct: 8.40, startDate: '2025-01-01', endDate: '2030-01-01', monthlyPayment:    95.00, status: 'active' },
];

export interface CreditScore {
  score: number;          // 300–850
  band: 'poor' | 'fair' | 'good' | 'very-good' | 'excellent';
  utilisationPct: number;
  onTimePct: number;
  ageMonths: number;
  hardEnquiries12M: number;
  delta30d: number;
}

export const creditScore: CreditScore = {
  score: 782,
  band: 'very-good',
  utilisationPct: 18,
  onTimePct: 99.2,
  ageMonths: 142,
  hardEnquiries12M: 1,
  delta30d: +6,
};

// ---------- Insurance ----------
export interface InsurancePolicy {
  id: string;
  kind: 'health' | 'life' | 'home' | 'auto' | 'travel' | 'liability';
  provider: string;
  policyNumber: string;
  coverageEUR: number;
  premiumMonthly: number;
  startDate: string;
  renewalDate: string;
  status: 'active' | 'pending-renewal' | 'lapsed';
  beneficiaries?: string[];
}

export const insurancePolicies: InsurancePolicy[] = [
  { id: 'p-1', kind: 'health',    provider: 'Sanitas',      policyNumber: 'SAN-2024-008321', coverageEUR:       250_000, premiumMonthly:  84.00, startDate: '2024-01-01', renewalDate: '2027-01-01', status: 'active'           },
  { id: 'p-2', kind: 'life',      provider: 'AXA',          policyNumber: 'AXA-LIFE-99214',  coverageEUR:       500_000, premiumMonthly:  62.00, startDate: '2022-03-15', renewalDate: '2027-03-15', status: 'active', beneficiaries: ['Carlos Ruiz', 'Laura Sanchez'] },
  { id: 'p-3', kind: 'home',      provider: 'Mapfre',       policyNumber: 'MAP-HOG-441290',  coverageEUR:       320_000, premiumMonthly:  38.00, startDate: '2021-06-15', renewalDate: '2026-06-15', status: 'pending-renewal' },
  { id: 'p-4', kind: 'auto',      provider: 'Línea Directa',policyNumber: 'LDA-AUTO-71290',  coverageEUR:        50_000, premiumMonthly:  47.00, startDate: '2023-09-01', renewalDate: '2026-09-01', status: 'active'           },
  { id: 'p-5', kind: 'travel',    provider: 'Allianz',      policyNumber: 'ALLZ-TRV-22119',  coverageEUR:       150_000, premiumMonthly:  18.00, startDate: '2026-01-01', renewalDate: '2026-12-31', status: 'active'           },
  { id: 'p-6', kind: 'liability', provider: 'Hiscox',       policyNumber: 'HIS-LIAB-01194',  coverageEUR:     1_000_000, premiumMonthly: 105.00, startDate: '2025-04-01', renewalDate: '2026-04-01', status: 'pending-renewal' },
];

export interface InsuranceClaim {
  id: string;
  policyId: string;
  filedAt: string;
  description: string;
  amountEUR: number;
  status: 'open' | 'paid' | 'rejected';
}

export const insuranceClaims: InsuranceClaim[] = [
  { id: 'cl-1', policyId: 'p-1', filedAt: '2026-03-12', description: 'Hospital admission — appendicitis', amountEUR: 4_120, status: 'paid'    },
  { id: 'cl-2', policyId: 'p-3', filedAt: '2026-04-02', description: 'Burst pipe — kitchen damage',        amountEUR: 1_840, status: 'open'    },
  { id: 'cl-3', policyId: 'p-4', filedAt: '2026-02-22', description: 'Parking incident — bumper repair',  amountEUR:   620, status: 'paid'    },
  { id: 'cl-4', policyId: 'p-5', filedAt: '2025-12-18', description: 'Flight cancellation — KLM',          amountEUR:   480, status: 'rejected'},
];

// ---------- Goals & wealth planning ----------
export interface Goal {
  id: string;
  label: string;
  target: number;
  current: number;
  monthlyContribution: number;
  targetDate: string;
  category: 'home' | 'retirement' | 'travel' | 'emergency' | 'education' | 'wealth';
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  linkedAccountId?: string;
}

export const goals: Goal[] = [
  { id: 'g-1', label: 'Mortgage early repayment',     target: 60_000,  current: 18_400,   monthlyContribution: 1_200, targetDate: '2030-12-31', category: 'home',       riskProfile: 'conservative', linkedAccountId: 'acc-3' },
  { id: 'g-2', label: 'Retirement at 60',             target:1_500_000,current:184_750,   monthlyContribution: 2_500, targetDate: '2046-01-01', category: 'retirement', riskProfile: 'balanced',     linkedAccountId: 'acc-6' },
  { id: 'g-3', label: 'Japan trip — sabbatical',      target: 18_000,  current: 11_200,   monthlyContribution:   600, targetDate: '2027-04-01', category: 'travel',     riskProfile: 'conservative', linkedAccountId: 'acc-3' },
  { id: 'g-4', label: 'Emergency fund · 6 months',    target: 36_000,  current: 36_000,   monthlyContribution:     0, targetDate: '2025-12-31', category: 'emergency',  riskProfile: 'conservative', linkedAccountId: 'acc-3' },
  { id: 'g-5', label: 'Kid education fund',           target:120_000,  current: 24_500,   monthlyContribution:   480, targetDate: '2038-09-01', category: 'education',  riskProfile: 'balanced',     linkedAccountId: 'acc-3' },
  { id: 'g-6', label: 'Build 1 M€ liquid net worth',  target:1_000_000,current:780_400,   monthlyContribution: 5_000, targetDate: '2030-01-01', category: 'wealth',     riskProfile: 'aggressive',   linkedAccountId: 'acc-4' },
];

// ---------- Aggregation helpers ----------
export const firmAumEUR = accounts
  .filter((a) => a.kind === 'brokerage')
  .reduce((sum, a) => sum + a.balanceEUR, 0);

export const personalNetWorthEUR = accounts
  .filter((a) => a.kind !== 'brokerage')
  .reduce((sum, a) => sum + a.balanceEUR, 0)
  - loans.reduce((sum, l) => sum + l.outstanding, 0);

export const totalLiabilitiesEUR = loans.reduce((sum, l) => sum + l.outstanding, 0);

export const totalCryptoEUR = cryptoHoldings.reduce((sum, h) => sum + h.exposureEUR, 0);

export const monthlyCashflowEUR = transactions
  .filter((t) => new Date(t.date) >= new Date('2026-04-01'))
  .reduce((acc, t) => acc + t.amount, 0);
