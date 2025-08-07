import { useRef, useEffect, useState } from 'react';

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
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 초기 위치 설정 및 props 변경 시 업데이트
  useEffect(() => {
    if (x !== undefined && y !== undefined) {
      setPosition({ x, y });
    }
  }, [x, y]);

  // 화면 크기 변경 시 위치 조정
  useEffect(() => {
    const handleResize = () => {
      if (!show || !menuRef.current) return;

      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setPosition(currentPos => {
        let newX = currentPos.x;
        let newY = currentPos.y;

        // 오른쪽 경계를 벗어나는 경우
        if (currentPos.x + menuRect.width > viewportWidth) {
          newX = viewportWidth - menuRect.width - 10; // 10px 마진
        }

        // 하단 경계를 벗어나는 경우
        if (currentPos.y + menuRect.height > viewportHeight) {
          newY = viewportHeight - menuRect.height - 10; // 10px 마진
        }

        // 왼쪽 경계를 벗어나는 경우
        if (newX < 10) {
          newX = 10;
        }

        // 상단 경계를 벗어나는 경우
        if (newY < 10) {
          newY = 10;
        }

        // 변경이 있을 때만 새 객체 반환
        if (newX !== currentPos.x || newY !== currentPos.y) {
          return { x: newX, y: newY };
        }
        return currentPos;
      });
    };

    if (show) {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [show]);

  useEffect(() => {

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
        left: position.x > 0 ? position.x : x,
        top: position.y > 0 ? position.y : y,
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
