#!/bin/bash
# pojia-breaker quick setup script

set -e

echo "🔥 pojia-breaker Web Setup"
echo "=========================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Install Python 3.8+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✓ Found Python $PYTHON_VERSION"
echo ""

# Create venv
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "🌐 Then open: http://localhost:5000"
echo ""
echo "📚 Read DEPLOY_FINAL.md for cloud deployment"
echo ""
