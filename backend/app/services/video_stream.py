import cv2
import asyncio
from typing import Optional
import numpy as np

class VideoStreamService:
    def __init__(self, source: str, fps: int = 15):
        self.source = source
        self.fps = fps
        self.cap: Optional[cv2.VideoCapture] = None
        self.running = False
        
    def start(self):
        self.cap = cv2.VideoCapture(self.source)
        self.running = True
        
    def get_frame(self) -> Optional[np.ndarray]:
        if not self.cap or not self.running:
            return None
            
        ret, frame = self.cap.read()
        if not ret:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = self.cap.read()
            
        return frame if ret else None
    
    def resize_frame(self, frame: np.ndarray, width: int, height: int) -> np.ndarray:
        return cv2.resize(frame, (width, height))
    
    def stop(self):
        self.running = False
        if self.cap:
            self.cap.release()