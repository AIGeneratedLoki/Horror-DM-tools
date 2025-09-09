

"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import GlitchText from "@/components/GlitchText";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { processStoryFile } from "@/ai/flows/process-story-file";
import { Loader2, Upload, PlusCircle, BookOpen, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayerCard } from "@/components/PlayerCard";
import type { MonsterDetails } from "@/types/monster";
import { useCampaign } from "@/hooks/use-campaign";
import type { Player } from "@/types/player";


export type EncounterParticipant = {
  id: string;
  name: string;
  type: 'player' | 'enemy';
  initiative: number;
  monsterDetails?: MonsterDetails;
  playerDetails?: Player;
};


export type CampaignData = {
  notes: string;
  actNotes: string[];
  totalActs: number;
  sessionRecaps: SessionRecap[];
  players: Player[];
  creatures: MonsterDetails[];
  encounterParticipants: EncounterParticipant[];
};

type SessionRecap = {
  title: string;
  recap: string;
};

const initialCampaigns: Record<string, CampaignData> = {
  "Crimson Chronicle": {
    notes: "The killer's identity is... The final girl will be... A new clue is hidden in the old asylum...",
    actNotes: [
        "The party delves into the abandoned slaughterhouse on the edge of town, uncovering a grisly ritual site. They fought off reanimated livestock and narrowly escaped a hulking, masked figure.",
        "Following a cryptic radio signal, the heroes found a pirate radio station run by a cult obsessed with the masked killer. A bloody confrontation ensued, ending with the station's antenna being destroyed.",
        "Lured to the derelict Camp Crystal Veil, the adventurers faced a series of deadly traps. They rescued a lone survivor who spoke of an unstoppable evil that has haunted these woods for decades."
    ],
    totalActs: 3,
    sessionRecaps: [
      {
        title: "Session 1: The Abattoir of Whispers",
        recap: "The party delved into the abandoned slaughterhouse on the edge of town, uncovering a grisly ritual site. They fought off reanimated livestock and narrowly escaped a hulking, masked figure."
      },
      {
        title: "Session 2: The Midnight Broadcast",
        recap: "Following a cryptic radio signal, the heroes found a pirate radio station run by a cult obsessed with the masked killer. A bloody confrontation ensued, ending with the station's antenna being destroyed."
      },
      {
        title: "Session 3: The Summer Camp Massacre",
        recap: "Lured to the derelict Camp Crystal Veil, the adventurers faced a series of deadly traps. They rescued a lone survivor who spoke of an unstoppable evil that has haunted these woods for decades."
      },
    ],
    players: [{ id: 'player-1', name: 'Jax "Final Boy" Riley' }],
    creatures: [],
    encounterParticipants: [],
  }
};

export default function CampaignOverview() {
  const { toast } = useToast();
  const { campaigns, setCampaigns, currentCampaign, setCurrentCampaign } = useCampaign(initialCampaigns);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [isAddCampaignOpen, setAddCampaignOpen] = useState(false);
  const [currentAct, setCurrentAct] = useState(1);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentData = campaigns[currentCampaign] || { notes: '', actNotes: [], totalActs: 1, sessionRecaps: [], players: [], creatures: [], encounterParticipants: [] };

  const handleActNotesChange = (notes: string) => {
    setCampaigns(prev => {
        const campaign = prev[currentCampaign];
        if (!campaign) return prev;

        const newActNotes = [...(campaign.actNotes || [])];
        newActNotes[currentAct - 1] = notes;

        return {
            ...prev,
            [currentCampaign]: { ...campaign, actNotes: newActNotes }
        };
    });
  };

  const handleTotalActsChange = (value: string) => {
      const numActs = parseInt(value, 10);
      setCampaigns(prev => {
        const campaign = prev[currentCampaign];
        if (!campaign) return prev;

        // Adjust current act if it's out of bounds
        if (currentAct > numActs) {
            setCurrentAct(numActs);
        }

        // Ensure actNotes array has enough entries
        const newActNotes = [...(campaign.actNotes || [])];
        while (newActNotes.length < numActs) {
            newActNotes.push('');
        }

        return {
            ...prev,
            [currentCampaign]: { ...campaign, totalActs: numActs, actNotes: newActNotes }
        }
      })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      toast({ title: 'Invalid file type.', description: 'Please upload a .txt file.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const result = await processStoryFile({ storyContent: content });
        handleActNotesChange(result.summary);
        toast({ title: 'Notes imported successfully!', description: 'The AI has summarized your file.' });
      } catch (error) {
        toast({ title: 'Failed to process file.', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
    if (event.target) {
        event.target.value = ''; // Reset file input
    }
  };
  
  const handleAddCampaign = () => {
    if (!newCampaignName.trim()) {
      toast({ title: "Campaign name cannot be empty.", variant: "destructive" });
      return;
    }
    if (campaigns[newCampaignName]) {
      toast({ title: "Campaign name already exists.", variant: "destructive" });
      return;
    }

    setCampaigns(prev => ({
      ...prev,
      [newCampaignName]: { notes: '', actNotes: [''], totalActs: 1, sessionRecaps: [], players: [], creatures: [], encounterParticipants: [] }
    }));
    setCurrentCampaign(newCampaignName);
    setNewCampaignName("");
    setAddCampaignOpen(false);
    toast({ title: `Campaign "${newCampaignName}" created!` });
  };
  
  const handleAddPlayer = () => {
    setCampaigns(prev => {
        const newPlayer = { id: `player-${Date.now()}`, name: 'New Player' };
        const updatedCampaign = {
            ...prev[currentCampaign],
            players: [...prev[currentCampaign].players, newPlayer]
        };
        return { ...prev, [currentCampaign]: updatedCampaign };
    });
};

const handleUpdatePlayer = (updatedPlayer: Player) => {
    setCampaigns(prev => {
        const campaign = prev[currentCampaign];
        if (!campaign) return prev;

        const updatedPlayers = campaign.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
        const updatedCampaign = { ...campaign, players: updatedPlayers };

        return { ...prev, [currentCampaign]: updatedCampaign };
    });
};

const handleDeletePlayer = (playerId: string) => {
    setCampaigns(prev => {
        const campaign = prev[currentCampaign];
        if (!campaign) return prev;
        
        const updatedPlayers = campaign.players.filter(p => p.id !== playerId);
        const updatedCampaign = { ...campaign, players: updatedPlayers };

        toast({ title: 'Player Removed' });

        return { ...prev, [currentCampaign]: updatedCampaign };
    });
};

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".txt"
      />
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline font-bold">Campaign Overview</h1>
          <p className="text-muted-foreground">The bloody saga so far...</p>
        </div>
         <Dialog open={isAddCampaignOpen} onOpenChange={setAddCampaignOpen}>
          <div className="flex items-center gap-4">
            <Select onValueChange={setCurrentCampaign} value={currentCampaign}>
              <SelectTrigger className="w-72 text-lg">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(campaigns).map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
                <SelectSeparator />
                 <DialogTrigger asChild>
                  <div 
                    className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                    onClick={() => setAddCampaignOpen(true)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <PlusCircle className="absolute left-2 h-4 w-4" />
                    Add New Campaign
                  </div>
                </DialogTrigger>
              </SelectContent>
            </Select>
          </div>
           <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Give your new horror story a name.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="col-span-3"
                  placeholder="E.g., The Haunting of Hill House"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddCampaign}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

       <div className="space-y-4">
            <header className="flex justify-between items-center">
                <h2 className="text-3xl font-headline font-bold">Player Characters</h2>
                <Button onClick={handleAddPlayer} className="bleeding-btn">
                    <UserPlus className="mr-2"/>
                    Add Player
                </Button>
            </header>
            <div className="space-y-4">
                {currentData.players.map(player => (
                    <PlayerCard 
                        key={player.id} 
                        player={player} 
                        onUpdate={handleUpdatePlayer} 
                        onDelete={() => handleDeletePlayer(player.id)}
                    />
                ))}
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline">Timeline Scrubber</CardTitle>
                 <div className="flex items-center gap-2">
                    <Label htmlFor="total-acts" className="text-sm">Total Acts:</Label>
                    <Select value={currentData.totalActs.toString()} onValueChange={handleTotalActsChange}>
                        <SelectTrigger id="total-acts" className="w-20 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>
            <CardDescription>Current Act: {currentAct}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <Slider
                value={[currentAct]}
                onValueChange={(value) => setCurrentAct(value[0])}
                max={currentData.totalActs}
                step={1}
                min={1}
                className="[&>span:first-child]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline">Act Notes</CardTitle>
                <CardDescription>Notes for Act {currentAct} of {currentData.totalActs}.</CardDescription>
              </div>
               <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} variant="outline">
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Import to this Act
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`The key events for Act ${currentAct} are...`}
              className="h-64 resize-none"
              value={currentData.actNotes?.[currentAct - 1] || ''}
              onChange={(e) => handleActNotesChange(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  <GlitchText text="Session Recaps" />
                </CardTitle>
                <CardDescription>Previously on {currentCampaign}...</CardDescription>
              </div>
              <Button className="bleeding-btn">New Session</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full">
               {currentData.sessionRecaps.length > 0 ? (
                <div className="space-y-6">
                  {currentData.sessionRecaps.map((session, index) => (
                    <div key={index} className="p-4 border-l-4 border-primary bg-secondary/20 rounded-r-md">
                      <h3 className="text-lg font-headline font-semibold text-accent flicker">{session.title}</h3>
                      <p className="text-muted-foreground mt-1">{session.recap}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <BookOpen className="size-16 mb-4" />
                  <h3 className="text-xl font-headline">No Sessions Yet</h3>
                  <p>Start a new session to begin chronicling your tale of horror.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
