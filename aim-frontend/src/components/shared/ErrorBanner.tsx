import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
