import type { Metadata, Viewport } from "next";

const ogImage = "https://hoops.finance/og-image.png";

interface GenerateMetadataProps {
  title: string;
  description: string;
  keywords?: string;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ]
};

export function generateMetadata({
  title = "Hoops Dashboard",
  description = "Manage and monitor your Hoops Finance dashboard",
  keywords = "finance, dashboard, hoops, management"
}: GenerateMetadataProps): Metadata {
  const fullTitle = `${title} | Hoops Finance`;

  return {
    title: fullTitle,
    description,
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      images: [ogImage],
      type: "website",
      locale: "en_US",
      siteName: "Hoops Finance",
      url: "https://hoops.finance"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      site: "@hoopsfinance",
      creator: "@hoopsfinance",
      creatorId: "1234567890", // Replace with actual X (Twitter) ID
      siteId: "1234567890", // Replace with actual X (Twitter) ID
    },
    other: {
      // Facebook
      "facebook-domain-verification": "YOUR_FACEBOOK_DOMAIN_VERIFICATION_ID",

      // Twitter/X
      "twitter:label1": "Price",
      "twitter:data1": "$0.00",
      "twitter:label2": "Volume",
      "twitter:data2": "$0.00",
      "twitter:dnt": "on",
      "twitter:widgets:new-embed-design": "on",
      "twitter:widgets:csp": "on",

      // LinkedIn
      "linkedin:card": "summary_large_image",
      "linkedin:title": fullTitle,
      "linkedin:description": description,
      "linkedin:image": ogImage,
      "linkedin:author": "Hoops Finance",
      "linkedin:company": "Hoops Finance",
      "linkedin:industry": "Financial Services",
      "article:published_time": new Date().toISOString(),
      "article:author": "https://www.linkedin.com/company/hoops-finance",
      "article:publisher": "https://www.linkedin.com/company/hoops-finance",

      // Email Preview Metadata
      "format-detection": "telephone=no,date=no,address=no,email=no,url=no",
      "x-apple-disable-message-reformatting": "",
      "color-scheme": "light dark",
      "supported-color-schemes": "light dark",
      "msapplication-TileColor": "#000000",
      "msapplication-TileImage": ogImage,
      "theme-color": "#000000",
      "mobile-web-app-capable": "yes",
      "mobile-web-app-status-bar-style": "black",
      "mobile-web-app-title": fullTitle,
      "og:email": "contact@hoops.finance",
      "og:phone_number": "+1234567890",
      "schema:email": "contact@hoops.finance",
      "schema:telephone": "+1234567890",
      "email:title": fullTitle,
      "email:description": description,
      "email:preview-text": description.substring(0, 150) + "...",
      "email:image": ogImage,
      "email:from-name": "Hoops Finance",
      "email:from-email": "contact@hoops.finance"
    },
    alternates: {
      canonical: "https://hoops.finance"
    },
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
      url: false
    }
  };
}
