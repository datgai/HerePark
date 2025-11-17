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