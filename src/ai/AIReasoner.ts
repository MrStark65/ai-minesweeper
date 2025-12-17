import { BoardCell, AIRecommendation, AnalysisResult, ReasoningStep, Constraint } from '../types';
import { ConstraintSolver } from './ConstraintSolver';
import { BoardState } from '../game/BoardState';

export class AIReasoner {
  private constraintSolver: ConstraintSolver;

  constructor() {
    this.constraintSolver = new ConstraintSolver();
  }

  public analyzeBoard(boardState: BoardState): AnalysisResult {
    const gameState = boardState.getGameState();
    const allCells = boardState.getAllCells();
    
    // Generate constraints from revealed numbered cells
    const constraints = this.constraintSolver.generateConstraints(allCells);
    
    // Solve constraints to find certain moves
    const solverResult = this.constraintSolver.solveConstraints(constraints);
    
    const recommendations: AIRecommendation[] = [];
    const reasoning: ReasoningStep[] = [];
    
    // Handle contradictions
    if (solverResult.hasContradiction) {
      return {
        recommendations: [],
        reasoning: [{
          description: solverResult.contradictionExplanation || 'Board state contains logical contradictions',
          affectedCells: [],
          constraints: [],
          type: 'deduction'
        }],
        probabilities: new Map(),
        hasContradiction: true,
        contradictionExplanation: solverResult.contradictionExplanation
      };
    }

    // Process certain safe cells
    if (solverResult.certainSafeCells.length > 0) {
      const safeRecommendations = solverResult.certainSafeCells.map(cell => ({
        targetCell: cell,
        action: 'reveal' as const,
        confidence: 'certain' as const,
        reasoning: this.generateSafeReasoningSteps(cell, constraints),
        relatedConstraints: this.findRelatedConstraints(cell, constraints)
      }));
      
      recommendations.push(...safeRecommendations);
      
      reasoning.push({
        description: `Found ${solverResult.certainSafeCells.length} cells that are guaranteed safe through logical deduction`,
        affectedCells: solverResult.certainSafeCells,
        constraints: constraints.filter(c => 
          c.adjacentCells.some(ac => 
            solverResult.certainSafeCells.some(sc => sc.x === ac.x && sc.y === ac.y)
          )
        ),
        type: 'deduction'
      });
    }

    // Process certain mine cells
    if (solverResult.certainMineCells.length > 0) {
      const mineRecommendations = solverResult.certainMineCells.map(cell => ({
        targetCell: cell,
        action: 'flag' as const,
        confidence: 'certain' as const,
        reasoning: this.generateMineReasoningSteps(cell, constraints),
        relatedConstraints: this.findRelatedConstraints(cell, constraints)
      }));
      
      recommendations.push(...mineRecommendations);
      
      reasoning.push({
        description: `Found ${solverResult.certainMineCells.length} cells that are guaranteed mines through logical deduction`,
        affectedCells: solverResult.certainMineCells,
        constraints: constraints.filter(c => 
          c.adjacentCells.some(ac => 
            solverResult.certainMineCells.some(mc => mc.x === ac.x && mc.y === ac.y)
          )
        ),
        type: 'deduction'
      });
    }

    // Calculate probabilities for remaining uncertain cells
    const probabilities = this.constraintSolver.calculateProbabilities(
      allCells,
      constraints,
      gameState.minesRemaining
    );

    // If no certain moves, recommend based on probabilities
    if (recommendations.length === 0 && probabilities.size > 0) {
      const probabilityRecommendation = this.generateProbabilityRecommendation(
        allCells,
        probabilities,
        constraints
      );
      
      if (probabilityRecommendation) {
        recommendations.push(probabilityRecommendation);
        
        reasoning.push({
          description: `No certain moves available. Recommending cell with lowest mine probability (${(probabilityRecommendation.targetCell.probability! * 100).toFixed(1)}%)`,
          affectedCells: [probabilityRecommendation.targetCell],
          constraints: this.findRelatedConstraints(probabilityRecommendation.targetCell, constraints),
          type: 'probability'
        });
      }
    }

    // Add probability information to cells
    for (const [cellKey, probability] of probabilities) {
      const [x, y] = cellKey.split(',').map(Number);
      const cell = allCells.find(c => c.x === x && c.y === y);
      if (cell) {
        cell.probability = probability;
      }
    }

    return {
      recommendations,
      reasoning,
      probabilities,
      hasContradiction: false
    };
  }

  private generateSafeReasoningSteps(cell: BoardCell, constraints: Constraint[]): string[] {
    const steps: string[] = [];
    const relatedConstraints = this.findRelatedConstraints(cell, constraints);
    
    for (const constraint of relatedConstraints) {
      const remainingMines = constraint.requiredMineCount - constraint.satisfiedMineCount;
      const unrevealedCells = constraint.adjacentCells.length;
      
      if (remainingMines === 0) {
        steps.push(
          `Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) shows ${constraint.requiredMineCount} ` +
          `and already has ${constraint.satisfiedMineCount} flagged mines, so all remaining adjacent cells are safe`
        );
      } else if (remainingMines < unrevealedCells) {
        steps.push(
          `Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) needs ${remainingMines} more mines ` +
          `among ${unrevealedCells} cells. Through constraint analysis, this cell must be safe`
        );
      }
    }
    
    if (steps.length === 0) {
      steps.push('This cell is safe based on advanced constraint satisfaction analysis');
    }
    
    return steps;
  }

  private generateMineReasoningSteps(cell: BoardCell, constraints: Constraint[]): string[] {
    const steps: string[] = [];
    const relatedConstraints = this.findRelatedConstraints(cell, constraints);
    
    for (const constraint of relatedConstraints) {
      const remainingMines = constraint.requiredMineCount - constraint.satisfiedMineCount;
      const unrevealedCells = constraint.adjacentCells.length;
      
      if (remainingMines === unrevealedCells) {
        steps.push(
          `Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) shows ${constraint.requiredMineCount} ` +
          `and needs ${remainingMines} more mines among ${unrevealedCells} remaining cells, so all must be mines`
        );
      } else {
        steps.push(
          `Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) requires this cell to be a mine ` +
          `to satisfy its constraint of ${constraint.requiredMineCount} adjacent mines`
        );
      }
    }
    
    if (steps.length === 0) {
      steps.push('This cell must contain a mine based on advanced constraint satisfaction analysis');
    }
    
    return steps;
  }

  private generateProbabilityRecommendation(
    allCells: BoardCell[],
    probabilities: Map<string, number>,
    constraints: Constraint[]
  ): AIRecommendation | null {
    let bestCell: BoardCell | null = null;
    let lowestProbability = 1.0;
    
    // Find unrevealed, unflagged cell with lowest mine probability
    for (const cell of allCells) {
      if (!cell.isRevealed && !cell.isFlagged) {
        const cellKey = `${cell.x},${cell.y}`;
        const probability = probabilities.get(cellKey) ?? 0.5; // Default probability for unconstrained cells
        
        if (probability < lowestProbability) {
          lowestProbability = probability;
          bestCell = cell;
        }
      }
    }
    
    if (!bestCell) return null;
    
    bestCell.probability = lowestProbability;
    
    return {
      targetCell: bestCell,
      action: 'reveal',
      confidence: 'probable',
      reasoning: [
        `This cell has the lowest calculated mine probability (${(lowestProbability * 100).toFixed(1)}%)`,
        'Based on constraint analysis of surrounding numbered cells',
        'This represents the safest probabilistic choice available'
      ],
      relatedConstraints: this.findRelatedConstraints(bestCell, constraints)
    };
  }

  private findRelatedConstraints(cell: BoardCell, constraints: Constraint[]): Constraint[] {
    return constraints.filter(constraint =>
      constraint.adjacentCells.some(ac => ac.x === cell.x && ac.y === cell.y)
    );
  }

  public explainCell(cell: BoardCell, boardState: BoardState): string[] {
    const explanation: string[] = [];
    const allCells = boardState.getAllCells();
    const constraints = this.constraintSolver.generateConstraints(allCells);
    const relatedConstraints = this.findRelatedConstraints(cell, constraints);
    
    if (cell.isRevealed) {
      if (cell.hasMine) {
        explanation.push('This cell contains a mine and has been revealed (game over)');
      } else if (cell.adjacentMineCount > 0) {
        explanation.push(`This cell shows ${cell.adjacentMineCount}, indicating ${cell.adjacentMineCount} mines in adjacent cells`);
        
        const adjacentCells = boardState.getAdjacentCells(cell.x, cell.y);
        const flaggedCount = adjacentCells.filter(c => c.isFlagged).length;
        const unrevealedCount = adjacentCells.filter(c => !c.isRevealed && !c.isFlagged).length;
        
        explanation.push(`Adjacent status: ${flaggedCount} flagged, ${unrevealedCount} unrevealed`);
        
        if (flaggedCount === cell.adjacentMineCount) {
          explanation.push('All mines are flagged - remaining adjacent cells are safe to reveal');
        } else if (flaggedCount + unrevealedCount === cell.adjacentMineCount) {
          explanation.push('All unrevealed adjacent cells must be mines');
        }
      } else {
        explanation.push('This cell is empty (no adjacent mines)');
      }
    } else if (cell.isFlagged) {
      explanation.push('This cell is flagged as containing a mine');
      if (relatedConstraints.length > 0) {
        explanation.push(`This flag helps satisfy ${relatedConstraints.length} constraint(s)`);
      }
    } else {
      explanation.push('This cell is unrevealed');
      
      if (cell.probability !== undefined) {
        explanation.push(`Calculated mine probability: ${(cell.probability * 100).toFixed(1)}%`);
      }
      
      if (relatedConstraints.length > 0) {
        explanation.push(`This cell is constrained by ${relatedConstraints.length} numbered cell(s)`);
        for (const constraint of relatedConstraints) {
          const remaining = constraint.requiredMineCount - constraint.satisfiedMineCount;
          explanation.push(
            `  - Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) needs ${remaining} more mines`
          );
        }
      } else {
        explanation.push('This cell is not directly constrained by any revealed numbers');
      }
    }
    
    return explanation;
  }

  public findStuckGuidance(boardState: BoardState): string[] {
    const guidance: string[] = [];
    const analysisResult = this.analyzeBoard(boardState);
    
    if (analysisResult.hasContradiction) {
      guidance.push('The board contains logical contradictions - check your flag placements');
      return guidance;
    }
    
    if (analysisResult.recommendations.length > 0) {
      guidance.push('There are still logical moves available - use AI assistance to find them');
      return guidance;
    }
    
    // Find areas with lowest probabilities
    const probabilities = Array.from(analysisResult.probabilities.entries())
      .map(([key, prob]) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y, probability: prob };
      })
      .sort((a, b) => a.probability - b.probability);
    
    if (probabilities.length > 0) {
      const lowest = probabilities[0];
      guidance.push(`Consider the area around (${lowest.x}, ${lowest.y}) - lowest probability ${(lowest.probability * 100).toFixed(1)}%`);
      
      if (probabilities.length > 1) {
        const secondLowest = probabilities[1];
        guidance.push(`Alternative: area around (${secondLowest.x}, ${secondLowest.y}) - probability ${(secondLowest.probability * 100).toFixed(1)}%`);
      }
    } else {
      guidance.push('No constrained cells found - consider revealing cells near existing numbers');
    }
    
    return guidance;
  }
}