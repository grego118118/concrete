#!/usr/bin/env python3
"""
Create favicon for Concrete Coating Specialists website
Generates multiple favicon formats for cross-browser compatibility
"""

from PIL import Image, ImageDraw
import os

# Create output directory if it doesn't exist
output_dir = "assets/images"
os.makedirs(output_dir, exist_ok=True)

# Brand colors
BLUE_PRIMARY = "#3b82f6"  # Primary blue
BLUE_DARK = "#1e40af"     # Darker blue
WHITE = "#ffffff"
GRAY_DARK = "#1f2937"

# Convert hex to RGB
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

blue_rgb = hex_to_rgb(BLUE_PRIMARY)
blue_dark_rgb = hex_to_rgb(BLUE_DARK)
white_rgb = hex_to_rgb(WHITE)
gray_dark_rgb = hex_to_rgb(GRAY_DARK)

def create_favicon(size):
    """Create a favicon with concrete coating design"""
    # Create image with white background
    img = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw background circle with blue gradient effect (simulated with two circles)
    margin = int(size * 0.05)
    draw.ellipse(
        [(margin, margin), (size - margin, size - margin)],
        fill=blue_rgb,
        outline=blue_dark_rgb,
        width=max(1, int(size * 0.02))
    )
    
    # Draw concrete texture pattern (small squares representing coating)
    texture_size = int(size * 0.08)
    spacing = int(size * 0.12)
    start_x = int(size * 0.15)
    start_y = int(size * 0.15)
    
    for x in range(start_x, size - start_x, spacing):
        for y in range(start_y, size - start_y, spacing):
            # Alternate between white and light blue for texture
            color = white_rgb if (x + y) % (spacing * 2) == 0 else blue_dark_rgb
            draw.rectangle(
                [(x, y), (x + texture_size, y + texture_size)],
                fill=color,
                outline=white_rgb,
                width=max(1, int(size * 0.01))
            )
    
    # Draw a stylized floor/coating representation
    # Draw horizontal lines to represent floor coating
    line_y_start = int(size * 0.35)
    line_y_end = int(size * 0.65)
    line_spacing = int(size * 0.08)
    line_width = max(1, int(size * 0.02))
    
    for y in range(line_y_start, line_y_end, line_spacing):
        draw.line(
            [(int(size * 0.2), y), (int(size * 0.8), y)],
            fill=white_rgb,
            width=line_width
        )
    
    # Draw a small circle in center representing a drop/coating application
    center = size // 2
    drop_radius = int(size * 0.08)
    draw.ellipse(
        [(center - drop_radius, center - drop_radius),
         (center + drop_radius, center + drop_radius)],
        fill=white_rgb,
        outline=white_rgb
    )
    
    return img

# Generate favicons in different sizes
favicon_sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

print("Creating favicon files...")

# Create PNG favicons
for filename, size in favicon_sizes.items():
    img = create_favicon(size)
    filepath = os.path.join(output_dir, filename)
    img.save(filepath, 'PNG')
    print(f"✓ Created {filename} ({size}x{size})")

# Create multi-size ICO file (favicon.ico with 16x16, 32x32, 48x48)
print("\nCreating favicon.ico with multiple sizes...")
ico_sizes = [16, 32, 48]
ico_images = [create_favicon(size) for size in ico_sizes]
ico_path = os.path.join(output_dir, 'favicon.ico')
ico_images[0].save(
    ico_path,
    'ICO',
    sizes=[(size, size) for size in ico_sizes],
    append_images=ico_images[1:]
)
print(f"✓ Created favicon.ico with sizes: {ico_sizes}")

print("\n✅ All favicon files created successfully!")
print(f"\nFiles saved to: {output_dir}/")
print("\nGenerated files:")
for filename in favicon_sizes.keys():
    print(f"  - {filename}")
print(f"  - favicon.ico")

