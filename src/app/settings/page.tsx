'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Cog } from 'lucide-react';

export default function SettingsPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Cog className="h-8 w-8 text-muted-foreground" />
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your application settings here.</p>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>
              This page is being developed. Soon you will be able to customize your application theme and other preferences here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>What settings would you like to be able to change?</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
