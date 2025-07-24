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
  const [miniCalendarTriggerElement, setMiniCalendarTriggerElement] = useState(null); // 트리거 요소 추적
  const [miniCalendarDateType, setMiniCalendarDateType] = useState('start'); // 현재 선택하는 날짜 타입
  
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

  // 미니 달력 열기/닫기 토글
  const openMiniCalendar = (e) => {
    // 이미 열려있고 같은 버튼을 클릭한 경우 닫기
    if (showMiniCalendar && miniCalendarTriggerElement === e.currentTarget) {
      setShowMiniCalendar(false);
      setMiniCalendarTriggerElement(null);
      return;
    }

    // 날짜 타입 확인 (start 또는 end)
    const dateType = e.currentTarget.getAttribute('data-date-type') || 'start';
    setMiniCalendarDateType(dateType);

    // 클릭된 날짜 입력 필드의 위치를 기준으로 미니 달력 배치
    const rect = e.currentTarget.getBoundingClientRect();
    const modalContainer = e.currentTarget.closest('form') || e.currentTarget.closest('[data-modal]');
    
    if (modalContainer) {
      const modalRect = modalContainer.getBoundingClientRect();
      
      // 모달 내에서의 상대적 위치 계산
      const relativeTop = rect.bottom - modalRect.top + 8; // 입력 필드 아래 8px
      const relativeLeft = rect.left - modalRect.left;
      
      // 미니 달력 크기
      const calendarWidth = 288; // w-72 = 18rem = 288px
      const calendarHeight = 400; // 대략적인 높이
      
      let finalTop = relativeTop;
      let finalLeft = relativeLeft;
      
      // 모달 오른쪽 경계 체크
      if (relativeLeft + calendarWidth > modalRect.width) {
        finalLeft = modalRect.width - calendarWidth - 16; // 16px 여백
      }
      
      // 모달 아래쪽 경계 체크
      if (relativeTop + calendarHeight > modalRect.height) {
        // 입력 필드 위쪽에 배치
        finalTop = (rect.top - modalRect.top) - calendarHeight - 8;
      }
      
      // 최소 여백 보장
      if (finalLeft < 16) finalLeft = 16;
      if (finalTop < 16) finalTop = 16;
      
      setMiniCalendarPosition({
        top: `${finalTop}px`,
        left: `${finalLeft}px`,
        transform: 'none'
      });
    } else {
      // fallback: 화면 중앙
      setMiniCalendarPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
    }
    
    setMiniCalendarTriggerElement(e.currentTarget); // 트리거 요소 저장
    setShowMiniCalendar(true);
  };

  // 월 선택 핸들러
  const handleMonthSelect = (year, month) => {
    // month는 1부터 시작하는 값이므로 (1=1월, 2=2월, ..., 12=12월)
    // Date 생성자는 0부터 시작하므로 1을 빼야 함
    const newDate = new Date(year, month - 1, 1);
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
    miniCalendarDateType, // 날짜 타입 추가
    calendarDate,
    eventContextMenu,
    
    // 상태 업데이트 함수들
    setModalOpen,
    setScheduleDetailOpen,
    setShowMonthPicker,
    setSidebarSchedules,
    setExpandedEventIds,
    setShowMiniCalendar: (value) => {
      setShowMiniCalendar(value);
      if (!value) {
        setMiniCalendarTriggerElement(null); // 닫힐 때 트리거 요소 초기화
      }
    },
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
