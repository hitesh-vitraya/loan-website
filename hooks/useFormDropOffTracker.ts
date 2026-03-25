"use client";

import { RefObject, useCallback, useEffect, useRef } from "react";

import { FormDropOffReason, FormPageStage, SaveFormDropOffPayload } from "../lib/form-drop-off";
import { readStoredUtmParams } from "../lib/utm";

const DEFAULT_INACTIVITY_TIMEOUT_MS = 60_000;

type UseFormDropOffTrackerArgs = {
  formId: string;
  formName: string;
  pageStage: FormPageStage;
  currentStep: number;
  progressPercentage: number;
  userId?: string;
  inactivityTimeoutMs?: number;
  isCompleted?: boolean;
  formRef?: RefObject<HTMLElement>;
};

type SessionSnapshot = {
  sessionId: string;
  startedAt: string;
};

type TrackedElement = HTMLElement & {
  name?: string;
};

function buildStorageKey(formId: string) {
  return `form-drop-off:${formId}`;
}

function buildInternalNavigationKey(formId: string) {
  return `form-drop-off:intent:${formId}`;
}

function createSessionSnapshot(): SessionSnapshot {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: new Date().toISOString()
  };
}

function getTrackedFieldName(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return "";
  }

  const trackedElement = target.closest<TrackedElement>("[data-track-field], input, select, textarea");

  return trackedElement?.dataset.trackField || trackedElement?.name || "";
}

export function useFormDropOffTracker({
  formId,
  formName,
  pageStage,
  currentStep,
  progressPercentage,
  userId,
  inactivityTimeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS,
  isCompleted = false,
  formRef
}: UseFormDropOffTrackerArgs) {
  const sessionRef = useRef<SessionSnapshot | null>(null);
  const startedAtRef = useRef<string>("");
  const lastActiveAtRef = useRef<string>(new Date().toISOString());
  const currentFieldRef = useRef("");
  const latestStepRef = useRef(currentStep);
  const latestProgressRef = useRef(progressPercentage);
  const completedRef = useRef(isCompleted);
  const inactivityTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const lastSentSignatureRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storageKey = buildStorageKey(formId);
    const savedValue = window.sessionStorage.getItem(storageKey);

    if (savedValue) {
      try {
        const parsed = JSON.parse(savedValue) as SessionSnapshot;

        if (parsed.sessionId && parsed.startedAt) {
          sessionRef.current = parsed;
          startedAtRef.current = parsed.startedAt;
        }
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }

    if (!sessionRef.current) {
      const nextSession = createSessionSnapshot();
      sessionRef.current = nextSession;
      startedAtRef.current = nextSession.startedAt;
      window.sessionStorage.setItem(storageKey, JSON.stringify(nextSession));
    }

    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, [formId]);

  useEffect(() => {
    latestStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    latestProgressRef.current = progressPercentage;
  }, [progressPercentage]);

  useEffect(() => {
    completedRef.current = isCompleted;
  }, [isCompleted]);

  const clearStoredSession = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.removeItem(buildStorageKey(formId));
    window.sessionStorage.removeItem(buildInternalNavigationKey(formId));
  }, [formId]);

  const prepareForInternalNavigation = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(buildInternalNavigationKey(formId), Date.now().toString());
  }, [formId]);

  const consumeInternalNavigationIntent = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const navigationKey = buildInternalNavigationKey(formId);
    const rawValue = window.sessionStorage.getItem(navigationKey);

    if (!rawValue) {
      return false;
    }

    window.sessionStorage.removeItem(navigationKey);

    const timestamp = Number(rawValue);

    return Number.isFinite(timestamp) && Date.now() - timestamp < 10_000;
  }, [formId]);

  const buildPayload = useCallback(
    (status: SaveFormDropOffPayload["status"], reason: FormDropOffReason) => {
      const now = new Date();
      const startedAt = startedAtRef.current ? new Date(startedAtRef.current) : now;
      const sessionId = sessionRef.current?.sessionId ?? "";

      const payload: SaveFormDropOffPayload = {
        ...readStoredUtmParams(),
        sessionId,
        userId,
        formId,
        formName,
        pageStage,
        currentStep: latestStepRef.current,
        currentField: currentFieldRef.current || undefined,
        progressPercentage: latestProgressRef.current,
        timeSpentInSeconds: Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 1000)),
        lastActiveAt: lastActiveAtRef.current,
        status,
        dropOffReason: reason
      };

      if (status === "abandoned") {
        payload.droppedAt = now.toISOString();
      } else {
        payload.completedAt = now.toISOString();
      }

      return payload;
    },
    [formId, formName, pageStage, userId]
  );

  const persist = useCallback(
    async (status: SaveFormDropOffPayload["status"], reason: FormDropOffReason, useBeacon = false) => {
      if (!sessionRef.current?.sessionId) {
        return;
      }

      if (completedRef.current && status === "abandoned") {
        return;
      }

      const payload = buildPayload(status, reason);
      const signature = JSON.stringify(payload);

      if (signature === lastSentSignatureRef.current) {
        return;
      }

      lastSentSignatureRef.current = signature;

      const body = JSON.stringify(payload);

      if (useBeacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const sent = navigator.sendBeacon(
          "/api/form-drop-off",
          new Blob([body], { type: "application/json" })
        );

        if (sent) {
          return;
        }
      }

      await fetch("/api/form-drop-off", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body,
        keepalive: true
      });
    },
    [buildPayload]
  );

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      void persist("abandoned", "inactivity");
    }, inactivityTimeoutMs);
  }, [inactivityTimeoutMs, persist]);

  const registerActivity = useCallback(
    (fieldName?: string) => {
      if (fieldName) {
        currentFieldRef.current = fieldName;
      }

      lastActiveAtRef.current = new Date().toISOString();

      if (mountedRef.current) {
        resetInactivityTimer();
      }
    },
    [resetInactivityTimer]
  );

  const markFieldInteraction = useCallback(
    (fieldName: string) => {
      registerActivity(fieldName);
    },
    [registerActivity]
  );

  const markFormCompleted = useCallback(async () => {
    completedRef.current = true;

    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    await persist("completed", "submit");
    clearStoredSession();
  }, [clearStoredSession, persist]);

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }

    const onUserActivity = (event: Event) => {
      registerActivity(getTrackedFieldName(event.target));
    };

    const trackedElement = formRef?.current ?? document;

    trackedElement.addEventListener("focusin", onUserActivity);
    trackedElement.addEventListener("input", onUserActivity);
    trackedElement.addEventListener("click", onUserActivity);

    registerActivity();

    return () => {
      trackedElement.removeEventListener("focusin", onUserActivity);
      trackedElement.removeEventListener("input", onUserActivity);
      trackedElement.removeEventListener("click", onUserActivity);
    };
  }, [formRef, registerActivity]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      void persist("abandoned", "beforeunload", true);
    };

    const handlePageHide = () => {
      void persist("abandoned", "pagehide", true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [persist]);

  useEffect(() => {
    return () => {
      if (!completedRef.current && !consumeInternalNavigationIntent()) {
        void persist("abandoned", "route-change", true);
      }

      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [consumeInternalNavigationIntent, persist]);

  return {
    markFieldInteraction,
    markFormCompleted,
    prepareForInternalNavigation,
    registerActivity,
    sessionId: sessionRef.current?.sessionId ?? ""
  };
}
