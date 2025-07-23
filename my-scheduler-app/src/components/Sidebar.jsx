import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import { renderContentWithLinks } from "../utils/textUtils";

function Sidebar({ 
  showSidebar, 
  sidebarDate, 
  sidebarSchedules, 
  expandedEventIds,
  onClose,
  onToggleExpand,
  onEditSchedule,
  onDeleteSchedule,
  onAddSchedule
}) {
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, scheduleId: null });
  const contextMenuRef = useRef(null);

  // 컨텍스트 메뉴 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0, scheduleId: null });
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 우클릭 핸들러
  const handleContextMenu = (e, schedule) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      scheduleId: schedule.id,
      schedule: schedule
    });
  };

  // 컨텍스트 메뉴에서 수정 클릭
  const handleEditFromContext = () => {
    onEditSchedule(contextMenu.schedule);
    setContextMenu({ show: false, x: 0, y: 0, scheduleId: null });
  };

  // 컨텍스트 메뉴에서 삭제 클릭
  const handleDeleteFromContext = () => {
    onDeleteSchedule(contextMenu.scheduleId);
    setContextMenu({ show: false, x: 0, y: 0, scheduleId: null });
  };
  if (!showSidebar) return null;

  return (
    <>
      {/* 사이드바 */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
        showSidebar ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
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
        
        <div className="flex-1 overflow-y-auto p-6">
          {sidebarSchedules.length > 0 ? (
            <div className="space-y-3">
              {sidebarSchedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onToggleExpand(schedule.id)}
                    onContextMenu={(e) => handleContextMenu(e, schedule)}
                    style={{
                      borderLeft: `4px solid ${schedule.color}`,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {schedule.title}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {schedule.startTime || '시간미정'} ~ {schedule.endTime || '시간미정'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: schedule.color }}
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
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: schedule.color, opacity: 0.7 }}></div>
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
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: schedule.color, opacity: 0.7 }}></div>
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
      
      {/* 컨텍스트 메뉴 */}
      {contextMenu.show && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-32"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
            onClick={handleEditFromContext}
          >
            <span className="text-blue-500">✏️</span>
            수정
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 text-red-600"
            onClick={handleDeleteFromContext}
          >
            <span className="text-red-500">🗑️</span>
            삭제
          </button>
        </div>
      )}
      
      {/* 사이드바 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-30"
        onClick={onClose}
      ></div>
    </>
  );
}

export default Sidebar;
