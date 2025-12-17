import { BoardCell, Constraint, AIReasoningError } from '../types';

export class ConstraintSolver {
  private constraints: Map<string, Constraint> = new Map();
  private solutions: number[][][] = [];

  public generateConstraints(cells: BoardCell[]): Constraint[] {
    this.constraints.clear();
    const constraintList: Constraint[] = [];

    for (const cell of cells) {
      if (cell.isRevealed && cell.adjacentMineCount > 0) {
        const constraint = this.createConstraint(cell, cells);
        if (constraint.adjacentCells.length > 0) {
          const key = `${cell.x},${cell.y}`;
          this.constraints.set(key, constraint);
          constraintList.push(constraint);
        }
      }
    }

    return constraintList;
  }

  private createConstraint(centerCell: BoardCell, allCells: BoardCell[]): Constraint {
    const adjacentCells: BoardCell[] = [];
    let satisfiedMineCount = 0;

    // Find adjacent unrevealed cells and count already flagged mines
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const adjacentCell = allCells.find(c => 
          c.x === centerCell.x + dx && c.y === centerCell.y + dy
        );
        
        if (adjacentCell) {
          if (adjacentCell.isFlagged) {
            satisfiedMineCount++;
          } else if (!adjacentCell.isRevealed) {
            adjacentCells.push(adjacentCell);
          }
        }
      }
    }

    return {
      centerCell,
      adjacentCells,
      requiredMineCount: centerCell.adjacentMineCount,
      satisfiedMineCount
    };
  }

  public solveConstraints(constraints: Constraint[]): {
    certainSafeCells: BoardCell[];
    certainMineCells: BoardCell[];
    hasContradiction: boolean;
    contradictionExplanation?: string;
  } {
    const certainSafeCells: BoardCell[] = [];
    const certainMineCells: BoardCell[] = [];
    let hasContradiction = false;
    let contradictionExplanation: string | undefined;

    // Check for immediate contradictions
    for (const constraint of constraints) {
      const remainingMines = constraint.requiredMineCount - constraint.satisfiedMineCount;
      const unrevealedCells = constraint.adjacentCells.length;

      if (remainingMines < 0) {
        hasContradiction = true;
        contradictionExplanation = `Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) has too many flagged mines`;
        break;
      }

      if (remainingMines > unrevealedCells) {
        hasContradiction = true;
        contradictionExplanation = `Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) requires more mines than available cells`;
        break;
      }

      // Direct deductions
      if (remainingMines === 0) {
        // All remaining adjacent cells are safe
        for (const cell of constraint.adjacentCells) {
          if (!certainSafeCells.some(c => c.x === cell.x && c.y === cell.y)) {
            certainSafeCells.push(cell);
          }
        }
      } else if (remainingMines === unrevealedCells) {
        // All remaining adjacent cells are mines
        for (const cell of constraint.adjacentCells) {
          if (!certainMineCells.some(c => c.x === cell.x && c.y === cell.y)) {
            certainMineCells.push(cell);
          }
        }
      }
    }

    if (!hasContradiction) {
      // Advanced constraint satisfaction using backtracking
      const advancedResults = this.advancedConstraintSolving(constraints);
      certainSafeCells.push(...advancedResults.certainSafeCells);
      certainMineCells.push(...advancedResults.certainMineCells);
    }

    return {
      certainSafeCells,
      certainMineCells,
      hasContradiction,
      contradictionExplanation
    };
  }

  private advancedConstraintSolving(constraints: Constraint[]): {
    certainSafeCells: BoardCell[];
    certainMineCells: BoardCell[];
  } {
    const certainSafeCells: BoardCell[] = [];
    const certainMineCells: BoardCell[] = [];

    // Get all unique unrevealed cells involved in constraints
    const involvedCells = new Map<string, BoardCell>();
    for (const constraint of constraints) {
      for (const cell of constraint.adjacentCells) {
        const key = `${cell.x},${cell.y}`;
        involvedCells.set(key, cell);
      }
    }

    const cellArray = Array.from(involvedCells.values());
    if (cellArray.length === 0) return { certainSafeCells, certainMineCells };

    // Generate all possible mine configurations
    this.solutions = [];
    this.generateSolutions(cellArray, constraints, [], 0);

    // Find cells that have the same state in all valid solutions
    if (this.solutions.length > 0) {
      for (let i = 0; i < cellArray.length; i++) {
        const cell = cellArray[i];
        const allMine = this.solutions.every(solution => solution[0][i] === 1);
        const allSafe = this.solutions.every(solution => solution[0][i] === 0);

        if (allMine && !certainMineCells.some(c => c.x === cell.x && c.y === cell.y)) {
          certainMineCells.push(cell);
        } else if (allSafe && !certainSafeCells.some(c => c.x === cell.x && c.y === cell.y)) {
          certainSafeCells.push(cell);
        }
      }
    }

    return { certainSafeCells, certainMineCells };
  }

  private generateSolutions(
    cells: BoardCell[],
    constraints: Constraint[],
    currentAssignment: number[],
    cellIndex: number
  ): void {
    if (cellIndex === cells.length) {
      // Check if current assignment satisfies all constraints
      if (this.isValidAssignment(cells, constraints, currentAssignment)) {
        this.solutions.push([currentAssignment.slice()]);
      }
      return;
    }

    // Try assigning mine (1) and safe (0) to current cell
    for (const value of [0, 1]) {
      currentAssignment[cellIndex] = value;
      
      // Early pruning: check if partial assignment can still satisfy constraints
      if (this.canSatisfyConstraints(cells, constraints, currentAssignment, cellIndex + 1)) {
        this.generateSolutions(cells, constraints, currentAssignment, cellIndex + 1);
      }
    }
  }

  private isValidAssignment(
    cells: BoardCell[],
    constraints: Constraint[],
    assignment: number[]
  ): boolean {
    for (const constraint of constraints) {
      let mineCount = constraint.satisfiedMineCount;
      
      for (const cell of constraint.adjacentCells) {
        const cellIndex = cells.findIndex(c => c.x === cell.x && c.y === cell.y);
        if (cellIndex !== -1 && assignment[cellIndex] === 1) {
          mineCount++;
        }
      }
      
      if (mineCount !== constraint.requiredMineCount) {
        return false;
      }
    }
    return true;
  }

  private canSatisfyConstraints(
    cells: BoardCell[],
    constraints: Constraint[],
    partialAssignment: number[],
    assignedCount: number
  ): boolean {
    for (const constraint of constraints) {
      let currentMines = constraint.satisfiedMineCount;
      let unassignedCells = 0;
      
      for (const cell of constraint.adjacentCells) {
        const cellIndex = cells.findIndex(c => c.x === cell.x && c.y === cell.y);
        if (cellIndex !== -1) {
          if (cellIndex < assignedCount) {
            if (partialAssignment[cellIndex] === 1) {
              currentMines++;
            }
          } else {
            unassignedCells++;
          }
        }
      }
      
      const remainingMines = constraint.requiredMineCount - currentMines;
      
      // Check if constraint can still be satisfied
      if (remainingMines < 0 || remainingMines > unassignedCells) {
        return false;
      }
    }
    return true;
  }

  public calculateProbabilities(
    cells: BoardCell[],
    constraints: Constraint[],
    totalRemainingMines: number
  ): Map<string, number> {
    const probabilities = new Map<string, number>();
    
    // Get all unique unrevealed cells involved in constraints
    const involvedCells = new Map<string, BoardCell>();
    for (const constraint of constraints) {
      for (const cell of constraint.adjacentCells) {
        const key = `${cell.x},${cell.y}`;
        involvedCells.set(key, cell);
      }
    }

    const cellArray = Array.from(involvedCells.values());
    if (cellArray.length === 0) return probabilities;

    // Generate all valid solutions
    this.solutions = [];
    this.generateSolutions(cellArray, constraints, [], 0);

    if (this.solutions.length === 0) {
      // No valid solutions - set all probabilities to 0.5 as fallback
      for (const cell of cellArray) {
        probabilities.set(`${cell.x},${cell.y}`, 0.5);
      }
      return probabilities;
    }

    // Calculate probability for each cell
    for (let i = 0; i < cellArray.length; i++) {
      const cell = cellArray[i];
      const mineCount = this.solutions.reduce((sum, solution) => sum + solution[0][i], 0);
      const probability = mineCount / this.solutions.length;
      probabilities.set(`${cell.x},${cell.y}`, probability);
    }

    return probabilities;
  }

  public getValidSolutions(): number[][][] {
    return this.solutions.slice();
  }
}