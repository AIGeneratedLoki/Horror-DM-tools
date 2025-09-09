

"use client";

import { useState } from 'react';
import { generateEncounterFromPrompt } from '@/ai/flows/generate-encounter-from-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import GlitchText from '@/components/GlitchText';
import { Loader2, Dices, User, Shield, X, Trash2 } from 'lucide-react';
import { useCampaign } from '@/hooks/use-campaign';
import { cn } from '@/lib/utils';
import type { EncounterParticipant } from '../page';
import { Input } from '@/components/ui/input';

const TurnOrderCard = () => {
    const { campaigns, currentCampaign, setCampaigns } = useCampaign();
    const participants = campaigns[currentCampaign]?.encounterParticipants || [];

    const handleInitiativeChange = (id: string, value: string) => {
        setCampaigns(prev => {
            const campaign = prev[currentCampaign];
            if (!campaign) return prev;
            
            const updatedParticipants = campaign.encounterParticipants.map(p => 
                p.id === id ? { ...p, initiative: parseInt(value) || 0 } : p
            );

            return { ...prev, [currentCampaign]: { ...campaign, encounterParticipants: updatedParticipants } };
        });
    }

    const handleRemoveParticipant = (id: string) => {
        setCampaigns(prev => {
            const campaign = prev[currentCampaign];
            if (!campaign) return prev;

            const updatedParticipants = campaign.encounterParticipants.filter(p => p.id !== id);
            return { ...prev, [currentCampaign]: { ...campaign, encounterParticipants: updatedParticipants } };
        });
    }

    const clearEncounter = () => {
        setCampaigns(prev => {
            const campaign = prev[currentCampaign];
            if (!campaign) return prev;
            return { ...prev, [currentCampaign]: { ...campaign, encounterParticipants: [] } };
        });
    }

    const sortedParticipants = [...participants].sort((a, b) => b.initiative - a.initiative);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="font-headline flex items-center gap-2"><Dices className="text-primary"/> Turn Order</CardTitle>
                    <CardDescription>The sequence of chaos.</CardDescription>
                </div>
                <Button variant="destructive" size="sm" onClick={clearEncounter} disabled={participants.length === 0}>
                    <Trash2 className="mr-2" />
                    Clear
                </Button>
            </CardHeader>
            <CardContent>
                {sortedParticipants.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No one is in the encounter yet.</p>
                        <p className="text-xs">Add players or send creatures from the compendium.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {sortedParticipants.map((p, i) => (
                            <li key={p.id} className={`flex items-center justify-between p-2 rounded-md ${i === 0 ? 'bg-primary/20 border-l-4 border-primary' : 'bg-secondary/20'}`}>
                                <div className="flex items-center gap-3">
                                    {p.type === 'player' ? <User className="size-5 text-accent flicker" /> : <Shield className="size-5 text-destructive" />}
                                    <span className="font-medium">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        className="w-16 h-8 text-center font-code" 
                                        value={p.initiative}
                                        onChange={(e) => handleInitiativeChange(p.id, e.target.value)}
                                    />
                                    <Button variant="ghost" size="icon" className="size-8" onClick={() => handleRemoveParticipant(p.id)}>
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};


export default function EncounterBuilderPage() {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [generatedEncounter, setGeneratedEncounter] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) {
            toast({
                title: 'Prompt is empty',
                description: 'Please describe the encounter you want to create.',
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        setGeneratedEncounter('');
        try {
            const result = await generateEncounterFromPrompt({ prompt });
            setGeneratedEncounter(result.encounterDescription);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error generating encounter',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Encounter Builder</h1>
                <p className="text-muted-foreground">Craft your nightmares. Let the AI assist.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">AI Encounter Generator</CardTitle>
                        <CardDescription>Describe a scene, and the AI will flesh out the horror.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="e.g., A chase through a cornfield at midnight with a scarecrow that isn't just a scarecrow."
                            className="h-32"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full bleeding-btn">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Nightmare'}
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                  <TurnOrderCard />
                </div>
            </div>
            
            {generatedEncounter && (
                 <Card className="mt-8">
                    <CardHeader>
                        <GlitchText text="Generated Encounter" className="text-2xl" />
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                            {generatedEncounter}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
