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
import CalendarDateHeader from "./components/CalendarDateHeader";
import CalendarToolbar from "./components/CalendarToolbar";
import AddScheduleModal from "./components/AddScheduleModal";
import ScheduleDetailModal from "./components/ScheduleDetailModal";
import { CATEGORY_COLORS, WEEKDAYS } from "./constants";
import { formatTimeInput, validateTimeFormat } from "./utils/timeUtils";
import { renderContentWithLinks } from "./utils/textUtils";
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
  const [expandedEventIds, setExpandedEventIds] = useState([]);
  
  // 일정 상세 모달 상태
  const [scheduleDetailOpen, setScheduleDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editColor, setEditColor] = useState(CATEGORY_COLORS[0].color);
  const [memo, setMemo] = useState("");

  // 외부 클릭시 모달 닫기 기능은 각 모달 컴포넌트 내부에서 처리
  
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
    setExpandedEventIds([]); // 확장된 이벤트 초기화
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
                dateHeader: (props) => <CalendarDateHeader {...props} currentDate={localizer.startOf(calendarDate, 'month')} />,
              },
              toolbar: (toolbarProps) => (
                <CalendarToolbar
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
                      // setShowSidebar(false); // 사이드바를 닫지 않도록 주석 처리
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
                    setExpandedEventIds([]);
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
                          if (expandedEventIds.includes(schedule.id)) {
                            // 이미 확장된 경우 제거
                            setExpandedEventIds(expandedEventIds.filter(id => id !== schedule.id));
                          } else {
                            // 확장되지 않은 경우 추가
                            setExpandedEventIds([...expandedEventIds, schedule.id]);
                          }
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
                              expandedEventIds.includes(schedule.id) ? 'rotate-180' : ''
                            }`}>
                              ▼
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 확장된 상세 정보 */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedEventIds.includes(schedule.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
                                <div className="p-4 bg-white mb-8">
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
                                  setSchedules(schedules.filter(s => s.id !== schedule.id));
                                  setExpandedEventIds(expandedEventIds.filter(id => id !== schedule.id));
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
              setExpandedEventIds([]);
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
        <AddScheduleModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddSchedule}
          formData={{
            title,
            selectedDate,
            startTime,
            endTime,
            color,
            memo
          }}
          onFormDataChange={(updates) => {
            if (updates.title !== undefined) setTitle(updates.title);
            if (updates.selectedDate !== undefined) setSelectedDate(updates.selectedDate);
            if (updates.startTime !== undefined) setStartTime(updates.startTime);
            if (updates.endTime !== undefined) setEndTime(updates.endTime);
            if (updates.color !== undefined) setColor(updates.color);
            if (updates.memo !== undefined) setMemo(updates.memo);
          }}
          onDateInputClick={handleDateInputClick}
        />

        {/* 일정 상세 모달 */}
        <ScheduleDetailModal 
          isOpen={scheduleDetailOpen}
          selectedSchedule={selectedSchedule}
          onClose={() => setScheduleDetailOpen(false)}
          onSubmit={handleUpdateSchedule}
          onDelete={handleDeleteSchedule}
          formData={{
            editTitle,
            editDate,
            editStartTime,
            editEndTime,
            editColor,
            memo
          }}
          onFormDataChange={(updates) => {
            if (updates.editTitle !== undefined) setEditTitle(updates.editTitle);
            if (updates.editDate !== undefined) setEditDate(updates.editDate);
            if (updates.editStartTime !== undefined) setEditStartTime(updates.editStartTime);
            if (updates.editEndTime !== undefined) setEditEndTime(updates.editEndTime);
            if (updates.editColor !== undefined) setEditColor(updates.editColor);
            if (updates.memo !== undefined) setMemo(updates.memo);
          }}
          onDateInputClick={handleDateInputClick}
        />

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
