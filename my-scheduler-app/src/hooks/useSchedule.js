import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import useLocalStorage from "./useLocalStorage";
import { CATEGORY_COLORS } from "../constants";

export function useSchedule() {
  const [schedules, setSchedules] = useLocalStorage("schedules", []);
  
  // 일정 추가 폼 상태
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0]?.color || "#ffe066");
  const [memo, setMemo] = useState("");

  // 일정 수정 폼 상태
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editColor, setEditColor] = useState(CATEGORY_COLORS[0]?.color || "#ffe066");
  const [editMemo, setEditMemo] = useState("");

  // react-big-calendar의 event 포맷으로 변환
  const events = useMemo(() => {
    if (!Array.isArray(schedules)) return [];
    
    return schedules.map((s) => {
      try {
        const startDate = s.date;
        const endDate = s.endDate || s.date;
        
        let startDateTime, endDateTime;
        
        if (s.startTime || s.endTime) {
          startDateTime = new Date(`${startDate}T${s.startTime || '00:00'}`);
          endDateTime = new Date(`${endDate}T${s.endTime || '23:59'}`);
        } else {
          startDateTime = new Date(`${startDate}T00:00`);
          endDateTime = new Date(`${endDate}T23:59`);
        }

        // 유효하지 않은 날짜 체크
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          console.warn('Invalid date found in schedule:', s);
          return null;
        }

        return {
          id: s.id,
          title: s.title || '제목 없음',
          start: startDateTime,
          end: endDateTime,
          color: s.color || CATEGORY_COLORS[0]?.color,
          startTime: s.startTime,
          endTime: s.endTime,
          resource: s,
          allDay: !s.startTime && !s.endTime,
        };
      } catch (error) {
        console.error('Error processing schedule:', s, error);
        return null;
      }
    }).filter(Boolean);
  }, [schedules]);

  // 사이드바 스케줄 필터링 및 정렬 로직
  const getFilteredSchedules = useCallback((schedules, targetDate) => {
    if (!targetDate || !Array.isArray(schedules)) return [];
    
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    return schedules.filter(schedule => {
      try {
        const start = new Date(schedule.date);
        const end = schedule.endDate ? new Date(schedule.endDate) : start;
        const target = new Date(targetDateStr);
        return target >= start && target <= end;
      } catch (error) {
        console.error('Error filtering schedule:', schedule, error);
        return false;
      }
    }).sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  }, []);

  // 일정 추가
  const addSchedule = useCallback((sidebarDate, setSidebarSchedules, showSidebar) => {
    return (e) => {
      e.preventDefault();
      
      if (!title?.trim() || !selectedDate) {
        console.warn('Title or selectedDate is missing');
        return;
      }
      
      try {
        const newSchedule = {
          id: Date.now() + Math.random(),
          title: title.trim(),
          date: format(selectedDate, "yyyy-MM-dd"),
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
          startTime: startTime || "",
          endTime: endTime || "",
          color: color || CATEGORY_COLORS[0]?.color,
          memo: memo || "",
        };
        
        const updatedSchedules = [...schedules, newSchedule];
        setSchedules(updatedSchedules);
        
        // 폼 초기화
        setTitle("");
        setStartTime("");
        setEndTime("");
        setMemo("");
        
        // 실시간 사이드바 업데이트
        if (showSidebar && sidebarDate && setSidebarSchedules) {
          const updatedSidebarSchedules = getFilteredSchedules(updatedSchedules, sidebarDate);
          setSidebarSchedules(updatedSidebarSchedules);
        }
      } catch (error) {
        console.error('Error adding schedule:', error);
      }
    };
  }, [title, selectedDate, endDate, startTime, endTime, color, memo, schedules, getFilteredSchedules]);

  // 일정 수정
  const updateSchedule = useCallback((sidebarDate, setSidebarSchedules, showSidebar) => {
    return (e) => {
      e.preventDefault();
      
      if (!editTitle?.trim() || !editDate || !selectedSchedule) {
        console.warn('Required fields missing for update');
        return;
      }
      
      try {
        const updatedSchedules = schedules.map(schedule => 
          schedule.id === selectedSchedule.id 
            ? { 
                ...schedule, 
                title: editTitle.trim(),
                date: editDate,
                endDate: editEndDate || null,
                startTime: editStartTime || "",
                endTime: editEndTime || "",
                color: editColor || CATEGORY_COLORS[0]?.color,
                memo: editMemo || ""
              }
            : schedule
        );
        setSchedules(updatedSchedules);
        
        // 사이드바 업데이트
        if (showSidebar && sidebarDate && setSidebarSchedules) {
          const updatedSidebarSchedules = getFilteredSchedules(updatedSchedules, sidebarDate);
          setSidebarSchedules(updatedSidebarSchedules);
        }
      } catch (error) {
        console.error('Error updating schedule:', error);
      }
    };
  }, [editTitle, editDate, editEndDate, editStartTime, editEndTime, editColor, editMemo, selectedSchedule, schedules, getFilteredSchedules]);

  // 일정 삭제
  const deleteSchedule = useCallback((sidebarDate, setSidebarSchedules, showSidebar, setExpandedEventIds, expandedEventIds) => {
    return (scheduleId) => {
      if (!scheduleId) {
        console.warn('Schedule ID is required for deletion');
        return;
      }
      
      try {
        const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
        setSchedules(updatedSchedules);
        
        if (setExpandedEventIds && Array.isArray(expandedEventIds)) {
          setExpandedEventIds(expandedEventIds.filter(id => id !== scheduleId));
        }
        
        // 사이드바 업데이트
        if (showSidebar && sidebarDate && setSidebarSchedules) {
          const updatedSidebarSchedules = getFilteredSchedules(updatedSchedules, sidebarDate);
          setSidebarSchedules(updatedSidebarSchedules);
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    };
  }, [schedules, getFilteredSchedules]);

  // 일정 선택 (수정 모달용)
  const selectScheduleForEdit = useCallback((schedule) => {
    if (!schedule) {
      console.warn('Schedule is required for editing');
      return;
    }
    
    try {
      setSelectedSchedule(schedule);
      setEditTitle(schedule.title || "");
      setEditDate(schedule.date || "");
      setEditEndDate(schedule.endDate || "");
      setEditStartTime(schedule.startTime || "");
      setEditEndTime(schedule.endTime || "");
      setEditColor(schedule.color || CATEGORY_COLORS[0]?.color);
      setEditMemo(schedule.memo || "");
    } catch (error) {
      console.error('Error selecting schedule for edit:', error);
    }
  }, []);

  return {
    // 상태
    schedules,
    events,
    selectedDate,
    endDate,
    title,
    startTime,
    endTime,
    color,
    memo,
    selectedSchedule,
    editTitle,
    editDate,
    editEndDate,
    editStartTime,
    editEndTime,
    editColor,
    editMemo,
    
    // 상태 업데이트 함수들
    setSelectedDate,
    setEndDate,
    setTitle,
    setStartTime,
    setEndTime,
    setColor,
    setMemo,
    setEditTitle,
    setEditDate,
    setEditEndDate,
    setEditStartTime,
    setEditEndTime,
    setEditColor,
    setEditMemo,
    
    // 액션 함수들
    addSchedule,
    updateSchedule,
    deleteSchedule,
    selectScheduleForEdit,
    getFilteredSchedules,
  };
}