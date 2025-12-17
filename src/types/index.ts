/**
 * Core data models for AI Minesweeper
 */

export interface BoardCell {
  x: number;
  y: number;
  hasMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMineCount: number;
  probability?: number;
}

export interface Constraint {
  centerCell: BoardCell;
  adjacentCells: BoardCell[];
  requiredMineCount: number;
  satisfiedMineCount: number;
}

export interface AIRecommendation {
  targetCell: BoardCell;
  action: 'reveal' | 'flag';
  confidence: 'certain' | 'probable';
  reasoning: string[];
  relatedConstraints: Constraint[];
}

export interface GameConfiguration {
  width: number;
  height: number;
  mineCount: number;
  difficulty: 'beginner' | 'intermediate' | 'expert' | 'custom';
}

export interface GameState {
  board: BoardCell[][];
  gameStatus: 'playing' | 'won' | 'lost';
  minesRemaining: number;
  cellsRevealed: number;
  totalSafeCells: number;
}

export interface ReasoningStep {
  description: string;
  affectedCells: BoardCell[];
  constraints: Constraint[];
  type: 'deduction' | 'probability' | 'pattern';
}

export interface AnalysisResult {
  recommendations: AIRecommendation[];
  reasoning: ReasoningStep[];
  probabilities: Map<string, number>;
  hasContradiction: boolean;
  contradictionExplanation?: string;
}

export const DIFFICULTY_PRESETS: Record<string, GameConfiguration> = {
  beginner: { width: 9, height: 9, mineCount: 10, difficulty: 'beginner' },
  intermediate: { width: 16, height: 16, mineCount: 40, difficulty: 'intermediate' },
  expert: { width: 30, height: 16, mineCount: 99, difficulty: 'expert' }
};

export class GameError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GameError';
  }
}

export class AIReasoningError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIReasoningError';
  }
}