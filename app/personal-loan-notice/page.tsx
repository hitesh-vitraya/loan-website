import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";
import { personalLoanNoticeSections } from "../../data/personal-loan-notice-page";

export default function PersonalLoanNoticePage() {
  return (
    <main>
      <Header />
      <section className="legalPage">
        <Container className="legalPageInner">
          <div className="legalPageHeader">
            {/* <p className="legalPageEyebrow">Personal Loan Notice</p> */}
            <h1 className="legalPageTitle">Personal Loan Notice</h1>
          </div>

          <div className="legalPageContent">
            {personalLoanNoticeSections.map((section) => (
              <section key={section.heading} className="legalPageSection">
                
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
