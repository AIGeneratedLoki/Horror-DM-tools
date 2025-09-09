'use server';
/**
 * @fileOverview A flow to process an uploaded story file and generate a summary.
 *
 * - processStoryFile - A function that summarizes story content.
 * - ProcessStoryFileInput - The input type for the processStoryFile function.
 * - ProcessStoryFileOutput - The return type for the processStoryFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessStoryFileInputSchema = z.object({
  storyContent: z.string().describe('The content of the story or notes file to summarize.'),
});
export type ProcessStoryFileInput = z.infer<typeof ProcessStoryFileInputSchema>;

const ProcessStoryFileOutputSchema = z.object({
  summary: z.string().describe('The summarized story content.'),
});
export type ProcessStoryFileOutput = z.infer<typeof ProcessStoryFileOutputSchema>;

export async function processStoryFile(input: ProcessStoryFileInput): Promise<ProcessStoryFileOutput> {
  return processStoryFileFlow(input);
}

const processStoryFilePrompt = ai.definePrompt({
  name: 'processStoryFilePrompt',
  input: {schema: ProcessStoryFileInputSchema},
  output: {schema: ProcessStoryFileOutputSchema},
  prompt: `You are an expert assistant for a game master. Your task is to read the provided story or session notes and create a concise summary. This summary should highlight key plot points, characters, locations, and any potential hooks for future adventures.

  Here is the content:

  {{storyContent}}`,
});

const processStoryFileFlow = ai.defineFlow(
  {
    name: 'processStoryFileFlow',
    inputSchema: ProcessStoryFileInputSchema,
    outputSchema: ProcessStoryFileOutputSchema,
  },
  async input => {
    const {output} = await processStoryFilePrompt(input);
    return output!;
  }
);
