import { useState, useMemo, useRef, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import isSameMonth from "date-fns/isSameMonth";
import isToday from "date-fns/isToday";
import addMonths from "date-fns/addMonths";
import setMonth from "date-fns/setMonth";
import setYear from "date-fns/setYear";
import ko from "date-fns/locale/ko";
import useLocalStorage from "./hooks/useLocalStorage";
import YearMonthPicker from "./components/YearMonthPicker";
import MiniCalendar from "./components/MiniCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "ko": ko,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const CATEGORY_COLORS = [
  { name: "노랑", color: "#ffe066" },
  { name: "분홍", color: "#ff6f91" },
  { name: "초록", color: "#4ecdc4" },
  { name: "파랑", color: "#5fa8d3" },
  { name: "주황", color: "#ffb86b" },
  { name: "보라", color: "#b39ddb" },
  { name: "빨강", color: "#ff595e" },
  { name: "연두", color: "#baffc9" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CustomDateHeader({ label, date, drilldownView, onDrillDown, ...props }) {
  const isCurrentMonth = isSameMonth(date, props.currentDate);
  const isCurrentDay = isToday(date);
  const day = date.getDay();
  let color = "#222";
  let style = {};
  
  if (!isCurrentMonth) {
    // 다음달/전달 날짜 - 배경 제거, 색상만 적용
    color = "#9ca3af";
  } else {
    if (day === 0) color = "#ef4444";
    else if (day === 6) color = "#2563eb";
  }
  
  if (isCurrentDay) {
    // 오늘 날짜도 배경 제거, CSS에서 처리
    style.fontWeight = 700;
    style.fontSize = "1.15rem";
    style.color = "#1d4ed8";
  } else {
    style.fontWeight = 500;
    style.fontSize = "1.05rem";
    style.color = color;
  }
  
  return (
    <div className={`flex justify-end pr-2 pt-2 select-none`} style={style}>
      {label}
    </div>
  );
}

function CustomToolbar({ date, onNavigate, onShowMonthPicker }) {
  const yearMonth = format(date, "yyyy년 M월");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-start px-6 py-4 bg-white">
        <button
          className="text-2xl px-2 py-1 hover:bg-gray-100 rounded"
          onClick={() => onNavigate("PREV")}
          aria-label="이전 달"
          style={{ marginRight: "2rem" }}
        >
          ◀
        </button>
        <button
          className="text-2xl font-bold select-none mx-8"
          style={{ background: "none", color: "#222", border: "none", boxShadow: "none", padding: 0, cursor: "pointer" }}
          onClick={onShowMonthPicker}
        >
          {yearMonth}
        </button>
        <button
          className="text-2xl px-2 py-1 hover:bg-gray-100 rounded"
          onClick={() => onNavigate("NEXT")}
          aria-label="다음 달"
          style={{ marginLeft: "2rem" }}
        >
          ▶
        </button>
      </div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center font-bold text-base bg-white pb-2">
        {WEEKDAYS.map((d, i) => (
          <span
            key={d}
            style={{
              color:
                i === 0
                  ? "#ef4444"
                  : i === 6
                  ? "#2563eb"
                  : "#222",
              opacity: i === 0 || i === 6 ? 0.7 : 1,
              background: "none",
              border: "none",
            }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [schedules, setSchedules] = useLocalStorage("schedules", []);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0].color);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  // 사이드바 상태
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarDate, setSidebarDate] = useState(null);
  const [sidebarSchedules, setSidebarSchedules] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  
  // 모달 ref들
  const addModalRef = useRef(null);
  const detailModalRef = useRef(null);
  
  // 일정 추가 모달 input ref들
  const addTitleRef = useRef(null);
  const addStartTimeRef = useRef(null);
  const addEndTimeRef = useRef(null);
  
  // 일정 수정 모달 input ref들
  const editTitleRef = useRef(null);
  const editStartTimeRef = useRef(null);
  const editEndTimeRef = useRef(null);
  
  // 일정 상세 모달 상태
  const [scheduleDetailOpen, setScheduleDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editColor, setEditColor] = useState(CATEGORY_COLORS[0].color);
  const [memo, setMemo] = useState("");

  // 시간 형식 유효성 검사 및 포맷팅 함수
  const formatTimeInput = (value) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) {
      const hour = parseInt(numbers);
      if (hour > 23) return '23:';
      return numbers;
    }
    if (numbers.length <= 4) {
      const hour = parseInt(numbers.substring(0, 2));
      const minute = parseInt(numbers.substring(2));
      
      if (hour > 23) return '23:';
      if (minute > 59) return numbers.substring(0, 2) + ':59';
      
      return numbers.substring(0, 2) + ':' + numbers.substring(2);
    }
    
    // 4자리 이상인 경우 처음 4자리만 사용
    const hour = parseInt(numbers.substring(0, 2));
    const minute = parseInt(numbers.substring(2, 4));
    
    const validHour = hour > 23 ? 23 : hour;
    const validMinute = minute > 59 ? 59 : minute;
    
    return validHour.toString().padStart(2, '0') + ':' + validMinute.toString().padStart(2, '0');
  };

  const validateTimeFormat = (time) => {
    if (!time) return true;
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };
  
  // URL을 링크로 변환하는 함수
  const renderContentWithLinks = (text) => {
    if (!text) return null;
    
    // URL 패턴 정규식 (http, https, www 포함)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    
    // 텍스트를 줄바꿈으로 분할
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const parts = line.split(urlRegex);
      
      return (
        <div key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
          {parts.map((part, partIndex) => {
            if (urlRegex.test(part)) {
              // URL인 경우 링크로 변환
              const href = part.startsWith('http') ? part : `https://${part}`;
              return (
                <a
                  key={partIndex}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {part}
                </a>
              );
            } else {
              // 일반 텍스트
              return <span key={partIndex}>{part}</span>;
            }
          })}
        </div>
      );
    });
  };
  
  // 외부 클릭시 모달 닫기 기능
  useEffect(() => {
    function handleClickOutside(event) {
      // 일정 추가 모달 외부 클릭 감지
      if (modalOpen && addModalRef.current && !addModalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
      
      // 일정 상세 모달 외부 클릭 감지
      if (scheduleDetailOpen && detailModalRef.current && !detailModalRef.current.contains(event.target)) {
        setScheduleDetailOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalOpen, scheduleDetailOpen]);
  
  // 미니 달력 상태
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [miniCalendarPosition, setMiniCalendarPosition] = useState({ top: 0, left: 0 });

  // react-big-calendar의 event 포맷으로 변환
  const events = useMemo(() =>
    schedules.map((s) => ({
      id: s.id,
      title: s.title,
      start: new Date(s.date + (s.startTime ? 'T' + s.startTime : 'T00:00')),
      end: new Date(s.date + (s.endTime ? 'T' + s.endTime : 'T23:59')),
      color: s.color,
      resource: s, // 원본 일정 정보 포함
    })),
    [schedules]
  );

  // 커스텀 이벤트 스타일
  function eventStyleGetter(event) {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "6px",
        color: "#fff",
        border: "none",
        padding: "2px 8px",
        fontWeight: 600,
        fontSize: "0.95em",
        opacity: 0.95,
      },
    };
  }

  // 일정 클릭 핸들러
  function handleEventSelect(event) {
    const schedule = event.resource;
    setSelectedSchedule(schedule);
    setEditTitle(schedule.title);
    setEditDate(schedule.date);
    setEditStartTime(schedule.startTime || "");
    setEditEndTime(schedule.endTime || "");
    setEditColor(schedule.color);
    setMemo(schedule.memo || "");
    setScheduleDetailOpen(true);
  }

  // 일정 업데이트 함수
  function handleUpdateSchedule(e) {
    e.preventDefault();
    if (!editTitle || !editDate || !selectedSchedule) return;
    
    const updatedSchedules = schedules.map(schedule => 
      schedule.id === selectedSchedule.id 
        ? { 
            ...schedule, 
            title: editTitle,
            date: editDate,
            startTime: editStartTime,
            endTime: editEndTime,
            color: editColor,
            memo: memo
          }
        : schedule
    );
    setSchedules(updatedSchedules);
    setScheduleDetailOpen(false);
    
    // 사이드바가 열려있고 현재 날짜의 일정이면 사이드바 업데이트
    if (showSidebar && sidebarDate) {
      const dateStr = format(sidebarDate, 'yyyy-MM-dd');
      const updatedSidebarSchedules = updatedSchedules
        .filter(schedule => schedule.date === dateStr)
        .sort((a, b) => {
          if (!a.startTime && !b.startTime) return 0;
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        });
      setSidebarSchedules(updatedSidebarSchedules);
    }
  }

  // 일정 삭제 함수
  function handleDeleteSchedule() {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== selectedSchedule.id);
    setSchedules(updatedSchedules);
    setScheduleDetailOpen(false);
    
    // 사이드바가 열려있고 현재 날짜의 일정이면 사이드바 업데이트
    if (showSidebar && sidebarDate) {
      const dateStr = format(sidebarDate, 'yyyy-MM-dd');
      const updatedSidebarSchedules = updatedSchedules
        .filter(schedule => schedule.date === dateStr)
        .sort((a, b) => {
          if (!a.startTime && !b.startTime) return 0;
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        });
      setSidebarSchedules(updatedSidebarSchedules);
    }
  }

  // 미니 달력 열기
  function handleDateInputClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMiniCalendarPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setShowMiniCalendar(true);
  }

  // 미니 달력에서 날짜 선택
  function handleMiniCalendarDateSelect(dateString) {
    if (modalOpen) {
      // 일정 추가 모달이 열려있을 때
      setSelectedDate(new Date(dateString));
    } else if (scheduleDetailOpen) {
      // 일정 상세 모달이 열려있을 때
      setEditDate(dateString);
    }
    setShowMiniCalendar(false);
  }

  // 시간 입력 핸들러들
  const handleStartTimeChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    setEditStartTime(formatted);
    
    // 4자리 숫자가 완성되면 자동으로 종료 시간으로 이동
    if (formatted.length === 5 && formatted.includes(':')) {
      editEndTimeRef.current?.focus();
    }
  };

  const handleEndTimeChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    setEditEndTime(formatted);
  };

  // 일정 수정 모달 키보드 네비게이션 핸들러들
  const handleEditTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editStartTimeRef.current?.focus();
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
      const form = detailModalRef.current?.querySelector('form');
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
      const form = detailModalRef.current?.querySelector('form');
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

  // 일정 추가 모달의 시간 입력 핸들러들
  const handleAddStartTimeChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    setStartTime(formatted);
    
    // 4자리 숫자가 완성되면 자동으로 종료 시간으로 이동
    if (formatted.length === 5 && formatted.includes(':')) {
      addEndTimeRef.current?.focus();
    }
  };

  const handleAddEndTimeChange = (e) => {
    const formatted = formatTimeInput(e.target.value);
    setEndTime(formatted);
  };

  // 일정 추가 모달 키보드 네비게이션 핸들러들
  const handleAddTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStartTimeRef.current?.focus();
    }
  };

  const handleAddStartTimeKeyDown = (e) => {
    // 백스페이스, 화살표 키, 탭 등은 허용
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      // 일정 추가 완료
      const form = addModalRef.current;
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

  const handleAddEndTimeKeyDown = (e) => {
    // 백스페이스, 화살표 키, 탭 등은 허용
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      // 일정 추가 완료
      const form = addModalRef.current;
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

  // 날짜 셀 클릭 시 사이드바 오픈
  function handleSelectSlot(slotInfo) {
    const clickedDate = slotInfo.start;
    const dateStr = format(clickedDate, 'yyyy-MM-dd');
    
    // 해당 날짜의 일정들 필터링 및 시작 시간 순으로 정렬
    const daySchedules = schedules
      .filter(schedule => schedule.date === dateStr)
      .sort((a, b) => {
        // 시작 시간이 없는 경우 맨 뒤로
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        
        // 시작 시간으로 정렬
        return a.startTime.localeCompare(b.startTime);
      });
    
    setSidebarDate(clickedDate);
    setSidebarSchedules(daySchedules);
    setShowSidebar(true);
    setExpandedEventId(null); // 확장된 이벤트 초기화
  }

  // 일정 추가
  function handleAddSchedule(e) {
    e.preventDefault();
    if (!title || !selectedDate) return;
    
    const newSchedule = {
      id: Date.now(),
      title,
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime,
      endTime,
      color,
      memo,
    };
    
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    setModalOpen(false);
    setTitle("");
    setStartTime("");
    setEndTime("");
    setMemo("");
    
    // 사이드바가 열려있고 추가된 일정의 날짜와 같으면 사이드바 업데이트
    if (showSidebar && sidebarDate) {
      const sidebarDateStr = format(sidebarDate, 'yyyy-MM-dd');
      const newScheduleDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      if (sidebarDateStr === newScheduleDateStr) {
        const updatedSidebarSchedules = updatedSchedules
          .filter(schedule => schedule.date === sidebarDateStr)
          .sort((a, b) => {
            if (!a.startTime && !b.startTime) return 0;
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
          });
        setSidebarSchedules(updatedSidebarSchedules);
      }
    }
  }

  // 달력 네비게이션
  function handleNavigate(action) {
    if (action === "PREV") setCalendarDate(prev => addMonths(prev, -1));
    else if (action === "NEXT") setCalendarDate(prev => addMonths(prev, 1));
  }

  // 월/년 선택 핸들러
  function handleMonthSelect(year, month) {
    setCalendarDate(new Date(year, month - 1, 1));
    setShowMonthPicker(false);
  }


  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col">
      <header className="py-4 px-8 bg-white shadow flex-none flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">맞춤 일정 관리 웹</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          onClick={() => {
            setSelectedDate(new Date());
            setTitle("");
            setStartTime("");
            setEndTime("");
            setColor(CATEGORY_COLORS[0].color);
            setMemo("");
            setModalOpen(true);
          }}
        >
          + 새 일정 추가
        </button>
      </header>
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 p-2 md:p-8">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleEventSelect}
            style={{ height: "100%", minHeight: 600, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001" }}
            views={["month"]}
            defaultView="month"
            date={calendarDate}
            onNavigate={date => setCalendarDate(date)}
            popup
            eventPropGetter={eventStyleGetter}
            components={{
              month: {
                dateHeader: (props) => <CustomDateHeader {...props} currentDate={localizer.startOf(calendarDate, 'month')} />,
              },
              toolbar: (toolbarProps) => (
                <CustomToolbar
                  {...toolbarProps}
                  onNavigate={handleNavigate}
                  onShowMonthPicker={() => setShowMonthPicker(true)}
                />
              ),
            }}
            messages={{
              next: "다음",
              previous: "이전",
              today: "오늘",
              month: "월",
              week: "주",
              day: "일",
              agenda: "목록",
              date: "날짜",
              time: "시간",
              event: "일정",
              noEventsInRange: "일정이 없습니다.",
            }}
            culture="ko"
          />
        </div>
        
        {/* 사이드바 */}
        <div className={`fixed top-0 right-0 h-full w-1/3 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            {/* 사이드바 헤더 */}
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {sidebarDate && format(sidebarDate, 'yyyy년 M월 d일', { locale: ko })}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      총 {sidebarSchedules.length}개의 일정
                    </p>
                  </div>
                  <button
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
                    onClick={() => {
                      setSelectedDate(sidebarDate);
                      setTitle("");
                      setStartTime("");
                      setEndTime("");
                      setColor(CATEGORY_COLORS[0].color);
                      setMemo("");
                      setModalOpen(true);
                      setShowSidebar(false);
                    }}
                  >
                    <span className="text-sm">+</span>
                    추가
                  </button>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  onClick={() => {
                    setShowSidebar(false);
                    setExpandedEventId(null);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* 사이드바 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              {sidebarSchedules.length > 0 ? (
                <div className="space-y-4">
                  {sidebarSchedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white rounded-lg shadow-sm border">
                      <div
                        className="p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        style={{ 
                          borderLeftColor: schedule.color,
                          backgroundColor: schedule.color + '10'
                        }}
                        onClick={() => {
                          setExpandedEventId(expandedEventId === schedule.id ? null : schedule.id);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <h3 className="font-semibold text-gray-800 text-lg">
                                {schedule.title}
                              </h3>
                              <span className="text-sm text-gray-600">
                                {schedule.startTime || '시간미정'} ~ {schedule.endTime || '시간미정'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: schedule.color }}
                            ></div>
                            <span className={`text-gray-400 transition-transform duration-200 ${
                              expandedEventId === schedule.id ? 'rotate-180' : ''
                            }`}>
                              ▼
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 확장된 상세 정보 */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedEventId === schedule.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                          <div className="pt-4">
                            {schedule.memo && (
                              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                {/* 메모지 상단 장식 */}
                                <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 border-b border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-red-300 opacity-60"></div>
                                      <div className="w-2 h-2 rounded-full bg-yellow-300 opacity-60"></div>
                                      <div className="w-2 h-2 rounded-full bg-green-300 opacity-60"></div>
                                    </div>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: schedule.color, opacity: 0.7 }}></div>
                                  </div>
                                  {/* 종이 구멍 효과 */}
                                  <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around py-1">
                                    <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                    <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                    <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                  </div>
                                </div>
                                
                                {/* 메모 내용 */}
                                <div className="p-4 bg-white">
                                  <div className="text-gray-800 leading-7 font-medium" style={{ 
                                    fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                                    fontSize: '14px',
                                    lineHeight: '1.6'
                                  }}>
                                    {renderContentWithLinks(schedule.memo)}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {!schedule.memo && (
                              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                {/* 메모지 상단 장식 */}
                                <div className="relative bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-2 border-b border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-gray-300 opacity-60"></div>
                                      <div className="w-2 h-2 rounded-full bg-gray-300 opacity-60"></div>
                                      <div className="w-2 h-2 rounded-full bg-gray-300 opacity-60"></div>
                                    </div>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: schedule.color, opacity: 0.7 }}></div>
                                  </div>
                                  {/* 종이 구멍 효과 */}
                                  <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around py-1">
                                    <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                    <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                    <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                  </div>
                                </div>
                                
                                {/* 빈 메모 내용 */}
                                <div className="p-6">
                                  <div className="flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-gray-400 text-lg">📝</span>
                                      </div>
                                      <p className="text-sm text-gray-500 font-medium">메모가 없습니다</p>
                                      <p className="text-xs text-gray-400 mt-1">수정에서 내용을 추가해보세요</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2 pt-2">
                              <button
                                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSchedule(schedule);
                                  setEditTitle(schedule.title);
                                  setEditDate(schedule.date);
                                  setEditStartTime(schedule.startTime || '');
                                  setEditEndTime(schedule.endTime || '');
                                  setEditColor(schedule.color);
                                  setMemo(schedule.memo || '');
                                  setScheduleDetailOpen(true);
                                }}
                              >
                                ✏️ 수정
                              </button>
                              <button
                                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('정말 이 일정을 삭제하시겠습니까?')) {
                                    setSchedules(schedules.filter(s => s.id !== schedule.id));
                                    setExpandedEventId(null);
                                    // 삭제 후 사이드바 일정 목록 업데이트 (시간순 정렬)
                                    const updatedSchedules = schedules.filter(s => s.id !== schedule.id);
                                    const dateStr = format(sidebarDate, 'yyyy-MM-dd');
                                    const sortedSchedules = updatedSchedules
                                      .filter(s => s.date === dateStr)
                                      .sort((a, b) => {
                                        if (!a.startTime && !b.startTime) return 0;
                                        if (!a.startTime) return 1;
                                        if (!b.startTime) return -1;
                                        return a.startTime.localeCompare(b.startTime);
                                      });
                                    setSidebarSchedules(sortedSchedules);
                                  }
                                }}
                              >
                                �️ 삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-12">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-lg">이 날에는 일정이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 사이드바 오버레이 */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-30"
            onClick={() => {
              setShowSidebar(false);
              setExpandedEventId(null);
            }}
          ></div>
        )}
        
        {/* 월/년 선택 모달 */}
        {showMonthPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <YearMonthPicker
              initialYear={calendarDate.getFullYear()}
              onSelectMonth={handleMonthSelect}
              onClose={() => setShowMonthPicker(false)}
            />
          </div>
        )}

        {/* 일정 추가 모달 */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form 
              ref={addModalRef}
              onSubmit={handleAddSchedule} 
              className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">일정 추가</h2>
              <div className="mb-3">
                <label className="block mb-1 font-semibold">제목</label>
                <input
                  ref={addTitleRef}
                  className="w-full border rounded px-3 py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleAddTitleKeyDown}
                  placeholder="일정 제목"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-semibold">날짜</label>
                <div 
                  className="relative"
                  onClick={handleDateInputClick}
                >
                  <input
                    type="text"
                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                    readOnly
                    className="w-full p-3 border rounded cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                    style={{ minHeight: '40px' }}
                    placeholder="날짜를 선택하세요"
                    required
                  />
                </div>
              </div>
              <div className="mb-3 flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold">시작 시간</label>
                  <input
                    ref={addStartTimeRef}
                    type="text"
                    className="w-full border rounded px-3 py-3 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    style={{ minHeight: '40px' }}
                    value={startTime}
                    onChange={handleAddStartTimeChange}
                    onKeyDown={handleAddStartTimeKeyDown}
                    placeholder="00:00"
                    maxLength={5}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold">종료 시간</label>
                  <input
                    ref={addEndTimeRef}
                    type="text"
                    className="w-full border rounded px-3 py-3 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    style={{ minHeight: '40px' }}
                    value={endTime}
                    onChange={handleAddEndTimeChange}
                    onKeyDown={handleAddEndTimeKeyDown}
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
                      className={`w-7 h-7 rounded-full border-2 ${color === cat.color ? "ring-2 ring-blue-400" : ""}`}
                      style={{ background: cat.color }}
                      onClick={() => setColor(cat.color)}
                      aria-label={cat.name}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-semibold">메모</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-20 resize-none"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 입력하세요..."
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setModalOpen(false)}
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
            </form>
          </div>
        )}

        {/* 일정 상세 모달 */}
        {scheduleDetailOpen && selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
              ref={detailModalRef}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto"
            >
              <h2 className="text-lg font-semibold mb-4">일정 상세 정보</h2>
              <form onSubmit={handleUpdateSchedule}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">제목</label>
                  <input
                    ref={editTitleRef}
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={handleEditTitleKeyDown}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">날짜</label>
                  <div 
                    className="relative"
                    onClick={handleDateInputClick}
                  >
                    <input
                      type="text"
                      value={editDate}
                      readOnly
                      className="w-full p-3 border rounded cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                      style={{ minHeight: '40px' }}
                      placeholder="날짜를 선택하세요"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">시작 시간</label>
                    <input
                      ref={editStartTimeRef}
                      type="text"
                      value={editStartTime}
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
                      ref={editEndTimeRef}
                      type="text"
                      value={editEndTime}
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
                        className={`w-7 h-7 rounded-full border-2 ${editColor === cat.color ? "ring-2 ring-blue-400" : ""}`}
                        style={{ background: cat.color }}
                        onClick={() => setEditColor(cat.color)}
                        aria-label={cat.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">메모</label>
                  <textarea
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    className="w-full p-2 border rounded h-20 resize-none"
                    placeholder="메모를 입력하세요..."
                  />
                </div>
                <div className="flex justify-between gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                    onClick={handleDeleteSchedule}
                  >
                    삭제
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setScheduleDetailOpen(false)}
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
            </div>
          </div>
        )}

        {/* 미니 달력 */}
        {showMiniCalendar && (
          <MiniCalendar
            selectedDate={modalOpen ? (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '') : editDate}
            onDateSelect={handleMiniCalendarDateSelect}
            onClose={() => setShowMiniCalendar(false)}
            position={miniCalendarPosition}
          />
        )}
      </main>
    </div>
  );
}

export default App;
