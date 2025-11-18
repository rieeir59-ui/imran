"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckCircle, XCircle, CircleDotDashed } from "lucide-react";
import Link from 'next/link';
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const SCHEDULE_DOC_ID = "weekly-work-schedule";

export default function EmployeeWorkSchedule() {
    const [scheduleData, setScheduleData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();
    const firestore = useFirestore();

    const scheduleDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/weeklySchedules/${SCHEDULE_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!scheduleDocRef) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        getDoc(scheduleDocRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.schedules) {
                        setScheduleData(data.schedules);
                    }
                }
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [scheduleDocRef]);

    const mujahidProjects = scheduleData.filter(s => s.employeeName?.toLowerCase() === 'mujahid');
    const projectCount = mujahidProjects.length;
    const completedCount = mujahidProjects.filter(p => p.status === 'Completed').length;
    const inProgressCount = mujahidProjects.filter(p => p.status === 'In Progress').length;
    const incompleteCount = mujahidProjects.filter(p => p.status === 'Incomplete').length;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Employee Work Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <Link href="/weekly-schedule" className="block hover:bg-accent transition-colors p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">MUJAHID</h3>
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
            </CardContent>
        </Card>
    );
}
