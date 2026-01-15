export enum TeacherGroup {
  MAM_NON = 'Mầm non',
  PHO_THONG = 'Phổ thông (Tiểu học/THCS/THPT)'
}

export enum Rank {
  HANG_III = 'Hạng III',
  HANG_II = 'Hạng II',
  HANG_I = 'Hạng I'
}

export interface SalaryCoefficients {
  [TeacherGroup.MAM_NON]: {
    [Rank.HANG_III]: number[]; // Viên chức loại A0
    [Rank.HANG_II]: number[];  // Viên chức loại A1
    [Rank.HANG_I]: number[];   // Viên chức loại A2
  };
  [TeacherGroup.PHO_THONG]: {
    [Rank.HANG_III]: number[]; // Viên chức loại A1
    [Rank.HANG_II]: number[];  // Viên chức loại A2
    [Rank.HANG_I]: number[];   // Viên chức loại A3
  };
}

export interface CalculationResult {
  coefficient: number;
  baseSalary: number; // The 2.34 * coefficient part
  seniorityAmt: number;
  allowanceAmt: number;
  insuranceAmt: number;
  totalSalary: number;
}
