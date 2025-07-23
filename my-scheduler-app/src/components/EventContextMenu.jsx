import { useRef, useEffect } from 'react';

function EventContextMenu({ 
  show,
  x, 
  y, 
  event,
  onEdit,
  onDelete,
  onClose 
}) {
  console.log('EventContextMenu render:', { show, x, y, event }); // 디버깅용
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    // 컨텍스트 메뉴가 활성화되어 있을 때 모든 외부 이벤트 차단
    const blockAllEvents = (e) => {
      // 메뉴 내부 클릭은 허용
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      
      // 외부 클릭은 메뉴 닫기만 수행하고 다른 모든 동작 차단
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };

    if (show) {
      // 클릭 이벤트를 capture phase에서 차단
      document.addEventListener('click', blockAllEvents, true);
      document.addEventListener('mousedown', blockAllEvents, true);
      document.addEventListener('mouseup', blockAllEvents, true);
      document.addEventListener('contextmenu', blockAllEvents, true);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('click', blockAllEvents, true);
      document.removeEventListener('mousedown', blockAllEvents, true);
      document.removeEventListener('mouseup', blockAllEvents, true);
      document.removeEventListener('contextmenu', blockAllEvents, true);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-300 py-2 min-w-32"
      style={{
        left: x,
        top: y,
        zIndex: 9999,
      }}
    >
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(event);
        }}
      >
        <span className="mr-2">✏️</span>
        수정
      </button>
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(event);
        }}
      >
        <span className="mr-2">🗑️</span>
        삭제
      </button>
    </div>
  );
}

export default EventContextMenu;
