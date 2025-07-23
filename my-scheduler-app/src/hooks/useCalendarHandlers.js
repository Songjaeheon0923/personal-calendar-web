import { CATEGORY_COLORS } from "../constants";

export function useCalendarHandlers(schedule, ui) {
  // 폼 초기화 함수
  const resetAddForm = () => {
    schedule.setTitle("");
    schedule.setStartTime("");
    schedule.setEndTime("");
    schedule.setColor(CATEGORY_COLORS[0].color);
    schedule.setMemo("");
  };

  // 날짜 셀 클릭 시 사이드바 오픈
  const handleSelectSlot = (slotInfo) => {
    ui.openSidebar(slotInfo.start, schedule.schedules);
  };

  // 일정 클릭 핸들러 (사이드바 열기)
  const handleEventSelect = (event) => {
    // 이벤트 클릭 시 해당 날짜의 사이드바 열기 및 해당 이벤트 확장
    const eventDate = new Date(event.start);
    ui.openSidebar(eventDate, schedule.schedules, event.id);
  };

  // 일정 우클릭 핸들러 (컨텍스트 메뉴)
  const handleEventContextMenu = (event, jsEvent) => {
    console.log('handleEventContextMenu called:', event, jsEvent); // 디버깅용
    jsEvent.preventDefault();
    jsEvent.stopPropagation();
    
    console.log('Setting event context menu:', { // 디버깅용
      show: true,
      x: jsEvent.clientX,
      y: jsEvent.clientY,
      event: event
    });
    
    ui.setEventContextMenu({
      show: true,
      x: jsEvent.clientX,
      y: jsEvent.clientY,
      event: event
    });
  };

  // 날짜 셀 우클릭 핸들러 (일정 추가 컨텍스트 메뉴)
  const handleDateCellContextMenu = (date, jsEvent) => {
    jsEvent.preventDefault();
    jsEvent.stopPropagation();
    
    ui.setDateCellContextMenu({
      show: true,
      x: jsEvent.clientX,
      y: jsEvent.clientY,
      date: date
    });
  };

  // 날짜 셀 컨텍스트 메뉴에서 일정 추가 클릭
  const handleAddScheduleFromDateContext = (date) => {
    // 선택된 날짜로 설정
    schedule.setSelectedDate(date);
    
    // 해당 날짜의 사이드바 열기
    ui.openSidebar(date, schedule.schedules);
    
    // 모달 열기
    ui.setModalOpen(true);
    
    // 컨텍스트 메뉴 닫기
    ui.setDateCellContextMenu({ show: false, x: 0, y: 0, date: null });
  };

  // 이벤트 컨텍스트 메뉴에서 수정 클릭
  const handleEditFromEventContext = () => {
    const event = ui.eventContextMenu.event;
    if (event) {
      schedule.selectScheduleForEdit(event.resource);
      ui.setScheduleDetailOpen(true);
      ui.setEventContextMenu({ show: false, x: 0, y: 0, event: null });
    }
  };

  // 이벤트 컨텍스트 메뉴에서 삭제 클릭
  const handleDeleteFromEventContext = () => {
    const event = ui.eventContextMenu.event;
    if (event) {
      const deleteScheduleFn = schedule.deleteSchedule(
        ui.sidebarDate, 
        ui.setSidebarSchedules, 
        ui.showSidebar, 
        ui.setExpandedEventIds, 
        ui.expandedEventIds
      );
      deleteScheduleFn(event.resource.id);
      ui.setEventContextMenu({ show: false, x: 0, y: 0, event: null });
    }
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
    resetAddForm();
    ui.setModalOpen(true);
  };

  // 사이드바에서 일정 추가 버튼 클릭 (특정 날짜로 설정)
  const handleAddScheduleFromSidebar = () => {
    schedule.setSelectedDate(ui.sidebarDate);
    resetAddForm();
    ui.setModalOpen(true);
  };

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
