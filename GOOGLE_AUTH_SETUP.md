# Google OAuth Setup

## Current Status

Google OAuth is **configured** in the code but **not yet activated** (requires credentials).

## Setup Instructions

1. **Create Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

2. **Add Credentials to `.env.local`**
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

   **Note**: `VITE_GOOGLE_CLIENT_ID` is needed for client-side access. The secret should NOT have the VITE_ prefix (server-only).

3. **Restart Dev Server**
   After adding credentials, restart your dev server for changes to take effect.

## Features

- "Sign in with Google" button appears on `/sign-in` page when credentials are configured
- Users can sign in/up with Google OAuth
- Email/password auth still works as before
- Both methods create the same user account structure

## Security Notes

- `GOOGLE_CLIENT_SECRET` is server-only (never exposed to client)
- `VITE_GOOGLE_CLIENT_ID` is safe to expose (public OAuth client ID)
- In production, update redirect URI to your production domain
