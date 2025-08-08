import { useCallback } from "react";
import { CATEGORY_COLORS } from "../constants";

export function useCalendarHandlers(schedule, ui) {
  // 폼 초기화 함수
  const resetAddForm = useCallback(() => {
    try {
      schedule.setTitle("");
      schedule.setEndDate(null);
      schedule.setStartTime("");
      schedule.setEndTime("");
      schedule.setColor(CATEGORY_COLORS[0]?.color || "#ffe066");
      schedule.setMemo("");
    } catch (error) {
      console.error('Error resetting add form:', error);
    }
  }, [schedule]);

  // 날짜 셀 클릭 시 사이드바 오픈
  const handleSelectSlot = useCallback((slotInfo) => {
    if (!slotInfo?.start) {
      console.warn('Invalid slot info provided');
      return;
    }
    
    try {
      ui.openSidebar(slotInfo.start, schedule.schedules);
    } catch (error) {
      console.error('Error handling slot select:', error);
    }
  }, [ui, schedule.schedules]);

  // 일정 클릭 핸들러 (사이드바 열기)
  const handleEventSelect = useCallback((event) => {
    if (!event?.start || !event?.id) {
      console.warn('Invalid event provided');
      return;
    }
    
    try {
      const eventDate = new Date(event.start);
      ui.openSidebar(eventDate, schedule.schedules, event.id);
    } catch (error) {
      console.error('Error handling event select:', error);
    }
  }, [ui, schedule.schedules]);

  // 일정 우클릭 핸들러 (컨텍스트 메뉴)
  const handleEventContextMenu = useCallback((contextData) => {
    try {
      // NewMonthView에서 객체로 전달하는 경우와 기존 방식 모두 지원
      const event = contextData.event || contextData;
      const clientX = contextData.clientX || (arguments[1] && arguments[1].clientX);
      const clientY = contextData.clientY || (arguments[1] && arguments[1].clientY);
      
      if (!event || clientX === undefined || clientY === undefined) {
        console.warn('Event, clientX, and clientY are required for context menu');
        return;
      }
      
      console.log('Event context menu triggered for:', event.title, 'id:', event.resource?.id);
      
      ui.setEventContextMenu({
        show: true,
        x: clientX,
        y: clientY,
        event: event
      });
    } catch (error) {
      console.error('Error handling event context menu:', error);
    }
  }, [ui]);

  // 날짜 셀 우클릭 핸들러 (일정 추가 컨텍스트 메뉴)
  const handleDateCellContextMenu = useCallback((contextData) => {
    try {
      // NewMonthView에서 객체로 전달하는 경우와 기존 방식 모두 지원
      const date = contextData.date || contextData;
      const clientX = contextData.clientX || (arguments[1] && arguments[1].clientX);
      const clientY = contextData.clientY || (arguments[1] && arguments[1].clientY);
      
      if (!date || clientX === undefined || clientY === undefined) {
        console.warn('Date, clientX, and clientY are required for context menu');
        return;
      }
      
      ui.setDateCellContextMenu({
        show: true,
        x: clientX,
        y: clientY,
        date: date
      });
    } catch (error) {
      console.error('Error handling date cell context menu:', error);
    }
  }, [ui]);

  // 날짜 셀 컨텍스트 메뉴에서 일정 추가 클릭
  const handleAddScheduleFromDateContext = useCallback((date) => {
    if (!date) {
      console.warn('Date is required for adding schedule');
      return;
    }
    
    try {
      // 먼저 폼을 완전히 초기화
      resetAddForm();
      
      // 선택된 날짜로 설정
      schedule.setSelectedDate(date);
      schedule.setEndDate(date);
      
      // 해당 날짜의 사이드바 열기
      ui.openSidebar(date, schedule.schedules);
      
      // 모달 열기
      ui.setModalOpen(true);
      
      // 컨텍스트 메뉴 닫기
      ui.closeDateCellContextMenu();
    } catch (error) {
      console.error('Error adding schedule from date context:', error);
    }
  }, [resetAddForm, schedule, ui]);

  // 이벤트 컨텍스트 메뉴에서 수정 클릭
  const handleEditFromEventContext = useCallback(() => {
    try {
      const event = ui.eventContextMenu.event;
      console.log('Editing event - full event:', event); // 디버깅용
      console.log('Editing event - resource:', event?.resource); // 디버깅용
      
      // Access event from context menu state
      if (event?.resource) {
        schedule.selectScheduleForEdit(event.resource);
        ui.setScheduleDetailOpen(true);
        ui.closeEventContextMenu();
      } else {
        console.warn('No event resource found for editing');
      }
    } catch (error) {
      console.error('Error editing from event context:', error);
    }
  }, [ui, schedule]);

  // 이벤트 컨텍스트 메뉴에서 삭제 클릭
  const handleDeleteFromEventContext = useCallback(() => {
    try {
      const event = ui.eventContextMenu.event;
      console.log('Deleting event:', event?.title, 'id:', event?.resource?.id); // 디버깅용
      
      // Access event from context menu state
      if (event?.resource?.id) {
        const deleteScheduleFn = schedule.deleteSchedule(
          ui.sidebarDate, 
          ui.setSidebarSchedules, 
          ui.showSidebar, 
          ui.setExpandedEventIds, 
          ui.expandedEventIds
        );
        deleteScheduleFn(event.resource.id);
        ui.closeEventContextMenu();
      } else {
        console.warn('No event resource ID found for deletion');
      }
    } catch (error) {
      console.error('Error deleting from event context:', error);
    }
  }, [ui, schedule]);

  // 미니 달력에서 날짜 선택
  const handleMiniCalendarDateSelect = useCallback((dateString) => {
    if (!dateString) {
      console.warn('Date string is required for mini calendar date select');
      return;
    }
    
    try {
      if (ui.modalOpen) {
        // 일정 추가 모달에서
        if (ui.miniCalendarDateType === 'start') {
          const selectedDate = new Date(dateString);
          schedule.setSelectedDate(selectedDate);
          schedule.setEndDate(selectedDate);
        } else if (ui.miniCalendarDateType === 'end') {
          schedule.setEndDate(new Date(dateString));
        }
      } else if (ui.scheduleDetailOpen) {
        // 일정 수정 모달에서
        if (ui.miniCalendarDateType === 'start') {
          schedule.setEditDate(dateString);
          schedule.setEditEndDate(dateString);
        } else if (ui.miniCalendarDateType === 'end') {
          schedule.setEditEndDate(dateString);
        }
      }
      ui.closeMiniCalendar();
    } catch (error) {
      console.error('Error handling mini calendar date select:', error);
    }
  }, [ui, schedule]);

  // 일정 추가 핸들러
  const handleAddSchedule = useCallback((e) => {
    try {
      const addScheduleFn = schedule.addSchedule(ui.sidebarDate, ui.setSidebarSchedules, ui.showSidebar);
      addScheduleFn(e);
      ui.setModalOpen(false);
    } catch (error) {
      console.error('Error handling add schedule:', error);
    }
  }, [schedule, ui]);

  // 일정 수정 핸들러
  const handleUpdateSchedule = useCallback((e) => {
    try {
      const updateScheduleFn = schedule.updateSchedule(ui.sidebarDate, ui.setSidebarSchedules, ui.showSidebar);
      updateScheduleFn(e);
      ui.setScheduleDetailOpen(false);
    } catch (error) {
      console.error('Error handling update schedule:', error);
    }
  }, [schedule, ui]);

  // 일정 삭제 핸들러 (Sidebar에서 사용)
  const handleDeleteFromSidebar = useCallback((scheduleId) => {
    if (!scheduleId) {
      console.warn('Schedule ID is required for deletion from sidebar');
      return;
    }
    
    try {
      const deleteScheduleFn = schedule.deleteSchedule(
        ui.sidebarDate, 
        ui.setSidebarSchedules, 
        ui.showSidebar, 
        ui.setExpandedEventIds, 
        ui.expandedEventIds
      );
      deleteScheduleFn(scheduleId);
    } catch (error) {
      console.error('Error deleting from sidebar:', error);
    }
  }, [schedule, ui]);

  // 일정 삭제 핸들러 (Modal에서 사용)
  const handleDeleteSchedule = useCallback(() => {
    try {
      if (!schedule.selectedSchedule?.id) {
        console.warn('No selected schedule for deletion');
        return;
      }
      
      const deleteScheduleFn = schedule.deleteSchedule(
        ui.sidebarDate, 
        ui.setSidebarSchedules, 
        ui.showSidebar, 
        ui.setExpandedEventIds, 
        ui.expandedEventIds
      );
      deleteScheduleFn(schedule.selectedSchedule.id);
      ui.setScheduleDetailOpen(false);
    } catch (error) {
      console.error('Error handling delete schedule:', error);
    }
  }, [schedule, ui]);

  // 사이드바에서 일정 수정 버튼 클릭
  const handleEditFromSidebar = useCallback((scheduleData) => {
    if (!scheduleData) {
      console.warn('Schedule data is required for editing from sidebar');
      return;
    }
    
    try {
      schedule.selectScheduleForEdit(scheduleData);
      ui.setScheduleDetailOpen(true);
    } catch (error) {
      console.error('Error editing from sidebar:', error);
    }
  }, [schedule, ui]);

  // 새 일정 추가 버튼 클릭
  const handleOpenAddModal = useCallback(() => {
    try {
      // 먼저 폼을 완전히 초기화
      resetAddForm();
      // 그 다음 오늘 날짜로 설정
      const today = new Date();
      schedule.setSelectedDate(today);
      schedule.setEndDate(today);
      ui.setModalOpen(true);
    } catch (error) {
      console.error('Error opening add modal:', error);
    }
  }, [resetAddForm, schedule, ui]);

  // 사이드바에서 일정 추가 버튼 클릭 (특정 날짜로 설정)
  const handleAddScheduleFromSidebar = useCallback(() => {
    if (!ui.sidebarDate) {
      console.warn('Sidebar date is required for adding schedule from sidebar');
      return;
    }
    
    try {
      // 먼저 폼을 완전히 초기화
      resetAddForm();
      // 그 다음 선택된 날짜로 설정
      schedule.setSelectedDate(ui.sidebarDate);
      schedule.setEndDate(ui.sidebarDate);
      ui.setModalOpen(true);
    } catch (error) {
      console.error('Error adding schedule from sidebar:', error);
    }
  }, [resetAddForm, schedule, ui]);

  return {
    handleSelectSlot,
    handleEventSelect,
    handleEventContextMenu,
    handleDateCellContextMenu,
    handleAddScheduleFromDateContext,
    handleMiniCalendarDateSelect,
    handleAddSchedule,
    handleUpdateSchedule,
    handleDeleteFromSidebar,
    handleDeleteSchedule,
    handleEditFromSidebar,
    handleOpenAddModal,
    handleAddScheduleFromSidebar,
    handleEditFromEventContext,
    handleDeleteFromEventContext,
  };
}