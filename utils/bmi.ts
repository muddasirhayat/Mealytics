import { colors } from '@/theme/colors';

export const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: colors.info };
  if (bmi < 25) return { label: 'Normal', color: colors.success };
  if (bmi < 30) return { label: 'Overweight', color: colors.warning };
  return { label: 'Obese', color: colors.error };
};
