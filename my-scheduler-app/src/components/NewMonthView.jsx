import React, { useMemo, useCallback } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  format, 
  isSameDay 
} from 'date-fns';
import { ko } from 'date-fns/locale';

function NewMonthView({
  calendarDate,
  events = [],
  onSelectSlot,
  onEventSelect,
  onEventContextMenu,
  onDateCellContextMenu,
  dateCellContextMenuActive,
  eventContextMenuActive,
  eventStyleGetter
}) {
  // 달력 날짜들 계산
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarDate]);

  // 6주 x 7일 = 42일로 구성
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < 6; i++) {
      result.push(calendarDays.slice(i * 7, (i + 1) * 7));
    }
    return result;
  }, [calendarDays]);

  // 각 날짜별 이벤트 정리
  const eventsByDate = useMemo(() => {
    const result = {};
    const allEventsByDate = {};
    
    events.forEach(event => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      // 다중일 이벤트인 경우 각 날짜에 정보 추가
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const current = new Date(startDateOnly);
      let dayIndex = 0;
      
      while (current <= endDateOnly) {
        const dateKey = format(current, 'yyyy-MM-dd');
        
        if (!allEventsByDate[dateKey]) {
          allEventsByDate[dateKey] = [];
        }
        
        const isStart = dayIndex === 0;
        const isEnd = isSameDay(current, endDateOnly);
        const isMiddle = !isStart && !isEnd;
        
        allEventsByDate[dateKey].push({
          ...event,
          position: isStart ? 'start' : isEnd ? 'end' : 'middle',
          isMultiDay: !isSameDay(startDateOnly, endDateOnly)
        });
        
        current.setDate(current.getDate() + 1);
        dayIndex++;
      }
    });
    
    // 각 날짜별로 표시용 이벤트와 전체 개수 저장
    Object.keys(allEventsByDate).forEach(dateKey => {
      const allEvents = allEventsByDate[dateKey];
      
      // 다중일 이벤트 우선, 그 다음 시작시간 순으로 정렬 (종일 이벤트는 맨 아래)
      const sortedEvents = allEvents.sort((a, b) => {
        // 다중일 여부로 먼저 정렬 (다중일이 위에)
        if (a.isMultiDay && !b.isMultiDay) return -1;
        if (!a.isMultiDay && b.isMultiDay) return 1;
        
        // 둘 다 다중일이거나 둘 다 단일일인 경우
        // startTime이 없는 경우 (종일 이벤트) 맨 아래에 표시
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1; // a가 종일 이벤트면 뒤로
        if (!b.startTime) return -1; // b가 종일 이벤트면 뒤로
        
        // 시작시간으로 비교
        return a.startTime.localeCompare(b.startTime);
      });
      
      result[dateKey] = {
        visibleEvents: sortedEvents.length <= 3 ? sortedEvents : sortedEvents.slice(0, 2), // 3개 이하면 모두 표시, 4개 이상이면 2개만
        totalCount: sortedEvents.length,
        hasMore: sortedEvents.length > 3 // 4개 이상일 때만 더보기 표시
      };
    });
    
    return result;
  }, [events]);

  // 날짜 셀 클릭 핸들러
  const handleDateClick = useCallback((date, event) => {
    if (dateCellContextMenuActive || eventContextMenuActive) return;
    
    if (onSelectSlot) {
      onSelectSlot({
        start: date,
        end: date,
        slots: [date],
        action: 'click'
      });
    }
  }, [onSelectSlot, dateCellContextMenuActive, eventContextMenuActive]);

  // 날짜 셀 우클릭 핸들러
  const handleDateContextMenu = useCallback((date, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (onDateCellContextMenu) {
      onDateCellContextMenu({
        date,
        clientX: event.clientX,
        clientY: event.clientY
      });
    }
  }, [onDateCellContextMenu]);

  // 이벤트 클릭 핸들러
  const handleEventClick = useCallback((event, originalEvent) => {
    originalEvent.preventDefault();
    originalEvent.stopPropagation();
    
    if (dateCellContextMenuActive || eventContextMenuActive) return;
    
    if (onEventSelect) {
      onEventSelect(event, originalEvent);
    }
  }, [onEventSelect, dateCellContextMenuActive, eventContextMenuActive]);

  // 이벤트 우클릭 핸들러
  const handleEventContextMenu = useCallback((event, originalEvent) => {
    originalEvent.preventDefault();
    originalEvent.stopPropagation();
    
    if (onEventContextMenu) {
      onEventContextMenu({
        event,
        clientX: originalEvent.clientX,
        clientY: originalEvent.clientY
      });
    }
  }, [onEventContextMenu]);

  // 이벤트 스타일 가져오기
  const getEventStyle = useCallback((event) => {
    if (eventStyleGetter) {
      const style = eventStyleGetter(event);
      return style?.style || {};
    }
    return {};
  }, [eventStyleGetter]);

  // 다중일 이벤트 hover 핸들러
  const handleEventMouseEnter = useCallback((eventId) => {
    if (!eventId) return;
    
    // 같은 이벤트 ID를 가진 모든 띠지에 hover 클래스 추가
    const eventBars = document.querySelectorAll(`[data-event-id="${eventId}"]`);
    eventBars.forEach(bar => bar.classList.add('event-group-hover'));
  }, []);

  const handleEventMouseLeave = useCallback((eventId) => {
    if (!eventId) return;
    
    // 같은 이벤트 ID를 가진 모든 띠지에서 hover 클래스 제거
    const eventBars = document.querySelectorAll(`[data-event-id="${eventId}"]`);
    eventBars.forEach(bar => bar.classList.remove('event-group-hover'));
  }, []);

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="new-calendar">
      {/* 요일 헤더 */}
      <div className="calendar-weekdays">
        {weekdays.map((day, index) => (
          <div 
            key={day} 
            className={`weekday-cell ${
              index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="calendar-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week">
            {week.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayData = eventsByDate[dateKey] || { visibleEvents: [], totalCount: 0, hasMore: false };
              const { visibleEvents, totalCount, hasMore } = dayData;
              const isCurrentMonth = isSameMonth(date, calendarDate);
              const isCurrentDay = isToday(date);
              
              return (
                <div
                  key={dateKey}
                  className={`date-cell ${
                    !isCurrentMonth ? 'other-month' : ''
                  } ${isCurrentDay ? 'today' : ''}`}
                  onClick={(e) => handleDateClick(date, e)}
                  onContextMenu={(e) => handleDateContextMenu(date, e)}
                >
                  {/* 날짜 숫자 */}
                  <div className="date-number">
                    {format(date, 'd')}
                  </div>

                  {/* 이벤트들 */}
                  <div className="events-container">
                    {visibleEvents.map((event, eventIndex) => {
                      const eventStyle = getEventStyle(event);
                      const backgroundColor = eventStyle.backgroundColor || event.color || '#3b82f6';
                      
                      return (
                        <div
                          key={`${event.id}-${eventIndex}`}
                          className={`event-bar ${
                            event.isMultiDay 
                              ? `multi-${event.position}` 
                              : ''
                          }`}
                          style={{ 
                            backgroundColor,
                            ...eventStyle
                          }}
                          onClick={(e) => handleEventClick(event, e)}
                          onContextMenu={(e) => handleEventContextMenu(event, e)}
                          onMouseEnter={() => handleEventMouseEnter(event.id)}
                          onMouseLeave={() => handleEventMouseLeave(event.id)}
                          data-event-id={event.id}
                        >
                          <span className="event-title">
                            {/* 다중일 이벤트는 start에만 제목 표시, 단일일 이벤트는 항상 표시 */}
                            {event.isMultiDay 
                              ? (event.position === 'start' ? event.title : '')
                              : event.title
                            }
                          </span>
                          {/* 다중일 이벤트는 시작시간 표시하지 않음 */}
                          {!event.isMultiDay && event.startTime && (
                            <span className="event-time">
                              {event.startTime}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* 4개 이상일 때 더보기 표시 */}
                    {hasMore && (
                      <div className="more-events">
                        +{totalCount - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewMonthView;