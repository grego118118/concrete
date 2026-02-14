from scraper import scrape_google_maps
import scraper

# Override for testing
scraper.CITIES = ["Palmer, MA"]
scraper.CATEGORIES = ["Auto body shop"]
scraper.MAX_RESULTS_PER_QUERY = 2

if __name__ == "__main__":
    print("Running test scrape...")
    scrape_google_maps()
    print("Test complete.")
