import * as fc from 'fast-check';
import { AIReasoner } from '../ai/AIReasoner';
import { BoardState } from '../game/BoardState';
import { GameConfiguration, DIFFICULTY_PRESETS } from '../types';

describe('AIReasoner Property Tests', () => {
  
  // Feature: ai-minesweeper, Property 6: AI deduction correctness
  test('Property 6: AI deduction correctness', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      fc.array(fc.record({
        x: fc.integer({ min: 0, max: 8 }),
        y: fc.integer({ min: 0, max: 8 })
      }), { minLength: 1, maxLength: 10 }),
      (config, moves) => {
        const board = new BoardState(config);
        const reasoner = new AIReasoner();
        
        // Make some safe moves to create constraints
        for (const move of moves) {
          const actualX = move.x % config.width;
          const actualY = move.y % config.height;
          const cell = board.getCell(actualX, actualY);
          
          if (cell && !cell.hasMine && !cell.isRevealed) {
            board.revealCell(actualX, actualY);
          }
        }
        
        const analysis = reasoner.analyzeBoard(board);
        
        // All certain recommendations should be logically sound
        for (const recommendation of analysis.recommendations) {
          if (recommendation.confidence === 'certain') {
            const cell = recommendation.targetCell;
            
            if (recommendation.action === 'reveal') {
              // Certain safe cells should not be mines
              expect(cell.hasMine).toBe(false);
            } else if (recommendation.action === 'flag') {
              // Certain mine cells should be mines
              expect(cell.hasMine).toBe(true);
            }
          }
        }
        
        // Should not recommend already revealed or flagged cells
        for (const recommendation of analysis.recommendations) {
          const cell = recommendation.targetCell;
          expect(cell.isRevealed).toBe(false);
          expect(cell.isFlagged).toBe(false);
        }
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 7: Probability calculation completeness
  test('Property 7: Probability calculation completeness', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      fc.array(fc.record({
        x: fc.integer({ min: 0, max: 8 }),
        y: fc.integer({ min: 0, max: 8 })
      }), { minLength: 1, maxLength: 5 }),
      (config, moves) => {
        const board = new BoardState(config);
        const reasoner = new AIReasoner();
        
        // Make some safe moves to create constraints
        for (const move of moves) {
          const actualX = move.x % config.width;
          const actualY = move.y % config.height;
          const cell = board.getCell(actualX, actualY);
          
          if (cell && !cell.hasMine && !cell.isRevealed) {
            board.revealCell(actualX, actualY);
          }
        }
        
        const analysis = reasoner.analyzeBoard(board);
        
        // All probabilities should be between 0 and 1
        for (const [cellKey, probability] of analysis.probabilities) {
          expect(probability).toBeGreaterThanOrEqual(0);
          expect(probability).toBeLessThanOrEqual(1);
        }
        
        // Probabilities should only be calculated for unrevealed, unflagged cells
        for (const [cellKey, probability] of analysis.probabilities) {
          const [x, y] = cellKey.split(',').map(Number);
          const cell = board.getCell(x, y);
          if (cell) {
            expect(cell.isRevealed).toBe(false);
            expect(cell.isFlagged).toBe(false);
          }
        }
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 9: Optimal probability recommendation
  test('Property 9: Optimal probability recommendation', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      fc.array(fc.record({
        x: fc.integer({ min: 0, max: 8 }),
        y: fc.integer({ min: 0, max: 8 })
      }), { minLength: 2, maxLength: 8 }),
      (config, moves) => {
        const board = new BoardState(config);
        const reasoner = new AIReasoner();
        
        // Make some safe moves to create constraints
        for (const move of moves) {
          const actualX = move.x % config.width;
          const actualY = move.y % config.height;
          const cell = board.getCell(actualX, actualY);
          
          if (cell && !cell.hasMine && !cell.isRevealed) {
            board.revealCell(actualX, actualY);
          }
        }
        
        const analysis = reasoner.analyzeBoard(board);
        
        // If there are probability-based recommendations
        const probableRecommendations = analysis.recommendations.filter(
          r => r.confidence === 'probable' && r.action === 'reveal'
        );
        
        if (probableRecommendations.length > 0 && analysis.probabilities.size > 1) {
          const recommendedCell = probableRecommendations[0].targetCell;
          const recommendedProbability = recommendedCell.probability || 0.5;
          
          // The recommended cell should have one of the lowest probabilities
          const allProbabilities = Array.from(analysis.probabilities.values());
          const minProbability = Math.min(...allProbabilities);
          
          // Allow for small floating point differences
          expect(recommendedProbability).toBeLessThanOrEqual(minProbability + 0.001);
        }
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 15: AI assistance responsiveness
  test('Property 15: AI assistance responsiveness', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      (config) => {
        const board = new BoardState(config);
        const reasoner = new AIReasoner();
        
        // AI should always provide some form of analysis
        const analysis = reasoner.analyzeBoard(board);
        
        // Analysis should always return a valid result
        expect(analysis).toBeDefined();
        expect(analysis.recommendations).toBeDefined();
        expect(analysis.reasoning).toBeDefined();
        expect(analysis.probabilities).toBeDefined();
        expect(typeof analysis.hasContradiction).toBe('boolean');
        
        // Should provide actionable information
        const hasRecommendations = analysis.recommendations.length > 0;
        const hasReasoning = analysis.reasoning.length > 0;
        const hasProbabilities = analysis.probabilities.size > 0;
        const hasContradiction = analysis.hasContradiction;
        
        // At least one form of actionable information should be provided
        expect(hasRecommendations || hasReasoning || hasProbabilities || hasContradiction).toBe(true);
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 16: Cell-specific explanation
  test('Property 16: Cell-specific explanation', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      fc.integer({ min: 0, max: 8 }),
      fc.integer({ min: 0, max: 8 }),
      (config, x, y) => {
        const actualX = x % config.width;
        const actualY = y % config.height;
        
        const board = new BoardState(config);
        const reasoner = new AIReasoner();
        const cell = board.getCell(actualX, actualY)!;
        
        const explanation = reasoner.explainCell(cell, board);
        
        // Should always provide some explanation
        expect(explanation).toBeDefined();
        expect(explanation.length).toBeGreaterThan(0);
        
        // Each explanation step should be a non-empty string
        for (const step of explanation) {
          expect(typeof step).toBe('string');
          expect(step.length).toBeGreaterThan(0);
        }
        
        // Explanation should be relevant to cell state
        if (cell.isRevealed && cell.hasMine) {
          expect(explanation.some(step => step.includes('mine'))).toBe(true);
        } else if (cell.isRevealed && cell.adjacentMineCount > 0) {
          expect(explanation.some(step => step.includes(cell.adjacentMineCount.toString()))).toBe(true);
        } else if (cell.isFlagged) {
          expect(explanation.some(step => step.includes('flagged'))).toBe(true);
        }
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 17: Stuck situation guidance
  test('Property 17: Stuck situation guidance', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      (config) => {
        const board = new BoardState(config);
        const reasoner = new AIReasoner();
        
        const guidance = reasoner.findStuckGuidance(board);
        
        // Should always provide guidance
        expect(guidance).toBeDefined();
        expect(guidance.length).toBeGreaterThan(0);
        
        // Each guidance step should be a non-empty string
        for (const step of guidance) {
          expect(typeof step).toBe('string');
          expect(step.length).toBeGreaterThan(0);
        }
        
        // Guidance should be actionable (contain coordinates or strategy)
        const hasCoordinates = guidance.some(step => /\(\d+,\s*\d+\)/.test(step));
        const hasStrategy = guidance.some(step => 
          step.includes('probability') || 
          step.includes('area') || 
          step.includes('consider') ||
          step.includes('contradiction')
        );
        
        expect(hasCoordinates || hasStrategy).toBe(true);
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 18: Contradiction detection
  test('Property 18: Contradiction detection', () => {
    fc.assert(fc.property(
      fc.record({
        width: fc.integer({ min: 3, max: 8 }),
        height: fc.integer({ min: 3, max: 8 }),
        mineCount: fc.integer({ min: 1, max: 10 })
      }).filter(config => config.mineCount < config.width * config.height),
      (config) => {
        const gameConfig: GameConfiguration = {
          ...config,
          difficulty: 'custom'
        };
        
        const board = new BoardState(gameConfig);
        const reasoner = new AIReasoner();
        
        // Create a potential contradiction by over-flagging
        const allCells = board.getAllCells();
        const numberedCells = allCells.filter(cell => 
          !cell.hasMine && cell.adjacentMineCount > 0
        );
        
        if (numberedCells.length > 0) {
          const numberedCell = numberedCells[0];
          board.revealCell(numberedCell.x, numberedCell.y);
          
          // Flag more adjacent cells than the number indicates
          const adjacentCells = board.getAdjacentCells(numberedCell.x, numberedCell.y);
          const unrevealedAdjacent = adjacentCells.filter(cell => !cell.isRevealed);
          
          // Flag all adjacent cells if there are more than the number indicates
          if (unrevealedAdjacent.length > numberedCell.adjacentMineCount) {
            for (const cell of unrevealedAdjacent) {
              board.toggleFlag(cell.x, cell.y);
            }
            
            const analysis = reasoner.analyzeBoard(board);
            
            // Should detect contradiction
            expect(analysis.hasContradiction).toBe(true);
            expect(analysis.contradictionExplanation).toBeDefined();
            expect(analysis.contradictionExplanation!.length).toBeGreaterThan(0);
          }
        }
      }
    ), { numRuns: 100 });
  });
});