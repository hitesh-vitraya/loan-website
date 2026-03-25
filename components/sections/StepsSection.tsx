"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { steps } from "../../data/home";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import styles from "./StepsSection.module.css";

export function StepsSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      const firstCard = element.querySelector<HTMLElement>(`.${styles.card}`);
      const gap = Number.parseFloat(window.getComputedStyle(element).columnGap || "0");
      const cardWidth = (firstCard?.offsetWidth ?? element.clientWidth) + gap;
      const nextIndex = Math.round(element.scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(steps.length - 1, nextIndex)));
    };

    handleScroll();
    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section id="about" className="stepsSection">
      <Container className="sectionRail">
        <SectionHeading
          title="Find a loan in 3 easy steps"
          description="Empowering you to take charge of your financial future with our intuitive tools and 
personalized insights designed just for you."
        />

        <div className={styles.grid} ref={scrollRef}>
          {steps.map((step, index) => (
            <article key={step.title} className={styles.card}>
              <div className={styles.iconTile}>
                <Image
                  src={`/images/step-${index + 1}.svg`}
                  alt=""
                  width={32}
                  height={32}
                />
              </div>
              <h3 className={styles.title}>{step.title}</h3>
            </article>
          ))}
        </div>

        <div className={styles.dots} aria-hidden="true">
          {steps.map((step, index) => (
            <span
              key={step.title}
              className={index === activeIndex ? `${styles.dot} ${styles.dotActive}` : styles.dot}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
