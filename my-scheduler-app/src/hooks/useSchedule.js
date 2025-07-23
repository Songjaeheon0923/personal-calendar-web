import { useState, useMemo } from "react";
import { format } from "date-fns";
import useLocalStorage from "./useLocalStorage";
import { CATEGORY_COLORS } from "../constants";

export function useSchedule() {
  const [schedules, setSchedules] = useLocalStorage("schedules", []);
  
  // 일정 추가 폼 상태
  const [selectedDate, setSelectedDate] = useState(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0].color);
  const [memo, setMemo] = useState("");

  // 일정 수정 폼 상태
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editColor, setEditColor] = useState(CATEGORY_COLORS[0].color);

  // react-big-calendar의 event 포맷으로 변환
  const events = useMemo(() =>
    schedules.map((s) => ({
      id: s.id,
      title: s.title,
      start: new Date(s.date + (s.startTime ? 'T' + s.startTime : 'T00:00')),
      end: new Date(s.date + (s.endTime ? 'T' + s.endTime : 'T23:59')),
      color: s.color,
      startTime: s.startTime, // 시작 시간 직접 추가
      endTime: s.endTime, // 종료 시간 직접 추가
      resource: s, // 원본 일정 정보 포함
    })),
    [schedules]
  );

  // 일정 추가
  const addSchedule = (sidebarDate, setSidebarSchedules, showSidebar) => {
    return (e) => {
      e.preventDefault();
      if (!title || !selectedDate) return;
      
      const newSchedule = {
        id: Date.now(),
        title,
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime,
        endTime,
        color,
        memo,
      };
      
      const updatedSchedules = [...schedules, newSchedule];
      setSchedules(updatedSchedules);
      
      // 폼 초기화
      setTitle("");
      setStartTime("");
      setEndTime("");
      setMemo("");
      
      // 실시간 사이드바 업데이트
      if (showSidebar && sidebarDate) {
        const sidebarDateStr = format(sidebarDate, 'yyyy-MM-dd');
        const newScheduleDateStr = format(selectedDate, 'yyyy-MM-dd');
        
        if (sidebarDateStr === newScheduleDateStr) {
          const updatedSidebarSchedules = updatedSchedules
            .filter(schedule => schedule.date === sidebarDateStr)
            .sort((a, b) => {
              if (!a.startTime && !b.startTime) return 0;
              if (!a.startTime) return 1;
              if (!b.startTime) return -1;
              return a.startTime.localeCompare(b.startTime);
            });
          setSidebarSchedules(updatedSidebarSchedules);
        }
      }
    };
  };

  // 일정 수정
  const updateSchedule = (sidebarDate, setSidebarSchedules, showSidebar) => {
    return (e) => {
      e.preventDefault();
      if (!editTitle || !editDate || !selectedSchedule) return;
      
      const updatedSchedules = schedules.map(schedule => 
        schedule.id === selectedSchedule.id 
          ? { 
              ...schedule, 
              title: editTitle,
              date: editDate,
              startTime: editStartTime,
              endTime: editEndTime,
              color: editColor,
              memo: memo
            }
          : schedule
      );
      setSchedules(updatedSchedules);
      
      // 사이드바가 열려있고 현재 날짜의 일정이면 사이드바 업데이트
      if (showSidebar && sidebarDate) {
        const dateStr = format(sidebarDate, 'yyyy-MM-dd');
        const updatedSidebarSchedules = updatedSchedules
          .filter(schedule => schedule.date === dateStr)
          .sort((a, b) => {
            if (!a.startTime && !b.startTime) return 0;
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
          });
        setSidebarSchedules(updatedSidebarSchedules);
      }
    };
  };

  // 일정 삭제
  const deleteSchedule = (sidebarDate, setSidebarSchedules, showSidebar, setExpandedEventIds, expandedEventIds) => {
    return (scheduleId) => {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
      setSchedules(updatedSchedules);
      setExpandedEventIds(expandedEventIds.filter(id => id !== scheduleId));
      
      // 사이드바가 열려있고 현재 날짜의 일정이면 사이드바 업데이트
      if (showSidebar && sidebarDate) {
        const dateStr = format(sidebarDate, 'yyyy-MM-dd');
        const updatedSidebarSchedules = updatedSchedules
          .filter(schedule => schedule.date === dateStr)
          .sort((a, b) => {
            if (!a.startTime && !b.startTime) return 0;
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
          });
        setSidebarSchedules(updatedSidebarSchedules);
      }
    };
  };

  // 일정 선택 (수정 모달용)
  const selectScheduleForEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setEditTitle(schedule.title);
    setEditDate(schedule.date);
    setEditStartTime(schedule.startTime || "");
    setEditEndTime(schedule.endTime || "");
    setEditColor(schedule.color);
    setMemo(schedule.memo || "");
  };

  return {
    // 상태
    schedules,
    events,
    selectedDate,
    title,
    startTime,
    endTime,
    color,
    memo,
    selectedSchedule,
    editTitle,
    editDate,
    editStartTime,
    editEndTime,
    editColor,
    
    // 상태 업데이트 함수들
    setSelectedDate,
    setTitle,
    setStartTime,
    setEndTime,
    setColor,
    setMemo,
    setEditTitle,
    setEditDate,
    setEditStartTime,
    setEditEndTime,
    setEditColor,
    
    // 액션 함수들
    addSchedule,
    updateSchedule,
    deleteSchedule,
    selectScheduleForEdit,
  };
}
