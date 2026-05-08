'use client';

interface SocialCanvasProps {
  width: number;
  height: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SocialCanvas({ width, height, children, className, style }: SocialCanvasProps) {
  return (
    <div
      className={`relative overflow-hidden ${className || ''}`}
      style={{ width: `${width}px`, height: `${height}px`, ...style }}
    >
      {children}
    </div>
  );
}
