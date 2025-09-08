import { format } from "date-fns";

// 날짜 유효성 검증
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

// 안전한 날짜 포맷팅
export const safeFormatDate = (date, formatString = 'yyyy-MM-dd', fallback = '') => {
  try {
    if (!isValidDate(date)) {
      return fallback;
    }
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

// 문자열을 Date 객체로 안전하게 변환
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return isValidDate(date) ? date : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

// 날짜 범위 검증 (시작일 <= 종료일)
export const validateDateRange = (startDate, endDate) => {
  if (!startDate) return { valid: false, error: '시작 날짜가 필요합니다.' };
  if (!endDate) return { valid: true }; // 종료일은 선택사항
  
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;
  
  if (!isValidDate(start)) {
    return { valid: false, error: '올바른 시작 날짜를 입력해주세요.' };
  }
  
  if (!isValidDate(end)) {
    return { valid: false, error: '올바른 종료 날짜를 입력해주세요.' };
  }
  
  if (end < start) {
    return { valid: false, error: '종료 날짜는 시작 날짜 이후여야 합니다.' };
  }
  
  return { valid: true };
};

// 날짜가 특정 범위 내에 있는지 확인
export const isDateInRange = (targetDate, startDate, endDate = null) => {
  try {
    const target = typeof targetDate === 'string' ? parseDate(targetDate) : targetDate;
    const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
    const end = endDate ? (typeof endDate === 'string' ? parseDate(endDate) : endDate) : start;
    
    if (!isValidDate(target) || !isValidDate(start) || !isValidDate(end)) {
      return false;
    }
    
    return target >= start && target <= end;
  } catch (error) {
    console.error('Error checking date range:', error);
    return false;
  }
};

// 오늘 날짜인지 확인
export const isToday = (date) => {
  try {
    const target = typeof date === 'string' ? parseDate(date) : date;
    const today = new Date();
    
    if (!isValidDate(target)) return false;
    
    return target.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};