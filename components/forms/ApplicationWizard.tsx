"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useRef, useState } from "react";

import { applicationSteps } from "../../data/application";
import { useFormDropOffTracker } from "../../hooks/useFormDropOffTracker";
import {
  APPLICATION_FUNNEL_FIELD_COUNT,
  APPLICATION_FUNNEL_ID,
  APPLICATION_FUNNEL_NAME
} from "../../lib/form-drop-off";
import {
  ApplicationFormData,
  getApplicationFieldErrors,
  getCompletedApplicationFieldCount,
  initialApplicationFormState,
  isApplicationStepValid,
  isLoanAmountValid
} from "../../lib/application-form";
import { trackLoanApplicationCompleted } from "../../lib/gtag";
import { readStoredUtmParams } from "../../lib/utm";

import styles from "./ApplicationWizard.module.css";

type FieldErrors = Partial<Record<keyof ApplicationFormData, string>>;

type ApplicationWizardProps = {
  initialLoanAmount?: string;
};

export function ApplicationWizard({ initialLoanAmount }: ApplicationWizardProps) {
  const router = useRouter();
  const normalizedInitialLoanAmount =
    initialLoanAmount && isLoanAmountValid(initialLoanAmount) ? initialLoanAmount : "";
  const shouldAskLoanAmount = !normalizedInitialLoanAmount;
  const [stepIndex, setStepIndex] = useState(0);
  const [formState, setFormState] = useState<ApplicationFormData>(() => ({
    ...initialApplicationFormState,
    loanAmount: normalizedInitialLoanAmount
  }));
  const [submitted, setSubmitted] = useState(false);
  const [attemptedSteps, setAttemptedSteps] = useState<Record<number, boolean>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [asyncFieldErrors, setAsyncFieldErrors] = useState<FieldErrors>({});
  const formContainerRef = useRef<HTMLDivElement>(null);

  const isLoanAmountStep = shouldAskLoanAmount && stepIndex === 0;
  const step = isLoanAmountStep
    ? null
    : applicationSteps[shouldAskLoanAmount ? stepIndex - 1 : stepIndex];
  const totalStepCount = applicationSteps.length + (shouldAskLoanAmount ? 1 : 0);
  const isFinalStep = stepIndex === totalStepCount - 1;
  const currentTitle = isLoanAmountStep ? "How much would you like to borrow?" : step?.title ?? "";
  const currentSubtitle = isLoanAmountStep
    ? "Start with the amount you need so we can tailor the rest of the application."
    : step?.subtitle ?? "";

  const completedFieldCount = useMemo(
    () => getCompletedApplicationFieldCount(formState, { includeLoanAmount: true }),
    [formState]
  );

  const totalFieldCount = APPLICATION_FUNNEL_FIELD_COUNT;
  const progressPercent = Math.round((completedFieldCount / totalFieldCount) * 100);
  const funnelStepNumber = isLoanAmountStep ? 1 : stepIndex + 2;

  const { markFieldInteraction, markFormCompleted, prepareForInternalNavigation } =
    useFormDropOffTracker({
      formId: APPLICATION_FUNNEL_ID,
      formName: APPLICATION_FUNNEL_NAME,
      pageStage: "apply",
      currentStep: funnelStepNumber,
      progressPercentage: progressPercent,
      isCompleted: submitted,
      formRef: formContainerRef
    });

  const allFieldErrors = useMemo(() => getApplicationFieldErrors(formState), [formState]);

  const fieldErrors: FieldErrors = useMemo(() => {
    if (isLoanAmountStep) {
      return {
        loanAmount: allFieldErrors.loanAmount
      };
    }

    if (!step) {
      return {};
    }

    switch (step.kind) {
      case "purpose":
        return {
          loanPurpose: allFieldErrors.loanPurpose,
          zipCode: allFieldErrors.zipCode
        };
      case "credit":
        return {
          creditScore: allFieldErrors.creditScore
        };
      case "employment":
        return {
          employmentStatus: allFieldErrors.employmentStatus,
          payFrequency: allFieldErrors.payFrequency
        };
      case "financial":
        return {
          monthlyIncome: allFieldErrors.monthlyIncome,
          housingStatus: allFieldErrors.housingStatus
        };
      case "banking":
        return {
          hasCheckingAccount: allFieldErrors.hasCheckingAccount,
          hasDirectDeposit: allFieldErrors.hasDirectDeposit
        };
      case "qualifiers":
        return {
          hasVehicleRegistration: allFieldErrors.hasVehicleRegistration,
          militaryAffiliation: allFieldErrors.militaryAffiliation
        };
      case "debt":
        return {
          unsecuredDebt: allFieldErrors.unsecuredDebt
        };
      case "profile":
        return {
          firstName: allFieldErrors.firstName,
          lastName: allFieldErrors.lastName,
          email: allFieldErrors.email
        };
      case "phone":
        return {
          phoneNumber: allFieldErrors.phoneNumber,
          phoneConsent: allFieldErrors.phoneConsent
        };
      case "identity":
        return {
          dateOfBirth: allFieldErrors.dateOfBirth,
          streetAddress: allFieldErrors.streetAddress
        };
      case "ssn":
        return {
          ssn: allFieldErrors.ssn
        };
      default:
        return {};
    }
  }, [allFieldErrors, isLoanAmountStep, step]);

  const isCurrentStepValid = useMemo(
    () => (isLoanAmountStep ? isLoanAmountValid(formState.loanAmount) : Boolean(step && isApplicationStepValid(step.kind, formState))),
    [formState, isLoanAmountStep, step]
  );

  const handleTextChange =
    (field: keyof ApplicationFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let nextValue = event.target.value;

      if (field === "zipCode") {
        nextValue = nextValue.replace(/\D/g, "").slice(0, 5);
      }

      if (field === "loanAmount") {
        nextValue = nextValue.replace(/\D/g, "").slice(0, 5);
      }

      if (field === "monthlyIncome") {
        nextValue = nextValue.replace(/\D/g, "");
      }

      if (field === "phoneNumber") {
        const digits = nextValue.replace(/\D/g, "").slice(0, 10);
        if (digits.length <= 3) {
          nextValue = digits;
        } else if (digits.length <= 6) {
          nextValue = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
          nextValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
      }

      if (field === "dateOfBirth") {
        const digits = nextValue.replace(/\D/g, "").slice(0, 8);
        if (digits.length <= 2) {
          nextValue = digits;
        } else if (digits.length <= 4) {
          nextValue = `${digits.slice(0, 2)}-${digits.slice(2)}`;
        } else {
          nextValue = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
        }
      }

      if (field === "ssn") {
        const digits = nextValue.replace(/\D/g, "").slice(0, 9);
        if (digits.length <= 3) {
          nextValue = digits;
        } else if (digits.length <= 5) {
          nextValue = `${digits.slice(0, 3)}-${digits.slice(3)}`;
        } else {
          nextValue = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
        }
      }

      if (field === "firstName" || field === "lastName") {
        nextValue = nextValue.replace(/[^A-Za-z\s'-]/g, "").slice(0, 20);
      }

      setFormState((current) => ({
        ...current,
        [field]: nextValue
      }));
      markFieldInteraction(field);

      setAsyncFieldErrors((current) => ({
        ...current,
        [field]: ""
      }));
    };

  const handleChoice = (field: keyof ApplicationFormData, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
    markFieldInteraction(field);
  };

  const handleConsentToggle = () => {
    setFormState((current) => ({
      ...current,
      phoneConsent: !current.phoneConsent
    }));
    markFieldInteraction("phoneConsent");
  };

  const goBack = () => {
    if (stepIndex === 0) {
      prepareForInternalNavigation();
      router.push("/");
      return;
    }

    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const submitApplication = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formState,
          ...readStoredUtmParams()
        })
      });

      const payload = (await response.json()) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok) {
        setSubmitError(payload.error ?? "Unable to save your application right now.");
        setAttemptedSteps((current) => ({ ...current, [stepIndex]: true }));
        return;
      }

      trackLoanApplicationCompleted({
        loan_amount: Number(formState.loanAmount || "0"),
        step_number: funnelStepNumber,
        progress_percentage: progressPercent
      });

      try {
        await markFormCompleted();
      } catch (analyticsError) {
        console.error("Failed to save form completion analytics", analyticsError);
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit application", error);
      setSubmitError("Unable to save your application right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goForward = async () => {
    if (!isCurrentStepValid) {
      setAttemptedSteps((current) => ({ ...current, [stepIndex]: true }));
      return;
    }

    if (isLoanAmountStep) {
      setSubmitError("");
      setStepIndex((current) => current + 1);
      return;
    }

    if (step?.kind === "purpose") {
      setIsSubmitting(true);

      try {
        const response = await fetch(
          `/api/zip-lookup?zip=${encodeURIComponent(formState.zipCode)}`,
          {
            cache: "no-store"
          }
        );

        const payload = (await response.json()) as {
          valid?: boolean;
          city?: string;
          state?: string;
          error?: string;
        };

        if (!response.ok || !payload.valid || !payload.city || !payload.state) {
          setAttemptedSteps((current) => ({ ...current, [stepIndex]: true }));
          setAsyncFieldErrors((current) => ({
            ...current,
            zipCode: payload.error ?? "Enter a valid US ZIP code."
          }));
          return;
        }

        setFormState((current) => ({
          ...current,
          city: payload.city ?? "",
          state: payload.state ?? ""
        }));

        setAsyncFieldErrors((current) => ({
          ...current,
          zipCode: ""
        }));
      } catch (error) {
        console.error("Failed to validate ZIP code", error);
        setAttemptedSteps((current) => ({ ...current, [stepIndex]: true }));
        setAsyncFieldErrors((current) => ({
          ...current,
          zipCode: "Unable to validate ZIP code right now."
        }));
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    if (isFinalStep) {
      await submitApplication();
      return;
    }

    setSubmitError("");
    setStepIndex((current) => current + 1);
  };

  if (submitted) {
    return (
      <section className={styles.pageSection}>
        <div className={styles.shell}>
          <div className={styles.successCard}>
            <div className={styles.iconWrap}>
              <Image src="/images/form-icon.png" alt="" width={19} height={19} />
            </div>
            <h1 className={styles.successTitle}>Your details have been captured.</h1>
            <p className={styles.successBody}>
              A lender match specialist can review your information and continue the process.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.pageSection}>
      <div className={styles.shell}>
        <div className={styles.progressCard}>
          <p className={styles.progressCaption}>Your Progress</p>
          <p className={styles.progressValue}>{progressPercent}% to complete</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className={styles.body} ref={formContainerRef}>
          <div className={styles.iconWrap}>
            <Image src="/images/form-icon.png" alt="" width={19} height={19} />
          </div>
          <h2 className={styles.title}>{currentTitle}</h2>
          <p className={styles.subtitle}>{currentSubtitle}</p>

          {isLoanAmountStep ? (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Desired loan amount</label>
              <input
                className={styles.input}
                type="text"
                name="loanAmount"
                inputMode="numeric"
                placeholder="100 - 40000"
                value={formState.loanAmount}
                onChange={handleTextChange("loanAmount")}
              />
              {attemptedSteps[stepIndex] && fieldErrors.loanAmount ? (
                <p className={styles.fieldError}>{fieldErrors.loanAmount}</p>
              ) : null}
            </div>
          ) : null}

          {step?.kind === "purpose" ? (
            <>
              <div className={styles.fieldGroup}>
                <select
                  className={styles.select}
                  name="loanPurpose"
                  value={formState.loanPurpose}
                  onChange={handleTextChange("loanPurpose")}
                >
                  <option value="">Select a purpose</option>
                  {step.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {attemptedSteps[stepIndex] && fieldErrors.loanPurpose ? (
                  <p className={styles.fieldError}>{fieldErrors.loanPurpose}</p>
                ) : null}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>ZIP code</label>
                <input
                  className={styles.input}
                  type="text"
                  name="zipCode"
                  inputMode="numeric"
                  placeholder="e.g. 90201"
                  value={formState.zipCode}
                  onChange={handleTextChange("zipCode")}
                />
                {attemptedSteps[stepIndex] && (asyncFieldErrors.zipCode || fieldErrors.zipCode) ? (
                  <p className={styles.fieldError}>
                    {asyncFieldErrors.zipCode || fieldErrors.zipCode}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {step?.kind === "credit" ? (
            <div className={styles.stack}>
              {step.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-track-field="creditScore"
                  className={
                    formState.creditScore === option.value
                      ? `${styles.choiceButton} ${styles.choiceButtonActive}`
                      : styles.choiceButton
                  }
                  onClick={() => handleChoice("creditScore", option.value)}
                >
                  {option.label}
                </button>
              ))}
              {attemptedSteps[stepIndex] && fieldErrors.creditScore ? (
                <p className={styles.fieldError}>{fieldErrors.creditScore}</p>
              ) : null}
            </div>
          ) : null}

          {step?.kind === "employment" ? (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Employment status</label>
                <div className={styles.stack}>
                  {step.employmentOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      data-track-field="employmentStatus"
                      className={
                        formState.employmentStatus === option.value
                          ? `${styles.choiceButton} ${styles.choiceButtonActive}`
                          : styles.choiceButton
                      }
                      onClick={() => handleChoice("employmentStatus", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {attemptedSteps[stepIndex] && fieldErrors.employmentStatus ? (
                  <p className={styles.fieldError}>{fieldErrors.employmentStatus}</p>
                ) : null}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>How often are you paid?</label>
                <div className={styles.choiceGrid}>
                  {step.payFrequencyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      data-track-field="payFrequency"
                      className={
                        formState.payFrequency === option.value
                          ? `${styles.choiceGridButton} ${styles.choiceGridButtonActive}`
                          : styles.choiceGridButton
                      }
                      onClick={() => handleChoice("payFrequency", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {attemptedSteps[stepIndex] && fieldErrors.payFrequency ? (
                  <p className={styles.fieldError}>{fieldErrors.payFrequency}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {step?.kind === "financial" ? (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Monthly income (before taxes)</label>
                <input
                  className={styles.input}
                  type="text"
                  name="monthlyIncome"
                  inputMode="numeric"
                  placeholder="$3,500"
                  value={formState.monthlyIncome}
                  onChange={handleTextChange("monthlyIncome")}
                />
                {attemptedSteps[stepIndex] && fieldErrors.monthlyIncome ? (
                  <p className={styles.fieldError}>{fieldErrors.monthlyIncome}</p>
                ) : null}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Do you own or rent your home?</label>
                <div className={styles.choiceGridThree}>
                  {step.housingOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      data-track-field="housingStatus"
                      className={
                        formState.housingStatus === option.value
                          ? `${styles.choiceGridButton} ${styles.choiceGridButtonActive}`
                          : styles.choiceGridButton
                      }
                      onClick={() => handleChoice("housingStatus", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {attemptedSteps[stepIndex] && fieldErrors.housingStatus ? (
                  <p className={styles.fieldError}>{fieldErrors.housingStatus}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {step?.kind === "banking" ? (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Do you have a checking account?</label>
                <div className={styles.choiceGrid}>
                  {step.yesNoOptions.map((option) => (
                    <button
                      key={`checking-${option.value}`}
                      type="button"
                      data-track-field="hasCheckingAccount"
                      className={
                        formState.hasCheckingAccount === option.value
                          ? `${styles.choiceGridButton} ${styles.choiceGridButtonActive}`
                          : styles.choiceGridButton
                      }
                      onClick={() => handleChoice("hasCheckingAccount", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {attemptedSteps[stepIndex] && fieldErrors.hasCheckingAccount ? (
                  <p className={styles.fieldError}>{fieldErrors.hasCheckingAccount}</p>
                ) : null}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Do you receive direct deposit?</label>
                <div className={styles.choiceGrid}>
                  {step.yesNoOptions.map((option) => (
                    <button
                      key={`deposit-${option.value}`}
                      type="button"
                      data-track-field="hasDirectDeposit"
                      className={
                        formState.hasDirectDeposit === option.value
                          ? `${styles.choiceGridButton} ${styles.choiceGridButtonActive}`
                          : styles.choiceGridButton
                      }
                      onClick={() => handleChoice("hasDirectDeposit", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {attemptedSteps[stepIndex] && fieldErrors.hasDirectDeposit ? (
                  <p className={styles.fieldError}>{fieldErrors.hasDirectDeposit}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {step?.kind === "qualifiers" ? (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Do you have a vehicle registered in your name?
                </label>
                <div className={styles.choiceGrid}>
                  {step.yesNoOptions.map((option) => (
                    <button
                      key={`vehicle-${option.value}`}
                      type="button"
                      data-track-field="hasVehicleRegistration"
                      className={
                        formState.hasVehicleRegistration === option.value
                          ? `${styles.choiceGridButton} ${styles.choiceGridButtonActive}`
                          : styles.choiceGridButton
                      }
                      onClick={() => handleChoice("hasVehicleRegistration", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {attemptedSteps[stepIndex] && fieldErrors.hasVehicleRegistration ? (
                  <p className={styles.fieldError}>{fieldErrors.hasVehicleRegistration}</p>
                ) : null}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Military affiliation</label>
                <div className={styles.choiceGrid}>
                  {step.militaryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      data-track-field="militaryAffiliation"
                      className={
                        formState.militaryAffiliation === option.value
                          ? `${styles.choiceGridButton} ${styles.choiceGridButtonActive}`
                          : styles.choiceGridButton
                      }
                      onClick={() => handleChoice("militaryAffiliation", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {attemptedSteps[stepIndex] && fieldErrors.militaryAffiliation ? (
                  <p className={styles.fieldError}>{fieldErrors.militaryAffiliation}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {step?.kind === "debt" ? (
            <div className={styles.choiceGrid}>
              {step.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-track-field="unsecuredDebt"
                  className={
                    formState.unsecuredDebt === option.value
                      ? `${styles.choiceGridButton} ${styles.choiceGridButtonActive}`
                      : styles.choiceGridButton
                  }
                  onClick={() => handleChoice("unsecuredDebt", option.value)}
                >
                  {option.label}
                </button>
              ))}
              {attemptedSteps[stepIndex] && fieldErrors.unsecuredDebt ? (
                <p className={styles.fieldError}>{fieldErrors.unsecuredDebt}</p>
              ) : null}
            </div>
          ) : null}

          {step?.kind === "phone" ? (
            <>
              <div className={styles.fieldGroup}>
                <input
                  className={styles.input}
                  type="tel"
                  name="phoneNumber"
                  inputMode="numeric"
                  placeholder="(555) 123-4567"
                  value={formState.phoneNumber}
                  onChange={handleTextChange("phoneNumber")}
                />
                {attemptedSteps[stepIndex] && fieldErrors.phoneNumber ? (
                  <p className={styles.fieldError}>{fieldErrors.phoneNumber}</p>
                ) : null}
              </div>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="phoneConsent"
                  checked={formState.phoneConsent}
                  onChange={handleConsentToggle}
                />
                <span>
                  By clicking this box and clicking &quot;Continue&quot;, I hereby provide my express
                  consent to receiving communication at the telephone number by Linkloan Inc., Cash
                  R Phone, Identify Power, and Marketplace Partners.
                </span>
              </label>
              {attemptedSteps[stepIndex] && fieldErrors.phoneConsent ? (
                <p className={styles.fieldError}>{fieldErrors.phoneConsent}</p>
              ) : null}
            </>
          ) : null}

          {step?.kind === "identity" ? (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Date of birth</label>
                <input
                  className={styles.input}
                  type="text"
                  name="dateOfBirth"
                  inputMode="numeric"
                  placeholder="MM-DD-YYYY"
                  value={formState.dateOfBirth}
                  onChange={handleTextChange("dateOfBirth")}
                />
                {attemptedSteps[stepIndex] && fieldErrors.dateOfBirth ? (
                  <p className={styles.fieldError}>{fieldErrors.dateOfBirth}</p>
                ) : null}
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Street address</label>
                <input
                  className={styles.input}
                  type="text"
                  name="streetAddress"
                  placeholder="123, Main Street"
                  value={formState.streetAddress}
                  onChange={handleTextChange("streetAddress")}
                />
                {attemptedSteps[stepIndex] && fieldErrors.streetAddress ? (
                  <p className={styles.fieldError}>{fieldErrors.streetAddress}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {step?.kind === "ssn" ? (
            <div className={styles.fieldGroup}>
              <input
                className={styles.input}
                type="text"
                name="ssn"
                inputMode="numeric"
                placeholder="XXX-XX-XXXX"
                value={formState.ssn}
                onChange={handleTextChange("ssn")}
              />
              {attemptedSteps[stepIndex] && fieldErrors.ssn ? (
                <p className={styles.fieldError}>{fieldErrors.ssn}</p>
              ) : null}
              <p className={styles.ssnNotice}>
                By providing your Social Security Number and clicking &quot;Continue&quot; below, you
                are providing written instruction under the Fair Credit Reporting Act for Linkloan
                Inc. and its Marketplace Partners to use your consumer credit report.
              </p>
            </div>
          ) : null}

          {step?.kind === "profile" ? (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>First name</label>
                <input
                  className={styles.input}
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={formState.firstName}
                  onChange={handleTextChange("firstName")}
                />
                {attemptedSteps[stepIndex] && fieldErrors.firstName ? (
                  <p className={styles.fieldError}>{fieldErrors.firstName}</p>
                ) : null}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Last name</label>
                <input
                  className={styles.input}
                  type="text"
                  name="lastName"
                  placeholder="Smith"
                  value={formState.lastName}
                  onChange={handleTextChange("lastName")}
                />
                {attemptedSteps[stepIndex] && fieldErrors.lastName ? (
                  <p className={styles.fieldError}>{fieldErrors.lastName}</p>
                ) : null}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email address</label>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="john@gmail.com"
                  value={formState.email}
                  onChange={handleTextChange("email")}
                />
                {attemptedSteps[stepIndex] && fieldErrors.email ? (
                  <p className={styles.fieldError}>{fieldErrors.email}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {submitError ? <p className={styles.submitError}>{submitError}</p> : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.backButton}
              onClick={goBack}
            >
              {stepIndex === 0 ? "<< Home" : "<< Back"}
            </button>
            <button
              type="button"
              className={styles.continueButton}
              onClick={goForward}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : `Continue ${">>"}`}
            </button>
          </div>

          <p className={styles.microcopy}>We use 256 bit SSL technology to encrypt your data.</p>
        </div>
      </div>
    </section>
  );
}
