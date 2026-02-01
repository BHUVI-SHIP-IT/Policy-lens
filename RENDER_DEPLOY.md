# Render.com Deployment Guide for PolicyLens

## Quick Deploy to Render

### 1. Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `BHUVI-SHIP-IT/Policy-lens`

### 2. Configure Build Settings

```
Name: policylens
Environment: Node
Region: Choose closest to you
Branch: main
Build Command: npm install && npm run build
Start Command: npm start
```

### 3. Add Environment Variables

In the Render dashboard, add these environment variables:

```env
DATABASE_URL=your_postgresql_connection_string
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyCDoZKAVvtsLE6tXU4jJqj7IeAL32XqMm4
AI_MODEL=gemini-flash-latest
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-app-name.onrender.com/api/auth/google/callback
SESSION_SECRET=generate_a_random_string_here
NODE_ENV=production
```

### 4. Create PostgreSQL Database (Optional - if not using Supabase)

1. In Render, click **"New +"** → **"PostgreSQL"**
2. Name it `policylens-db`
3. Copy the **Internal Database URL**
4. Use this as your `DATABASE_URL` in step 3

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. After deployment, click the URL to see your app!

### 6. Update Google OAuth Redirect

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://your-app-name.onrender.com/api/auth/google/callback`

## Free Tier Notes

- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid tier ($7/month) for always-on service

## Troubleshooting

**Build fails?**
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`

**Database connection fails?**
- Verify `DATABASE_URL` is correct
- Run `npm run db:push` locally first to create tables

**OAuth not working?**
- Double-check `GOOGLE_REDIRECT_URI` matches your Render URL exactly
- Make sure it's added in Google Cloud Console

## Alternative: Railway.app

If you prefer Railway:

1. Go to [Railway](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects and deploys
5. Add same environment variables
6. Done!

Railway is simpler but has less free tier time.
