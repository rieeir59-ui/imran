'use server';

/**
 * @fileOverview An AI-powered tool that analyzes and compares data across
 * commercial, residential, hotel, and bank branch categories to generate insights and identify trends for better decision-making.
 *
 * - generateComparativeAnalysis - A function that generates comparative analysis.
 * - GenerateComparativeAnalysisInput - The input type for the generateComparativeAnalysis function.
 * - GenerateComparativeAnalysisOutput - The return type for the generateComparativeAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComparativeAnalysisInputSchema = z.object({
  commercialData: z.string().describe('Data related to commercial properties.'),
  residentialData: z.string().describe('Data related to residential properties.'),
  hotelData: z.string().describe('Data related to hotel properties.'),
  bankBranchData: z.string().describe('Data related to bank branches.'),
});
export type GenerateComparativeAnalysisInput = z.infer<typeof GenerateComparativeAnalysisInputSchema>;

const GenerateComparativeAnalysisOutputSchema = z.object({
  analysis: z.string().describe('The comparative analysis of the provided data.'),
});
export type GenerateComparativeAnalysisOutput = z.infer<typeof GenerateComparativeAnalysisOutputSchema>;

export async function generateComparativeAnalysis(
  input: GenerateComparativeAnalysisInput
): Promise<GenerateComparativeAnalysisOutput> {
  return generateComparativeAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComparativeAnalysisPrompt',
  input: {schema: GenerateComparativeAnalysisInputSchema},
  output: {schema: GenerateComparativeAnalysisOutputSchema},
  prompt: `You are an expert data analyst. Analyze and compare the following data across different categories to identify trends and insights.

Commercial Data: {{{commercialData}}}
Residential Data: {{{residentialData}}}
Hotel Data: {{{hotelData}}}
Bank Branch Data: {{{bankBranchData}}}

Generate a comparative analysis summarizing key trends and insights.
`,
});

const generateComparativeAnalysisFlow = ai.defineFlow(
  {
    name: 'generateComparativeAnalysisFlow',
    inputSchema: GenerateComparativeAnalysisInputSchema,
    outputSchema: GenerateComparativeAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
