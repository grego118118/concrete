# Google Maps API Setup Guide

## Overview
Your quote form now includes address validation to ensure leads are from your service area (Western MA and Northern CT). This requires a Google Maps API key.

## Service Area Coverage
The validation checks for these counties:

### Massachusetts
- Hampden County
- Hampshire County
- Franklin County

### Connecticut
- Hartford County
- Tolland County
- Windham County
- Litchfield County

## Step 1: Get a Google Maps API Key

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a project" at the top
- Click "New Project"
- Name it "Pioneer Concrete Coatings Website"
- Click "Create"

### 3. Enable Required APIs
You need to enable **THREE APIs** (this is critical!):
1. **Maps JavaScript API** (core Google Maps platform - REQUIRED!)
2. **Places API** (for address autocomplete)
3. **Geocoding API** (for address validation)

Steps:
- Go to "APIs & Services" → "Library"
- Search for "Maps JavaScript API" and click "Enable" ⚠️ **IMPORTANT!**
- Search for "Places API" and click "Enable"
- Search for "Geocoding API" and click "Enable"

**Note:** If you skip the Maps JavaScript API, you'll get an "ApiNotActivatedMapError" and the autocomplete won't work!

### 4. Create API Key
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "API Key"
- Copy the API key (it will look like: `AIzaSyD...`)

### 5. Restrict Your API Key (IMPORTANT for security)

#### Application Restrictions:
- Click on your API key to edit it
- Under "Application restrictions", select "HTTP referrers (web sites)"
- Add these referrers:
  ```
  https://pioneerconcretecoatings.com/*
  https://*.vercel.app/*
  http://localhost:*
  ```

#### API Restrictions:
- Under "API restrictions", select "Restrict key"
- Select only:
  - Maps JavaScript API ⚠️ **REQUIRED!**
  - Places API
  - Geocoding API

- Click "Save"

## Step 2: Add API Key to Your Website

### Update index.html
Find this line in `index.html` (around line 54):
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places" async defer></script>
```

Replace `YOUR_API_KEY_HERE` with your actual API key:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD...&libraries=places" async defer></script>
```

## Step 3: Deploy to Vercel

```bash
git add index.html
git commit -m "Add Google Maps API key for address validation"
git push origin main
```

Vercel will automatically deploy the changes.

## Pricing Information

### Google Maps API Free Tier
- **Places API Autocomplete**: $2.83 per 1,000 requests
- **Geocoding API**: $5.00 per 1,000 requests
- **Monthly Credit**: $200 free credit per month

### Estimated Usage for Your Site
- Assuming 100 quote requests per month
- Each request uses ~2 API calls (autocomplete + geocoding)
- Total: ~200 API calls/month
- **Estimated Cost**: ~$1.50/month (well within free tier)

The $200/month free credit covers approximately:
- 70,000+ autocomplete requests
- 40,000+ geocoding requests

**You will NOT be charged** unless you exceed the free tier, which is highly unlikely for a small business website.

## Testing the Address Validation

### Test Addresses (Should PASS):

**Western Massachusetts:**
- 1234 Main St, Springfield, MA 01103 (Hampden County)
- 100 Elm St, Northampton, MA 01060 (Hampshire County)
- 50 Federal St, Greenfield, MA 01301 (Franklin County)

**Northern Connecticut:**
- 123 Main St, Hartford, CT 06103 (Hartford County)
- 456 Oak St, Vernon, CT 06066 (Tolland County)
- 789 Maple Ave, Willimantic, CT 06226 (Windham County)

### Test Addresses (Should FAIL):

- 123 Main St, Boston, MA 02108 (Suffolk County - outside service area)
- 456 Elm St, New Haven, CT 06510 (New Haven County - Southern CT)
- 789 Oak St, Providence, RI 02903 (Rhode Island - outside service area)

## How It Works

1. **User starts typing** an address in the "Project Address" field
2. **Google Places Autocomplete** suggests addresses as they type
3. **User selects** an address from the dropdown
4. **Validation runs** automatically to check if the address is in your service area
5. **Green checkmark** appears if address is valid
6. **Red error message** appears if address is outside service area
7. **Form submission** is blocked if address is invalid

## Troubleshooting

### "Address validation not working"
- Check that your API key is correctly added to index.html
- Verify the API key has Places API and Geocoding API enabled
- Check browser console for errors (F12 → Console tab)

### "API key error in console"
- Make sure you've enabled both Places API and Geocoding API
- Check that your domain is added to the HTTP referrers list
- Wait a few minutes after creating the key (can take 5-10 minutes to activate)

### "All addresses showing as invalid"
- Check the county names in the validation code match Google's format
- Verify the service area counties list is correct

## Support

If you need help setting this up, contact Google Cloud Support or refer to:
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding)

