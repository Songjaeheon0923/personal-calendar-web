import { useState } from "react";
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
  const openSidebar = (date, schedules, expandedEventId = null) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySchedules = schedules
      .filter(schedule => schedule.date === dateStr)
      .sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
    
    setSidebarDate(date);
    setSidebarSchedules(daySchedules);
    setShowSidebar(true);
    
    // 특정 이벤트를 확장하도록 설정
    if (expandedEventId !== null) {
      setExpandedEventIds([expandedEventId]);
    } else {
      setExpandedEventIds([]);
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setExpandedEventIds([]);
  };

  // 일정 카드 확장/축소
  const toggleEventExpansion = (eventId) => {
    setExpandedEventIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  // 미니 달력 열기
  const openMiniCalendar = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMiniCalendarPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setShowMiniCalendar(true);
  };

  // 월 선택 핸들러
  const handleMonthSelect = (year, month) => {
    const newDate = new Date(year, month, 1);
    setCalendarDate(newDate);
    setShowMonthPicker(false);
  };

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
    calendarDate,
    eventContextMenu,
    
    // 상태 업데이트 함수들
    setModalOpen,
    setScheduleDetailOpen,
    setShowMonthPicker,
    setSidebarSchedules,
    setExpandedEventIds,
    setShowMiniCalendar,
    setCalendarDate,
    setEventContextMenu,
    dateCellContextMenu,
    setDateCellContextMenu,
    
    // 액션 함수들
    openSidebar,
    closeSidebar,
    toggleEventExpansion,
    openMiniCalendar,
    handleMonthSelect,
  };
}
