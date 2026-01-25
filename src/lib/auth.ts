import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  // baseURL and secret are read from BETTER_AUTH_URL and BETTER_AUTH_SECRET env vars
  // Database will be configured when we set up Convex integration
})
