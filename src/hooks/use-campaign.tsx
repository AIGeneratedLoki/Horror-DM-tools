
'use client';
import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { CampaignData } from '@/app/page';

type CampaignContextType = {
    campaigns: Record<string, CampaignData>;
    setCampaigns: Dispatch<SetStateAction<Record<string, CampaignData>>>;
    currentCampaign: string;
    setCurrentCampaign: Dispatch<SetStateAction<string>>;
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children, initialCampaigns }: { children: ReactNode, initialCampaigns?: Record<string, CampaignData> }) => {
    const [campaigns, setCampaigns] = useState<Record<string, CampaignData>>(() => {
        if (typeof window === 'undefined') {
            return initialCampaigns || {};
        }
        try {
            const item = window.localStorage.getItem('campaigns');
            return item ? JSON.parse(item) : initialCampaigns || {};
        } catch (error) {
            console.error(error);
            return initialCampaigns || {};
        }
    });

    const [currentCampaign, setCurrentCampaign] = useState<string>(() => {
        if (typeof window === 'undefined') {
            return Object.keys(initialCampaigns || {})[0] || '';
        }
        try {
            const item = window.localStorage.getItem('currentCampaign');
            return item ? JSON.parse(item) : Object.keys(campaigns)[0] || '';
        } catch (error) {
            console.error(error);
            return Object.keys(initialCampaigns || {})[0] || '';
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('campaigns', JSON.stringify(campaigns));
        } catch (error) {
            console.error(error);
        }
    }, [campaigns]);

    useEffect(() => {
        try {
            // If the current campaign doesn't exist anymore, reset to the first one.
            if (Object.keys(campaigns).length > 0 && !campaigns[currentCampaign]) {
                setCurrentCampaign(Object.keys(campaigns)[0]);
            }
            window.localStorage.setItem('currentCampaign', JSON.stringify(currentCampaign));
        } catch (error) {
            console.error(error);
        }
    }, [currentCampaign, campaigns]);
    
    // Set initial campaign if none is set
    useEffect(() => {
        if (!currentCampaign && Object.keys(campaigns).length > 0) {
            setCurrentCampaign(Object.keys(campaigns)[0]);
        }
    }, [campaigns, currentCampaign]);

    return (
        <CampaignContext.Provider value={{ campaigns, setCampaigns, currentCampaign, setCurrentCampaign }}>
            {children}
        </CampaignContext.Provider>
    );
};

export const useCampaign = (initialCampaigns?: Record<string, CampaignData>) => {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    // If initialCampaigns are provided, it means we are in a component that might be initializing the state.
    // We only want to set the initial state if the provider hasn't already been initialized with data from localStorage.
    useEffect(() => {
      if (initialCampaigns && Object.keys(context.campaigns).length === 0) {
        context.setCampaigns(initialCampaigns);
        context.setCurrentCampaign(Object.keys(initialCampaigns)[0]);
      }
    }, [initialCampaigns, context]);


    return context;
};
