import { BoardState } from './game/BoardState';
import { AIReasoner } from './ai/AIReasoner';
import { DIFFICULTY_PRESETS } from './types';

/**
 * AI Minesweeper - Main Entry Point
 * 
 * This is a sophisticated AI-powered Minesweeper implementation with:
 * - Constraint satisfaction algorithms for logical deduction
 * - Probability calculation for uncertain situations
 * - Explainable AI reasoning with step-by-step explanations
 * - Property-based testing for correctness guarantees
 */

export { BoardState } from './game/BoardState';
export { AIReasoner } from './ai/AIReasoner';
export { ConstraintSolver } from './ai/ConstraintSolver';
export * from './types';

// Example usage
export function createGame(difficulty: 'beginner' | 'intermediate' | 'expert' = 'beginner') {
  const config = DIFFICULTY_PRESETS[difficulty];
  const board = new BoardState(config);
  const ai = new AIReasoner();
  
  return {
    board,
    ai,
    
    // Make a move and get AI analysis
    makeMove(x: number, y: number, action: 'reveal' | 'flag' = 'reveal') {
      if (action === 'reveal') {
        board.revealCell(x, y);
      } else {
        board.toggleFlag(x, y);
      }
      
      return ai.analyzeBoard(board);
    },
    
    // Get AI recommendation
    getRecommendation() {
      const analysis = ai.analyzeBoard(board);
      return analysis.recommendations[0] || null;
    },
    
    // Get explanation for a specific cell
    explainCell(x: number, y: number) {
      const cell = board.getCell(x, y);
      if (!cell) return ['Invalid coordinates'];
      return ai.explainCell(cell, board);
    },
    
    // Get guidance when stuck
    getGuidance() {
      return ai.findStuckGuidance(board);
    },
    
    // Get current game state
    getState() {
      return board.getGameState();
    }
  };
}

// Demo function
export function runDemo() {
  console.log('AI Minesweeper Demo');
  console.log('==================');
  
  const game = createGame('beginner');
  console.log('Created beginner game (9x9, 10 mines)');
  
  // Make a safe move in the center
  const analysis = game.makeMove(4, 4);
  console.log(`Made move at (4,4), AI found ${analysis.recommendations.length} recommendations`);
  
  if (analysis.recommendations.length > 0) {
    const rec = analysis.recommendations[0];
    console.log(`AI recommends: ${rec.action} cell (${rec.targetCell.x}, ${rec.targetCell.y})`);
    console.log(`Confidence: ${rec.confidence}`);
    console.log(`Reasoning: ${rec.reasoning[0]}`);
  }
  
  return game;
}