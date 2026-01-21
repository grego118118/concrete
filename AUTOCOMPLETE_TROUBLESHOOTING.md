# Google Maps Autocomplete Troubleshooting Guide

**Issue:** Autocomplete dropdown not appearing when typing in the address field

---

## 🔍 Step 1: Check Browser Console

Open your browser's Developer Console (F12) and look for these messages:

### ✅ Expected Success Messages:
```
Initializing Google Places Autocomplete (New API 2025)
Loading Places library...
Places library loaded successfully
Fetching suggestions for: 4 old jarvis ave
Received suggestions: [...]
```

### ❌ Possible Error Messages:

#### Error 1: API Key Issues
```
Google Maps JavaScript API error: RefererNotAllowedMapError
```
**Solution:** Update HTTP referrer restrictions in Google Cloud Console

#### Error 2: API Not Enabled
```
Google Maps JavaScript API error: ApiNotActivatedMapError
```
**Solution:** Enable "Places API (New)" in Google Cloud Console

#### Error 3: Billing Not Set Up
```
Google Maps JavaScript API error: BillingNotEnabledMapError
```
**Solution:** Set up billing in Google Cloud Console

#### Error 4: API Not Loaded
```
Google Maps API not loaded yet
```
**Solution:** Wait for page to fully load, or check internet connection

---

## 🛠️ Step 2: Verify Google Cloud Console Settings

### Required APIs (Must be ENABLED):
1. ✅ **Maps JavaScript API**
2. ✅ **Places API (New)** ← CRITICAL!
3. ✅ **Geocoding API**

### Check API Key Restrictions:

#### HTTP Referrers (Application Restrictions):
```
https://www.pioneerconcretecoatings.com/*
https://pioneerconcretecoatings.com/*
https://*.vercel.app/*
http://localhost:*
http://127.0.0.1:*
```

#### API Restrictions:
- Select "Restrict key"
- Enable ONLY the 3 APIs listed above

---

## 🧪 Step 3: Test with Console Commands

Open browser console (F12) and run these commands:

### Test 1: Check if Google Maps is loaded
```javascript
console.log(typeof google !== 'undefined' && google.maps ? 'Google Maps loaded ✅' : 'Google Maps NOT loaded ❌');
```

### Test 2: Check if Places library is available
```javascript
google.maps.importLibrary('places').then(() => console.log('Places library available ✅')).catch(e => console.error('Places library error:', e));
```

### Test 3: Manually trigger autocomplete
```javascript
// Type this in console after typing in the address field
document.querySelector('#address').dispatchEvent(new Event('input'));
```

---

## 🔧 Step 4: Common Issues & Solutions

### Issue 1: Dropdown Not Appearing

**Symptoms:**
- No dropdown shows when typing
- Console shows "Fetching suggestions" but no "Received suggestions"

**Possible Causes:**
1. **API Key Restrictions:** Referrer not allowed
2. **API Not Enabled:** Places API (New) not activated
3. **Network Issue:** Requests being blocked

**Solution:**
1. Check browser Network tab (F12 → Network)
2. Look for requests to `maps.googleapis.com`
3. Check if they return 200 OK or error codes

---

### Issue 2: "No suggestions returned"

**Symptoms:**
- Console shows "Received suggestions: []"
- Empty array returned

**Possible Causes:**
1. **Address too vague:** Need at least 3 characters
2. **No matches:** Address doesn't exist
3. **Region restriction:** Only searching in US

**Solution:**
- Try typing a complete address: "123 Main Street, Worcester, MA"
- Make sure it's a US address

---

### Issue 3: API Key Errors

**Symptoms:**
- Red error messages in console
- "RefererNotAllowedMapError" or similar

**Solution:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your API key: `AIzaSyAPV9GVBwLktmWPKyn90lk1zOtZ7X_n9d0`
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain: `https://www.pioneerconcretecoatings.com/*`
4. Under "API restrictions":
   - Select "Restrict key"
   - Enable: Maps JavaScript API, Places API (New), Geocoding API
5. Click "Save"
6. Wait 5 minutes for changes to propagate

---

## 📊 Debugging Checklist

Run through this checklist:

- [ ] Open browser console (F12)
- [ ] Refresh page (Ctrl + Shift + R to clear cache)
- [ ] Look for "Initializing Google Places Autocomplete (New API 2025)"
- [ ] Look for "Places library loaded successfully"
- [ ] Type at least 3 characters in address field
- [ ] Look for "Fetching suggestions for: [your text]"
- [ ] Look for "Received suggestions: [...]"
- [ ] Check if dropdown appears visually

**If any step fails, note which one and check the corresponding solution above.**

---

## 🚨 Critical Settings to Verify

### 1. Google Cloud Console
- [ ] Billing account set up
- [ ] Places API (New) enabled
- [ ] Maps JavaScript API enabled
- [ ] Geocoding API enabled
- [ ] API key has correct HTTP referrers
- [ ] API key has correct API restrictions

### 2. Browser
- [ ] JavaScript enabled
- [ ] No ad blocker blocking Google Maps
- [ ] Console shows no red errors
- [ ] Network tab shows successful API calls

### 3. Code
- [ ] Google Maps script tag present in HTML
- [ ] API key is correct
- [ ] initAutocomplete() is being called
- [ ] Address input field exists with id="address"

---

## 📝 What to Share for Help

If you need help, share these details:

1. **Console Messages:** Copy all messages from browser console
2. **Network Errors:** Screenshot of Network tab showing failed requests
3. **API Key Status:** Confirm which APIs are enabled
4. **Test Results:** Results from the console commands in Step 3

---

## ✅ Expected Behavior

When working correctly, you should see:

1. **Console:**
   ```
   Initializing Google Places Autocomplete (New API 2025)
   Loading Places library...
   Places library loaded successfully
   Fetching suggestions for: 4 old jarvis ave
   Received suggestions: Array(5) [...]
   ```

2. **Visual:**
   - White dropdown appears below address field
   - Shows 5-10 address suggestions
   - Suggestions are clickable
   - Selecting one fills the address field

3. **Validation:**
   - After selecting address, validation message appears
   - Either green checkmark (in service area) or red X (outside area)

---

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Places API (New) Documentation](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

