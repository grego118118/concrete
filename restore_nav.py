
import os

file_path = "index.html"

with open(file_path, "r", encoding="latin-1") as f:
    content = f.read()

# 1. Restore Dropdown
dropdown_html = """                <div class="relative group h-full">
                    <button class="nav-link hover:text-blue-500 transition duration-300 flex items-center h-full py-2">
                        Service Areas
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7">
                            </path>
                        </svg>
                    </button>
                    <!-- Enhanced Dropdown with Bridge -->
                    <div
                        class="absolute left-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 z-50">
                        <div class="bg-white rounded-md shadow-xl border border-blue-100 py-2">
                            <a href="locations/garage-floor-coating-longmeadow-ma.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Longmeadow,
                                MA</a>
                            <a href="locations/garage-floor-coating-simsbury-ct.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Simsbury,
                                CT</a>
                            <a href="locations/garage-floor-coating-glastonbury-ct.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Glastonbury,
                                CT</a>
                            <a href="locations/garage-floor-coating-avon-ct.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Avon,
                                CT</a>
                            <a href="locations/garage-floor-coating-farmington-ct.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Farmington,
                                CT</a>
                            <a href="locations/garage-floor-coating-wilbraham-ma.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Wilbraham,
                                MA</a>
                            <a href="locations/garage-floor-coating-southampton-ma.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Southampton,
                                MA</a>
                            <a href="locations/garage-floor-coating-sturbridge-ma.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Sturbridge,
                                MA</a>
                            <a href="locations/garage-floor-coating-hadley-ma.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Hadley,
                                MA</a>
                            <a href="locations/garage-floor-coating-deerfield-ma.html"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Deerfield,
                                MA</a>
                        </div>
                    </div>
                </div>"""

target_dropdown = '<a href="#home" class="nav-link hover:text-blue-500 transition duration-300">Home</a>'
if "Service Areas" not in content and target_dropdown in content:
    content = content.replace(target_dropdown, target_dropdown + "\n" + dropdown_html)
    print("Restored Dropdown")

# 2. Restore Desktop Blog Link
target_desktop_blog = '<a href="gallery.html" class="nav-link hover:text-blue-500 transition duration-300">Gallery</a>'
blog_link_desktop = '<a href="blog.html" class="nav-link hover:text-blue-500 transition duration-300">Blog</a>'

if 'href="blog.html"' not in content.split('<div id="desktop-menu"')[1].split('</div>')[0]: 
    content = content.replace(target_desktop_blog, target_desktop_blog + "\n                " + blog_link_desktop)
    print("Restored Desktop Blog Link")

# 3. Restore Mobile Blog Link
target_mobile_blog = '<a href="gallery.html" class="block py-2 px-6 text-sm hover:bg-gray-100 mobile-nav-link">Gallery</a>'
blog_link_mobile = '<a href="blog.html" class="block py-2 px-6 text-sm hover:bg-gray-100 mobile-nav-link">Blog</a>'

if 'href="blog.html"' not in content.split('<div id="mobile-menu"')[1].split('</div>')[0]:
    content = content.replace(target_mobile_blog, target_mobile_blog + "\n            " + blog_link_mobile)
    print("Restored Mobile Blog Link")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
