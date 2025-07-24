import { useState, useEffect, useRef, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

function MiniCalendar({ selectedDate, onDateSelect, onClose, position }) {
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(false); // 드래그 여부 추적
  // 초기 위치 설정
  const [calendarPosition, setCalendarPosition] = useState(() => {
    if (position) {
      return position;
    }
    // 기본값: 화면 중앙 (fallback)
    return { 
      top: '50%', 
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  });
  const calendarRef = useRef(null);

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

  // 드래그 시작
  const handleMouseDown = useCallback((e) => {
    // 드래그 핸들 영역에서만 드래그 시작
    if (e.target.closest('.drag-handle') && !e.target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = calendarRef.current.getBoundingClientRect();
      const modalContainer = calendarRef.current.closest('form') || calendarRef.current.closest('[data-modal]');
      
      setIsDragging(true);
      setHasBeenDragged(true); // 드래그되었음을 표시
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      // 드래그 시작 시 현재 위치를 모달 기준 상대 좌표로 설정
      if (modalContainer) {
        const modalRect = modalContainer.getBoundingClientRect();
        const relativeTop = rect.top - modalRect.top;
        const relativeLeft = rect.left - modalRect.left;
        
        setCalendarPosition({
          top: `${relativeTop}px`,
          left: `${relativeLeft}px`,
          transform: 'none'
        });
      } else {
        // fallback: 현재 위치 유지
        setCalendarPosition(prev => ({
          ...prev,
          transform: 'none'
        }));
      }
    }
  }, []);

  // 드래그 중
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const modalContainer = calendarRef.current?.closest('form') || calendarRef.current?.closest('[data-modal]');
    
    if (modalContainer) {
      const modalRect = modalContainer.getBoundingClientRect();
      // 모달 기준 상대 좌표로 계산
      const newX = e.clientX - modalRect.left - dragStart.x;
      const newY = e.clientY - modalRect.top - dragStart.y;
      
      setCalendarPosition({
        top: `${newY}px`,
        left: `${newX}px`,
        transform: 'none'
      });
    } else {
      // fallback: 기존 로직
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      setCalendarPosition({
        top: `${newY}px`,
        left: `${newX}px`,
        transform: 'none'
      });
    }
  }, [isDragging, dragStart.x, dragStart.y]);

  // 드래그 종료
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 외부 클릭시 닫기 및 드래그 이벤트 처리
  useEffect(() => {
    const handleClickOutside = (e) => {
      // 드래그 중이 아니고, 미니 달력 외부를 클릭했을 때만 닫기
      if (!isDragging && !e.target.closest('.mini-calendar')) {
        // 날짜 입력 트리거 영역 클릭은 토글 기능을 위해 useUI.js에서 처리하므로 여기서는 무시
        if (e.target.closest('.date-input-trigger')) {
          return;
        }
        onClose();
      }
    };

    const handleGlobalMouseMove = (e) => {
      handleMouseMove(e);
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    // 클릭 외부 감지는 항상 등록 (capture phase에서 처리)
    document.addEventListener('mousedown', handleClickOutside, true);
    
    // 드래그 중일 때만 글로벌 이벤트 등록
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.userSelect = 'none'; // 드래그 중 텍스트 선택 방지
      document.body.style.cursor = 'grabbing'; // 전체 화면에 드래그 커서
    } else {
      document.body.style.userSelect = ''; // 원래 상태로 복원
      document.body.style.cursor = ''; // 커서 복원
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.userSelect = ''; // 정리
      document.body.style.cursor = ''; // 정리
    };
  }, [onClose, isDragging, handleMouseMove, handleMouseUp]);

  // position prop이 변경될 때 calendarPosition 업데이트
  useEffect(() => {
    // 한 번도 드래그되지 않았고, 드래그 중이 아닐 때만 position prop 적용
    if (position && !isDragging && !hasBeenDragged) {
      setCalendarPosition(position);
    }
  }, [position, isDragging, hasBeenDragged]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div 
      ref={calendarRef}
      className={`mini-calendar absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-72 ${isDragging ? 'shadow-2xl' : ''}`}
      style={{
        top: calendarPosition.top,
        left: calendarPosition.left,
        transform: calendarPosition.transform || 'none',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* 드래그 가능한 헤더 */}
      <div className="drag-handle flex items-center justify-between p-4 cursor-grab hover:cursor-grab active:cursor-grabbing border-b border-gray-200">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-200 rounded z-10 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          ◀
        </button>
        <div 
          className="font-semibold text-lg select-none flex-1 text-center cursor-grab"
          onMouseDown={(e) => {
            // 제목 영역에서도 드래그 가능하도록
            if (!e.target.closest('button')) {
              handleMouseDown(e);
            }
          }}
        >
          {format(currentDate, 'yyyy년 M월', { locale: ko })}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-200 rounded z-10 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          ▶
        </button>
      </div>

      {/* 달력 본체 */}
      <div className="p-4"
           onMouseDown={(e) => e.stopPropagation()}>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day, index) => (
            <div 
              key={day} 
              className="text-center text-sm font-medium py-2 select-none"
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
    </div>
  );
}

export default MiniCalendar;
