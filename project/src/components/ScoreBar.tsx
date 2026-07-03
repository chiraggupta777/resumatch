import { useEffect, useRef, useState } from 'react';

interface ScoreBarProps {
  value: number;
  color: string;
  height?: number;
  animate?: boolean;
}

export default function ScoreBar({ value, color, height = 6, animate = true }: ScoreBarProps) {
  const [width, setWidth] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!animate) {
      setWidth(value);
      return;
    }
    if (started.current) return;
    started.current = true;
    const timeout = setTimeout(() => {
      setWidth(value);
    }, 100);
    return () => clearTimeout(timeout);
  }, [value, animate]);

  return (
    <div style={{
      width: '100%',
      height,
      borderRadius: height,
      backgroundColor: '#e2e8f0',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${width}%`,
        borderRadius: height,
        backgroundColor: color,
        transition: animate ? 'width 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none',
      }} />
    </div>
  );
}
