import { SalaryCoefficients, TeacherGroup, Rank } from './types';

export const BASE_SALARY_UNIT = 2340000; // 2.34 million VND
export const INSURANCE_RATE = 0.105; // 10.5%

export const COEFFICIENTS: SalaryCoefficients = {
  [TeacherGroup.MAM_NON]: {
    // Hạng III (A0): 10 bậc
    [Rank.HANG_III]: [2.10, 2.41, 2.72, 3.03, 3.34, 3.65, 3.96, 4.27, 4.58, 4.89],
    // Hạng II (A1): 9 bậc
    [Rank.HANG_II]: [2.34, 2.67, 3.00, 3.33, 3.66, 3.99, 4.32, 4.65, 4.98],
    // Hạng I (A2): 8 bậc
    [Rank.HANG_I]: [4.00, 4.34, 4.68, 5.02, 5.36, 5.70, 6.04, 6.38],
  },
  [TeacherGroup.PHO_THONG]: {
    // Hạng III (A1): 9 bậc
    [Rank.HANG_III]: [2.34, 2.67, 3.00, 3.33, 3.66, 3.99, 4.32, 4.65, 4.98],
    // Hạng II (A2): 8 bậc
    [Rank.HANG_II]: [4.00, 4.34, 4.68, 5.02, 5.36, 5.70, 6.04, 6.38],
    // Hạng I (A3): 8 bậc visible in image
    [Rank.HANG_I]: [4.40, 4.74, 5.08, 5.42, 5.76, 6.10, 6.44, 6.78],
  }
};

export const ALLOWANCE_SUGGESTIONS = [
  { value: 30, label: '30%' },
  { value: 35, label: '35%' },
  { value: 40, label: '40%' },
  { value: 45, label: '45%' },
  { value: 50, label: '50%' },
  { value: 60, label: '60%' },
  { value: 70, label: '70%' },
  { value: 80, label: '80%' },
];
