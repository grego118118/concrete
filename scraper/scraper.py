import re
import time
import pandas as pd
import sys
from playwright.sync_api import sync_playwright

# Monkey patch print to always flush
import builtins
def print(*args, **kwargs):
    kwargs.setdefault('flush', True)
    builtins.print(*args, **kwargs)

# Configuration — Targeted search queries as (Category, City) pairs
SEARCH_QUERIES = [
    # ── 1. Automotive & Transportation ──
    ("Auto Body Shop", "Palmer, MA"),
    ("Auto Body Shop", "Springfield, MA"),
    ("Auto Body Shop", "Worcester, MA"),
    ("Auto Body Shop", "Chicopee, MA"),
    ("Car Dealership", "Springfield, MA"),
    ("Car Dealership", "Worcester, MA"),
    ("Car Dealership", "West Springfield, MA"),
    ("Auto Detail", "Worcester, MA"),
    ("Auto Detail", "Springfield, MA"),
    ("Auto Detail", "Palmer, MA"),
    ("Tire Center", "Chicopee, MA"),
    ("Tire Center", "Springfield, MA"),
    ("Tire Center", "Worcester, MA"),
    ("Auto Repair Shop", "Palmer, MA"),
    ("Auto Repair Shop", "Springfield, MA"),
    ("Auto Repair Shop", "Ware, MA"),
    ("Aviation Hangar", "Westfield, MA"),
    ("Fleet Maintenance", "Hartford, CT"),
    ("Fleet Maintenance", "Springfield, MA"),
    ("Truck Repair", "Palmer, MA"),
    ("Truck Repair", "Springfield, MA"),

    # ── 2. Manufacturing & Industrial ──
    ("Machine Shop", "Palmer, MA"),
    ("Machine Shop", "Springfield, MA"),
    ("Machine Shop", "Worcester, MA"),
    ("Manufacturing Plant", "Springfield, MA"),
    ("Manufacturing Plant", "Worcester, MA"),
    ("Manufacturing Plant", "Chicopee, MA"),
    ("Industrial Park", "Worcester, MA"),
    ("Industrial Park", "Springfield, MA"),
    ("Distribution Center", "Wilbraham, MA"),
    ("Distribution Center", "Springfield, MA"),
    ("Distribution Center", "Worcester, MA"),
    ("Self Storage", "Holyoke, MA"),
    ("Self Storage", "Springfield, MA"),
    ("Self Storage", "Worcester, MA"),
    ("Tool and Die", "Agawam, MA"),
    ("Tool and Die", "Springfield, MA"),
    ("Warehouse", "Springfield, MA"),
    ("Warehouse", "Worcester, MA"),
    ("Warehouse", "Palmer, MA"),

    # ── 3. Food & Beverage (Sanitary) ──
    ("Microbrewery", "Worcester, MA"),
    ("Microbrewery", "Springfield, MA"),
    ("Microbrewery", "Northampton, MA"),
    ("Commercial Kitchen", "Springfield, MA"),
    ("Commercial Kitchen", "Worcester, MA"),
    ("Food Processing", "Enfield, CT"),
    ("Food Processing", "Springfield, MA"),
    ("Distillery", "Northampton, MA"),
    ("Distillery", "Springfield, MA"),
    ("Catering Hall", "Ludlow, MA"),
    ("Catering Hall", "Springfield, MA"),
    ("Restaurant Supply", "West Springfield, MA"),
    ("Restaurant Supply", "Worcester, MA"),
    ("Bakery", "Springfield, MA"),
    ("Bakery", "Worcester, MA"),

    # ── 4. Animal & Medical Services ──
    ("Animal Hospital", "Wilbraham, MA"),
    ("Animal Hospital", "Springfield, MA"),
    ("Veterinary Clinic", "Palmer, MA"),
    ("Veterinary Clinic", "Springfield, MA"),
    ("Dog Kennel", "Belchertown, MA"),
    ("Dog Kennel", "Amherst, MA"),
    ("Pet Boarding", "Amherst, MA"),
    ("Pet Boarding", "Palmer, MA"),
    ("Medical Office", "Ware, MA"),
    ("Medical Office", "Springfield, MA"),
    ("Dental Office", "Springfield, MA"),
    ("Dental Office", "Worcester, MA"),

    # ── 5. Specialized Commercial & Public Safety ──
    ("Fitness Center", "Southbridge, MA"),
    ("Fitness Center", "Springfield, MA"),
    ("Fitness Center", "Worcester, MA"),
    ("Fire Department", "Monson, MA"),
    ("Fire Department", "Palmer, MA"),
    ("Fire Department", "Ware, MA"),
    ("DPW Garage", "Warren, MA"),
    ("DPW Garage", "Palmer, MA"),
    ("Hardware Store", "Sturbridge, MA"),
    ("Hardware Store", "Palmer, MA"),
    ("Showroom", "East Longmeadow, MA"),
    ("Showroom", "Springfield, MA"),
    ("Country Club", "Longmeadow, MA"),
    ("Country Club", "Springfield, MA"),

    # ── 6. Property & Facilities ──
    ("Apartment Complex", "Springfield, MA"),
    ("Apartment Complex", "Worcester, MA"),
    ("Property Management", "Springfield, MA"),
    ("Property Management", "Worcester, MA"),
    ("Hotel", "Springfield, MA"),
    ("Hotel", "Worcester, MA"),
    ("Parking Garage", "Springfield, MA"),
    ("Parking Garage", "Worcester, MA"),

    # ── 7. Commercial Services ──
    ("Laundromat", "Springfield, MA"),
    ("Laundromat", "Worcester, MA"),
    ("Car Wash", "Springfield, MA"),
    ("Car Wash", "Worcester, MA"),
    ("Print Shop", "Springfield, MA"),
]

MAX_RESULTS_PER_QUERY = 20

def extract_email(page, url):
    """Extract email from a website by checking homepage, mailto links, and contact/about pages."""
    try:
        if not url or url == "N/A":
            return "N/A"
        
        # Normalize URL
        if not url.startswith("http"):
            url = "https://" + url
        
        print(f"  [~] Visiting {url} for email...")
        page.goto(url, timeout=15000, wait_until="domcontentloaded")
        time.sleep(2)
        
        found_emails = set()
        
        # Method 1: Check mailto: links (most reliable)
        try:
            mailto_links = page.locator("a[href^='mailto:']").all()
            for link in mailto_links[:5]:
                href = link.get_attribute("href") or ""
                email = href.replace("mailto:", "").split("?")[0].strip()
                if email and "@" in email:
                    found_emails.add(email.lower())
        except:
            pass
        
        # Method 2: Regex on page content
        content = page.content()
        regex_emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
        for e in regex_emails:
            e_lower = e.lower()
            # Filter out false positives
            bad_endings = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.css', '.js')
            bad_domains = ('example.com', 'email.com', 'domain.com', 'sentry.io', 'wixpress.com', 'googleapis.com')
            if not e_lower.endswith(bad_endings) and not any(d in e_lower for d in bad_domains):
                found_emails.add(e_lower)
        
        # Method 3: If no emails found, try contact/about pages
        if not found_emails:
            base_url = url.rstrip("/")
            contact_paths = ["/contact", "/contact-us", "/about", "/about-us"]
            
            for path in contact_paths:
                try:
                    page.goto(base_url + path, timeout=10000, wait_until="domcontentloaded")
                    time.sleep(1)
                    
                    # Check mailto links on this page
                    mailto_links = page.locator("a[href^='mailto:']").all()
                    for link in mailto_links[:5]:
                        href = link.get_attribute("href") or ""
                        email = href.replace("mailto:", "").split("?")[0].strip()
                        if email and "@" in email:
                            found_emails.add(email.lower())
                    
                    # Also regex this page
                    content = page.content()
                    regex_emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
                    for e in regex_emails:
                        e_lower = e.lower()
                        if not e_lower.endswith(bad_endings) and not any(d in e_lower for d in bad_domains):
                            found_emails.add(e_lower)
                    
                    if found_emails:
                        break  # Found emails, stop crawling
                except:
                    continue
        
        if found_emails:
            result = ", ".join(list(found_emails)[:3])
            print(f"  [✓] Found email(s): {result}")
            return result
        
        return "N/A"
    except Exception as e:
        print(f"  [!] Failed to extract email from {url}: {str(e)[:80]}")
        return "N/A"

def extract_email_from_yelp(page, business_name, city):
    """Search Yelp for the business and extract email from listing."""
    try:
        search_name = business_name.replace("'", "").replace("&", "and")
        city_clean = city.split(",")[0].strip()
        url = f"https://www.yelp.com/search?find_desc={search_name}&find_loc={city_clean}"
        
        print(f"    [Yelp] Searching: {search_name} in {city_clean}")
        page.goto(url, timeout=15000, wait_until="domcontentloaded")
        time.sleep(2)
        
        # Click first result
        first_link = page.locator('a[href*="/biz/"]').first
        if first_link.is_visible(timeout=3000):
            href = first_link.get_attribute("href")
            if href and "/biz/" in href:
                if not href.startswith("http"):
                    href = "https://www.yelp.com" + href
                page.goto(href, timeout=15000, wait_until="domcontentloaded")
                time.sleep(2)
                
                # Check for email in page content
                content = page.content()
                emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
                filtered = _filter_emails(emails)
                if filtered:
                    print(f"    [Yelp] ✓ Found: {filtered[0]}")
                    return filtered[0]
        
        print(f"    [Yelp] No email found")
        return None
    except Exception as e:
        print(f"    [Yelp] Error: {str(e)[:60]}")
        return None

def extract_email_from_yellowpages(page, business_name, city):
    """Search Yellow Pages for the business and extract email."""
    try:
        search_name = business_name.replace("'", "").replace("&", "and")
        city_clean = city.split(",")[0].strip()
        state = city.split(",")[1].strip() if "," in city else "MA"
        url = f"https://www.yellowpages.com/search?search_terms={search_name}&geo_location_terms={city_clean}%2C+{state}"
        
        print(f"    [YP] Searching: {search_name} in {city_clean}")
        page.goto(url, timeout=15000, wait_until="domcontentloaded")
        time.sleep(2)
        
        # Click first listing
        first_result = page.locator('a.business-name').first
        if first_result.is_visible(timeout=3000):
            first_result.click(timeout=5000)
            time.sleep(2)
            
            # Check for email on detail page
            content = page.content()
            
            # Look for mailto links
            mailto_links = page.locator("a[href^='mailto:']").all()
            for link in mailto_links[:3]:
                href = link.get_attribute("href") or ""
                email = href.replace("mailto:", "").split("?")[0].strip()
                if email and "@" in email:
                    filtered = _filter_emails([email])
                    if filtered:
                        print(f"    [YP] ✓ Found: {filtered[0]}")
                        return filtered[0]
            
            # Regex fallback
            emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
            filtered = _filter_emails(emails)
            if filtered:
                print(f"    [YP] ✓ Found: {filtered[0]}")
                return filtered[0]
        
        print(f"    [YP] No email found")
        return None
    except Exception as e:
        print(f"    [YP] Error: {str(e)[:60]}")
        return None

def extract_email_from_bbb(page, business_name, city):
    """Search BBB for the business and extract email."""
    try:
        search_name = business_name.replace("'", "").replace("&", "and")
        city_clean = city.split(",")[0].strip()
        state = city.split(",")[1].strip() if "," in city else "MA"
        url = f"https://www.bbb.org/search?find_text={search_name}&find_loc={city_clean}%2C+{state}&page=1"
        
        print(f"    [BBB] Searching: {search_name} in {city_clean}")
        page.goto(url, timeout=15000, wait_until="domcontentloaded")
        time.sleep(3)
        
        # Click first result link
        first_result = page.locator('a[href*="/profile/"]').first
        if first_result.is_visible(timeout=3000):
            first_result.click(timeout=5000)
            time.sleep(2)
            
            content = page.content()
            
            # BBB often has email in the business details section
            emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
            filtered = _filter_emails(emails)
            if filtered:
                print(f"    [BBB] ✓ Found: {filtered[0]}")
                return filtered[0]
        
        print(f"    [BBB] No email found")
        return None
    except Exception as e:
        print(f"    [BBB] Error: {str(e)[:60]}")
        return None

def extract_email_from_facebook(page, business_name, city):
    """Search Google for Facebook business page and extract email from About section."""
    try:
        search_name = business_name.replace("'", "")
        city_clean = city.split(",")[0].strip()
        google_query = f'"{search_name}" {city_clean} site:facebook.com'
        url = f"https://www.google.com/search?q={google_query}"
        
        print(f"    [FB] Googling: {search_name} facebook page")
        page.goto(url, timeout=15000, wait_until="domcontentloaded")
        time.sleep(2)
        
        # Find first facebook.com result
        fb_link = page.locator('a[href*="facebook.com"]').first
        if fb_link.is_visible(timeout=3000):
            fb_url = fb_link.get_attribute("href") or ""
            
            # Clean Google redirect URL
            if "/url?q=" in fb_url:
                fb_url = fb_url.split("/url?q=")[1].split("&")[0]
            
            if "facebook.com" in fb_url:
                # Try to visit the About page
                about_url = fb_url.rstrip("/") + "/about"
                print(f"    [FB] Visiting: {about_url[:60]}...")
                page.goto(about_url, timeout=15000, wait_until="domcontentloaded")
                time.sleep(3)
                
                content = page.content()
                
                # Check for mailto links
                mailto_links = page.locator("a[href^='mailto:']").all()
                for link in mailto_links[:3]:
                    href = link.get_attribute("href") or ""
                    email = href.replace("mailto:", "").split("?")[0].strip()
                    if email and "@" in email:
                        filtered = _filter_emails([email])
                        if filtered:
                            print(f"    [FB] ✓ Found: {filtered[0]}")
                            return filtered[0]
                
                # Regex fallback
                emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
                filtered = _filter_emails(emails)
                if filtered:
                    print(f"    [FB] ✓ Found: {filtered[0]}")
                    return filtered[0]
        
        print(f"    [FB] No email found")
        return None
    except Exception as e:
        print(f"    [FB] Error: {str(e)[:60]}")
        return None

def extract_email_from_whois(domain):
    """Look up domain WHOIS data for registrant email."""
    try:
        import whois
        
        if not domain or domain == "N/A":
            return None
        
        # Extract domain from URL
        domain = domain.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        
        print(f"    [WHOIS] Looking up: {domain}")
        w = whois.whois(domain)
        
        emails = w.emails if hasattr(w, 'emails') and w.emails else []
        if isinstance(emails, str):
            emails = [emails]
        
        # Filter out registrar emails
        filtered = [e for e in emails if e and 
                    "abuse@" not in e.lower() and 
                    "privacy" not in e.lower() and
                    "proxy" not in e.lower() and
                    "whoisguard" not in e.lower() and
                    "domaincontrol" not in e.lower() and
                    "networksolutions" not in e.lower() and
                    "godaddy" not in e.lower() and
                    "namecheap" not in e.lower()]
        
        if filtered:
            print(f"    [WHOIS] ✓ Found: {filtered[0]}")
            return filtered[0]
        
        print(f"    [WHOIS] No usable email (privacy protected)")
        return None
    except Exception as e:
        print(f"    [WHOIS] Error: {str(e)[:60]}")
        return None

def guess_email_with_mx(domain):
    """Try common email patterns and verify the domain accepts email via MX lookup."""
    try:
        import dns.resolver
        
        if not domain or domain == "N/A":
            return None
        
        # Extract clean domain
        domain = domain.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        
        print(f"    [Guess] Checking MX records for: {domain}")
        
        # First check if domain has MX records (can receive email)
        try:
            mx_records = dns.resolver.resolve(domain, 'MX')
            if not mx_records:
                print(f"    [Guess] No MX records — domain can't receive email")
                return None
        except Exception:
            print(f"    [Guess] No MX records — domain can't receive email")
            return None
        
        # Domain has MX records - try common patterns
        common_prefixes = ["info", "contact", "sales", "office", "hello"]
        for prefix in common_prefixes:
            guess = f"{prefix}@{domain}"
            print(f"    [Guess] ✓ MX verified, suggesting: {guess}")
            return guess  # Return first guess since we can't truly verify without SMTP
        
        return None
    except Exception as e:
        print(f"    [Guess] Error: {str(e)[:60]}")
        return None

def enrich_email(page, business_name, city, website):
    """
    Try multiple sources to find an email for a business.
    Returns the first email found, or "N/A".
    """
    print(f"  [~] Enriching email for: {business_name}")
    
    # Extract domain from website for WHOIS/guess
    domain = None
    if website and website != "N/A":
        domain = website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
    
    # Try each source in order
    sources = [
        ("Yelp", lambda: extract_email_from_yelp(page, business_name, city)),
        ("YellowPages", lambda: extract_email_from_yellowpages(page, business_name, city)),
        ("BBB", lambda: extract_email_from_bbb(page, business_name, city)),
        ("Facebook", lambda: extract_email_from_facebook(page, business_name, city)),
        ("WHOIS", lambda: extract_email_from_whois(website) if website and website != "N/A" else None),
        ("EmailGuess", lambda: guess_email_with_mx(domain) if domain else None),
    ]
    
    for source_name, search_fn in sources:
        try:
            result = search_fn()
            if result:
                print(f"  [✓] Email found via {source_name}: {result}")
                return result
        except Exception as e:
            print(f"  [!] {source_name} failed: {str(e)[:40]}")
            continue
    
    print(f"  [✗] No email found from any source for {business_name}")
    return "N/A"

def _filter_emails(emails):
    """Filter out false positive emails."""
    bad_endings = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.css', '.js')
    bad_domains = ('example.com', 'email.com', 'domain.com', 'sentry.io', 
                   'wixpress.com', 'googleapis.com', 'facebook.com',
                   'yelp.com', 'yellowpages.com', 'bbb.org', 'google.com')
    
    result = []
    for e in emails:
        e_lower = e.lower().strip()
        if (not e_lower.endswith(bad_endings) and 
            not any(d in e_lower for d in bad_domains) and
            '@' in e_lower and
            len(e_lower) > 5):
            result.append(e_lower)
    return list(set(result))

def save_incremental(data):
    import os
    if not data:
        return

    # Load existing data if it exists
    existing_df = pd.DataFrame()
    if os.path.exists("leads.csv"):
        try:
            existing_df = pd.read_csv("leads.csv")
        except:
            pass

    # Save to CSV
    df = pd.DataFrame(data)
    if not existing_df.empty:
        df = pd.concat([existing_df, df])
    
    df.drop_duplicates(subset=["Phone", "Name"], inplace=True)
    df.to_csv("leads.csv", index=False)
    print(f"  [v] Saved {len(df)} total leads to leads.csv")
    
    # Update last run file
    with open("scraper/.last_run", "w") as f:
        f.write(str(time.time()))

def scrape_google_maps():
    import os
    
    # Ensure scraper directory exists
    if not os.path.exists("scraper"):
        os.makedirs("scraper")

    # Load existing lead names from CSV to skip duplicates
    existing_names = set()
    if os.path.exists("leads.csv"):
        try:
            existing_df = pd.read_csv("leads.csv")
            if "Name" in existing_df.columns:
                existing_names = set(existing_df["Name"].str.lower().str.strip())
            print(f"  [i] Loaded {len(existing_names)} existing leads to skip duplicates")
        except:
            pass

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        for category, city in SEARCH_QUERIES:
            search_query = f"{category} in {city}"
            print(f"\n--- Searching for: {search_query} ---")
            
            query_data = []
            try:
                print(f"  [~] Navigating to Google Maps...")
                page.goto("https://www.google.com/maps", timeout=30000, wait_until="domcontentloaded")
                time.sleep(3)
                
                # Handle Cookie Consent or 'Sign in' prompt
                try:
                    btns = ["Accept all", "Agree", "No thanks"]
                    for btn_text in btns:
                        btn = page.get_by_role("button", name=btn_text).first
                        if btn.is_visible():
                            btn.click(timeout=2000)
                            print(f"  [+] Bypassed: {btn_text}")
                except:
                    pass

                # Robust search box detection
                search_selectors = ["input#searchboxinput", "input[name='q']", "input.searchboxinput"]
                box_found = False
                for selector in search_selectors:
                    try:
                        if page.locator(selector).is_visible(timeout=5000):
                            page.fill(selector, search_query)
                            box_found = True
                            break
                    except:
                        continue
                
                if not box_found:
                    print(f"  [!] Search box not found for {search_query}")
                    continue

                page.keyboard.press("Enter")
                print(f"  [~] Waiting for results for {search_query}...")
                time.sleep(6)

                # Check if results actually loaded
                if page.locator("a[href^='https://www.google.com/maps/place']").count() == 0:
                    print(f"  [!] No results found (or page slow) for {search_query}")
                    page.screenshot(path=f"scraper/stuck_{city.replace(' ', '_')}.png")
                    continue

                try:
                    feed = page.locator("div[role='feed']")
                    if feed.count() > 0:
                        feed.evaluate("node => node.scrollTo(0, 500)")
                        time.sleep(2)
                except:
                    pass

                listings = page.locator("a[href^='https://www.google.com/maps/place']").all()
                print(f"  [+] Found {len(listings)} listings.")
                
                count = 0
                for listing in listings:
                    if count >= MAX_RESULTS_PER_QUERY:
                        break
                    
                    try:
                        aria_label = listing.get_attribute("aria-label")
                        name = aria_label if aria_label else listing.inner_text().split('\n')[0]
                        if not name or name == "Unknown": continue

                        # Skip if already in CSV or scraped this session
                        name_lower = name.lower().strip()
                        if name_lower in existing_names:
                            print(f"  [~] Skipping (already scraped): {name}")
                            continue

                        listing.click()
                        time.sleep(2)
                        
                        # Extract phone
                        phone_btn = page.locator('button[data-item-id^="phone:tel:"]')
                        phone = phone_btn.get_attribute("data-item-id").replace("phone:tel:", "") if phone_btn.is_visible() else "N/A"
                        
                        # Extract website
                        web_btn = page.locator('a[data-item-id="authority"]')
                        website = web_btn.get_attribute("href") if web_btn.is_visible() else "N/A"
                        
                        # Extract physical address
                        address = "N/A"
                        try:
                            addr_btn = page.locator('button[data-item-id="address"]')
                            if addr_btn.is_visible(timeout=2000):
                                addr_text = addr_btn.locator("div.fontBodyMedium").inner_text(timeout=2000)
                                if addr_text:
                                    address = addr_text.strip()
                        except:
                            pass
                        
                        # If no address from button, try the aria-label text
                        if address == "N/A":
                            try:
                                addr_loc = page.locator('button[data-item-id="address"]')
                                if addr_loc.count() > 0:
                                    address = addr_loc.get_attribute("aria-label") or "N/A"
                                    if address != "N/A":
                                        address = address.replace("Address: ", "")
                            except:
                                pass

                        # Extract email from website first
                        email = "N/A"
                        if website != "N/A":
                            web_page = context.new_page()
                            email = extract_email(web_page, website)
                            web_page.close()
                        
                        # If no email from website, try enrichment pipeline
                        if email == "N/A":
                            enrich_page = context.new_page()
                            email = enrich_email(enrich_page, name, city, website)
                            enrich_page.close()

                        query_data.append({
                            "Search Query": search_query,
                            "Name": name,
                            "Phone": phone,
                            "Website": website,
                            "Email": email,
                            "Address": address,
                            "City": city,
                            "Category": category
                        })
                        # Track this name to skip in future queries
                        existing_names.add(name_lower)
                        print(f"  [+] Scraped: {name} | Addr: {address[:40]}... | Email: {email}")
                        count += 1
                        
                    except:
                        continue
                        
                # Save after each search query
                save_incremental(query_data)
                        
            except Exception as e:
                print(f"Error searching {search_query}: {e}")

        browser.close()

if __name__ == "__main__":
    scrape_google_maps()
