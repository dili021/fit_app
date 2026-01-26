import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || "http://localhost:3000";

// Build trusted origins list - supports multiple origins
// This allows CORS requests from multiple deployment URLs (Vercel preview/production)
const getTrustedOrigins = (): string[] => {
  const origins: string[] = [];
  
  // Add SITE_URL if set
  if (siteUrl) {
    origins.push(siteUrl);
  }
  
  // Add TRUSTED_ORIGINS if set (comma-separated list)
  // Example: TRUSTED_ORIGINS=https://app.vercel.app,https://preview.vercel.app
  if (process.env.TRUSTED_ORIGINS) {
    const additionalOrigins = process.env.TRUSTED_ORIGINS.split(',')
      .map(o => o.trim())
      .filter(Boolean);
    origins.push(...additionalOrigins);
  }
  
  // Always include localhost for development
  if (!origins.includes("http://localhost:3000")) {
    origins.push("http://localhost:3000");
  }
  
  // Remove duplicates
  return [...new Set(origins)];
};

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const trustedOrigins = getTrustedOrigins();
  
  return betterAuth({
    trustedOrigins,
    database: authComponent.adapter(ctx),
    // Configure email/password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    // Configure social providers
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
    },
    // Session configuration
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
    // Cookie settings for development
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
      crossSubDomainCookies: {
        enabled: false,
      },
    },
    plugins: [
      // The cross domain plugin is required for client side frameworks
      crossDomain({ siteUrl }),
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  });
}

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
