# 🤖 AI Minesweeper

A sophisticated AI-powered Minesweeper game with explainable reasoning, constraint satisfaction algorithms, and responsive web interface that works on any device.

![AI Minesweeper Demo](https://img.shields.io/badge/AI-Powered-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![Responsive](https://img.shields.io/badge/Responsive-Mobile%20Ready-green) ![PWA](https://img.shields.io/badge/PWA-Installable-purple)

## ✨ Features

### 🧠 Advanced AI Intelligence
- **Constraint Satisfaction Algorithm**: Uses mathematical constraint solving with backtracking
- **100% Logical Accuracy**: AI makes only mathematically proven moves when possible
- **Explainable Reasoning**: Step-by-step explanations in simple language
- **Auto-Play Mode**: Watch the AI demonstrate perfect Minesweeper strategies
- **Risk Assessment**: Precise probability calculations for uncertain situations

### 🎮 Complete Game Experience
- **Multiple Difficulties**: Tutorial (6×6), Beginner (9×9), Intermediate (16×16), Expert (30×16)
- **Classic Gameplay**: Traditional Minesweeper rules with modern enhancements
- **Smart First Moves**: AI prefers statistically safer starting positions
- **Contradiction Detection**: Identifies impossible board states and flag errors

### 📱 Cross-Platform Design
- **Responsive Web Interface**: Works perfectly on desktop, tablet, and mobile
- **Progressive Web App**: Install as native app on mobile devices
- **Touch Optimized**: Large touch targets and gesture support
- **Offline Ready**: Core functionality works without internet

### 🎯 Beginner Friendly
- **Tutorial Mode**: Tiny 6×6 grid with only 3 mines for learning
- **Simple AI Language**: "I'm 100% sure: Click cell (3,4)" instead of complex jargon
- **Auto-Play Learning**: Watch AI play to learn advanced strategies
- **Cell Analysis**: Click any cell for detailed, easy-to-understand explanations

## 🚀 Quick Start

### Web Interface (Recommended)
```bash
# Clone the repository
git clone https://github.com/MrStark65/ai-minesweeper.git
cd ai-minesweeper

# Install dependencies
npm install

# Start the web server
npm run web
```

Then open **http://localhost:3000** in any browser!

### Development Setup
```bash
# Install dependencies
npm install

# Build TypeScript backend
npm run build

# Run tests
npm test

# Development mode with watch
npm run dev
```

## 🎮 How to Play

### For Beginners
1. **Start with Tutorial**: Select "Tutorial" difficulty (6×6 grid, 3 mines)
2. **Watch AI Play**: Click "▶️ Auto Play" to see perfect strategies
3. **Learn from AI**: Click any cell to get simple explanations
4. **Get Help**: Click "🤖 AI Help" when stuck

### For Advanced Players
1. **Choose Difficulty**: Beginner → Intermediate → Expert
2. **Use AI Assistance**: Get mathematically optimal recommendations
3. **Understand Reasoning**: See step-by-step logical deductions
4. **Challenge Yourself**: Try to match the AI's accuracy

### Controls
- **Desktop**: Left-click to reveal, right-click to flag
- **Mobile**: Tap to reveal, long-press to flag, or use mode toggle
- **Auto-Play**: Watch AI play with adjustable speed (slow to very fast)

## 🧠 AI Technology

### Constraint Satisfaction Algorithm
```typescript
// Each numbered cell becomes a mathematical constraint
const constraint = {
    centerCell: numberedCell,
    adjacentCells: unrevealedAdjacent,
    requiredMineCount: numberedCell.adjacentMineCount,
    satisfiedMineCount: flaggedCount
};

// Backtracking search finds ALL valid mine configurations
const solutions = generateAllValidSolutions(constraints);

// Cells with 0% probability = guaranteed safe
// Cells with 100% probability = guaranteed mines
```

### Accuracy Levels
- **💯 100% Sure**: Mathematical proof (AI auto-plays these)
- **✅ Very Safe**: <10% mine probability
- **🎯 Good Choice**: <30% mine probability  
- **⚠️ Risky**: >30% mine probability
- **🛑 Too Dangerous**: >50% mine probability (AI stops auto-play)

### Expected Win Rates
- **Tutorial**: ~95% (tiny board, clear patterns)
- **Beginner**: ~85% (good logical coverage)
- **Intermediate**: ~70% (some guessing required)
- **Expert**: ~40% (many uncertain situations)

*Note: Even perfect AI cannot win 100% of Minesweeper games due to situations requiring guessing*

## 📁 Project Structure

```
ai-minesweeper/
├── public/                 # Web interface
│   ├── index.html         # Main game page
│   ├── styles.css         # Responsive CSS
│   ├── game.js           # Game logic & AI
│   └── manifest.json     # PWA configuration
├── src/                   # TypeScript backend
│   ├── types/            # Type definitions
│   ├── game/             # Game engine
│   ├── ai/               # AI reasoning
│   └── __tests__/        # Property-based tests
├── .kiro/                # Kiro IDE specifications
│   └── specs/            # Design documents
└── docs/                 # Documentation
```

## 🧪 Testing

The project includes comprehensive property-based testing using **fast-check**:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:watch

# View test coverage
npm run test -- --coverage
```

### Test Coverage
- **22 Property-Based Tests**: Verify correctness across 100+ random scenarios each
- **Game Mechanics**: Mine placement, cell revelation, cascade logic, victory conditions
- **AI Reasoning**: Logical deduction accuracy, probability calculations, recommendation quality
- **Error Handling**: Configuration validation, contradiction detection, edge cases

## 🎯 API Reference

### Game Engine
```typescript
const game = new GameEngine('beginner');
game.revealCell(x, y);           // Reveal a cell
game.toggleFlag(x, y);           // Flag/unflag a cell
game.getGameState();             // Get current state
```

### AI Reasoner
```typescript
const ai = new AIReasoner();
const analysis = ai.analyzeBoard(gameEngine);
// Returns: recommendations, reasoning, probabilities, contradictions
```

### Web Interface
```javascript
const ui = new MinesweeperUI();
ui.getAIHelp();                  // Get AI recommendation
ui.toggleAutoPlay();             // Start/stop auto-play
ui.explainCell(x, y);           // Get cell explanation
```

## 🛠️ Development

### Available Scripts
```bash
npm run web          # Start web server
npm run build        # Build TypeScript
npm run dev          # Development mode
npm test             # Run tests
npm run demo         # Console demo
npm run auto-demo    # Auto-play features demo
npm run perfect-demo # Perfect AI demo
npm run test-fixes   # Test AI fixes
```

### Adding New Features
1. **Game Logic**: Extend `src/game/BoardState.ts`
2. **AI Reasoning**: Enhance `src/ai/AIReasoner.ts`
3. **Web Interface**: Modify `public/game.js`
4. **Styling**: Update `public/styles.css`
5. **Tests**: Add property-based tests in `src/__tests__/`

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Add tests**: Ensure new features have property-based tests
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Development Guidelines
- **TypeScript**: Use strict typing for backend code
- **Property-Based Testing**: Add tests for new game mechanics
- **Responsive Design**: Ensure mobile compatibility
- **AI Explainability**: Keep explanations simple and clear

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Constraint Satisfaction**: Inspired by academic research in CSP algorithms
- **Minesweeper Theory**: Based on mathematical analysis of optimal play
- **Property-Based Testing**: Uses fast-check library for comprehensive validation
- **Responsive Design**: Modern CSS Grid and Flexbox techniques

## 🎯 Live Demo

Try the live demo: **[AI Minesweeper](https://mrstark65.github.io/ai-minesweeper/)**

Or run locally:
```bash
git clone https://github.com/MrStark65/ai-minesweeper.git
cd ai-minesweeper
npm install && npm run web
```

---

**Built with ❤️ and advanced AI algorithms**

*Perfect for learning Minesweeper strategies, demonstrating AI capabilities, or just enjoying a classic game with intelligent assistance!*