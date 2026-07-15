import type { AllowedAnswer, ChatLogEntry } from '../types/game';

export type MatchdayStatus = 
  | 'LOBBY'
  | 'AWAITING_KICKOFF'
  | 'INTERROGATION_PHASE'
  | 'NETWORK_DELAY'
  | 'VAR_REVIEW'
  | 'FULL_TIME';

export interface MatchdayState {
  status: MatchdayStatus;
  secretPlayer: string | null;
  interrogationLog: ChatLogEntry[];
  totalQuestions: number;
  varErrorMessage: string | null;
  guessedPlayer: string | null;
  isWin: boolean;
}

export type MatchdayAction =
  | { type: 'TRIGGER_KICKOFF' }
  | { type: 'KICKOFF_SUCCESS'; payload: string }
  | { type: 'SUBMIT_INTERROGATION'; payload: string }
  | { type: 'INTERROGATION_SUCCESS'; payload: { question: string, answer: AllowedAnswer } }
  | { type: 'SUBMIT_GUESS'; payload: string }
  | { type: 'GUESS_VERDICT'; payload: { isCorrect: boolean, guess: string, actualPlayer: string } }
  | { type: 'NETWORK_TIMEOUT' }
  | { type: 'VAR_DECISION_APPEAL' }
  | { type: 'BLOW_FINAL_WHISTLE' }
  | { type: 'RESET_MATCH' };

export const INITIAL_MATCHDAY_STATE: MatchdayState = {
  status: 'LOBBY',
  secretPlayer: null,
  interrogationLog: [],
  totalQuestions: 0,
  varErrorMessage: null,
  guessedPlayer: null,
  isWin: false,
};

export function matchdayReducer(state: MatchdayState, action: MatchdayAction): MatchdayState {
  switch (action.type) {
    case 'TRIGGER_KICKOFF':
      if (state.status !== 'LOBBY') return state;
      return { ...state, status: 'AWAITING_KICKOFF', varErrorMessage: null };

    case 'KICKOFF_SUCCESS':
      if (state.status !== 'AWAITING_KICKOFF') return state;
      return { 
        ...state, 
        status: 'INTERROGATION_PHASE', 
        secretPlayer: action.payload 
      };

    case 'SUBMIT_INTERROGATION':
    case 'SUBMIT_GUESS':
      if (state.status !== 'INTERROGATION_PHASE') return state;
      return { ...state, status: 'NETWORK_DELAY' };

    case 'INTERROGATION_SUCCESS':
      if (state.status !== 'NETWORK_DELAY') return state;
      return {
        ...state,
        status: 'INTERROGATION_PHASE',
        interrogationLog: [...state.interrogationLog, action.payload],
        totalQuestions: state.totalQuestions + 1,
      };

    case 'GUESS_VERDICT':
      if (state.status !== 'NETWORK_DELAY') return state;
      if (action.payload.isCorrect) {
        return {
          ...state,
          status: 'FULL_TIME',
          guessedPlayer: action.payload.actualPlayer,
          isWin: true,
        };
      } else {
        // If guess is wrong, treat it as another log entry and continue
        return {
          ...state,
          status: 'INTERROGATION_PHASE',
          totalQuestions: state.totalQuestions + 1,
          interrogationLog: [
            ...state.interrogationLog,
            { question: `Is it ${action.payload.guess}?`, answer: 'No' }
          ]
        };
      }

    case 'NETWORK_TIMEOUT':
      if (state.status !== 'NETWORK_DELAY' && state.status !== 'AWAITING_KICKOFF') return state;
      return { 
        ...state, 
        status: 'VAR_REVIEW', 
        varErrorMessage: 'Lost connection to the studio. VAR is reviewing the footage.' 
      };

    case 'VAR_DECISION_APPEAL':
      if (state.status !== 'VAR_REVIEW') return state;
      // Recover to appropriate state depending on what we have
      return { 
        ...state, 
        status: state.secretPlayer ? 'INTERROGATION_PHASE' : 'LOBBY',
        varErrorMessage: null
      };

    case 'BLOW_FINAL_WHISTLE':
      if (state.status !== 'INTERROGATION_PHASE') return state;
      return {
        ...state,
        status: 'FULL_TIME',
        guessedPlayer: state.secretPlayer,
        isWin: false, // gave up
      };

    case 'RESET_MATCH':
      return INITIAL_MATCHDAY_STATE;

    default:
      return state;
  }
}
