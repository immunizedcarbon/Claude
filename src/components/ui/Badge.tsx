import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  primary: 'bg-bundestag-100 text-bundestag-800 dark:bg-bundestag-900/50 dark:text-bundestag-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  size = 'sm',
}) => (
  <span
    className={`
      inline-flex items-center rounded-full font-medium
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}
  >
    {children}
  </span>
);

interface StatusBadgeProps {
  status: 'idle' | 'loading' | 'completed' | 'error';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    idle: { variant: 'default' as const, label: 'Nicht analysiert' },
    loading: { variant: 'warning' as const, label: 'Wird analysiert...' },
    completed: { variant: 'success' as const, label: 'Abgeschlossen' },
    error: { variant: 'error' as const, label: 'Fehler' },
  };

  const { variant, label } = config[status];

  return (
    <Badge variant={variant}>
      {status === 'loading' && (
        <span className="inline-block w-2 h-2 bg-current rounded-full mr-1.5 animate-pulse" />
      )}
      {label}
    </Badge>
  );
};
