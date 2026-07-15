import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, HelpCircle } from 'lucide-react';
import type { MatchdayState } from '../engine/MatchdayState';
import type { AllowedAnswer, ChatLogEntry } from '../types/game';

// Subcomponent: Scoreboard
const InterrogationScoreboard = ({ count }: { count: number }) => (
  <div className="match-scoreboard-header">
    <div className="match-scoreboard-label">Questions Asked</div>
    <div className="match-scoreboard-value">{count}</div>
  </div>
);

// Subcomponent: Commentary Log
const MatchCommentaryTicker = ({ log }: { log: ChatLogEntry[] }) => {
  const endRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="broadcast-ticker-log">
      {log.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-500 font-sans italic">
          Match is underway. Awaiting interrogation...
        </div>
      ) : (
        log.map((entry, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="broadcast-ticker-entry"
          >
            <div className="text-slate-300 font-sans text-sm md:text-base flex gap-2">
              <span className="text-[color:var(--color-pitch-grass-secondary)] font-bold">Q{idx + 1}:</span> 
              <span>{entry.question}</span>
            </div>
            <div className="text-slate-400 font-display uppercase tracking-widest text-xs mt-2 font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[color:var(--color-stadium-gold)]" />
              {entry.answer}
            </div>
          </motion.div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
};

// Subcomponent: Answer Badge (Referee/VAR style)
const RefereeDecisionBadge = ({ answer }: { answer: AllowedAnswer | null }) => {
  if (!answer) return null;

  const colorClassMap: Record<AllowedAnswer, string> = {
    'Yes': 'badge-yes',
    'No': 'badge-no',
    'Probably': 'badge-probably',
    'Probably Not': 'badge-probably-not',
    "Don't Know": 'badge-dont-know'
  };

  return (
    <AnimatePresence>
      <motion.div
        key={answer}
        initial={{ y: 100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.8 }}
        className="referee-badge-container"
      >
        <div className={`referee-badge ${colorClassMap[answer]}`}>
          <span className="font-display font-black text-5xl md:text-6xl uppercase tracking-tighter drop-shadow-md">
            {answer}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main InterrogationOverlay Component
interface InterrogationOverlayProps {
  state: MatchdayState;
  onProcessInterrogationTick: (q: string) => void;
  onTransmitGuessAttempt: (g: string) => void;
  onBlowFinalWhistle: () => void;
}

export const InterrogationOverlay = ({ 
  state, 
  onProcessInterrogationTick, 
  onTransmitGuessAttempt, 
  onBlowFinalWhistle 
}: InterrogationOverlayProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isGuessMode, setIsGuessMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState<AllowedAnswer | null>(null);
  
  const isNetworkLocked = state.status === 'NETWORK_DELAY' || state.status === 'VAR_REVIEW';
  const lastAnswer = state.interrogationLog.length > 0 ? state.interrogationLog[state.interrogationLog.length - 1].answer : null;

  useEffect(() => {
    if (state.status === 'INTERROGATION_PHASE' && lastAnswer && state.totalQuestions > 0) {
      setShowAnswer(lastAnswer);
      const timer = setTimeout(() => setShowAnswer(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.totalQuestions, lastAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isNetworkLocked) return;

    if (isGuessMode) {
      onTransmitGuessAttempt(trimmed);
    } else {
      onProcessInterrogationTick(trimmed);
    }
    setInputValue('');
  };

  return (
    <div className="match-overlay-panel">
      <InterrogationScoreboard count={state.totalQuestions} />
      
      <div className="relative flex-grow flex flex-col min-h-[300px]">
        <MatchCommentaryTicker log={state.interrogationLog} />
        {showAnswer && <RefereeDecisionBadge answer={showAnswer} />}
      </div>

      <div className="interrogation-input-container">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4">
            <button
              onClick={() => setIsGuessMode(false)}
              disabled={isNetworkLocked}
              className={`font-display uppercase tracking-widest text-sm font-bold transition-colors ${!isGuessMode ? 'text-[color:var(--color-pitch-grass-secondary)] border-b-2 border-[color:var(--color-pitch-grass-secondary)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Interrogate
            </button>
            <button
              onClick={() => setIsGuessMode(true)}
              disabled={isNetworkLocked}
              className={`font-display uppercase tracking-widest text-sm font-bold transition-colors ${isGuessMode ? 'text-[color:var(--color-stadium-gold)] border-b-2 border-[color:var(--color-stadium-gold)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Submit Guess
            </button>
          </div>
          
          <button 
            onClick={onBlowFinalWhistle}
            disabled={isNetworkLocked}
            className="text-slate-400 hover:text-white font-sans text-xs underline underline-offset-4 disabled:opacity-50"
          >
            Blow Final Whistle (Give Up)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isNetworkLocked}
            placeholder={isGuessMode ? "Type player name..." : "e.g. Does he play in the Premier League?"}
            className="interrogation-text-field"
          />
          <motion.button
            whileHover={{ scale: isNetworkLocked || !inputValue.trim() ? 1 : 1.05 }}
            whileTap={{ scale: isNetworkLocked || !inputValue.trim() ? 1 : 0.95 }}
            type="submit"
            disabled={isNetworkLocked || !inputValue.trim()}
            className={`interrogation-submit-btn ${isGuessMode ? 'btn-gold' : 'btn-primary'}`}
          >
            {isGuessMode ? <AlertCircle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
          </motion.button>
        </form>
      </div>
    </div>
  );
};
