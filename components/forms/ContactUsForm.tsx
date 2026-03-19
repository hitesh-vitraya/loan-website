"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import styles from "./ContactUsForm.module.css";

type FormData = {
  fullName: string;
  email: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  fullName: "",
  email: "",
  message: ""
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactUsForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(data: FormData) {
    const nextErrors: FieldErrors = {};

    if (!data.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    } else if (data.fullName.trim().length < 2) {
      nextErrors.fullName = "Full name must be at least 2 characters.";
    }

    if (!data.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(data.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!data.message.trim()) {
      nextErrors.message = "Message is required.";
    } else if (data.message.trim().length < 10) {
      nextErrors.message = "Message must be at least 10 characters.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(formData);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus(null);
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          message: formData.message.trim()
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus({
          type: "error",
          message: payload.error ?? "Unable to submit your message right now."
        });
        return;
      }

      setFormData(initialFormData);
      setFieldErrors({});
      setStatus({
        type: "success",
        message: "Your message has been submitted successfully."
      });
    } catch {
      setStatus({
        type: "error",
        message: "Unable to submit your message right now."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.shell}>
      
      <p>
        We recognize that privacy is important to you. Our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> discloses the privacy practices of our
        website. By using our website you consent to us using and disclosing your information as
        described in this Privacy and also the ways we have to be strong with your personal
        information.
      </p>
      <p>
        We hope that this helps you to better understand why we require certain information at our
        site and what is done with this information. Please review the full{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
        <Link href="/terms-and-condition">Terms of Service</Link> provided by Liberty Lending
        Wallet. You may access them here. To contact us, you may reach out to us by fax, to-free
        or via email. Please see contact information directly below.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-full-name">
            Full name
          </label>
          <input
            id="contact-full-name"
            className={styles.input}
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(event) => {
              setFormData((current) => ({ ...current, fullName: event.target.value }));
              if (fieldErrors.fullName) {
                setFieldErrors((current) => ({ ...current, fullName: undefined }));
              }
            }}
          />
          {fieldErrors.fullName ? <p className={styles.error}>{fieldErrors.fullName}</p> : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            className={styles.input}
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(event) => {
              setFormData((current) => ({ ...current, email: event.target.value }));
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }
            }}
          />
          {fieldErrors.email ? <p className={styles.error}>{fieldErrors.email}</p> : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            className={styles.textarea}
            placeholder="Enter your message"
            value={formData.message}
            onChange={(event) => {
              setFormData((current) => ({ ...current, message: event.target.value }));
              if (fieldErrors.message) {
                setFieldErrors((current) => ({ ...current, message: undefined }));
              }
            }}
          />
          {fieldErrors.message ? <p className={styles.error}>{fieldErrors.message}</p> : null}
        </div>

        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          {status ? (
            <p
              className={`${styles.status} ${
                status.type === "success" ? styles.statusSuccess : styles.statusError
              }`}
            >
              {status.message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
