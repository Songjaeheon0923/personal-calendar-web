import { useRef, useEffect } from "react";
import { format } from "date-fns";
import { CATEGORY_COLORS } from "../constants";
import { formatTimeInput } from "../utils/timeUtils";
import MiniCalendar from "./MiniCalendar";

import { useState } from "react";

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
  const [fadeOut, setFadeOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const modalRef = useRef(null);
  const titleRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
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

  // 모달이 열렸을 때 제목 입력란에 자동 포커스
  useEffect(() => {
    if (isOpen && titleRef.current) {
      // 약간의 지연을 두어 모달 애니메이션이 완료된 후 포커스
      const timer = setTimeout(() => {
        titleRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
        onSubmit={(e) => {
          e.preventDefault();
          setErrorMsg("");
          if (formData.selectedDate && formData.endDate) {
            const start = new Date(format(formData.selectedDate, "yyyy-MM-dd"));
            const end = new Date(format(formData.endDate, "yyyy-MM-dd"));
            if (end < start) {
              setErrorMsg("종료 날짜는 시작 날짜 이후여야 합니다.");
              return;
            }
          }
          onSubmit(e);
        }}
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
