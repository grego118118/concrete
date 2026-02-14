
import os
import re

file_path = "index.html"

# Read as latin-1 to consume all bytes
with open(file_path, "r", encoding="latin-1") as f:
    content = f.read()

# Define control characters to remove
# ASCII controls: 0-31 (except 9, 10, 13 i.e., tab, newline, CR)
# DEL: 127
# C1 controls: 128-159
def clean_text(text):
    safe_chars = []
    for char in text:
        cp = ord(char)
        if (0 <= cp <= 31 and cp not in [9, 10, 13]) or (127 <= cp <= 159):
            continue
        safe_chars.append(char)
    return "".join(safe_chars)

cleaned_content = clean_text(content)

# Write back as clean UTF-8
with open(file_path, "w", encoding="utf-8") as f:
    f.write(cleaned_content)

print("Aggressively cleaned index.html")
