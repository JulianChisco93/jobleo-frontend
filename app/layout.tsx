import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Jobleo — Your Next Job, Delivered to WhatsApp",
  description:
    "Upload your CV, configure your job search, and receive curated job matches directly on WhatsApp — powered by AI.",
  other: {
    "facebook-domain-verification": "h0mivuut4fggji5yhzpa18snx0wo84",
  },
};

// Pass-through layout — the [locale] layout provides <html> and <body>
// with the correct lang attribute. This avoids nested <html> elements.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
