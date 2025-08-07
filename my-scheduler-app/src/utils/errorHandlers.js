// 전역 에러 핸들러
export const handleError = (error, context = 'Unknown', showToUser = false) => {
  console.error(`Error in ${context}:`, error);
  
  if (showToUser) {
    // 사용자에게 보여줄 에러 메시지
    const userMessage = getUserFriendlyMessage(error, context);
    // 실제 프로덕션에서는 toast나 modal을 통해 표시
    console.warn(`User message: ${userMessage}`);
  }
};

// 사용자 친화적 에러 메시지 생성
const getUserFriendlyMessage = (error, context) => {
  const errorMessages = {
    'localStorage': '데이터 저장 중 문제가 발생했습니다.',
    'schedule': '일정 처리 중 문제가 발생했습니다.',
    'calendar': '캘린더 표시 중 문제가 발생했습니다.',
    'ui': '화면 표시 중 문제가 발생했습니다.',
    'network': '네트워크 연결을 확인해주세요.',
    'validation': '입력한 정보를 다시 확인해주세요.',
    'default': '예상치 못한 문제가 발생했습니다.'
  };
  
  return errorMessages[context.toLowerCase()] || errorMessages.default;
};

// 안전한 함수 실행 래퍼
export const safeExecute = async (fn, context = 'Function', fallback = null) => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context, true);
    return fallback;
  }
};

// 안전한 JSON 파싱
export const safeJSONParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    handleError(error, 'JSON Parse');
    return fallback;
  }
};

// 안전한 JSON 직렬화
export const safeJSONStringify = (data, fallback = '{}') => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    handleError(error, 'JSON Stringify');
    return fallback;
  }
};

// 에러 바운더리용 에러 리포터
export const reportError = (error, errorInfo) => {
  console.error('React Error Boundary caught an error:', error, errorInfo);
  
  // 실제 프로덕션에서는 여기서 에러 리포팅 서비스로 전송
  // 예: Sentry, LogRocket 등
};

// 개발 모드에서만 실행되는 검증 함수
export const devAssert = (condition, message) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && !condition) {
    console.error(`Assertion failed: ${message}`);
  }
};