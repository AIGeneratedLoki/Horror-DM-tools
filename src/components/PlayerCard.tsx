

'use client';

import { useState, forwardRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Shield,
  Skull,
  X,
  User,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import type { Player } from '@/types/player';


const dndSkills = {
  Strength: ['Athletics'],
  Dexterity: ['Acrobatics', 'Sleight of Hand', 'Stealth'],
  Intelligence: ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'],
  Wisdom: ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'],
  Charisma: ['Deception', 'Intimidation', 'Performance', 'Persuasion'],
};
const allSkills = Object.values(dndSkills).flat();

const StatInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative">
    <Input
      value={value}
      onChange={onChange}
      className="h-16 text-center text-3xl font-code bg-secondary/20 border-primary/20"
      placeholder="10"
    />
    <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-secondary/20 px-1 rounded-sm text-muted-foreground">
      {label}
    </label>
  </div>
);

const DeathSave = ({ status, onToggle }: { status: 'empty' | 'success' | 'fail', onToggle: () => void }) => {
    const statusClasses = {
        'empty': 'text-muted-foreground/50',
        'success': 'text-accent',
        'fail': 'text-primary'
    }
    return (
        <button onClick={onToggle}>
            <Skull className={cn("size-6 sm:size-8 transition-colors", statusClasses[status])} fill="currentColor" />
        </button>
    )
}

type PlayerCardProps = {
  player: Player;
  onUpdate: (player: Player) => void;
  onDelete: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const PlayerCard = forwardRef<HTMLDivElement, PlayerCardProps>(
    ({ player, onUpdate, onDelete, ...props }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deathSaves, setDeathSaves] = useState<('empty' | 'success' | 'fail')[]>(['empty', 'empty', 'empty']);
  const [proficientSkills, setProficientSkills] = useState<string[]>([]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...player, name: e.target.value });
  };
  
  const handleDeathSaveToggle = (index: number) => {
    const newSaves = [...deathSaves];
    const currentStatus = newSaves[index];
    if (currentStatus === 'empty') newSaves[index] = 'success';
    else if (currentStatus === 'success') newSaves[index] = 'fail';
    else newSaves[index] = 'empty';
    setDeathSaves(newSaves);
  }

  const toggleSkill = (skill: string) => {
    setProficientSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  }

  if (!isExpanded) {
    return (
      <Card {...props} ref={ref}>
        <CardContent className="p-2 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary/50">
              <AvatarImage src="" data-ai-hint="character portrait" />
              <AvatarFallback className="text-2xl font-headline">
                {player.name ? player.name.charAt(0).toUpperCase() : <User />}
              </AvatarFallback>
            </Avatar>
            <Input
              placeholder="Character Name"
              className="flex-grow text-lg sm:text-xl h-12"
              value={player.name}
              onChange={handleNameChange}
            />
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-muted-foreground font-code">HP</p>
                    <Input className="w-16 h-10 text-center text-lg font-bold" placeholder="100"/>
                </div>
                 <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-muted-foreground font-code">AC</p>
                    <Input className="w-16 h-10 text-center text-lg font-bold" placeholder="18"/>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-2">
                {deathSaves.map((status, i) => (
                    <DeathSave key={i} status={status} onToggle={() => handleDeathSaveToggle(i)} />
                ))}
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={onDelete}>
                <X className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(true)}
                className="text-muted-foreground hover:text-accent"
              >
                <ChevronDown className="size-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 border-2" {...props} ref={ref}>
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-x-4 gap-y-3">
          {/* Col 1: Avatar, Core Info, HP/AC, Death Saves */}
          <div className="col-span-12 md:col-span-3 space-y-3">
             <div className="flex gap-4">
                <Avatar className="h-24 w-24 border-2 border-primary/50">
                    <AvatarImage src="" data-ai-hint="character portrait" />
                     <AvatarFallback className="text-5xl font-headline">
                        {player.name ? player.name.charAt(0).toUpperCase() : <User />}
                    </AvatarFallback>
                </Avatar>
                 <div className="space-y-2 flex-grow">
                    <Input placeholder="Character Name" className="h-10 text-lg" value={player.name} onChange={handleNameChange} />
                     <div className="flex gap-2">
                        <Input placeholder="Race" />
                        <Input placeholder="Class" />
                    </div>
                </div>
            </div>
             <div className="flex justify-around items-center h-20 bg-secondary/20 rounded-lg p-2 gap-4">
                 <div className="flex-1 flex flex-col items-center gap-1">
                    <Heart className="size-6 text-primary flicker" fill="currentColor"/>
                    <Input className="w-full h-8 text-center text-lg font-bold" placeholder="100"/>
                    <Label className="text-xs text-muted-foreground font-code">Max HP</Label>
                </div>
                 <div className="flex-1 flex flex-col items-center gap-1">
                    <Shield className="size-6 text-primary flicker" fill="currentColor"/>
                    <Input className="w-full h-8 text-center text-lg font-bold" placeholder="18"/>
                    <Label className="text-xs text-muted-foreground font-code">AC</Label>
                </div>
             </div>
             <div className="flex justify-center items-center h-12 bg-secondary/20 rounded-lg gap-4">
                {deathSaves.map((status, i) => (
                    <DeathSave key={i} status={status} onToggle={() => handleDeathSaveToggle(i)} />
                ))}
            </div>
          </div>
          
          {/* Col 2: Stats & Skills */}
          <div className="col-span-12 md:col-span-3">
            <div className="grid grid-cols-2 gap-2">
                <StatInput label="STR" value="" onChange={() => {}} />
                <StatInput label="DEX" value="" onChange={() => {}} />
                <StatInput label="CON" value="" onChange={() => {}} />
                <StatInput label="INT" value="" onChange={() => {}} />
                <StatInput label="WIS" value="" onChange={() => {}} />
                <StatInput label="CHA" value="" onChange={() => {}} />
            </div>
          </div>

          {/* Col 3: Notes & Proficiencies */}
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Textarea placeholder="Character appearance, backstory, inventory, and secrets..." className="h-44 resize-none" />
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <span>Proficiencies & Skills ({proficientSkills.length})</span>
                    <ChevronDown />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                <ScrollArea className="h-64">
                {allSkills.map(skill => (
                    <DropdownMenuItem key={skill} onSelect={(e) => e.preventDefault()} onClick={() => toggleSkill(skill)}>
                    {proficientSkills.includes(skill) ? 
                        <CheckSquare className="text-primary"/> : 
                        <Square className="text-muted-foreground"/>
                    }
                    <span>{skill}</span>
                    </DropdownMenuItem>
                ))}
                </ScrollArea>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex justify-end items-center mt-2 -mb-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={onDelete}>
                <X className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="text-muted-foreground hover:text-accent">
                <ChevronUp className="size-6" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
});

PlayerCard.displayName = "PlayerCard";
