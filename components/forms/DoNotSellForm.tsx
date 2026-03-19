"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { usStates } from "../../data/us-states";
import styles from "./DoNotSellForm.module.css";

type FormErrors = {
  email?: string;
  state?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DoNotSellForm() {
  const [email, setEmail] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!stateCode) {
      nextErrors.state = "Please select a state.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false);
      setSubmitError("");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/do-not-sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          state: stateCode
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setSubmitted(false);
        setSubmitError(payload.error ?? "Unable to submit your request right now.");
        return;
      }

      setSubmitted(true);
      setEmail("");
      setStateCode("");
      setErrors({});
    } catch {
      setSubmitted(false);
      setSubmitError("Unable to submit your request right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.shell}>
      <p className={styles.intro}>
        The California Consumer Privacy Act (&quot;CCPA&quot;) grants California residents the
        right to
        stop the sale of their personal information. If you are a California resident and would
        like for us to not sell your information, please provide and submit your email address
        below. Alternatively, you may exercise this right by sending us a letter at 447 Broadway,
        2nd Floor Suite, #1688, New York 10013. Please include &quot;Do Not Sell My
        Personal Information&quot; as the subject of the letter. For additional information
        regarding your privacy rights please reference our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <div className={styles.formCard}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors((current) => ({ ...current, email: undefined }));
                }
                if (submitError) {
                  setSubmitError("");
                }
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "dns-email-error" : undefined}
            />
            {errors.email ? (
              <p id="dns-email-error" className={styles.error}>
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <select
              className={styles.select}
              value={stateCode}
              onChange={(event) => {
                setStateCode(event.target.value);
                if (errors.state) {
                  setErrors((current) => ({ ...current, state: undefined }));
                }
                if (submitError) {
                  setSubmitError("");
                }
              }}
              aria-invalid={Boolean(errors.state)}
              aria-describedby={errors.state ? "dns-state-error" : undefined}
            >
              <option value="">Select State</option>
              {usStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.state ? (
              <p id="dns-state-error" className={styles.error}>
                {errors.state}
              </p>
            ) : null}
          </div>

          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>

        {submitError ? <p className={styles.error}>{submitError}</p> : null}

        {submitted ? (
          <p className={styles.success}>
            Your request has been received. We will review it based on the email address and state
            you submitted.
          </p>
        ) : null}
      </div>

      <p className={styles.note}>
        The above form will receive attention from our Company. However, if you wish, you may also
        contact us at: 447 Broadway, 2nd Floor Suite, #1688, New York 10013, United States
      </p>
    </div>
  );
}
