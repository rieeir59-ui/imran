
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckCircle, XCircle, CircleDotDashed, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import { Suspense } from "react";


interface Schedule {
    id: string;
    schedules: any[];
    employeeName: string;
}

function SchedulesList() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
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
        };

        setIsLoading(true);
        getDocs(schedulesCollectionRef)
            .then((querySnapshot) => {
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
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [schedulesCollectionRef]);

    if (isLoading) {
        return (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               <div className="p-4 rounded-lg border animate-pulse bg-muted h-32"></div>
               <div className="p-4 rounded-lg border animate-pulse bg-muted h-32"></div>
             </div>
        )
    }

    return (
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
             <Link href="/weekly-schedule" passHref>
                <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center p-4 border-dashed hover:bg-accent hover:border-solid">
                    <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-muted-foreground">Add Employee Schedule</span>
                </Button>
            </Link>
        </div>
    );
}

export default function SaveRecordPage() {
    return (
        <main className="p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Employee Work Schedules</CardTitle>
                </CardHeader>
                <CardContent>
                   <Suspense fallback={<div className="p-4 rounded-lg border animate-pulse bg-muted h-32"></div>}>
                        <SchedulesList />
                   </Suspense>
                </CardContent>
            </Card>
        </main>
    )
}
