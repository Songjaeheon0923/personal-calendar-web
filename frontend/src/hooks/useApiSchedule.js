/**
 * useApiSchedule Hook
 * Manages calendar events using the backend API
 * Replaces the old useSchedule hook with API-based operations
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { format } from "date-fns";
import apiService from "../services/api.js";
import { CATEGORY_COLORS } from "../constants";

export function useApiSchedule() {
  // API data state
  const [schedules, setSchedules] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastDeletedSchedule, setLastDeletedSchedule] = useState(null);
  
  // Form states (keeping same interface as original)
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0]?.color || "#ffe066");
  const [memo, setMemo] = useState("");

  // Edit form states
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editColor, setEditColor] = useState(CATEGORY_COLORS[0]?.color || "#ffe066");
  const [editMemo, setEditMemo] = useState("");

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load initial data from API
   */
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsData, calendarsData, categoriesData] = await Promise.all([
        apiService.getEvents(),
        apiService.getCalendars(),
        apiService.getCategories()
      ]);

      // Convert API events to legacy schedule format
      const convertedSchedules = eventsData.map(event => 
        apiService.convertEventToLegacySchedule(event)
      );
      
      setSchedules(convertedSchedules);
      setCalendars(calendarsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError(err.message);
      
      // Fallback to localStorage if API fails
      try {
        const localSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        setSchedules(localSchedules);
      } catch (localErr) {
        console.error('Failed to load from localStorage:', localErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh data from API
   */
  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  // Convert to react-big-calendar events (same as original)
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

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          console.warn('Invalid date found in schedule:', s);
          return null;
        }

        return {
          id: s.id,
          title: s.title,
          start: startDateTime,
          end: endDateTime,
          allDay: !s.startTime && !s.endTime,
          color: s.color,
          startTime: s.startTime,
          endTime: s.endTime,
          resource: {
            id: s.id,
            memo: s.memo,
            date: s.date,
            endDate: s.endDate,
            startTime: s.startTime,
            endTime: s.endTime,
            title: s.title,
            color: s.color
          }
        };
      } catch (error) {
        console.error('Error converting schedule to event:', error, s);
        return null;
      }
    }).filter(Boolean);
  }, [schedules]);

  /**
   * Filter schedules by date
   */
  const getFilteredSchedules = useCallback((scheduleList, targetDate) => {
    if (!targetDate || !Array.isArray(scheduleList)) return [];
    
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    
    return scheduleList.filter(schedule => {
      if (!schedule?.date) return false;
      
      const startDate = schedule.date;
      const endDate = schedule.endDate || schedule.date;
      
      return targetDateStr >= startDate && targetDateStr <= endDate;
    });
  }, []);

  /**
   * Add new schedule via API
   */
  const addSchedule = useCallback((sidebarDate, setSidebarSchedules, showSidebar) => {
    return async (e) => {
      e.preventDefault();
      
      if (!title?.trim() || !selectedDate) {
        console.warn('Required fields missing for schedule creation');
        return;
      }
      
      try {
        setLoading(true);
        
        // Convert to API format
        const eventData = apiService.convertLegacyScheduleToEvent({
          title: title.trim(),
          date: selectedDate,
          endDate: endDate || selectedDate,
          startTime: startTime || "",
          endTime: endTime || "",
          color: color || CATEGORY_COLORS[0]?.color,
          memo: memo || ""
        });

        // Create via API
        const createdEvent = await apiService.createEvent(eventData);
        
        // Convert back to legacy format and update local state
        const newSchedule = apiService.convertEventToLegacySchedule(createdEvent);
        const updatedSchedules = [...schedules, newSchedule];
        setSchedules(updatedSchedules);
        
        // Update sidebar if needed
        if (showSidebar && sidebarDate && setSidebarSchedules) {
          const updatedSidebarSchedules = getFilteredSchedules(updatedSchedules, sidebarDate);
          setSidebarSchedules(updatedSidebarSchedules);
        }

        // Reset form
        setTitle("");
        setMemo("");
        setStartTime("");
        setEndTime("");
        setColor(CATEGORY_COLORS[0]?.color || "#ffe066");
        
        console.log('Schedule created successfully via API');
      } catch (error) {
        console.error('Error creating schedule via API:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  }, [title, selectedDate, endDate, startTime, endTime, color, memo, schedules, getFilteredSchedules]);

  /**
   * Update schedule via API
   */
  const updateSchedule = useCallback((sidebarDate, setSidebarSchedules, showSidebar) => {
    return async (e) => {
      e.preventDefault();
      
      if (!editTitle?.trim() || !editDate || !selectedSchedule) {
        console.warn('Required fields missing for update');
        return;
      }
      
      try {
        setLoading(true);
        
        // Convert to API format
        const eventData = apiService.convertLegacyScheduleToEvent({
          title: editTitle.trim(),
          date: editDate,
          endDate: editEndDate || editDate,
          startTime: editStartTime || "",
          endTime: editEndTime || "",
          color: editColor || CATEGORY_COLORS[0]?.color,
          memo: editMemo || ""
        });

        // Update via API
        const updatedEvent = await apiService.updateEvent(selectedSchedule.id, eventData);
        
        // Convert back and update local state
        const updatedSchedule = apiService.convertEventToLegacySchedule(updatedEvent);
        const updatedSchedules = schedules.map(schedule => 
          schedule.id === selectedSchedule.id ? updatedSchedule : schedule
        );
        setSchedules(updatedSchedules);
        
        // Update sidebar if needed
        if (showSidebar && sidebarDate && setSidebarSchedules) {
          const updatedSidebarSchedules = getFilteredSchedules(updatedSchedules, sidebarDate);
          setSidebarSchedules(updatedSidebarSchedules);
        }
        
        console.log('Schedule updated successfully via API');
      } catch (error) {
        console.error('Error updating schedule via API:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  }, [editTitle, editDate, editEndDate, editStartTime, editEndTime, editColor, editMemo, selectedSchedule, schedules, getFilteredSchedules]);

  /**
   * Delete schedule via API
   */
  const deleteSchedule = useCallback((sidebarDate, setSidebarSchedules, showSidebar, setExpandedEventIds, expandedEventIds) => {
    return async (scheduleId) => {
      if (!scheduleId) {
        console.warn('Schedule ID is required for deletion');
        return;
      }
      
      try {
        setLoading(true);
        
        // Find the schedule to be deleted and save it for undo
        const scheduleToDelete = schedules.find(schedule => schedule.id === scheduleId);
        if (scheduleToDelete) {
          setLastDeletedSchedule(scheduleToDelete);
        }
        
        // Delete via API
        await apiService.deleteEvent(scheduleId);
        
        // Update local state
        const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
        setSchedules(updatedSchedules);
        
        if (setExpandedEventIds && Array.isArray(expandedEventIds)) {
          setExpandedEventIds(expandedEventIds.filter(id => id !== scheduleId));
        }
        
        // Update sidebar if needed
        if (showSidebar && sidebarDate && setSidebarSchedules) {
          const updatedSidebarSchedules = getFilteredSchedules(updatedSchedules, sidebarDate);
          setSidebarSchedules(updatedSidebarSchedules);
        }
        
        console.log('Schedule deleted successfully via API');
      } catch (error) {
        console.error('Error deleting schedule via API:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  }, [schedules, getFilteredSchedules]);

  /**
   * Undo last deleted schedule
   */
  const undoDeleteSchedule = useCallback(async () => {
    if (!lastDeletedSchedule) {
      console.warn('No schedule to undo');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert to API format
      const eventData = apiService.convertLegacyScheduleToEvent(lastDeletedSchedule);
      
      // Create via API (restore the schedule)
      const createdEvent = await apiService.createEvent(eventData);
      
      // Convert back to legacy format and update local state
      const restoredSchedule = apiService.convertEventToLegacySchedule(createdEvent);
      const updatedSchedules = [...schedules, restoredSchedule];
      setSchedules(updatedSchedules);
      
      // Clear the undo state
      setLastDeletedSchedule(null);
      
      console.log('Schedule restored successfully');
    } catch (error) {
      console.error('Error restoring schedule:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [lastDeletedSchedule, schedules]);

  /**
   * Select schedule for editing (same as original)
   */
  const selectScheduleForEdit = useCallback((schedule) => {
    if (!schedule) {
      console.warn('Schedule is required for editing');
      return;
    }
    
    try {
      console.log('selectScheduleForEdit - schedule:', schedule);
      setSelectedSchedule(schedule);
      setEditTitle(schedule.title || '');
      setEditDate(schedule.date || '');
      setEditEndDate(schedule.endDate || '');
      setEditStartTime(schedule.startTime || '');
      setEditEndTime(schedule.endTime || '');
      setEditColor(schedule.color || CATEGORY_COLORS[0]?.color);
      setEditMemo(schedule.memo || '');
    } catch (error) {
      console.error('Error selecting schedule for edit:', error);
    }
  }, []);

  return {
    // Data
    schedules,
    calendars,
    categories,
    events,
    loading,
    error,
    
    // Add form states
    selectedDate,
    setSelectedDate,
    endDate,
    setEndDate,
    title,
    setTitle,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    color,
    setColor,
    memo,
    setMemo,
    
    // Edit form states
    selectedSchedule,
    setSelectedSchedule,
    editTitle,
    setEditTitle,
    editDate,
    setEditDate,
    editEndDate,
    setEditEndDate,
    editStartTime,
    setEditStartTime,
    editEndTime,
    setEditEndTime,
    editColor,
    setEditColor,
    editMemo,
    setEditMemo,
    
    // Operations
    addSchedule,
    updateSchedule,
    deleteSchedule,
    selectScheduleForEdit,
    getFilteredSchedules,
    refreshData,
    undoDeleteSchedule,
    
    // Undo state
    lastDeletedSchedule,
    
    // API utilities
    apiService
  };
}