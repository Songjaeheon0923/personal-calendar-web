import { useState, useCallback } from "react";
import { format } from "date-fns";

export function useUI() {
  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleDetailOpen, setScheduleDetailOpen] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  // 사이드바 상태
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarDate, setSidebarDate] = useState(null);
  const [sidebarSchedules, setSidebarSchedules] = useState([]);
  const [expandedEventIds, setExpandedEventIds] = useState([]);
  
  // 미니 달력 상태
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [miniCalendarPosition, setMiniCalendarPosition] = useState({ top: 0, left: 0 });
  const [miniCalendarTriggerElement, setMiniCalendarTriggerElement] = useState(null);
  const [miniCalendarDateType, setMiniCalendarDateType] = useState('start');
  
  // 캘린더 날짜 상태
  const [calendarDate, setCalendarDate] = useState(new Date());

  // 이벤트 컨텍스트 메뉴 상태
  const [eventContextMenu, setEventContextMenu] = useState({ 
    show: false, 
    x: 0, 
    y: 0, 
    event: null 
  });

  // 날짜 셀 컨텍스트 메뉴 상태
  const [dateCellContextMenu, setDateCellContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    date: null
  });

  // 사이드바 열기/닫기
  const openSidebar = useCallback((date, schedules, expandedEventId = null) => {
    if (!date) {
      console.warn('Date is required to open sidebar');
      return;
    }
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const daySchedules = Array.isArray(schedules) ? schedules
        .filter(schedule => {
          try {
            const start = new Date(schedule.date);
            const end = schedule.endDate ? new Date(schedule.endDate) : start;
            const target = new Date(dateStr);
            return target >= start && target <= end;
          } catch (error) {
            console.error('Error filtering schedule in openSidebar:', schedule, error);
            return false;
          }
        })
        .sort((a, b) => {
          if (!a.startTime && !b.startTime) return 0;
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        }) : [];
      
      setSidebarDate(date);
      setSidebarSchedules(daySchedules);
      setShowSidebar(true);
      
      // 특정 이벤트를 확장하도록 설정
      if (expandedEventId !== null) {
        setExpandedEventIds([expandedEventId]);
      } else {
        setExpandedEventIds([]);
      }
    } catch (error) {
      console.error('Error opening sidebar:', error);
    }
  }, []);

  const closeSidebar = useCallback(() => {
    setShowSidebar(false);
    setExpandedEventIds([]);
  }, []);

  // 일정 카드 확장/축소
  const toggleEventExpansion = useCallback((eventId) => {
    if (!eventId) {
      console.warn('Event ID is required for expansion');
      return;
    }
    
    setExpandedEventIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  }, []);

  // 미니 달력 위치 계산 헬퍼
  const calculateMiniCalendarPosition = useCallback((element, modalContainer) => {
    if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    try {
      const rect = element.getBoundingClientRect();
      
      if (modalContainer) {
        const modalRect = modalContainer.getBoundingClientRect();
        const relativeTop = rect.bottom - modalRect.top + 8;
        const relativeLeft = rect.left - modalRect.left;
        
        const calendarWidth = 288;
        const calendarHeight = 400;
        
        let finalTop = relativeTop;
        let finalLeft = relativeLeft;
        
        // 모달 경계 체크
        if (relativeLeft + calendarWidth > modalRect.width) {
          finalLeft = modalRect.width - calendarWidth - 16;
        }
        
        if (relativeTop + calendarHeight > modalRect.height) {
          finalTop = (rect.top - modalRect.top) - calendarHeight - 8;
        }
        
        if (finalLeft < 16) finalLeft = 16;
        if (finalTop < 16) finalTop = 16;
        
        return {
          top: `${finalTop}px`,
          left: `${finalLeft}px`,
          transform: 'none'
        };
      } else {
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
      }
    } catch (error) {
      console.error('Error calculating mini calendar position:', error);
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  }, []);

  // 미니 달력 열기/닫기 토글
  const openMiniCalendar = useCallback((e) => {
    if (!e?.currentTarget) {
      console.warn('Event target is required for mini calendar');
      return;
    }
    
    try {
      // 이미 열려있고 같은 버튼을 클릭한 경우 닫기
      if (showMiniCalendar && miniCalendarTriggerElement === e.currentTarget) {
        setShowMiniCalendar(false);
        setMiniCalendarTriggerElement(null);
        return;
      }

      // 날짜 타입 확인 (start 또는 end)
      const dateType = e.currentTarget.getAttribute('data-date-type') || 'start';
      setMiniCalendarDateType(dateType);

      // 위치 계산
      const modalContainer = e.currentTarget.closest('form') || e.currentTarget.closest('[data-modal]');
      const position = calculateMiniCalendarPosition(e.currentTarget, modalContainer);
      
      setMiniCalendarPosition(position);
      setMiniCalendarTriggerElement(e.currentTarget);
      setShowMiniCalendar(true);
    } catch (error) {
      console.error('Error opening mini calendar:', error);
    }
  }, [showMiniCalendar, miniCalendarTriggerElement, calculateMiniCalendarPosition]);

  // 미니 달력 닫기
  const closeMiniCalendar = useCallback(() => {
    setShowMiniCalendar(false);
    setMiniCalendarTriggerElement(null);
  }, []);

  // 월 선택 핸들러
  const handleMonthSelect = useCallback((year, month) => {
    try {
      const newDate = new Date(year, month - 1, 1);
      setCalendarDate(newDate);
      setShowMonthPicker(false);
    } catch (error) {
      console.error('Error selecting month:', error);
    }
  }, []);

  // 컨텍스트 메뉴 닫기 헬퍼
  const closeEventContextMenu = useCallback(() => {
    setEventContextMenu({ show: false, x: 0, y: 0, event: null });
  }, []);

  const closeDateCellContextMenu = useCallback(() => {
    setDateCellContextMenu({ show: false, x: 0, y: 0, date: null });
  }, []);

  return {
    // 상태
    modalOpen,
    scheduleDetailOpen,
    showMonthPicker,
    showSidebar,
    sidebarDate,
    sidebarSchedules,
    expandedEventIds,
    showMiniCalendar,
    miniCalendarPosition,
    miniCalendarDateType,
    calendarDate,
    eventContextMenu,
    dateCellContextMenu,
    
    // 상태 업데이트 함수들
    setModalOpen,
    setScheduleDetailOpen,
    setShowMonthPicker,
    setSidebarSchedules,
    setExpandedEventIds,
    setShowMiniCalendar: closeMiniCalendar,
    setCalendarDate,
    setEventContextMenu,
    setDateCellContextMenu,
    
    // 액션 함수들
    openSidebar,
    closeSidebar,
    toggleEventExpansion,
    openMiniCalendar,
    closeMiniCalendar,
    handleMonthSelect,
    closeEventContextMenu,
    closeDateCellContextMenu,
  };
}