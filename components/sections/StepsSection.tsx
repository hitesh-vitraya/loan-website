import Image from "next/image";

import { steps } from "../../data/home";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";

export function StepsSection() {
  return (
    <section id="about" className="stepsSection">
      <Container className="sectionRail">
        <SectionHeading
          title="Find a loan in 3 easy steps"
          description="Empowering you to take charge of your financial future with our intuitive tools and 
personalized insights designed just for you."
        />

        <div className="stepsGrid">
          {steps.map((step, index) => (
            <article key={step.title} className="panelCard">
              <Image
                src={`/images/step-${index + 1}.png`}
                alt=""
                width={32}
                height={32}
              />
              <h3 className="cardTitle">{step.title}</h3>
              <p className="cardBody">{step.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
