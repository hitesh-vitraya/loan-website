"use client";

import { ChangeEvent, MouseEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { useFormDropOffTracker } from "../../hooks/useFormDropOffTracker";
import {
  APPLICATION_FUNNEL_FIELD_COUNT,
  APPLICATION_FUNNEL_ID,
  APPLICATION_FUNNEL_NAME
} from "../../lib/form-drop-off";
import {
  ApplicationFormData,
  getCompletedApplicationFieldCount,
  initialApplicationFormState,
  isLoanAmountValid
} from "../../lib/application-form";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";

function QualifierCard() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const formState = useMemo<ApplicationFormData>(
    () => ({
      ...initialApplicationFormState,
      loanAmount: amount
    }),
    [amount]
  );
  const progressPercent = Math.round(
    (getCompletedApplicationFieldCount(formState, { includeLoanAmount: true }) /
      APPLICATION_FUNNEL_FIELD_COUNT) *
      100
  );
  const { markFieldInteraction, prepareForInternalNavigation } = useFormDropOffTracker({
    formId: APPLICATION_FUNNEL_ID,
    formName: APPLICATION_FUNNEL_NAME,
    pageStage: "home",
    currentStep: 1,
    progressPercentage: progressPercent,
    formRef
  });

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/\D/g, "");
    setAmount(numericValue);
    markFieldInteraction("loanAmount");
    if (error) {
      setError("");
    }
  };

  const handleRequestClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const parsedAmount = Number(amount);

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount < 100 || parsedAmount > 40000) {
      event.preventDefault();
      setError("Enter an amount between 100 and 40000.");
      markFieldInteraction("loanAmount");
      return;
    }

    if (isLoanAmountValid(amount)) {
      prepareForInternalNavigation();
    }
  };

  return (
    <div className="qualifierCard" ref={formRef}>
      <div className="qualifierIcon">
        <Image src="/images/dollar.svg" alt="" width={10} height={10} />
      </div>
      <p className="qualifierTitle">See what you qualify for</p>
      <p className="qualifierSubtitle">Takes about 2 minutes. No credit impact</p>

      <label className="qualifierLabel">How much do you need?</label>
      <div className="qualifierInputWrap">
        <span className="qualifierCurrency">$</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          name="loanAmount"
          placeholder=""
          aria-label="Loan amount"
          className="qualifierInput"
          value={amount}
          onChange={handleAmountChange}
        />
      </div>

      {error ? (
        <p style={{ margin: "8px 0 0", color: "#b42318", fontSize: "12px", textAlign: "center" }}>
          {error}
        </p>
      ) : null}

      <p className="qualifierBody">
        By clicking &quot;Request Now&quot;, you agree to our Privacy Policy, Terms of Service,
        E-Consent, Arbitration Notice, and the use of Session Replay Technology. You also
        understand that if you are not connected with a Lender or Lending Partner, you may be
        connected with other financial service providers that offer products and services for
        financial help.
      </p>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          href={amount ? `/apply?amount=${encodeURIComponent(amount)}` : "/apply"}
          className="qualifierButton"
          onClick={handleRequestClick}
        >
          Request Now
        </Button>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="heroVisual">
      <Image
        src="/images/hero.png"
        alt="Family reviewing loan options together"
        fill
        priority
        className="heroImage"
      />
      <div className="heroFade" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="heroSection">
      <div className="heroBackdrop" />
      <div className="heroFrame">
        <HeroVisual />
        <div className="heroOverlayWrap">
          <Container>
            <div className="heroOverlay">
              <div className="heroPill">Loan options from $100 to $40,000</div>

              <div className="heroText">
                <h1 className="heroTitle">The secured and easiest way to find a loan</h1>
                <p className="heroDescription">
                  Our service is 100% FREE and we will NOT affect your Credit Score.
                </p>
              </div>

              <QualifierCard />
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
