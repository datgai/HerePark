import json
import math

# Original bounding box data (in JSON format)
# This data represents a list of bounding boxes, where each box is defined by a list of [x, y] points.
ORIGINAL_JSON_DATA = """
[
  {
    "points": [
      [171, 414],
      [241, 401],
      [211, 501],
      [136, 516]
    ]
  },
  {
    "points": [
      [264, 396],
      [336, 384],
      [305, 491],
      [231, 504]
    ]
  },
  {
    "points": [
      [357, 381],
      [428, 373],
      [417, 480],
      [335, 493]
    ]
  },
  {
    "points": [
      [461, 371],
      [528, 367],
      [530, 478],
      [439, 483]
    ]
  },
  {
    "points": [
      [549, 368],
      [611, 363],
      [640, 479],
      [547, 482]
    ]
  },
  {
    "points": [
      [646, 363],
      [711, 363],
      [743, 470],
      [655, 476]
    ]
  },
  {
    "points": [
      [736, 364],
      [810, 367],
      [836, 465],
      [764, 469]
    ]
  },
  {
    "points": [
      [829, 364],
      [900, 371],
      [931, 465],
      [858, 465]
    ]
  },
  {
    "points": [
      [918, 371],
      [979, 378],
      [1030, 470],
      [958, 467]
    ]
  },
  {
    "points": [
      [994, 379],
      [1046, 385],
      [1096, 460],
      [1047, 463]
    ]
  },
  {
    "points": [
      [1069, 378],
      [1118, 384],
      [1160, 444],
      [1121, 459]
    ]
  },
  {
    "points": [
      [1130, 386],
      [1153, 385],
      [1218, 435],
      [1186, 455]
    ]
  },
  {
    "points": [
      [76, 431],
      [150, 416],
      [116, 505],
      [46, 520]
    ]
  }
]
"""

# Transformation parameters
SCALE_FACTOR = 0.52
VERTICAL_TRANSLATION = 80

def transform_bounding_boxes(json_data_str: str, scale: float, translate_y: int) -> str:
    """
    Loads JSON bounding box data, scales the coordinates, translates the y-coordinate,
    and returns the result as a formatted JSON string.
    """
    try:
        data = json.loads(json_data_str)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return ""

    transformed_data = []
    
    for box in data:
        new_points = []
        for x, y in box.get('points', []):
            # 1. Scale coordinates (x and y)
            x_scaled = x * scale
            y_scaled = y * scale
            
            # 2. Translate y-coordinate (move down)
            y_translated = y_scaled + translate_y
            
            # 3. Round to the nearest integer for pixel coordinates
            # math.round() is used for explicit rounding behavior
            new_points.append([int(math.ceil(x_scaled)) if x_scaled - math.floor(x_scaled) >= 0.5 else int(math.floor(x_scaled)), 
                               int(math.ceil(y_translated)) if y_translated - math.floor(y_translated) >= 0.5 else int(math.floor(y_translated))])

        transformed_data.append({"points": new_points})
    
    # Return the result as a nicely formatted JSON string
    return json.dumps(transformed_data, indent=2)

if __name__ == "__main__":
    # Perform the transformation
    result_json = transform_bounding_boxes(ORIGINAL_JSON_DATA, SCALE_FACTOR, VERTICAL_TRANSLATION)
    
    # Print the resulting JSON
    if result_json:
        print(result_json)
    else:
        print("Transformation failed due to input error.")