const { createGame } = require('./dist/index.js');

console.log('🎮 AI Minesweeper Demo');
console.log('=====================\n');

// Create a beginner game
const game = createGame('beginner');
console.log('✅ Created beginner game (9x9 grid, 10 mines)\n');

// Show initial state
const initialState = game.getState();
console.log(`📊 Initial state: ${initialState.minesRemaining} mines remaining`);
console.log(`🎯 Need to reveal ${initialState.totalSafeCells} safe cells to win\n`);

// Make a move in the center
console.log('🎲 Making first move at center (4,4)...');
const analysis1 = game.makeMove(4, 4);

if (analysis1.hasContradiction) {
    console.log('❌ Contradiction detected!');
} else {
    console.log(`🤖 AI Analysis: Found ${analysis1.recommendations.length} recommendations`);
    
    if (analysis1.recommendations.length > 0) {
        const rec = analysis1.recommendations[0];
        console.log(`💡 AI suggests: ${rec.action.toUpperCase()} cell (${rec.targetCell.x}, ${rec.targetCell.y})`);
        console.log(`🎯 Confidence: ${rec.confidence}`);
        console.log(`💭 Reasoning: ${rec.reasoning[0]}\n`);
        
        // Follow AI recommendation
        console.log('🤖 Following AI recommendation...');
        const analysis2 = game.makeMove(rec.targetCell.x, rec.targetCell.y, rec.action);
        console.log(`📈 After AI move: ${analysis2.recommendations.length} new recommendations`);
    }
}

// Show current game state
const currentState = game.getState();
console.log(`\n📊 Current state: ${currentState.cellsRevealed}/${currentState.totalSafeCells} safe cells revealed`);
console.log(`⛳ Game status: ${currentState.gameStatus.toUpperCase()}`);

// Get explanation for a specific cell
console.log('\n🔍 Explaining cell (0,0):');
const explanation = game.explainCell(0, 0);
explanation.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
});

// Get guidance
console.log('\n🧭 AI Guidance:');
const guidance = game.getGuidance();
guidance.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
});

console.log('\n✨ Demo complete! The AI Minesweeper system is working with:');
console.log('   • Constraint satisfaction algorithms');
console.log('   • Probability calculations');
console.log('   • Explainable reasoning');
console.log('   • Property-based testing');