import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";

import { getMysqlPool } from "../../../lib/mysql";

const configuredTableName = process.env.MYSQL_DO_NOT_SELL_TABLE ?? "do_not_sell_requests";
const tableName = /^[A-Za-z0-9_]+$/.test(configuredTableName)
  ? configuredTableName
  : "do_not_sell_requests";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }

  return request.headers.get("x-real-ip") ?? "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      state?: string;
    };

    const email = body.email?.trim() ?? "";
    const state = body.state?.trim() ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!/^[A-Z]{2}$/.test(state)) {
      return NextResponse.json({ error: "Please select a valid state." }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    const ipAddress = getClientIp(request);
    const pool = getMysqlPool();

    await pool.execute<ResultSetHeader>(
      `INSERT INTO ${tableName} (
        email,
        state,
        user_agent,
        ip_address,
        created_at
      ) VALUES (?, ?, ?, ?, NOW())`,
      [email, state, userAgent, ipAddress]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save do not sell request", error);

    return NextResponse.json(
      {
        error: "Unable to submit your request right now."
      },
      { status: 500 }
    );
  }
}
