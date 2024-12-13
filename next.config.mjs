// Import the necessary functions and packages
import { withPlausibleProxy } from "next-plausible";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Apply Plausible proxy and retain your existing Next.js config
const nextConfig = withPlausibleProxy({
  customDomain: "https://hoops-analytics.hoops.finance" // Plausible instance
  // subdirectory: "plausible", // Optional, to customize the script URL
  //scriptName: "plausible-script" // Optional, customize the script name if needed
})({
  env: {
    API_URL: process.env.API_URL,
    API_KEY: process.env.API_KEY,
    LITLX_ID: process.env.LITLX_ID,
    SX_API_KEY: process.env.SX_API_KEY
  }
});

// Export the Next.js configuration
export default nextConfig;
