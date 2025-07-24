import { isToday } from "date-fns";

function CalendarDateHeader({ label, date }) {
  const isCurrentDay = isToday(date);
  const day = date.getDay(); // 0 = 일요일, 6 = 토요일
  
  // 요일별 색상 클래스 설정
  let colorClass = "text-gray-800"; // 기본 색상 (평일)
  if (day === 0) {
    colorClass = "text-red-500"; // 일요일 - 빨간색
  } else if (day === 6) {
    colorClass = "text-blue-600"; // 토요일 - 파란색
  }
  
  // 오늘 날짜도 일반적인 요일 색상 규칙 적용 (배경 제거)
  let fontWeight = "font-medium";
  if (isCurrentDay) {
    fontWeight = "font-bold"; // 오늘 날짜는 굵게만 표시
  }
  
  return (
    <div className={`flex justify-end pr-2 pt-1 select-none ${colorClass} ${fontWeight} text-lg`}>
      {label}
    </div>
  );
}

export default CalendarDateHeader;
