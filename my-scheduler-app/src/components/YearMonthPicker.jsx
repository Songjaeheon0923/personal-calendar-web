import React, { useState, useRef, useEffect } from "react";

const monthNames = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월"
];

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let dayOfWeek = firstDay.getDay();
  // Fill first week
  for (let i = 0; i < dayOfWeek; i++) week.push("");
  for (let day = 1; day <= lastDay.getDate(); day++) {
    week.push(day);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push("");
    matrix.push(week);
  }
  return matrix;
}

export default function YearMonthPicker({
  initialYear, onSelectMonth, onClose
}) {
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const pickerRef = useRef(null);
  
  // 외부 클릭시 닫기 기능
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // 현재 날짜 정보
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (0=1월)
  const currentDate = today.getDate();

  return (
    <div 
      ref={pickerRef}
      className="bg-white rounded-lg shadow-lg p-6 w-[800px] mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          className="text-2xl px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setYear(y => y - 1)}
          aria-label="이전 년도"
        >
          ←
        </button>
        <span className="text-3xl font-bold text-gray-800">{year}년</span>
        <button
          className="text-2xl px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setYear(y => y + 1)}
          aria-label="다음 년도"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {monthNames.map((name, idx) => {
          const monthIcons = [
            "❄️", "❄️", "🌸", "🌸", "🌸", "☀️", "☀️", "☀️", "🍂", "🍂", "🍂", "❄️"
          ];
          
          // 현재 월인지 확인
          const isCurrentMonth = year === currentYear && idx === currentMonth;
          
          return (
            <div
              key={idx}
              className={`border border-gray-200 rounded-lg p-3 flex flex-col items-center hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md min-h-[140px] ${
                isCurrentMonth ? "bg-sky-50 border-sky-200" : ""
              }`}
              onClick={() => onSelectMonth(year, idx + 1)}
            >
              <div className="flex items-center justify-center mb-3">
                <span className="text-base mr-2">{monthIcons[idx]}</span>
                <span className="text-sm font-bold text-gray-800">{name}</span>
              </div>
              <div className="w-full flex-1">
                <div className="grid grid-cols-7 gap-0 text-xs mb-1">
                  {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                    <div key={d} className={`text-center py-1 font-medium text-[10px] ${
                      i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
                    }`}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0">
                  {getMonthMatrix(year, idx).flat().map((day, dayIdx) => (
                    <div 
                      key={dayIdx} 
                      className={`text-center py-0.5 text-[10px] leading-tight ${
                        day ? "text-gray-700 font-medium" : ""
                      } ${
                        dayIdx % 7 === 0 && day ? "text-red-500" : 
                        dayIdx % 7 === 6 && day ? "text-blue-500" : ""
                      }`}
                    >
                      {day || ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center mt-6">
        <button
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium text-gray-700"
          onClick={onClose}
        >
          취소
        </button>
      </div>
    </div>
  );
}
