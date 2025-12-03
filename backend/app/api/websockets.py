from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import cv2
import base64
import asyncio
import json
from app.services.video_stream import VideoStreamService
from app.services.detector import YOLODetector
from app.services.predictor import OccupancyPredictor
from app.services.slot_mapper import SlotMapper
from app.core.config import settings

router = APIRouter()

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

detectors = {}
predictors = {}
video_services = {}
slot_mappers = {}
active_connections = {}

PREDICTION_FRAME_INTERVAL = 30


@router.websocket("/ws/stream/{section}")
async def websocket_stream(websocket: WebSocket, section: str = "AB"):
    print(f"\n[WS] Connection attempt to section: {section}")
    
    if section not in SECTION_CONFIG:
        print(f"[WS ERROR] Invalid section: {section}")
        await websocket.accept()
        await websocket.send_json({"error": f"Invalid section: {section}"})
        await websocket.close(code=1008)
        return
    
    await websocket.accept()
    print(f"[WS] Connection accepted for section: {section}")
    
    if section not in active_connections:
        active_connections[section] = []
    active_connections[section].append(websocket)
    
    config = SECTION_CONFIG[section]
    
    # Initialize services
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
    
    if section not in slot_mappers:
        slot_mappers[section] = SlotMapper(
            settings.FRAME_WIDTH,
            settings.FRAME_HEIGHT,
            section=section
        )
    
    video_service = video_services[section]
    detector = detectors[section]
    predictor = predictors[section]
    mapper = slot_mappers[section]
    
    frame_count = 0
    slot_predictions = {}
    overall_predictions = None
    last_prediction_frame = 0
    
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
            
            raw_slot_data = detector.detect(frame)
            mapped_slot_data = mapper.assign_slot_ids(raw_slot_data)
            
            # Merge polygon and center from raw data into mapped data
            for mapped_slot in mapped_slot_data:
                for raw_slot in raw_slot_data:
                    if raw_slot['slot_id'] == mapped_slot['slot_id']:
                        mapped_slot['polygon'] = raw_slot['polygon']
                        mapped_slot['center'] = raw_slot['center']
                        break
            
            annotated_frame = detector.draw_slots(frame, mapped_slot_data)
            
            total = len(mapped_slot_data)
            occupied = sum(1 for s in mapped_slot_data if s['status'] == 'occupied')
            empty = total - occupied
            occupancy_rate = (occupied / total * 100) if total > 0 else 0
            
            # Update predictions periodically
            if frame_count - last_prediction_frame >= PREDICTION_FRAME_INTERVAL and total > 0:
                overall_predictions = predictor.predict(occupancy_rate, total, mapped_slot_data)
                trend = overall_predictions.get('trend', 'stable')
                
                slot_predictions.clear()
                for slot in mapped_slot_data:
                    trend_value = -2 if trend == 'decreasing' else 2 if trend == 'increasing' else 0
                    availability = predictor.predict_slot_availability(
                        slot['status'], 
                        trend_value
                    )
                    slot_predictions[slot['slot_id']] = availability
                
                last_prediction_frame = frame_count
            
            frame_count += 1
            
            _, buffer = cv2.imencode('.jpg', annotated_frame, 
                                     [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            slots_output = [
                {
                    'slot_id': s['slot_id'],
                    'section': s['section'],
                    'status': s['status'],
                    'confidence': s.get('confidence', 0.95),
                    'bbox': s['bbox'],
                    'prediction': slot_predictions.get(s['slot_id'], 'unknown')
                } 
                for s in mapped_slot_data
            ]
            
            payload = {
                'frame': frame_base64,
                'slots': slots_output,
                'stats': {
                    'total': total,
                    'occupied': occupied,
                    'empty': empty,
                    'occupancy_rate': occupancy_rate
                },
                'predictions': overall_predictions,
                'section': section
            }
            
            await websocket.send_json(payload)
            
            if frame_count % 150 == 0:
                print(f"[STREAM] {section} - Frame {frame_count}, Slots: {total}, Occupied: {occupied}")
            
            await asyncio.sleep(1 / settings.STREAM_FPS)
    
    except WebSocketDisconnect:
        print(f"[WS] Client disconnected from {section}")
    except Exception as e:
        print(f"[WS ERROR] {section}: {type(e).__name__}: {str(e)}")
        try:
            await websocket.send_json({"error": str(e)})
        except (RuntimeError, WebSocketDisconnect):
            pass
    finally:
        if section in active_connections:
            try:
                active_connections[section].remove(websocket)
            except ValueError:
                pass
        
        try:
            await websocket.close()
        except (RuntimeError, WebSocketDisconnect):
            pass