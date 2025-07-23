import { format } from "date-fns";
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
  const handleAddFormChange = (updates) => {
    if (updates.title !== undefined) schedule.setTitle(updates.title);
    if (updates.selectedDate !== undefined) schedule.setSelectedDate(updates.selectedDate);
    if (updates.startTime !== undefined) schedule.setStartTime(updates.startTime);
    if (updates.endTime !== undefined) schedule.setEndTime(updates.endTime);
    if (updates.color !== undefined) schedule.setColor(updates.color);
    if (updates.memo !== undefined) schedule.setMemo(updates.memo);
  };

  // 폼 데이터 변경 핸들러 - 수정 모달용
  const handleEditFormChange = (updates) => {
    if (updates.editTitle !== undefined) schedule.setEditTitle(updates.editTitle);
    if (updates.editDate !== undefined) schedule.setEditDate(updates.editDate);
    if (updates.editStartTime !== undefined) schedule.setEditStartTime(updates.editStartTime);
    if (updates.editEndTime !== undefined) schedule.setEditEndTime(updates.editEndTime);
    if (updates.editColor !== undefined) schedule.setEditColor(updates.editColor);
    if (updates.memo !== undefined) schedule.setMemo(updates.memo);
  };

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
          title: schedule.title,
          selectedDate: schedule.selectedDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          color: schedule.color,
          memo: schedule.memo
        }}
        onFormDataChange={handleAddFormChange}
        onDateInputClick={ui.openMiniCalendar}
      />

      {/* 일정 상세 모달 */}
      <ScheduleDetailModal 
        isOpen={ui.scheduleDetailOpen}
        selectedSchedule={schedule.selectedSchedule}
        onClose={() => ui.setScheduleDetailOpen(false)}
        onSubmit={handlers.handleUpdateSchedule}
        onDelete={handlers.handleDeleteSchedule}
        formData={{
          editTitle: schedule.editTitle,
          editDate: schedule.editDate,
          editStartTime: schedule.editStartTime,
          editEndTime: schedule.editEndTime,
          editColor: schedule.editColor,
          memo: schedule.memo
        }}
        onFormDataChange={handleEditFormChange}
        onDateInputClick={ui.openMiniCalendar}
      />

      {/* 미니 달력 */}
      {ui.showMiniCalendar && (
        <MiniCalendar
          selectedDate={ui.modalOpen ? (schedule.selectedDate ? format(schedule.selectedDate, 'yyyy-MM-dd') : '') : schedule.editDate}
          onDateSelect={handlers.handleMiniCalendarDateSelect}
          onClose={() => ui.setShowMiniCalendar(false)}
          position={ui.miniCalendarPosition}
        />
      )}

      {/* 이벤트 컨텍스트 메뉴 */}
      <EventContextMenu
        show={ui.eventContextMenu.show}
        x={ui.eventContextMenu.x}
        y={ui.eventContextMenu.y}
        event={ui.eventContextMenu.event}
        onEdit={handlers.handleEditFromEventContext}
        onDelete={handlers.handleDeleteFromEventContext}
        onClose={() => ui.setEventContextMenu({ show: false, x: 0, y: 0, event: null })}
      />

      {/* 날짜 셀 컨텍스트 메뉴 */}
      <DateCellContextMenu
        show={ui.dateCellContextMenu.show}
        x={ui.dateCellContextMenu.x}
        y={ui.dateCellContextMenu.y}
        date={ui.dateCellContextMenu.date}
        onAddSchedule={handlers.handleAddScheduleFromDateContext}
        onClose={() => ui.setDateCellContextMenu({ show: false, x: 0, y: 0, date: null })}
      />
    </>
  );
}

export default ModalContainer;
