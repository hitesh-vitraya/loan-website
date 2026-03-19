import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";
import { advertiserDisclosureSections } from "../../data/advertiser-disclosure-page";

export default function AdvertiserDisclosurePage() {
  return (
    <main>
      <Header />
      <section className="legalPage">
        <Container className="legalPageInner">
          <div className="legalPageHeader">
            {/* <p className="legalPageEyebrow">Advertiser Disclosure</p> */}
            <h1 className="legalPageTitle">Advertiser Disclosure</h1>
          </div>

          <div className="legalPageContent">
            {advertiserDisclosureSections.map((section) => (
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
