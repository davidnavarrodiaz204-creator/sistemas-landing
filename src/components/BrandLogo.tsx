'use client';

export function FactusysMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="7" width="3" height="18" rx="1.5" fill="currentColor" />
      <rect x="8" y="7" width="14" height="3" rx="1.5" fill="currentColor" />
      <rect x="8" y="14" width="10" height="3" rx="1.5" fill="currentColor" />
      <circle cx="24" cy="24" r="2.5" fill="#00e676" />
    </svg>
  );
}

export function FactusysMarkNeon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" stroke="#00e676" strokeWidth="2" />
      <rect x="8" y="7" width="3" height="18" rx="1.5" fill="#00e676" />
      <rect x="8" y="7" width="14" height="3" rx="1.5" fill="#00e676" />
      <rect x="8" y="14" width="10" height="3" rx="1.5" fill="#00e676" />
      <circle cx="24" cy="24" r="2.5" fill="#00e676" />
    </svg>
  );
}

interface FactusysLogoProps {
  theme?: 'dark' | 'light';
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FactusysLogo({ theme = 'dark', className, showTagline = true, size = 'md' }: FactusysLogoProps) {
  const textColor = theme === 'light' ? '#000000' : '#ffffff';
  const tagColor = theme === 'light' ? '#52525b' : '#71717a';
  const markSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 ${className || ''}`}>
      <FactusysMark className={markSize} style={{ color: textColor }} />
      <div>
        <span className={`${titleSize} font-bold tracking-tight leading-none block`} style={{ color: textColor }}>
          FACTUSYS
        </span>
        {showTagline && (
          <p className="text-[10px] tracking-[0.15em] uppercase mt-0.5" style={{ color: tagColor }}>
            SaaS para tu negocio
          </p>
        )}
      </div>
    </div>
  );
}

export function FactusysLogoNeon({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const markSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 ${className || ''}`}>
      <FactusysMarkNeon className={markSize} />
      <div>
        <span className={`${titleSize} font-bold tracking-tight leading-none block text-white`}>
          FACTUSYS
        </span>
        <p className="text-[10px] tracking-[0.15em] uppercase mt-0.5 text-neon">
          SaaS para tu negocio
        </p>
      </div>
    </div>
  );
}
