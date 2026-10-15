import { describe, expect, test } from 'vitest';
import { convertUsdTextToInr, formatUsdAsInr } from '../lib/currency';

describe('USD to INR conversion', () => {
  test('formats converted amounts in Indian rupees', () => {
    expect(formatUsdAsInr(10, 83)).toBe('₹830');
  });

  test('converts dollar amounts embedded in text', () => {
    expect(convertUsdTextToInr('Saved $1,250.50, down from $2,000.', 80))
      .toBe('Saved ₹1,00,040, down from ₹1,60,000.');
  });

  test('does not present dollar amounts as rupees when the rate is unavailable', () => {
    expect(convertUsdTextToInr('Quote: $1,250', null)).toBe('Quote: INR conversion unavailable');
  });
});
