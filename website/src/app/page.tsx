import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { OsnAreasSection } from "@/components/OsnAreasSection";
import { LastTweetsSection } from "@/components/LastTweetsSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <HeroSection />
      <OsnAreasSection />
      <LastTweetsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
