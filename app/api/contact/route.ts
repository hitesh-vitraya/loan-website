import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";

import { getMysqlPool } from "../../../lib/mysql";

const configuredTableName = process.env.MYSQL_CONTACT_TABLE ?? "contact_messages";
const tableName = /^[A-Za-z0-9_]+$/.test(configuredTableName)
  ? configuredTableName
  : "contact_messages";

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
      fullName?: string;
      email?: string;
      message?: string;
    };

    const fullName = body.fullName?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (fullName.length < 2) {
      return NextResponse.json({ error: "Full name must be at least 2 characters." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    const ipAddress = getClientIp(request);
    const pool = getMysqlPool();

    await pool.execute<ResultSetHeader>(
      `INSERT INTO ${tableName} (
        full_name,
        email,
        message,
        user_agent,
        ip_address,
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [fullName, email, message, userAgent, ipAddress]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save contact message", error);

    return NextResponse.json(
      {
        error: "Unable to submit your message right now."
      },
      { status: 500 }
    );
  }
}
