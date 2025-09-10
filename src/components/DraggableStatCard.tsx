
'use client';

import { useDraggable } from '@dnd-kit/core';
import { StatCard } from './StatCard';
import type { MonsterDetails } from '@/types/monster';
import { Grab } from 'lucide-react';

export function DraggableStatCard({ monster }: { monster: MonsterDetails }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: `draggable-${monster.index}`,
    data: {
        monster,
    }
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100, // Ensure it renders above other elements while dragging
  } : undefined;

  return (
    <div className="relative group">
        <StatCard 
            ref={setNodeRef} 
            style={style}
            monster={monster}
        />
        <div 
            className="absolute top-4 right-4 p-2 bg-secondary/50 rounded-full cursor-grab group-hover:bg-secondary transition-colors"
            {...listeners}
            {...attributes}
        >
            <Grab className="text-muted-foreground" />
        </div>
    </div>
  );
}
