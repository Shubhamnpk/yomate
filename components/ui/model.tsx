import React from 'react';
import { createPortal } from 'react-dom';

interface ModelProps {
  children: React.ReactNode;
  onClose: () => void;
  zIndexClass?: string;
  layout?: 'bottom' | 'center';
  contentClassName?: string;
  overlayClassName?: string;
  showMobileHandle?: boolean;
  closeOnBackdrop?: boolean;
}

export const Model: React.FC<ModelProps> = ({
  children,
  onClose,
  zIndexClass = 'z-[60]',
  layout = 'bottom',
  contentClassName = '',
  overlayClassName = 'bg-black/60 backdrop-blur-sm',
  showMobileHandle = false,
  closeOnBackdrop = true,
}) => {
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const [dragY, setDragY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const touchStartY = React.useRef(0);
  const canSwipeClose = React.useRef(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest('input, textarea, select, option, button, [contenteditable="true"], .ql-editor');
  };

  const isInSwipeZone = (touchY: number) => {
    if (!panelRef.current) return false;
    const rect = panelRef.current.getBoundingClientRect();
    return touchY <= rect.top + 72;
  };

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (layout !== 'bottom' || e.touches.length !== 1) return;
    if (isInteractiveTarget(e.target)) return;
    const activeSelection = window.getSelection();
    if (activeSelection && activeSelection.type === 'Range') return;

    const startY = e.touches[0].clientY;
    if (!isInSwipeZone(startY)) return;

    touchStartY.current = startY;
    canSwipeClose.current = true;
    setIsDragging(true);
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!canSwipeClose.current || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY <= 0) {
      setDragY(0);
      return;
    }
    setDragY(deltaY);
  };

  const onTouchEnd = () => {
    if (!canSwipeClose.current) return;
    const shouldClose = dragY > 90;
    canSwipeClose.current = false;
    setIsDragging(false);
    setDragY(0);
    if (shouldClose) onClose();
  };

  const alignment = layout === 'center' ? 'items-center p-4' : 'items-end p-0 sm:p-4';
  const modalNode = (
    <div className={`fixed inset-0 ${zIndexClass} flex justify-center ${alignment} ${overlayClassName} animate-in fade-in duration-300`}>
      <div onClick={() => closeOnBackdrop && onClose()} className="absolute inset-0" />
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 180ms ease-out',
        }}
        className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl ${contentClassName}`}
      >
        {showMobileHandle && (
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden shrink-0" />
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
