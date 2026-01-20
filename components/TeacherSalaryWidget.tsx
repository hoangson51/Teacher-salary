import React, { useState, useMemo, useEffect } from 'react';
import { TeacherGroup, Rank } from '../types';
import { COEFFICIENTS, BASE_SALARY_UNIT, INSURANCE_RATE } from '../constants';
import { formatCurrency } from '../utils/format';

const TEACHER_LEVELS = ['Mầm non', 'Tiểu học', 'THCS', 'THPT'];

// Data from the Excel image
const ALLOWANCE_MAPPING: Record<string, number[]> = {
  'Mầm non': [35, 50, 70],
  'Tiểu học': [35, 50, 70],
  'THCS': [30, 35, 50, 70],
  'THPT': [30, 35, 70]
};

// Simple Tooltip Component
const Tooltip: React.FC<{ content: string }> = ({ content }) => (
  <div className="relative group inline-flex items-center ml-1.5 cursor-help align-middle">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="14" 
      height="14" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="text-gray-400 hover:text-gray-600"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left font-normal leading-snug">
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const TeacherSalaryWidget: React.FC = () => {
  // Initialize with null/empty to satisfy "no defaults" requirement
  const [subGroup, setSubGroup] = useState<string | null>(null);
  const [group, setGroup] = useState<TeacherGroup | null>(null);
  const [rank, setRank] = useState<Rank | null>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [seniorityYears, setSeniorityYears] = useState<string>('');
  const [allowancePercent, setAllowancePercent] = useState<number | null>(null);

  const handleGroupChange = (level: string) => {
    setSubGroup(level);
    if (level === 'Mầm non') {
      setGroup(TeacherGroup.MAM_NON);
    } else {
      setGroup(TeacherGroup.PHO_THONG);
    }
    
    // If current allowance is not valid for new group, reset it.
    const newAllowances = ALLOWANCE_MAPPING[level] || [];
    if (allowancePercent !== null && !newAllowances.includes(allowancePercent)) {
       setAllowancePercent(null);
    }
  };

  const handleRankChange = (newRank: Rank) => {
    setRank(newRank);
    setStepIndex(null); // Reset step when rank changes
  };

  // Determine current coefficient list based on selections
  const currentCoefficients = useMemo(() => {
    if (!group || !rank) return [];
    return COEFFICIENTS[group][rank];
  }, [group, rank]);

  // Reset step index if it exceeds the new list length when rank/group changes
  useEffect(() => {
    if (stepIndex !== null && currentCoefficients.length > 0 && stepIndex >= currentCoefficients.length) {
      setStepIndex(null);
    }
  }, [currentCoefficients, stepIndex]);

  // Get valid allowances for current group, or all if none selected
  const currentAllowanceOptions = useMemo(() => {
    if (subGroup) {
      return ALLOWANCE_MAPPING[subGroup] || [];
    }
    // Return unique values from all mappings if no group selected
    const allValues = new Set<number>();
    Object.values(ALLOWANCE_MAPPING).forEach(arr => arr.forEach(v => allValues.add(v)));
    return Array.from(allValues).sort((a, b) => a - b);
  }, [subGroup]);

  // Determine steps to display
  const stepsToDisplay = useMemo(() => {
    if (currentCoefficients.length > 0) {
      return currentCoefficients.map((_, i) => i + 1);
    }
    // Default to 10 steps if no coefficient set is determined yet
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }, [currentCoefficients]);

  // Calculation function
  const calculateSalary = (coeff: number, seniority: number, allowancePct: number) => {
    const salaryFromCoeff = BASE_SALARY_UNIT * coeff;

    let seniorityRate = 0;
    if (seniority >= 5) {
      seniorityRate = seniority / 100;
    }
    const seniorityAmt = salaryFromCoeff * seniorityRate;

    const allowanceRate = allowancePct / 100;
    const allowanceAmt = salaryFromCoeff * allowanceRate;

    // Insurance calculated on base salary part
    const insuranceAmt = salaryFromCoeff * INSURANCE_RATE;

    const totalSalary = salaryFromCoeff + seniorityAmt + allowanceAmt - insuranceAmt;

    return {
      salaryFromCoeff,
      seniorityAmt,
      allowanceAmt,
      insuranceAmt,
      totalSalary
    };
  };

  const results = useMemo(() => {
    if (
        !group || 
        !rank || 
        stepIndex === null || 
        allowancePercent === null || 
        seniorityYears === ''
    ) {
        return null;
    }

    const coefficient = currentCoefficients[stepIndex];
    if (coefficient === undefined) return null;

    const sYears = parseInt(seniorityYears) || 0;

    const current = calculateSalary(coefficient, sYears, allowancePercent);
    const future = calculateSalary(coefficient, sYears, allowancePercent + 10);
    const increase = future.totalSalary - current.totalSalary;

    return { current, future, increase, coefficient, sYears };
  }, [group, rank, stepIndex, allowancePercent, seniorityYears, currentCoefficients]);

  const hasResults = !!results;
  const safeCurrentTotal = results ? results.current.totalSalary : 0;
  const safeFutureTotal = results ? results.future.totalSalary : 0;
  const safeIncrease = results ? results.increase : 0;

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-none overflow-hidden border border-gray-200 font-sans">
      {/* Header */}
      <div className="px-5 pt-5 pb-0 text-left">
        <h2 className="text-gray-900 font-serif text-xl font-bold">
          Lương giáo viên trước và sau thay đổi
        </h2>
        <p className="text-gray-500 text-sm mt-1 italic">
          Vui lòng nhập đầy đủ thông tin để hiển thị kết quả
        </p>
      </div>

      <div className="p-5 pt-3 space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-3">
          
          {/* Item 1: Teacher Group (Top Left) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Nhóm giáo viên</label>
            <div className="grid grid-cols-2 gap-2">
              {TEACHER_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleGroupChange(level)}
                  className={`py-2 px-1 text-sm rounded-lg border font-bold transition shadow-sm ${
                    subGroup === level
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-primary hover:text-primary'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Item 2: Rank (Top Right) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Hạng chức danh</label>
            <div className="flex gap-2">
              {Object.values(Rank).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRankChange(r)}
                  className={`flex-1 py-2 px-2 text-sm rounded-lg border font-bold transition shadow-sm ${
                    rank === r 
                    ? 'bg-primary/10 text-primary border-primary' 
                    : 'bg-white text-gray-500 border-gray-300 hover:border-primary hover:text-primary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Item 3: Allowance (Middle Left - Below Group) */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1.5">
              % Phụ cấp ưu đãi hiện tại
              <Tooltip content="Tùy thuộc vào cấp học và khu vực (30% - 80%)" />
            </label>
            
            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-2">
              {currentAllowanceOptions.map(val => (
                <button
                  key={val}
                  onClick={() => setAllowancePercent(val)}
                  className={`text-sm font-bold py-2 px-4 rounded-lg border transition shadow-sm ${
                    allowancePercent === val
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Item 4: Step (Middle Right - Below Rank) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
                Bậc lương
            </label>
            <div className="flex flex-wrap gap-2">
                {stepsToDisplay.map((stepLabel, index) => (
                    <button
                        key={index}
                        onClick={() => setStepIndex(index)}
                        className={`py-2 px-4 text-sm rounded-lg border font-bold transition shadow-sm min-w-[3rem] ${
                        stepIndex === index
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
                        }`}
                    >
                        {stepLabel}
                    </button>
                ))}
            </div>
          </div>

          {/* Item 5: Seniority (Bottom Full Width) */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-800 mb-1.5">
              Thâm niên công tác (năm)
              <Tooltip content="Hưởng phụ cấp từ năm thứ 5 trở đi (1% mỗi năm)" />
            </label>
            <input 
              type="number" 
              min="0" 
              max="50"
              className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:border-black focus:ring-0 outline-none transition shadow-sm"
              value={seniorityYears}
              onChange={(e) => setSeniorityYears(e.target.value)}
              placeholder="Nhập số năm"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-4 pt-2 border-t border-gray-100">
          <h3 className="font-serif font-bold text-gray-800 text-lg mb-2">
            Thu nhập
          </h3>

          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 sm:gap-x-4 items-baseline">
             {/* Header Row */}
             <div className="text-gray-500 text-sm sm:text-base font-bold uppercase tracking-wider pb-1 whitespace-nowrap">
                KHOẢN MỤC
             </div>
             <div className="text-gray-600 text-sm sm:text-base font-bold text-right pb-1">
                Hiện tại
             </div>
             <div className="text-primary text-sm sm:text-base font-bold text-right pb-1">
                Mới (Dự kiến)
             </div>
             
             {/* Values Row */}
             <div className="font-sans font-bold text-sm sm:text-base text-gray-900 py-2 whitespace-nowrap">
               TỔNG
             </div>
             <div className="text-right py-2">
               <div className={`font-sans font-bold text-lg sm:text-2xl text-gray-800 leading-none ${hasResults ? '' : 'invisible'}`}>
                 {formatCurrency(safeCurrentTotal)}
               </div>
             </div>
             <div className="text-right py-2 flex flex-col items-end">
               <div className={`font-sans font-bold text-lg sm:text-2xl text-primary leading-none ${hasResults ? '' : 'invisible'}`}>
                 {formatCurrency(safeFutureTotal)}
               </div>
               <div className={`text-sm sm:text-base font-bold text-green-600 mt-1 ${hasResults ? '' : 'invisible'}`}>
                  (+{formatCurrency(safeIncrease)})
               </div>
             </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="text-xs text-gray-500 text-left italic !mt-4">
          * Công cụ tính dựa trên công thức: Lương = (2.34 x Hệ số) + Phụ cấp thâm niên + Phụ cấp ưu đãi - Bảo hiểm.<br/>
          Số liệu làm tròn đến hàng đơn vị. Kết quả mang tính chất tham khảo.
        </div>
      </div>
    </div>
  );
};

export default TeacherSalaryWidget;