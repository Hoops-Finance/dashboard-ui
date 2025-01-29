import { Metadata } from "next";

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

export function generateMetadata({
  title = "Hoops Dashboard",
  description = "Manage and monitor your Hoops Finance dashboard",
  keywords = "finance, dashboard, hoops, management",
  ogImage = "/og-image.png",
  noIndex = false,
  canonicalUrl
}: GenerateMetadataProps = {}): Metadata {
  return {
    title: title + " | Hoops Finance",
    description,
    keywords,
    openGraph: {
      title: title + " | Hoops Finance",
      description,
      images: [ogImage]
    },
    twitter: {
      card: "summary_large_image",
      title: title + " | Hoops Finance",
      description,
      images: [ogImage]
    },
    ...(noIndex && {
      robots: "noindex,nofollow"
    }),
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl
      }
    })
  };
}
