// Google OAuth callback handler for Vercel
// This exchanges the authorization code for tokens and sets a session

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, error } = req.query;

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(302, `${process.env.SHOPIFY_SITE_URL}/pages/auth?error=${encodeURIComponent(error)}`);
    }

    // Validate required parameters
    if (!code || !state) {
      return res.redirect(302, `${process.env.SHOPIFY_SITE_URL}/pages/auth?error=${encodeURIComponent('Missing authorization code or state')}`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return res.redirect(302, `${process.env.SHOPIFY_SITE_URL}/pages/auth?error=${encodeURIComponent('Failed to exchange authorization code')}`);
    }

    const tokenData = await tokenResponse.json();
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return res.redirect(302, `${process.env.SHOPIFY_SITE_URL}/pages/auth?error=${encodeURIComponent('Failed to get user info')}`);
    }

    const userInfo = await userInfoResponse.json();

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = Buffer.from(JSON.stringify({
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      googleId: userInfo.id,
      loginTime: new Date().toISOString(),
      tier: 'free' // Default tier, can be upgraded later
    })).toString('base64');

    // Redirect back to Shopify with session data
    const redirectUrl = new URL(`${process.env.SHOPIFY_SITE_URL}/pages/auth`);
    redirectUrl.searchParams.set('google_success', 'true');
    redirectUrl.searchParams.set('session', sessionToken);
    redirectUrl.searchParams.set('email', userInfo.email);
    redirectUrl.searchParams.set('name', userInfo.name);

    return res.redirect(302, redirectUrl.toString());

  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect(302, `${process.env.SHOPIFY_SITE_URL}/pages/auth?error=${encodeURIComponent('Internal server error')}`);
  }
}
