import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobleo — Your Next Job, Delivered to WhatsApp",
  description:
    "Upload your CV, configure your job search, and receive curated job matches directly on WhatsApp — powered by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
