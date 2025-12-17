#!/bin/bash

# Deployment script for GitHub Pages
echo "🚀 Deploying AI Minesweeper to GitHub Pages..."

# Build the project
echo "📦 Building TypeScript..."
npm run build

# Copy public files to docs folder for GitHub Pages
echo "📁 Preparing files for GitHub Pages..."
rm -rf docs
mkdir -p docs
cp -r public/* docs/

# Update paths for GitHub Pages
echo "🔧 Updating paths for GitHub Pages..."
sed -i 's|href="styles.css"|href="./styles.css"|g' docs/index.html
sed -i 's|src="game.js"|src="./game.js"|g' docs/index.html
sed -i 's|href="manifest.json"|href="./manifest.json"|g' docs/index.html
sed -i 's|href="help.html"|href="./help.html"|g' docs/index.html

echo "✅ Deployment files ready in docs/ folder"
echo "📝 Now commit and push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Deploy to GitHub Pages'"
echo "   git push"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://mrstark65.github.io/ai-minesweeper/"