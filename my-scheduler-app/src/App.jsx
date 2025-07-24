import { useSchedule } from "./hooks/useSchedule";
import { useUI } from "./hooks/useUI";
import { useCalendarHandlers } from "./hooks/useCalendarHandlers";
import { localizer, eventStyleGetter } from "./utils/calendarConfig";
import Calendar from "./components/Calendar";
import Sidebar from "./components/Sidebar";
import ModalContainer from "./components/ModalContainer";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect } from "react";

function App() {
  // 커스텀 훅 사용
  const schedule = useSchedule();
  const ui = useUI();
  const handlers = useCalendarHandlers(schedule, ui);

  // 부분 화면(모바일/태블릿)로 전환 시 사이드바 자동 닫기
  // 사이드바 상태를 화면 크기 변경에 따라 자동으로 변경하지 않음 (상태 유지)

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col">
      <header className="py-4 px-8 bg-white shadow flex-none flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">맞춤 일정 관리 웹</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          onClick={handlers.handleOpenAddModal}
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
          onSelectSlot={handlers.handleSelectSlot}
          onEventSelect={handlers.handleEventSelect}
          onEventContextMenu={handlers.handleEventContextMenu}
          onDateCellContextMenu={handlers.handleDateCellContextMenu}
          dateCellContextMenuActive={ui.dateCellContextMenu.show}
          eventContextMenuActive={ui.eventContextMenu.show}
          onOpenMonthPicker={() => ui.setShowMonthPicker(true)}
          onAddSchedule={handlers.handleOpenAddModal}
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
          onEditSchedule={handlers.handleEditFromSidebar}
          onDeleteSchedule={handlers.handleDeleteFromSidebar}
          onAddSchedule={handlers.handleAddScheduleFromSidebar}
        />

        {/* 모든 모달들 */}
        <ModalContainer 
          schedule={schedule}
          ui={ui}
          handlers={handlers}
        />
      </main>
    </div>
  );
}

export default App;
