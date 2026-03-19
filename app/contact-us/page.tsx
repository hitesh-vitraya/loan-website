import { ContactUsForm } from "../../components/forms/ContactUsForm";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";

export default function ContactUsPage() {
  return (
    <main>
      <Header />
      <section className="legalPage">
        <Container className="legalPageInner">
          <div className="legalPageHeader">
            {/* <p className="legalPageEyebrow">Contact Us</p> */}
            <h1 className="legalPageTitle">Contact Us</h1>
          </div>
          <ContactUsForm />
        </Container>
      </section>
      <Footer />
    </main>
  );
}
