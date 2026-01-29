import { Navbar } from '@/components/Navbar';
import { VideoHero } from '@/components/VideoHero';
import { CountdownTimer } from '@/components/CountdownTimer';
import { ProgrammeSchedule } from '@/components/ProgrammeSchedule';
import { MediaGallery } from '@/components/MediaGallery';
import { QuickLinks } from '@/components/QuickLinks';
import { Footer } from '@/components/Footer';
import { AIChatBot } from '@/components/AIChatBot';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
    </div>
  );
};

export default Index;
