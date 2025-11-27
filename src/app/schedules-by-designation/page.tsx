
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, CheckCircle, CircleDotDashed, Loader2, XCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Schedule {
    id: string;
    schedules: any[];
    employeeName: string;
}

interface Employee {
    id: string;
    name: string;
    designation: string;
}

interface DisplayItem {
    id: string; // Can be schedule ID or employee ID
    name: string;
    projectCount: number;
    completedCount: number;
    inProgressCount: number;
    incompleteCount: number;
    hasSchedule: boolean;
}

function SchedulesByDesignation() {
  const searchParams = useSearchParams();
  const designation = searchParams.get('name') || '';

  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore || !designation) {
        setIsLoading(false);
        return;
    }

    const employeesQuery = query(collection(firestore, `users/${user.uid}/employees`), where("designation", "==", designation));
    const schedulesQuery = query(collection(firestore, `users/${user.uid}/weeklySchedules`), where("designation", "==", designation));

    const unsubEmployees = onSnapshot(employeesQuery, (employeesSnapshot) => {
        const employeesData = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        
        const unsubSchedules = onSnapshot(schedulesQuery, (schedulesSnapshot) => {
            const schedulesData = schedulesSnapshot.docs.map(doc => {
                const data = doc.data();
                const employeeName = data.schedules?.[0]?.employeeName || data.employeeName || 'Unnamed';
                return {
                    id: doc.id,
                    schedules: data.schedules || [],
                    employeeName: employeeName,
                }
            });

            const mergedItems: Record<string, DisplayItem> = {};

            employeesData.forEach(emp => {
                mergedItems[emp.name] = {
                    id: emp.id,
                    name: emp.name,
                    projectCount: 0,
                    completedCount: 0,
                    inProgressCount: 0,
                    incompleteCount: 0,
                    hasSchedule: false
                };
            });
            
            schedulesData.forEach(schedule => {
                const projectCount = schedule.schedules.length;
                const completedCount = schedule.schedules.filter(p => p.status === 'Completed').length;
                const inProgressCount = schedule.schedules.filter(p => p.status === 'In Progress').length;
                const incompleteCount = schedule.schedules.filter(p => p.status === 'Incomplete').length;

                mergedItems[schedule.employeeName] = {
                    id: schedule.id,
                    name: schedule.employeeName,
                    projectCount,
                    completedCount,
                    inProgressCount,
                    incompleteCount,
                    hasSchedule: true
                };
            });

            setDisplayItems(Object.values(mergedItems));
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching schedules: ", error);
            setIsLoading(false);
        });

        return () => unsubSchedules();
    }, (error) => {
        console.error("Error fetching employees: ", error);
        setIsLoading(false);
    });

    return () => unsubEmployees();
  }, [user, firestore, designation]);


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
          <p className="text-muted-foreground">Showing all employees and schedules for the {designation} department.</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
                <p className="ml-2">Loading schedules...</p>
            </div>
          ) : displayItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayItems.map(item => {
                const href = item.hasSchedule 
                  ? `/weekly-schedule?id=${item.id}` 
                  : `/weekly-schedule?employee=${encodeURIComponent(item.name)}&designation=${encodeURIComponent(designation)}`;

                return (
                    <Link href={href} key={item.id} className="block hover:bg-accent transition-colors p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">{item.name.toUpperCase()}</h3>
                            {item.hasSchedule && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="h-5 w-5" />
                                    <span>{item.projectCount} Projects</span>
                                </div>
                            )}
                        </div>
                        {item.hasSchedule ? (
                            <div className="flex justify-start gap-6 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>{item.completedCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CircleDotDashed className="h-5 w-5 text-blue-500" />
                                    <span>{item.inProgressCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <span>{item.incompleteCount}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 text-sm text-muted-foreground flex items-center">
                                <PlusCircle className="h-4 w-4 mr-2"/>
                                No schedule created yet. Click to create one.
                            </div>
                        )}
                    </Link>
                )
            })}
             <Link href={`/add-employee?designation=${encodeURIComponent(designation)}`} passHref>
                <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center p-4 border-dashed hover:bg-accent hover:border-solid">
                    <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-muted-foreground">Add {designation}</span>
                </Button>
            </Link>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
                <p>No employees found for the "{designation}" designation.</p>
                <Button asChild className="mt-4">
                    <Link href={`/add-employee?designation=${encodeURIComponent(designation)}`}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add an Employee
                    </Link>
                </Button>
            </div>
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
