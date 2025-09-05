#!/bin/bash

# QuickSync Setup Script
# This script sets up the development environment for QuickSync

echo "🚀 Setting up QuickSync - Team Matchmaking Platform"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Backend setup
echo ""
echo "🔧 Setting up Django backend..."
echo "------------------------------"

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv quicksync_env

# Activate virtual environment
echo "Activating virtual environment..."
source quicksync_env/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Django setup
echo "Setting up Django..."
cd backend

# Make migrations
echo "Creating database migrations..."
python manage.py makemigrations accounts
python manage.py makemigrations teams  
python manage.py makemigrations matchmaking

# Apply migrations
echo "Applying database migrations..."
python manage.py migrate

# Create superuser (optional)
echo ""
read -p "Do you want to create a Django superuser? (y/N): " create_superuser
if [[ $create_superuser =~ ^[Yy]$ ]]; then
    echo "Creating Django superuser..."
    python manage.py createsuperuser
fi

cd ..

echo "✅ Backend setup complete!"

# Frontend setup
echo ""
echo "🎨 Setting up React frontend..."
echo "------------------------------"
cd frontend

echo "Installing Node.js dependencies..."
npm install

cd ..

echo "✅ Frontend setup complete!"

# Final instructions
echo ""
echo "🎉 QuickSync setup is complete!"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Configure Firebase:"
echo "   - Create a project at https://console.firebase.google.com"
echo "   - Enable Google Authentication"
echo "   - Update frontend/src/config.js with your Firebase config"
echo ""
echo "2. Start the development servers:"
echo "   Backend:  cd backend && source ../quicksync_env/bin/activate && python manage.py runserver"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "3. Visit http://localhost:3000 to see your app!"
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "Happy team matching! 🚀"