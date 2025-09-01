# 🚀 Shopify Theme Setup Instructions

## 📦 **Method 1: ZIP Upload (Recommended for Testing)**

### **Step 1: Upload Theme**
1. **Go to**: Shopify Admin → Online Store → Themes
2. **Click**: "Add theme"
3. **Select**: "Upload ZIP file"
4. **Choose**: `piccatso-theme-20250901-110807.zip` (or latest ZIP from project folder)
5. **Click**: "Upload"
6. **Wait** for processing to complete

### **Step 2: Preview Before Publishing**
1. **Click**: "Actions" → "Preview" (don't publish yet)
2. **Test** everything works correctly
3. **When ready**: "Actions" → "Publish"

## 🔗 **Method 2: GitHub Sync (If Available)**

### **If you have GitHub integration:**
1. **Go to**: Shopify Admin → Online Store → Themes
2. **Look for**: GitHub-connected theme
3. **Click**: "Actions" → "Update from GitHub"
4. **Note**: May take 5-10 minutes to sync all files

### **If GitHub sync is missing files:**
- Use ZIP upload method instead
- GitHub sync sometimes misses new templates/snippets

## 📄 **Create the Printful Preview Page**

### **Method 1: Automatic (via template)**
The theme includes `page.printful-preview.json` template, so:
1. **Go to**: Online Store → Pages
2. **Click**: "Add page"
3. **Page details**:
   - **Title**: "Printful Preview"
   - **Content**: Leave blank (template handles it)
   - **Template**: Select "page.printful-preview"
4. **Save**

### **Method 2: Manual (if template doesn't appear)**
1. **Go to**: Online Store → Pages
2. **Click**: "Add page"
3. **Page details**:
   - **Title**: "Printful Preview"
   - **Content**: 
     ```html
     <div id="printful-preview-container">
       <h2>Testing Printful Integration...</h2>
       <p>If you see this, the page was created manually. The preview interface should load below:</p>
     </div>
     ```
   - **Template**: Use default "page"
4. **Save**

## 🧪 **Access Your Preview**

### **Multiple Ways to Access:**

1. **Header Button**: Look for "🧪 Test POD" button in the header
2. **Homepage Button**: "🧪 Test Printful Integration" button on homepage
3. **Direct URL**: `https://your-store.myshopify.com/pages/printful-preview`
4. **Admin**: Online Store → Pages → Printful Preview → "View page"

## ✅ **Verification Checklist**

### **After Upload/Sync:**
- [ ] Theme uploaded successfully
- [ ] Preview shows your store correctly
- [ ] Header has "🧪 Test POD" button
- [ ] Homepage has Printful test button
- [ ] Printful preview page exists and loads

### **On Preview Page:**
- [ ] API status shows connection result
- [ ] Sample images are clickable
- [ ] POD interface appears when image selected
- [ ] Pricing shows 100% markup
- [ ] Browser console shows no major errors

## 🔧 **Troubleshooting**

### **Theme Upload Issues:**
- **File too large**: Use latest ZIP (should be ~15MB)
- **Upload failed**: Try different browser or clear cache
- **Missing files**: Use ZIP method instead of GitHub sync

### **Preview Page Issues:**
- **Template not found**: Create page manually (Method 2 above)
- **Page not loading**: Check URL spelling
- **Buttons don't work**: Verify page was saved correctly

### **API Connection Issues:**
- **Not configured**: Check `printful-credentials.js` has real API key
- **Connection failed**: Verify API key is correct in Printful dashboard
- **CORS errors**: This is normal for browser testing; server-side will work

## 📱 **Mobile Testing**

Don't forget to test on mobile:
1. **Preview theme** on mobile device
2. **Check buttons** are accessible
3. **Test POD interface** works on small screens
4. **Verify pricing** displays correctly

## 🎯 **Next Steps**

Once preview page is working:
1. **Test API connection** (should show green status)
2. **Try sample images** (click to activate POD interface)
3. **Test product selection** (Canvas, Poster, Metal, Framed)
4. **Verify pricing** (100% markup calculations)
5. **Check browser console** for detailed test results

## 📞 **Need Help?**

### **Common Issues:**
- **Page not found**: Double-check page was saved with correct template
- **Buttons missing**: Theme may need to be re-uploaded
- **API errors**: Verify Printful credentials are correct

### **Testing Commands:**
Open browser console (F12) on preview page and run:
```javascript
// Test everything
testPrintfulIntegration()

// Check credentials
window.PrintfulCredentials.isConfigured()
```

**The preview system will show you exactly how your Printful integration works, even without the Piccatso API working!**
