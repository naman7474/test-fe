# Beauty AI Platform - NextFace 3D Integration

This guide explains how to run the Beauty AI Platform with **real 3D face reconstruction** using NextFace.

## 🚀 Quick Start

### Step 1: Start the Backend with NextFace

```bash
cd backend
./run_with_nextface.sh
```

This script will:
- Set up Python environment
- Install all dependencies (including PyTorch, MediaPipe, etc.)
- Clone and configure NextFace
- Guide you through downloading required models

### Step 2: Download Required Models

NextFace requires two models that must be downloaded manually:

1. **Basel Face Model (BFM 2017)**
   - Go to: https://faces.dmi.unibas.ch/bfm/bfm2017.html
   - Fill out the form (academic use)
   - Download: `model2017-1_face12_nomouth.h5`
   - Place in: `backend/NextFace/baselMorphableModel/`

2. **Albedo Model**
   - Direct download: https://github.com/waps101/AlbedoMM/releases/download/v1.0/albedoModel2020_face12_albedoPart.h5
   - Place in: `backend/NextFace/baselMorphableModel/`

### Step 3: Start the Frontend

In a new terminal:
```bash
npm start
```

## 📸 How It Works

1. **Upload Photo**: User uploads a selfie
2. **Face Detection**: MediaPipe detects facial landmarks
3. **3D Reconstruction**: NextFace creates a high-fidelity 3D model
4. **Display**: Three.js renders the model in the browser

## 🔧 Technical Details

### Backend Processing Flow

```python
Upload Photo → Save to uploads/ → NextFace Processing → Generate OBJ → Serve via public/models/
```

### NextFace Integration

The backend runs NextFace in a background thread:
- Processes images using MediaPipe for landmark detection
- Optimizes 3D morphable model to fit the photo
- Outputs `.obj` file with face geometry
- Falls back to simple mesh if models aren't available

### API Endpoints

- `POST /api/upload` - Upload photo and start processing
- `GET /api/status/<session_id>` - Check if model is ready

## 🎯 Features

- **Real 3D Face Reconstruction** - Not just a placeholder!
- **Background Processing** - UI stays responsive
- **Automatic Fallback** - Works even without models
- **Progress Tracking** - Real-time status updates

## 🔍 Troubleshooting

### "NextFace failed" Error
- Ensure both `.h5` model files are in `backend/NextFace/baselMorphableModel/`
- Check Python has enough memory (NextFace needs ~4GB)
- Try with a clear, front-facing photo

### Slow Processing
- First run downloads additional models
- Processing takes 30-60 seconds per photo
- GPU acceleration coming soon

### Model Not Loading
- Check browser console for 404 errors
- Ensure `public/models/` directory exists
- Verify the OBJ file was created

## 🚧 Current Limitations

1. **Processing Time**: ~30-60 seconds per photo
2. **CPU Only**: GPU support not yet implemented
3. **Single View**: Best with front-facing photos
4. **No Texture**: Only geometry (texture mapping coming soon)

## 🔮 Next Steps

1. **GPU Acceleration**: Use CUDA for faster processing
2. **Texture Mapping**: Apply photo texture to 3D model
3. **Multiple Views**: Support profile photos
4. **Real-time Preview**: Show progress during reconstruction

## 📝 Development Notes

### Modifying NextFace Parameters

Edit `backend/NextFace/optimConfig.ini`:
```ini
[DEFAULT]
textureResolution = 512
lamdmarksDetectorType = mediapipe
numIterations = 100
```

### Adding GPU Support

Install CUDA version:
```bash
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

Then modify `server.py` to use GPU.

## 🎉 Success!

Once everything is set up, you'll see:
1. Upload a selfie
2. Watch the progress bar
3. See your actual 3D face model!

The model will be interactive - drag to rotate, scroll to zoom.

---

**Note**: NextFace is for research/educational use only. Check their license before commercial use. 