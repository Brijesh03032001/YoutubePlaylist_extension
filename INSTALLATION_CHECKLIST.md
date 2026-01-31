# ✅ Installation Checklist

Follow these steps to get your extension running in **5 minutes**:

## Step 1: Generate Icons (2 minutes)

**Option A: Use the HTML Generator (Recommended)**

1. Open this file in your browser:
   ```
   /Users/brijeshkumar03/Downloads/YoutubePlaylist/assets/icons/create_icons.html
   ```

2. Right-click each canvas and "Save image as..."
   - Save as `icon16.png`
   - Save as `icon32.png`
   - Save as `icon48.png`
   - Save as `icon128.png`

3. Save all in: `/Users/brijeshkumar03/Downloads/YoutubePlaylist/assets/icons/`

**Option B: Skip Icons (Testing Only)**

Temporarily edit `manifest.json` and comment out lines 32-45:
```json
/*
"icons": {
  "16": "assets/icons/icon16.png",
  ...
},
*/
```

---

## Step 2: Load Extension in Chrome (1 minute)

1. **Open Extensions Page**
   ```
   chrome://extensions/
   ```
   Or: Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle switch in top-right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to: `/Users/brijeshkumar03/Downloads/YoutubePlaylist`
   - Click "Select Folder"

4. **Verify Installation**
   - Extension appears in list
   - Name: "Smart YouTube Playlist Planner"
   - Version: 1.0.0
   - No errors in "Errors" section

---

## Step 3: Test Extension (2 minutes)

1. **Open a YouTube Playlist**
   
   Try this public playlist:
   ```
   https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
   ```
   
   Or any other public playlist you have.

2. **Wait for Planner Card**
   - Card should appear on right side after 1-2 seconds
   - Shows playlist statistics
   - Has blue header with "📚 Smart Planner"

3. **Test Features**
   - ✅ Click different playback speeds (1x, 1.25x, 1.5x, 2x)
   - ✅ Click time presets (15m, 30m, 45m, 60m)
   - ✅ Enter custom time
   - ✅ View updated calculations
   - ✅ Check progress bar
   - ✅ Click close button

4. **Test Popup**
   - Click extension icon in toolbar
   - Should show tracked playlists
   - Shows statistics
   - Can click playlist to open

---

## Step 4: Verify Everything Works

### ✅ Core Features Working

- [ ] Extension loads without errors
- [ ] Planner card appears on playlist pages
- [ ] Can select playback speed
- [ ] Can set daily time
- [ ] Calculations update in real-time
- [ ] Progress bar displays
- [ ] Can close/reopen card
- [ ] Popup shows statistics

### ✅ No Errors

Open browser console (F12) and check:
- [ ] No red error messages
- [ ] See `[YTPP]` prefixed logs (if DEBUG=true)
- [ ] Extension status shows "Active"

### ✅ Data Persistence

- [ ] Close and reopen YouTube → settings persist
- [ ] Restart browser → data remains
- [ ] Open multiple tabs → no conflicts

---

## Troubleshooting

### Problem: Extension won't load

**Check:**
- All files are present (run `find . -type f` to verify)
- manifest.json has no syntax errors
- Using Chrome 88+ or Chromium-based browser

**Fix:**
1. Check "Errors" tab in chrome://extensions/
2. Read specific error message
3. Fix the issue and click refresh icon

---

### Problem: Icons missing error

**Solution A:**
1. Generate icons using create_icons.html
2. Save all 4 sizes in assets/icons/
3. Reload extension

**Solution B:**
1. Comment out icons section in manifest.json
2. Reload extension
3. Works for testing (but needed for publishing)

---

### Problem: Card doesn't appear

**Check:**
1. Are you on a valid playlist URL?
   - Should contain `/playlist?list=` or `/watch?v=...&list=`
2. Did you wait 1-2 seconds?
3. Try refreshing the YouTube page
4. Check browser console for errors

**Debug:**
1. Open console (F12)
2. Look for `[YTPP]` messages
3. Should see "Content script loaded"
4. Should see "Initializing for playlist"

---

### Problem: Popup is empty

**Check:**
1. Have you opened any playlists yet?
2. Is extension active?
3. Check console in popup (right-click → inspect popup)

---

### Problem: Progress not saving

**Check:**
1. Extension has storage permission (should by default)
2. Not in incognito mode (data won't persist)
3. Browser storage not full

**Debug:**
1. Open chrome://extensions/
2. Click "service worker"
3. Check logs for storage errors

---

## Success! 🎉

If all checks pass, your extension is working perfectly!

### What to Do Next

**For Personal Use:**
- ✅ You're done! Start using it on your playlists

**For Portfolio:**
- 📸 Take screenshots of the extension in action
- 📝 Add to your resume/GitHub
- 🎨 Create professional icons

**For Publishing:**
- 🎨 Create high-quality icons (not emoji-based)
- 📸 Take 5+ screenshots
- 📝 Write store description (use README as base)
- 💳 Pay $5 Chrome Web Store developer fee
- 🚀 Submit for review (1-3 days)

---

## Quick Commands Reference

```bash
# Navigate to project
cd /Users/brijeshkumar03/Downloads/YoutubePlaylist

# View all files
find . -type f -name "*.js" -o -name "*.md"

# Edit manifest
nano manifest.json

# View logs
# In Chrome: F12 → Console

# Reload extension
# chrome://extensions/ → Click refresh icon
```

---

## Getting Help

If you're still stuck:

1. **Read documentation:**
   - [README.md](README.md) - Full documentation
   - [QUICK_START.md](QUICK_START.md) - Setup guide
   - [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Overview

2. **Check console logs:**
   - YouTube page: F12 → Console
   - Background: chrome://extensions/ → service worker
   - Popup: Right-click icon → Inspect popup

3. **Common fixes:**
   - Reload extension
   - Refresh YouTube page
   - Clear browser cache
   - Restart browser

---

## Final Status Check

Once everything works:

- ✅ Extension installed
- ✅ Icons present (or bypassed for testing)
- ✅ Planner card appears on playlists
- ✅ All features working
- ✅ No console errors
- ✅ Data persists across sessions
- ✅ Popup shows statistics

**Status: READY TO USE! 🚀**

---

**Time spent:** ~5 minutes  
**Result:** Fully functional Chrome extension  
**Next step:** Open a playlist and start planning!
