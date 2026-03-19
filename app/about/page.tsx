import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { Container } from "../../components/ui/Container";

export default function AboutPage() {
  return (
    <main>
      <Header />
      <section className="aboutPage">
        <Container className="aboutPageInner">
          <div className="aboutPageHeader">
            {/* <p className="aboutPageEyebrow">About Us</p> */}
            <h1 className="aboutPageTitle">About Us</h1>
          </div>

          <div className="aboutPageContent">
            <p>
              We are proud of our services that connect our customers to lenders who help them
              with organizations and brands. We understand that financial emergencies arise and may
              not have access to help you find the money you need.
            </p>

            <p>
              Please note that Easy Lending Today is a lending service and NOT a lender,
              is an online broker for personal loans up to $10,000 with repayment options ranging
              from 90 days to 60 months for our customers. How we help all of the next steps are
              as follows: Our lenders conduct a credit rating if you are contacted by one of the
              lenders in our network you will be redirected directly by the lender chosen to their
              website, in which the actual loan is offered, submitted and accepted. At that point,
              you will be dealing solely with the lender and lender alone.
            </p>

            <p>
              A lender may perform a credit check; if you are reached by a lender or lending
              company for lending partner form, your lender will conduct a more in- depth credit
              profile analysis for that financial service to verify a more suitable offer for
              loans. Most lenders do not do pre credit checks and those that do check may rely on
              alternative records. Upon approval by a lender, you enter into a contract directly
              with the lender with corresponding terms, and you will be subject to the terms and
              conditions set forth by the lender and the full lending protocol.
            </p>

            <p>
              The operator is not responsible for the use of the website or any lender or lending
              partner; all uses are solely for providing general information to some borrowing
              customers to come to an agreement with a lender. The operator of the website makes no
              guarantees of service. The operator of the website makes no guarantees.
            </p>
          </div>
        </Container>
      </section>
      <Footer />
    </main>
  );
}
