"use client"
import { useState, useEffect, useRef } from "react";
import { useBoundary } from "./Boundary";

interface WindowProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
  initialX?: number;
  initialY?: number;
}

export default function Window({ width = 300, height = 200, children, initialX = 100, initialY = 100 }: WindowProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const { boundaryRef, registerWindow, unregisterWindow, bringToFront, windowOrder } = useBoundary();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isMouseDownRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStartTimer = useRef<NodeJS.Timeout | null>(null);
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const activeTouchId = useRef<number | null>(null);
  const id = useRef(Math.random().toString(36).substring(2, 9)).current;

  useEffect(() => {
    registerWindow(id);
    return () => unregisterWindow(id);
  }, [id, registerWindow, unregisterWindow]);

  const zIndex = windowOrder.indexOf(id);

  const handleWindowInteraction = () => {
    bringToFront(id);
  };

  const handleInteractionStart = (clientX: number, clientY: number) => {
    if (dragStartTimer.current) {
      clearTimeout(dragStartTimer.current);
    }
    isMouseDownRef.current = true;
    const startX = clientX;
    const startY = clientY;
    dragStartPosition.current = { x: startX, y: startY };

    dragStartTimer.current = setTimeout(() => {
      if (isMouseDownRef.current) {
        setIsDragging(true);
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        dragOffset.current = {
          x: startX - position.x,
          y: startY - position.y,
        };
      }
      dragStartTimer.current = null;
    }, 100);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button != 0) return;
    if (activeTouchId.current !== null) return;
    handleInteractionStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    handleInteractionStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handlePreDragMove = (e: MouseEvent | TouchEvent) => {
      if (isMouseDownRef.current && !isDragging) {
        let clientX, clientY;
        if ('touches' in e) {
          if (activeTouchId.current === null) return;
          const touchEvent = e as TouchEvent;
          let touch = null;
          for (let i = 0; i < touchEvent.touches.length; i++) {
            if (touchEvent.touches[i].identifier === activeTouchId.current) {
              touch = touchEvent.touches[i];
              break;
            }
          }
          if (!touch) return;
          clientX = touch.clientX;
          clientY = touch.clientY;
        } else {
          if (activeTouchId.current !== null) return;
          clientX = (e as MouseEvent).clientX;
          clientY = (e as MouseEvent).clientY;
        }
        const dx = Math.abs(clientX - dragStartPosition.current.x);
        const dy = Math.abs(clientY - dragStartPosition.current.y);
        if (dx > 3 || dy > 3) {
          if (dragStartTimer.current) {
            clearTimeout(dragStartTimer.current);
            dragStartTimer.current = null;
          }
        }
      }
    };
    window.addEventListener("mousemove", handlePreDragMove);
    window.addEventListener("touchmove", handlePreDragMove);
    return () => {
      window.removeEventListener("mousemove", handlePreDragMove);
      window.removeEventListener("touchmove", handlePreDragMove);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleGlobalInteractionEnd = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        if (activeTouchId.current === null) return;
        const touchEvent = e as TouchEvent;
        let found = false;
        for (let i = 0; i < touchEvent.changedTouches.length; i++) {
          if (touchEvent.changedTouches[i].identifier === activeTouchId.current) {
            found = true;
            break;
          }
        }
        if (!found) return;
        activeTouchId.current = null;
      } else {
        if (activeTouchId.current !== null) return;
      }
      isMouseDownRef.current = false;
      setIsDragging(false);
      if (dragStartTimer.current) {
        clearTimeout(dragStartTimer.current);
        dragStartTimer.current = null;
      }
    };
    window.addEventListener("mouseup", handleGlobalInteractionEnd);
    window.addEventListener("touchend", handleGlobalInteractionEnd);
    window.addEventListener("touchcancel", handleGlobalInteractionEnd);
    return () => {
      window.removeEventListener("mouseup", handleGlobalInteractionEnd);
      window.removeEventListener("touchend", handleGlobalInteractionEnd);
      window.removeEventListener("touchcancel", handleGlobalInteractionEnd);
    };
  }, []);

  useEffect(() => {
    const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if ('touches' in e) {
        if (activeTouchId.current === null) return;
        const touchEvent = e as TouchEvent;
        let touch = null;
        for (let i = 0; i < touchEvent.touches.length; i++) {
          if (touchEvent.touches[i].identifier === activeTouchId.current) {
            touch = touchEvent.touches[i];
            break;
          }
        }
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        if (activeTouchId.current !== null) return;
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      if (boundaryRef.current) {
        const boundaryRect = boundaryRef.current.getBoundingClientRect();
        clientX = Math.max(boundaryRect.left, Math.min(clientX, boundaryRect.right));
        clientY = Math.max(boundaryRect.top, Math.min(clientY, boundaryRect.bottom));
      }

      setPosition({
        x: clientX - dragOffset.current.x,
        y: clientY - dragOffset.current.y,
      });
    };
    if (isDragging) {
      window.addEventListener("mousemove", handleInteractionMove);
      window.addEventListener("touchmove", handleInteractionMove);
    }
    return () => {
      window.removeEventListener("mousemove", handleInteractionMove);
      window.removeEventListener("touchmove", handleInteractionMove);
    };
  }, [isDragging]);

  return (
    <div
      ref={windowRef}
      className="window"
      onMouseDownCapture={handleWindowInteraction}
      onTouchStartCapture={handleWindowInteraction}
      style={{
        width,
        height,
        position: "absolute",
        left: position.x,
        top: position.y,
        outline: isDragging ? "2px solid blue" : "none",
        zIndex: zIndex === -1 ? 0 : zIndex,
      }}
    >
      <div className="window-header" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: "move", userSelect: "none" }}>
        <span className="window-title">Window</span>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
}