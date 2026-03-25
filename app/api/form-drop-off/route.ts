import { NextRequest, NextResponse } from "next/server";

import {
  clampProgressPercentage,
  normalizePageStage,
  normalizeSessionStatus,
  parseIsoDate,
  SaveFormDropOffPayload
} from "../../../lib/form-drop-off";
import { connectMongoose } from "../../../lib/mongoose";
import { FormDropOffModel } from "../../../models/FormDropOff";

async function parseRequestBody(request: NextRequest) {
  const text = await request.text();
  return JSON.parse(text) as SaveFormDropOffPayload;
}

function validatePayload(payload: SaveFormDropOffPayload) {
  const pageStage = normalizePageStage(payload.pageStage);
  const status = normalizeSessionStatus(payload.status);
  const lastActiveAt = parseIsoDate(payload.lastActiveAt);
  const droppedAt = parseIsoDate(payload.droppedAt);
  const completedAt = parseIsoDate(payload.completedAt);

  if (!payload.sessionId?.trim()) {
    return { error: "sessionId is required." };
  }

  if (!payload.formId?.trim()) {
    return { error: "formId is required." };
  }

  if (!pageStage) {
    return { error: "pageStage must be home or apply." };
  }

  if (!status) {
    return { error: "status must be abandoned or completed." };
  }

  if (!Number.isFinite(payload.currentStep) || payload.currentStep < 1) {
    return { error: "currentStep must be a positive number." };
  }

  if (!Number.isFinite(payload.timeSpentInSeconds) || payload.timeSpentInSeconds < 0) {
    return { error: "timeSpentInSeconds must be a non-negative number." };
  }

  if (!lastActiveAt) {
    return { error: "lastActiveAt must be a valid ISO date." };
  }

  if (status === "abandoned" && !droppedAt) {
    return { error: "droppedAt must be a valid ISO date for abandoned sessions." };
  }

  if (status === "completed" && !completedAt) {
    return { error: "completedAt must be a valid ISO date for completed sessions." };
  }

  return {
    pageStage,
    status,
    lastActiveAt,
    droppedAt,
    completedAt
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parseRequestBody(request);
    const validationResult = validatePayload(payload);

    if ("error" in validationResult) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    await connectMongoose();

    const existingRecord = await FormDropOffModel.findOne({
      sessionId: payload.sessionId,
      formId: payload.formId
    })
      .select({ status: 1 })
      .lean();

    if (existingRecord?.status === "completed" && validationResult.status === "abandoned") {
      return NextResponse.json({
        ok: true,
        ignored: true,
        sessionId: payload.sessionId,
        status: existingRecord.status
      });
    }

    const update = {
      sessionId: payload.sessionId.trim(),
      userId: payload.userId?.trim() || null,
      formId: payload.formId.trim(),
      formName: payload.formName?.trim() || null,
      utmSource: payload.utmSource?.trim() || null,
      utmMedium: payload.utmMedium?.trim() || null,
      utmCampaign: payload.utmCampaign?.trim() || null,
      pageStage: validationResult.pageStage,
      currentStep: Math.round(payload.currentStep),
      currentField: payload.currentField?.trim() || null,
      progressPercentage: clampProgressPercentage(payload.progressPercentage),
      timeSpentInSeconds: Math.round(payload.timeSpentInSeconds),
      lastActiveAt: validationResult.lastActiveAt,
      droppedAt: validationResult.status === "abandoned" ? validationResult.droppedAt : null,
      completedAt: validationResult.status === "completed" ? validationResult.completedAt : null,
      status: validationResult.status,
      dropOffReason: payload.dropOffReason ?? null
    };

    const savedRecord = await FormDropOffModel.findOneAndUpdate(
      {
        sessionId: payload.sessionId.trim(),
        formId: payload.formId.trim()
      },
      {
        $set: update
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).lean();

    return NextResponse.json({
      ok: true,
      sessionId: savedRecord.sessionId,
      status: savedRecord.status
    });
  } catch (error) {
    console.error("Failed to save form drop-off analytics", error);

    return NextResponse.json(
      {
        error: "Unable to save form drop-off analytics right now."
      },
      { status: 500 }
    );
  }
}
