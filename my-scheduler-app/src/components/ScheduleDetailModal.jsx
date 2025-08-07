import { useRef, useEffect } from "react";
import { CATEGORY_COLORS } from "../constants";
import { formatTimeInput } from "../utils/timeUtils";
import MiniCalendar from "./MiniCalendar";

import { useState } from "react";

function ScheduleDetailModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  selectedSchedule,
  formData,
  onFormDataChange,
  onDateInputClick,
  showMiniCalendar,
  miniCalendarProps,
}) {
  const [errorMsg, setErrorMsg] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    if (errorMsg) {
      setFadeOut(false);
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 500); // 0.5초 후 페이드아웃 시작
      const removeTimer = setTimeout(() => {
        setErrorMsg("");
        setFadeOut(false);
      }, 2500); // 2초 페이드아웃 후 완전 제거
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [errorMsg]);
  const modalRef = useRef(null);
  const titleRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      // 미니 캘린더나 연월 선택기 내부 클릭은 무시
      if (event.target.closest('.mini-calendar') || 
          event.target.closest('.year-month-picker')) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !selectedSchedule) return null;

  // 시간 입력 핸들러들
  const handleStartTimeChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    onFormDataChange({ editStartTime: formatted });
    
    // 4자리 숫자가 완성되면 자동으로 종료 시간으로 이동
    if (formatted.length === 5 && formatted.includes(':')) {
      endTimeRef.current?.focus();
    }
  };

  const handleEndTimeChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    onFormDataChange({ editEndTime: formatted });
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
      // 일정 수정 완료
      const form = modalRef.current?.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
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
      // 일정 수정 완료
      const form = modalRef.current?.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
      return;
    }
    
    // 숫자와 콜론만 허용
    if (!/[0-9:]/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto relative"
      >
        <h2 className="text-lg font-semibold mb-4">일정 상세 정보</h2>
        
        <form onSubmit={e => {
          e.preventDefault();
          setErrorMsg("");
          if (formData.editDate && formData.editEndDate) {
            const start = new Date(formData.editDate);
            const end = new Date(formData.editEndDate);
            if (end < start) {
              setErrorMsg("종료 날짜는 시작 날짜 이후여야 합니다.");
              return;
            }
          }
          onSubmit(e);
        }}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">제목</label>
            <input
              ref={titleRef}
              type="text"
              value={formData.editTitle}
              onChange={e => onFormDataChange({ editTitle: e.target.value })}
              onKeyDown={handleTitleKeyDown}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4 flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">시작 날짜</label>
              <div 
                className="relative date-input-trigger"
                onClick={onDateInputClick}
                data-date-type="start"
              >
                <input
                  type="text"
                  value={formData.editDate}
                  readOnly
                  className="w-full p-3 border rounded cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                  style={{ minHeight: '40px' }}
                  placeholder="시작 날짜"
                  required
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">종료 날짜</label>
              <div 
                className="relative date-input-trigger"
                onClick={onDateInputClick}
                data-date-type="end"
              >
                <input
                  type="text"
                  value={formData.editEndDate || ''}
                  readOnly
                  className="w-full p-3 border rounded cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                  style={{ minHeight: '40px' }}
                  placeholder="종료 날짜 (선택사항)"
                />
                {errorMsg && (
                  <div
                    className={`absolute left-0 right-0 mt-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded shadow p-2 z-10 transition-opacity duration-[2000ms] ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
                    style={{ pointerEvents: 'none' }}
                  >
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">시작 시간</label>
              <input
                ref={startTimeRef}
                type="text"
                value={formData.editStartTime}
                onChange={handleStartTimeChange}
                onKeyDown={handleStartTimeKeyDown}
                className="w-full p-3 border rounded hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                style={{ minHeight: '40px' }}
                placeholder="00:00"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">종료 시간</label>
              <input
                ref={endTimeRef}
                type="text"
                value={formData.editEndTime}
                onChange={handleEndTimeChange}
                onKeyDown={handleEndTimeKeyDown}
                className="w-full p-3 border rounded hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                style={{ minHeight: '40px' }}
                placeholder="00:00"
                maxLength={5}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">색상</label>
            <div className="flex gap-2">
              {CATEGORY_COLORS.map(cat => (
                <button
                  type="button"
                  key={cat.color}
                  className={`w-7 h-7 rounded-full border-2 ${formData.editColor === cat.color ? "ring-2 ring-blue-400" : ""}`}
                  style={{ background: cat.color }}
                  onClick={() => onFormDataChange({ editColor: cat.color })}
                  aria-label={cat.name}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">메모</label>
            <textarea
              value={formData.memo}
              onChange={e => onFormDataChange({ memo: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // 일정 수정 완료
                  const form = modalRef.current?.querySelector('form');
                  if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }
                }
              }}
              className="w-full p-2 border rounded resize-none"
              style={{ height: '200px' }}
              placeholder="메모를 입력하세요..."
            />
          </div>
          
          <div className="flex justify-between gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={onDelete}
            >
              삭제
            </button>
            <div className="flex gap-2">
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
                수정
              </button>
            </div>
          </div>
        </form>
        
        {/* 미니 달력 */}
        {showMiniCalendar && (
          <MiniCalendar {...miniCalendarProps} mode="edit" />
        )}
      </div>
    </div>
  );
}

export default ScheduleDetailModal;
