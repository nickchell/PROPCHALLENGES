# Screenshot Viewing Feature Test Guide

## How to Test the Screenshot Viewing Feature

### Step 1: Add Screenshots to a Day
1. Open the app and select a user
2. Go to any day (Monday-Friday) in the current week
3. Add some trade amounts (e.g., +50, -30)
4. **Important**: Click the "Add" button next to each trade to upload a screenshot image
5. Click "Submit Day"

### Step 2: View Screenshots
After submitting a day with screenshots, you should see:
1. A "View Screenshots" button appears on the submitted day
2. Thumbnail images of the screenshots are displayed
3. Click either the "View Screenshots" button OR any thumbnail image

### Step 3: Screenshot Viewer Features
The screenshot viewer should show:
1. Full-screen modal with the screenshot
2. Trade information (amount, trade number)
3. Navigation buttons (Previous/Next) if multiple screenshots
4. Download button to save the screenshot
5. Close button (X) or press Escape to close

### Troubleshooting

#### If you don't see the "View Screenshots" button:
- Make sure you uploaded at least one screenshot before submitting
- Check the browser console for any error messages
- The button only appears if there are actual screenshots

#### If the screenshot viewer doesn't open:
- Check browser console for errors
- Make sure you clicked on a submitted day (not a blank day)
- Try refreshing the page and testing again

#### If screenshots don't display:
- Check that the images are valid (JPG, PNG, etc.)
- Check browser console for any loading errors
- Try with different image files

### Debug Information
The app now includes console logging to help debug issues:
- Check browser console (F12) for messages about screenshot data
- Look for "Opening screenshots for [day]: [screenshot data]"
- Look for "ScreenshotViewer opened with: [data]"

### Expected Behavior
- ✅ Screenshots are saved when you submit a day
- ✅ "View Screenshots" button appears on submitted days with screenshots
- ✅ Clicking opens a full-screen viewer
- ✅ Navigation works between multiple screenshots
- ✅ Download functionality works
- ✅ Keyboard shortcuts work (Escape, arrow keys)
