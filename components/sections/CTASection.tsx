import { Button } from "../ui/Button";
import { Container } from "../ui/Container";

export function CTASection() {
  return (
    <section id="cta" className="ctaSection">
      <Container className="ctaInner sectionRail">
        <h2 className="ctaTitle">Request your loan in less than 2 minutes!</h2>
        <Button href="/#request-now" className="ctaButton">
          Check my Options
        </Button>
      </Container>
    </section>
  );
}
