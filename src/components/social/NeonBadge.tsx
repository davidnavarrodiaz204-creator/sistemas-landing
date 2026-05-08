'use client';

interface NeonBadgeProps {
  text: string;
  className?: string;
}

export default function NeonBadge({ text, className }: NeonBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 border border-[#00e676]/40 rounded-full px-3 py-1 ${className || ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
      <span className="text-[#00e676] text-[10px] font-semibold tracking-wider uppercase">{text}</span>
    </div>
  );
}
