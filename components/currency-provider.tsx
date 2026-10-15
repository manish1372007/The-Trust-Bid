'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { formatUsdAsInr } from '@/lib/currency';

type ExchangeRate = {
  base: 'USD';
  quote: 'INR';
  rate: number;
  updatedAt: string;
  nextUpdateAt: string | null;
  source: string;
};

type CurrencyContextValue = {
  exchange: ExchangeRate | null;
  error: string;
  formatUsd: (usd: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const REFRESH_INTERVAL = 15 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [exchange, setExchange] = useState<ExchangeRate | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/exchange-rate', { cache: 'no-store' });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = isRecord(result) && typeof result.error === 'string'
          ? result.error
          : `Exchange-rate request failed (HTTP ${response.status})`;
        throw new Error(message);
      }
      if (
        !isRecord(result) ||
        result.base !== 'USD' ||
        result.quote !== 'INR' ||
        typeof result.rate !== 'number' ||
        !Number.isFinite(result.rate) ||
        result.rate <= 0 ||
        typeof result.updatedAt !== 'string' ||
        typeof result.source !== 'string'
      ) {
        throw new Error('Exchange-rate endpoint returned invalid data');
      }
      setExchange({
        base: 'USD',
        quote: 'INR',
        rate: result.rate,
        updatedAt: result.updatedAt,
        nextUpdateAt: typeof result.nextUpdateAt === 'string' ? result.nextUpdateAt : null,
        source: result.source,
      });
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), REFRESH_INTERVAL);
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [refresh]);

  const formatUsd = useCallback(
    (usd: number) => exchange ? formatUsdAsInr(usd, exchange.rate) : error ? 'INR rate unavailable' : 'Loading INR rate…',
    [exchange, error]
  );

  return (
    <CurrencyContext.Provider value={{ exchange, error, formatUsd }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 rounded-full border border-[#E8C5A8]/30 bg-[#2B101E]/95 px-3 py-1.5 text-[10px] font-medium text-[#FFF5F2] shadow-lg backdrop-blur"
        title={exchange
          ? `${exchange.source}; updated ${exchange.updatedAt} (latest published rate, not a tick-by-tick market feed)${error ? `; refresh failed: ${error}` : ''}`
          : error || 'Loading the latest published USD/INR rate'}
        aria-live="polite"
      >
        {exchange
          ? `FX${error ? ' stale' : ''} · 1 USD = ₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(exchange.rate)} · updated ${new Date(exchange.updatedAt).toLocaleDateString('en-IN')}`
          : error
            ? 'FX rate unavailable'
            : 'Loading USD → INR rate…'}
      </div>
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error('useCurrency must be used within CurrencyProvider');
  return value;
}

export function CurrencyAmount({ usd, className }: { usd: number; className?: string }) {
  const { formatUsd } = useCurrency();
  return <span className={className}>{formatUsd(usd)}</span>;
}
