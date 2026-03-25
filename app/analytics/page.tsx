import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";
import { getDropOffReport } from "../../lib/drop-off-report";
import { getDailyConversionReport } from "../../lib/google-analytics";

import styles from "./page.module.css";

type AnalyticsPageProps = {
  searchParams?: {
    tab?: string;
    startDate?: string;
    endDate?: string;
  };
};

export const dynamic = "force-dynamic";

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatSeconds(value: number) {
  if (value < 60) {
    return `${value}s`;
  }

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  return `${minutes}m ${seconds}s`;
}

function isValidDateInput(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const activeTab = searchParams?.tab === "dropoff" ? "dropoff" : "conversion";
  const startDate = isValidDateInput(searchParams?.startDate) ? searchParams?.startDate : undefined;
  const endDate = isValidDateInput(searchParams?.endDate) ? searchParams?.endDate : undefined;

  let report:
    | Awaited<ReturnType<typeof getDailyConversionReport>>
    | null = null;
  let dropOffReport:
    | Awaited<ReturnType<typeof getDropOffReport>>
    | null = null;
  let reportError = "";
  let dropOffReportError = "";

  try {
    report = await getDailyConversionReport(startDate, endDate);
  } catch (error) {
    reportError =
      error instanceof Error
        ? error.message
        : "Unable to load the Google Analytics conversion report right now.";
  }

  try {
    dropOffReport = await getDropOffReport(startDate, endDate);
  } catch (error) {
    dropOffReportError =
      error instanceof Error
        ? error.message
        : "Unable to load the drop-off report right now.";
  }

  return (
    <main>
      <Header />
      <section className={styles.analyticsPage}>
        <Container className={styles.analyticsInner}>
          <div className={styles.analyticsHeader}>
            <div>
              <p className={styles.analyticsEyebrow}>Google Analytics 4</p>
              <h1 className={styles.analyticsTitle}>Daily Conversion Report</h1>
              <p className={styles.analyticsIntro}>
                Review daily website visitors, completed applications, and conversion rate from
                your GA4 property.
              </p>
            </div>

            <form className={styles.filterForm} method="GET">
              <label className={styles.filterField}>
                <span>Start date</span>
                <input type="date" name="startDate" defaultValue={startDate} />
              </label>
              <label className={styles.filterField}>
                <span>End date</span>
                <input type="date" name="endDate" defaultValue={endDate} />
              </label>
              <input type="hidden" name="tab" value={activeTab} />
              <button type="submit" className={styles.filterButton}>
                Update Report
              </button>
            </form>
          </div>

          <div className={styles.tabBar}>
            <a
              href={`/analytics?tab=conversion${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`}
              className={
                activeTab === "conversion"
                  ? `${styles.tabLink} ${styles.tabLinkActive}`
                  : styles.tabLink
              }
            >
              Conversion Report
            </a>
            <a
              href={`/analytics?tab=dropoff${startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`}
              className={
                activeTab === "dropoff"
                  ? `${styles.tabLink} ${styles.tabLinkActive}`
                  : styles.tabLink
              }
            >
              Drop-Off Report
            </a>
          </div>

          {activeTab === "conversion" && reportError ? (
            <div className={styles.errorCard}>
              <h2>Report unavailable</h2>
              <p>{reportError}</p>
            </div>
          ) : null}

          {activeTab === "conversion" && report ? (
            <>
              <div className={styles.rangeCard}>
                <p>
                  <strong>Date range:</strong> {report.dateRange.startDate} to{" "}
                  {report.dateRange.endDate}
                </p>
                <p>
                  Conversion rate is calculated as completed applications divided by total users.
                </p>
              </div>

              <div className={styles.summaryGrid}>
                <article className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Total Users</p>
                  <p className={styles.summaryValue}>{formatInteger(report.totals.users)}</p>
                  <p className={styles.summaryNote}>Unique visitors recorded in GA4</p>
                </article>
                <article className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Total Sessions</p>
                  <p className={styles.summaryValue}>{formatInteger(report.totals.sessions)}</p>
                  <p className={styles.summaryNote}>All tracked browsing sessions</p>
                </article>
                <article className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Conversions</p>
                  <p className={styles.summaryValue}>{formatInteger(report.totals.conversions)}</p>
                  <p className={styles.summaryNote}>Completed loan application events</p>
                </article>
                <article className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Conversion Rate</p>
                  <p className={styles.summaryValue}>
                    {formatPercent(report.totals.conversionRate)}
                  </p>
                  <p className={styles.summaryNote}>Conversions divided by total users</p>
                </article>
              </div>

              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <h2>Daily Breakdown</h2>
                  <p>{report.daily.length} day(s)</p>
                </div>

                {report.daily.length > 0 ? (
                  <div className={styles.tableWrap}>
                    <table className={styles.reportTable}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Users</th>
                          <th>Sessions</th>
                          <th>Conversions</th>
                          <th>Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.daily.map((row) => (
                          <tr key={row.date}>
                            <td data-label="Date">{row.date}</td>
                            <td data-label="Users">{formatInteger(row.users)}</td>
                            <td data-label="Sessions">{formatInteger(row.sessions)}</td>
                            <td data-label="Conversions">{formatInteger(row.conversions)}</td>
                            <td data-label="Conversion Rate">{formatPercent(row.conversionRate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <h2>No GA4 report data yet</h2>
                    <p>
                      The property is connected, but no matching visitor or conversion data was
                      returned for this date range yet.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}

          {activeTab === "dropoff" && dropOffReportError ? (
            <div className={styles.errorCard}>
              <h2>Report unavailable</h2>
              <p>{dropOffReportError}</p>
            </div>
          ) : null}

          {activeTab === "dropoff" && dropOffReport ? (
            <>
              <div className={styles.rangeCard}>
                <p>
                  <strong>Date range:</strong> {dropOffReport.dateRange.startDate} to{" "}
                  {dropOffReport.dateRange.endDate}
                </p>
                <p>
                  This report uses your MongoDB funnel records and counts abandoned sessions by the
                  latest field, step, stage, and reason captured.
                </p>
              </div>

              <div className={styles.summaryGrid}>
                <article className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Abandoned Sessions</p>
                  <p className={styles.summaryValue}>
                    {formatInteger(dropOffReport.summary.abandonedSessions)}
                  </p>
                  <p className={styles.summaryNote}>Sessions marked as abandoned</p>
                </article>
                <article className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Completed Sessions</p>
                  <p className={styles.summaryValue}>
                    {formatInteger(dropOffReport.summary.completedSessions)}
                  </p>
                  <p className={styles.summaryNote}>Sessions marked as completed</p>
                </article>
                <article className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Avg Progress</p>
                  <p className={styles.summaryValue}>
                    {formatPercent(dropOffReport.summary.averageProgressPercentage)}
                  </p>
                  <p className={styles.summaryNote}>Average progress at abandonment</p>
                </article>
                <article className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>Avg Time Spent</p>
                  <p className={styles.summaryValue}>
                    {formatSeconds(dropOffReport.summary.averageTimeSpentInSeconds)}
                  </p>
                  <p className={styles.summaryNote}>Average time before drop-off</p>
                </article>
              </div>

              <div className={styles.breakdownGrid}>
                <div className={styles.tableCard}>
                  <div className={styles.tableHeader}>
                    <h2>Field-Wise Drop-Off</h2>
                    <p>{dropOffReport.fieldBreakdown.length} field(s)</p>
                  </div>
                  {dropOffReport.fieldBreakdown.length > 0 ? (
                    <div className={styles.tableWrap}>
                      <table className={styles.reportTable}>
                        <thead>
                          <tr>
                            <th>Field</th>
                            <th>Abandoned Sessions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dropOffReport.fieldBreakdown.map((row) => (
                            <tr key={row.label}>
                              <td data-label="Field">{row.label}</td>
                              <td data-label="Abandoned Sessions">{formatInteger(row.count)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <h2>No drop-off fields yet</h2>
                      <p>No abandoned session records matched this date range.</p>
                    </div>
                  )}
                </div>

                <div className={styles.tableCard}>
                  <div className={styles.tableHeader}>
                    <h2>Step Breakdown</h2>
                    <p>{dropOffReport.stepBreakdown.length} step(s)</p>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.reportTable}>
                      <thead>
                        <tr>
                          <th>Step</th>
                          <th>Abandoned Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dropOffReport.stepBreakdown.map((row) => (
                          <tr key={row.label}>
                            <td data-label="Step">{row.label}</td>
                            <td data-label="Abandoned Sessions">{formatInteger(row.count)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={styles.tableCard}>
                  <div className={styles.tableHeader}>
                    <h2>Page Stage Breakdown</h2>
                    <p>{dropOffReport.stageBreakdown.length} stage(s)</p>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.reportTable}>
                      <thead>
                        <tr>
                          <th>Stage</th>
                          <th>Abandoned Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dropOffReport.stageBreakdown.map((row) => (
                          <tr key={row.label}>
                            <td data-label="Stage">{row.label}</td>
                            <td data-label="Abandoned Sessions">{formatInteger(row.count)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={styles.tableCard}>
                  <div className={styles.tableHeader}>
                    <h2>Drop-Off Reason Breakdown</h2>
                    <p>{dropOffReport.reasonBreakdown.length} reason(s)</p>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.reportTable}>
                      <thead>
                        <tr>
                          <th>Reason</th>
                          <th>Abandoned Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dropOffReport.reasonBreakdown.map((row) => (
                          <tr key={row.label}>
                            <td data-label="Reason">{row.label}</td>
                            <td data-label="Abandoned Sessions">{formatInteger(row.count)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </Container>
      </section>
      <Footer />
    </main>
  );
}
