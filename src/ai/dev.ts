import { config } from 'dotenv';
config();

import '@/ai/flows/generate-encounter-from-prompt.ts';
import '@/ai/flows/summarize-session-notes.ts';
import '@/ai/flows/process-story-file.ts';
import '@/ai/flows/answer-rule-question.ts';
