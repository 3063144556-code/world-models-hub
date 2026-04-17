import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import { TimelineHistory } from '@/components/TimelineHistory';
import { ProspectScoreSection } from '@/components/ProspectScoreSection';
import ArchitectureTrendSection from '@/components/ArchitectureTrendSection';
import TimelineSection from '@/components/TimelineSection';
import AnonymousComments from '@/components/AnonymousComments';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CategorySection />
        <TimelineHistory />
        <ProspectScoreSection />
        <ArchitectureTrendSection />
        <TimelineSection />
        <AnonymousComments />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
