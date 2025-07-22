import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

function MiniCalendar({ selectedDate, onDateSelect, onClose, position }) {
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

  // 달력 날짜들 생성
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dates = [];
  let day = startDate;
  while (day <= endDate) {
    dates.push(new Date(day));
    day = addDays(day, 1);
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    onDateSelect(format(date, 'yyyy-MM-dd'));
    onClose();
  };

  // 이전/다음 달 네비게이션
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.mini-calendar')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div 
      className="mini-calendar absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-72"
      style={{
        top: position?.top || '100%',
        left: position?.left || '0',
        marginTop: '4px'
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ◀
        </button>
        <h3 className="font-semibold text-lg">
          {format(currentDate, 'yyyy년 M월', { locale: ko })}
        </h3>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ▶
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className="text-center text-sm font-medium py-2"
            style={{
              color: index === 0 ? '#ef4444' : index === 6 ? '#2563eb' : '#374151'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isSelected = selectedDate && isSameDay(date, new Date(selectedDate));
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(date)}
              className={`
                h-8 text-sm rounded hover:bg-blue-100 transition-colors
                ${!isCurrentMonth ? 'text-gray-400' : ''}
                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${isToday && !isSelected ? 'bg-red-100 text-red-600 font-semibold' : ''}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* 오늘 버튼 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={() => handleDateClick(new Date())}
          className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          오늘
        </button>
      </div>
    </div>
  );
}

export default MiniCalendar;
