import React from 'react';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'blue' | 'emerald' | 'amber' | 'rose' | 'none';
  onClick?: () => void;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
}) => {
  const glowClasses = {
    blue: 'before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/20 before:to-indigo-500/20 before:blur-xl before:-z-10',
    emerald: 'before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-r before:from-emerald-500/20 before:to-teal-500/20 before:blur-xl before:-z-10',
    amber: 'before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-r before:from-amber-500/20 before:to-orange-500/20 before:blur-xl before:-z-10',
    rose: 'before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-r before:from-rose-500/25 before:to-red-500/20 before:blur-xl before:-z-10',
    none: '',
  };

  return (
    <div
      onClick={onClick}
      className={`relative liquid-glass rounded-2xl p-4 transition-all duration-200 overflow-hidden ${
        glowClasses[glow]
      } ${onClick ? 'cursor-pointer hover:shadow-lg active:scale-[0.99]' : ''} ${className}`}
    >
      {/* Liquid refraction highlight on top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30" />
      {children}
    </div>
  );
};
