import { getActiveColors } from '@/theme/runtime';

export const getBmiCategory = (bmi: number) => {
  const colors = getActiveColors();
  if (bmi < 18.5) return { label: 'Underweight', color: colors.bmiUnderweight };
  if (bmi < 25) return { label: 'Normal', color: colors.bmiNormal };
  if (bmi < 30) return { label: 'Overweight', color: colors.bmiOverweight };
  return { label: 'Obese', color: colors.bmiObese };
};
