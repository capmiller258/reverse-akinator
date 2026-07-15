import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface VARReviewBoothProps {
  message: string | null;
  onAppealDecision: () => void;
}

export const VARReviewBooth = ({ message, onAppealDecision }: VARReviewBoothProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-referee-red/90 backdrop-blur-md rounded-xl max-w-md mx-auto w-full text-center border-4 border-stadium-navy shadow-2xl"
    >
      <div className="w-24 h-24 mb-6 rounded-lg bg-stadium-navy flex flex-col items-center justify-center shadow-lg border-2 border-white relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-white/10"
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <AlertTriangle className="w-8 h-8 text-stadium-gold mb-1" />
        <span className="font-display font-black text-xl text-white tracking-widest">VAR</span>
      </div>
      
      <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-white mb-2">
        Review Required
      </h2>
      
      <p className="font-sans text-red-100 mb-8 max-w-xs">
        {message || "We've lost communication with the studio."}
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAppealDecision}
        className="flex items-center gap-2 px-6 py-3 bg-white text-referee-red font-display font-bold uppercase rounded-lg shadow-md hover:bg-gray-100 transition-colors"
      >
        <RefreshCw className="w-5 h-5" />
        Appeal Decision
      </motion.button>
    </motion.div>
  );
};
