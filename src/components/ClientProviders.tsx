
'use client';

import React, { type ReactNode, useEffect } from 'react';
import { FirebaseClientProvider } from '@/firebase';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { TooltipProvider } from '@/components/ui/tooltip';


// This new component will handle the side effect of loading the theme.
const ThemeLoader = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme) {
      try {
        const { primary, background, accent } = JSON.parse(savedTheme);
        const root = document.documentElement;
        if (primary) root.style.setProperty('--primary', `hsl(${primary})`);
        if (background) root.style.setProperty('--background', `hsl(${background})`);
        if (accent) root.style.setProperty('--accent', `hsl(${accent})`);
      } catch (error) {
        console.error("Failed to parse or apply theme from localStorage", error);
      }
    }
  }, []);

  return null; // This component doesn't render anything visible.
}


export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <ThemeLoader />
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex-1">
            <SidebarInset>
              <AppHeader />
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </FirebaseClientProvider>
  );
}

