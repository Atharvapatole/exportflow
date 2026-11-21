import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BrandLogo({
  className = '',
  theme = 'auto',
  showTagline = false,
  size = 'md',
}: BrandLogoProps) {
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Dynamic Global Trade Icon */}
      <div className={`relative flex items-center justify-center ${sizeClasses.icon} rounded-xl bg-gradient-to-br from-[#10243A] via-[#1E3A8A] to-[#2563EB] shadow-md group-hover:shadow-blue-500/20 transition-all duration-200 border border-blue-400/20`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5 text-white"
        >
          {/* Globe Meridian */}
          <circle cx="12" cy="12" r="9" className="stroke-white/60" strokeWidth="1.5" />
          <path d="M12 3a14 14 0 0 0 0 18" className="stroke-white/60" strokeWidth="1.5" />
          <path d="M12 3a14 14 0 0 1 0 18" className="stroke-white/60" strokeWidth="1.5" />
          <path d="M3 12h18" className="stroke-white/60" strokeWidth="1.5" />
          {/* Dynamic Export Flow Arrow */}
          <path
            d="m9 15 6-6m0 0h-5m5 0v5"
            className="stroke-emerald-400"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${sizeClasses.text} ${
            isDark ? 'text-white' : 'text-[#10243A]'
          }`}>
            Export<span className="text-blue-600">Flow</span>
          </span>
          <span className={`font-bold tracking-widest uppercase ${sizeClasses.sub} text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded`}>
            by BENZWELL
          </span>
        </div>
        {showTagline && (
          <span className={`text-[11px] font-medium tracking-wide mt-0.5 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Simplify Your Export Business.
          </span>
        )}
      </div>
    </Link>
  );
}
