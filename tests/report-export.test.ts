import { describe, expect, test } from 'vitest';
import { quotesToCsv } from '../lib/report-export';
import type { Quote } from '../types';

const quote = (overrides: Partial<Quote> = {}): Quote => ({
  quoteId: 'quote-1',
  providerName: 'Northside Movers',
  persona: 'tough',
  basePrice: 1800,
  lineItems: [{ label: 'Stairs', amount: 120 }],
  totalPrice: 1920,
  binding: true,
  redFlag: false,
  redFlagReason: null,
  itemizationMismatch: false,
  negotiated: true,
  priceBefore: 2100,
  priceAfter: 1920,
  transcriptRef: 'transcript-1',
  callOutcome: 'quoted',
  ...overrides,
});

describe('quotesToCsv', () => {
  test('exports itemized quotes and marks unavailable prices as blank', () => {
    const csv = quotesToCsv([
      quote(),
      quote({
        quoteId: 'quote-2',
        providerName: 'No-price mover',
        callOutcome: 'callback',
        totalPrice: 0,
        basePrice: 0,
        lineItems: [],
      }),
    ], 2);

    expect(csv).toContain('"Rank","Provider","Outcome","Total price (INR)"');
    expect(csv).toContain('"Currency: INR","USD/INR rate: 2"');
    expect(csv).toContain('"1","Northside Movers","quoted","3840","3600","Stairs: 240"');
    expect(csv).toContain('"2","No-price mover","callback","",""');
  });

  test('escapes CSV punctuation and blocks spreadsheet formula cells', () => {
    const csv = quotesToCsv([
      quote({
        providerName: '=1+1,"bad"\nMover',
        lineItems: [{ label: '@SUM(A1:A3)', amount: null }],
      }),
    ], 2);

    expect(csv).toContain(`"'=1+1,""bad""\nMover"`);
    expect(csv).toContain(`"'@SUM(A1:A3): undisclosed"`);
  });

  test('requires a valid exchange rate', () => {
    expect(() => quotesToCsv([quote()], 0)).toThrow('A valid USD/INR exchange rate is required');
  });
});
