import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AudioForm from "@/components/video-form";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { RecentAudioSection } from "@/components/audio/history/recent-audio-section";
import { Navbar } from "@/components/navbar";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <ScrollArea className="h-screen">
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <HeroSection />

            <Suspense
              fallback={
                <div className="flex justify-center items-center py-10 sm:py-20">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-foreground" />
                  <span className="ml-2 text-sm sm:text-base text-muted-foreground">
                    Loading form...
                  </span>
                </div>
              }
            >
              <AuthWrapper>
                <AudioForm />
              </AuthWrapper>
            </Suspense>

            <div className="mt-16 sm:mt-24 space-y-12 sm:space-y-16">
              <HowItWorksSection />
              <Suspense
                fallback={
                  <div className="h-16 sm:h-20 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <RecentAudioSection />
              </Suspense>
              <FeaturesSection />
            </div>
          </div>
        </div>
      </main>
    </ScrollArea>
  );
}
