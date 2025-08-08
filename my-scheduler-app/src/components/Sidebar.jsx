import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState, useEffect, useCallback } from "react";
import { renderContentWithLinks } from "../utils/textUtils";

function Sidebar({ 
  showSidebar, 
  sidebarDate, 
  schedules,
  expandedEventIds,
  onClose,
  onToggleExpand,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule
}) {
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  const filterAndSortSchedules = useCallback((schedules, targetDate) => {
    if (!Array.isArray(schedules) || !targetDate) return [];
    
    try {
      const targetDateStr = format(targetDate, 'yyyy-MM-dd');
      return schedules.filter(schedule => {
        try {
          const start = new Date(schedule.date);
          const end = schedule.endDate ? new Date(schedule.endDate) : start;
          const target = new Date(targetDateStr);
          return target >= start && target <= end;
        } catch (error) {
          console.error('Error filtering schedule in sidebar:', schedule, error);
          return false;
        }
      }).sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (error) {
      console.error('Error in filterAndSortSchedules:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!showSidebar || !sidebarDate) {
      setFilteredSchedules([]);
      return;
    }
    
    const result = filterAndSortSchedules(schedules, sidebarDate);
    setFilteredSchedules(result);
  }, [showSidebar, sidebarDate, schedules, filterAndSortSchedules]);

  return (
    <>
      {/* 사이드바 */}
      <div className={`fixed top-0 right-0 h-full w-[70vw] max-w-[220px] sm:w-[50vw] sm:max-w-[220px] md:w-96 md:max-w-md bg-white shadow-2xl transform transition-all duration-300 ease-in-out z-40 ${
        showSidebar ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className={`p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 transform transition-all duration-400 ease-out ${
          showSidebar ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {sidebarDate && format(sidebarDate, 'M월 d일', { locale: ko })}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {sidebarDate && format(sidebarDate, 'EEEE', { locale: ko })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full"
            >
              ✕
            </button>
          </div>
          
          {/* 일정 추가 버튼 */}
          <button
            onClick={onAddSchedule}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <span>+</span>
            이 날에 일정 추가
          </button>
        </div>
        
        <div className={`flex-1 overflow-y-auto p-6 transform transition-all duration-400 ease-out delay-75 ${
          showSidebar ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {filteredSchedules.length > 0 ? (
            <div className="space-y-3">
              {filteredSchedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onToggleExpand(schedule.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // 간단한 컨텍스트 메뉴 표시
                      const rect = e.currentTarget.getBoundingClientRect();
                      const menu = document.createElement('div');
                      menu.className = 'fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 min-w-[120px]';
                      menu.style.left = `${e.clientX}px`;
                      menu.style.top = `${e.clientY}px`;
                      
                      // 수정 버튼
                      const editBtn = document.createElement('button');
                      editBtn.className = 'w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2';
                      editBtn.innerHTML = '<span>✏️</span> 수정';
                      editBtn.onclick = () => {
                        onEditSchedule(schedule);
                        document.body.removeChild(menu);
                      };
                      
                      // 삭제 버튼  
                      const deleteBtn = document.createElement('button');
                      deleteBtn.className = 'w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2';
                      deleteBtn.innerHTML = '<span>🗑️</span> 삭제';
                      deleteBtn.onclick = () => {
                        if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
                          onDeleteSchedule(schedule.id);
                        }
                        document.body.removeChild(menu);
                      };
                      
                      menu.appendChild(editBtn);
                      menu.appendChild(deleteBtn);
                      document.body.appendChild(menu);
                      
                      // 클릭 외부 영역 클릭시 메뉴 닫기
                      const closeMenu = (event) => {
                        if (!menu.contains(event.target)) {
                          document.body.removeChild(menu);
                          document.removeEventListener('click', closeMenu);
                        }
                      };
                      
                      setTimeout(() => {
                        document.addEventListener('click', closeMenu);
                      }, 100);
                    }}
                    style={{
                      borderLeft: `4px solid ${schedule.color || '#ffe066'}`,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {schedule.title}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {(() => {
                              const hasStartTime = schedule.startTime;
                              const hasEndTime = schedule.endTime;
                              
                              if (!hasStartTime && !hasEndTime) {
                                return '시간미정';
                              } else if (hasStartTime && !hasEndTime) {
                                return `${schedule.startTime} ~`;
                              } else if (!hasStartTime && hasEndTime) {
                                return `~ ${schedule.endTime}`;
                              } else {
                                return `${schedule.startTime} ~ ${schedule.endTime}`;
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: schedule.color || '#ffe066' }}
                        ></div>
                        <span className={`text-gray-400 transition-transform duration-200 ${
                          expandedEventIds.includes(schedule.id) ? 'rotate-180' : ''
                        }`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 확장된 상세 정보 */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedEventIds.includes(schedule.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                      <div className="pt-4">
                        {schedule.memo && (
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            {/* 메모지 상단 장식 */}
                            <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-red-300 opacity-60"></div>
                                  <div className="w-2 h-2 rounded-full bg-yellow-300 opacity-60"></div>
                                  <div className="w-2 h-2 rounded-full bg-green-300 opacity-60"></div>
                                </div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: schedule.color || '#ffe066', opacity: 0.7 }}></div>
                              </div>
                              {/* 종이 구멍 효과 */}
                              <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around py-1">
                                <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                              </div>
                            </div>
                            
                            {/* 메모 내용 */}
                            <div className="p-4 bg-white mb-8">
                              <div className="text-gray-800 leading-7 font-medium" style={{ 
                                fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                                fontSize: '14px',
                                lineHeight: '1.6'
                              }}>
                                {renderContentWithLinks(schedule.memo)}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!schedule.memo && (
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            {/* 메모지 상단 장식 */}
                            <div className="relative bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-2 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-gray-300 opacity-60"></div>
                                  <div className="w-2 h-2 rounded-full bg-gray-300 opacity-60"></div>
                                  <div className="w-2 h-2 rounded-full bg-gray-300 opacity-60"></div>
                                </div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: schedule.color || '#ffe066', opacity: 0.7 }}></div>
                              </div>
                              {/* 종이 구멍 효과 */}
                              <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around py-1">
                                <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 opacity-50"></div>
                              </div>
                            </div>
                            
                            {/* 빈 메모 내용 */}
                            <div className="p-6">
                              <div className="flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-gray-400 text-lg">📝</span>
                                  </div>
                                  <p className="text-sm text-gray-500 font-medium">메모가 없습니다</p>
                                  <p className="text-xs text-gray-400 mt-1">수정에서 내용을 추가해보세요</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-lg">이 날에는 일정이 없습니다</p>
            </div>
          )}
        </div>
      </div>
      
      {/* ...existing code... */}
      
      {/* 사이드바 오버레이 */}
      {showSidebar && (
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-30 ${
            showSidebar ? 'opacity-30' : 'opacity-0'
          }`}
          onClick={onClose}
        />
      )}
    </>
  );
}

export default Sidebar;
