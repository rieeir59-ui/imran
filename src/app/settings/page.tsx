'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cog } from 'lucide-react';

export default function SettingsPage() {
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
              Customize the look and feel of your application. These controls will be enabled in a future update.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                <Input id="primary-color" placeholder="e.g., 238 52% 37%" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="background-color">Background Color</Label>
               <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: 'hsl(var(--background))' }} />
                <Input id="background-color" placeholder="e.g., 220 17% 95%" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
               <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: 'hsl(var(--accent))' }} />
                <Input id="accent-color" placeholder="e.g., 197 71% 73%" disabled />
              </div>
            </div>
            <Button disabled>Save Theme</Button>
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
