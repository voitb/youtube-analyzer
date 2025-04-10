"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import type { VideoChapter } from "./video-chapters";
import ResultsTabs from "./results-tab";
import { ProgressCards } from "./progress-cards";

export interface DifficultSegment {
  timeRange: string;
  issue: string;
  improvement: string;
}

export interface PresentationQuality {
  overallClarity: string;
  difficultSegments: DifficultSegment[];
  improvementSuggestions: string[];
}

export interface AnalysisResult {
  title?: string;
  summary: string;
  keyPoints: string[];
  discussionQuestions: string[];
  transcription?: string;
  videoChapters?: VideoChapter[];
  presentationQuality?: PresentationQuality;
  glossary?: Record<string, string>;
  analysisDate?: string;
}

export default function ResultsContent({ videoId }: { videoId: string }) {
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Get language from URL query parameter, default to Polish if not provided
  const outputLanguage = searchParams.get("lang") || "polish";

  useEffect(() => {
    const processVideo = async () => {
      try {
        // Reset state
        setProcessing(true);
        setCurrentStep(0);
        setResult(null);
        setError(null);
        setShowResults(false);

        // Step 1: Download audio and transcribe
        setCurrentStep(0); // First step (25%)

        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const transcriptionResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: youtubeUrl,
            language: "auto", // Default auto
          }),
        });

        if (!transcriptionResponse.ok) {
          const errorData = await transcriptionResponse.json();
          throw new Error(errorData.error || "Error during transcription");
        }

        const transcriptionData = await transcriptionResponse.json();

        // Step 2: Transcription complete
        setCurrentStep(1); // Second step (50%)

        // Step 3: Text analysis
        const analyzeResponse = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...transcriptionData,
            outputLanguage,
          }),
        });

        if (!analyzeResponse.ok) {
          const errorData = await analyzeResponse.json();
          throw new Error(errorData.error || "Error during analysis");
        }

        // Step 3: Analyzing content
        setCurrentStep(2); // Third step (75%)

        const analysisData = await analyzeResponse.json();

        // Step 4: Complete
        setCurrentStep(3); // Final step (100%)
        console.log({ analysisData });
        // Prepare the result
        const finalResult = {
          title: transcriptionData.title,
          summary: analysisData.summary,
          keyPoints: analysisData.keyPoints,
          discussionQuestions: analysisData.discussionQuestions,
          transcription: transcriptionData.transcription,
          videoChapters: analysisData.videoChapters,
          presentationQuality: analysisData.presentationQuality,
          glossary: analysisData.glossary,
          analysisDate: new Date().toISOString(),
        };

        setResult(finalResult);

        // Show completion card for 2 seconds before showing results
        setTimeout(() => {
          setShowResults(true);
          setProcessing(false);
          toast.success("Analysis completed successfully!");
        }, 2000);
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        toast.error("An error occurred during analysis");
        setProcessing(false);
      }
    };

    processVideo();
  }, [videoId, outputLanguage]);

  if (processing && !showResults) {
    return (
      <Card className="border shadow-md">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            Analysis Progress
          </h2>
          <ProgressCards currentStep={currentStep} startTime={startTime} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 border-destructive shadow-md">
        <CardContent className="pt-6 p-8">
          <h2 className="text-xl font-semibold text-destructive mb-4 text-center">
            An Error Occurred
          </h2>
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result || !showResults) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin " />
        <span className="ml-2 text-muted-foreground">Loading results...</span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Generated Educational Materials
          </h2>
          <div className="text-sm px-3 py-1 bg-accent/10 rounded-full ">
            {outputLanguage.charAt(0).toUpperCase() + outputLanguage.slice(1)}
          </div>
        </div>
        <ResultsTabs result={result} />
      </motion.div>
    </AnimatePresence>
  );
}
