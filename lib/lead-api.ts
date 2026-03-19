import { headers } from "next/headers";

import { ApplicationFormData, getPhoneDigits } from "./application-form";

export type LeadApiPayload = Record<string, string>;

export type LeadApiResult = {
  ok: boolean;
  status: number;
  requestPayload: LeadApiPayload;
  responseBody: string;
  responseHeaders: Record<string, string>;
  durationMs: number;
};

function getRequiredLeadEnv(name: string) {
  const value = process.env[name];

  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required lead API environment variable: ${name}`);
  }

  return value;
}

function formatDateOfBirth(dateOfBirth: string) {
  const parts = dateOfBirth.split("-");

  if (parts.length !== 3) {
    return "";
  }

  const [day, month, year] = parts;
  return `${month}/${day}/${year}`;
}

function mapCreditStatus(creditScore: string) {
  switch (creditScore) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "fair":
      return "Fair";
    case "poor":
      return "Bad";
    default:
      return "Very Bad";
  }
}

function mapPrimaryIncomeSource(employmentStatus: string) {
  switch (employmentStatus) {
    case "full-time":
    case "part-time":
      return "Employed";
    case "self-employed":
      return "Self Employed";
    case "benefits":
      return "Benefits";
    case "unemployed":
      return "Unemployed";
    default:
      return "";
  }
}

function mapPayPeriod(payFrequency: string) {
  switch (payFrequency) {
    case "weekly":
      return "Weekly";
    case "bi-weekly":
      return "Every 2 Weeks";
    case "twice-monthly":
      return "Twice A Month";
    case "monthly":
      return "Monthly";
    default:
      return "";
  }
}

function mapLoanPurpose(loanPurpose: string) {
  switch (loanPurpose) {
    case "auto":
      return "Auto";
    case "credit_card_consolidation":
      return "Credit Card";
    case "debt_consolidation":
      return "Debt Consolidation";
    case "debt_settlement":
      return "Debt Settlement";
    case "education":
      return "Education";
    case "home_improvement":
      return "Home Improvement";
    case "medical":
      return "Medical";
    case "relocation":
      return "Relocation";
    case "renewable_energy":
      return "Renewable Energy";
    case "small_business":
      return "Small Business";
    case "travel":
      return "Travel";
    case "wedding":
      return "Wedding";
    default:
      return "Other";
  }
}

function mapOwnRent(housingStatus: string) {
  switch (housingStatus) {
    case "own":
      return "Own";
    case "rent":
      return "Rent";
    default:
      return "";
  }
}

function mapMilitary(militaryAffiliation: string) {
  return militaryAffiliation && militaryAffiliation !== "none" ? "Yes" : "No";
}

function mapPaycheckType(hasDirectDeposit: string) {
  return hasDirectDeposit === "yes" ? "Direct Deposit" : "Paper Check";
}

function mapAccountType(hasCheckingAccount: string) {
  return hasCheckingAccount === "yes" ? "Checking" : "";
}

function mapUnsecuredDebtAmount(unsecuredDebt: string) {
  switch (unsecuredDebt) {
    case "none":
      return "0";
    case "under-5000":
      return "5000";
    case "5000-10000":
      return "10000";
    case "10000-plus":
      return "10000";
    default:
      return "";
  }
}

function getLandingPageHost() {
  return process.env.LEAD_API_LANDING_PAGE ?? "leads.cashcorner.com";
}

function getSourceUrl() {
  const configured = process.env.LEAD_API_SOURCE_URL;

  if (configured) {
    return configured;
  }

  const host = headers().get("host");
  return host ? `https://${host}` : "";
}

export function buildLeadApiPayload(formData: ApplicationFormData, userAgent: string, ipAddress: string) {
  const phoneDigits = getPhoneDigits(formData.phoneNumber);

  return {
    Test_Lead: process.env.LEAD_API_TEST_LEAD ?? "",
    TYPE: process.env.LEAD_API_TYPE ?? "69",
    Landing_Page: getLandingPageHost(),
    Return_Dynamic_Cost: process.env.LEAD_API_RETURN_DYNAMIC_COST ?? "1",
    Submit_Type: process.env.LEAD_API_SUBMIT_TYPE ?? "Real Time",
    CashOfferType: getRequiredLeadEnv("LEAD_API_CASH_OFFER_TYPE"),
    PostedFrom: getRequiredLeadEnv("LEAD_API_POSTED_FROM"),
    Affiliate_ID: getRequiredLeadEnv("LEAD_API_AFFILIATE_ID"),
    SRC: getRequiredLeadEnv("LEAD_API_SRC"),
    Campaign_ID: getRequiredLeadEnv("LEAD_API_CAMPAIGN_ID"),
    Pub_ID: getRequiredLeadEnv("LEAD_API_PUB_ID"),
    Sub_ID: process.env.LEAD_API_SUB_ID ?? "",
    Sub_ID_2: process.env.LEAD_API_SUB_ID_2 ?? "",
    SourceUrl: getSourceUrl(),
    IP_Address: ipAddress,
    Mobile: "Yes",
    User_Agent: userAgent,
    Consent: formData.phoneConsent ? "Yes" : "No",
    ConsentFCRA: "Yes",
    Email: formData.email.trim(),
    First_Name: formData.firstName.trim(),
    Last_Name: formData.lastName.trim(),
    Address: formData.streetAddress.trim(),
    City: formData.city,
    State: formData.state,
    Zip: formData.zipCode,
    Home_Phone: phoneDigits,
    Loan_Amount: formData.loanAmount,
    SSN: formData.ssn.replace(/\D/g, ""),
    Date_Of_Birth: formatDateOfBirth(formData.dateOfBirth),
    Own_Rent: mapOwnRent(formData.housingStatus),
    Military: mapMilitary(formData.militaryAffiliation),
    Primary_Source_Of_Income: mapPrimaryIncomeSource(formData.employmentStatus),
    Monthly_Income: formData.monthlyIncome,
    Pay_Period: mapPayPeriod(formData.payFrequency),
    Paycheck_Type: mapPaycheckType(formData.hasDirectDeposit),
    Account_Type: mapAccountType(formData.hasCheckingAccount),
    Routing_Number: process.env.LEAD_API_ROUTING_NUMBER ?? "",
    Account_Number: process.env.LEAD_API_ACCOUNT_NUMBER ?? "",
    Bank_Name: process.env.LEAD_API_BANK_NAME ?? "",
    Employer: process.env.LEAD_API_EMPLOYER ?? "",
    Credit_Status: mapCreditStatus(formData.creditScore),
    Auto_Status: process.env.LEAD_API_AUTO_STATUS ?? "",
    Home_Improvement_Reason: process.env.LEAD_API_HOME_IMPROVEMENT_REASON ?? "",
    Unsecured_Debt_Amount: mapUnsecuredDebtAmount(formData.unsecuredDebt),
    Loan_Purpose: mapLoanPurpose(formData.loanPurpose)
  };
}

export async function submitLeadApi(
  formData: ApplicationFormData,
  userAgent: string,
  ipAddress: string
): Promise<LeadApiResult> {
  const url = getRequiredLeadEnv("LEAD_API_URL");
  const requestPayload = buildLeadApiPayload(formData, userAgent, ipAddress);
  const body = new URLSearchParams(requestPayload);
  const startedAt = Date.now();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString(),
    cache: "no-store"
  });

  const responseBody = await response.text();
  const responseHeaders = Object.fromEntries(response.headers.entries());

  return {
    ok: response.ok,
    status: response.status,
    requestPayload,
    responseBody,
    responseHeaders,
    durationMs: Date.now() - startedAt
  };
}
