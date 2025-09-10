
'use client';

import { forwardRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import type { MonsterDetails, AbilityScore, Action } from '@/types/monster';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, ChevronUp, X, Heart, Shield, Swords, Dices } from 'lucide-react';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { useCampaign } from '@/hooks/use-campaign';
import { useToast } from '@/hooks/use-toast';

type StatCardProps = {
    monster: MonsterDetails;
    onDelete?: () => void;
    showSendToCompendium?: boolean;
    className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const StatBlock = ({ label, value }: { label: string; value: number | string }) => (
    <div className="flex flex-col items-center">
        <span className="font-bold text-lg font-code">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
    </div>
);

const AbilityScoreDisplay = ({ score, name }: { score: number; name: string }) => {
    const modifier = Math.floor((score - 10) / 2);
    return (
        <div className="flex flex-col items-center p-1 rounded-md bg-secondary/30">
            <span className="font-bold text-sm text-accent flicker">{name}</span>
            <span className="text-muted-foreground text-xs">{score} ({modifier >= 0 ? '+' : ''}{modifier})</span>
        </div>
    );
};

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
    ({ monster, onDelete, showSendToCompendium = false, className, ...props }, ref) => {
  const router = useRouter();
  const { toast } = useToast();
  const { setCampaigns, currentCampaign } = useCampaign();
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState(monster.name);

  const handleSendToCompendium = () => {
    router.push(`/compendium?search=${encodeURIComponent(monster.name)}`);
  }

  const handleSendToEncounter = () => {
    setCampaigns(prev => {
        const campaign = prev[currentCampaign];
        if (!campaign) return prev;
        
        const newParticipant = {
            id: `${monster.index}-${Date.now()}`,
            name: monster.name,
            type: 'enemy' as const,
            initiative: Math.floor(Math.random() * 20) + 1, // Roll for initiative
            monsterDetails: monster
        };

        const updatedCampaign = {
            ...campaign,
            encounterParticipants: [...(campaign.encounterParticipants || []), newParticipant]
        };

        toast({
            title: 'Creature Sent to Encounter',
            description: `${monster.name} has been added to the turn order.`,
        });

        router.push('/encounters');

        return {
            ...prev,
            [currentCampaign]: updatedCampaign
        };
    });
  }
  
  const abilityScores: AbilityScore[] = [
      { name: "STR", score: monster.strength },
      { name: "DEX", score: monster.dexterity },
      { name: "CON", score: monster.constitution },
      { name: "INT", score: monster.intelligence },
      { name: "WIS", score: monster.wisdom },
      { name: "CHA", score: monster.charisma },
  ]

  if (!isExpanded) {
    return (
        <Card ref={ref} className={cn("border-primary/20", className)} {...props}>
             <CardContent className="p-2">
                <div className="flex items-center gap-2">
                    <Avatar className="h-12 w-12 border-2 border-primary/50">
                        <AvatarImage src={monster.image} data-ai-hint="monster portrait" />
                        <AvatarFallback className="text-xl font-headline bg-secondary">
                            {monster.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-grow text-lg h-12 bg-transparent border-0"
                    />
                    <div className="flex items-center gap-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                             <Heart className="size-4 text-accent" />
                             <span className="text-xs font-bold">{monster.hit_points}</span>
                        </div>
                         <div className="flex flex-col items-center gap-0.5">
                             <Shield className="size-4 text-accent" />
                             <span className="text-xs font-bold">{monster.armor_class[0]?.value || 10}</span>
                        </div>
                    </div>
                     <div className="flex items-center">
                        {onDelete && (
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={onDelete}>
                                <X className="size-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} className="text-muted-foreground hover:text-accent">
                            <ChevronDown className="size-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card ref={ref} className={cn("border-accent/80 border-2", className)} {...props}>
        <CardHeader className="p-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                     <Avatar className="h-16 w-16 border-2 border-primary/50">
                        <AvatarImage src={monster.image} data-ai-hint="monster portrait" />
                        <AvatarFallback className="text-3xl font-headline bg-secondary">
                            {monster.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <Input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="font-headline text-2xl text-primary h-10 border-0 bg-transparent p-0"
                        />
                        <CardDescription>
                            {monster.size} {monster.type}, {monster.alignment}
                        </CardDescription>
                    </div>
                </div>
                 <div className="flex items-center">
                    {onDelete && (
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={onDelete}>
                            <X className="size-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="text-muted-foreground hover:text-accent">
                        <ChevronUp className="size-5" />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm">
            <div className="grid grid-cols-3 gap-2 text-center border-y border-border/50 py-2 mb-3">
                <StatBlock label="AC" value={monster.armor_class[0]?.value || 10} />
                <StatBlock label="HP" value={`${monster.hit_points} (${monster.hit_dice})`} />
                <StatBlock label="Speed" value={monster.speed.walk || '30 ft.'} />
            </div>
            
             <div className="grid grid-cols-6 gap-1 my-3">
                {abilityScores.map(abs => <AbilityScoreDisplay key={abs.name} score={abs.score} name={abs.name} />)}
            </div>

            <Separator className="my-2" />

            <div className="space-y-1">
                <p><strong className="text-accent flicker">Saving Throws:</strong> {monster.proficiencies.filter(p => p.proficiency.name.startsWith("Saving Throw:")).map(p => `${p.proficiency.name.replace("Saving Throw: ", "")} +${p.value}`).join(', ')}</p>
                <p><strong className="text-accent flicker">Skills:</strong> {monster.proficiencies.filter(p => p.proficiency.name.startsWith("Skill:")).map(p => `${p.proficiency.name.replace("Skill: ", "")} +${p.value}`).join(', ')}</p>
                {monster.damage_vulnerabilities.length > 0 && <p><strong className="text-accent flicker">Damage Vulnerabilities:</strong> {monster.damage_vulnerabilities.join(', ')}</p>}
                {monster.damage_resistances.length > 0 && <p><strong className="text-accent flicker">Damage Resistances:</strong> {monster.damage_resistances.join(', ')}</p>}
                {monster.damage_immunities.length > 0 && <p><strong className="text-accent flicker">Damage Immunities:</strong> {monster.damage_immunities.join(', ')}</p>}
                {monster.condition_immunities.length > 0 && <p><strong className="text-accent flicker">Condition Immunities:</strong> {monster.condition_immunities.map(ci => ci.name).join(', ')}</p>}
                <p><strong className="text-accent flicker">Senses:</strong> {Object.entries(monster.senses).map(([k,v]) => `${k.replace(/_/g, ' ')} ${v}`).join(', ')}</p>
                <p><strong className="text-accent flicker">Languages:</strong> {monster.languages}</p>
                <p><strong className="text-accent flicker">Challenge:</strong> {monster.challenge_rating} ({monster.xp} XP)</p>
            </div>
            
            {monster.special_abilities && monster.special_abilities.length > 0 && (
                <>
                    <Separator className="my-2" />
                    {monster.special_abilities.map((ability: Action) => (
                        <p key={ability.name}><strong>{ability.name}.</strong> {ability.desc}</p>
                    ))}
                </>
            )}

             <h3 className="font-headline text-lg text-primary mt-4 border-b-2 border-primary/30 mb-2">Actions</h3>
             <div className="space-y-2">
                {monster.actions?.map((action: Action) => (
                    <div key={action.name}>
                        <p><strong>{action.name}.</strong> {action.desc}</p>
                        {action.attack_bonus !== undefined && <p className="text-xs text-muted-foreground">Attack Bonus: {action.attack_bonus}, Damage: {action.damage?.map(d => d.damage_dice).join(', ')}</p>}
                    </div>
                ))}
            </div>

            {monster.legendary_actions && monster.legendary_actions.length > 0 && (
                 <>
                    <h3 className="font-headline text-lg text-primary mt-4 border-b-2 border-primary/30 mb-2">Legendary Actions</h3>
                     <div className="space-y-2">
                        {monster.legendary_actions.map((action: Action) => (
                            <p key={action.name}><strong>{action.name}.</strong> {action.desc}</p>
                        ))}
                    </div>
                </>
            )}
            
            <div className="flex items-center gap-2 mt-4">
                {showSendToCompendium && (
                    <Button variant="outline" size="sm" onClick={handleSendToCompendium} className="w-full">View in Compendium</Button>
                )}
                 {onDelete && (
                    <Button variant="outline" size="sm" onClick={handleSendToEncounter} className="w-full">
                        <Dices className="mr-2"/> Send to Encounter
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
  )
});

StatCard.displayName = "StatCard";
