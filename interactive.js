const { createGame } = require('./dist/index.js');

function displayBoard(game) {
    const state = game.getState();
    const board = state.board;
    
    console.log('\n   ' + Array.from({length: board[0].length}, (_, i) => i).join(' '));
    console.log('  ┌' + '─'.repeat(board[0].length * 2 - 1) + '┐');
    
    for (let y = 0; y < board.length; y++) {
        let row = y + ' │';
        for (let x = 0; x < board[y].length; x++) {
            const cell = board[y][x];
            let symbol = '·';
            
            if (cell.isFlagged) {
                symbol = '🚩';
            } else if (cell.isRevealed) {
                if (cell.hasMine) {
                    symbol = '💣';
                } else if (cell.adjacentMineCount > 0) {
                    symbol = cell.adjacentMineCount.toString();
                } else {
                    symbol = ' ';
                }
            }
            
            row += symbol + ' ';
        }
        row = row.slice(0, -1) + '│';
        console.log(row);
    }
    
    console.log('  └' + '─'.repeat(board[0].length * 2 - 1) + '┘');
    console.log(`Mines: ${state.minesRemaining} | Revealed: ${state.cellsRevealed}/${state.totalSafeCells} | Status: ${state.gameStatus.toUpperCase()}`);
}

function playGame() {
    console.log('🎮 Interactive AI Minesweeper');
    console.log('=============================');
    console.log('Commands: reveal x y, flag x y, ai, explain x y, help, quit\n');
    
    const game = createGame('beginner');
    displayBoard(game);
    
    // Simulate some commands for demo
    const commands = [
        'reveal 4 4',
        'ai',
        'reveal 3 3',
        'ai',
        'explain 0 0'
    ];
    
    console.log('\n🤖 Running demo commands...\n');
    
    for (const command of commands) {
        console.log(`> ${command}`);
        const parts = command.split(' ');
        const cmd = parts[0];
        
        switch (cmd) {
            case 'reveal':
                const x = parseInt(parts[1]);
                const y = parseInt(parts[2]);
                const analysis = game.makeMove(x, y, 'reveal');
                displayBoard(game);
                
                if (analysis.recommendations.length > 0) {
                    console.log(`💡 AI found ${analysis.recommendations.length} recommendations`);
                }
                break;
                
            case 'flag':
                const fx = parseInt(parts[1]);
                const fy = parseInt(parts[2]);
                game.makeMove(fx, fy, 'flag');
                displayBoard(game);
                break;
                
            case 'ai':
                const rec = game.getRecommendation();
                if (rec) {
                    console.log(`🤖 AI recommends: ${rec.action.toUpperCase()} (${rec.targetCell.x}, ${rec.targetCell.y})`);
                    console.log(`   Confidence: ${rec.confidence}`);
                    console.log(`   Reasoning: ${rec.reasoning[0]}`);
                } else {
                    console.log('🤖 No specific recommendations available');
                }
                break;
                
            case 'explain':
                const ex = parseInt(parts[1]);
                const ey = parseInt(parts[2]);
                const explanation = game.explainCell(ex, ey);
                console.log(`🔍 Cell (${ex}, ${ey}) explanation:`);
                explanation.forEach((step, i) => {
                    console.log(`   ${i + 1}. ${step}`);
                });
                break;
        }
        console.log();
    }
    
    console.log('✨ Demo complete! The AI system provides:');
    console.log('   • Logical deduction through constraint satisfaction');
    console.log('   • Probability-based recommendations when logic isn\'t enough');
    console.log('   • Step-by-step explanations of reasoning');
    console.log('   • Cell-specific analysis and guidance');
}

playGame();