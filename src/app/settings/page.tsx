
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function hslStringToHex(hsl: string): string {
  const parts = hsl.trim().match(/(\d+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!parts) return '#000000';

  let h = parseInt(parts[1], 10);
  let s = parseInt(parts[2], 10) / 100;
  let l = parseInt(parts[3], 10) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHslString(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;
  let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}


export default function SettingsPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

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
              Customize the look and feel of your application by picking new colors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="primary-color-picker"
                  type="color"
                  value={hslStringToHex(primaryColor)}
                  onChange={(e) => setPrimaryColor(hexToHslString(e.target.value))}
                  className="w-12 h-10 p-1"
                />
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
               <div className="flex items-center gap-4">
                <Input 
                  id="background-color-picker"
                  type="color"
                  value={hslStringToHex(backgroundColor)}
                  onChange={(e) => setBackgroundColor(hexToHslString(e.target.value))}
                  className="w-12 h-10 p-1"
                />
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
               <div className="flex items-center gap-4">
                 <Input 
                  id="accent-color-picker"
                  type="color"
                  value={hslStringToHex(accentColor)}
                  onChange={(e) => setAccentColor(hexToHslString(e.target.value))}
                  className="w-12 h-10 p-1"
                />
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
