import React, { useMemo } from 'react';
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
        
        // react-big-calendar 구조 기반 정확한 날짜 감지
        const monthView = document.querySelector('.rbc-month-view');
        if (monthView) {
          // 월별 뷰에서는 각 주(row)가 .rbc-month-row 클래스를 가짐
          const monthRows = Array.from(monthView.querySelectorAll('.rbc-month-row'));
          
          let targetDate = null;
          
          for (let rowIndex = 0; rowIndex < monthRows.length; rowIndex++) {
            const row = monthRows[rowIndex];
            const rowRect = row.getBoundingClientRect();
            
            // 클릭이 이 주(row) 내에 있는지 확인
            if (e.clientY >= rowRect.top && e.clientY <= rowRect.bottom) {
              // 이 주 내에서 정확한 날짜 셀 찾기
              // .rbc-date-cell은 날짜 헤더, 실제 셀은 전체 영역을 차지
              const cellWidth = rowRect.width / 7; // 7일
              const clickX = e.clientX - rowRect.left;
              const dayIndex = Math.floor(clickX / cellWidth);
              
              // 날짜 계산: 주의 시작일 + 요일 인덱스
              const firstOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
              const startOfCalendar = new Date(firstOfMonth);
              startOfCalendar.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
              
              targetDate = new Date(startOfCalendar);
              targetDate.setDate(startOfCalendar.getDate() + (rowIndex * 7) + dayIndex);
              
              break;
            }
          }
          
          if (targetDate) {
            onDateCellContextMenu(targetDate, e);
          }
        }
      }
    };

    document.addEventListener('contextmenu', handleDateCellRightClick);
    return () => {
      document.removeEventListener('contextmenu', handleDateCellRightClick);
    };
  }, [onDateCellContextMenu, calendarDate]);
  // 날짜 셀별 이벤트 렌더링을 위한 커스텀 MonthDateHeader
  const CustomMonthDateHeader = ({ date, drilldownView, onDrillDown }) => {
    // 해당 날짜의 이벤트들만 필터링
    const dateEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const currentDate = new Date(date);
      
      // 날짜만 비교 (시간 제외)
      const isEventDate = currentDate >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate()) &&
                         currentDate <= new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      
      return isEventDate;
    });

    // 시간 포맷팅 함수
    const formatTime = (timeString) => {
      if (!timeString) return '';
      return timeString.slice(0, 5);
    };

    return (
      <div className="custom-date-cell" style={{ position: 'relative', height: '100%' }}>
        {/* 날짜 헤더 */}
        <div style={{ 
          position: 'absolute', 
          top: '4px', 
          right: '8px', 
          fontSize: '14px', 
          fontWeight: '600',
          color: date.getMonth() === calendarDate.getMonth() ? '#374151' : '#9ca3af',
          backgroundColor: date.toDateString() === new Date().toDateString() ? '#dbeafe' : 'transparent',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          {date.getDate()}
        </div>
        
        {/* 이벤트들을 날짜 셀 내부에 렌더링 */}
        <div style={{ 
          position: 'absolute',
          top: '26px',
          left: '1px',
          right: '1px',
          bottom: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {dateEvents.slice(0, 3).map((event, index) => {
            const startTime = formatTime(event.startTime);
            const isMultiDay = event.start.toDateString() !== event.end.toDateString();
            
            return (
              <div
                key={`${event.id}-${index}`}
                className="custom-event-bar"
                title={`${startTime ? startTime + ' ' : ''}${event.title}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEventContextMenu(event, e);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!dateCellContextMenuActive && !eventContextMenuActive) {
                    onEventSelect(event);
                  }
                }}
                style={{
                  backgroundColor: event.color || '#3b82f6',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  height: '28px',
                  minHeight: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isMultiDay ? 'center' : 'space-between'
                }}
              >
                <span style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  textAlign: isMultiDay ? 'center' : 'left'
                }}>
                  {event.title}
                </span>
                {startTime && !isMultiDay && (
                  <span style={{ 
                    fontSize: '12px',
                    opacity: '0.9',
                    marginLeft: '4px',
                    flexShrink: 0
                  }}>
                    {startTime}
                  </span>
                )}
              </div>
            );
          })}
          {dateEvents.length > 3 && (
            <div style={{
              fontSize: '10px',
              color: '#6b7280',
              textAlign: 'center',
              padding: '1px'
            }}>
              +{dateEvents.length - 3}개 더
            </div>
          )}
        </div>
      </div>
    );
  };

  // 빈 이벤트 컴포넌트 (이벤트를 날짜 셀에서 직접 렌더링하므로 불필요)
  const EmptyEvent = () => null;

  // 커스텀 컴포넌트 설정 (날짜 셀 레벨 이벤트 렌더링)
  const components = useMemo(() => ({
    month: {
      dateHeader: CustomMonthDateHeader,
      event: EmptyEvent, // 기본 이벤트 렌더링 비활성화
    },
    toolbar: (props) => (
      <CalendarToolbar 
        {...props} 
        onOpenMonthPicker={(dateCellContextMenuActive || eventContextMenuActive) ? () => {} : onOpenMonthPicker}
        onAddSchedule={(dateCellContextMenuActive || eventContextMenuActive) ? () => {} : onAddSchedule}
        disabled={dateCellContextMenuActive || eventContextMenuActive}
      />
    ),
  }), [dateCellContextMenuActive, eventContextMenuActive, onOpenMonthPicker, onAddSchedule, CustomMonthDateHeader, events, calendarDate]);

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
