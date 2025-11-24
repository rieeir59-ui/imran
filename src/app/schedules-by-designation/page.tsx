
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default function SchedulesByDesignationPage() {
  
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Schedules by Designation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is ready for new content.</p>
        </CardContent>
      </Card>
    </main>
  );
}
