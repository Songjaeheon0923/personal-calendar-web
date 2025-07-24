import { useRef, useEffect, useState, useCallback } from 'react';

function DateCellContextMenu({ 
  show,
  x, 
  y, 
  date,
  onAddSchedule,
  onClose 
}) {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(null);

  // 위치 조정 로직
  const adjustPosition = useCallback(() => {
    if (!show || !menuRef.current || x === undefined || y === undefined) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = x;
    let newY = y;

    if (x + menuRect.width > viewportWidth) {
      newX = viewportWidth - menuRect.width - 10;
    }
    if (y + menuRect.height > viewportHeight) {
      newY = viewportHeight - menuRect.height - 10;
    }
    if (newX < 10) newX = 10;
    if (newY < 10) newY = 10;

    if (newX !== x || newY !== y) {
      setAdjustedPosition({ x: newX, y: newY });
    } else {
      setAdjustedPosition(null);
    }
  }, [show, x, y]);

  useEffect(() => {
    if (show) {
      requestAnimationFrame(adjustPosition);
    } else {
      setAdjustedPosition(null);
    }
  }, [show, adjustPosition]);

  useEffect(() => {
    if (!show) return;

    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(adjustPosition, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [show, adjustPosition]);

  useEffect(() => {
    if (!show) return;

    const handleOutsideInteraction = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        onClose();
      }
    };

    const handleScroll = () => onClose();

    document.addEventListener('click', handleOutsideInteraction, true);
    document.addEventListener('mousedown', handleOutsideInteraction, true);
    document.addEventListener('contextmenu', handleOutsideInteraction, true);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('click', handleOutsideInteraction, true);
      document.removeEventListener('mousedown', handleOutsideInteraction, true);
      document.removeEventListener('contextmenu', handleOutsideInteraction, true);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [show, onClose]);

  if (!show) return null;

  const finalPosition = adjustedPosition || { x, y };

  return (
    <button
      ref={menuRef}
      className="fixed px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center"
      style={{
        left: finalPosition.x,
        top: finalPosition.y,
        zIndex: 99999,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onAddSchedule(date);
      }}
    >
      + 일정 추가
    </button>
  );
}

export default DateCellContextMenu;
