'use server';
/**
 * @fileOverview An AI agent for generating combat encounters from a text prompt.
 *
 * - generateEncounterFromPrompt - A function that generates a combat encounter based on a text prompt.
 * - GenerateEncounterFromPromptInput - The input type for the generateEncounterFromPrompt function.
 * - GenerateEncounterFromPromptOutput - The return type for the generateEncounterFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEncounterFromPromptInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired combat encounter.'),
});
export type GenerateEncounterFromPromptInput = z.infer<typeof GenerateEncounterFromPromptInputSchema>;

const GenerateEncounterFromPromptOutputSchema = z.object({
  encounterDescription: z.string().describe('A detailed description of the generated combat encounter.'),
});
export type GenerateEncounterFromPromptOutput = z.infer<typeof GenerateEncounterFromPromptOutputSchema>;

export async function generateEncounterFromPrompt(input: GenerateEncounterFromPromptInput): Promise<GenerateEncounterFromPromptOutput> {
  return generateEncounterFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEncounterFromPromptPrompt',
  input: {schema: GenerateEncounterFromPromptInputSchema},
  output: {schema: GenerateEncounterFromPromptOutputSchema},
  prompt: `You are a game master, and an expert at creating interesting and challenging combat encounters for D\&D 5e.
  Please generate a detailed description of a combat encounter based on the following prompt:
  {{prompt}}

  Include details such as the location, the monsters involved (including their stats), and any special circumstances or objectives.
  Be creative and engaging, and provide enough information for a game master to run the encounter effectively.`,
});

const generateEncounterFromPromptFlow = ai.defineFlow(
  {
    name: 'generateEncounterFromPromptFlow',
    inputSchema: GenerateEncounterFromPromptInputSchema,
    outputSchema: GenerateEncounterFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
