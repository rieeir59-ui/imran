
"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DataProvider } from '@/lib/data-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header';
import { FirebaseClientProvider } from '@/firebase';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
  
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <DataProvider>
            <SidebarProvider>
              <AppSidebar />
              <div className="flex-1">
                <SidebarInset>
                  <AppHeader />
                  {children}
                </SidebarInset>
              </div>
            </SidebarProvider>
          </DataProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
