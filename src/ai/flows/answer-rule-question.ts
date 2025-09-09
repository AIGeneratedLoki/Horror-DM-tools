
'use server';
/**
 * @fileOverview An AI agent for answering questions about D&D 5e rules.
 *
 * - answerRuleQuestion - A function that answers a user's question about D&D 5e rules.
 * - AnswerRuleQuestionInput - The input type for the answerRuleQuestion function.
 * - AnswerRuleQuestionOutput - The return type for the answerRuleQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonsterDetailsSchema = z.object({
    name: z.string(),
    challenge_rating: z.number(),
    size: z.string(),
    type: z.string(),
    armor_class: z.array(z.object({value: z.number()})),
    hit_points: z.number(),
    speed: z.record(z.string()),
    senses: z.record(z.string()),
    proficiencies: z.array(z.object({proficiency: z.object({name: z.string()}), value: z.number()})),
});

const AnswerRuleQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about D&D 5e rules.'),
});
export type AnswerRuleQuestionInput = z.infer<typeof AnswerRuleQuestionInputSchema>;

const AnswerRuleQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the rule question.'),
  creature: MonsterDetailsSchema.optional().describe('If the question was about a specific D&D creature, its details are provided here.'),
});
export type AnswerRuleQuestionOutput = z.infer<typeof AnswerRuleQuestionOutputSchema>;


const getCreatureDetails = ai.defineTool(
    {
        name: 'getCreatureDetails',
        description: 'Gets the details of a D&D 5e creature from the dnd5eapi.',
        inputSchema: z.object({ name: z.string().describe("The name of the creature to look up. This should be in lowercase and spaces replaced with hyphens.") }),
        outputSchema: MonsterDetailsSchema.optional(),
    },
    async (input) => {
        try {
            const response = await fetch(`https://www.dnd5eapi.co/api/monsters/${input.name}`);
            if (!response.ok) return undefined;
            return await response.json();
        } catch (e) {
            return undefined;
        }
    }
);


export async function answerRuleQuestion(input: AnswerRuleQuestionInput): Promise<AnswerRuleQuestionOutput> {
  return answerRuleQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerRuleQuestionPrompt',
  input: {schema: AnswerRuleQuestionInputSchema},
  output: {schema: AnswerRuleQuestionOutputSchema},
  tools: [getCreatureDetails],
  prompt: `You are the Chronicler, an expert game master for Dungeons & Dragons 5th Edition. Your purpose is to answer rule questions accurately and concisely.

  A user has the following question:
  "{{question}}"

  First, determine if the user is asking about a specific creature. If they are, use the getCreatureDetails tool to fetch its data.
  Then, provide a clear and helpful answer based on the official D&D 5e rules. If the rule is ambiguous or has common variations, you can mention them. Frame your answer as if you are the Chronicler, an ancient and knowledgeable entity.
  If you used the tool and found creature data, include it in the response.`,
});

const answerRuleQuestionFlow = ai.defineFlow(
  {
    name: 'answerRuleQuestionFlow',
    inputSchema: AnswerRuleQuestionInputSchema,
    outputSchema: AnswerRuleQuestionOutputSchema,
  },
  async input => {
    const llmResponse = await ai.generate({
      prompt: prompt.prompt,
      model: ai.model,
      tools: [getCreatureDetails],
      output: {
        schema: AnswerRuleQuestionOutputSchema,
      },
      promptData: input,
    });

    const choice = llmResponse.choices[0];
    const toolCalls = choice.toolCalls;

    if (toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const toolResult = await getCreatureDetails(toolCall.input);
      
      const secondResponse = await ai.generate({
          prompt: prompt.prompt,
          model: ai.model,
          tools: [getCreatureDetails],
          toolResult: {
              toolCall: toolCall,
              toolResult: toolResult,
          },
          output: {
              schema: AnswerRuleQuestionOutputSchema,
          },
          promptData: input,
      });
      return secondResponse.output!;
    }
    
    return llmResponse.output!;
  }
);
