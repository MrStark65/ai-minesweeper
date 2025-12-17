import { BoardCell, GameConfiguration, GameState, GameError } from '../types';

export class BoardState {
  private board: BoardCell[][];
  private gameStatus: 'playing' | 'won' | 'lost' = 'playing';
  private minesRemaining: number;
  private cellsRevealed: number = 0;
  private totalSafeCells: number;

  constructor(private config: GameConfiguration) {
    this.validateConfiguration(config);
    this.totalSafeCells = config.width * config.height - config.mineCount;
    this.minesRemaining = config.mineCount;
    this.board = this.initializeBoard();
    this.placeMines();
    this.calculateAdjacentMineCounts();
  }

  private validateConfiguration(config: GameConfiguration): void {
    if (config.width <= 0 || config.height <= 0) {
      throw new GameError('Grid dimensions must be positive', 'INVALID_DIMENSIONS');
    }
    
    if (config.mineCount < 0) {
      throw new GameError('Mine count cannot be negative', 'INVALID_MINE_COUNT');
    }
    
    if (config.mineCount >= config.width * config.height) {
      throw new GameError('Mine count cannot exceed or equal total cells', 'TOO_MANY_MINES');
    }
  }

  private initializeBoard(): BoardCell[][] {
    const board: BoardCell[][] = [];
    for (let y = 0; y < this.config.height; y++) {
      board[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        board[y][x] = {
          x,
          y,
          hasMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMineCount: 0
        };
      }
    }
    return board;
  }

  private placeMines(): void {
    let minesPlaced = 0;
    const totalCells = this.config.width * this.config.height;
    
    while (minesPlaced < this.config.mineCount) {
      const randomIndex = Math.floor(Math.random() * totalCells);
      const x = randomIndex % this.config.width;
      const y = Math.floor(randomIndex / this.config.width);
      
      if (!this.board[y][x].hasMine) {
        this.board[y][x].hasMine = true;
        minesPlaced++;
      }
    }
  }

  private calculateAdjacentMineCounts(): void {
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        if (!this.board[y][x].hasMine) {
          this.board[y][x].adjacentMineCount = this.countAdjacentMines(x, y);
        }
      }
    }
  }

  private countAdjacentMines(x: number, y: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValidCoordinate(nx, ny) && this.board[ny][nx].hasMine) {
          count++;
        }
      }
    }
    return count;
  }

  public revealCell(x: number, y: number): boolean {
    if (!this.isValidCoordinate(x, y)) {
      throw new GameError('Invalid coordinates', 'INVALID_COORDINATES');
    }

    const cell = this.board[y][x];
    
    if (cell.isRevealed || cell.isFlagged || this.gameStatus !== 'playing') {
      return false;
    }

    cell.isRevealed = true;
    this.cellsRevealed++;

    if (cell.hasMine) {
      this.gameStatus = 'lost';
      this.revealAllMines();
      return true;
    }

    // Cascade revelation for empty cells
    if (cell.adjacentMineCount === 0) {
      this.cascadeReveal(x, y);
    }

    // Check victory condition
    if (this.cellsRevealed === this.totalSafeCells) {
      this.gameStatus = 'won';
    }

    return true;
  }

  private cascadeReveal(x: number, y: number): void {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValidCoordinate(nx, ny)) {
          const adjacentCell = this.board[ny][nx];
          if (!adjacentCell.isRevealed && !adjacentCell.isFlagged && !adjacentCell.hasMine) {
            adjacentCell.isRevealed = true;
            this.cellsRevealed++;
            if (adjacentCell.adjacentMineCount === 0) {
              this.cascadeReveal(nx, ny);
            }
          }
        }
      }
    }
  }

  private revealAllMines(): void {
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        if (this.board[y][x].hasMine) {
          this.board[y][x].isRevealed = true;
        }
      }
    }
  }

  public toggleFlag(x: number, y: number): boolean {
    if (!this.isValidCoordinate(x, y)) {
      throw new GameError('Invalid coordinates', 'INVALID_COORDINATES');
    }

    const cell = this.board[y][x];
    
    if (cell.isRevealed || this.gameStatus !== 'playing') {
      return false;
    }

    cell.isFlagged = !cell.isFlagged;
    this.minesRemaining += cell.isFlagged ? -1 : 1;
    return true;
  }

  public getCell(x: number, y: number): BoardCell | null {
    if (!this.isValidCoordinate(x, y)) {
      return null;
    }
    return this.board[y][x];
  }

  public getAdjacentCells(x: number, y: number): BoardCell[] {
    const adjacent: BoardCell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValidCoordinate(nx, ny)) {
          adjacent.push(this.board[ny][nx]);
        }
      }
    }
    return adjacent;
  }

  public getGameState(): GameState {
    return {
      board: this.board.map(row => [...row]),
      gameStatus: this.gameStatus,
      minesRemaining: this.minesRemaining,
      cellsRevealed: this.cellsRevealed,
      totalSafeCells: this.totalSafeCells
    };
  }

  public getAllCells(): BoardCell[] {
    const cells: BoardCell[] = [];
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        cells.push(this.board[y][x]);
      }
    }
    return cells;
  }

  private isValidCoordinate(x: number, y: number): boolean {
    return x >= 0 && x < this.config.width && y >= 0 && y < this.config.height;
  }

  public getConfiguration(): GameConfiguration {
    return { ...this.config };
  }
}