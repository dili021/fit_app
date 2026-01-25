import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  // baseURL and secret are read from BETTER_AUTH_URL and BETTER_AUTH_SECRET env vars
  // Database will be configured when we set up Convex integration
})
