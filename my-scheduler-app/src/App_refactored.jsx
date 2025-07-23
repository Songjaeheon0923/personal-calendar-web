import { dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ko from "date-fns/locale/ko";

import { useSchedule } from "./hooks/useSchedule";
import { useUI } from "./hooks/useUI";
import Calendar from "./components/Calendar";
import Sidebar from "./components/Sidebar";
import YearMonthPicker from "./components/YearMonthPicker";
import MiniCalendar from "./components/MiniCalendar";
import AddScheduleModal from "./components/AddScheduleModal";
import ScheduleDetailModal from "./components/ScheduleDetailModal";
import { CATEGORY_COLORS } from "./constants";
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
  // 커스텀 훅 사용
  const schedule = useSchedule();
  const ui = useUI();

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

  // 날짜 셀 클릭 시 사이드바 오픈
  const handleSelectSlot = (slotInfo) => {
    ui.openSidebar(slotInfo.start, schedule.schedules);
  };

  // 일정 클릭 핸들러
  const handleEventSelect = (event) => {
    const scheduleData = event.resource;
    schedule.selectScheduleForEdit(scheduleData);
    ui.setScheduleDetailOpen(true);
  };

  // 미니 달력에서 날짜 선택
  const handleMiniCalendarDateSelect = (dateString) => {
    if (ui.modalOpen) {
      schedule.setSelectedDate(new Date(dateString));
    } else if (ui.scheduleDetailOpen) {
      schedule.setEditDate(dateString);
    }
    ui.setShowMiniCalendar(false);
  };

  // 일정 추가 핸들러
  const handleAddSchedule = (e) => {
    const addScheduleFn = schedule.addSchedule(ui.sidebarDate, ui.setSidebarSchedules, ui.showSidebar);
    addScheduleFn(e);
    ui.setModalOpen(false);
  };

  // 일정 수정 핸들러
  const handleUpdateSchedule = (e) => {
    const updateScheduleFn = schedule.updateSchedule(ui.sidebarDate, ui.setSidebarSchedules, ui.showSidebar);
    updateScheduleFn(e);
    ui.setScheduleDetailOpen(false);
  };

  // 일정 삭제 핸들러 (Sidebar에서 사용)
  const handleDeleteFromSidebar = (scheduleId) => {
    const deleteScheduleFn = schedule.deleteSchedule(
      ui.sidebarDate, 
      ui.setSidebarSchedules, 
      ui.showSidebar, 
      ui.setExpandedEventIds, 
      ui.expandedEventIds
    );
    deleteScheduleFn(scheduleId);
  };

  // 일정 삭제 핸들러 (Modal에서 사용)
  const handleDeleteSchedule = () => {
    const deleteScheduleFn = schedule.deleteSchedule(
      ui.sidebarDate, 
      ui.setSidebarSchedules, 
      ui.showSidebar, 
      ui.setExpandedEventIds, 
      ui.expandedEventIds
    );
    deleteScheduleFn(schedule.selectedSchedule.id);
    ui.setScheduleDetailOpen(false);
  };

  // 사이드바에서 일정 수정 버튼 클릭
  const handleEditFromSidebar = (scheduleData) => {
    schedule.selectScheduleForEdit(scheduleData);
    ui.setScheduleDetailOpen(true);
  };

  // 새 일정 추가 버튼 클릭
  const handleOpenAddModal = () => {
    schedule.setSelectedDate(new Date());
    schedule.setTitle("");
    schedule.setStartTime("");
    schedule.setEndTime("");
    schedule.setColor(CATEGORY_COLORS[0].color);
    schedule.setMemo("");
    ui.setModalOpen(true);
  };

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col">
      <header className="py-4 px-8 bg-white shadow flex-none flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">맞춤 일정 관리 웹</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          onClick={handleOpenAddModal}
        >
          + 새 일정 추가
        </button>
      </header>

      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        {/* 캘린더 */}
        <Calendar
          localizer={localizer}
          events={schedule.events}
          calendarDate={ui.calendarDate}
          onDateChange={ui.setCalendarDate}
          onSelectSlot={handleSelectSlot}
          onEventSelect={handleEventSelect}
          onOpenMonthPicker={() => ui.setShowMonthPicker(true)}
          onAddSchedule={handleOpenAddModal}
          eventStyleGetter={eventStyleGetter}
        />

        {/* 사이드바 */}
        <Sidebar
          showSidebar={ui.showSidebar}
          sidebarDate={ui.sidebarDate}
          sidebarSchedules={ui.sidebarSchedules}
          expandedEventIds={ui.expandedEventIds}
          onClose={ui.closeSidebar}
          onToggleExpand={ui.toggleEventExpansion}
          onEditSchedule={handleEditFromSidebar}
          onDeleteSchedule={handleDeleteFromSidebar}
        />

        {/* 월/년 선택 모달 */}
        {ui.showMonthPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <YearMonthPicker
              initialYear={ui.calendarDate.getFullYear()}
              onSelectMonth={ui.handleMonthSelect}
              onClose={() => ui.setShowMonthPicker(false)}
            />
          </div>
        )}

        {/* 일정 추가 모달 */}
        <AddScheduleModal 
          isOpen={ui.modalOpen}
          onClose={() => ui.setModalOpen(false)}
          onSubmit={handleAddSchedule}
          formData={{
            title: schedule.title,
            selectedDate: schedule.selectedDate,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            color: schedule.color,
            memo: schedule.memo
          }}
          onFormDataChange={(updates) => {
            if (updates.title !== undefined) schedule.setTitle(updates.title);
            if (updates.selectedDate !== undefined) schedule.setSelectedDate(updates.selectedDate);
            if (updates.startTime !== undefined) schedule.setStartTime(updates.startTime);
            if (updates.endTime !== undefined) schedule.setEndTime(updates.endTime);
            if (updates.color !== undefined) schedule.setColor(updates.color);
            if (updates.memo !== undefined) schedule.setMemo(updates.memo);
          }}
          onDateInputClick={ui.openMiniCalendar}
        />

        {/* 일정 상세 모달 */}
        <ScheduleDetailModal 
          isOpen={ui.scheduleDetailOpen}
          selectedSchedule={schedule.selectedSchedule}
          onClose={() => ui.setScheduleDetailOpen(false)}
          onSubmit={handleUpdateSchedule}
          onDelete={handleDeleteSchedule}
          formData={{
            editTitle: schedule.editTitle,
            editDate: schedule.editDate,
            editStartTime: schedule.editStartTime,
            editEndTime: schedule.editEndTime,
            editColor: schedule.editColor,
            memo: schedule.memo
          }}
          onFormDataChange={(updates) => {
            if (updates.editTitle !== undefined) schedule.setEditTitle(updates.editTitle);
            if (updates.editDate !== undefined) schedule.setEditDate(updates.editDate);
            if (updates.editStartTime !== undefined) schedule.setEditStartTime(updates.editStartTime);
            if (updates.editEndTime !== undefined) schedule.setEditEndTime(updates.editEndTime);
            if (updates.editColor !== undefined) schedule.setEditColor(updates.editColor);
            if (updates.memo !== undefined) schedule.setMemo(updates.memo);
          }}
          onDateInputClick={ui.openMiniCalendar}
        />

        {/* 미니 달력 */}
        {ui.showMiniCalendar && (
          <MiniCalendar
            selectedDate={ui.modalOpen ? (schedule.selectedDate ? format(schedule.selectedDate, 'yyyy-MM-dd') : '') : schedule.editDate}
            onDateSelect={handleMiniCalendarDateSelect}
            onClose={() => ui.setShowMiniCalendar(false)}
            position={ui.miniCalendarPosition}
          />
        )}
      </main>
    </div>
  );
}

export default App;
