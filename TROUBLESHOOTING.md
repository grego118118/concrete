# Troubleshooting Guide

Common issues and solutions for the Concrete Coating website.

---

## 🖥️ Local Development Issues

### Issue: "npm: command not found"

**Problem**: Node.js is not installed

**Solution**:
1. Download Node.js from nodejs.org
2. Install Node.js (includes npm)
3. Restart terminal/command prompt
4. Try `npm start` again

**Verify Installation**:
```bash
node --version
npm --version
```

---

### Issue: "Port 8000 already in use"

**Problem**: Another application is using port 8000

**Solution Option 1**: Use different port
```bash
npx http-server -p 8001
```

**Solution Option 2**: Kill process using port 8000
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8000
kill -9 <PID>
```

---

### Issue: "Cannot find module 'http-server'"

**Problem**: http-server not installed globally

**Solution**:
```bash
npm install -g http-server
npm start
```

---

### Issue: Website won't load at localhost:8000

**Problem**: Server not running or wrong URL

**Solution**:
1. Check terminal shows "Hit CTRL-C to stop the server"
2. Verify URL is exactly: `http://localhost:8000`
3. Try `http://127.0.0.1:8000`
4. Check firewall isn't blocking port 8000
5. Restart server: `npm start`

---

## 🖼️ Image Issues

### Issue: Images show as broken (X icon)

**Problem**: Image file not found or wrong path

**Solution**:
1. Verify image files exist in `assets/images/`
2. Check file names match exactly (case-sensitive on Mac/Linux)
3. Verify file extensions are correct (.jpg, .png)
4. Check image paths in HTML:
   ```html
   <!-- Correct -->
   <img src="assets/images/hero.jpg" alt="Hero">
   
   <!-- Wrong -->
   <img src="assets/images/hero.JPG" alt="Hero">  <!-- Case mismatch -->
   <img src="images/hero.jpg" alt="Hero">          <!-- Wrong path -->
   ```

**Quick Fix**:
- Use placeholder images temporarily: `https://placehold.co/800x600`
- Replace with real images later

---

### Issue: Images load locally but not on deployed site

**Problem**: File paths are incorrect for deployment

**Solution**:
1. Use relative paths: `assets/images/hero.jpg`
2. Don't use absolute paths: `/assets/images/hero.jpg`
3. Don't use full URLs: `http://example.com/assets/images/hero.jpg`

---

### Issue: Images are too large/slow to load

**Problem**: Image file sizes are too big

**Solution**:
1. Compress images using:
   - TinyPNG.com
   - ImageOptim (Mac)
   - FileOptimizer (Windows)
2. Target sizes:
   - Hero: < 300KB
   - Services: < 200KB
   - Gallery: < 150KB
   - Color options: < 100KB

---

## 🎨 Styling Issues

### Issue: Website looks unstyled (no colors/formatting)

**Problem**: Tailwind CSS CDN not loading

**Solution**:
1. Check internet connection
2. Verify CDN link in HTML (Line 7):
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   ```
3. Check browser console for errors (F12)
4. Try hard refresh: Ctrl+Shift+Delete
5. Try different browser

---

### Issue: Colors look different on different devices

**Problem**: Color profile or display settings

**Solution**:
1. This is normal - displays vary
2. Test on multiple devices
3. Use standard web colors (Tailwind colors)
4. Avoid custom colors that may not display consistently

---

### Issue: Text is too small on mobile

**Problem**: Viewport meta tag missing or incorrect

**Solution**:
1. Verify meta tag in HTML (Line 5):
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```
2. Clear browser cache
3. Hard refresh: Ctrl+Shift+Delete

---

## 📱 Mobile Issues

### Issue: Website doesn't look good on mobile

**Problem**: Responsive design not working

**Solution**:
1. Check viewport meta tag (Line 5)
2. Test in browser DevTools (F12 → Toggle device toolbar)
3. Test on actual mobile device
4. Check for horizontal scrolling
5. Verify images scale properly

---

### Issue: Mobile menu doesn't open

**Problem**: JavaScript not working or menu button not clickable

**Solution**:
1. Check JavaScript is enabled
2. Open browser console (F12)
3. Look for JavaScript errors
4. Try different browser
5. Clear cache and reload

**Debug**:
```javascript
// Open console (F12) and type:
document.getElementById('mobile-menu-button')
// Should return the button element
```

---

### Issue: Touch targets too small on mobile

**Problem**: Buttons/links hard to tap

**Solution**:
1. Ensure buttons are at least 44x44 pixels
2. Add padding to clickable elements
3. Increase font size for links
4. Test with actual finger (not mouse)

---

## ⚙️ JavaScript Issues

### Issue: FAQ accordion doesn't work

**Problem**: JavaScript error or element not found

**Solution**:
1. Open browser console (F12)
2. Look for red error messages
3. Verify FAQ items have correct classes:
   ```html
   <div class="faq-item">
       <button class="question">...</button>
       <div class="answer">...</div>
   </div>
   ```
4. Try refreshing page
5. Try different browser

---

### Issue: Navigation highlighting doesn't work

**Problem**: Intersection Observer not supported or JavaScript error

**Solution**:
1. Check browser console for errors (F12)
2. Verify browser supports Intersection Observer
3. Try different browser
4. Check that sections have correct IDs:
   ```html
   <section id="home">...</section>
   <section id="services">...</section>
   ```

---

### Issue: Smooth scrolling doesn't work

**Problem**: Browser doesn't support CSS scroll-behavior

**Solution**:
1. This is normal on older browsers
2. Website still works, just no smooth animation
3. Try different browser
4. Add polyfill if needed

---

## 📧 Contact Form Issues

### Issue: Form doesn't submit

**Problem**: Form action not configured

**Solution**:
1. Form submission not set up yet
2. Follow "Contact Form Setup" in SETUP_GUIDE.md
3. Use Formspree (easiest):
   - Go to formspree.io
   - Create form
   - Get endpoint
   - Update form action in HTML (Line 383)

---

### Issue: Form submits but no confirmation

**Problem**: Success message not configured

**Solution**:
1. Add success message after form submission
2. Use JavaScript to show message
3. Or use Formspree's built-in confirmation

---

### Issue: Form data not received

**Problem**: Backend not configured or wrong endpoint

**Solution**:
1. Verify form action URL is correct
2. Check backend is running
3. Verify form method is POST
4. Check browser console for errors
5. Test with Formspree first (easier)

---

## 🌐 Deployment Issues

### Issue: Website won't deploy to Netlify

**Problem**: File structure or configuration issue

**Solution**:
1. Ensure `index.html` is in root directory
2. No build process needed
3. Drag entire `Concrete` folder to Netlify
4. Wait for deployment to complete
5. Check deployment logs for errors

---

### Issue: Website works locally but not deployed

**Problem**: File paths or resource loading issue

**Solution**:
1. Use relative paths: `assets/images/hero.jpg`
2. Don't use absolute paths: `/assets/images/hero.jpg`
3. Verify all files uploaded
4. Check file names match exactly
5. Clear browser cache

---

### Issue: Custom domain not working

**Problem**: DNS configuration issue

**Solution**:
1. Verify domain is registered
2. Update DNS records to point to hosting
3. Wait 24-48 hours for DNS to propagate
4. Check DNS settings with hosting provider
5. Verify CNAME or A records are correct

---

## 🔍 Performance Issues

### Issue: Website loads slowly

**Problem**: Large images or slow connection

**Solution**:
1. Compress images (TinyPNG.com)
2. Check file sizes (< 200KB each)
3. Use CDN for resources (already done)
4. Test on different connection speeds
5. Check browser DevTools Network tab

---

### Issue: High bounce rate

**Problem**: Website not engaging or slow to load

**Solution**:
1. Improve page speed
2. Add more compelling content
3. Improve call-to-action buttons
4. Test on mobile devices
5. Add testimonials or social proof

---

## 🔐 Security Issues

### Issue: Browser shows "Not Secure" warning

**Problem**: Website not using HTTPS

**Solution**:
1. Use Netlify or Vercel (auto HTTPS)
2. Or purchase SSL certificate from hosting
3. Configure HTTPS in hosting settings
4. Redirect HTTP to HTTPS

---

### Issue: Form data not secure

**Problem**: Sensitive data transmitted insecurely

**Solution**:
1. Always use HTTPS
2. Don't store sensitive data in code
3. Use secure form service (Formspree, etc.)
4. Never expose API keys in client code

---

## 📊 Analytics Issues

### Issue: Google Analytics not tracking

**Problem**: Analytics code not added or configured

**Solution**:
1. Add Google Analytics code to HTML
2. Verify tracking ID is correct
3. Wait 24 hours for data to appear
4. Check Analytics dashboard
5. Verify JavaScript is enabled

---

## 🆘 Still Having Issues?

### Debug Steps
1. **Check browser console** (F12)
   - Look for red error messages
   - Note exact error text
2. **Check network tab** (F12 → Network)
   - Look for failed requests (red)
   - Check response codes
3. **Try different browser**
   - Chrome, Firefox, Safari, Edge
4. **Clear cache**
   - Ctrl+Shift+Delete (Windows)
   - Cmd+Shift+Delete (Mac)
5. **Restart server**
   - Stop: Ctrl+C
   - Start: npm start

### Get Help
1. Check README.md for documentation
2. Check SETUP_GUIDE.md for setup help
3. Check SITE_MAP.md for content structure
4. Search error message on Google
5. Check browser console for specific errors

---

## 📝 Reporting Issues

When reporting issues, include:
- [ ] Exact error message
- [ ] Browser and version
- [ ] Operating system
- [ ] Steps to reproduce
- [ ] Screenshot if applicable
- [ ] Browser console errors (F12)

---

**Last Updated**: 2025-10-22  
**Status**: Comprehensive Troubleshooting Guide  
**Next Step**: Check specific issue above

