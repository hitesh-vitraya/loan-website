import { Header } from "../components/layout/Header";
import { CTASection } from "../components/sections/CTASection";
import { FAQSection } from "../components/sections/FAQSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { Footer } from "../components/sections/Footer";
import { Hero } from "../components/sections/Hero";
import { StepsSection } from "../components/sections/StepsSection";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <StepsSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
