
"use client";

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { MaskedKillerIcon } from '../icons/MaskedKillerIcon';
import { Trash2, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNav } from './MobileNav';
import { Button } from '../ui/button';
import { useCampaign } from '@/hooks/use-campaign';

export const menuItems = [
  { href: '/', label: 'Campaign', iconUrl: 'https://i.imgur.com/11HlfFw.png' },
  { href: '/encounters', label: 'Encounters', iconUrl: 'https://i.imgur.com/zpOItvz.png' },
  { href: '/compendium', label: 'Creatures', iconUrl: 'https://i.imgur.com/I0Koy9H.png' },
  { href: '/maps', label: 'Maps', iconUrl: 'https://i.imgur.com/xIJI6Xg.png' },
  { href: '/session', label: 'Notes', iconUrl: 'https://i.imgur.com/r5w26qc.png' },
  { href: '/rules', label: 'Rules', iconUrl: 'https://i.imgur.com/KxRbUaN.png' },
];

export function TopNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { campaigns, setCampaigns, currentCampaign } = useCampaign();

  const handleClearAllData = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleClearCampaignData = () => {
    if (Object.keys(campaigns).length <= 1) {
        handleClearAllData();
        return;
    }
    setCampaigns(prev => {
        const newCampaigns = { ...prev };
        delete newCampaigns[currentCampaign];
        return newCampaigns;
    });
    // setCurrentCampaign will be handled by the effect in useCampaign
  };

  const settingsMenu = (
     <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="size-8 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
             <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Clear Campaign: {currentCampaign}</span>
                </DropdownMenuItem>
            </AlertDialogTrigger>
             <AlertDialog>
               <AlertDialogTrigger asChild>
                   <DropdownMenuItem className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                   <Trash2 className="mr-2 h-4 w-4" />
                   <span>Clear All Data</span>
                   </DropdownMenuItem>
               </AlertDialogTrigger>
               <AlertDialogContent>
                   <AlertDialogHeader>
                   <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                   <AlertDialogDescription>
                       This action is irreversible and will permanently delete ALL campaign data from this browser.
                   </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                   <AlertDialogCancel>Cancel</AlertDialogCancel>
                   <AlertDialogAction onClick={handleClearAllData} className="bg-destructive hover:bg-destructive/80">
                       Yes, delete everything
                   </AlertDialogAction>
                   </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
                This will permanently delete the "{currentCampaign}" campaign and all of its associated notes, characters, and recaps. This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCampaignData} className="bg-destructive hover:bg-destructive/80">
                Yes, delete this campaign
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );

  return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-24 md:h-32 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <MaskedKillerIcon className="text-primary size-16 md:size-24" />
          </Link>

          {isMobile ? (
            <div className="flex items-center gap-2">
                {settingsMenu}
                <MobileNav />
            </div>
          ) : (
            <nav className="flex items-center space-x-2">
                {menuItems.map((item) => (
                <Link href={item.href} key={item.href} title={item.label}>
                    <div className={cn(
                    'flex flex-col h-[7.5rem] w-[7.5rem] items-center justify-center rounded-md transition-colors hover:bg-secondary/80 p-1 group',
                    pathname === item.href ? 'bg-primary/20' : ''
                    )}>
                    <div className="w-[7rem] h-[7rem] relative">
                        <Image 
                        src={item.iconUrl} 
                        alt={item.label}
                        fill
                        className={cn(
                            'object-contain transition-transform group-hover:scale-110 p-2 [filter:drop-shadow(0_0_8px_hsl(var(--primary)))]',
                            pathname === item.href && 'invert-[.25] sepia-[.5] hue-rotate-[180deg] saturate-[5]'
                        )}
                        unoptimized
                        />
                    </div>
                    </div>
                </Link>
                ))}
                {settingsMenu}
            </nav>
          )}
        </div>
      </header>
  );
}
