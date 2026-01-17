<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1f_IuTajaMUqg4lyzF-R0Dh5GEsGY-0ci

## Deployment

### Vercel Deployment
1.  **Environment Variables**: Ensure you add the following Environment Variables in your Vercel Project Settings:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `VITE_GEMINI_API_KEY` (if using AI features)

2.  **Configuration**: This project includes a `vercel.json` file to support Single Page Application (SPA) routing. No further configuration should be needed.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
