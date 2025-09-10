
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { summarizeSessionNotes } from '@/ai/flows/summarize-session-notes';
import { useToast } from '@/hooks/use-toast';
import GlitchText from '@/components/GlitchText';
import { User, Shield, Dices, PlusCircle, Archive, Swords, MapPin, BookOpen, Pencil, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useCampaign } from '@/hooks/use-campaign';
import type { Player } from '@/types/player';
import type { MonsterDetails } from '@/types/monster';

export type EncounterParticipant = {
  id: string;
  name: string;
  type: 'player' | 'enemy';
  initiative: number;
  monsterDetails?: MonsterDetails;
  playerDetails?: Player;
};

type LogEntry = {
    id: number;
    text: string;
    type: 'major' | 'minor';
    tag?: 'battle' | 'location' | 'event';
};

type Session = {
    id: string;
    title: string;
    date: string;
    logs: LogEntry[];
    summary: string;
}

const initialArchivedSessions: Session[] = [
    {
        id: 'session-1',
        title: 'The Slaughterhouse',
        date: '2024-10-28',
        logs: [
            { id: 1, text: 'Party entered the old Miller Slaughterhouse.', type: 'major', tag: 'location' },
            { id: 2, text: 'Found strange symbols painted on the walls.', type: 'minor'},
            { id: 3, text: 'Fought two reanimated pigs.', type: 'minor', tag: 'battle' }
        ],
        summary: 'The party explored the eerie slaughterhouse, finding clues and facing undead swine.'
    },
    {
        id: 'session-2',
        title: 'The Midnight Broadcast',
        date: '2024-10-30',
        logs: [
            { id: 1, text: 'Followed a cryptic radio signal to the old radio tower.', type: 'major', tag: 'location'},
            { id: 2, text: 'A bloody confrontation with cultists ensued.', type: 'minor', tag: 'battle' }
        ],
        summary: 'The party discovered a pirate radio station run by a killer-worshipping cult.'
    }
]

const TurnOrderCard = () => {
    const { campaigns, currentCampaign, setCampaigns } = useCampaign();
    const participants = campaigns[currentCampaign]?.encounterParticipants || [];

    const sortedParticipants = [...participants].sort((a, b) => b.initiative - a.initiative);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Dices className="text-primary"/> Turn Tracker</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <ScrollArea className="flex-grow pr-2">
                    <ul className="space-y-2">
                    {sortedParticipants.map((p, i) => (
                        <li key={p.id} className={`flex items-center justify-between p-2 rounded-md ${i === 0 ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                        <div className="flex items-center gap-3">
                            {p.type === 'player' ? <User className="size-5 text-accent flicker" /> : <Shield className="size-5 text-destructive" />}
                            <span className="font-medium">{p.name}</span>
                        </div>
                        <span className="font-code text-lg">{p.initiative}</span>
                        </li>
                    ))}
                    {sortedParticipants.length === 0 && <p className="text-center text-muted-foreground p-4">No combatants.</p>}
                    </ul>
                </ScrollArea>
                <Button variant="outline" className="mt-4 flex-shrink-0">
                    <PlusCircle className="mr-2" /> Add Combatant
                </Button>
            </CardContent>
        </Card>
    );
};


export default function SessionManagerPage() {
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const [currentSessionLogs, setCurrentSessionLogs] = useState<LogEntry[]>([
      { id: 1, text: `Session Started: ${new Date().toLocaleDateString('en-CA')}`, type: 'major'}
  ]);
  const [newLog, setNewLog] = useState('');

  const [archivedSessions, setArchivedSessions] = useState<Session[]>(initialArchivedSessions);
  const [selectedArchivedSession, setSelectedArchivedSession] = useState<Session | null>(initialArchivedSessions[0] || null);

  const handleSummarize = async (notesToSummarize: string): Promise<string> => {
    if (!notesToSummarize) {
        toast({ title: 'No notes to summarize.', variant: 'destructive' });
        return '';
    }
    setIsSummarizing(true);
    try {
        const result = await summarizeSessionNotes({ sessionNotes: notesToSummarize });
        return result.summary;
    } catch (error) {
        toast({ title: 'Failed to summarize notes.', variant: 'destructive' });
        return 'Could not generate summary.';
    } finally {
        setIsSummarizing(false);
    }
  };
  
  const addLog = (tag?: LogEntry['tag']) => {
    if(newLog.trim()){
      const newEntry: LogEntry = {
        id: currentSessionLogs.length + 1,
        text: newLog.trim(),
        type: tag ? 'minor' : 'major',
        tag
      };
      setCurrentSessionLogs(prev => [...prev, newEntry]);
      setNewLog('');
    }
  }

  const handleNewSession = () => {
    if(currentSessionLogs.length > 1) {
        const shouldArchive = confirm("There's a session in progress. Do you want to archive it before starting a new one?");
        if (shouldArchive) {
          handleArchiveSession(true);
        } else {
            return;
        }
    }
    const newDate = new Date().toLocaleDateString('en-CA');
    const newLogEntry: LogEntry = { id: 1, text: `Session Started: ${newDate}`, type: 'major'};
    setCurrentSessionLogs([newLogEntry]);
    toast({ title: 'New Session Started' });
  }

  const handleArchiveSession = async (silent = false) => {
     if (currentSessionLogs.length <= 1) {
        if (!silent) toast({ title: 'Nothing to Archive', description: 'Add some logs to the session first.', variant: 'default'});
        return false;
    }
    const sessionTitle = prompt("Enter a title for this session:", `Session of ${new Date().toLocaleDateString()}`);
    if (!sessionTitle) return false;

    const notesToSummarize = currentSessionLogs.map(log => log.text).join('\n');
    const summary = await handleSummarize(notesToSummarize);

    const newArchive: Session = {
        id: `session-${Date.now()}`,
        title: sessionTitle,
        date: new Date().toLocaleDateString('en-CA'),
        logs: currentSessionLogs,
        summary: summary || 'No summary generated.'
    };
    setArchivedSessions(prev => [newArchive, ...prev]);
    setSelectedArchivedSession(newArchive);
    if (!silent) toast({ title: 'Session Archived!', description: `"${sessionTitle}" has been saved.`});
    
    // Reset for next session
    const newDate = new Date().toLocaleDateString('en-CA');
    setCurrentSessionLogs([{ id: 1, text: `Session Started: ${newDate}`, type: 'major' }]);
    return true;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 grid grid-cols-3 grid-rows-[2fr_3fr] gap-6 h-[calc(100vh-8rem)]">
        <div className="col-span-1 row-span-1">
            <TurnOrderCard />
        </div>

        <div className="col-span-2 row-span-1">
            <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <CardTitle className="font-headline">Event Log</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleNewSession} variant="outline"><PlusCircle className="mr-2"/> New Session</Button>
                            <Button onClick={() => handleArchiveSession()} disabled={isSummarizing}>
                                {isSummarizing ? <Loader2 className="animate-spin mr-2"/> : <Archive className="mr-2"/>}
                                Archive Session
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex gap-2 overflow-hidden">
                    <Textarea 
                        placeholder="Log a new event... press Enter to add." 
                        className="h-full resize-none" 
                        value={newLog} 
                        onChange={e => setNewLog(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                addLog();
                            }
                        }}
                    />
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" size="icon" onClick={() => addLog('battle')} title="Tag as Battle"><Swords /></Button>
                        <Button variant="outline" size="icon" onClick={() => addLog('location')} title="Tag as Location"><MapPin /></Button>
                        <Button variant="outline" size="icon" onClick={() => addLog('event')} title="Tag as Event"><BookOpen /></Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="col-span-3 row-span-1">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle><GlitchText text="Session Archive"/></CardTitle>
                    <CardDescription>The tales of horror that have come to pass.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 flex-grow overflow-hidden">
                    <div className="col-span-1">
                        <ScrollArea className="h-full border rounded-md p-2 bg-secondary/30">
                            {archivedSessions.map(session => (
                                <div 
                                    key={session.id}
                                    className={`p-2 rounded-md cursor-pointer hover:bg-primary/20 ${selectedArchivedSession?.id === session.id ? 'bg-primary/20' : ''}`}
                                    onClick={() => setSelectedArchivedSession(session)}
                                >
                                    <p className="font-bold truncate">{session.title}</p>
                                    <p className="text-xs text-muted-foreground">{session.date}</p>
                                </div>
                            ))}
                            {archivedSessions.length === 0 && <p className="text-center text-xs text-muted-foreground p-4">No sessions archived yet.</p>}
                        </ScrollArea>
                    </div>
                    <div className="col-span-3 relative">
                         {selectedArchivedSession ? (
                            <>
                                <ScrollArea className="h-full pr-4">
                                    <div>
                                        <h3 className="font-headline text-2xl text-accent flicker">{selectedArchivedSession.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Session Date: {selectedArchivedSession.date}</p>
                                        <Separator />
                                        <div className="mt-4">
                                            <h4 className="font-semibold mb-2">Logs:</h4>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                {selectedArchivedSession.logs.map(log => (
                                                    <p key={log.id} className={`${log.type === 'minor' ? 'pl-4 font-light' : ''}`}>
                                                        {log.tag === 'battle' && <Swords className="inline-block mr-2 text-destructive size-4" />}
                                                        {log.tag === 'location' && <MapPin className="inline-block mr-2 text-accent size-4" />}
                                                        {log.tag === 'event' && <BookOpen className="inline-block mr-2 text-primary size-4" />}
                                                        <span className={`${log.type === 'major' ? 'font-bold text-foreground' : ''}`}>{log.text}</span>
                                                    </p>
                                                ))}
                                            </div>
                                            <Separator className="my-4"/>
                                            <h4 className="font-semibold mb-2">AI Summary:</h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedArchivedSession.summary}</p>
                                        </div>
                                    </div>
                                </ScrollArea>
                                 <Button variant="outline" size="icon" className="absolute bottom-2 right-2">
                                    <Pencil className="size-4" />
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                               <Archive className="size-16 mb-4" />
                               <h3 className="text-xl font-headline">No Session Selected</h3>
                               <p>Select a session from the archive to view its details.</p>
                             </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
