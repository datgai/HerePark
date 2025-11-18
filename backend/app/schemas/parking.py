from pydantic import BaseModel
from typing import List

class Detection(BaseModel):
    bbox: List[int]
    confidence: float
    class_id: int
    class_name: str

class SlotStatus(BaseModel):
    slot_id: int
    status: str
    confidence: float
    bbox: List[int]

class ParkingStats(BaseModel):
    total_slots: int
    occupied: int
    empty: int
    occupancy_rate: float

class Prediction(BaseModel):
    time: str
    minutes_ahead: int
    predicted_occupancy: float
    predicted_empty_slots: int

class PredictionResponse(BaseModel):
    predictions: List[Prediction]
    current_occupancy: float