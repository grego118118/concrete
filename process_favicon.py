#!/usr/bin/env python3
"""
Process Favicon
Taking a source image and generating all required web favicon formats.
"""

from PIL import Image
import os

def process_favicon():
    # Configuration
    source_path = "assets/images/favicon_source.png"
    output_dir = "assets/images"
    
    if not os.path.exists(source_path):
        print(f"Error: Source file {source_path} not found.")
        # Try to look for it in the root or artifacts if not in assets yet
        # For this script we assume the user/agent places it there.
        return

    print(f"Opening source image: {source_path}")
    try:
        img = Image.open(source_path)
        
        # Convert to RGBA to ensure alpha channel exists
        img = img.convert("RGBA")
        
        # Simple background removal: Convert white (or near white) pixels to transparent
        # This is useful if the source image has a white background
        print("Applying transparency filter (removing white background)...")
        datas = img.getdata()
        new_data = []
        for item in datas:
            # Check if pixel is white (or very light gray)
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0)) # Make transparent
            else:
                new_data.append(item)
        img.putdata(new_data)
        
    except Exception as e:
        print(f"Failed to open image: {e}")
        return

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # 1. Generate PNGs
    sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'apple-touch-icon.png': 180,
        'android-chrome-192x192.png': 192,
        'android-chrome-512x512.png': 512,
    }

    print("Generating PNG files...")
    for filename, size in sizes.items():
        # Resize using LANCZOS for best downscaling quality
        resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
        output_path = os.path.join(output_dir, filename)
        resized_img.save(output_path, 'PNG')
        print(f"  - Created {filename} ({size}x{size})")

    # 2. Generate ICO
    print("Generating favicon.ico...")
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = []
    for size in ico_sizes:
        ico_images.append(img.resize(size, Image.Resampling.LANCZOS))
    
    ico_path = os.path.join(output_dir, 'favicon.ico')
    # Save as ICO with multiple sizes
    ico_images[0].save(
        ico_path,
        'ICO',
        sizes=ico_sizes,
        append_images=ico_images[1:]
    )
    print(f"  - Created favicon.ico with sizes: {ico_sizes}")

    print("\n✅ Favicon processing complete.")

if __name__ == "__main__":
    process_favicon()
