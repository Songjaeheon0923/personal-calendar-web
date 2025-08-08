import React, { useMemo, useCallback } from 'react';
import CalendarToolbar from "./CalendarToolbar";
import NewMonthView from "./NewMonthView";
import "../styles/NewCalendar.css";

function Calendar({ 
  localizer,
  events,
  calendarDate,
  onDateChange,
  onSelectSlot,
  onEventSelect,
  onEventContextMenu,
  onDateCellContextMenu,
  dateCellContextMenuActive,
  eventContextMenuActive,
  onOpenMonthPicker,
  onAddSchedule,
  eventStyleGetter
}) {









  return (
    <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
      {/* 커스텀 툴바 */}
      <div className="flex-shrink-0">
        <CalendarToolbar 
          date={calendarDate}
          onNavigate={onDateChange}
          onOpenMonthPicker={(dateCellContextMenuActive || eventContextMenuActive) ? () => {} : onOpenMonthPicker}
          onAddSchedule={(dateCellContextMenuActive || eventContextMenuActive) ? () => {} : onAddSchedule}
          disabled={dateCellContextMenuActive || eventContextMenuActive}
        />
      </div>
      
      {/* 새로운 월별 뷰 */}
      <div className="flex-1 min-h-0">
        <NewMonthView
          calendarDate={calendarDate}
          events={events}
          onSelectSlot={onSelectSlot}
          onEventSelect={onEventSelect}
          onEventContextMenu={onEventContextMenu}
          onDateCellContextMenu={onDateCellContextMenu}
          dateCellContextMenuActive={dateCellContextMenuActive}
          eventContextMenuActive={eventContextMenuActive}
          eventStyleGetter={eventStyleGetter}
        />
      </div>
    </div>
  );
}

export default Calendar;
