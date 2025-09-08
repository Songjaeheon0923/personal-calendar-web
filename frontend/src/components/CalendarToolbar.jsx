import { format } from "date-fns";

function CalendarToolbar({ date, onNavigate, onOpenMonthPicker, disabled }) {
  const yearMonth = format(date, "yyyy년 M월");
  
  const handleNavigation = (direction) => {
    if (disabled) return;
    
    const currentDate = new Date(date);
    if (direction === "PREV") {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (direction === "NEXT") {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    onNavigate(currentDate);
  };
  
  return (
    <div className="flex items-center justify-start px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          className={`text-2xl px-3 py-2 rounded-lg transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 active:bg-gray-200'
          }`}
          onClick={() => handleNavigation("PREV")}
          aria-label="이전 달"
          disabled={disabled}
        >
          ◀
        </button>
        
        <button
          className={`text-2xl font-bold px-4 py-2 rounded-lg transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 active:bg-gray-200'
          }`}
          onClick={disabled ? undefined : onOpenMonthPicker}
          disabled={disabled}
        >
          {yearMonth}
        </button>
        
        <button
          className={`text-2xl px-3 py-2 rounded-lg transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 active:bg-gray-200'
          }`}
          onClick={() => handleNavigation("NEXT")}
          aria-label="다음 달"
          disabled={disabled}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default CalendarToolbar;