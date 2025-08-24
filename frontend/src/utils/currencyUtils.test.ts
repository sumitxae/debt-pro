import { formatCompactNumber, formatCurrency } from './currencyUtils';

// Test cases for formatCompactNumber
describe('formatCompactNumber', () => {
  test('should format numbers less than 100 as is', () => {
    expect(formatCompactNumber(50)).toBe('50');
    expect(formatCompactNumber(99.5)).toBe('99.5');
    expect(formatCompactNumber(0)).toBe('0');
  });

  test('should format numbers 100-999 with 1 decimal place', () => {
    expect(formatCompactNumber(100)).toBe('100.0');
    expect(formatCompactNumber(500)).toBe('500.0');
    expect(formatCompactNumber(999)).toBe('999.0');
  });

  test('should format thousands with K suffix', () => {
    expect(formatCompactNumber(1000)).toBe('1.0K');
    expect(formatCompactNumber(15000)).toBe('15.0K');
    expect(formatCompactNumber(99999)).toBe('99.9K');
  });

  test('should format lakhs with L suffix', () => {
    expect(formatCompactNumber(100000)).toBe('1.0L');
    expect(formatCompactNumber(500000)).toBe('5.0L');
    expect(formatCompactNumber(9999999)).toBe('99.9L');
  });

  test('should format crores with Cr suffix', () => {
    expect(formatCompactNumber(10000000)).toBe('1.0Cr');
    expect(formatCompactNumber(50000000)).toBe('5.0Cr');
    expect(formatCompactNumber(999999999)).toBe('99.9Cr');
  });

  test('should format very large numbers with Cr suffix and more precision', () => {
    expect(formatCompactNumber(1000000000)).toBe('100.00Cr');
    expect(formatCompactNumber(5000000000)).toBe('500.00Cr');
  });

  test('should handle negative numbers', () => {
    expect(formatCompactNumber(-1000)).toBe('-1.0K');
    expect(formatCompactNumber(-100000)).toBe('-1.0L');
    expect(formatCompactNumber(-10000000)).toBe('-1.0Cr');
  });

  test('should handle null, undefined, and NaN', () => {
    expect(formatCompactNumber(null as any)).toBe('0');
    expect(formatCompactNumber(undefined as any)).toBe('0');
    expect(formatCompactNumber(NaN)).toBe('0');
  });
});

// Test cases for formatCurrency with compact formatting
describe('formatCurrency with compact formatting', () => {
  test('should use compact formatting for amounts >= 100', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.0');
    expect(formatCurrency(1000, 'USD')).toBe('$1.0K');
    expect(formatCurrency(100000, 'USD')).toBe('$1.0L');
    expect(formatCurrency(10000000, 'USD')).toBe('$1.0Cr');
  });

  test('should use regular formatting for amounts < 100', () => {
    expect(formatCurrency(50, 'USD')).toBe('$50.00');
    expect(formatCurrency(99.99, 'USD')).toBe('$99.99');
  });

  test('should work with different currencies', () => {
    expect(formatCurrency(1000, 'INR')).toBe('₹1.0K');
    expect(formatCurrency(1000, 'EUR')).toBe('€1.0K');
    expect(formatCurrency(1000, 'GBP')).toBe('£1.0K');
  });
}); 