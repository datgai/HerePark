from fastapi import APIRouter, WebSocket
import cv2
import base64
import asyncio
from app.services.video_stream import VideoStreamService
from app.services.detector import YOLODetector
from app.services.predictor import OccupancyPredictor
from app.core.config import settings

router = APIRouter()

video_service = VideoStreamService(settings.VIDEO_SOURCE, settings.STREAM_FPS)
yolo_detector = YOLODetector(settings.YOLO_MODEL_PATH, settings.BOUNDING_BOXES_JSON)
predictor = OccupancyPredictor(settings.PREDICTION_MODEL_PATH, settings.SCALER_PATH)

frame_count = 0
PREDICTION_INTERVAL = 30

@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    video_service.start()
    
    global frame_count
    
    while True:
        frame = video_service.get_frame()
        if frame is None:
            break
            
        frame = video_service.resize_frame(frame, settings.FRAME_WIDTH, settings.FRAME_HEIGHT)
        
        slot_data = yolo_detector.detect(frame)
        annotated_frame = yolo_detector.draw_slots(frame, slot_data)
        
        total = len(slot_data)
        occupied = sum(1 for s in slot_data if s['status'] == 'occupied')
        empty = total - occupied
        occupancy_rate = (occupied / total * 100) if total > 0 else 0
        
        predictions = None
        slot_predictions = {}
        
        if frame_count % PREDICTION_INTERVAL == 0 and total > 0:
            predictions = predictor.predict(occupancy_rate, total)
            
            if predictions and predictions.get('predictions'):
                for pred in predictions['predictions']:
                    occupancy_change = pred['predicted_occupancy'] - occupancy_rate
                    
                    for slot in slot_data:
                        if slot['slot_id'] not in slot_predictions:
                            slot_predictions[slot['slot_id']] = {}
                        
                        predicted_status = predictor.predict_slot_status(
                            slot['status'], 
                            occupancy_change
                        )
                        slot_predictions[slot['slot_id']][pred['minutes_ahead']] = predicted_status
        
        frame_count += 1
        
        _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        slots_output = [{
            'slot_id': s['slot_id'],
            'section': s['slot_id'][0],
            'status': s['status'],
            'confidence': 0.95,
            'bbox': [0, 0, 0, 0],
            'predictions': slot_predictions.get(s['slot_id'], {})
        } for s in slot_data]
        
        await websocket.send_json({
            'frame': frame_base64,
            'slots': slots_output,
            'stats': {
                'total': total,
                'occupied': occupied,
                'empty': empty,
                'occupancy_rate': occupancy_rate
            },
            'predictions': predictions
        })
        
        await asyncio.sleep(1 / settings.STREAM_FPS)