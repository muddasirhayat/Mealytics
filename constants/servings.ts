export const SERVING_UNITS = ['g', 'ml', 'cup', 'piece', 'plate', 'bowl', 'slice'] as const;

export type ServingUnit = (typeof SERVING_UNITS)[number];

export const SERVING_UNIT_OPTIONS = SERVING_UNITS.map((unit) => ({
  label: unit,
  value: unit,
}));

export const isServingUnit = (value: string): value is ServingUnit =>
  (SERVING_UNITS as readonly string[]).includes(value);

export const toServingUnit = (value?: string): ServingUnit =>
  value && isServingUnit(value) ? value : 'g';

export const servingUnitOptions = (current?: string) => {
  const extra =
    current && !isServingUnit(current) ? [{ label: current, value: current }] : [];
  return [...extra, ...SERVING_UNIT_OPTIONS];
};

export const isMassOrVolumeUnit = (unit: string): boolean => unit === 'g' || unit === 'ml';
