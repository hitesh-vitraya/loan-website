import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";
import { faqPageContent } from "../../data/faq-page";

export default function FAQPage() {
  return (
    <main>
      <Header />
      <section className="faqPage">
        <Container className="faqPageInner">
          <div className="faqPageHeader">
            {/* <p className="faqPageEyebrow">Frequently Asked Questions</p> */}
            <h1 className="faqPageTitle">Frequently Asked Questions</h1>
          </div>

          <div className="faqPageList">
            {faqPageContent.map((item, index) => (
              <article key={`${item.question}-${index}`} className="faqPageItem">
                <h2 className="faqPageQuestion">{item.question}</h2>
                <div className="faqPageAnswer">
                  {item.answer.map((paragraph, paragraphIndex) => (
                    <p key={`${item.question}-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <Footer />
    </main>
  );
}
