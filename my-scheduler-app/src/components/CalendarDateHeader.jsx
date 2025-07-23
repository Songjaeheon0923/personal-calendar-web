import { isSameMonth, isToday } from "date-fns";

function CalendarDateHeader({ label, date, drilldownView, onDrillDown, ...props }) {
  const isCurrentMonth = isSameMonth(date, props.currentDate);
  const isCurrentDay = isToday(date);
  const day = date.getDay();
  let color = "#222";
  let style = {};
  
  if (!isCurrentMonth) {
    // 다음달/전달 날짜 - 배경 제거, 색상만 적용
    color = "#9ca3af";
  } else {
    if (day === 0) color = "#ef4444";
    else if (day === 6) color = "#2563eb";
  }
  
  if (isCurrentDay) {
    // 오늘 날짜도 배경 제거, CSS에서 처리
    style.fontWeight = 700;
    style.fontSize = "1.15rem";
    style.color = "#1d4ed8";
  } else {
    style.fontWeight = 500;
    style.fontSize = "1.05rem";
    style.color = color;
  }
  
  return (
    <div className={`flex justify-end pr-2 pt-2 select-none`} style={style}>
      {label}
    </div>
  );
}

export default CalendarDateHeader;
