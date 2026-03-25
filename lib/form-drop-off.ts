import type { UtmParams } from "./utm";

export type FormSessionStatus = "abandoned" | "completed";
export type FormPageStage = "home" | "apply";
export const APPLICATION_FUNNEL_ID = "loan-application-funnel";
export const APPLICATION_FUNNEL_NAME = "Loan Application Funnel";
export const APPLICATION_FUNNEL_FIELD_COUNT = 21;

export type FormDropOffReason =
  | "beforeunload"
  | "pagehide"
  | "route-change"
  | "inactivity"
  | "submit";

export type SaveFormDropOffPayload = UtmParams & {
  sessionId: string;
  userId?: string;
  formId: string;
  formName?: string;
  pageStage: FormPageStage;
  currentStep: number;
  currentField?: string;
  progressPercentage: number;
  timeSpentInSeconds: number;
  lastActiveAt: string;
  droppedAt?: string;
  completedAt?: string;
  status: FormSessionStatus;
  dropOffReason?: FormDropOffReason;
};

export function clampProgressPercentage(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeSessionStatus(status: string): FormSessionStatus | null {
  if (status === "abandoned" || status === "completed") {
    return status;
  }

  return null;
}

export function normalizePageStage(stage: string): FormPageStage | null {
  if (stage === "home" || stage === "apply") {
    return stage;
  }

  return null;
}

export function parseIsoDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}
