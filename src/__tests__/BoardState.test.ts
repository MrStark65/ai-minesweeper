import * as fc from 'fast-check';
import { BoardState } from '../game/BoardState';
import { GameConfiguration, DIFFICULTY_PRESETS } from '../types';

describe('BoardState Property Tests', () => {
  
  // Feature: ai-minesweeper, Property 1: Mine placement correctness
  test('Property 1: Mine placement correctness', () => {
    fc.assert(fc.property(
      fc.record({
        width: fc.integer({ min: 3, max: 30 }),
        height: fc.integer({ min: 3, max: 30 }),
        mineCount: fc.integer({ min: 1, max: 50 })
      }).filter(config => config.mineCount < config.width * config.height),
      (config) => {
        const gameConfig: GameConfiguration = {
          ...config,
          difficulty: 'custom'
        };
        
        const board = new BoardState(gameConfig);
        const allCells = board.getAllCells();
        const mineCount = allCells.filter(cell => cell.hasMine).length;
        
        // Exactly the specified number of mines should be placed
        expect(mineCount).toBe(config.mineCount);
        
        // Mines should be distributed across the grid (no duplicates)
        const minePositions = new Set(
          allCells.filter(cell => cell.hasMine).map(cell => `${cell.x},${cell.y}`)
        );
        expect(minePositions.size).toBe(config.mineCount);
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 2: Cell revelation correctness
  test('Property 2: Cell revelation correctness', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      fc.integer({ min: 0, max: 8 }),
      fc.integer({ min: 0, max: 8 }),
      (config, x, y) => {
        // Ensure coordinates are within bounds
        const actualX = x % config.width;
        const actualY = y % config.height;
        
        const board = new BoardState(config);
        const cellBefore = board.getCell(actualX, actualY)!;
        const expectedMine = cellBefore.hasMine;
        const expectedCount = cellBefore.adjacentMineCount;
        
        if (!cellBefore.isRevealed) {
          board.revealCell(actualX, actualY);
          const cellAfter = board.getCell(actualX, actualY)!;
          
          // Cell should be revealed
          expect(cellAfter.isRevealed).toBe(true);
          
          // Content should match what was there before
          expect(cellAfter.hasMine).toBe(expectedMine);
          expect(cellAfter.adjacentMineCount).toBe(expectedCount);
        }
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 3: Cascade revelation
  test('Property 3: Cascade revelation', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      (config) => {
        const board = new BoardState(config);
        const allCells = board.getAllCells();
        
        // Find a cell with zero adjacent mines that's not a mine itself
        const zeroCells = allCells.filter(cell => 
          !cell.hasMine && cell.adjacentMineCount === 0 && !cell.isRevealed
        );
        
        if (zeroCells.length > 0) {
          const zeroCell = zeroCells[0];
          const adjacentCellsBefore = board.getAdjacentCells(zeroCell.x, zeroCell.y);
          
          board.revealCell(zeroCell.x, zeroCell.y);
          
          // All adjacent safe cells should be automatically revealed
          const adjacentCellsAfter = board.getAdjacentCells(zeroCell.x, zeroCell.y);
          for (const adjacentCell of adjacentCellsAfter) {
            if (!adjacentCell.hasMine) {
              expect(adjacentCell.isRevealed).toBe(true);
            }
          }
        }
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 4: Game over on mine click
  test('Property 4: Game over on mine click', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      (config) => {
        const board = new BoardState(config);
        const allCells = board.getAllCells();
        const mineCells = allCells.filter(cell => cell.hasMine);
        
        if (mineCells.length > 0) {
          const mineCell = mineCells[0];
          
          board.revealCell(mineCell.x, mineCell.y);
          const gameState = board.getGameState();
          
          // Game should be over
          expect(gameState.gameStatus).toBe('lost');
          
          // All mines should be revealed
          const allMines = board.getAllCells().filter(cell => cell.hasMine);
          for (const mine of allMines) {
            expect(mine.isRevealed).toBe(true);
          }
        }
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 5: Victory condition
  test('Property 5: Victory condition', () => {
    fc.assert(fc.property(
      fc.record({
        width: fc.integer({ min: 3, max: 10 }),
        height: fc.integer({ min: 3, max: 10 }),
        mineCount: fc.integer({ min: 1, max: 10 })
      }).filter(config => config.mineCount < config.width * config.height),
      (config) => {
        const gameConfig: GameConfiguration = {
          ...config,
          difficulty: 'custom'
        };
        
        const board = new BoardState(gameConfig);
        const allCells = board.getAllCells();
        
        // Reveal all non-mine cells
        for (const cell of allCells) {
          if (!cell.hasMine) {
            board.revealCell(cell.x, cell.y);
          }
        }
        
        const gameState = board.getGameState();
        
        // Game should be won
        expect(gameState.gameStatus).toBe('won');
        
        // All safe cells should be revealed
        const safeCells = allCells.filter(cell => !cell.hasMine);
        expect(gameState.cellsRevealed).toBe(safeCells.length);
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 13: Configuration validation
  test('Property 13: Configuration validation', () => {
    fc.assert(fc.property(
      fc.record({
        width: fc.integer({ min: -5, max: 50 }),
        height: fc.integer({ min: -5, max: 50 }),
        mineCount: fc.integer({ min: -5, max: 100 })
      }),
      (config) => {
        const gameConfig: GameConfiguration = {
          ...config,
          difficulty: 'custom'
        };
        
        const isValidConfig = 
          config.width > 0 && 
          config.height > 0 && 
          config.mineCount >= 0 && 
          config.mineCount < config.width * config.height;
        
        if (isValidConfig) {
          // Should not throw for valid configurations
          expect(() => new BoardState(gameConfig)).not.toThrow();
        } else {
          // Should throw for invalid configurations
          expect(() => new BoardState(gameConfig)).toThrow();
        }
      }
    ), { numRuns: 100 });
  });

  // Feature: ai-minesweeper, Property 14: Configuration restart
  test('Property 14: Configuration restart', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      fc.constantFrom(...Object.values(DIFFICULTY_PRESETS)),
      (initialConfig, newConfig) => {
        const board1 = new BoardState(initialConfig);
        
        // Make some moves
        const cells = board1.getAllCells();
        const safeCells = cells.filter(cell => !cell.hasMine);
        if (safeCells.length > 0) {
          board1.revealCell(safeCells[0].x, safeCells[0].y);
        }
        
        // Create new board with different configuration
        const board2 = new BoardState(newConfig);
        const newGameState = board2.getGameState();
        
        // New game should match new configuration parameters
        expect(newGameState.gameStatus).toBe('playing');
        expect(newGameState.cellsRevealed).toBe(0);
        expect(newGameState.minesRemaining).toBe(newConfig.mineCount);
        expect(newGameState.totalSafeCells).toBe(
          newConfig.width * newConfig.height - newConfig.mineCount
        );
        
        // Board dimensions should match new configuration
        const newCells = board2.getAllCells();
        const actualMineCount = newCells.filter(cell => cell.hasMine).length;
        expect(actualMineCount).toBe(newConfig.mineCount);
        expect(newCells.length).toBe(newConfig.width * newConfig.height);
      }
    ), { numRuns: 100 });
  });
});