"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Terminal } from "lucide-react";
import { generateComparativeAnalysis } from "@/ai/flows/generate-comparative-analysis";
import { useData } from "@/lib/data-context";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ComparativeAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const { toast } = useToast();
  const { data: allData } = useData();

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    setAnalysis("");
    try {
      const result = await generateComparativeAnalysis({
        commercialData: JSON.stringify(allData.commercial),
        residentialData: JSON.stringify(allData.residential),
        hotelData: JSON.stringify(allData.hotel),
        bankBranchData: JSON.stringify(allData.bank),
      });
      setAnalysis(result.analysis);
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not generate comparative analysis. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>AI Comparative Analysis</CardTitle>
        <CardDescription>
          Generate AI-powered insights by comparing data across all categories.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : analysis ? (
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {analysis}
          </div>
        ) : (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>No analysis generated</AlertTitle>
            <AlertDescription>
              Click the button below to generate a comparative analysis using AI.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateAnalysis} disabled={loading} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Generate Analysis"}
        </Button>
      </CardFooter>
    </Card>
  );
}
