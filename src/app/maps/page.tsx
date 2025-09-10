
'use client';

import { useState, useRef, type PointerEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Loader2, ZoomIn, ZoomOut, Move, X } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import { useToast } from '@/hooks/use-toast';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Map = {
    id: string;
    name: string;
    url: string;
}

export default function MapsPage() {
  const { toast } = useToast();
  const [maps, setMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      toast({ title: 'Invalid File Type', description: 'Please upload a PNG, JPG, or GIF.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const newMap: Map = {
        id: `map-${Date.now()}`,
        name: file.name,
        url: e.target?.result as string,
      }
      setMaps(prevMaps => [...prevMaps, newMap]);
      setSelectedMap(newMap);
      setIsLoading(false);
      toast({ title: 'Map Uploaded', description: 'Your new battle map is ready.' });
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast({ title: 'Error Uploading Map', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    };
    reader.readAsDataURL(file);

    if (event.target) event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
  }
  
  const handleDeleteMap = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    setMaps(prev => {
        const newMaps = prev.filter(m => m.id !== mapId);
        if (selectedMap?.id === mapId) {
            setSelectedMap(newMaps.length > 0 ? newMaps[0] : null);
        }
        return newMaps;
    });
    toast({ title: 'Map Deleted' });
  }

  return (
    <div className="h-[calc(100vh-8rem)] w-full p-0 m-0 flex flex-col">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
      />
      
      <div className="relative flex-grow h-full w-full">
        <Card className="h-full w-full border-0 rounded-none bg-transparent">
          <CardContent className="p-0 h-full">
            <TransformWrapper
              initialScale={1}
              minScale={0.2}
              limitToBounds={true}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TooltipProvider>
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => zoomIn()}><ZoomIn /></Button></TooltipTrigger><TooltipContent><p>Zoom In</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => zoomOut()}><ZoomOut /></Button></TooltipTrigger><TooltipContent><p>Zoom Out</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => resetTransform()}><Move /></Button></TooltipTrigger><TooltipContent><p>Reset View</p></TooltipContent></Tooltip>
                    </div>
                  </TooltipProvider>

                  <TransformComponent
                    wrapperStyle={{ width: '100%', height: '100%'}}
                    contentStyle={{ width: '100%', height: '100%'}}
                  >
                    <div
                      className="relative h-full w-full rounded-none flex items-center justify-center"
                    >
                      {selectedMap ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={selectedMap.url}
                          alt="Battle Map"
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      ) : (
                        <div 
                          className="text-center p-4 bg-background/80 rounded-lg cursor-pointer hover:bg-background/90 transition-colors"
                          onClick={handleUploadClick}
                        >
                          <GlitchText text="Upload a Map" className="text-3xl" />
                          <p className="text-muted-foreground mt-2">Click here to begin.</p>
                        </div>
                      )}
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </CardContent>
        </Card>
      </div>
      
       <div className="flex-shrink-0 w-full bg-card/60 backdrop-blur-sm border-t border-border/20 p-2">
            <Carousel opts={{ align: "start", dragFree: true }}>
                <CarouselContent className="-ml-2">
                     <CarouselItem className="basis-auto pl-2">
                        <Button
                            onClick={handleUploadClick}
                            disabled={isLoading}
                            variant="outline"
                            className="w-32 h-24 flex-col gap-2 text-muted-foreground hover:text-primary hover:border-primary"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Upload />}
                            Upload Map
                        </Button>
                    </CarouselItem>
                    {maps.map(map => (
                        <CarouselItem key={map.id} className="basis-auto pl-2">
                            <div 
                                className="relative w-32 h-24 rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                                onClick={() => handleMapSelect(map)}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={map.url} alt={map.name} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <p className="text-white text-xs text-center p-1 truncate">{map.name}</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-50 hover:opacity-100"
                                    onClick={(e) => handleDeleteMap(e, map.id)}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12"/>
                <CarouselNext className="mr-12" />
            </Carousel>
        </div>
    </div>
  );
}
