"use client";

import { useState } from "react";

import { faqs } from "../../data/home";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState(faqs[0]?.question);

  return (
    <section id="faq" className="faqSection">
      <Container className="faqContainer">
        <SectionHeading title="Frequently Asked Questions" description="" />

        <div className="faqList">
          {faqs.map((faq) => {
            const isOpen = faq.question === openQuestion;

            return (
              <article key={faq.question} className="faqItem">
                <button
                  type="button"
                  className="faqTrigger"
                  onClick={() => setOpenQuestion(isOpen ? "" : faq.question)}
                >
                  <span>{faq.question}</span>
                  <span className="faqIcon">{isOpen ? "-" : "+"}</span>
                </button>
                {isOpen ? <div className="faqAnswer">{faq.answer}</div> : null}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
