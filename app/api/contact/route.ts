import { NextRequest, NextResponse } from "next/server";

import { getSafeMongoCollectionName } from "../../../lib/mongo-collection-name";
import { getMongoCollection } from "../../../lib/mongodb";

const configuredCollectionName = process.env.MONGODB_CONTACT_COLLECTION ?? "contact_messages";
const collectionName = getSafeMongoCollectionName(configuredCollectionName, "contact_messages");

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
    const collection = await getMongoCollection(collectionName);

    await collection.insertOne({
      fullName,
      email,
      message,
      userAgent,
      ipAddress,
      createdAt: new Date()
    });

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
