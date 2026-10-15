import type { Quote } from '../types';

const columns = [
  'Rank',
  'Provider',
  'Outcome',
  'Total price',
  'Base price',
  'Line items',
  'Binding',
  'Negotiated',
  'Price before',
  'Price after',
  'Red flag',
  'Red flag reason',
  'Itemization mismatch',
];

function csvCell(value: string | number | boolean | null): string {
  const text = value == null ? '' : String(value);
  const safe = /^[\t\r\n=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function quotesToCsv(quotes: Quote[], usdToInrRate: number): string {
  if (!Number.isFinite(usdToInrRate) || usdToInrRate <= 0) {
    throw new Error('A valid USD/INR exchange rate is required to export quote amounts.');
  }
  const toInr = (amount: number | null) =>
    amount == null ? null : Math.round(amount * usdToInrRate);

  const rows = quotes.map((quote, index) => [
    index + 1,
    quote.providerName,
    quote.callOutcome,
    quote.callOutcome === 'quoted' ? toInr(quote.totalPrice) : null,
    quote.callOutcome === 'quoted' ? toInr(quote.basePrice) : null,
    quote.lineItems
      .map((item) => `${item.label}: ${item.amount == null ? 'undisclosed' : toInr(item.amount)}`)
      .join('; '),
    quote.binding ? 'Yes' : 'No',
    quote.negotiated ? 'Yes' : 'No',
    toInr(quote.priceBefore),
    toInr(quote.priceAfter),
    quote.redFlag ? 'Yes' : 'No',
    quote.redFlagReason,
    quote.itemizationMismatch ? 'Yes' : 'No',
  ]);

  const inrColumns = columns.map((column) =>
    ['Total price', 'Base price', 'Line items', 'Price before', 'Price after'].includes(column)
      ? `${column} (INR)`
      : column
  );
  return [
    inrColumns,
    ['Currency: INR', `USD/INR rate: ${usdToInrRate}`, ...Array(inrColumns.length - 2).fill('')],
    ...rows,
  ].map((row) => row.map(csvCell).join(',')).join('\r\n');
}
