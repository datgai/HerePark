class SlotMapper:
    def __init__(self, frame_width: int, frame_height: int):
        self.frame_width = frame_width
        self.frame_height = frame_height
        self.mid_x = frame_width // 2
    
    def assign_slot_ids(self, detections: list) -> list:
        slots_with_ids = []
        
        left_slots = []
        right_slots = []
        
        for det in detections:
            bbox = det.get('bbox', det.get('box', [0, 0, 0, 0]))
            x1, y1, x2, y2 = bbox
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            
            slot_data = {
                'bbox': bbox,
                'status': det.get('class_name', det.get('status', 'unknown')),
                'confidence': det.get('confidence', 0.0),
                'center_x': center_x,
                'center_y': center_y
            }
            
            if center_x < self.mid_x:
                left_slots.append(slot_data)
            else:
                right_slots.append(slot_data)
        
        left_slots.sort(key=lambda s: s['center_y'])
        right_slots.sort(key=lambda s: s['center_y'])
        
        for i, slot in enumerate(left_slots):
            slot['slot_id'] = f"A{i+1}"
            slot['section'] = 'A'
            slots_with_ids.append(slot)
        
        for i, slot in enumerate(right_slots):
            slot['slot_id'] = f"B{i+1}"
            slot['section'] = 'B'
            slots_with_ids.append(slot)
        
        return slots_with_ids