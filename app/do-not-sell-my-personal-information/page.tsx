import { DoNotSellForm } from "../../components/forms/DoNotSellForm";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";

export default function DoNotSellMyPersonalInformationPage() {
  return (
    <main>
      <Header />
      <section className="legalPage">
        <Container className="legalPageInner">
          <div className="legalPageHeader">
            
            <h1 className="legalPageTitle">Do Not Sell My Personal Information</h1>
          </div>
          <DoNotSellForm />
        </Container>
      </section>
      <Footer />
    </main>
  );
}
