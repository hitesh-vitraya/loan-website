import { NextRequest, NextResponse } from "next/server";

import {
  ApplicationFormData,
  getApplicationFieldErrors,
  isLoanAmountValid
} from "../../../lib/application-form";
import { submitLeadApi } from "../../../lib/lead-api";
import { getSafeMongoCollectionName } from "../../../lib/mongo-collection-name";
import { getMongoCollection } from "../../../lib/mongodb";
import { lookupUsZip } from "../../../lib/us-zip";

const configuredCollectionName = process.env.MONGODB_APPLICATIONS_COLLECTION ?? "loan_applications";
const applicationsCollectionName = getSafeMongoCollectionName(
  configuredCollectionName,
  "loan_applications"
);
const configuredLogsCollectionName =
  process.env.MONGODB_APPLICATION_LOGS_COLLECTION ?? "loan_application_api_logs";
const logsCollectionName = getSafeMongoCollectionName(
  configuredLogsCollectionName,
  "loan_application_api_logs"
);

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }

  return request.headers.get("x-real-ip") ?? "";
}

function getInvalidFieldEntries(formData: ApplicationFormData) {
  const fieldErrors = getApplicationFieldErrors(formData);

  return Object.entries(fieldErrors).filter(([field, message]) => {
    if (field === "loanAmount") {
      return Boolean(formData.loanAmount) && Boolean(message);
    }

    return Boolean(message);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = (await request.json()) as ApplicationFormData;
    const invalidFieldEntries = getInvalidFieldEntries(formData);

    if (invalidFieldEntries.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          fieldErrors: Object.fromEntries(invalidFieldEntries)
        },
        { status: 400 }
      );
    }

    if (formData.loanAmount && !isLoanAmountValid(formData.loanAmount)) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          fieldErrors: {
            loanAmount: "Loan amount must be between 100 and 40000."
          }
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    const ipAddress = getClientIp(request);
    const applicationsCollection = await getMongoCollection(applicationsCollectionName);
    const logsCollection = await getMongoCollection(logsCollectionName);
    const location = await lookupUsZip(formData.zipCode);

    if (!location) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          fieldErrors: {
            zipCode: "Enter a valid US ZIP code."
          }
        },
        { status: 400 }
      );
    }

    const enrichedFormData = {
      ...formData,
      city: location.city,
      state: location.state
    };

    const insertResult = await applicationsCollection.insertOne({
      loanAmount: enrichedFormData.loanAmount || null,
      loanPurpose: enrichedFormData.loanPurpose,
      zipCode: enrichedFormData.zipCode,
      city: enrichedFormData.city,
      state: enrichedFormData.state,
      creditScore: enrichedFormData.creditScore,
      employmentStatus: enrichedFormData.employmentStatus,
      payFrequency: enrichedFormData.payFrequency,
      monthlyIncome: enrichedFormData.monthlyIncome,
      housingStatus: enrichedFormData.housingStatus,
      hasCheckingAccount: enrichedFormData.hasCheckingAccount,
      hasDirectDeposit: enrichedFormData.hasDirectDeposit,
      hasVehicleRegistration: enrichedFormData.hasVehicleRegistration,
      militaryAffiliation: enrichedFormData.militaryAffiliation,
      unsecuredDebt: enrichedFormData.unsecuredDebt,
      firstName: enrichedFormData.firstName.trim(),
      lastName: enrichedFormData.lastName.trim(),
      email: enrichedFormData.email.trim(),
      phoneNumber: enrichedFormData.phoneNumber,
      phoneConsent: enrichedFormData.phoneConsent,
      dateOfBirth: enrichedFormData.dateOfBirth,
      streetAddress: enrichedFormData.streetAddress.trim(),
      ssn: enrichedFormData.ssn,
      userAgent,
      ipAddress,
      leadApiStatus: "pending",
      leadApiHttpStatus: null,
      leadApiLastError: null,
      createdAt: new Date()
    });

    const applicationId = insertResult.insertedId;
    const applicationIdString = applicationId.toHexString();

    let leadApiResult:
      | {
          ok: boolean;
          status: number;
          requestPayload: Record<string, string>;
          responseBody: string;
          responseHeaders: Record<string, string>;
          durationMs: number;
        }
      | undefined;

    try {
      leadApiResult = await submitLeadApi(enrichedFormData, userAgent, ipAddress);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown lead API error.";

      await logsCollection.insertOne({
        applicationId,
        apiName: "cashcorner-generic-postlead",
        requestBody: {},
        responseBody: errorMessage,
        responseHttpStatus: 0,
        wasSuccessful: false,
        durationMs: 0,
        createdAt: new Date()
      });

      await applicationsCollection.updateOne(
        { _id: applicationId },
        {
          $set: {
            leadApiStatus: "failed",
            leadApiHttpStatus: 0,
            leadApiLastError: errorMessage
          }
        }
      );

      return NextResponse.json(
        {
          error: "Lead saved locally but external API submission failed.",
          applicationId: applicationIdString,
          details: process.env.NODE_ENV === "development" ? errorMessage : undefined
        },
        { status: 502 }
      );
    }

    await logsCollection.insertOne({
      applicationId,
      apiName: "cashcorner-generic-postlead",
      requestBody: leadApiResult.requestPayload,
      responseBody: leadApiResult.responseBody,
      responseHttpStatus: leadApiResult.status,
      wasSuccessful: leadApiResult.ok,
      durationMs: leadApiResult.durationMs,
      createdAt: new Date()
    });

    await applicationsCollection.updateOne(
      { _id: applicationId },
      {
        $set: {
          leadApiStatus: leadApiResult.ok ? "success" : "failed",
          leadApiHttpStatus: leadApiResult.status,
          leadApiLastError: leadApiResult.ok ? null : leadApiResult.responseBody
        }
      }
    );

    if (!leadApiResult.ok) {
      return NextResponse.json(
        {
          error: "Lead saved locally but external API submission failed.",
          applicationId: applicationIdString,
          leadApi: {
            ok: leadApiResult.ok,
            status: leadApiResult.status,
            responseBody: leadApiResult.responseBody
          }
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      applicationId: applicationIdString,
      leadApi: {
        ok: leadApiResult.ok,
        status: leadApiResult.status,
        responseBody: leadApiResult.responseBody
      }
    });
  } catch (error) {
    console.error("Failed to save application", error);

    return NextResponse.json(
      {
        error: "Unable to save your application right now.",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
