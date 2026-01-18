
import React, { useEffect } from 'react';
import { X, CheckCircle, WarningCircle, TrendUp, TrendDown } from '@phosphor-icons/react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action, ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`} {...props}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-lg font-semibold text-vblack tracking-tight">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'red' | 'green' | 'blue' | 'gray' | 'yellow' }> = ({ children, color = 'gray' }) => {
  const colors = {
    red: 'bg-red-50 text-red-700 ring-red-600/10',
    green: 'bg-green-50 text-green-700 ring-green-600/10',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/10',
    gray: 'bg-gray-50 text-gray-600 ring-gray-500/10',
    yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-vblack text-white hover:bg-gray-800 focus:ring-gray-900 shadow-sm",
    secondary: "bg-white text-vblack border border-gray-200 hover:bg-gray-50 focus:ring-gray-200 shadow-sm",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-vblack",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Form Components ---

export const SectionHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="mb-6 pb-4 border-b border-gray-100">
    <h3 className="text-xl font-bold text-vblack">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);


interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, className = "", ...props }) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
    <input
      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black/5 outline-none bg-gray-50 focus:bg-white transition-colors"
      {...props}
    />
  </div>
);

// --- Visualization Components ---

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: string | 'up' | 'down' | 'neutral';
  trendValue?: number; // Added for precise color logic
  icon?: React.ElementType;
  color?: 'blue' | 'red' | 'orange' | 'green' | 'purple' | 'gray';
  prefix?: string;
}

// Import helper if possible, or just duplicate logic since we can't easily import from utils here without checking circular deps structure in user's project?
// Actually utils/metrics.ts creates circular dep if it imports from component, but component importing from utils is usually fine.
// But wait, ui.tsx is in components/, metrics.ts is in utils/.
// Let's safe-guard by just implementing the logic or importing. Importing is better.
// "Centralize this rule in a reusable function" -> user wants function.
// I will import it.
import { getTrendColor } from '../utils/metrics';

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, trend, trendValue, icon: Icon, color = 'blue', prefix = '' }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600'
  };
  const selectedColor = colors[color] || colors.blue;

  // Determine color class: priority to trendValue using centralized logic
  const trendColorClass = trendValue !== undefined
    ? getTrendColor(trendValue)
    : (trend === 'neutral' || trend === '0%' || trend === '0' ? 'bg-gray-100 text-gray-600' :
      (typeof trend === 'string' && (trend.includes('+') || trend === 'up')) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700');

  return (
    <Card className="p-5 flex flex-col justify-between h-full min-h-[140px]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-vblack tracking-tight">{prefix}{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${selectedColor}`}>
            <Icon size={20} weight="duotone" />
          </div>
        )}
      </div>

      <div className="mt-3">
        {trend ? (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${trendColorClass}`}>
              {(typeof trend === 'string' && (trend.includes('+') || trend === 'up')) ? <TrendUp weight="bold" className="mr-1" /> : (trend === 'down' || (typeof trend === 'string' && trend.includes('-'))) ? <TrendDown weight="bold" className="mr-1" /> : <div className="w-2 h-0.5 bg-gray-400 rounded-full mr-1" />}
              {trend === 'up' || trend === 'down' ? '' : trend}
            </span>
            <span className="text-xs text-gray-400">{subtext}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400">{subtext}</p>
        )}
      </div>
    </Card>
  );
};

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[200px]">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-vblack rounded-full animate-spin"></div>
  </div>
);

// --- Modal & Toast ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizes[size]} transform transition-all scale-100 max-h-[95vh] flex flex-col animate-fadeIn`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slideIn ${type === 'success' ? 'bg-white border-green-200 text-green-800' : 'bg-white border-red-200 text-red-800'
      }`}>
      {type === 'success' ? <CheckCircle size={20} weight="fill" className="text-green-500" /> : <WarningCircle size={20} weight="fill" className="text-red-500" />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};
