import React from 'react';
import { ChevronRight } from 'lucide-react';

interface IosGroupCellProps {
  icon?: React.ReactNode;
  iconBg?: string; // e.g. bg-blue-500, bg-emerald-500, bg-orange-500
  title: string;
  subtitle?: string;
  value?: string;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  isLast?: boolean;
  isFirst?: boolean;
  textSize?: 'normal' | 'large' | 'extra-large';
}

export const IosGroupCell: React.FC<IosGroupCellProps> = ({
  icon,
  iconBg = 'bg-blue-500',
  title,
  subtitle,
  value,
  rightElement,
  showChevron = false,
  onClick,
  isLast = false,
  isFirst = false,
  textSize = 'large',
}) => {
  const isClickable = !!onClick && !rightElement;

  const titleSizes = {
    normal: 'text-sm font-medium',
    large: 'text-base font-semibold',
    'extra-large': 'text-lg font-bold',
  };

  const subtitleSizes = {
    normal: 'text-xs',
    large: 'text-sm',
    'extra-large': 'text-base',
  };

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`group relative flex items-center justify-between px-4 py-3.5 transition-colors ${
        isClickable
          ? 'cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:bg-black/[0.06] dark:active:bg-white/[0.08]'
          : ''
      } ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : ''}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        {icon && (
          <div
            className={`w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center text-white shadow-sm shadow-black/10 ${iconBg}`}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className={`text-slate-900 dark:text-slate-100 truncate ${titleSizes[textSize]}`}>
            {title}
          </div>
          {subtitle && (
            <p className={`text-slate-500 dark:text-slate-400 mt-0.5 leading-snug ${subtitleSizes[textSize]}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {value && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {value}
          </span>
        )}
        {rightElement}
        {showChevron && (
          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        )}
      </div>

      {!isLast && (
        <div
          className={`absolute bottom-0 right-0 h-px bg-slate-200/80 dark:bg-slate-700/60 ${
            icon ? 'left-16' : 'left-4'
          }`}
        />
      )}
    </div>
  );
};
