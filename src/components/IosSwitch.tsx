import React from 'react';

interface IosSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'normal' | 'large';
}

export const IosSwitch: React.FC<IosSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'normal',
}) => {
  const isLarge = size === 'large';
  const widthClass = isLarge ? 'w-14 h-8' : 'w-12 h-7';
  const thumbSizeClass = isLarge ? 'w-7 h-7' : 'w-6 h-6';
  const translateClass = isLarge
    ? (checked ? 'translate-x-6' : 'translate-x-0.5')
    : (checked ? 'translate-x-5' : 'translate-x-0.5');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Bật tắt'}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-250 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${widthClass} ${
        checked
          ? 'bg-emerald-500 shadow-inner'
          : 'bg-slate-300 dark:bg-slate-700'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
    >
      <span
        className={`pointer-events-none inline-block rounded-full bg-white shadow-md transform transition-transform duration-250 ease-in-out ${thumbSizeClass} ${translateClass}`}
      />
    </button>
  );
};
