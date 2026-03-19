import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { ApplicationWizard } from "../../components/forms/ApplicationWizard";

type ApplyPageProps = {
  searchParams?: {
    amount?: string;
  };
};

export default function ApplyPage({ searchParams }: ApplyPageProps) {
  return (
    <main>
      <Header />
      <ApplicationWizard initialLoanAmount={searchParams?.amount} />
      <Footer />
    </main>
  );
}
