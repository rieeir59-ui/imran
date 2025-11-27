
'use client';

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckCircle, XCircle, CircleDotDashed, PlusCircle, Trash2 } from "lucide-react";
import Link from 'next/link';
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();

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

    const handleDeleteSchedule = async (scheduleId: string, employeeName: string) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Authentication error.'});
            return;
        }
        const docRef = doc(firestore, `users/${user.uid}/weeklySchedules`, scheduleId);
        try {
            await deleteDoc(docRef);
            setSchedules(prev => prev.filter(s => s.id !== scheduleId));
            toast({ title: 'Schedule Deleted', description: `${employeeName}'s schedule has been removed.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete the schedule.' });
        }
    };

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
                    <div key={schedule.id} className="relative group">
                        <Link href={`/weekly-schedule?id=${schedule.id}`} className="block hover:bg-accent transition-colors p-4 rounded-lg border h-full">
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
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the schedule for {schedule.employeeName}. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSchedule(schedule.id, schedule.employeeName)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
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

export default function EmployeeWorkSchedule() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Employee Work Schedules</CardTitle>
        </CardHeader>
        <CardContent>
            <Suspense fallback={<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><div className="p-4 rounded-lg border animate-pulse bg-muted h-32"></div></div>}>
                <SchedulesList />
            </Suspense>
        </CardContent>
    </Card>
  )
}
