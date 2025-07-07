import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  error: 'network' | 'search' | 'generic';
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ 
  error, 
  message, 
  onRetry, 
  className = "" 
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (error) {
      case 'network':
        return {
          icon: <WifiOff className="w-8 h-8 text-red-600" />,
          title: "Connection Error",
          description: message || "Unable to connect to the server. Please check your internet connection and try again.",
          bgColor: "bg-red-100"
        };
      case 'search':
        return {
          icon: <AlertCircle className="w-8 h-8 text-orange-600" />,
          title: "Search Error",
          description: message || "Something went wrong while searching. Please try again.",
          bgColor: "bg-orange-100"
        };
      default:
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-600" />,
          title: "Error",
          description: message || "An unexpected error occurred. Please try again.",
          bgColor: "bg-red-100"
        };
    }
  };

  const config = getErrorConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${config.bgColor}`}>
        {config.icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {config.description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </motion.div>
  );
} 