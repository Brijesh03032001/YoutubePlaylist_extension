# 🚀 Quick Start Guide

## Installation (5 minutes)

### Step 1: Prepare Icons (Optional for testing)

The extension needs icon files. For quick testing, you can skip this or create simple placeholder icons:

**Quick Icon Creation:**
```bash
# Option A: Use online tool
# Visit: https://favicon.io/
# Upload any image and download all sizes

# Option B: Create simple placeholders
# Use any image editor to create:
# - icon16.png (16x16)
# - icon32.png (32x32)  
# - icon48.png (48x48)
# - icon128.png (128x128)
# Save them in: assets/icons/
```

**Or temporarily comment out icons in manifest.json** (lines 32-45) for testing.

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle switch in top-right corner

3. **Load Unpacked**
   - Click "Load unpacked" button
   - Navigate to and select: `/Users/brijeshkumar03/Downloads/YoutubePlaylist`
   - Click "Select"

4. **Verify Installation**
   - Extension should appear in the list
   - No errors should show

### Step 3: Test It!

1. **Open YouTube Playlist**
   ```
   https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
   ```
   *(Or any public YouTube playlist)*

2. **Wait 1-2 seconds** for the page to load

3. **Look for the Planner Card** on the right side of the page

4. **Interact with it:**
   - Change playback speed
   - Set daily time
   - View calculated plans

### Step 4: Check Popup

1. Click the extension icon in Chrome toolbar
2. View tracked playlists
3. See overall statistics

---

## Common Issues

### ❌ Extension won't load

**Solution:**
1. Check all files are present
2. Verify manifest.json is valid (no syntax errors)
3. Check Chrome console for errors

### ❌ Planner card doesn't appear

**Solution:**
1. Refresh the YouTube page
2. Make sure you're on a playlist URL
3. Open console (F12) and check for errors
4. Wait 2-3 seconds for page to fully load

### ❌ Icons missing errors

**Solution:**
1. Create placeholder icon files (see assets/icons/README.md)
2. OR temporarily comment out icon sections in manifest.json
3. Reload extension

### ❌ "Errors" tab shows issues

**Solution:**
1. Read the specific error message
2. Check file paths in manifest.json
3. Verify all JavaScript files exist
4. Look for syntax errors in console

---

## Testing Checklist

After installation, test these features:

- [ ] Extension loads without errors
- [ ] Planner card appears on playlist page
- [ ] Can change playback speed (1x, 1.25x, 1.5x, 2x)
- [ ] Can set daily time (presets + custom)
- [ ] Can see calculated days/finish date
- [ ] Progress bar shows correctly
- [ ] Close button works
- [ ] Popup shows tracked playlists
- [ ] "Clear Cache" button works
- [ ] Progress persists after page reload

---

## Development Tips

### Hot Reload

After making code changes:

1. Go to `chrome://extensions/`
2. Click the refresh icon ↻ on your extension
3. Reload the YouTube page

### Debug Mode

Set `ENABLE_DEBUG_MODE=true` in `.env` to see detailed console logs.

### View Console Logs

**For content script:**
1. Open YouTube playlist page
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for `[YTPP]` prefixed logs

**For background service worker:**
1. Go to `chrome://extensions/`
2. Click "service worker" link under your extension
3. View logs in the new DevTools window

**For popup:**
1. Right-click extension icon
2. Select "Inspect popup"
3. View console in DevTools

### Storage Inspector

View stored data:
1. F12 → Application tab → Storage → Extension Storage
2. Or use: `chrome.storage.local.get(console.log)`

---

## File Structure Reference

```
YoutubePlaylist/
├── manifest.json           ← Extension config
├── .env                    ← Your settings
├── README.md              ← Main documentation
├── QUICK_START.md         ← This file
│
├── src/
│   ├── background/
│   │   └── background.js  ← Service worker
│   ├── content/
│   │   ├── contentScript.js    ← Main entry
│   │   ├── playlistParser.js   ← Data extraction
│   │   └── injectUI.js        ← UI injection
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── ui/
│   │   ├── plannerCard.js
│   │   └── plannerCard.css
│   ├── utils/
│   │   ├── timeUtils.js
│   │   ├── storageUtils.js
│   │   └── domUtils.js
│   └── constants/
│       └── config.js
│
└── assets/
    └── icons/             ← Place icon files here
```

---

## Next Steps

1. ✅ Extension installed and working
2. 📝 Customize settings in `.env`
3. 🎨 Create proper icons for production
4. 🧪 Test with various playlists
5. 🚀 Prepare for Chrome Web Store submission

---

## Publishing to Chrome Web Store

When ready to publish:

1. **Create proper icons** (128x128 required)
2. **Take screenshots** of the extension in action
3. **Write store description** (use README as base)
4. **Create developer account** ($5 one-time fee)
5. **Submit for review** (usually 1-3 days)

See: https://developer.chrome.com/docs/webstore/publish/

---

## Getting Help

- 📖 Read the full [README.md](README.md)
- 🐛 Check browser console for error messages
- 💡 Review [config.js](src/constants/config.js) for settings
- 🔍 Search Chrome Extension documentation

---

**You're all set! Enjoy planning your YouTube playlists! 📚**
