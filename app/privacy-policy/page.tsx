import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";
import { privacyPageSections } from "../../data/privacy-page";

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Header />
      <section className="legalPage">
        <Container className="legalPageInner">
          <div className="legalPageHeader">
            {/* <p className="legalPageEyebrow">Privacy Policy</p> */}
            <h1 className="legalPageTitle">Privacy Policy</h1>
            <p className="legalPageMeta">Last updated: 9th January 2026</p>
          </div>

          <div className="legalPageContent">
            {privacyPageSections.map((section) => (
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
