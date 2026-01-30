import { Navbar } from '@/components/Navbar';
import { VideoHero } from '@/components/VideoHero';
import { CountdownTimer } from '@/components/CountdownTimer';
import { ProgrammeSchedule } from '@/components/ProgrammeSchedule';
import { MediaGallery } from '@/components/MediaGallery';
import { QuickLinks } from '@/components/QuickLinks';
import { Footer } from '@/components/Footer';
import { AIChatBot } from '@/components/AIChatBot';
import { MobileNav } from '@/components/MobileNav';
import { OnboardingWizard } from '@/components/OnboardingWizard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main>
        <VideoHero />
        <CountdownTimer />
        <ProgrammeSchedule />
        <MediaGallery />
        <QuickLinks />
      </main>
      <Footer />
      <AIChatBot />
      <MobileNav />
      <OnboardingWizard />
    </div>
  );
};

export default Index;
