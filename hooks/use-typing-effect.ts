'use client';

import { useState, useEffect } from 'react';

export function useTypingEffect(text: string, speed = 50, wait = false): string {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (wait) return;
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, wait]);

  return typedText;
}
