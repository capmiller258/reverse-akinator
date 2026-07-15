
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorBoundaryState: React.FC<ErrorBoundaryStateProps> = ({ message, onRetry }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 border-scoreboard bg-red-900/40 backdrop-blur-md rounded-xl max-w-md mx-auto w-full text-center"
    >
      <div className="w-20 h-20 mb-6 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
        <AlertTriangle className="w-10 h-10 text-white" />
      </div>
      <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-white mb-2">
        Signal Lost
      </h2>
      <p className="font-sans text-red-200 mb-8">
        {message}
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-white text-red-900 font-display font-bold uppercase rounded-lg shadow-md hover:bg-gray-100 transition-colors"
      >
        <RefreshCw className="w-5 h-5" />
        Retry Connection
      </motion.button>
    </motion.div>
  );
};
