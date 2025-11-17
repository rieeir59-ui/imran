'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const extractHsl = (style: CSSStyleDeclaration, property: string) => {
  const value = style.getPropertyValue(property).trim();
  const hslMatch = value.match(/hsl\(([\d.]+)\s([\d.]+%)\s([\d.]+%)\)/);
  if (hslMatch) {
    return `${hslMatch[1]} ${hslMatch[2]} ${hslMatch[3]}`;
  }
  // Fallback for direct HSL values without `hsl()` wrapper
  const directMatch = value.match(/([\d.]+)\s([\d.]+%)\s([\d.]+%)/);
  if(directMatch) {
    return value;
  }
  return '';
};


export default function SettingsPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // Safely get initial values only on the client
  const getInitialColor = (variable: string) => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      const value = style.getPropertyValue(variable).trim();
      const hslMatch = value.match(/([\d.]+)[, ]\s*([\d.]+%)[, ]\s*([\d.]+%)/);
      if (hslMatch) {
        return `${hslMatch[1]} ${hslMatch[2]} ${hslMatch[3]}`;
      }
    }
    return '';
  };
  
  const [primaryColor, setPrimaryColor] = useState(() => getInitialColor('--primary'));
  const [backgroundColor, setBackgroundColor] = useState(() => getInitialColor('--background'));
  const [accentColor, setAccentColor] = useState(() => getInitialColor('--accent'));
  
  React.useEffect(() => {
    // This effect runs once on the client, ensuring server/client mismatch is avoided.
    setIsClient(true);
    setPrimaryColor(getInitialColor('--primary'));
    setBackgroundColor(getInitialColor('--background'));
    setAccentColor(getInitialColor('--accent'));
  }, []);

  const handleSaveTheme = () => {
    document.documentElement.style.setProperty('--primary', `hsl(${primaryColor})`);
    document.documentElement.style.setProperty('--background', `hsl(${backgroundColor})`);
    document.documentElement.style.setProperty('--accent', `hsl(${accentColor})`);
    
    toast({
      title: "Theme Updated!",
      description: "Your new theme colors have been applied.",
    });
  };

  if (!isClient) {
    // Render a skeleton or loading state until the client has mounted
    // This prevents hydration errors
    return null;
  }


  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
            <Cog className="h-8 w-8 text-muted-foreground" />
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your application settings here.</p>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>
              Customize the look and feel of your application. Enter HSL values (e.g., "238 52% 37%").
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: `hsl(${primaryColor})` }} />
                <Input 
                  id="primary-color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="e.g., 238 52% 37%" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="background-color">Background Color</Label>
               <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: `hsl(${backgroundColor})` }} />
                <Input 
                  id="background-color" 
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="e.g., 220 17% 95%" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
               <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: `hsl(${accentColor})` }} />
                <Input 
                  id="accent-color" 
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="e.g., 197 71% 73%" 
                />
              </div>
            </div>
            <Button onClick={handleSaveTheme}>Save Theme</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Settings</CardTitle>
            <CardDescription>
              This section is under construction. Soon you will be able to manage project-specific configurations here.
            </CardDescription>
          </CardHeader>
        </Card>

      </div>
    </main>
  );
}
