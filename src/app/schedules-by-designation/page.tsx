'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, CheckCircle, XCircle, CircleDotDashed } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Schedule {
  id: string;
  schedules: any[];
  employeeName: string;
  designation: string;
}

export default function SchedulesByDesignationPage() {
  const [schedulesByDesignation, setSchedulesByDesignation] = useState<Record<string, Schedule[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();

  const schedulesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/weeklySchedules`);
  }, [user, firestore]);

  useEffect(() => {
    if (!schedulesCollectionRef) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getDocs(schedulesCollectionRef)
      .then((querySnapshot) => {
        const schedulesData: Schedule[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const employeeName = data.schedules?.[0]?.employeeName || 'Unnamed';
          return {
            id: doc.id,
            schedules: data.schedules || [],
            employeeName: employeeName,
            designation: data.designation || 'Unassigned',
          };
        });

        const groupedSchedules = schedulesData.reduce((acc, schedule) => {
          const { designation } = schedule;
          if (!acc[designation]) {
            acc[designation] = [];
          }
          acc[designation].push(schedule);
          return acc;
        }, {} as Record<string, Schedule[]>);

        setSchedulesByDesignation(groupedSchedules);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [schedulesCollectionRef]);

  if (isLoading) {
    return (
      <main className="p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Schedules by Designation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg border animate-pulse bg-muted h-32"></div>
            <div className="p-4 rounded-lg border animate-pulse bg-muted h-32"></div>
            <div className="p-4 rounded-lg border animate-pulse bg-muted h-32"></div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Schedules by Designation</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full" defaultValue={Object.keys(schedulesByDesignation)}>
            {Object.entries(schedulesByDesignation).map(([designation, schedules]) => (
              <AccordionItem value={designation} key={designation}>
                <AccordionTrigger className="text-xl font-bold">{designation}</AccordionTrigger>
                <AccordionContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
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
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </main>
  );
}