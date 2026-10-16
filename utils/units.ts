export const cmToFtIn = (cm: number) => {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  if (inches === 12) {
    return { ft: ft + 1, inches: 0 };
  }
  return { ft, inches };
};

export const ftInToCm = (ft: number, inches: number) => Math.round((ft * 12 + inches) * 2.54);

export const kgToLbs = (kg: number) => Math.round(kg * 2.2046 * 10) / 10;

export const lbsToKg = (lbs: number) => parseFloat((lbs / 2.2046).toFixed(1));

export const formatFtIn = (cm: number) => {
  const { ft, inches } = cmToFtIn(cm);
  return `${ft} ft ${inches} in`;
};
