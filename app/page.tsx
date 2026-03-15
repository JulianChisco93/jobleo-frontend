import { redirect } from "next/navigation";

// The root "/" is handled by next-intl middleware which rewrites to /[locale]/
// This fallback ensures we never see an empty page
export default function RootPage() {
  redirect("/");
}
