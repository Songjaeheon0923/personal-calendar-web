// 색상 카테고리 상수 (시간 자동 설정 포함)
export const CATEGORY_COLORS = [
  { name: "노랑", color: "#ffe066", number: 1, startTime: "09:00", endTime: "10:15" },
  { name: "분홍", color: "#ff6f91", number: 2, startTime: "10:30", endTime: "11:45" },
  { name: "초록", color: "#4ecdc4", number: 3, startTime: "12:00", endTime: "13:15" },
  { name: "파랑", color: "#5fa8d3", number: 4, startTime: "13:30", endTime: "14:45" },
  { name: "주황", color: "#ffb86b", number: 5, startTime: "15:00", endTime: "16:15" },
  { name: "보라", color: "#b39ddb", number: 6, startTime: "16:30", endTime: "17:45" },
  { name: "빨강", color: "#ff595e" },
  { name: "연두", color: "#baffc9" },
];

// 요일 라벨 상수
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 캘린더 메시지 상수
export const CALENDAR_MESSAGES = {
  next: "다음",
  previous: "이전", 
  today: "오늘",
  month: "월",
  week: "주",
  day: "일",
  agenda: "목록",
  date: "날짜",
  time: "시간",
  event: "일정",
  noEventsInRange: "일정이 없습니다.",
};
