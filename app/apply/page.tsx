import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { ApplicationWizard } from "../../components/forms/ApplicationWizard";

export default function ApplyPage() {
  return (
    <main>
      <Header />
      <ApplicationWizard />
      <Footer />
    </main>
  );
}
