
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, CheckCircle, CircleDotDashed, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Schedule {
    id: string;
    schedules: any[];
    employeeName: string;
}

function SchedulesByDesignation() {
  const searchParams = useSearchParams();
  const designation = searchParams.get('name') || '';

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useUser();
  const firestore = useFirestore();

  const schedulesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !designation) return null;
    return query(
      collection(firestore, `users/${user.uid}/weeklySchedules`),
      where("designation", "==", designation)
    );
  }, [user, firestore, designation]);

  useEffect(() => {
    if (!schedulesQuery) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(schedulesQuery, (querySnapshot) => {
        const schedulesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const employeeName = data.schedules?.[0]?.employeeName || data.employeeName || 'Unnamed';
            return {
                id: doc.id,
                schedules: data.schedules || [],
                employeeName: employeeName,
            }
        });
        setSchedules(schedulesData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching schedules by designation: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [schedulesQuery]);


  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{designation} Schedules</CardTitle>
          <p className="text-muted-foreground">Showing all work schedules for the {designation} department.</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
                <p className="ml-2">Loading schedules...</p>
            </div>
          ) : schedules.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schedules.map(schedule => {
                const projectCount = schedule.schedules.length;
                const completedCount = schedule.schedules.filter(p => p.status === 'Completed').length;
                const inProgressCount = schedule.schedules.filter(p => p.status === 'In Progress').length;
                const incompleteCount = schedule.schedules.filter(p => p.status === 'Incomplete').length;

                return (
                    <Link href={`/weekly-schedule?id=${schedule.id}`} key={schedule.id} className="block hover:bg-accent transition-colors p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">{schedule.employeeName.toUpperCase()}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="h-5 w-5" />
                                <span>{projectCount} Projects</span>
                            </div>
                        </div>
                        <div className="flex justify-start gap-6 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>{completedCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CircleDotDashed className="h-5 w-5 text-blue-500" />
                                <span>{inProgressCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span>{incompleteCount}</span>
                            </div>
                        </div>
                    </Link>
                )
            })}
            </div>
          ) : (
            <p className="text-muted-foreground">No schedules found for this designation.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function SchedulesByDesignationPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <SchedulesByDesignation />
        </Suspense>
    )
}
