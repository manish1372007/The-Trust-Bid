export function formatUsdAsInr(usd: number, rate: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(usd * rate);
}

export function convertUsdTextToInr(text: string, rate: number | null): string {
  return text.replace(/\$\s?([\d,]+(?:\.\d+)?)/g, (match, amount: string) => {
    if (rate == null) return 'INR conversion unavailable';
    const usd = Number(amount.replace(/,/g, ''));
    return Number.isFinite(usd) ? formatUsdAsInr(usd, rate) : match;
  });
}
