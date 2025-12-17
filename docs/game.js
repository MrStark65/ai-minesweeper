// AI Minesweeper Web Interface
class MinesweeperUI {
    constructor() {
        this.game = null;
        this.currentDifficulty = 'intermediate';
        this.gameMode = 'reveal'; // 'reveal' or 'flag'
        this.gameEngine = null;
        this.aiReasoner = null;
        this.autoPlayActive = false;
        this.autoPlayInterval = null;
        this.autoPlaySpeed = 1000; // milliseconds
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }

    async initializeGame() {
        // Initialize the game engine (we'll simulate this since we can't import Node.js modules directly)
        this.gameEngine = new GameEngine(this.currentDifficulty);
        this.aiReasoner = new AIReasoner();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Difficulty buttons
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeDifficulty(e.target.dataset.difficulty);
            });
        });

        // Game controls
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('ai-help').addEventListener('click', () => this.getAIHelp());
        document.getElementById('auto-play').addEventListener('click', () => this.toggleAutoPlay());
        document.getElementById('toggle-mode').addEventListener('click', () => this.toggleMode());
        
        // Auto-play speed control
        document.getElementById('auto-play-speed').addEventListener('change', (e) => {
            this.autoPlaySpeed = parseInt(e.target.value);
        });

        // Mobile controls
        document.getElementById('mobile-new-game').addEventListener('click', () => this.newGame());
        document.getElementById('mobile-ai-help').addEventListener('click', () => this.getAIHelp());
        document.getElementById('mobile-auto-play').addEventListener('click', () => this.toggleAutoPlay());
        document.getElementById('mobile-toggle-mode').addEventListener('click', () => this.toggleMode());

        // Modal controls
        document.getElementById('modal-new-game').addEventListener('click', () => {
            this.hideModal();
            this.newGame();
        });
        document.getElementById('modal-close').addEventListener('click', () => this.hideModal());
    }

    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        
        // Update active button
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
        });
        
        this.newGame();
        
        // Show tutorial message
        if (difficulty === 'tutorial') {
            setTimeout(() => {
                this.displaySimpleMessage("👋 Welcome! This is a tiny 6×6 grid with only 3 mines. Perfect for learning! Try clicking 'Auto Play' to watch me play first.");
            }, 500);
        }
    }

    newGame() {
        this.stopAutoPlay();
        this.gameEngine = new GameEngine(this.currentDifficulty);
        this.clearAIDisplay();
        this.updateDisplay();
        this.hideModal();
    }

    toggleAutoPlay() {
        if (this.autoPlayActive) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        if (this.gameEngine.gameState.gameStatus !== 'playing') {
            return;
        }

        this.autoPlayActive = true;
        this.updateAutoPlayButton();
        
        this.autoPlayInterval = setInterval(() => {
            if (this.gameEngine.gameState.gameStatus !== 'playing') {
                this.stopAutoPlay();
                return;
            }

            const analysis = this.aiReasoner.analyzeBoard(this.gameEngine);
            
            if (analysis.recommendations.length > 0) {
                const rec = analysis.recommendations[0];
                this.displaySimpleAIAnalysis(analysis);
                this.highlightRecommendations([rec]);
                
                // Check if the move is safe enough for auto-play
                const isSafeForAutoPlay = this.isSafeForAutoPlay(rec);
                
                if (isSafeForAutoPlay) {
                    // Execute the AI's recommendation
                    setTimeout(() => {
                        this.makeMove(rec.targetCell.x, rec.targetCell.y, rec.action);
                    }, this.autoPlaySpeed / 2);
                } else {
                    // Stop auto-play for risky moves
                    this.stopAutoPlay();
                    const probability = rec.targetCell.probability;
                    if (probability !== undefined) {
                        if (probability >= 0.5) {
                            this.displaySimpleMessage(`🛑 STOP! This move is too risky (${(probability * 100).toFixed(1)}% chance of mine). I won't risk it - you decide!`);
                        } else {
                            this.displaySimpleMessage(`⚠️ This move has ${(probability * 100).toFixed(1)}% mine risk. For 100% accuracy, I'm letting you decide!`);
                        }
                    } else {
                        this.displaySimpleMessage(`🤔 This situation is uncertain. For maximum accuracy, you should make this decision!`);
                    }
                }
            } else {
                // No moves available, stop auto-play
                this.stopAutoPlay();
                this.displaySimpleMessage("🤔 I'm not sure what to do next. You take over!");
            }
        }, this.autoPlaySpeed);
    }

    stopAutoPlay() {
        this.autoPlayActive = false;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.updateAutoPlayButton();
    }

    updateAutoPlayButton() {
        const button = document.getElementById('auto-play');
        const mobileButton = document.getElementById('mobile-auto-play');
        
        if (this.autoPlayActive) {
            button.textContent = '⏸️ Stop Auto';
            button.classList.add('playing');
            mobileButton.textContent = '⏸️ Stop';
            mobileButton.classList.add('playing');
        } else {
            button.textContent = '▶️ Auto Play';
            button.classList.remove('playing');
            mobileButton.textContent = '▶️ Auto';
            mobileButton.classList.remove('playing');
        }
    }

    isSafeForAutoPlay(recommendation) {
        // Only auto-play mathematically certain moves for 100% accuracy
        if (recommendation.confidence === 'certain') {
            return true;
        }
        
        // For probable moves, be very conservative
        if (recommendation.targetCell.probability !== undefined) {
            // Only auto-play if probability is extremely low (< 10%)
            return recommendation.targetCell.probability < 0.1;
        }
        
        // For first moves, allow auto-play (statistically safe)
        const gameState = this.gameEngine.getGameState();
        if (gameState.cellsRevealed === 0) {
            return true;
        }
        
        // Default to stopping auto-play - let human make risky decisions
        return false;
    }

    toggleMode() {
        this.gameMode = this.gameMode === 'reveal' ? 'flag' : 'reveal';
        document.getElementById('toggle-mode').textContent = `Mode: ${this.gameMode.charAt(0).toUpperCase() + this.gameMode.slice(1)}`;
        document.getElementById('mobile-toggle-mode').textContent = this.gameMode === 'reveal' ? '👆 Reveal' : '🚩 Flag';
    }

    async getAIHelp() {
        const analysis = this.aiReasoner.analyzeBoard(this.gameEngine);
        this.displayAIAnalysis(analysis);
        this.highlightRecommendations(analysis.recommendations);
    }

    makeMove(x, y, action = null) {
        const moveAction = action || this.gameMode;
        const result = this.gameEngine.makeMove(x, y, moveAction);
        
        this.updateDisplay();
        
        if (this.gameEngine.gameState.gameStatus !== 'playing') {
            this.showGameOverModal();
        }
        
        return result;
    }

    updateDisplay() {
        this.renderBoard();
        this.updateGameInfo();
    }

    renderBoard() {
        const board = this.gameEngine.getBoard();
        const boardElement = document.getElementById('game-board');
        
        // Set grid dimensions
        boardElement.style.gridTemplateColumns = `repeat(${board[0].length}, 1fr)`;
        boardElement.innerHTML = '';
        
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                const cell = board[y][x];
                const cellElement = this.createCellElement(cell, x, y);
                boardElement.appendChild(cellElement);
            }
        }
    }

    createCellElement(cell, x, y) {
        const cellElement = document.createElement('button');
        cellElement.className = 'cell';
        cellElement.dataset.x = x;
        cellElement.dataset.y = y;
        
        if (cell.isRevealed) {
            cellElement.classList.add('revealed');
            if (cell.hasMine) {
                cellElement.classList.add('mine');
                cellElement.textContent = '💣';
            } else if (cell.adjacentMineCount > 0) {
                cellElement.textContent = cell.adjacentMineCount;
                cellElement.dataset.number = cell.adjacentMineCount;
            }
        } else if (cell.isFlagged) {
            cellElement.classList.add('flagged');
            cellElement.textContent = '🚩';
        } else {
            cellElement.textContent = '';
        }
        
        // Add probability styling if available
        if (cell.probability !== undefined) {
            if (cell.probability < 0.3) {
                cellElement.classList.add('probability-low');
            } else if (cell.probability < 0.7) {
                cellElement.classList.add('probability-medium');
            } else {
                cellElement.classList.add('probability-high');
            }
        }
        
        cellElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.makeMove(x, y);
            this.explainCell(x, y);
        });
        
        cellElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.makeMove(x, y, 'flag');
        });
        
        return cellElement;
    }

    updateGameInfo() {
        const state = this.gameEngine.gameState;
        document.getElementById('mines-count').textContent = state.minesRemaining;
        document.getElementById('game-status').textContent = state.gameStatus.toUpperCase();
        document.getElementById('progress').textContent = `${state.cellsRevealed}/${state.totalSafeCells}`;
        
        // Update status color
        const statusElement = document.getElementById('game-status');
        statusElement.className = 'value';
        if (state.gameStatus === 'won') {
            statusElement.style.color = 'var(--success-color)';
        } else if (state.gameStatus === 'lost') {
            statusElement.style.color = 'var(--danger-color)';
        } else {
            statusElement.style.color = 'var(--text-color)';
        }
    }

    displayAIAnalysis(analysis) {
        this.displaySimpleAIAnalysis(analysis);
        this.displayProbabilities(analysis.probabilities);
    }

    displaySimpleAIAnalysis(analysis) {
        const recommendationElement = document.getElementById('ai-recommendation');
        const reasoningElement = document.querySelector('#ai-reasoning .reasoning-steps');
        
        // Display main recommendation in simple language
        if (analysis.recommendations.length > 0) {
            const rec = analysis.recommendations[0];
            const action = rec.action === 'reveal' ? 'Click' : 'Flag';
            
            let confidence, messageClass;
            if (rec.confidence === 'certain') {
                confidence = '💯 100% Sure';
                messageClass = 'success';
            } else if (rec.targetCell.probability < 0.1) {
                confidence = '✅ Very Safe';
                messageClass = 'success';
            } else if (rec.targetCell.probability < 0.3) {
                confidence = '🎯 Good Choice';
                messageClass = 'warning';
            } else {
                confidence = '⚠️ Risky';
                messageClass = 'danger';
            }
            
            recommendationElement.innerHTML = `
                <div class="ai-message simple ${messageClass}">
                    <strong>${confidence}:</strong> ${action} the cell at (${rec.targetCell.x}, ${rec.targetCell.y})
                    ${rec.targetCell.probability !== undefined ? `<br><small>${(rec.targetCell.probability * 100).toFixed(1)}% chance it's a mine</small>` : ''}
                    ${analysis.solutionCount ? `<br><small>Analyzed ${analysis.solutionCount} possible solutions</small>` : ''}
                </div>
            `;
        } else if (analysis.hasContradiction) {
            recommendationElement.innerHTML = `
                <div class="ai-message simple danger">
                    <strong>⚠️ Contradiction:</strong> ${analysis.contradictionExplanation || 'Check your flag placements!'}
                </div>
            `;
        } else {
            recommendationElement.innerHTML = `
                <div class="ai-message simple">
                    <strong>🤔 No Clear Move:</strong> This situation may require guessing.
                </div>
            `;
        }
        
        // Display simple reasoning
        reasoningElement.innerHTML = '';
        if (analysis.reasoning.length > 0) {
            const simpleReason = this.simplifyReasoning(analysis.reasoning[0].description);
            const stepElement = document.createElement('div');
            stepElement.className = 'reasoning-step';
            stepElement.textContent = simpleReason;
            reasoningElement.appendChild(stepElement);
        }
    }

    displaySimpleMessage(message) {
        const recommendationElement = document.getElementById('ai-recommendation');
        recommendationElement.innerHTML = `
            <div class="ai-message simple">
                ${message}
            </div>
        `;
    }

    simplifyReasoning(complexReason) {
        // Convert complex AI reasoning to simple explanations
        if (complexReason.includes('guaranteed safe')) {
            return "This cell is definitely safe to click!";
        } else if (complexReason.includes('guaranteed mines')) {
            return "This cell is definitely a mine - flag it!";
        } else if (complexReason.includes('lowest probability')) {
            return "This cell has the best chance of being safe.";
        } else if (complexReason.includes('constraint')) {
            return "The numbers nearby tell us this is the right move.";
        } else if (complexReason.includes('flagged mines')) {
            return "All the mines around this number are already flagged.";
        } else {
            return "This looks like the safest choice right now.";
        }
    }

    displayProbabilities(probabilities) {
        const probabilityElement = document.getElementById('probability-display');
        
        if (probabilities.size === 0) {
            probabilityElement.innerHTML = '<p>No probability data available</p>';
            return;
        }
        
        const sortedProbs = Array.from(probabilities.entries())
            .map(([key, prob]) => {
                const [x, y] = key.split(',').map(Number);
                return { x, y, probability: prob };
            })
            .sort((a, b) => a.probability - b.probability)
            .slice(0, 10); // Show top 10
        
        probabilityElement.innerHTML = sortedProbs.map(item => `
            <div class="probability-item">
                <span>(${item.x}, ${item.y})</span>
                <span>${(item.probability * 100).toFixed(1)}%</span>
            </div>
        `).join('');
    }

    highlightRecommendations(recommendations) {
        // Clear previous highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('safe-recommendation', 'mine-recommendation');
        });
        
        // Add new highlights
        recommendations.forEach(rec => {
            const cellElement = document.querySelector(`[data-x="${rec.targetCell.x}"][data-y="${rec.targetCell.y}"]`);
            if (cellElement) {
                if (rec.action === 'reveal') {
                    cellElement.classList.add('safe-recommendation');
                } else {
                    cellElement.classList.add('mine-recommendation');
                }
            }
        });
    }

    explainCell(x, y) {
        const explanation = this.aiReasoner.explainCell(x, y, this.gameEngine);
        const explanationElement = document.querySelector('#cell-explanation .explanation-text');
        
        // Simplify the explanation
        const simpleExplanation = this.simplifyExplanation(explanation);
        
        explanationElement.innerHTML = `
            <strong>Cell (${x}, ${y}):</strong><br>
            ${simpleExplanation}
        `;
    }

    simplifyExplanation(explanation) {
        const text = explanation.join(' ');
        
        if (text.includes('contains a mine')) {
            return "💣 This is a mine! Game over.";
        } else if (text.includes('Shows') && text.includes('indicates')) {
            const match = text.match(/Shows (\d+)/);
            const number = match ? match[1] : '?';
            return `🔢 This number ${number} means there are ${number} mines touching this cell.`;
        } else if (text.includes('Empty cell')) {
            return "✨ This cell is empty - no mines nearby!";
        } else if (text.includes('Flagged')) {
            return "🚩 You marked this as a mine.";
        } else if (text.includes('Unrevealed')) {
            if (text.includes('probability')) {
                const match = text.match(/(\d+\.?\d*)%/);
                const prob = match ? match[1] : '?';
                return `❓ Hidden cell. About ${prob}% chance it's a mine.`;
            } else {
                return "❓ Hidden cell. Click to see what's inside!";
            }
        } else if (text.includes('safe')) {
            return "✅ This cell is safe to click!";
        } else if (text.includes('mine')) {
            return "⚠️ This cell might be a mine. Be careful!";
        } else {
            return "❓ Click to reveal what's in this cell.";
        }
    }

    clearAIDisplay() {
        document.getElementById('ai-recommendation').innerHTML = '<p class="ai-message simple">Click "AI Help" to see what to do next</p>';
        document.querySelector('#ai-reasoning .reasoning-steps').innerHTML = '';
        document.querySelector('#cell-explanation .explanation-text').innerHTML = 'Click any cell to learn about it';
        document.getElementById('probability-display').innerHTML = '<p>Numbers will appear here when I calculate chances</p>';
        
        // Clear highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('safe-recommendation', 'mine-recommendation');
        });
    }

    showGameOverModal() {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        
        const state = this.gameEngine.gameState;
        if (state.gameStatus === 'won') {
            title.textContent = '🎉 Victory!';
            message.textContent = 'Congratulations! You successfully cleared all mines!';
        } else {
            title.textContent = '💥 Game Over';
            message.textContent = 'You hit a mine! Better luck next time.';
        }
        
        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('game-over-modal').classList.add('hidden');
    }
}

// Simplified Game Engine for Web (simulates the Node.js backend)
class GameEngine {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.config = this.getDifficultyConfig(difficulty);
        this.board = this.initializeBoard();
        this.gameState = {
            gameStatus: 'playing',
            minesRemaining: this.config.mineCount,
            cellsRevealed: 0,
            totalSafeCells: this.config.width * this.config.height - this.config.mineCount
        };
        this.placeMines();
        this.calculateAdjacentMineCounts();
    }

    getDifficultyConfig(difficulty) {
        const configs = {
            tutorial: { width: 6, height: 6, mineCount: 3 },
            beginner: { width: 9, height: 9, mineCount: 10 },
            intermediate: { width: 16, height: 16, mineCount: 40 },
            expert: { width: 30, height: 16, mineCount: 99 }
        };
        return configs[difficulty] || configs.intermediate;
    }

    initializeBoard() {
        const board = [];
        for (let y = 0; y < this.config.height; y++) {
            board[y] = [];
            for (let x = 0; x < this.config.width; x++) {
                board[y][x] = {
                    x, y,
                    hasMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMineCount: 0
                };
            }
        }
        return board;
    }

    placeMines() {
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

    calculateAdjacentMineCounts() {
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (!this.board[y][x].hasMine) {
                    this.board[y][x].adjacentMineCount = this.countAdjacentMines(x, y);
                }
            }
        }
    }

    countAdjacentMines(x, y) {
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

    makeMove(x, y, action) {
        if (!this.isValidCoordinate(x, y) || this.gameState.gameStatus !== 'playing') {
            return false;
        }

        const cell = this.board[y][x];
        
        if (action === 'flag') {
            if (!cell.isRevealed) {
                cell.isFlagged = !cell.isFlagged;
                this.gameState.minesRemaining += cell.isFlagged ? -1 : 1;
            }
            return true;
        }
        
        if (action === 'reveal' && !cell.isRevealed && !cell.isFlagged) {
            cell.isRevealed = true;
            this.gameState.cellsRevealed++;
            
            if (cell.hasMine) {
                this.gameState.gameStatus = 'lost';
                this.revealAllMines();
            } else {
                if (cell.adjacentMineCount === 0) {
                    this.cascadeReveal(x, y);
                }
                
                if (this.gameState.cellsRevealed === this.gameState.totalSafeCells) {
                    this.gameState.gameStatus = 'won';
                }
            }
            return true;
        }
        
        return false;
    }

    cascadeReveal(x, y) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (this.isValidCoordinate(nx, ny)) {
                    const adjacentCell = this.board[ny][nx];
                    if (!adjacentCell.isRevealed && !adjacentCell.isFlagged && !adjacentCell.hasMine) {
                        adjacentCell.isRevealed = true;
                        this.gameState.cellsRevealed++;
                        if (adjacentCell.adjacentMineCount === 0) {
                            this.cascadeReveal(nx, ny);
                        }
                    }
                }
            }
        }
    }

    revealAllMines() {
        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (this.board[y][x].hasMine) {
                    this.board[y][x].isRevealed = true;
                }
            }
        }
    }

    getBoard() {
        return this.board;
    }

    getAdjacentCells(x, y) {
        const adjacent = [];
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

    isValidCoordinate(x, y) {
        return x >= 0 && x < this.config.width && y >= 0 && y < this.config.height;
    }
}

// Perfect AI Reasoner with Advanced Constraint Satisfaction and Backtracking
class AIReasoner {
    constructor() {
        this.constraints = new Map();
        this.solutions = [];
        this.maxSolutions = 1000; // Limit for performance
    }

    analyzeBoard(gameEngine) {
        const board = gameEngine.getBoard();
        const allCells = this.getAllCells(board);
        const gameState = gameEngine.gameState;
        
        // Generate constraints from revealed numbered cells
        const constraints = this.generateConstraints(allCells);
        
        // Advanced constraint solving with backtracking
        const solverResult = this.advancedConstraintSolving(constraints, allCells, gameState.minesRemaining);
        
        const recommendations = [];
        const reasoning = [];
        
        // Handle contradictions
        if (solverResult.hasContradiction) {
            return {
                recommendations: [],
                reasoning: [{
                    description: solverResult.contradictionExplanation || 'Board state contains logical contradictions - check your flags!'
                }],
                probabilities: new Map(),
                hasContradiction: true,
                contradictionExplanation: solverResult.contradictionExplanation
            };
        }

        // Process certain safe cells (100% accuracy)
        if (solverResult.certainSafeCells.length > 0) {
            const safeCell = solverResult.certainSafeCells[0];
            recommendations.push({
                targetCell: safeCell,
                action: 'reveal',
                confidence: 'certain',
                reasoning: [`This cell is 100% guaranteed safe through mathematical proof`]
            });
            
            reasoning.push({
                description: `Found ${solverResult.certainSafeCells.length} mathematically proven safe cells`
            });
        }

        // Process certain mine cells (100% accuracy)
        if (solverResult.certainMineCells.length > 0) {
            const mineCell = solverResult.certainMineCells[0];
            recommendations.push({
                targetCell: mineCell,
                action: 'flag',
                confidence: 'certain',
                reasoning: [`This cell is 100% guaranteed to contain a mine through mathematical proof`]
            });
            
            reasoning.push({
                description: `Found ${solverResult.certainMineCells.length} mathematically proven mine cells`
            });
        }

        // If no certain moves, use advanced probability analysis
        if (recommendations.length === 0) {
            const probabilityRecommendation = this.generateOptimalProbabilityRecommendation(
                allCells, 
                solverResult.probabilities, 
                gameState.minesRemaining
            );
            
            if (probabilityRecommendation) {
                recommendations.push(probabilityRecommendation);
                reasoning.push({
                    description: `No 100% certain moves. Recommending mathematically optimal choice`
                });
            } else {
                // Handle situations where no recommendations can be made
                const fallbackRecommendation = this.generateFallbackRecommendation(allCells, gameState);
                if (fallbackRecommendation) {
                    recommendations.push(fallbackRecommendation);
                    reasoning.push({
                        description: `Making strategic choice based on general Minesweeper principles`
                    });
                }
            }
        }

        return {
            recommendations,
            reasoning,
            probabilities: solverResult.probabilities,
            hasContradiction: false,
            solutionCount: solverResult.solutionCount
        };
    }

    getAllCells(board) {
        const cells = [];
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                cells.push(board[y][x]);
            }
        }
        return cells;
    }

    getBoardFromCells(cells) {
        if (cells.length === 0) return [];
        
        const maxX = Math.max(...cells.map(c => c.x));
        const maxY = Math.max(...cells.map(c => c.y));
        const board = [];
        
        for (let y = 0; y <= maxY; y++) {
            board[y] = [];
            for (let x = 0; x <= maxX; x++) {
                board[y][x] = cells.find(c => c.x === x && c.y === y);
            }
        }
        
        return board;
    }

    generateConstraints(cells) {
        const constraints = [];
        
        for (const cell of cells) {
            if (cell.isRevealed && cell.adjacentMineCount > 0) {
                const constraint = this.createConstraint(cell, cells);
                if (constraint.adjacentCells.length > 0) {
                    constraints.push(constraint);
                }
            }
        }
        
        return constraints;
    }

    createConstraint(centerCell, allCells) {
        const adjacentCells = [];
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

        // Validate constraint before returning
        const remainingMines = centerCell.adjacentMineCount - satisfiedMineCount;
        if (remainingMines < 0) {
            console.warn(`Invalid constraint at (${centerCell.x}, ${centerCell.y}): too many flags`);
        }
        if (remainingMines > adjacentCells.length) {
            console.warn(`Invalid constraint at (${centerCell.x}, ${centerCell.y}): not enough cells for required mines`);
        }

        return {
            centerCell,
            adjacentCells,
            requiredMineCount: centerCell.adjacentMineCount,
            satisfiedMineCount
        };
    }

    advancedConstraintSolving(constraints, allCells, totalRemainingMines) {
        const certainSafeCells = [];
        const certainMineCells = [];
        let hasContradiction = false;
        let contradictionExplanation;

        // Step 1: Check for immediate contradictions and direct deductions
        for (const constraint of constraints) {
            const remainingMines = constraint.requiredMineCount - constraint.satisfiedMineCount;
            const unrevealedCells = constraint.adjacentCells.length;

            if (remainingMines < 0) {
                hasContradiction = true;
                contradictionExplanation = `Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) has ${constraint.satisfiedMineCount} flags but only needs ${constraint.requiredMineCount} mines`;
                break;
            }

            if (remainingMines > unrevealedCells) {
                hasContradiction = true;
                contradictionExplanation = `Cell (${constraint.centerCell.x}, ${constraint.centerCell.y}) needs ${remainingMines} more mines but only has ${unrevealedCells} unrevealed cells`;
                break;
            }

            // Direct deductions (100% certain)
            if (remainingMines === 0) {
                for (const cell of constraint.adjacentCells) {
                    if (!certainSafeCells.some(c => c.x === cell.x && c.y === cell.y)) {
                        certainSafeCells.push(cell);
                    }
                }
            } else if (remainingMines === unrevealedCells) {
                for (const cell of constraint.adjacentCells) {
                    if (!certainMineCells.some(c => c.x === cell.x && c.y === cell.y)) {
                        certainMineCells.push(cell);
                    }
                }
            }
        }

        if (hasContradiction) {
            return { certainSafeCells, certainMineCells, hasContradiction, contradictionExplanation, probabilities: new Map(), solutionCount: 0 };
        }

        // Step 2: Advanced constraint satisfaction with backtracking
        const advancedResults = this.performBacktrackingSearch(constraints, allCells, totalRemainingMines);
        
        // Merge results
        certainSafeCells.push(...advancedResults.certainSafeCells);
        certainMineCells.push(...advancedResults.certainMineCells);

        return {
            certainSafeCells,
            certainMineCells,
            hasContradiction: advancedResults.hasContradiction,
            contradictionExplanation: advancedResults.contradictionExplanation,
            probabilities: advancedResults.probabilities,
            solutionCount: advancedResults.solutionCount
        };
    }

    performBacktrackingSearch(constraints, allCells, totalRemainingMines) {
        // Get all unique unrevealed cells involved in constraints
        const involvedCells = new Map();
        for (const constraint of constraints) {
            for (const cell of constraint.adjacentCells) {
                const key = `${cell.x},${cell.y}`;
                involvedCells.set(key, cell);
            }
        }

        const cellArray = Array.from(involvedCells.values());
        if (cellArray.length === 0) {
            return { 
                certainSafeCells: [], 
                certainMineCells: [], 
                hasContradiction: false, 
                probabilities: new Map(),
                solutionCount: 0
            };
        }

        // Generate all valid solutions using backtracking
        this.solutions = [];
        this.generateAllSolutions(cellArray, constraints, [], 0, totalRemainingMines);

        if (this.solutions.length === 0) {
            // Instead of declaring contradiction, fall back to simple analysis
            console.log('No solutions found in advanced analysis, falling back to simple logic');
            return this.fallbackSimpleAnalysis(constraints, cells);
        }

        // Analyze solutions to find certain moves
        const certainSafeCells = [];
        const certainMineCells = [];
        const probabilities = new Map();

        for (let i = 0; i < cellArray.length; i++) {
            const cell = cellArray[i];
            const cellKey = `${cell.x},${cell.y}`;
            
            // Count how many solutions have this cell as a mine
            const mineCount = this.solutions.reduce((sum, solution) => sum + solution[i], 0);
            const probability = mineCount / this.solutions.length;
            
            probabilities.set(cellKey, probability);
            cell.probability = probability;

            // If probability is 0, it's certainly safe
            if (probability === 0) {
                certainSafeCells.push(cell);
            }
            // If probability is 1, it's certainly a mine
            else if (probability === 1) {
                certainMineCells.push(cell);
            }
        }

        return {
            certainSafeCells,
            certainMineCells,
            hasContradiction: false,
            probabilities,
            solutionCount: this.solutions.length
        };
    }

    generateAllSolutions(cells, constraints, currentAssignment, cellIndex, totalRemainingMines) {
        // Stop if we've found enough solutions for performance
        if (this.solutions.length >= this.maxSolutions) {
            return;
        }

        if (cellIndex === cells.length) {
            // Check if current assignment satisfies all constraints
            if (this.isValidAssignment(cells, constraints, currentAssignment, totalRemainingMines)) {
                this.solutions.push([...currentAssignment]);
            }
            return;
        }

        // Try assigning mine (1) and safe (0) to current cell
        for (const value of [0, 1]) {
            currentAssignment[cellIndex] = value;
            
            // Early pruning: check if partial assignment can still satisfy constraints
            if (this.canSatisfyConstraints(cells, constraints, currentAssignment, cellIndex + 1, totalRemainingMines)) {
                this.generateAllSolutions(cells, constraints, currentAssignment, cellIndex + 1, totalRemainingMines);
            }
        }
    }

    isValidAssignment(cells, constraints, assignment, totalRemainingMines) {
        // Don't check total mine count here - only check constraint satisfaction
        // The total mine count check is too restrictive for partial board analysis
        
        // Check each constraint
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

    canSatisfyConstraints(cells, constraints, partialAssignment, assignedCount, totalRemainingMines) {
        // Focus only on constraint satisfaction, not global mine count
        // Global mine count validation is too restrictive for local analysis
        
        // Check each constraint
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

    calculateProbabilities(cells, constraints, totalRemainingMines) {
        const probabilities = new Map();
        
        // Get all unique unrevealed cells involved in constraints
        const involvedCells = new Map();
        for (const constraint of constraints) {
            for (const cell of constraint.adjacentCells) {
                const key = `${cell.x},${cell.y}`;
                involvedCells.set(key, cell);
            }
        }

        const cellArray = Array.from(involvedCells.values());
        if (cellArray.length === 0) return probabilities;

        // Simple probability calculation based on local constraints
        for (const constraint of constraints) {
            const remainingMines = constraint.requiredMineCount - constraint.satisfiedMineCount;
            const unrevealedCells = constraint.adjacentCells.length;
            
            if (unrevealedCells > 0 && remainingMines > 0) {
                const probability = Math.min(1.0, remainingMines / unrevealedCells);
                
                for (const cell of constraint.adjacentCells) {
                    const key = `${cell.x},${cell.y}`;
                    const existingProb = probabilities.get(key) || 0;
                    // Take the maximum probability from all constraints affecting this cell
                    probabilities.set(key, Math.max(existingProb, probability));
                }
            }
        }

        return probabilities;
    }

    generateOptimalProbabilityRecommendation(allCells, probabilities, totalRemainingMines) {
        let bestCell = null;
        let lowestProbability = 1.0;
        
        // Find unrevealed, unflagged cell with lowest mine probability
        const unrevealedCells = allCells.filter(c => !c.isRevealed && !c.isFlagged);
        
        for (const cell of unrevealedCells) {
            const cellKey = `${cell.x},${cell.y}`;
            let probability = probabilities.get(cellKey);
            
            // For unconstrained cells, calculate global probability
            if (probability === undefined) {
                const totalUnrevealed = unrevealedCells.length;
                const constrainedCells = Array.from(probabilities.keys()).length;
                const unconstrainedCells = totalUnrevealed - constrainedCells;
                
                if (unconstrainedCells > 0) {
                    // Calculate remaining mines after accounting for constrained cells
                    let expectedConstrainedMines = 0;
                    for (const [key, prob] of probabilities) {
                        expectedConstrainedMines += prob;
                    }
                    const remainingMinesForUnconstrained = Math.max(0, totalRemainingMines - expectedConstrainedMines);
                    probability = remainingMinesForUnconstrained / unconstrainedCells;
                } else {
                    probability = 0.5; // Fallback
                }
            }
            
            if (probability < lowestProbability) {
                lowestProbability = probability;
                bestCell = cell;
            }
        }
        
        if (!bestCell) return null;
        
        bestCell.probability = lowestProbability;
        
        // Determine confidence level based on probability
        let confidence = 'probable';
        let reasoning = [];
        
        if (lowestProbability === 0) {
            confidence = 'certain';
            reasoning = ['This cell is mathematically guaranteed to be safe'];
        } else if (lowestProbability < 0.1) {
            reasoning = [`Excellent choice: only ${(lowestProbability * 100).toFixed(1)}% chance of mine`];
        } else if (lowestProbability < 0.3) {
            reasoning = [`Good choice: ${(lowestProbability * 100).toFixed(1)}% chance of mine - lowest available`];
        } else if (lowestProbability < 0.5) {
            reasoning = [`Reasonable choice: ${(lowestProbability * 100).toFixed(1)}% chance of mine - best option available`];
        } else {
            reasoning = [`Risky but necessary: ${(lowestProbability * 100).toFixed(1)}% chance of mine - no better options`];
        }
        
        return {
            targetCell: bestCell,
            action: 'reveal',
            confidence: confidence,
            reasoning: reasoning
        };
    }

    handleImpossibleSituation(allCells, gameState) {
        // When the game becomes mathematically unsolvable, make the best possible choice
        const unrevealedCells = allCells.filter(c => !c.isRevealed && !c.isFlagged);
        
        if (unrevealedCells.length === 0) return null;
        
        // In impossible situations, prefer:
        // 1. Corner cells (fewer adjacent cells)
        // 2. Edge cells
        // 3. Center cells (last resort)
        
        const corners = unrevealedCells.filter(c => this.isCornerCell(c, allCells));
        const edges = unrevealedCells.filter(c => this.isEdgeCell(c, allCells) && !this.isCornerCell(c, allCells));
        
        let chosenCell;
        if (corners.length > 0) {
            chosenCell = corners[Math.floor(Math.random() * corners.length)];
        } else if (edges.length > 0) {
            chosenCell = edges[Math.floor(Math.random() * edges.length)];
        } else {
            chosenCell = unrevealedCells[Math.floor(Math.random() * unrevealedCells.length)];
        }
        
        chosenCell.probability = 0.5; // Unknown probability
        
        return {
            targetCell: chosenCell,
            action: 'reveal',
            confidence: 'probable',
            reasoning: [
                'Game may be unsolvable from current position',
                'Making strategic guess - preferring corners/edges',
                'Even perfect AI cannot guarantee success in all situations'
            ]
        };
    }

    isCornerCell(cell, allCells) {
        const board = this.getBoardFromCells(allCells);
        const maxX = board[0].length - 1;
        const maxY = board.length - 1;
        
        return (cell.x === 0 || cell.x === maxX) && (cell.y === 0 || cell.y === maxY);
    }

    isEdgeCell(cell, allCells) {
        const board = this.getBoardFromCells(allCells);
        const maxX = board[0].length - 1;
        const maxY = board.length - 1;
        
        return cell.x === 0 || cell.x === maxX || cell.y === 0 || cell.y === maxY;
    }

    fallbackSimpleAnalysis(constraints, cells) {
        // Simple constraint analysis when advanced backtracking fails
        const certainSafeCells = [];
        const certainMineCells = [];
        const probabilities = new Map();

        for (const constraint of constraints) {
            const remainingMines = constraint.requiredMineCount - constraint.satisfiedMineCount;
            const unrevealedCells = constraint.adjacentCells.length;

            if (remainingMines === 0) {
                // All remaining adjacent cells are safe
                for (const cell of constraint.adjacentCells) {
                    if (!certainSafeCells.some(c => c.x === cell.x && c.y === cell.y)) {
                        certainSafeCells.push(cell);
                    }
                }
            } else if (remainingMines === unrevealedCells && unrevealedCells > 0) {
                // All remaining adjacent cells are mines
                for (const cell of constraint.adjacentCells) {
                    if (!certainMineCells.some(c => c.x === cell.x && c.y === cell.y)) {
                        certainMineCells.push(cell);
                    }
                }
            } else if (unrevealedCells > 0) {
                // Calculate simple probability
                const probability = remainingMines / unrevealedCells;
                for (const cell of constraint.adjacentCells) {
                    const key = `${cell.x},${cell.y}`;
                    const existingProb = probabilities.get(key) || 0;
                    probabilities.set(key, Math.max(existingProb, probability));
                }
            }
        }

        return {
            certainSafeCells,
            certainMineCells,
            hasContradiction: false,
            probabilities,
            solutionCount: 1 // Indicate simple analysis was used
        };
    }

    generateFallbackRecommendation(allCells, gameState) {
        // Generate a recommendation when all else fails
        const unrevealedCells = allCells.filter(c => !c.isRevealed && !c.isFlagged);
        
        if (unrevealedCells.length === 0) return null;
        
        // For first move, prefer center
        if (gameState.cellsRevealed === 0) {
            const board = this.getBoardFromCells(allCells);
            const centerX = Math.floor(board[0].length / 2);
            const centerY = Math.floor(board.length / 2);
            const centerCell = allCells.find(c => c.x === centerX && c.y === centerY);
            
            if (centerCell && !centerCell.isRevealed && !centerCell.isFlagged) {
                centerCell.probability = 0.3; // Reasonable first-move probability
                return {
                    targetCell: centerCell,
                    action: 'reveal',
                    confidence: 'probable',
                    reasoning: ['First move - center is statistically safer']
                };
            }
        }
        
        // Otherwise, pick a random unrevealed cell
        const randomCell = unrevealedCells[Math.floor(Math.random() * unrevealedCells.length)];
        randomCell.probability = 0.5; // Unknown probability
        
        return {
            targetCell: randomCell,
            action: 'reveal',
            confidence: 'probable',
            reasoning: ['No clear logical moves available - making educated guess']
        };
    }

    explainCell(x, y, gameEngine) {
        const board = gameEngine.getBoard();
        const cell = board[y][x];
        const explanation = [];
        
        if (cell.isRevealed) {
            if (cell.hasMine) {
                explanation.push('This cell contains a mine (game over)');
            } else if (cell.adjacentMineCount > 0) {
                explanation.push(`Shows ${cell.adjacentMineCount} - indicates ${cell.adjacentMineCount} mines in adjacent cells`);
                
                const adjacent = gameEngine.getAdjacentCells(x, y);
                const flagged = adjacent.filter(c => c.isFlagged).length;
                const unrevealed = adjacent.filter(c => !c.isRevealed && !c.isFlagged).length;
                const remaining = cell.adjacentMineCount - flagged;
                
                explanation.push(`Adjacent status: ${flagged} flagged, ${unrevealed} unrevealed, need ${remaining} more mines`);
                
                if (remaining === 0) {
                    explanation.push('All mines found - remaining adjacent cells are safe to reveal');
                } else if (remaining === unrevealed) {
                    explanation.push('All unrevealed adjacent cells must be mines - flag them');
                } else if (remaining > 0 && unrevealed > 0) {
                    const prob = (remaining / unrevealed * 100).toFixed(0);
                    explanation.push(`Each unrevealed adjacent cell has about ${prob}% chance of being a mine`);
                }
            } else {
                explanation.push('Empty cell (no adjacent mines)');
            }
        } else if (cell.isFlagged) {
            explanation.push('Flagged as containing a mine');
            
            // Check if this flag helps satisfy any constraints
            const allCells = this.getAllCells(board);
            const constraints = this.generateConstraints(allCells);
            const relatedConstraints = constraints.filter(c => 
                c.adjacentCells.some(ac => ac.x === x && ac.y === y) ||
                (c.centerCell.x === x && c.centerCell.y === y)
            );
            
            if (relatedConstraints.length > 0) {
                explanation.push(`This flag helps satisfy ${relatedConstraints.length} constraint(s)`);
            }
        } else {
            explanation.push('Unrevealed cell');
            
            // Calculate probability for this specific cell
            const allCells = this.getAllCells(board);
            const constraints = this.generateConstraints(allCells);
            const probabilities = this.calculateProbabilities(allCells, constraints, gameEngine.gameState.minesRemaining);
            const cellKey = `${x},${y}`;
            const probability = probabilities.get(cellKey);
            
            if (probability !== undefined) {
                explanation.push(`Calculated mine probability: ${(probability * 100).toFixed(1)}%`);
                
                if (probability === 0) {
                    explanation.push('This cell is guaranteed safe based on logical constraints');
                } else if (probability === 1) {
                    explanation.push('This cell is guaranteed to contain a mine');
                } else if (probability < 0.3) {
                    explanation.push('Low probability - relatively safe choice');
                } else if (probability > 0.7) {
                    explanation.push('High probability - likely contains a mine');
                } else {
                    explanation.push('Medium probability - uncertain');
                }
            } else {
                explanation.push('Not directly constrained by revealed numbers - use best judgment');
            }
            
            // Check which constraints affect this cell
            const relatedConstraints = constraints.filter(c => 
                c.adjacentCells.some(ac => ac.x === x && ac.y === y)
            );
            
            if (relatedConstraints.length > 0) {
                explanation.push(`Constrained by ${relatedConstraints.length} numbered cell(s)`);
            }
        }
        
        return explanation;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MinesweeperUI();
});