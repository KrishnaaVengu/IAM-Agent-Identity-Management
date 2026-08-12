import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import InteractiveDemo from "@/components/InteractiveDemo";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import PartnersAndFooter from "@/components/PartnersAndFooter";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesGrid />
      <InteractiveDemo />
      <TestimonialCarousel />
      <PartnersAndFooter />
    </main>
  );
}
