import { NextRequest, NextResponse } from "next/server";

import { lookupUsZip } from "../../../lib/us-zip";

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip")?.trim() ?? "";

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      {
        valid: false,
        error: "Enter a valid 5-digit ZIP code."
      },
      { status: 400 }
    );
  }

  const location = await lookupUsZip(zip);

  if (!location) {
    return NextResponse.json(
      {
        valid: false,
        error: "Enter a valid US ZIP code."
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    valid: true,
    zip,
    city: location.city,
    state: location.state
  });
}
