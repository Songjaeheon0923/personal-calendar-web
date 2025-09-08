/**
 * API Service for Frontend-Backend Communication
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic HTTP request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.defaultHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ============ EVENT OPERATIONS ============

  /**
   * Get all events with optional date filtering
   */
  async getEvents(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/events?${searchParams}`);
  }

  /**
   * Get events within a date range
   */
  async getEventsByDateRange(startDate, endDate) {
    return this.getEvents({
      start: startDate,
      end: endDate
    });
  }

  /**
   * Get a specific event by ID
   */
  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  /**
   * Create a new event
   */
  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId, eventData) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get event change history
   */
  async getEventHistory(eventId) {
    return this.request(`/events/${eventId}/history`);
  }

  // ============ CALENDAR OPERATIONS ============
  // Simplified - no calendars needed for personal use
  async getCalendars() {
    return [{ id: 'default', name: 'Personal', color: '#3b82f6' }];
  }

  // ============ CATEGORY OPERATIONS ============

  /**
   * Get all categories
   */
  async getCategories() {
    return this.request('/categories');
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  // ============ RECURRING EVENT OPERATIONS ============
  // Simplified - no recurring events for now
  async createRecurringEvent(eventData, recurrenceRule) {
    // For now, just create a single event
    return this.createEvent(eventData);
  }

  // ============ UTILITY METHODS ============

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Convert legacy schedule format to API format
   */
  convertLegacyScheduleToEvent(schedule) {
    // Parse dates without timezone conversion issues
    const parseLocalDate = (dateInput) => {
      // If already a Date object, extract date string
      if (dateInput instanceof Date) {
        const year = dateInput.getFullYear();
        const month = (dateInput.getMonth() + 1).toString().padStart(2, '0');
        const day = dateInput.getDate().toString().padStart(2, '0');
        return new Date(year, dateInput.getMonth(), dateInput.getDate());
      }
      
      // If string, parse it
      if (typeof dateInput === 'string') {
        const [year, month, day] = dateInput.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
      }
      
      // Fallback
      console.warn('Unexpected date format:', dateInput);
      return new Date(dateInput);
    };

    const startDate = parseLocalDate(schedule.date);
    const endDate = parseLocalDate(schedule.endDate || schedule.date);

    // Add time if provided
    if (schedule.startTime) {
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    } else {
      // For all-day events, set to start of day
      startDate.setHours(0, 0, 0, 0);
    }

    if (schedule.endTime) {
      const [hours, minutes] = schedule.endTime.split(':').map(Number);
      endDate.setHours(hours, minutes, 0, 0);
    } else {
      // For all-day events, set to end of day
      endDate.setHours(23, 59, 59, 999);
    }

    return {
      title: schedule.title,
      description: schedule.memo || '',
      start_datetime: startDate.toISOString(),
      end_datetime: endDate.toISOString(),
      is_all_day: !schedule.startTime && !schedule.endTime,
      color: schedule.color || '#3b82f6',
      timezone: 'Asia/Seoul'
    };
  }

  /**
   * Convert API event format to legacy schedule format
   */
  convertEventToLegacySchedule(event) {
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);

    // Format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      id: event.id, // Keep original UUID for API operations
      title: event.title,
      date: formatLocalDate(startDate),
      endDate: formatLocalDate(endDate),
      startTime: event.is_all_day ? '' : startDate.toTimeString().substring(0, 5),
      endTime: event.is_all_day ? '' : endDate.toTimeString().substring(0, 5),
      color: event.color,
      memo: event.description || ''
    };
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;