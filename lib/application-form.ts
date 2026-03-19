export type ApplicationStepKind =
  | "purpose"
  | "credit"
  | "employment"
  | "financial"
  | "banking"
  | "qualifiers"
  | "debt"
  | "profile"
  | "phone"
  | "identity"
  | "ssn";

export type ApplicationFormData = {
  loanAmount: string;
  loanPurpose: string;
  zipCode: string;
  city: string;
  state: string;
  creditScore: string;
  employmentStatus: string;
  payFrequency: string;
  monthlyIncome: string;
  housingStatus: string;
  hasCheckingAccount: string;
  hasDirectDeposit: string;
  hasVehicleRegistration: string;
  militaryAffiliation: string;
  unsecuredDebt: string;
  phoneNumber: string;
  phoneConsent: boolean;
  dateOfBirth: string;
  streetAddress: string;
  ssn: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const initialApplicationFormState: ApplicationFormData = {
  loanAmount: "",
  loanPurpose: "",
  zipCode: "",
  city: "",
  state: "",
  creditScore: "",
  employmentStatus: "",
  payFrequency: "",
  monthlyIncome: "",
  housingStatus: "",
  hasCheckingAccount: "",
  hasDirectDeposit: "",
  hasVehicleRegistration: "",
  militaryAffiliation: "",
  unsecuredDebt: "",
  phoneNumber: "",
  phoneConsent: false,
  dateOfBirth: "",
  streetAddress: "",
  ssn: "",
  firstName: "",
  lastName: "",
  email: ""
};

export const namePattern = /^[A-Za-z][A-Za-z\s'-]{1,19}$/;
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const zipPattern = /^\d{5}$/;
export const dobPattern = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
export const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;

export type ApplicationFieldErrors = Partial<Record<keyof ApplicationFormData, string>>;

export function getPhoneDigits(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, "");
}

export function isLoanAmountValid(loanAmount: string) {
  if (!loanAmount) {
    return false;
  }

  const parsedAmount = Number(loanAmount);
  return /^\d+$/.test(loanAmount) && parsedAmount >= 100 && parsedAmount <= 40000;
}

export function getApplicationFieldErrors(formData: ApplicationFormData): ApplicationFieldErrors {
  return {
    loanAmount: isLoanAmountValid(formData.loanAmount)
      ? ""
      : "Loan amount must be between 100 and 40000.",
    loanPurpose: formData.loanPurpose ? "" : "Please select a loan purpose.",
    zipCode: zipPattern.test(formData.zipCode) ? "" : "Enter a valid 5-digit ZIP code.",
    creditScore: formData.creditScore ? "" : "Please choose your credit score range.",
    employmentStatus: formData.employmentStatus ? "" : "Please select your employment status.",
    payFrequency: formData.payFrequency ? "" : "Please select how often you are paid.",
    monthlyIncome:
      /^\d+$/.test(formData.monthlyIncome) && Number(formData.monthlyIncome) > 0
        ? ""
        : "Enter a valid monthly income.",
    housingStatus: formData.housingStatus ? "" : "Please choose your housing status.",
    hasCheckingAccount: formData.hasCheckingAccount
      ? ""
      : "Please tell us if you have a checking account.",
    hasDirectDeposit: formData.hasDirectDeposit
      ? ""
      : "Please tell us if you receive direct deposit.",
    hasVehicleRegistration: formData.hasVehicleRegistration
      ? ""
      : "Please tell us if you have a vehicle registered in your name.",
    militaryAffiliation: formData.militaryAffiliation ? "" : "Please select your military affiliation.",
    unsecuredDebt: formData.unsecuredDebt ? "" : "Please select your unsecured debt range.",
    firstName: namePattern.test(formData.firstName.trim())
      ? ""
      : "First name must be 2-20 letters and cannot include numbers.",
    lastName: namePattern.test(formData.lastName.trim())
      ? ""
      : "Last name must be 2-20 letters and cannot include numbers.",
    email: emailPattern.test(formData.email) ? "" : "Enter a valid email address.",
    phoneNumber: /^\d{10}$/.test(getPhoneDigits(formData.phoneNumber))
      ? ""
      : "Enter a valid 10-digit phone number.",
    phoneConsent: formData.phoneConsent ? "" : "Please provide consent to continue.",
    dateOfBirth: dobPattern.test(formData.dateOfBirth)
      ? ""
      : "Enter date of birth in DD-MM-YYYY format.",
    streetAddress: formData.streetAddress.trim().length > 4 ? "" : "Enter a valid street address.",
    ssn: ssnPattern.test(formData.ssn) ? "" : "Enter your SSN in XXX-XX-XXXX format."
  };
}

export function isApplicationStepValid(
  stepKind: ApplicationStepKind,
  formData: ApplicationFormData
) {
  const errors = getApplicationFieldErrors(formData);

  switch (stepKind) {
    case "purpose":
      return !errors.loanPurpose && !errors.zipCode;
    case "credit":
      return !errors.creditScore;
    case "employment":
      return !errors.employmentStatus && !errors.payFrequency;
    case "financial":
      return !errors.monthlyIncome && !errors.housingStatus;
    case "banking":
      return !errors.hasCheckingAccount && !errors.hasDirectDeposit;
    case "qualifiers":
      return !errors.hasVehicleRegistration && !errors.militaryAffiliation;
    case "debt":
      return !errors.unsecuredDebt;
    case "profile":
      return !errors.firstName && !errors.lastName && !errors.email;
    case "phone":
      return !errors.phoneNumber && !errors.phoneConsent;
    case "identity":
      return !errors.dateOfBirth && !errors.streetAddress;
    case "ssn":
      return !errors.ssn;
    default:
      return false;
  }
}

export function getCompletedApplicationFieldCount(formData: ApplicationFormData) {
  const errors = getApplicationFieldErrors(formData);

  const trackedFields: Array<keyof ApplicationFormData> = [
    "loanPurpose",
    "zipCode",
    "creditScore",
    "employmentStatus",
    "payFrequency",
    "monthlyIncome",
    "housingStatus",
    "hasCheckingAccount",
    "hasDirectDeposit",
    "hasVehicleRegistration",
    "militaryAffiliation",
    "unsecuredDebt",
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "phoneConsent",
    "dateOfBirth",
    "streetAddress",
    "ssn"
  ];

  return trackedFields.filter((field) => !errors[field]).length;
}
