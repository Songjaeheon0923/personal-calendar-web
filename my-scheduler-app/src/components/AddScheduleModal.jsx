import { useRef, useEffect } from "react";
import { format } from "date-fns";
import { CATEGORY_COLORS } from "../constants";
import { formatTimeInput } from "../utils/timeUtils";
import MiniCalendar from "./MiniCalendar";

function AddScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormDataChange,
  onDateInputClick,
  showMiniCalendar,
  miniCalendarProps,
}) {
  const modalRef = useRef(null);
  const titleRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 미니 달력이나 년월 선택기 클릭은 예외 처리
      if (
        event.target.closest('.mini-calendar') ||
        event.target.closest('.year-month-picker')
      ) {
        return;
      }
      
      // 모달 외부 클릭 시에만 닫기
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 시간 입력 핸들러들
  const handleStartTimeChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    onFormDataChange({ startTime: formatted });
    
    // 4자리 숫자가 완성되면 자동으로 종료 시간으로 이동
    if (formatted.length === 5 && formatted.includes(':')) {
      endTimeRef.current?.focus();
    }
  };

  const handleEndTimeChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    onFormDataChange({ endTime: formatted });
  };

  // 키보드 네비게이션 핸들러들
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startTimeRef.current?.focus();
    }
  };

  const handleStartTimeKeyDown = (e) => {
    // 백스페이스, 화살표 키, 탭 등은 허용
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      endTimeRef.current?.focus();
      return;
    }
    
    // 숫자와 콜론만 허용
    if (!/[0-9:]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleEndTimeKeyDown = (e) => {
    // 백스페이스, 화살표 키, 탭 등은 허용
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      // 일정 추가 완료
      if (formData.title && formData.selectedDate) {
        modalRef.current?.requestSubmit();
      }
      return;
    }
    
    // 숫자와 콜론만 허용
    if (!/[0-9:]/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form 
        ref={modalRef}
        onSubmit={onSubmit} 
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative"
      >
        <h2 className="text-xl font-bold mb-4">일정 추가</h2>
        
        <div className="mb-3">
          <label className="block mb-1 font-semibold">제목</label>
          <input
            ref={titleRef}
            className="w-full border rounded px-3 py-2"
            value={formData.title}
            onChange={(e) => onFormDataChange({ title: e.target.value })}
            onKeyDown={handleTitleKeyDown}
            placeholder="일정 제목"
            required
          />
        </div>
        
        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-semibold">시작 날짜</label>
            <div 
              className="relative date-input-trigger"
              onClick={onDateInputClick}
              data-date-type="start"
            >
              <input
                type="text"
                value={formData.selectedDate ? format(formData.selectedDate, 'yyyy-MM-dd') : ''}
                readOnly
                className="w-full p-3 border rounded cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                style={{ minHeight: '40px' }}
                placeholder="시작 날짜"
                required
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-semibold">종료 날짜</label>
            <div 
              className="relative date-input-trigger"
              onClick={onDateInputClick}
              data-date-type="end"
            >
              <input
                type="text"
                value={formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : ''}
                readOnly
                className="w-full p-3 border rounded cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                style={{ minHeight: '40px' }}
                placeholder="종료 날짜 (선택사항)"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-semibold">시작 시간</label>
            <input
              ref={startTimeRef}
              type="text"
              className="w-full border rounded px-3 py-3 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              style={{ minHeight: '40px' }}
              value={formData.startTime}
              onChange={handleStartTimeChange}
              onKeyDown={handleStartTimeKeyDown}
              placeholder="00:00"
              maxLength={5}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-semibold">종료 시간</label>
            <input
              ref={endTimeRef}
              type="text"
              className="w-full border rounded px-3 py-3 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              style={{ minHeight: '40px' }}
              value={formData.endTime}
              onChange={handleEndTimeChange}
              onKeyDown={handleEndTimeKeyDown}
              placeholder="00:00"
              maxLength={5}
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label className="block mb-1 font-semibold">색상</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {CATEGORY_COLORS.map((cat) => (
              <button
                type="button"
                key={cat.color}
                className={`w-7 h-7 rounded-full border-2 ${formData.color === cat.color ? "ring-2 ring-blue-400" : ""}`}
                style={{ background: cat.color }}
                onClick={() => onFormDataChange({ color: cat.color })}
                aria-label={cat.name}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-3">
          <label className="block mb-1 font-semibold">메모</label>
          <textarea
            className="w-full border rounded px-3 py-2 resize-none"
            style={{ height: '200px' }}
            value={formData.memo}
            onChange={(e) => onFormDataChange({ memo: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // 일정 추가 완료
                if (modalRef.current) {
                  modalRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }
            }}
            placeholder="메모를 입력하세요..."
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            추가
          </button>
        </div>
        
        {/* 미니 달력 */}
        {showMiniCalendar && (
          <MiniCalendar {...miniCalendarProps} />
        )}
      </form>
    </div>
  );
}

export default AddScheduleModal;
