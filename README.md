# HerePark

Real-time parking availability detection and occupancy prediction powered by AI-driven computer vision and YOLO object detection.

## Overview

HerePark combines live video surveillance with machine learning to provide:

- **Real-time slot detection** - YOLO-based occupancy classification
- **Occupancy analytics** - Live dashboard with aggregated statistics
- **Predictive forecasting** - Time-to-availability predictions for parking slots
- **Multi-section support** - Manage multiple parking areas simultaneously

## Tech Stack

### Backend

- **Framework**: FastAPI + Uvicorn
- **Computer Vision**: OpenCV, YOLOv8 (Ultralytics)
- **Real-time Communication**: WebSockets
- **Processing**: NumPy, Pandas
- **Configuration**: Pydantic

### Frontend

- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7
- **Build Tool**: Vite
- **Charting**: Recharts
- **Icons**: Lucide React
- **Styling**: CSS Modules (with CSS variables)
- **Linting**: ESLint + TypeScript ESLint

### Deployment

- **Containerization**: Docker Compose
- **Container Images**: Python 3.13-slim, Node.js 20-alpine

## Installation & Setup

### Prerequisites

- Docker & Docker Compose (recommended)
- Python 3.13+ & Node.js 20+ (for local development)
- Video files: `parking_AB.mp4`, `parking_C.mp4` in `backend/`

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

### Option 2: Local Development

**Backend:**

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

### WebSocket Stream

```
ws://localhost:8000/ws/stream/{section}
```

**Sections**: `AB`, `C`

**Message Format:**

```json
{
  "frame": "base64_encoded_jpg",
  "slots": [
    {
      "slot_id": "A1",
      "section": "A",
      "status": "empty|occupied",
      "prediction": "available_now|available_soon|available_later|long_wait",
      "confidence": 0.95
    }
  ],
  "stats": {
    "total": 10,
    "occupied": 3,
    "empty": 7,
    "occupancy_rate": 30
  }
}
```

### REST Endpoints

- `GET /api/health` - Service health check
- `GET /api/stats` - Aggregated parking statistics

## Configuration

Edit `backend/app/core/config.py`:

```python
VIDEO_SOURCE = "parking.mp4"
STREAM_FPS = 15
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
YOLO_MODEL_PATH = "app/models/classification/best.pt"
IOU_THRESHOLD = 0.25
CONF_THRESHOLD = 0.25
```

## Styling

Theme variables in `frontend/src/App.css`:

```css
--primary-colour: hsl(32, 99%, 50%)
--secondary-colour: hsl(0, 100%, 56%)
--background-colour: hsl(0, 0%, 92%)
```

CSS Modules use rem units for responsive design.

## Usage

1. **Home Page** (`/`): Public dashboard with real-time stats and predictions
2. **Admin Dashboard** (`/admin`): Management interface
3. **Parking Details** (`/admin/parking`): Multi-section camera feeds and occupancy grid

## Development

```bash
# Run linter
npm run lint

# Format code
npm run prettier

# Build for production
npm run build
```

## Performance

- **Stream FPS**: 15 (configurable)
- **Detection Latency**: ~100-150ms per frame
- **WebSocket Message Rate**: 15/sec per client
- **JPEG Compression**: 80% quality
