# Google Maps API Key Security Guide

## ✅ Your API Key is Safe - Here's Why

### The Short Answer:
**Google Maps API keys are DESIGNED to be public and visible in client-side code.** This is not a security risk when properly configured.

---

## 🔐 How Google Maps API Keys Work

### Different from Server-Side API Keys
Unlike server-side API keys (AWS, database credentials, etc.), Google Maps API keys are **meant to be exposed** in the browser. Google knows this and has built security into the API key system itself.

### Security Through Restrictions (Not Obscurity)
Google Maps API keys are secured through:
1. **HTTP Referrer Restrictions** - Only your domains can use the key
2. **API Restrictions** - Only specific Google APIs can be called
3. **Usage Quotas** - Automatic limits prevent abuse
4. **Billing Alerts** - Get notified if usage spikes

---

## ❌ Common Misconceptions

### Myth 1: "API keys should never be visible"
**Reality:** This applies to SERVER-SIDE keys only. Client-side API keys (like Google Maps) are designed to be public.

### Myth 2: "Someone can steal my key and rack up charges"
**Reality:** With proper restrictions, your key ONLY works on YOUR domains. Even if someone copies it, they can't use it on their site.

### Myth 3: "I should use environment variables to hide it"
**Reality:** In a static HTML site, environment variables don't work. The HTML is sent directly to the browser, so any key will be visible anyway.

---

## ✅ Proper Security Configuration

### Step 1: Set HTTP Referrer Restrictions

This is the MOST IMPORTANT security measure. It ensures your key only works on your domains.

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
4. Add these referrers:
   ```
   https://pioneerconcretecoatings.com/*
   https://*.vercel.app/*
   http://localhost:*
   http://localhost:8000/*
   ```
5. Click **"Save"**

**What this does:** Your API key will ONLY work on these domains. If someone copies your key and tries to use it on `https://their-malicious-site.com`, it will be rejected by Google.

### Step 2: Set API Restrictions

Limit which Google APIs can be called with this key.

1. Under **"API restrictions"**, select **"Restrict key"**
2. Check ONLY these APIs:
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Geocoding API
3. Click **"Save"**

**What this does:** Even if someone somehow bypasses the referrer restrictions, they can only use these specific APIs, not other Google services.

### Step 3: Set Usage Quotas

Prevent unexpected charges from abuse or bugs.

1. Go to [Google Cloud Console - Quotas](https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas)
2. Set daily quotas for each API:
   - **Places API**: 1,000 requests/day (more than enough for your site)
   - **Geocoding API**: 1,000 requests/day
   - **Maps JavaScript API**: 10,000 loads/day

**What this does:** Even if there's a bug or unusual traffic, you won't exceed these limits.

### Step 4: Set Billing Alerts

Get notified if costs exceed expectations.

1. Go to [Google Cloud Console - Billing](https://console.cloud.google.com/billing)
2. Click "Budgets & alerts"
3. Create a budget alert for $10/month
4. Set email notifications

**What this does:** You'll get an email if your usage approaches $10/month (which is unlikely given your traffic).

---

## 📊 Current Status Check

Let's verify your API key is properly secured:

### ✅ Checklist:
- [ ] HTTP referrer restrictions are set (pioneerconcretecoatings.com, *.vercel.app, localhost)
- [ ] API restrictions are set (Maps JavaScript API, Places API, Geocoding API only)
- [ ] Usage quotas are configured
- [ ] Billing alerts are set up
- [ ] Maps JavaScript API is enabled (fixes the autocomplete issue)
- [ ] Places API is enabled
- [ ] Geocoding API is enabled

---

## 🚫 Why Environment Variables Don't Work for Static Sites

### The Problem:
Your site is a **static HTML site** - the HTML files are served directly to the browser without any server-side processing.

### What Happens:
```html
<!-- This doesn't work in static HTML -->
<script src="...?key=${GOOGLE_MAPS_API_KEY}"></script>
```

The browser receives this EXACTLY as written. There's no server to replace `${GOOGLE_MAPS_API_KEY}` with the actual key.

### The Reality:
**Any API key used in client-side JavaScript MUST be visible in the browser.** There's no way around this. Even if you use environment variables with a build tool, the final HTML sent to the browser will contain the key in plain text.

---

## 🛠️ Alternative: Using a Build Tool (Optional, Not Recommended)

If you REALLY want to use environment variables (though it's unnecessary), you'd need to:

### Option 1: Use Vite or Webpack
1. Convert your static site to use a build tool
2. Create a `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyAPV9GVBwLktmWPKyn90lk1zOtZ7X_n9d0
   ```
3. Reference it in your code:
   ```javascript
   const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
   ```
4. Build the site before deploying

**Result:** The final HTML will STILL contain the key in plain text. You've just added complexity for no security benefit.

### Option 2: Use a Proxy Server
1. Create a backend API endpoint that calls Google Maps
2. Your frontend calls your backend
3. Your backend uses a server-side API key

**Result:** This works, but adds significant complexity and cost (need a server). Only worth it for server-side APIs, not client-side ones like Google Maps.

---

## ✅ Recommended Approach: Keep It Simple

### What You Should Do:
1. ✅ **Keep the API key in the HTML** (current approach)
2. ✅ **Set HTTP referrer restrictions** (most important!)
3. ✅ **Set API restrictions**
4. ✅ **Set usage quotas**
5. ✅ **Set billing alerts**
6. ✅ **Monitor usage monthly**

### What You Should NOT Do:
1. ❌ Try to hide the key with environment variables (doesn't work for static sites)
2. ❌ Worry about the key being visible (it's designed to be)
3. ❌ Over-complicate with build tools (unnecessary)

---

## 📈 Monitoring Your API Usage

### Check Usage Regularly:
1. Go to [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. Click on each API to see usage graphs
3. Look for unusual spikes

### Expected Usage for Your Site:
- **100-200 quote requests/month** = ~200-400 API calls/month
- **Cost:** $0-2/month (well within free tier)
- **Free tier:** $200/month credit

---

## 🔒 What If Someone Copies Your Key?

### Scenario: A malicious user copies your API key from your HTML

**What happens:**
1. They try to use it on their website: `https://their-site.com`
2. Google checks the HTTP referrer
3. Google sees the request is from `their-site.com`
4. Google checks your restrictions: Only `pioneerconcretecoatings.com` and `*.vercel.app` are allowed
5. **Google rejects the request** with an error

**Result:** Your key is useless to them. No charges to you.

---

## 📝 Summary

### Your Current Setup:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAPV9GVBwLktmWPKyn90lk1zOtZ7X_n9d0&libraries=places&callback=initGoogleMaps" async defer></script>
```

### Is This Safe?
**YES!** As long as you have proper restrictions configured.

### Action Items:
1. **Enable Maps JavaScript API** (fixes autocomplete issue)
2. **Set HTTP referrer restrictions** (critical for security)
3. **Set API restrictions** (limit to 3 APIs only)
4. **Set usage quotas** (prevent unexpected charges)
5. **Set billing alerts** (get notified of unusual usage)

---

## 🎯 Next Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps JavaScript API** (fixes autocomplete)
3. Configure restrictions on your API key
4. Test the autocomplete on your site
5. Monitor usage monthly

**Your API key is safe in the HTML. Focus on proper restrictions, not hiding the key.**

