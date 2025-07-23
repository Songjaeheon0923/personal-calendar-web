import { useRef, useEffect } from 'react';

function DateCellContextMenu({ 
  show,
  x, 
  y, 
  date,
  onAddSchedule,
  onClose 
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        // 다른 모든 동작을 차단하고 컨텍스트 메뉴만 닫기
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    // 모든 마우스 이벤트를 차단하는 핸들러
    const blockAllEvents = (e) => {
      if (show && menuRef.current && !menuRef.current.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
      }
    };

    if (show) {
      // 클릭 이벤트들을 최고 우선순위로 등록하여 다른 모든 이벤트 차단
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('mousedown', blockAllEvents, true);
      document.addEventListener('mouseup', blockAllEvents, true);
      document.addEventListener('contextmenu', blockAllEvents, true);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('mousedown', blockAllEvents, true);
      document.removeEventListener('mouseup', blockAllEvents, true);
      document.removeEventListener('contextmenu', blockAllEvents, true);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <button
      ref={menuRef}
      className="fixed px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center"
      style={{
        left: x,
        top: y,
        zIndex: 99999,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onAddSchedule(date);
      }}
    >
      <span className="mr-2">+</span>
      새 일정 추가
    </button>
  );
}

export default DateCellContextMenu;
