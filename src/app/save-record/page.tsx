
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export default function SaveRecordPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Save className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold">Save Record</h1>
          <p className="text-muted-foreground">This page is under construction.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Save New Record</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where you will be able to save new records. This feature is coming soon!</p>
        </CardContent>
      </Card>
    </main>
  );
}
