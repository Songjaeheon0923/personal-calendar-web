import { format } from "date-fns";
import { useCallback } from "react";
import YearMonthPicker from "./YearMonthPicker";
import MiniCalendar from "./MiniCalendar";
import AddScheduleModal from "./AddScheduleModal";
import ScheduleDetailModal from "./ScheduleDetailModal";
import EventContextMenu from "./EventContextMenu";
import DateCellContextMenu from "./DateCellContextMenu";

function ModalContainer({ 
  schedule, 
  ui, 
  handlers 
}) {
  // 폼 데이터 변경 핸들러 - 추가 모달용
  const handleAddFormChange = useCallback((updates) => {
    try {
      if (updates.title !== undefined) schedule.setTitle(updates.title);
      if (updates.selectedDate !== undefined) schedule.setSelectedDate(updates.selectedDate);
      if (updates.endDate !== undefined) schedule.setEndDate(updates.endDate);
      if (updates.startTime !== undefined) schedule.setStartTime(updates.startTime);
      if (updates.endTime !== undefined) schedule.setEndTime(updates.endTime);
      if (updates.color !== undefined) schedule.setColor(updates.color);
      if (updates.memo !== undefined) schedule.setMemo(updates.memo);
    } catch (error) {
      console.error('Error updating add form data:', error);
    }
  }, [schedule]);

  // 폼 데이터 변경 핸들러 - 수정 모달용
  const handleEditFormChange = useCallback((updates) => {
    try {
      if (updates.editTitle !== undefined) schedule.setEditTitle(updates.editTitle);
      if (updates.editDate !== undefined) schedule.setEditDate(updates.editDate);
      if (updates.editEndDate !== undefined) schedule.setEditEndDate(updates.editEndDate);
      if (updates.editStartTime !== undefined) schedule.setEditStartTime(updates.editStartTime);
      if (updates.editEndTime !== undefined) schedule.setEditEndTime(updates.editEndTime);
      if (updates.editColor !== undefined) schedule.setEditColor(updates.editColor);
      if (updates.editMemo !== undefined) schedule.setEditMemo(updates.editMemo);
    } catch (error) {
      console.error('Error updating edit form data:', error);
    }
  }, [schedule]);

  return (
    <>
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
        onSubmit={handlers.handleAddSchedule}
        formData={{
          title: schedule.title || "",
          selectedDate: schedule.selectedDate,
          endDate: schedule.endDate,
          startTime: schedule.startTime || "",
          endTime: schedule.endTime || "",
          color: schedule.color || "#ffe066",
          memo: schedule.memo || ""
        }}
        onFormDataChange={handleAddFormChange}
        onDateInputClick={ui.openMiniCalendar}
        showMiniCalendar={ui.showMiniCalendar}
        miniCalendarProps={{
          selectedDate: schedule.selectedDate ? format(schedule.selectedDate, 'yyyy-MM-dd') : '',
          onDateSelect: handlers.handleMiniCalendarDateSelect,
          onClose: ui.closeMiniCalendar,
          position: ui.miniCalendarPosition
        }}
      />

      {/* 일정 상세 모달 */}
      <ScheduleDetailModal 
        isOpen={ui.scheduleDetailOpen}
        selectedSchedule={schedule.selectedSchedule}
        onClose={() => ui.setScheduleDetailOpen(false)}
        onSubmit={handlers.handleUpdateSchedule}
        onDelete={handlers.handleDeleteSchedule}
        formData={{
          editTitle: schedule.editTitle || "",
          editDate: schedule.editDate || "",
          editEndDate: schedule.editEndDate || "",
          editStartTime: schedule.editStartTime || "",
          editEndTime: schedule.editEndTime || "",
          editColor: schedule.editColor || "#ffe066",
          editMemo: schedule.editMemo || ""
        }}
        onFormDataChange={handleEditFormChange}
        onDateInputClick={ui.openMiniCalendar}
        showMiniCalendar={ui.showMiniCalendar}
        miniCalendarProps={{
          selectedDate: schedule.editDate,
          onDateSelect: handlers.handleMiniCalendarDateSelect,
          onClose: ui.closeMiniCalendar,
          position: ui.miniCalendarPosition
        }}
      />

      {/* 이벤트 컨텍스트 메뉴 */}
      <EventContextMenu
        show={ui.eventContextMenu.show}
        x={ui.eventContextMenu.x}
        y={ui.eventContextMenu.y}
        event={ui.eventContextMenu.event}
        onEdit={handlers.handleEditFromEventContext}
        onDelete={handlers.handleDeleteFromEventContext}
        onClose={ui.closeEventContextMenu}
      />

      {/* 날짜 셀 컨텍스트 메뉴 */}
      <DateCellContextMenu
        show={ui.dateCellContextMenu.show}
        x={ui.dateCellContextMenu.x}
        y={ui.dateCellContextMenu.y}
        date={ui.dateCellContextMenu.date}
        onAddSchedule={handlers.handleAddScheduleFromDateContext}
        onClose={ui.closeDateCellContextMenu}
      />
    </>
  );
}

export default ModalContainer;