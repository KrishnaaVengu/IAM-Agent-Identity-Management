import React from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { PartnersAndFooter } from '../components/PartnersAndFooter';

export const LandingPage: React.FC = () => {
 return (
 <div className="min-h-screen bg-white text-slate-900 font-sans">
 <Navbar />
 <main className="pt-16">
 <HeroSection />
 <FeaturesGrid />
 <InteractiveDemo />
 <TestimonialCarousel />
 <PartnersAndFooter />
 </main>
 </div>
 );
};

export default LandingPage;
