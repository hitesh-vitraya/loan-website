export type UtmParams = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

const UTM_STORAGE_KEY = "landing-utm-params";

function normalizeUtmValue(value: string | null) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

export function getUtmParamsFromSearchParams(searchParams: URLSearchParams): UtmParams {
  return {
    utmSource: normalizeUtmValue(searchParams.get("utm_source")),
    utmMedium: normalizeUtmValue(searchParams.get("utm_medium")),
    utmCampaign: normalizeUtmValue(searchParams.get("utm_campaign"))
  };
}

export function hasAnyUtmParams(utmParams: UtmParams) {
  return Boolean(utmParams.utmSource || utmParams.utmMedium || utmParams.utmCampaign);
}

export function readStoredUtmParams(): UtmParams {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.sessionStorage.getItem(UTM_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as UtmParams;
  } catch {
    window.sessionStorage.removeItem(UTM_STORAGE_KEY);
    return {};
  }
}

export function storeLandingUtmParams(nextUtmParams: UtmParams) {
  if (typeof window === "undefined" || !hasAnyUtmParams(nextUtmParams)) {
    return;
  }

  const currentUtmParams = readStoredUtmParams();
  const mergedUtmParams: UtmParams = {
    utmSource: currentUtmParams.utmSource ?? nextUtmParams.utmSource,
    utmMedium: currentUtmParams.utmMedium ?? nextUtmParams.utmMedium,
    utmCampaign: currentUtmParams.utmCampaign ?? nextUtmParams.utmCampaign
  };

  window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(mergedUtmParams));
}
