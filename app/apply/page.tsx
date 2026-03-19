import { Suspense } from "react";

import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/sections/Footer";
import { ApplicationWizard } from "../../components/forms/ApplicationWizard";

export default function ApplyPage() {
  return (
    <main>
      <Header />
      <Suspense fallback={null}>
        <ApplicationWizard />
      </Suspense>
      <Footer />
    </main>
  );
}
