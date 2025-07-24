import { useState, useMemo } from "react";
import { format } from "date-fns";
import useLocalStorage from "./useLocalStorage";
import { CATEGORY_COLORS } from "../constants";

export function useSchedule() {
  const [schedules, setSchedules] = useLocalStorage("schedules", []);
  
  // 일정 추가 폼 상태
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null); // 종료 날짜 추가
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0].color);
  const [memo, setMemo] = useState("");

  // 일정 수정 폼 상태
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editEndDate, setEditEndDate] = useState(""); // 종료 날짜 수정용 추가
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editColor, setEditColor] = useState(CATEGORY_COLORS[0].color);
  const [editMemo, setEditMemo] = useState(""); // 수정용 메모 상태 추가

  // react-big-calendar의 event 포맷으로 변환
  const events = useMemo(() =>
    schedules.map((s) => {
      // 시작 날짜와 종료 날짜 설정
      const startDate = s.date;
      const endDate = s.endDate || s.date; // 종료 날짜가 없으면 시작 날짜와 동일
      
      // 시간이 있는 경우와 없는 경우 처리
      let startDateTime, endDateTime;
      
      if (s.startTime || s.endTime) {
        // 시간이 있는 경우: 첫 날의 시작 시간부터 마지막 날의 종료 시간까지
        startDateTime = new Date(startDate + (s.startTime ? 'T' + s.startTime : 'T00:00'));
        endDateTime = new Date(endDate + (s.endTime ? 'T' + s.endTime : 'T23:59'));
      } else {
        // 하루 종일 이벤트인 경우: 여러 날짜에 걸쳐 표시
        startDateTime = new Date(startDate + 'T00:00');
        endDateTime = new Date(endDate + 'T23:59');
      }

      return {
        id: s.id,
        title: s.title,
        start: startDateTime,
        end: endDateTime,
        color: s.color,
        startTime: s.startTime,
        endTime: s.endTime,
        resource: s,
        allDay: !s.startTime && !s.endTime, // 하루 종일 이벤트 여부
      };
    }),
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
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : null, // 종료 날짜 추가
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
              endDate: editEndDate || null, // 종료 날짜 수정 추가
              startTime: editStartTime,
              endTime: editEndTime,
              color: editColor,
              memo: editMemo // 수정용 메모 상태 사용
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
    setEditEndDate(schedule.endDate || ""); // 종료 날짜 설정 추가
    setEditStartTime(schedule.startTime || "");
    setEditEndTime(schedule.endTime || "");
    setEditColor(schedule.color);
    setEditMemo(schedule.memo || ""); // 수정용 메모 상태 사용
  };

  return {
    // 상태
    schedules,
    events,
    selectedDate,
    endDate, // 종료 날짜 추가
    title,
    startTime,
    endTime,
    color,
    memo,
    selectedSchedule,
    editTitle,
    editDate,
    editEndDate, // 종료 날짜 수정용 추가
    editStartTime,
    editEndTime,
    editColor,
    editMemo, // 수정용 메모 상태 추가
    
    // 상태 업데이트 함수들
    setSelectedDate,
    setEndDate, // 종료 날짜 설정 함수 추가
    setTitle,
    setStartTime,
    setEndTime,
    setColor,
    setMemo,
    setEditTitle,
    setEditDate,
    setEditEndDate, // 종료 날짜 수정 함수 추가
    setEditStartTime,
    setEditEndTime,
    setEditColor,
    setEditMemo, // 수정용 메모 설정 함수 추가
    
    // 액션 함수들
    addSchedule,
    updateSchedule,
    deleteSchedule,
    selectScheduleForEdit,
  };
}
