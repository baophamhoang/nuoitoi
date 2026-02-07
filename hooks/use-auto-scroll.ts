'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

export function useAutoScroll() {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollDirectionRef = useRef<'down' | 'up'>('down');
  const scrollAnimationRef = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const animateScroll = useCallback(() => {
    if (!listRef.current || isHovering || document.hidden) {
      scrollAnimationRef.current = requestAnimationFrame(animateScroll);
      return;
    }

    const container = listRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const scrollSpeed = 0.5;

    if (scrollDirectionRef.current === 'down') {
      container.scrollTop += scrollSpeed;
      if (container.scrollTop >= maxScroll) {
        scrollDirectionRef.current = 'up';
      }
    } else {
      container.scrollTop -= scrollSpeed;
      if (container.scrollTop <= 0) {
        scrollDirectionRef.current = 'down';
      }
    }

    scrollAnimationRef.current = requestAnimationFrame(animateScroll);
  }, [isHovering]);

  useEffect(() => {
    scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, [animateScroll]);

  return {
    listRef,
    isHovering,
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
  };
}
