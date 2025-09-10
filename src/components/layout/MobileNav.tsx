
'use client';
import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { menuItems } from './TopNav';

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Menu className="size-8 text-muted-foreground" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Select a page to navigate to.
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col space-y-2 mt-4">
            {menuItems.map((item) => (
              <Link href={item.href} key={item.href} title={item.label} onClick={() => setOpen(false)}>
                <div className={cn(
                  'flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-secondary/80',
                  pathname === item.href ? 'bg-primary/20' : ''
                )}>
                  <div className="w-12 h-12 relative">
                    <Image 
                      src={item.iconUrl} 
                      alt={item.label}
                      fill
                      className={cn(
                        'object-contain p-1 [filter:drop-shadow(0_0_4px_hsl(var(--primary)))]',
                         pathname === item.href && 'invert-[.25] sepia-[.5] hue-rotate-[180deg] saturate-[5]'
                      )}
                      unoptimized
                    />
                  </div>
                   <span className="font-headline text-lg">{item.label}</span>
                </div>
              </Link>
            ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
