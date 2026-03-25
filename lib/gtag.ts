"use client";

export const GA_MEASUREMENT_ID = "G-7BT6XR09E0";
export const GA_LOAN_APPLICATION_COMPLETED_EVENT = "loan_application_completed";

type GtagCommand = "config" | "event" | "js";

type GtagFunction = (command: GtagCommand, target: string | Date, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
  }
}

export function trackPageView(url: string) {
  window.gtag?.("event", "page_view", {
    page_location: url,
    page_path: window.location.pathname + window.location.search,
    page_title: document.title
  });
}

export function trackLoanApplicationCompleted(params?: Record<string, unknown>) {
  window.gtag?.("event", GA_LOAN_APPLICATION_COMPLETED_EVENT, params);
}
