// Import the necessary functions and packages
import { withPlausibleProxy } from "next-plausible";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Apply Plausible proxy and retain your existing Next.js config
const nextConfig = withPlausibleProxy({
  customDomain: "https://hoops-analytics.stellar.red" // Plausible instance
  // subdirectory: "plausible", // Optional, to customize the script URL
  //scriptName: "plausible-script" // Optional, customize the script name if needed
})({
  env: {
    API_URL: process.env.API_URL,
    API_KEY: process.env.API_KEY,
    LITLX_ID: process.env.LITLX_ID,
    SX_API_KEY: process.env.SX_API_KEY,
    AUTH_API_URL: process.env.AUTH_API_URL,
    AUTH_API_KEY: process.env.AUTH_API_KEY,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_OAUTH_REDIRECT_URI: process.env.DISCORD_OAUTH_REDIRECT_URI,
    DISCORD_OAUTH_FLOW_URL: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${process.env.DISCORD_OAUTH_REDIRECT_URI}&scope=identify`,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_OAUTH_REDIRECT_URI: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    GOOGLE_OAUTH_FLOW_URL: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${process.env.GOOGLE_OAUTH_REDIRECT_URI}&scope=https://www.googleapis.com/auth/userinfo.email`
  }
});

// Export the Next.js configuration
export default nextConfig;
