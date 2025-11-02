import React, { useState, useEffect, useRef } from 'react';

// Easing function for a more natural animation
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const AnimatedValue: React.FC<{ value: number, duration?: number }> = ({ value, duration = 400 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef<number>();
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    
    // No need to animate if the value hasn't changed
    if (startValue === endValue) {
        setDisplayValue(endValue);
        return;
    }

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const t = Math.min(progress / duration, 1);
      const easedT = easeOutCubic(t);

      const currentValue = Math.round(startValue + (endValue - startValue) * easedT);
      setDisplayValue(currentValue);

      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      prevValueRef.current = endValue;
    };
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
};

export default AnimatedValue;
