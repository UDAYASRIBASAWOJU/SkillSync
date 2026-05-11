import { describe, it, expect } from 'vitest';
import { formatDateTimeIST, formatClockTime } from '../../utils/dateTime';

describe('formatDateTimeIST', () => {
  it('returns empty string for invalid date string', () => {
    expect(formatDateTimeIST('not-a-date')).toBe('');
  });

  it('returns empty string for NaN timestamp', () => {
    expect(formatDateTimeIST(NaN)).toBe('');
  });

  it('formats a valid ISO string and includes bullet separator', () => {
    const result = formatDateTimeIST('2024-05-11T10:00:00.000Z');
    expect(result).toContain('•');
  });

  it('formats a valid Date object', () => {
    const date = new Date('2024-01-15T09:30:00.000Z');
    const result = formatDateTimeIST(date);
    expect(result).toContain('•');
    expect(result.length).toBeGreaterThan(5);
  });

  it('formats a valid timestamp number', () => {
    const ts = new Date('2024-06-20T14:00:00.000Z').getTime();
    const result = formatDateTimeIST(ts);
    expect(result).toContain('•');
  });
});

describe('formatClockTime', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatClockTime('0:00')).toBe('12:00 AM');
  });

  it('formats noon as 12:00 PM', () => {
    expect(formatClockTime('12:00')).toBe('12:00 PM');
  });

  it('formats 9:05 correctly with zero-padded minutes', () => {
    expect(formatClockTime('9:05')).toBe('9:05 AM');
  });

  it('formats 13:30 as 1:30 PM', () => {
    expect(formatClockTime('13:30')).toBe('1:30 PM');
  });

  it('formats 23:59 as 11:59 PM', () => {
    expect(formatClockTime('23:59')).toBe('11:59 PM');
  });

  it('formats 0:01 as 12:01 AM', () => {
    expect(formatClockTime('0:01')).toBe('12:01 AM');
  });

  it('returns the raw value for a non-numeric hours input', () => {
    const result = formatClockTime('abc:00');
    expect(result).toBe('abc:00');
  });

  it('handles 24:00 by wrapping to 12:00 AM', () => {
    expect(formatClockTime('24:00')).toBe('12:00 AM');
  });
});
