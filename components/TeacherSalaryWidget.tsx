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
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center font-normal leading-snug">
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

  // Get valid allowances for current group
  const currentAllowanceOptions = useMemo(() => (subGroup ? ALLOWANCE_MAPPING[subGroup] : []) || [], [subGroup]);

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

  return (
    <div className="w-full max-w-[680px] mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 font-sans">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 text-left">
        <h2 className="text-primary font-serif text-2xl font-bold">
          Lương giáo viên trước và sau thay đổi
        </h2>
        <p className="text-gray-500 text-sm mt-2 italic">
          Vui lòng nhập đầy đủ thông tin để hiển thị kết quả
        </p>
      </div>

      <div className="p-6 pt-4 space-y-6">
        {/* Input Section - Refactored to single grid for alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-5">
          
          {/* Item 1: Teacher Group (Top Left) */}
          <div className="order-1">
            <label className="block text-sm font-bold text-gray-800 mb-2">Nhóm giáo viên</label>
            <div className="grid grid-cols-2 gap-2">
              {TEACHER_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleGroupChange(level)}
                  className={`py-2 px-1 text-sm rounded-lg border font-bold transition shadow-sm ${
                    subGroup === level
                    ? 'bg-primary text-white border-primary ring-1 ring-primary'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Item 2: Seniority (Top Right on Desktop, Position 3 on Mobile) */}
          <div className="order-3 md:order-2">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
              Thâm niên công tác (năm)
              <Tooltip content="Hưởng phụ cấp từ năm thứ 5 trở đi (1% mỗi năm)" />
            </label>
            <input 
              type="number" 
              min="0" 
              max="50"
              className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:border-black focus:ring-0 outline-none transition shadow-sm"
              value={seniorityYears}
              onChange={(e) => setSeniorityYears(e.target.value)}
              placeholder="Nhập số năm"
            />
          </div>

          {/* Item 3: Rank (Bottom Left on Desktop, Position 2 on Mobile) */}
          <div className="order-2 md:order-3">
            <label className="block text-sm font-bold text-gray-800 mb-2">Hạng chức danh</label>
            <div className="flex gap-2">
              {Object.values(Rank).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRankChange(r)}
                  className={`flex-1 py-2 px-2 text-sm rounded-lg border font-bold transition shadow-sm ${
                    rank === r 
                    ? 'bg-primary text-white border-primary ring-1 ring-primary' 
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Item 4: Allowance (Bottom Right on Desktop, Position 4 on Mobile) */}
          <div className="order-4">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
              % Phụ cấp ưu đãi hiện tại
              <Tooltip content="Tùy thuộc vào cấp học và khu vực (30% - 80%)" />
            </label>
            
            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-2">
              {currentAllowanceOptions.length > 0 ? (
                currentAllowanceOptions.map(val => (
                <button
                  key={val}
                  onClick={() => setAllowancePercent(val)}
                  className={`text-sm font-bold py-2 px-4 rounded-lg border transition shadow-sm ${
                    allowancePercent === val
                    ? 'bg-primary text-white border-primary ring-1 ring-primary'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
                  }`}
                >
                  {val}%
                </button>
              ))
            ) : (
                <div className="text-gray-400 text-sm italic py-2">Vui lòng chọn nhóm giáo viên</div>
            )}
            </div>
          </div>
        </div>

        {/* Full width Step section */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Bậc lương
          </label>
          {currentCoefficients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {currentCoefficients.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setStepIndex(index)}
                    className={`w-9 h-9 flex items-center justify-center text-sm rounded-md border font-bold transition shadow-sm ${
                    stepIndex === index
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                    }`}
                >
                    {index + 1}
                </button>
                ))}
            </div>
          ) : (
             <div className="text-gray-400 text-sm italic">Vui lòng chọn nhóm giáo viên và hạng chức danh</div>
          )}
        </div>

        {/* Results Section */}
        {results && (
        <div className="bg-[#F7F7F7] rounded-xl p-5 border border-gray-300 relative overflow-hidden mt-2">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
          
          <h3 className="font-serif font-bold text-gray-800 text-lg mb-4 border-b border-gray-300 pb-2">
            Chi tiết lương thực nhận
          </h3>

          {/* Mobile View: Two Stacked Cards (Current & New) */}
          <div className="sm:hidden space-y-4">
            {/* Card 1: Current Salary */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
               <div className="text-gray-600 font-bold text-sm uppercase mb-3 pb-1 border-b">Hiện tại</div>
               <div className="space-y-2 text-sm text-gray-800">
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">Lương hệ số <span className="text-xs">({results.coefficient.toFixed(2)})</span></span>
                     <span className="font-bold">{formatCurrency(results.current.salaryFromCoeff)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">PC Thâm niên <span className="text-xs">({results.sYears >= 5 ? results.sYears : 0}%)</span></span>
                     <span className="font-bold text-green-700">{formatCurrency(results.current.seniorityAmt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">PC Ưu đãi <span className="text-xs">({allowancePercent}%)</span></span>
                     <span className="font-bold text-green-700">{formatCurrency(results.current.allowanceAmt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">BHXH <span className="text-xs">(10.5%)</span></span>
                     <span className="font-bold text-red-600">-{formatCurrency(results.current.insuranceAmt)}</span>
                  </div>
                  <div className="pt-2 border-t mt-2 flex justify-between items-center">
                     <span className="font-serif font-bold text-gray-900">Tổng nhận</span>
                     <span className="font-bold text-xl text-gray-800">{formatCurrency(results.current.totalSalary)}</span>
                  </div>
               </div>
            </div>

            {/* Card 2: New Salary */}
            <div className="bg-white rounded-lg p-3 border border-red-100 shadow-sm">
               <div className="text-primary font-bold text-sm uppercase mb-3 pb-1 border-b border-red-200">Mới (Dự kiến)</div>
               <div className="space-y-2 text-sm text-gray-800">
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">Lương hệ số <span className="text-xs">({results.coefficient.toFixed(2)})</span></span>
                     <span className="font-bold text-primary">{formatCurrency(results.future.salaryFromCoeff)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">PC Thâm niên <span className="text-xs">({results.sYears >= 5 ? results.sYears : 0}%)</span></span>
                     <span className="font-bold text-green-700">{formatCurrency(results.future.seniorityAmt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">PC Ưu đãi <span className="text-xs">({(allowancePercent || 0) + 10}%)</span></span>
                     <span className="font-bold text-green-700">{formatCurrency(results.future.allowanceAmt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">BHXH <span className="text-xs">(10.5%)</span></span>
                     <span className="font-bold text-red-600">-{formatCurrency(results.future.insuranceAmt)}</span>
                  </div>
                  <div className="pt-2 border-t border-red-200 mt-2">
                     <div className="flex justify-between items-center">
                        <span className="font-serif font-bold text-gray-900">Tổng nhận</span>
                        <span className="font-bold text-xl text-primary">{formatCurrency(results.future.totalSalary)}</span>
                     </div>
                     <div className="text-right text-xs font-bold text-green-600 mt-1">
                        (+{formatCurrency(results.increase)})
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Desktop View: Table (Visible on sm and up) */}
          <div className="hidden sm:grid grid-cols-[1.5fr,1fr,1fr] gap-x-2 gap-y-3 text-sm text-gray-800 items-center">
            {/* Header Row */}
            <div className="font-bold text-gray-500 text-xs uppercase tracking-wider">Khoản mục</div>
            <div className="font-bold text-gray-700 text-right">Hiện tại</div>
            <div className="font-bold text-primary text-right">Mới (Dự kiến)</div>
            
            {/* Lương theo hệ số */}
            <div className="col-span-3 h-px bg-gray-200 my-1"></div>
            <div>
              Lương theo hệ số <span className="text-xs text-gray-500 block sm:inline">(2.34 x {results.coefficient.toFixed(2)})</span>
            </div>
            <div className="text-right font-bold">{formatCurrency(results.current.salaryFromCoeff)}</div>
            <div className="text-right font-bold text-primary">{formatCurrency(results.future.salaryFromCoeff)}</div>

            {/* Phụ cấp thâm niên */}
            <div>
              + Phụ cấp thâm niên <span className="text-xs text-gray-500 block sm:inline">{results.sYears >= 5 ? `(${results.sYears}%)` : '(0%)'}</span>
            </div>
            <div className="text-right font-bold text-green-700">{formatCurrency(results.current.seniorityAmt)}</div>
            <div className="text-right font-bold text-green-700">{formatCurrency(results.future.seniorityAmt)}</div>

            {/* Phụ cấp ưu đãi */}
            <div>
              + Phụ cấp ưu đãi
            </div>
            <div className="text-right font-bold text-green-700">
              {formatCurrency(results.current.allowanceAmt)}
              <span className="text-xs text-gray-500 block">({allowancePercent}%)</span>
            </div>
            <div className="text-right font-bold text-green-700">
               {formatCurrency(results.future.allowanceAmt)}
               <span className="text-xs text-gray-500 block">({(allowancePercent || 0) + 10}%)</span>
            </div>

             {/* Bảo hiểm */}
            <div>
              - Bảo hiểm xã hội <span className="text-xs text-gray-500 block sm:inline">(10.5%)</span>
            </div>
            <div className="text-right font-bold text-red-600">-{formatCurrency(results.current.insuranceAmt)}</div>
            <div className="text-right font-bold text-red-600">-{formatCurrency(results.future.insuranceAmt)}</div>
            
            {/* Totals Row */}
            <div className="col-span-3 h-px bg-gray-400 mt-2 mb-2"></div>

            <div className="font-serif font-bold text-lg text-gray-900 self-baseline">
              Tổng thực nhận:
            </div>

            <div className="text-right flex flex-col items-end self-baseline">
               <div className="font-sans font-bold text-2xl text-gray-800 leading-none">
                {formatCurrency(results.current.totalSalary)}
              </div>
            </div>

            <div className="text-right flex flex-col items-end self-baseline">
               <div className="font-sans font-bold text-2xl text-primary leading-none">
                {formatCurrency(results.future.totalSalary)}
              </div>
              <div className="text-xs font-bold text-green-600 mt-1">
                 (+{formatCurrency(results.increase)})
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Footer Notes */}
        <div className="text-xs text-gray-500 text-left italic !mt-2">
          * Công cụ tính dựa trên công thức: Lương = (2.34 x Hệ số) + Phụ cấp thâm niên + Phụ cấp ưu đãi - Bảo hiểm.<br/>
          Số liệu làm tròn đến hàng đơn vị. Kết quả mang tính chất tham khảo.
        </div>
      </div>
    </div>
  );
};

export default TeacherSalaryWidget;
