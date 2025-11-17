from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    VIDEO_SOURCE: str = "parking.mp4"
    STREAM_FPS: int = 15
    FRAME_WIDTH: int = 640
    FRAME_HEIGHT: int = 480
    
    YOLO_MODEL_PATH: str = "app/models/classification/best.pt"
    PREDICTION_MODEL_PATH: str = "app/models/prediction/best_model.pt"
    SCALER_PATH: str = "app/models/prediction/scaler.pkl"
    BOUNDING_BOXES_JSON: str = "bounding_boxes.json"
    IOU_THRESHOLD: float = 0.25
    CONF_THRESHOLD: float = 0.25
    
    class Config:
        env_file = ".env"

settings = Settings()