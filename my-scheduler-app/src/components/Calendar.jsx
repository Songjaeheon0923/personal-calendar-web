import React from 'react';
import { Calendar as BigCalendar } from "react-big-calendar";
import CalendarDateHeader from "./CalendarDateHeader";
import CalendarToolbar from "./CalendarToolbar";

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
  // 날짜 셀 우클릭 처리를 위한 이벤트 리스너
  React.useEffect(() => {
    const handleDateCellRightClick = (e) => {
      // 이벤트 위에서 우클릭한 경우는 제외 (이벤트 컨텍스트 메뉴가 처리)
      if (e.target.closest('.rbc-event') || e.target.closest('.rbc-event-content')) {
        return;
      }

      // 캘린더 영역 내에서의 우클릭인지 확인
      const calendarContainer = e.target.closest('.rbc-calendar');
      if (!calendarContainer) {
        return;
      }

      // 날짜 셀 관련 영역에서의 우클릭인지 확인
      const isDateArea = 
        e.target.closest('.rbc-date-cell') ||
        e.target.closest('.rbc-day-slot') ||
        e.target.closest('.rbc-day-bg') ||
        e.target.closest('.rbc-events-container') ||
        e.target.closest('.rbc-month-row') ||
        e.target.classList.contains('rbc-date-cell') ||
        e.target.classList.contains('rbc-day-slot') ||
        e.target.classList.contains('rbc-day-bg') ||
        e.target.classList.contains('rbc-events-container');
      
      if (isDateArea) {
        e.preventDefault();
        e.stopPropagation();
        
        // 클릭된 날짜 계산
        const monthView = document.querySelector('.rbc-month-view');
        if (monthView) {
          const allCells = Array.from(monthView.querySelectorAll('.rbc-date-cell'));
          const rect = monthView.getBoundingClientRect();
          
          // 클릭 위치를 기반으로 날짜 셀 찾기
          let targetCellIndex = -1;
          let minDistance = Infinity;
          
          allCells.forEach((cell, index) => {
            const cellRect = cell.getBoundingClientRect();
            const cellCenterX = cellRect.left + cellRect.width / 2;
            const cellCenterY = cellRect.top + cellRect.height / 2;
            const distance = Math.sqrt(
              Math.pow(e.clientX - cellCenterX, 2) + 
              Math.pow(e.clientY - cellCenterY, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              targetCellIndex = index;
            }
          });
          
          if (targetCellIndex >= 0) {
            // 월의 첫 번째 날짜를 기준으로 계산
            const firstOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
            const startOfCalendar = new Date(firstOfMonth);
            startOfCalendar.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
            
            const clickedDate = new Date(startOfCalendar);
            clickedDate.setDate(startOfCalendar.getDate() + targetCellIndex);
            
            onDateCellContextMenu(clickedDate, e);
          }
        }
      }
    };

    document.addEventListener('contextmenu', handleDateCellRightClick);
    return () => {
      document.removeEventListener('contextmenu', handleDateCellRightClick);
    };
  }, [onDateCellContextMenu, calendarDate]);
  // 커스텀 이벤트 컴포넌트
  const CustomEvent = ({ event }) => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Event context menu triggered for:', event); // 디버깅용
      onEventContextMenu(event, e);
    };

    // 시작 시간 포맷팅
    const formatTime = (timeString) => {
      if (!timeString) return '';
      return timeString.slice(0, 5); // HH:MM 형식으로 잘라내기
    };

    // 이벤트 객체에서 시간 정보 가져오기
    const startTime = formatTime(event.startTime);
    
    // 여러 날짜에 걸친 일정인지 확인
    const isMultiDay = event.start.toDateString() !== event.end.toDateString();

    return (
      <div
        className="rbc-event-content"
        title={`${startTime ? startTime + ' ' : ''}${event.title}`}
        onContextMenu={handleContextMenu}
        style={{ 
          width: '100%', 
          height: '100%',
          cursor: 'pointer',
          padding: '2px 4px',
          fontSize: '13px',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: isMultiDay ? 'center' : 'space-between', // 여러 날짜면 중앙 정렬
          alignItems: 'center'
        }}
      >
        <span style={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          marginRight: startTime && !isMultiDay ? '4px' : '0', // 여러 날짜면 마진 제거
          textAlign: isMultiDay ? 'center' : 'left' // 여러 날짜면 중앙 정렬
        }}>
          {event.title}
        </span>
        {startTime && !isMultiDay && ( // 여러 날짜 일정에서는 시간 숨기기
          <span style={{ 
            fontWeight: '600',
            opacity: '0.9',
            fontSize: '12px',
            flexShrink: 0
          }}>
            {startTime}
          </span>
        )}
      </div>
    );
  };

  // 커스텀 컴포넌트 설정
  const components = {
    month: {
      dateHeader: CalendarDateHeader,
      event: CustomEvent,
    },
    toolbar: (props) => (
      <CalendarToolbar 
        {...props} 
        onOpenMonthPicker={(dateCellContextMenuActive || eventContextMenuActive) ? () => {} : onOpenMonthPicker}
        onAddSchedule={(dateCellContextMenuActive || eventContextMenuActive) ? () => {} : onAddSchedule}
        disabled={dateCellContextMenuActive || eventContextMenuActive}
      />
    ),
  };

  return (
    <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 140px)" }}
        views={["month"]}
        defaultView="month"
        date={calendarDate}
        onNavigate={(date) => {
          // 컨텍스트 메뉴가 활성화되어 있으면 동작하지 않음
          if (dateCellContextMenuActive || eventContextMenuActive) {
            return;
          }
          onDateChange(date);
        }}
        selectable
        onSelectSlot={(slotInfo) => {
          // 컨텍스트 메뉴가 활성화되어 있으면 동작하지 않음
          if (dateCellContextMenuActive || eventContextMenuActive) {
            return;
          }
          onSelectSlot(slotInfo);
        }}
        onSelectEvent={(event) => {
          // 컨텍스트 메뉴가 활성화되어 있으면 동작하지 않음
          if (dateCellContextMenuActive || eventContextMenuActive) {
            return;
          }
          // 이벤트 클릭 시 사이드바 열기
          onEventSelect(event);
        }}
        eventPropGetter={eventStyleGetter}
        components={components}
        messages={{
          next: "다음",
          previous: "이전",
          today: "오늘",
          month: "월",
          week: "주",
          day: "일",
          agenda: "일정",
          date: "날짜",
          time: "시간",
          event: "이벤트",
          noEventsInRange: "이 기간에는 일정이 없습니다.",
        }}
        formats={{
          monthHeaderFormat: (date, culture, localizer) =>
            localizer.format(date, "yyyy년 M월", culture),
          dayHeaderFormat: (date, culture, localizer) =>
            localizer.format(date, "dd일 (EEE)", culture),
          dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, "M월 d일", culture)} - ${localizer.format(
              end,
              "M월 d일",
              culture
            )}`,
        }}
      />
    </div>
  );
}

export default Calendar;
