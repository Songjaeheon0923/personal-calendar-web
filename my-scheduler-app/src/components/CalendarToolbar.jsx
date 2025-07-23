import { format } from "date-fns";
import { WEEKDAYS } from "../constants";

function CalendarToolbar({ date, onNavigate, onOpenMonthPicker, disabled }) {
  const yearMonth = format(date, "yyyy년 M월");
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-start px-6 py-4 bg-white">
        <button
          className={`text-2xl px-2 py-1 rounded ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
          onClick={disabled ? undefined : () => onNavigate("PREV")}
          aria-label="이전 달"
          style={{ marginRight: "2rem" }}
          disabled={disabled}
        >
          ◀
        </button>
        <button
          className={`text-2xl font-bold select-none mx-8 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          style={{ background: "none", color: "#222", border: "none", boxShadow: "none", padding: 0 }}
          onClick={disabled ? undefined : onOpenMonthPicker}
          disabled={disabled}
        >
          {yearMonth}
        </button>
        <button
          className={`text-2xl px-2 py-1 rounded ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
          onClick={disabled ? undefined : () => onNavigate("NEXT")}
          aria-label="다음 달"
          style={{ marginLeft: "2rem" }}
          disabled={disabled}
        >
          ▶
        </button>
      </div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center font-bold text-base bg-white pb-2">
        {WEEKDAYS.map((d, i) => (
          <span
            key={d}
            style={{
              color:
                i === 0
                  ? "#ef4444"
                  : i === 6
                  ? "#2563eb"
                  : "#222",
              opacity: i === 0 || i === 6 ? 0.7 : 1,
              background: "none",
              border: "none",
            }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

export default CalendarToolbar;
