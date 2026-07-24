import * as React from 'react';
import { LandingHeader } from '../../../components/sections/landing/LandingHeader';
import { HeroSection } from '../../../components/sections/landing/HeroSection';
import { FeaturesSection } from '../../../components/sections/landing/FeaturesSection';
import { InteractiveDemoSection } from '../../../components/sections/landing/InteractiveDemoSection';
import { VersionCommentsSection } from '../../../components/sections/landing/VersionCommentsSection';
import { SqlExportSection } from '../../../components/sections/landing/SqlExportSection';
import { CtaSection } from '../../../components/sections/landing/CtaSection';
import { LandingFooter } from '../../../components/sections/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  React.useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col overflow-x-hidden selection:bg-primary/30 selection:text-on-background">
      <LandingHeader />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <InteractiveDemoSection />
        <VersionCommentsSection />
        <SqlExportSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
};
