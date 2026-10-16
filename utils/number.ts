const DECIMAL = /^\d+(\.\d+)?$/;
const INTEGER = /^\d+$/;

/**
 * Keep digits and a single decimal separator (comma or dot → dot), max 2 decimal places.
 * Letters and extra separators are dropped, so they cannot be typed into numeric fields.
 */
export const sanitizeDecimalInput = (raw: string): string => {
  let separatorSeen = false;
  let decimals = 0;
  let out = '';

  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      if (separatorSeen) {
        if (decimals >= 2) {
          continue;
        }
        decimals += 1;
      }
      out += char;
      continue;
    }
    if ((char === '.' || char === ',') && !separatorSeen) {
      separatorSeen = true;
      out += '.';
    }
  }

  return out;
};

/** Digits only. */
export const sanitizeIntegerInput = (raw: string): string =>
  raw.replace(/[^\d]/g, '');

export const parseDecimal = (text: string): number | null => {
  const trimmed = text.trim();
  if (!DECIMAL.test(trimmed)) {
    return null;
  }
  const amount = Number(trimmed);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return amount;
};

export const parseInteger = (text: string): number | null => {
  const trimmed = text.trim();
  if (!INTEGER.test(trimmed)) {
    return null;
  }
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    return null;
  }
  return amount;
};
