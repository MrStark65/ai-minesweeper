# 🎮 AI Minesweeper Web Interface

A responsive, cross-platform web interface for the AI Minesweeper game that works on any device - desktop, tablet, or mobile.

## 🚀 Quick Start

```bash
npm run web
```

Then open http://localhost:3000 in any browser or device!

## 📱 Device Compatibility

### Desktop
- **Full Experience**: Large board view, side panel with AI analysis, all controls visible
- **Mouse Controls**: Left-click to reveal, right-click to flag
- **Keyboard**: Tab navigation, Enter to activate

### Tablet
- **Optimized Layout**: Responsive grid, touch-friendly buttons
- **Touch Controls**: Tap to reveal, long-press to flag
- **Portrait/Landscape**: Adapts to orientation changes

### Mobile
- **Mobile-First Design**: Compact layout, bottom navigation bar
- **Touch Optimized**: Large touch targets, gesture support
- **PWA Ready**: Install as app, offline capable, full-screen mode

## 🎯 Features

### 🤖 AI Assistant
- **Smart Recommendations**: Get AI suggestions with confidence levels
- **Explainable Reasoning**: See step-by-step logic behind each recommendation
- **Cell Analysis**: Tap any cell for detailed explanation
- **Probability Display**: View calculated mine probabilities
- **Pattern Recognition**: AI identifies common Minesweeper patterns

### 🎮 Game Features
- **Three Difficulty Levels**: Beginner (9×9), Intermediate (16×16), Expert (30×16)
- **Dual Mode Controls**: Switch between Reveal and Flag modes
- **Visual Feedback**: Color-coded recommendations and probabilities
- **Game Statistics**: Track mines remaining, progress, and status
- **Responsive Grid**: Adapts to screen size while maintaining playability

### 📱 Mobile Enhancements
- **Bottom Navigation**: Easy thumb access to key controls
- **Mode Switching**: Toggle between reveal and flag actions
- **Touch Gestures**: Tap to reveal, long-press to flag
- **Optimized Sizing**: Cells scale appropriately for touch interaction

## 🎨 Visual Design

### Color System
- **Primary Blue**: Main actions and highlights
- **Success Green**: Safe recommendations and positive feedback
- **Warning Orange**: Probable recommendations and cautions
- **Danger Red**: Mine cells and critical warnings
- **Neutral Gray**: Secondary elements and backgrounds

### Typography
- **JetBrains Mono**: Monospace font for clear number display
- **Responsive Sizing**: Text scales with screen size
- **High Contrast**: Ensures readability on all devices

### Layout
- **Grid-Based**: CSS Grid for perfect cell alignment
- **Flexbox Controls**: Responsive button layouts
- **Card Design**: Clean, modern interface elements
- **Shadow System**: Subtle depth and hierarchy

## 🔧 Technical Implementation

### Frontend Architecture
```
public/
├── index.html          # Main game interface
├── styles.css          # Responsive CSS with CSS Grid
├── game.js            # Game logic and AI integration
├── manifest.json      # PWA configuration
└── help.html          # Game instructions
```

### Game Engine
- **Simplified Backend**: Browser-compatible game logic
- **AI Reasoning**: Constraint satisfaction and probability calculation
- **State Management**: Reactive updates and event handling
- **Error Handling**: Graceful degradation and user feedback

### Responsive Breakpoints
- **Desktop**: > 1024px - Full layout with side panels
- **Tablet**: 768px - 1024px - Stacked layout, touch controls
- **Mobile**: < 768px - Compact layout, bottom navigation

## 🎮 How to Play

### Basic Controls
1. **Select Difficulty**: Choose Beginner, Intermediate, or Expert
2. **Make Moves**: Click/tap cells to reveal them
3. **Flag Mines**: Right-click or use Flag mode to mark suspected mines
4. **Get AI Help**: Click the AI button for intelligent recommendations
5. **Analyze Cells**: Click any cell to see detailed AI analysis

### AI Features
- **🟢 Green Highlights**: Guaranteed safe cells (certain recommendations)
- **🟡 Yellow Highlights**: Best probability choices (probable recommendations)
- **📊 Probability Panel**: Shows calculated mine probabilities
- **🧠 Reasoning Panel**: Explains AI logic step-by-step
- **🔍 Cell Analysis**: Detailed explanation of any cell's status

### Mobile Specific
- **Mode Toggle**: Switch between Reveal (👆) and Flag (🚩) modes
- **Bottom Controls**: 🤖 AI Help, Mode Toggle, 🔄 New Game
- **Touch Gestures**: Tap for selected action, long-press always flags

## 🌐 PWA Features

### Progressive Web App
- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Core functionality works without internet
- **Full Screen**: Immersive gaming experience
- **App-Like**: Native app feel and performance

### Installation
1. **Chrome/Edge**: Click install prompt or "Add to Home Screen"
2. **Safari**: Share → "Add to Home Screen"
3. **Firefox**: Menu → "Install"

## 🎯 Accessibility

### Keyboard Navigation
- **Tab Order**: Logical navigation through all interactive elements
- **Enter/Space**: Activate buttons and cells
- **Arrow Keys**: Navigate grid cells
- **Escape**: Close modals and cancel actions

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all game elements
- **Live Regions**: Announce game state changes
- **Semantic HTML**: Proper heading structure and landmarks
- **Alt Text**: Descriptive text for visual elements

### Visual Accessibility
- **High Contrast**: WCAG AA compliant color ratios
- **Large Touch Targets**: Minimum 44px touch areas
- **Clear Typography**: Readable fonts and sizing
- **Color Independence**: Information not conveyed by color alone

## 🚀 Performance

### Optimization
- **Minimal Dependencies**: Pure JavaScript, no frameworks
- **Efficient Rendering**: Only update changed cells
- **Memory Management**: Proper cleanup and garbage collection
- **Fast Loading**: Optimized assets and minimal HTTP requests

### Browser Support
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement**: Core functionality works on older browsers

## 🔧 Development

### Local Development
```bash
# Start development server
npm run web

# Build TypeScript backend (optional)
npm run build

# Run tests
npm test
```

### File Structure
```
├── public/              # Web interface files
│   ├── index.html      # Main game page
│   ├── styles.css      # Responsive styles
│   ├── game.js         # Game logic
│   ├── manifest.json   # PWA config
│   └── help.html       # Instructions
├── src/                # TypeScript backend
├── server.js           # Simple HTTP server
└── package.json        # Dependencies
```

### Customization
- **Themes**: Modify CSS custom properties in `:root`
- **Difficulty**: Add new presets in `getDifficultyConfig()`
- **AI Logic**: Enhance reasoning in `AIReasoner` class
- **Layout**: Adjust responsive breakpoints in CSS

## 📊 Browser Testing

Tested and optimized for:
- ✅ Chrome Desktop/Mobile
- ✅ Firefox Desktop/Mobile  
- ✅ Safari Desktop/Mobile
- ✅ Edge Desktop
- ✅ Samsung Internet
- ✅ iOS Safari (PWA)
- ✅ Android Chrome (PWA)

## 🎉 Ready to Play!

The AI Minesweeper web interface provides a complete, cross-platform gaming experience with intelligent AI assistance. Whether you're on desktop, tablet, or mobile, you'll get the full power of constraint satisfaction algorithms and explainable AI reasoning in a beautiful, responsive interface.

Start playing at http://localhost:3000 and experience the future of Minesweeper! 🚀