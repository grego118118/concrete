from PIL import Image
import os

source_path = r"C:/Users/grego/.gemini/antigravity/brain/703054ec-12c2-4619-a338-6ef7e53b2c20/logo_transparent_fixed_1770054702402.png"
dest_path = r"c:\Users\grego\Documents\augment-projects\Concrete\assets\images\logo-new.png"

try:
    with Image.open(source_path) as img:
        # Ensure RGBA for transparency
        img = img.convert("RGBA")
        
        # Calculate new dimensions (target 200px height for high quality)
        target_height = 200
        aspect_ratio = img.width / img.height
        new_width = int(aspect_ratio * target_height)
        
        print(f"Original size: {img.size}")
        print(f"Target size: ({new_width}, {target_height})")
        
        img = img.resize((new_width, target_height), Image.Resampling.LANCZOS)
        img.save(dest_path, "PNG")
        print(f"Successfully saved resized logo to {dest_path}")
        print(f"New dimensions: {img.size}")
except Exception as e:
    print(f"Error: {e}")
