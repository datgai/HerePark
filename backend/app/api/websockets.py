from fastapi import APIRouter, WebSocket
import cv2
import base64
import asyncio
from app.services.video_stream import VideoStreamService
from app.services.detector import YOLODetector
from app.services.predictor import OccupancyPredictor
from app.core.config import settings

router = APIRouter()

# Section-specific configurations
SECTION_CONFIG = {
    "AB": {
        "video_source": "parking_AB.mp4",
        "bbox_file": "bounding_boxes_AB.json",
    },
    "C": {
        "video_source": "parking_C.mp4",
        "bbox_file": "bounding_boxes_C.json",
    }
}

# Cache detectors per section
detectors = {}
predictors = {}
video_services = {}

PREDICTION_INTERVAL = 900
cached_predictions = {}
first_predictions = {}


@router.websocket("/ws/stream/{section}")
async def websocket_stream(websocket: WebSocket, section: str = "AB"):
    await websocket.accept()
    
    # Validate section
    if section not in SECTION_CONFIG:
        await websocket.send_json({"error": f"Invalid section: {section}"})
        await websocket.close(code=1008)
        return
    
    config = SECTION_CONFIG[section]
    
    # Initialize services if not already done
    if section not in video_services:
        video_services[section] = VideoStreamService(
            config["video_source"], 
            settings.STREAM_FPS
        )
        video_services[section].start()
    
    if section not in detectors:
        detectors[section] = YOLODetector(
            settings.YOLO_MODEL_PATH,
            config["bbox_file"]
        )
    
    if section not in predictors:
        predictors[section] = OccupancyPredictor(
            settings.PREDICTION_MODEL_PATH,
            settings.SCALER_PATH
        )
    
    video_service = video_services[section]
    yolo_detector = detectors[section]
    predictor = predictors[section]
    
    frame_count = 0
    cached_slot_predictions = {}
    cached_overall_predictions = None
    first_prediction_done = False
    
    try:
        while True:
            frame = video_service.get_frame()
            if frame is None:
                break
            
            frame = video_service.resize_frame(
                frame, 
                settings.FRAME_WIDTH, 
                settings.FRAME_HEIGHT
            )
            
            slot_data = yolo_detector.detect(frame)
            annotated_frame = yolo_detector.draw_slots(frame, slot_data)
            
            total = len(slot_data)
            occupied = sum(1 for s in slot_data if s['status'] == 'occupied')
            empty = total - occupied
            occupancy_rate = (occupied / total * 100) if total > 0 else 0
            
            # Predictions every N frames
            if (not first_prediction_done or frame_count % PREDICTION_INTERVAL == 0) and total > 0:
                overall_predictions = predictor.predict(occupancy_rate, total, slot_data)
                trend = overall_predictions.get('trend', 'stable')
                
                cached_slot_predictions.clear()
                for slot in slot_data:
                    trend_value = -2 if trend == 'decreasing' else 2 if trend == 'increasing' else 0
                    availability = predictor.predict_slot_availability(
                        slot['status'], 
                        trend_value
                    )
                    cached_slot_predictions[slot['slot_id']] = availability
                
                cached_overall_predictions = overall_predictions
                first_prediction_done = True
            
            frame_count += 1
            
            _, buffer = cv2.imencode(
                '.jpg', 
                annotated_frame, 
                [cv2.IMWRITE_JPEG_QUALITY, 80]
            )
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            slots_output = [
                {
                    'slot_id': s['slot_id'],
                    'section': s['slot_id'][0],
                    'status': s['status'],
                    'confidence': 0.95,
                    'bbox': [0, 0, 0, 0],
                    'prediction': cached_slot_predictions.get(s['slot_id'], 'unknown')
                } 
                for s in slot_data
            ]
            
            await websocket.send_json({
                'frame': frame_base64,
                'slots': slots_output,
                'stats': {
                    'total': total,
                    'occupied': occupied,
                    'empty': empty,
                    'occupancy_rate': occupancy_rate
                },
                'predictions': cached_overall_predictions,
                'section': section
            })
            
            await asyncio.sleep(1 / settings.STREAM_FPS)
    
    except Exception as e:
        print(f"Error in section {section}: {e}")
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()