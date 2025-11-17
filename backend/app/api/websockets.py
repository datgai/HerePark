from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import cv2
import base64
import asyncio
from app.services.video_stream import VideoStreamService
from app.services.detector import YOLODetector
from app.core.config import settings

router = APIRouter()

video_service = None
yolo_detector = None

@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    global video_service, yolo_detector
    
    await websocket.accept()
    
    if video_service is None:
        video_service = VideoStreamService(settings.VIDEO_SOURCE, settings.STREAM_FPS)
        video_service.start()
    
    if yolo_detector is None:
        yolo_detector = YOLODetector(
            settings.YOLO_MODEL_PATH,
            settings.BOUNDING_BOXES_JSON,
            settings.IOU_THRESHOLD,
            settings.CONF_THRESHOLD
        )
    
    try:
        while True:
            frame = video_service.get_frame()
            if frame is None:
                await asyncio.sleep(0.1)
                continue
                
            frame = video_service.resize_frame(frame, settings.FRAME_WIDTH, settings.FRAME_HEIGHT)
            
            slot_data = yolo_detector.detect(frame)
            annotated_frame = yolo_detector.draw_slots(frame, slot_data)
            
            slots = []
            for slot in slot_data:
                slots.append({
                    'id': slot['slot_id'],
                    'status': slot['status'],
                    'polygon': slot['polygon']
                })
            
            total = len(slots)
            occupied = sum(1 for s in slots if s['status'] == 'occupied')
            empty = total - occupied
            
            _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            await websocket.send_json({
                'frame': frame_base64,
                'slots': slots,
                'stats': {
                    'total': total,
                    'occupied': occupied,
                    'empty': empty,
                    'occupancy_rate': (occupied / total * 100) if total > 0 else 0
                }
            })
            
            await asyncio.sleep(1 / settings.STREAM_FPS)
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Error in websocket: {e}")
        import traceback
        traceback.print_exc()