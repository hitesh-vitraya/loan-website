import { BetaAnalyticsDataClient } from "@google-analytics/data";

const DEFAULT_REPORT_RANGE_DAYS = 30;
const GA_COMPLETION_EVENT_NAME = "loan_application_completed";

type DailyMetricRow = {
  date: string;
  users: number;
  sessions: number;
  conversions: number;
  conversionRate: number;
};

type ReportRow = {
  dimensionValues?: Array<{ value?: string | null } | null> | null;
  metricValues?: Array<{ value?: string | null } | null> | null;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getReportSecret() {
  return process.env.GA4_REPORT_API_SECRET;
}

function getAnalyticsDataClient() {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: getRequiredEnv("GA4_CLIENT_EMAIL"),
      private_key: getRequiredEnv("GA4_PRIVATE_KEY").replace(/\\n/g, "\n")
    },
    projectId: getRequiredEnv("GA4_PROJECT_ID")
  });
}

function getPropertyName() {
  return `properties/${getRequiredEnv("GA4_PROPERTY_ID")}`;
}

function formatDateString(value?: string | null) {
  const normalizedValue = value ?? "";

  if (!/^\d{8}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, 4)}-${normalizedValue.slice(4, 6)}-${normalizedValue.slice(6, 8)}`;
}

function parseMetricValue(value?: string | null) {
  const parsed = Number(value ?? "0");

  return Number.isFinite(parsed) ? parsed : 0;
}

function buildDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - (DEFAULT_REPORT_RANGE_DAYS - 1));
  return date.toISOString().slice(0, 10);
}

function buildDailyRows(
  trafficRows: ReportRow[] | null | undefined = [],
  conversionRows: ReportRow[] | null | undefined = []
) {
  const rowsByDate = new Map<string, DailyMetricRow>();

  for (const row of trafficRows ?? []) {
    const date = formatDateString(row.dimensionValues?.[0]?.value ?? "");

    rowsByDate.set(date, {
      date,
      users: parseMetricValue(row.metricValues?.[0]?.value),
      sessions: parseMetricValue(row.metricValues?.[1]?.value),
      conversions: 0,
      conversionRate: 0
    });
  }

  for (const row of conversionRows ?? []) {
    const date = formatDateString(row.dimensionValues?.[0]?.value ?? "");
    const existingRow = rowsByDate.get(date) ?? {
      date,
      users: 0,
      sessions: 0,
      conversions: 0,
      conversionRate: 0
    };

    existingRow.conversions = parseMetricValue(row.metricValues?.[0]?.value);
    rowsByDate.set(date, existingRow);
  }

  return Array.from(rowsByDate.values())
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((row) => ({
      ...row,
      conversionRate: row.users > 0 ? Number(((row.conversions / row.users) * 100).toFixed(2)) : 0
    }));
}

export async function getDailyConversionReport(startDate?: string, endDate?: string) {
  const client = getAnalyticsDataClient();
  const property = getPropertyName();
  const dateRange = {
    startDate: startDate || buildDefaultStartDate(),
    endDate: endDate || "today"
  };

  const [trafficReport, conversionReport] = await Promise.all([
    client.runReport({
      property,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }],
      dateRanges: [dateRange],
      orderBys: [{ dimension: { dimensionName: "date" } }]
    }),
    client.runReport({
      property,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dateRanges: [dateRange],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: {
            matchType: "EXACT",
            value: GA_COMPLETION_EVENT_NAME
          }
        }
      },
      orderBys: [{ dimension: { dimensionName: "date" } }]
    })
  ]);

  const daily = buildDailyRows(trafficReport[0].rows, conversionReport[0].rows);
  const totals = daily.reduce(
    (accumulator, row) => ({
      users: accumulator.users + row.users,
      sessions: accumulator.sessions + row.sessions,
      conversions: accumulator.conversions + row.conversions
    }),
    { users: 0, sessions: 0, conversions: 0 }
  );

  return {
    dateRange,
    totals: {
      ...totals,
      conversionRate: totals.users > 0 ? Number(((totals.conversions / totals.users) * 100).toFixed(2)) : 0
    },
    daily
  };
}

export function validateReportSecret(providedSecret: string | null) {
  const configuredSecret = getReportSecret();

  if (!configuredSecret) {
    return true;
  }

  return providedSecret === configuredSecret;
}
