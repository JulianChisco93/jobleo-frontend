import Link from "next/link";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Root-level not-found — provides its own html/body since the root layout
// is a pass-through. Routes under [locale] use app/[locale]/not-found.tsx.
export default function RootNotFound() {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-surface min-h-screen flex flex-col items-center justify-center px-8">
        <p className="text-8xl font-black font-display text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-on-surface mb-3">Page not found</h1>
        <p className="text-on-surface-variant mb-10 text-center">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to home
        </Link>
      </body>
    </html>
  );
}
