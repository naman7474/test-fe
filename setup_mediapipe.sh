#!/bin/bash

echo "🎭 Setting up Beauty AI Platform with MediaPipe Face Reconstruction"
echo "=================================================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python 3 found"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install Flask==2.3.3 Flask-CORS==4.0.0 Werkzeug==2.3.7 mediapipe==0.10.21 opencv-python==4.11.0.86 numpy==1.26.4 scipy==1.15.3 Pillow==10.4.0

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✅ Python dependencies installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/uploads
mkdir -p backend/outputs
mkdir -p public/models

echo "✅ Directories created"

# Test MediaPipe import
echo "🧪 Testing MediaPipe installation..."
python3 -c "
import mediapipe as mp
import cv2
import numpy as np
from scipy.spatial import Delaunay
print('✅ All imports successful')
"

if [ $? -ne 0 ]; then
    echo "❌ MediaPipe test failed"
    exit 1
fi

echo "✅ MediaPipe test passed"

# Test face mesh generator
echo "🧪 Testing face mesh generator..."
cd backend
python3 -c "
try:
    from face_mesh_generator import FaceMeshGenerator
    generator = FaceMeshGenerator()
    generator.cleanup()
    print('✅ Face mesh generator working')
except Exception as e:
    print(f'❌ Face mesh generator error: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Face mesh generator test failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the system:"
echo "1. Backend:  cd backend && python server.py"
echo "2. Frontend: npm start"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "Features:"
echo "✅ MediaPipe 3D face reconstruction"
echo "✅ Real-time processing (1-3 seconds)"
echo "✅ Cross-platform compatibility"
echo "✅ No complex dependencies"
echo ""
echo "Upload a clear, well-lit photo to see your 3D face model!" 