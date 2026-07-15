
import { motion } from 'framer-motion';

export const VARThinkingState: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center p-8 border-scoreboard bg-navy/90 backdrop-blur-sm rounded-xl max-w-md mx-auto w-full"
    >
      <div className="relative w-24 h-24 mb-6">
        <motion.div 
          className="absolute inset-0 border-4 border-pitch-bright rounded-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 border-4 border-gold rounded-lg"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-2xl text-floodlight">
          VAR
        </div>
      </div>
      <h2 className="font-display text-2xl uppercase tracking-widest text-slate-200">
        Checking...
      </h2>
      <p className="font-sans text-slate-400 mt-2 text-center text-sm">
        Reviewing footage from the studio
      </p>
    </motion.div>
  );
};
