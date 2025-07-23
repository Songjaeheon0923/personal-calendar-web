/**
 * 시간 입력 형식 유효성 검사 및 포맷팅 함수
 * @param {string} value - 입력된 시간 문자열
 * @returns {string} 포맷된 시간 문자열 (HH:MM)
 */
export const formatTimeInput = (value) => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) {
    const hour = parseInt(numbers);
    if (hour > 23) return '23:';
    return numbers;
  }
  if (numbers.length <= 4) {
    const hour = parseInt(numbers.substring(0, 2));
    const minute = parseInt(numbers.substring(2));
    
    if (hour > 23) return '23:';
    if (minute > 59) return numbers.substring(0, 2) + ':59';
    
    return numbers.substring(0, 2) + ':' + numbers.substring(2);
  }
  
  // 4자리 이상인 경우 처음 4자리만 사용
  const hour = parseInt(numbers.substring(0, 2));
  const minute = parseInt(numbers.substring(2, 4));
  
  const validHour = hour > 23 ? 23 : hour;
  const validMinute = minute > 59 ? 59 : minute;
  
  return validHour.toString().padStart(2, '0') + ':' + validMinute.toString().padStart(2, '0');
};

/**
 * 시간 형식 유효성 검사
 * @param {string} time - 검사할 시간 문자열
 * @returns {boolean} 유효한 형식 여부
 */
export const validateTimeFormat = (time) => {
  if (!time) return true;
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
};
