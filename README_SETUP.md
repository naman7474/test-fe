# Beauty AI Platform - Complete Setup Guide

This guide will help you run the Beauty AI Platform with 3D face reconstruction functionality.

## Overview

The application consists of:
1. **Frontend**: React app with 3D visualization (runs on port 3000)
2. **Backend**: Python Flask API for photo processing (runs on port 5000)

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- npm or yarn

## Setup Instructions

### Step 1: Install Frontend Dependencies

```bash
# In the root directory (beauty-ai-platform)
npm install
```

### Step 2: Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Option 1: Use the provided script (recommended)
./run.sh

# Option 2: Manual setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Run the Application

You'll need two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd backend
./run.sh
# Or if already set up: source venv/bin/activate && python server.py
```

The backend will start on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
# In the root directory
npm start
```

The frontend will open automatically at http://localhost:3000

## How to Use

1. **Upload Photo**: On the landing page, click or drag to upload a selfie
2. **Wait for Processing**: The app will:
   - Upload your photo to the backend
   - Generate a 3D face model (currently using a placeholder)
   - Display progress updates
3. **View Results**: After processing, you'll see the 3D model in the results page

## Current Implementation

### What Works:
- Photo upload and preview
- Backend API communication
- 3D model display using Three.js
- Progress tracking during analysis
- Navigation flow through the app

### Placeholder Features:
- The 3D model generation currently creates a simple face mesh
- To integrate real NextFace processing, modify `create_sample_face_mesh()` in `backend/server.py`

## Integrating NextFace (Future)

To use actual NextFace 3D reconstruction:

1. Install NextFace following their documentation
2. Replace the `create_sample_face_mesh()` function in `backend/server.py` with:

```python
def generate_nextface_model(input_image_path, output_obj_path):
    # Call NextFace CLI or Python API
    # Example:
    # subprocess.run([
    #     "python", "path/to/nextface/optimizer.py",
    #     "--input", input_image_path,
    #     "--output", output_obj_path
    # ])
    pass
```

## File Structure

```
beauty-ai-platform/
├── src/                    # React frontend source
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── services/          # API services
│   └── store/             # State management
├── backend/               # Python backend
│   ├── server.py         # Flask API server
│   ├── uploads/          # Uploaded photos
│   └── outputs/          # Generated 3D models
└── public/
    └── models/           # Served 3D model files
```

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed: `python3 --version`
- Check if port 5000 is available: `lsof -i :5000`

### Frontend errors
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### CORS errors
- Ensure backend is running on port 5000
- Check that flask-cors is installed

### 3D Model not loading
- Check browser console for errors
- Ensure the .obj file exists in public/models/
- Verify the model URL in the network tab

## Next Steps

1. Integrate actual NextFace processing
2. Add texture mapping for realistic skin
3. Implement landmark detection for accurate product placement
4. Add authentication and user sessions
5. Deploy to production environment 