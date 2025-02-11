// Import the necessary functions and packages
import { withPlausibleProxy } from "next-plausible";
import dotenv from "dotenv";
import withBundleAnalyzer from '@next/bundle-analyzer'
import path from 'path';

// Load environment variables
dotenv.config();

// Apply Plausible proxy and retain your existing Next.js config
const nextConfig = withPlausibleProxy({
  customDomain: "https://hoops-analytics.hoops.finance" // Plausible instance
  // subdirectory: "plausible", // Optional, to customize the script URL
  //scriptName: "plausible-script" // Optional, customize the script name if needed
})({
  env: {
    // BASE_DATA_URI: process.env.BASE_DATA_URI,
    // API_URL: process.env.API_URL,
    NEXT_PUBLIC_BASE_DATA_URI: process.env.NEXT_PUBLIC_BASE_DATA_URI,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },
  productionBrowserSourceMaps: true,
  experimental: {
    ppr: "incremental", 
    optimizePackageImports: ["lightweight-charts", "framer-motion"],
  },

  
webpack(config, { isServer }) {
  config.devtool = 'source-map';

  if (isServer) {
    config.output.devtoolModuleFilenameTemplate = info => {
      // 1) get absolute path, e.g. "C:\dev\..."
      const absolute = path.resolve(info.absoluteResourcePath);
      // 2) convert backslashes to forward slashes => "C:/dev/..."
      const normalized = absolute.replace(/\\/g, "/");
      // 3) **do NOT** prepend "file:///"
      return normalized;
    };
    // fallback can just show the resource path
    config.output.devtoolFallbackModuleFilenameTemplate = "[resource-path]?[hash]";
  }

  return config;
}

,

});

// const withBundleAnalyzer = require('@next/bundle-analyzer')({  enabled: process.env.ANALYZE === 'true',})
 

// Export the Next.js configuration
// Wrap your config with the analyzer plugin:
export default withBundleAnalyzer({
  enabled: 'true',
  openAnalyzer: false,
  // optional: openAnalyzer: false,
})(nextConfig);

/*
// backup
API_KEY: process.env.API_KEY,
    SXX_API_KEY: process.env.SXX_API_KEY,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_API_URL: process.env.AUTH_API_URL,
    AUTH_API_KEY: process.env.AUTH_API_KEY,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_OAUTH_REDIRECT_URI: process.env.DISCORD_OAUTH_REDIRECT_URI,
    DISCORD_OAUTH_FLOW_URL: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${process.env.DISCORD_OAUTH_REDIRECT_URI}&scope=identify`,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_OAUTH_REDIRECT_URI: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    GOOGLE_OAUTH_FLOW_URL: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${process.env.GOOGLE_OAUTH_REDIRECT_URI}&scope=https://www.googleapis.com/auth/userinfo.email`,
    */


    // next.config.mjs (ESM syntax)



