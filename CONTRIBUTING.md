# Contributing to AI Minesweeper

Thank you for your interest in contributing to AI Minesweeper! This document provides guidelines and information for contributors.

## 🎯 Project Overview

AI Minesweeper is a sophisticated implementation combining:
- **Advanced AI**: Constraint satisfaction algorithms with explainable reasoning
- **Cross-Platform Web Interface**: Responsive design for all devices
- **Educational Focus**: Beginner-friendly with learning features
- **Property-Based Testing**: Comprehensive correctness validation

## 🚀 Getting Started

### Development Setup
```bash
# Clone and setup
git clone https://github.com/yourusername/ai-minesweeper.git
cd ai-minesweeper
npm install

# Start development
npm run dev          # TypeScript watch mode
npm run web          # Web server for testing
npm test             # Run test suite
```

### Project Structure
```
├── src/                 # TypeScript backend (game engine & AI)
├── public/             # Web interface (HTML/CSS/JS)
├── .kiro/specs/        # Design specifications
└── docs/               # Documentation
```

## 🧪 Testing Requirements

All contributions must include appropriate tests:

### Property-Based Testing
We use **fast-check** for comprehensive validation:
```typescript
// Example property test
test('Property X: Description', () => {
    fc.assert(fc.property(
        fc.record({ /* generators */ }),
        (input) => {
            // Test logic
            expect(result).toSatisfy(property);
        }
    ), { numRuns: 100 });
});
```

### Test Categories
- **Game Mechanics**: Mine placement, cell revelation, victory conditions
- **AI Reasoning**: Logical deduction, probability calculations, recommendations
- **Error Handling**: Invalid inputs, edge cases, contradictions
- **UI Behavior**: Responsive design, interaction handling

## 🎮 Contribution Areas

### 1. AI Improvements
**Location**: `src/ai/`
- Enhanced constraint satisfaction algorithms
- Better probability calculations
- New pattern recognition techniques
- Performance optimizations

**Requirements**:
- Maintain explainable reasoning
- Add property-based tests
- Preserve accuracy guarantees

### 2. Game Features
**Location**: `src/game/`
- New difficulty levels
- Game variants (hexagonal, 3D, etc.)
- Statistics tracking
- Replay functionality

**Requirements**:
- Follow existing interfaces
- Maintain backward compatibility
- Add comprehensive tests

### 3. Web Interface
**Location**: `public/`
- UI/UX improvements
- Mobile optimizations
- Accessibility enhancements
- New visual themes

**Requirements**:
- Maintain responsive design
- Test on multiple devices
- Follow accessibility guidelines

### 4. Documentation
**Location**: `docs/`, `README.md`
- API documentation
- Tutorial content
- Algorithm explanations
- Usage examples

## 📝 Code Style Guidelines

### TypeScript (Backend)
```typescript
// Use strict typing
interface GameConfiguration {
    width: number;
    height: number;
    mineCount: number;
    difficulty: 'beginner' | 'intermediate' | 'expert';
}

// Descriptive function names
public analyzeBoard(boardState: BoardState): AnalysisResult {
    // Implementation
}

// Comprehensive error handling
if (config.mineCount >= config.width * config.height) {
    throw new GameError('Mine count exceeds available cells', 'INVALID_CONFIG');
}
```

### JavaScript (Frontend)
```javascript
// Clear, descriptive methods
displaySimpleAIAnalysis(analysis) {
    // Simple, user-friendly language
    const confidence = rec.confidence === 'certain' ? '💯 100% Sure' : '🎯 Good Choice';
}

// Responsive design considerations
@media (max-width: 768px) {
    .game-board { /* Mobile optimizations */ }
}
```

### CSS
```css
/* Use CSS custom properties */
:root {
    --primary-color: #2563eb;
    --success-color: #059669;
}

/* Mobile-first responsive design */
.game-board {
    display: grid;
    gap: 2px;
}

@media (min-width: 768px) {
    .game-board { /* Desktop enhancements */ }
}
```

## 🔄 Pull Request Process

### 1. Preparation
- Fork the repository
- Create feature branch: `git checkout -b feature/description`
- Make changes following style guidelines
- Add/update tests as needed
- Update documentation

### 2. Testing
```bash
# Ensure all tests pass
npm test

# Check TypeScript compilation
npm run build

# Test web interface
npm run web
```

### 3. Submission
- Commit with descriptive messages
- Push to your fork
- Open Pull Request with:
  - Clear description of changes
  - Screenshots for UI changes
  - Test results
  - Breaking change notes (if any)

### 4. Review Process
- Automated tests must pass
- Code review by maintainers
- Address feedback promptly
- Squash commits if requested

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Test with latest version
- Reproduce consistently

### Report Template
```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- Browser: [e.g. Chrome 91]
- Device: [e.g. iPhone 12]
- Version: [e.g. 1.0.0]
```

## 💡 Feature Requests

### Proposal Template
```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Implementation Ideas**
Suggestions for how it could work

**Alternatives Considered**
Other approaches you've thought about
```

## 🎯 AI Algorithm Guidelines

### Constraint Satisfaction
- Maintain mathematical correctness
- Provide explainable reasoning
- Handle edge cases gracefully
- Optimize for performance

### Probability Calculations
- Use precise mathematical methods
- Validate against known solutions
- Handle uncertainty appropriately
- Communicate confidence levels

### User Experience
- Keep explanations simple
- Use visual indicators
- Provide learning opportunities
- Support different skill levels

## 📚 Resources

### Minesweeper Theory
- [Minesweeper Mathematics](https://web.mat.bham.ac.uk/R.W.Kaye/minesw/minesw.htm)
- [Constraint Satisfaction Problems](https://en.wikipedia.org/wiki/Constraint_satisfaction_problem)

### Testing
- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/)

### Web Development
- [Responsive Design Principles](https://web.dev/responsive-web-design-basics/)
- [PWA Best Practices](https://web.dev/pwa-checklist/)

## 🤝 Community

### Communication
- **Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Pull Requests**: Code contributions

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special thanks for major features

---

**Thank you for contributing to AI Minesweeper!** 

Your contributions help make this project better for everyone, from beginners learning Minesweeper to AI enthusiasts exploring constraint satisfaction algorithms.