import { NextRequest, NextResponse } from "next/server";

import { getSafeMongoCollectionName } from "../../../lib/mongo-collection-name";
import { getMongoCollection } from "../../../lib/mongodb";

const configuredCollectionName = process.env.MONGODB_DO_NOT_SELL_COLLECTION ?? "do_not_sell_requests";
const collectionName = getSafeMongoCollectionName(configuredCollectionName, "do_not_sell_requests");

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
    const collection = await getMongoCollection(collectionName);

    await collection.insertOne({
      email,
      state,
      userAgent,
      ipAddress,
      createdAt: new Date()
    });

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
