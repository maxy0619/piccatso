# Vercel Backend Deployment Guide

This guide will help you deploy the OAuth backend to Vercel for Google sign-in.

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Deploy to Vercel

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy the project:**
   ```bash
   vercel --prod
   ```

3. **Follow the prompts:**
   - Project name: `piccatso-oauth` (or any name you prefer)
   - Directory: `.` (current directory)
   - Override settings: `N` (use defaults)

## Step 3: Set Environment Variables

After deployment, go to your Vercel dashboard and set these environment variables:

1. **GOOGLE_CLIENT_ID**: `285074342032-ca72b6jsl8jc35ojirvtl36mh65jatng.apps.googleusercontent.com`
2. **GOOGLE_CLIENT_SECRET**: Your Google client secret (get this from Google Cloud Console)
3. **GOOGLE_REDIRECT_URI**: `https://your-vercel-app.vercel.app/api/auth/google/callback`
4. **SHOPIFY_SITE_URL**: Your Shopify store URL (e.g., `https://your-store.myshopify.com`)

## Step 4: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add this redirect URI:
   ```
   https://your-vercel-app.vercel.app/api/auth/google/callback
   ```
   (Replace `your-vercel-app` with your actual Vercel app name)

## Step 5: Update Your Shopify Config

Update `assets/social-auth-config.js` with your Vercel app URL:

```javascript
window.SOCIAL_AUTH_CONFIG = {
  enabled: true,
  backendCallbackBaseUrl: "https://your-vercel-app.vercel.app",
  postLoginRedirect: "/pages/account",
  providers: {
    google: {
      enabled: true,
      clientId: "285074342032-ca72b6jsl8jc35ojirvtl36mh65jatng.apps.googleusercontent.com",
      redirectUri: "https://your-vercel-app.vercel.app/api/auth/google/callback",
      scope: "openid email profile"
    }
  }
};
```

## Step 6: Test

1. Commit and push your changes to GitHub
2. Shopify will automatically sync
3. Go to `/pages/auth` and click "Continue with Google"
4. You should be redirected to Google, then back to your auth page with a success message

## Troubleshooting

- **404 errors**: Make sure your Vercel app is deployed and the URL is correct
- **OAuth errors**: Check that your redirect URI matches exactly in Google Cloud Console
- **Environment variables**: Verify all environment variables are set in Vercel dashboard
