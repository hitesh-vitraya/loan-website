"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { getUtmParamsFromSearchParams, storeLandingUtmParams } from "../../lib/utm";

export function UtmTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    storeLandingUtmParams(getUtmParamsFromSearchParams(searchParams));
  }, [searchParams]);

  return null;
}
