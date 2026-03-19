import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";
import { termsPageMeta, termsPageSections } from "../../data/terms-page";

export default function TermsAndConditionPage() {
  return (
    <main>
      <Header />
      <section className="legalPage">
        <Container className="legalPageInner">
          <div className="legalPageHeader">
            {/* <p className="legalPageEyebrow">{termsPageMeta.title}</p> */}
            <h1 className="legalPageTitle">{termsPageMeta.title}</h1>
            <p className="legalPageMeta">{termsPageMeta.updated}</p>
          </div>

          <div className="legalPageContent">
            {termsPageSections.map((section) => (
              <section key={section.heading} className="legalPageSection">
                <h2 className="legalPageSectionTitle">{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.heading}-${index}`}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </Container>
      </section>
      <Footer />
    </main>
  );
}
