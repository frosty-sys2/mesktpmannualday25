import { Navbar } from '@/components/Navbar';
import { VideoHero } from '@/components/VideoHero';
import { ProgrammeSchedule } from '@/components/ProgrammeSchedule';
import { MediaGallery } from '@/components/MediaGallery';
import { QuickLinks } from '@/components/QuickLinks';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <VideoHero />
        <ProgrammeSchedule />
        <MediaGallery />
        <QuickLinks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
