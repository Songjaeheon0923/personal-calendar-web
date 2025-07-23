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
      // 이벤트 위에서 우클릭한 경우는 제외
      if (e.target.closest('.rbc-event')) {
        return;
      }

      // 모든 가능한 날짜 관련 클래스들을 확인
      const targetElement = e.target;
      const isDateCellArea = 
        targetElement.closest('.rbc-date-cell') ||
        targetElement.closest('.rbc-day-slot') ||
        targetElement.closest('.rbc-header') ||
        targetElement.closest('.rbc-events-container') ||
        targetElement.closest('.rbc-day-bg') ||
        targetElement.classList.contains('rbc-date-cell') ||
        targetElement.classList.contains('rbc-day-slot') ||
        targetElement.classList.contains('rbc-header') ||
        targetElement.classList.contains('rbc-events-container') ||
        targetElement.classList.contains('rbc-day-bg');
      
      if (isDateCellArea) {
        e.preventDefault();
        
        // 날짜 셀을 찾기 위한 여러 시도
        let targetCell = null;
        
        // 직접적인 날짜 셀 찾기
        targetCell = targetElement.closest('.rbc-date-cell');
        
        // 날짜 셀이 없다면 부모 요소들을 통해 찾기
        if (!targetCell) {
          let currentElement = targetElement;
          while (currentElement && currentElement !== document.body) {
            // 월 행(.rbc-month-row) 내에서 찾기
            if (currentElement.classList?.contains('rbc-month-row')) {
              // 클릭 위치를 기반으로 어떤 셀인지 계산
              const monthRow = currentElement;
              const dateCells = Array.from(monthRow.querySelectorAll('.rbc-date-cell'));
              
              if (dateCells.length > 0) {
                // 클릭 좌표를 기반으로 어떤 셀인지 찾기
                const rect = monthRow.getBoundingClientRect();
                const relativeX = e.clientX - rect.left;
                const cellWidth = rect.width / 7; // 7일
                const cellIndex = Math.floor(relativeX / cellWidth);
                
                if (cellIndex >= 0 && cellIndex < dateCells.length) {
                  targetCell = dateCells[cellIndex];
                  break;
                }
              }
            }
            currentElement = currentElement.parentElement;
          }
        }
        
        if (targetCell) {
          const monthView = document.querySelector('.rbc-month-view');
          if (monthView) {
            const allCells = Array.from(monthView.querySelectorAll('.rbc-date-cell'));
            const cellIndex = allCells.indexOf(targetCell);
            
            if (cellIndex >= 0) {
              // 월의 첫 번째 날짜를 기준으로 계산
              const firstOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
              const startOfCalendar = new Date(firstOfMonth);
              startOfCalendar.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
              
              const clickedDate = new Date(startOfCalendar);
              clickedDate.setDate(startOfCalendar.getDate() + cellIndex);
              
              onDateCellContextMenu(clickedDate, e);
            }
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
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          marginRight: startTime ? '4px' : '0'
        }}>
          {event.title}
        </span>
        {startTime && (
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
