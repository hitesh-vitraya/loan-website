import Image from "next/image";

import { features } from "../../data/home";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function FeaturesSection() {
  return (
    <section className="featuresSection">
      <Container className="sectionRail">
        <SectionHeading
          title="Why Choose Us?"
          description="Helping you access fast, reliable financial solutions with a simple, secure, and transparent process."
        />

        <div className="featuresGrid">
          {features.map((feature) => (
            <article key={feature.title} className="featureCard">
              <div className="iconBadge">
                <Image src="/images/dollar.svg" alt="" width={14} height={14} />
              </div>
              <h3 className="featureTitle">{feature.title}</h3>
              <p className="featureBody">{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
