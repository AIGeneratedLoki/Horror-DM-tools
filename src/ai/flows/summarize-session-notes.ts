// Summarize Session Notes Flow
'use server';
/**
 * @fileOverview A flow to summarize session notes for game masters.
 *
 * - summarizeSessionNotes - A function that summarizes session notes.
 * - SummarizeSessionNotesInput - The input type for the summarizeSessionNotes function.
 * - SummarizeSessionNotesOutput - The return type for the summarizeSessionNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSessionNotesInputSchema = z.object({
  sessionNotes: z
    .string()
    .describe('The session notes to summarize.'),
});
export type SummarizeSessionNotesInput = z.infer<typeof SummarizeSessionNotesInputSchema>;

const SummarizeSessionNotesOutputSchema = z.object({
  summary: z.string().describe('The summarized session notes.'),
});
export type SummarizeSessionNotesOutput = z.infer<typeof SummarizeSessionNotesOutputSchema>;

export async function summarizeSessionNotes(input: SummarizeSessionNotesInput): Promise<SummarizeSessionNotesOutput> {
  return summarizeSessionNotesFlow(input);
}

const summarizeSessionNotesPrompt = ai.definePrompt({
  name: 'summarizeSessionNotesPrompt',
  input: {schema: SummarizeSessionNotesInputSchema},
  output: {schema: SummarizeSessionNotesOutputSchema},
  prompt: `You are a helpful assistant to game masters.

  Please provide a concise summary of the following session notes:

  {{sessionNotes}}`,
});

const summarizeSessionNotesFlow = ai.defineFlow(
  {
    name: 'summarizeSessionNotesFlow',
    inputSchema: SummarizeSessionNotesInputSchema,
    outputSchema: SummarizeSessionNotesOutputSchema,
  },
  async input => {
    const {output} = await summarizeSessionNotesPrompt(input);
    return output!;
  }
);
