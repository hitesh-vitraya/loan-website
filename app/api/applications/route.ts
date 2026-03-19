import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";

import {
  ApplicationFormData,
  getApplicationFieldErrors,
  isLoanAmountValid
} from "../../../lib/application-form";
import { submitLeadApi } from "../../../lib/lead-api";
import { getMysqlPool } from "../../../lib/mysql";
import { lookupUsZip } from "../../../lib/us-zip";

const configuredTableName = process.env.MYSQL_APPLICATIONS_TABLE ?? "loan_applications";
const tableName = /^[A-Za-z0-9_]+$/.test(configuredTableName)
  ? configuredTableName
  : "loan_applications";
const logsTableName = "loan_application_api_logs";

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
    const pool = getMysqlPool();
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

    const [insertResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO ${tableName} (
        loan_amount,
        loan_purpose,
        zip_code,
        city,
        state,
        credit_score,
        employment_status,
        pay_frequency,
        monthly_income,
        housing_status,
        has_checking_account,
        has_direct_deposit,
        has_vehicle_registration,
        military_affiliation,
        unsecured_debt,
        first_name,
        last_name,
        email,
        phone_number,
        phone_consent,
        date_of_birth,
        street_address,
        ssn,
        user_agent,
        ip_address,
        lead_api_status,
        lead_api_http_status,
        lead_api_last_error,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        enrichedFormData.loanAmount || null,
        enrichedFormData.loanPurpose,
        enrichedFormData.zipCode,
        enrichedFormData.city,
        enrichedFormData.state,
        enrichedFormData.creditScore,
        enrichedFormData.employmentStatus,
        enrichedFormData.payFrequency,
        enrichedFormData.monthlyIncome,
        enrichedFormData.housingStatus,
        enrichedFormData.hasCheckingAccount,
        enrichedFormData.hasDirectDeposit,
        enrichedFormData.hasVehicleRegistration,
        enrichedFormData.militaryAffiliation,
        enrichedFormData.unsecuredDebt,
        enrichedFormData.firstName.trim(),
        enrichedFormData.lastName.trim(),
        enrichedFormData.email.trim(),
        enrichedFormData.phoneNumber,
        enrichedFormData.phoneConsent ? 1 : 0,
        enrichedFormData.dateOfBirth,
        enrichedFormData.streetAddress.trim(),
        enrichedFormData.ssn,
        userAgent,
        ipAddress,
        "pending",
        null,
        null
      ]
    );

    const applicationId = insertResult.insertId;

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

      await pool.execute(
        `INSERT INTO ${logsTableName} (
          application_id,
          api_name,
          request_body,
          response_body,
          response_http_status,
          was_successful,
          duration_ms,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [applicationId, "cashcorner-generic-postlead", "{}", errorMessage, 0, 0, 0]
      );

      await pool.execute(
        `UPDATE ${tableName}
         SET lead_api_status = ?, lead_api_http_status = ?, lead_api_last_error = ?
         WHERE id = ?`,
        ["failed", 0, errorMessage, applicationId]
      );

      return NextResponse.json(
        {
          error: "Lead saved locally but external API submission failed.",
          applicationId,
          details: process.env.NODE_ENV === "development" ? errorMessage : undefined
        },
        { status: 502 }
      );
    }

    await pool.execute(
      `INSERT INTO ${logsTableName} (
        application_id,
        api_name,
        request_body,
        response_body,
        response_http_status,
        was_successful,
        duration_ms,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        applicationId,
        "cashcorner-generic-postlead",
        JSON.stringify(leadApiResult.requestPayload),
        leadApiResult.responseBody,
        leadApiResult.status,
        leadApiResult.ok ? 1 : 0,
        leadApiResult.durationMs
      ]
    );

    await pool.execute(
      `UPDATE ${tableName}
       SET lead_api_status = ?, lead_api_http_status = ?, lead_api_last_error = ?
       WHERE id = ?`,
      [
        leadApiResult.ok ? "success" : "failed",
        leadApiResult.status,
        leadApiResult.ok ? null : leadApiResult.responseBody,
        applicationId
      ]
    );

    if (!leadApiResult.ok) {
      return NextResponse.json(
        {
          error: "Lead saved locally but external API submission failed.",
          applicationId,
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
      applicationId,
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
