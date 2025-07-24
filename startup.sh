#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "📦 Installing dependencies..."
npm install

echo "🐘 Starting PostgreSQL with Docker Compose..."
docker compose up -d

echo "🚀 Starting backend in dev mode..."
npm run dev
