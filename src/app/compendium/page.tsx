
'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import { StatCard } from '@/components/StatCard';
import type { Monster, MonsterDetails } from '@/types/monster';
import { useCampaign } from '@/hooks/use-campaign';
import { useToast } from '@/hooks/use-toast';
import { DndContext, useDroppable, type DragEndEvent } from '@dnd-kit/core';
import { DraggableStatCard } from '@/components/DraggableStatCard';
import { cn } from '@/lib/utils';


const fetchMonsterDetails = async (url: string): Promise<MonsterDetails | null> => {
    try {
        const response = await fetch(`https://www.dnd5eapi.co${url}`);
        if (!response.ok) {
            console.warn(`Failed to fetch details for ${url}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching monster details:`, error);
        return null;
    }
}

function BestiaryDropZone({ children, className }: { children: React.ReactNode, className?: string }) {
    const {isOver, setNodeRef} = useDroppable({
        id: 'bestiary-dropzone',
    });
    
    return (
        <div ref={setNodeRef} className={cn(
            className, 
            'transition-all duration-300 relative rounded-lg border',
            isOver ? 'bg-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'bg-card/20'
        )}>
            {children}
            {isOver && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-2xl font-headline text-primary-foreground drop-shadow-lg">Drop to add to Bestiary</p>
                </div>
            )}
        </div>
    )
}

function CompendiumPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { toast } = useToast();
  
  const [search, setSearch] = useState(initialSearch);
  const [allMonsters, setAllMonsters] = useState<Monster[]>([]);
  const [filteredMonsters, setFilteredMonsters] = useState<Monster[]>([]);
  const [selectedMonsterDetails, setSelectedMonsterDetails] = useState<MonsterDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  
  const { campaigns, setCampaigns, currentCampaign } = useCampaign();
  const bestiary = campaigns[currentCampaign]?.creatures || [];
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchMonsters() {
      try {
        const response = await fetch('https://www.dnd5eapi.co/api/monsters');
        const data = await response.json();
        setAllMonsters(data.results);
        
        if (initialSearch) {
          const initialMonster = data.results.find((m: Monster) => m.name.toLowerCase() === initialSearch.toLowerCase());
          if (initialMonster) {
            handleMonsterClick(initialMonster);
          }
        }

      } catch (error) {
        console.error("Failed to fetch monsters list:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMonsters();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearch]);

  useEffect(() => {
    const lowercasedSearch = search.toLowerCase();
    if (!lowercasedSearch) {
      setFilteredMonsters([]);
      return;
    }
    const filtered = allMonsters.filter(
      (m) => m.name.toLowerCase().includes(lowercasedSearch)
    );
    setFilteredMonsters(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, allMonsters]);
  
  const handleMonsterClick = async (monster: Monster | MonsterDetails) => {
    setSearch(monster.name);
    setFilteredMonsters([]);
    setIsDetailsLoading(true);
    setSelectedMonsterDetails(null);
    
    // Check if we already have details (from bestiary)
    if ('challenge_rating' in monster) {
        setSelectedMonsterDetails(monster);
        setIsDetailsLoading(false);
        return;
    }
    
    // Otherwise fetch from API
    const details = await fetchMonsterDetails(monster.url);
    if(details) {
        setSelectedMonsterDetails(details);
    }
    setIsDetailsLoading(false);
  }

  const handleAddToBestiary = (monster: MonsterDetails) => {
    setCampaigns(prev => {
      const currentCampaignData = prev[currentCampaign];
      if (!currentCampaignData) return prev;

      if (currentCampaignData.creatures.some(c => c.index === monster.index)) {
        toast({
            title: `${monster.name} is already in the bestiary.`,
            variant: 'default'
        });
        return prev;
      }

      const updatedCampaign = {
        ...currentCampaignData,
        creatures: [...currentCampaignData.creatures, monster]
      };
      toast({
          title: 'Creature Added',
          description: `${monster.name} has been added to the ${currentCampaign} bestiary.`
      });
      return {
        ...prev,
        [currentCampaign]: updatedCampaign
      };
    });
  }

  const handleRemoveFromBestiary = (monsterIndex: string) => {
    setCampaigns(prev => {
      const currentCampaignData = prev[currentCampaign];
      if (!currentCampaignData) return prev;

      const updatedCampaign = {
          ...currentCampaignData,
          creatures: currentCampaignData.creatures.filter(c => c.index !== monsterIndex)
      };

      toast({
          title: 'Creature Removed',
          description: `The creature has been removed from the ${currentCampaign} bestiary.`
      });

      return {
          ...prev,
          [currentCampaign]: updatedCampaign
      }
    });
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over && over.id === 'bestiary-dropzone' && active.data.current) {
        const monster = active.data.current.monster as MonsterDetails;
        handleAddToBestiary(monster);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <header>
                <GlitchText text="Creature Compendium" className="text-4xl" />
                <p className="text-muted-foreground">Log of horrors encountered and indexed.</p>
            </header>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                placeholder="Search for a monster by name..."
                className="pl-10 text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
                {search && filteredMonsters.length > 0 && (
                    <Card className="absolute top-full mt-2 w-full z-10 max-h-60 overflow-y-auto">
                        <CardContent className="p-2">
                            {filteredMonsters.map(monster => (
                                <div 
                                    key={monster.index} 
                                    className="p-2 hover:bg-secondary rounded-md cursor-pointer"
                                    onClick={() => handleMonsterClick(monster)}
                                >
                                    {monster.name}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {isDetailsLoading && (
                    <div className="text-center py-16 col-span-full">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <p className="text-2xl font-headline text-muted-foreground mt-4">Inspecting Specimen...</p>
                    </div>
                )}
            {selectedMonsterDetails && !isDetailsLoading && (
                <div className="md:col-span-2 lg:col-span-3">
                    <DraggableStatCard monster={selectedMonsterDetails} />
                </div>
            )}

            <BestiaryDropZone>
                <Card className="bg-transparent border-none">
                    <CardHeader>
                    <CardTitle className="font-headline">Campaign Bestiary: {isClient ? currentCampaign : ''}</CardTitle>
                    <CardDescription>Creatures saved to your current campaign. Drag a searched creature here to add it.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {isLoading && !initialSearch && (
                        <div className="text-center py-16 col-span-full">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                            <p className="text-2xl font-headline text-muted-foreground mt-4">Summoning Creatures...</p>
                        </div>
                    )}
                    {!isLoading && bestiary.length === 0 && (
                        <div className="text-center py-16">
                        <p className="text-xl font-headline text-muted-foreground">Your bestiary is empty.</p>
                        <p className="text-accent flicker">Search for creatures to add them.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bestiary.map(monster => (
                            <StatCard 
                                key={monster.index} 
                                monster={monster} 
                                onDelete={() => handleRemoveFromBestiary(monster.index)}
                            />
                        ))}
                    </div>
                    </CardContent>
                </Card>
            </BestiaryDropZone>
        </div>
    </DndContext>
  );
}


export default function CompendiumPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CompendiumPageContent />
    </React.Suspense>
  )
}
