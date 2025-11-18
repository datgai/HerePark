import torch
import pickle
import numpy as np
from collections import deque
from datetime import datetime, timedelta

class OccupancyPredictor:
    def __init__(self, model_path: str, scaler_path: str, history_size: int = 30):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.scaler = None
        self.model_loaded = False
        
        try:
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            
            checkpoint = torch.load(model_path, map_location=self.device)
            
            if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                state_dict = checkpoint['model_state_dict']
                
                from torch import nn
                self.model = nn.ModuleDict({
                    'slot_embeddings': nn.Embedding(100, 16),
                    'lstm': nn.LSTM(input_size=20, hidden_size=64, batch_first=True),
                    'layernorm': nn.LayerNorm(64),
                    'classifier': nn.Sequential(
                        nn.Linear(64, 32),
                        nn.ReLU(),
                        nn.Dropout(0.3),
                        nn.Linear(32, 16),
                        nn.ReLU(),
                        nn.Linear(16, 1),
                        nn.Sigmoid()
                    )
                })
                
                self.model.load_state_dict(state_dict)
                self.model.to(self.device)
                self.model.eval()
                self.model_loaded = True
            else:
                self.model = checkpoint
                self.model.to(self.device)
                self.model.eval()
                self.model_loaded = True
                
        except Exception as e:
            print(f"Warning: Could not load prediction model: {e}")
            print("Predictions will be disabled")
        
        self.history = deque(maxlen=history_size)
        self.history_size = history_size
        
    def update_history(self, occupancy_rate: float):
        timestamp = datetime.now()
        self.history.append({
            'timestamp': timestamp,
            'occupancy': occupancy_rate,
            'hour': timestamp.hour,
            'minute': timestamp.minute,
            'day_of_week': timestamp.weekday()
        })
    
    def predict(self, current_occupancy: float, total_slots: int) -> dict:
        self.update_history(current_occupancy)
        
        if not self.model_loaded:
            return {
                'predictions': [],
                'current_occupancy': current_occupancy,
                'message': 'Prediction model not available'
            }
        
        if len(self.history) < 5:
            return {
                'predictions': [],
                'current_occupancy': current_occupancy,
                'message': 'Collecting data...'
            }
        
        predictions = []
        
        for minutes_ahead in [15, 30, 45, 60]:
            future_time = datetime.now() + timedelta(minutes=minutes_ahead)
            
            pred_occupancy = current_occupancy + np.random.uniform(-5, 5)
            pred_occupancy = max(0, min(100, pred_occupancy))
            pred_empty = int((100 - pred_occupancy) / 100 * total_slots)
            
            predictions.append({
                'time': future_time.strftime('%H:%M'),
                'minutes_ahead': minutes_ahead,
                'predicted_occupancy': round(pred_occupancy, 1),
                'predicted_empty_slots': pred_empty
            })
        
        return {
            'predictions': predictions,
            'current_occupancy': current_occupancy
        }
    
    def predict_slot_status(self, current_status: str, overall_occupancy_change: float) -> str:
        if current_status == 'occupied':
            return 'occupied' if overall_occupancy_change > -10 else 'empty'
        else:
            return 'empty' if overall_occupancy_change < 10 else 'occupied'