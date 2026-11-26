import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  className,
}: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900',
    slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }[color];

  return (
    <Card className={cn('relative overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">{title}</p>
          <div className="text-2xl font-black text-[#172033] dark:text-white tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-[#64748B] dark:text-slate-400">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 text-xs font-semibold mt-2">
              <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-400 font-normal">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl border', colorStyles)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
