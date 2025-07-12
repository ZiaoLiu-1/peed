#!/bin/bash

# Build script for Render deployment
set -e

echo "🚀 Starting PEED build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the React frontend
echo "🔨 Building React frontend..."
npm run build

# Copy built frontend files to Flask static directory
echo "📁 Copying frontend files to Flask static directory..."
mkdir -p src/static/dist
cp -r dist/* src/static/

echo "✅ Build completed successfully!"
echo "🎯 Frontend built and copied to src/static/"
echo "🐍 Python dependencies installed"
echo "🌐 Ready for deployment!" 