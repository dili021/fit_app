import { createAuthClient } from 'better-auth/react'
import {
  convexClient,
  crossDomainClient,
} from '@convex-dev/better-auth/client/plugins'

// Use Convex site URL for auth requests
const baseURL =
  import.meta.env.VITE_CONVEX_SITE_URL ||
  import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site') ||
  'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL,
  plugins: [convexClient(), crossDomainClient()],
})
