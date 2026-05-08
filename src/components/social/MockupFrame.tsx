'use client';

export function LaptopMockup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-block ${className || ''}`}>
      <div className="rounded-xl border border-white/10 bg-[#1c1c1e] p-1.5 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-red-500/70" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <div className="w-2 h-2 rounded-full bg-green-500/70" />
          <div className="ml-2 text-[10px] text-gray-600 font-mono">factusys.app</div>
        </div>
        <div className="rounded-lg overflow-hidden bg-[#0a0a0f]">{children}</div>
      </div>
      <div className="w-[110%] h-2 bg-gradient-to-b from-[#1c1c1e] to-[#141416] rounded-b-xl mx-auto -ml-[5%]" />
    </div>
  );
}

export function PhoneMockup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-block ${className || ''}`}>
      <div className="rounded-[1.5rem] border border-white/10 bg-[#1c1c1e] p-1.5 shadow-2xl shadow-black/50">
        <div className="w-20 h-5 bg-black rounded-b-xl mx-auto mb-1.5" />
        <div className="rounded-xl overflow-hidden bg-[#0a0a0f]">{children}</div>
        <div className="w-20 h-1 bg-gray-700 rounded-full mx-auto mt-1.5" />
      </div>
    </div>
  );
}
