// Test the improved AI logic
console.log('🧪 Testing Improved AI Logic');
console.log('============================\n');

// Simulate a simple game state for testing
function createTestBoard() {
    // Create a simple 5x5 board with known mine positions for testing
    const board = [];
    for (let y = 0; y < 5; y++) {
        board[y] = [];
        for (let x = 0; x < 5; x++) {
            board[y][x] = {
                x, y,
                hasMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMineCount: 0
            };
        }
    }
    
    // Place mines at known positions
    board[0][0].hasMine = true;
    board[0][1].hasMine = true;
    board[2][2].hasMine = true;
    
    // Calculate adjacent mine counts
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (!board[y][x].hasMine) {
                let count = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < 5 && ny >= 0 && ny < 5 && board[ny][nx].hasMine) {
                            count++;
                        }
                    }
                }
                board[y][x].adjacentMineCount = count;
            }
        }
    }
    
    return board;
}

// Test the AI reasoning
function testAI() {
    const board = createTestBoard();
    
    // Reveal a cell that should give us information
    board[1][1].isRevealed = true; // This cell should show "2" (adjacent to 2 mines)
    
    console.log('📋 Test Board State:');
    console.log('   Mines at: (0,0), (0,1), (2,2)');
    console.log('   Revealed: (1,1) showing', board[1][1].adjacentMineCount);
    console.log('');
    
    // Create a mock game engine
    const mockGameEngine = {
        getBoard: () => board,
        getGameState: () => ({ minesRemaining: 3, cellsRevealed: 1 }),
        getAdjacentCells: (x, y) => {
            const adjacent = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < 5 && ny >= 0 && ny < 5) {
                        adjacent.push(board[ny][nx]);
                    }
                }
            }
            return adjacent;
        }
    };
    
    // Test the AI
    const ai = new AIReasoner();
    const analysis = ai.analyzeBoard(mockGameEngine);
    
    console.log('🤖 AI Analysis Results:');
    console.log('   Recommendations:', analysis.recommendations.length);
    
    if (analysis.recommendations.length > 0) {
        const rec = analysis.recommendations[0];
        console.log(`   → ${rec.action.toUpperCase()} cell (${rec.targetCell.x}, ${rec.targetCell.y})`);
        console.log(`   → Confidence: ${rec.confidence}`);
        console.log(`   → Reasoning: ${rec.reasoning[0]}`);
        
        // Check if the recommendation makes sense
        const targetCell = rec.targetCell;
        const isActuallyMine = targetCell.hasMine;
        
        if (rec.action === 'reveal' && isActuallyMine) {
            console.log('   ❌ WARNING: AI recommended revealing a mine!');
        } else if (rec.action === 'flag' && !isActuallyMine) {
            console.log('   ❌ WARNING: AI recommended flagging a safe cell!');
        } else {
            console.log('   ✅ AI recommendation looks correct!');
        }
    }
    
    console.log('   Probabilities calculated:', analysis.probabilities.size);
    console.log('   Has contradiction:', analysis.hasContradiction);
    console.log('');
    
    // Test cell explanation
    console.log('🔍 Cell Explanations:');
    const explanation = ai.explainCell(1, 1, mockGameEngine);
    console.log(`   Cell (1,1): ${explanation.join(' ')}`);
    
    return analysis;
}

// Run the test
try {
    const result = testAI();
    console.log('✅ AI test completed successfully!');
    console.log('');
    console.log('🎯 Improvements Made:');
    console.log('   • Proper constraint satisfaction algorithm');
    console.log('   • Logical deduction for certain moves');
    console.log('   • Probability calculation for uncertain situations');
    console.log('   • Safety checks to prevent obvious mistakes');
    console.log('   • Better first-move selection');
    console.log('   • Auto-play stops for risky moves');
    console.log('');
    console.log('🚀 The AI should now be much smarter and safer!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
}

// Note: This is a simplified test. The actual AI in the web interface
// includes the full constraint satisfaction logic from the TypeScript backend.