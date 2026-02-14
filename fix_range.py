
import re

file_path = "index.html"

# Read as utf-8
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace any sequence between 400 and 500 that isn't a digit (handling the corruption)
# The corruption was "400ÃƒÃ‚500" or similar
new_content = re.sub(r'400[^0-9]+500', '400-500', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Fixed 400-500 range in index.html")
