/**
 * Time utility functions
 */

/**
 * Format time input to HH:MM format
 */
export function formatTimeInput(timeString) {
  if (!timeString) return '';
  
  // Remove any non-digit characters
  const digits = timeString.replace(/\D/g, '');
  
  // If empty, return empty
  if (!digits) return '';
  
  // Format based on length
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    const hours = digits.slice(0, 2);
    const minutes = digits.slice(2, 4);
    return `${hours}:${minutes}`;
  } else {
    // Limit to 4 digits (HHMM)
    const hours = digits.slice(0, 2);
    const minutes = digits.slice(2, 4);
    return `${hours}:${minutes}`;
  }
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTime(timeString) {
  if (!timeString) return true; // Empty is valid
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Parse time string to minutes from midnight
 */
export function timeToMinutes(timeString) {
  if (!timeString) return 0;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Convert minutes from midnight to time string
 */
export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Limit time to 24:00 maximum (for end times)
 */
export function limitEndTime(timeString) {
  if (!timeString) return timeString;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // If time is past 24:00, set to 24:00
  if (hours >= 24) {
    return '24:00';
  }
  
  return timeString;
}

/**
 * Validate and limit time input for end time
 */
export function validateAndLimitEndTime(timeString) {
  if (!timeString) return '';
  
  // First format the input
  const formattedTime = formatTimeInput(timeString);
  
  // Then limit to 24:00 if needed
  return limitEndTime(formattedTime);
}