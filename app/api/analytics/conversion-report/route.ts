import { NextRequest, NextResponse } from "next/server";

import { getDailyConversionReport, validateReportSecret } from "../../../../lib/google-analytics";

export async function GET(request: NextRequest) {
  if (!validateReportSecret(request.headers.get("x-report-secret"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const startDate = request.nextUrl.searchParams.get("startDate") ?? undefined;
    const endDate = request.nextUrl.searchParams.get("endDate") ?? undefined;
    const report = await getDailyConversionReport(startDate, endDate);

    return NextResponse.json({
      ok: true,
      ...report
    });
  } catch (error) {
    console.error("Failed to generate GA4 conversion report", error);

    return NextResponse.json(
      {
        error: "Unable to generate the GA4 conversion report right now."
      },
      { status: 500 }
    );
  }
}
