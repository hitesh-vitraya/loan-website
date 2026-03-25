"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackPageView } from "../../lib/gtag";

export function GoogleAnalyticsPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    const url = `${window.location.origin}${pathname}${search ? `?${search}` : ""}`;

    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}
