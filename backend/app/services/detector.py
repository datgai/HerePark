from ultralytics import YOLO
import numpy as np
import cv2
import json

class YOLODetector:
    def __init__(self, model_path: str, bounding_boxes_json: str, iou_threshold: float = 0.25, conf_threshold: float = 0.25):
        self.model = YOLO(model_path)
        self.iou_threshold = iou_threshold
        self.conf_threshold = conf_threshold
        self.labeled_slots = self._load_slots(bounding_boxes_json)
        
    def _load_slots(self, json_path: str):
        with open(json_path, 'r') as f:
            parking_slots = json.load(f)
        
        labeled_slots = {}
        for slot in parking_slots:
            points = slot['points']
            avg_x = sum(p[0] for p in points) / len(points)
            side = 'A' if avg_x < 200 else 'B'
            side_count = sum(1 for k in labeled_slots.keys() if k.startswith(side))
            slot_id = f"{side}{side_count + 1}"
            labeled_slots[slot_id] = np.array(points, np.int32)
        
        return labeled_slots
    
    def _fast_iou(self, box, polygon):
        x1, y1, x2, y2 = box
        poly_x, poly_y = polygon[:, 0], polygon[:, 1]
        px1, py1 = poly_x.min(), poly_y.min()
        px2, py2 = poly_x.max(), poly_y.max()
        
        ix1, iy1 = max(x1, px1), max(y1, py1)
        ix2, iy2 = min(x2, px2), min(y2, py2)
        
        if ix1 >= ix2 or iy1 >= iy2:
            return 0
        
        inter_area = (ix2 - ix1) * (iy2 - iy1)
        box_area = (x2 - x1) * (y2 - y1)
        poly_area = (px2 - px1) * (py2 - py1)
        union_area = box_area + poly_area - inter_area
        
        return inter_area / union_area if union_area > 0 else 0
    
    def detect(self, frame: np.ndarray):
        results = self.model(frame, verbose=False, conf=self.conf_threshold)[0]
        
        detections = []
        if results.boxes is not None and len(results.boxes) > 0:
            boxes = results.boxes.xyxy.cpu().numpy()
            for box in boxes:
                detections.append(box[:4].tolist())
        
        occupancy = self._check_occupancy(detections)
        
        slot_data = []
        for slot_id, polygon in self.labeled_slots.items():
            status = 'occupied' if occupancy[slot_id] else 'empty'
            slot_data.append({
                'slot_id': slot_id,
                'status': status,
                'polygon': polygon.tolist(),
                'center': [int(np.mean(polygon[:, 0])), int(np.mean(polygon[:, 1]))],
                'bbox': [int(polygon[:, 0].min()), int(polygon[:, 1].min()), 
                        int(polygon[:, 0].max()), int(polygon[:, 1].max())]
            })
        
        return slot_data
    
    def _check_occupancy(self, detections):
        occupancy = {slot_id: 0 for slot_id in self.labeled_slots.keys()}
        
        for box in detections:
            best_iou, best_slot = 0, None
            for slot_id, polygon in self.labeled_slots.items():
                iou = self._fast_iou(box, polygon)
                if iou > best_iou:
                    best_iou, best_slot = iou, slot_id
            if best_iou > self.iou_threshold and best_slot:
                occupancy[best_slot] = 1
        
        return occupancy
    
    def draw_slots(self, frame: np.ndarray, slot_data: list) -> np.ndarray:
        overlay = frame.copy()
        
        for slot in slot_data:
            # Handle both formats: from detect() and from slot_mapper
            polygon = slot.get('polygon') or [
                [slot['bbox'][0], slot['bbox'][1]],
                [slot['bbox'][2], slot['bbox'][1]],
                [slot['bbox'][2], slot['bbox'][3]],
                [slot['bbox'][0], slot['bbox'][3]]
            ]
            
            polygon_arr = np.array(polygon, np.int32)
            color = (0, 0, 255) if slot['status'] == 'occupied' else (0, 255, 0)
            
            cv2.polylines(overlay, [polygon_arr], True, color, 2)
            cv2.fillPoly(overlay, [polygon_arr], color)
            
            center = slot.get('center') or [
                int((slot['bbox'][0] + slot['bbox'][2]) / 2),
                int((slot['bbox'][1] + slot['bbox'][3]) / 2)
            ]
            
            cv2.putText(overlay, slot['slot_id'], (center[0] - 15, center[1]), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        annotated = cv2.addWeighted(overlay, 0.4, frame, 0.6, 0)
        
        occupied = sum(1 for s in slot_data if s['status'] == 'occupied')
        total = len(slot_data)
        cv2.putText(annotated, f"Occupied: {occupied}/{total}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        return annotated