import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-bundestag-500 focus-visible:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${checked ? 'bg-bundestag-600' : 'bg-slate-200 dark:bg-slate-700'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span
              className={`
                text-sm font-medium text-slate-900 dark:text-white
                ${disabled ? 'opacity-50' : 'cursor-pointer'}
              `}
              onClick={handleClick}
            >
              {label}
            </span>
          )}
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface RadioGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; description?: string }>;
  label?: string;
}

export function RadioGroup<T extends string>({
  value,
  onChange,
  options,
  label,
}: RadioGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
              ${
                value === option.value
                  ? 'border-bundestag-500 bg-bundestag-50 dark:bg-bundestag-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-0.5 w-4 h-4 text-bundestag-600 border-slate-300 focus:ring-bundestag-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {option.label}
              </span>
              {option.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
