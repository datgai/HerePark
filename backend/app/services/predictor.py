import numpy as np
from collections import deque
from datetime import datetime

class OccupancyPredictor:
    def __init__(self, model_path: str, scaler_path: str, history_size: int = 60):
        self.history = deque(maxlen=history_size)
        self.history_size = history_size
        
    def update_history(self, occupancy_rate: float, slot_data: list):
        timestamp = datetime.now()
        self.history.append({
            'timestamp': timestamp,
            'occupancy_rate': occupancy_rate,
            'slot_data': slot_data
        })
    
    def predict(self, current_occupancy: float, total_slots: int, slot_data: list = None) -> dict:
        if slot_data:
            self.update_history(current_occupancy, slot_data)
        
        if len(self.history) < 2:
            trend = 0
        else:
            recent_history = list(self.history)[-30:]
            recent_occupancy = [h['occupancy_rate'] for h in recent_history]
            trend = np.mean(np.diff(recent_occupancy[-10:])) if len(recent_occupancy) >= 10 else 0
        
        predictions = {
            'available_soon': 0,
            'available_later': 0,
            'long_wait': 0,
            'trend': 'stable'
        }
        
        if trend < -2:
            predictions['trend'] = 'decreasing'
        elif trend > 2:
            predictions['trend'] = 'increasing'
        
        for slot in slot_data:
            if slot['status'] == 'empty':
                predictions['available_soon'] += 1
            elif trend < -1:
                predictions['available_later'] += 1
            else:
                predictions['long_wait'] += 1
        
        return predictions
    
    def predict_slot_availability(self, slot_status: str, trend: float) -> str:
        if slot_status == 'empty':
            return 'available_now'
        elif trend < -1:
            return 'available_soon'
        elif trend < 1:
            return 'available_later'
        else:
            return 'long_wait'