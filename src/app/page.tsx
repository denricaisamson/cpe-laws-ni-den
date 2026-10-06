import { getServerUserSession } from '@/lib/supabase/server';
import { getLandingData } from '@/lib/landing-data';
import { SmoothScroll } from '@/components/landing/providers/SmoothScroll';
import { LandingNav } from '@/components/landing/ui/LandingNav';
import { HeroSection } from '@/components/landing/sections/Hero';
import { LevelsShowcase } from '@/components/landing/sections/LevelsShowcase';
import { VideoHubSection } from '@/components/landing/sections/VideoCarousel3D';
import { RolesSection } from '@/components/landing/sections/RolesIsometric';
import { PathwayJourneySection } from '@/components/landing/sections/PathwayJourney';
import { CommunityMerchSection } from '@/components/landing/sections/CommunityMerch';
import { FinalCTASection } from '@/components/landing/sections/FinalCTA';
import { LandingFooter } from '@/components/landing/ui/LandingFooter';

export const revalidate = 60;

export default async function HomePage() {
  const session = await getServerUserSession();
  const data = await getLandingData();

  const dashboardHref = session
    ? session.role === 'admin'
      ? '/admin'
      : session.role === 'professor'
      ? '/professor'
      : '/learner'
    : undefined;

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#03130a] text-slate-100 selection:bg-amber-400 selection:text-emerald-950 relative overflow-x-hidden">
        {/* Deep ambient background aura */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 20%, rgba(0, 111, 60, 0.18) 0%, transparent 45%),
              radial-gradient(circle at 85% 60%, rgba(245, 168, 0, 0.12) 0%, transparent 50%),
              radial-gradient(circle at 50% 90%, rgba(0, 67, 35, 0.25) 0%, transparent 60%)
            `,
          }}
        />

        {/* Floating Top Navigation */}
        <LandingNav dashboardHref={dashboardHref} />

        {/* Main 3D Experience */}
        <main className="relative z-10 flex flex-col">
          <HeroSection dashboardHref={dashboardHref} />
          <LevelsShowcase workshops={data.workshops} />
          <VideoHubSection videos={data.videos} />
          <RolesSection />
          <PathwayJourneySection />
          <CommunityMerchSection news={data.news} products={data.products} />
          <FinalCTASection dashboardHref={dashboardHref} />
        </main>

        {/* Accessible Footer */}
        <LandingFooter />
      </div>
    </SmoothScroll>
  );
}
