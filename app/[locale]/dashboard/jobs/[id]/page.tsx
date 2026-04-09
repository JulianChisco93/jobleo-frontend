"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JobDetailPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("../jobs");
  }, [router]);
  return null;
}
