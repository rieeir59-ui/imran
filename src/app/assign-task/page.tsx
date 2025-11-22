
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const employeeList = [
    "M Waqas", "M Jabbar", "Rana Mujahid",
    "Architect Sobia", "Architect Luqman Aslam", "Architect Asad", "Architect Haseeb", "Architect Khizar",
    "M Mohsin", "M Nouman"
];

export default function AssignTaskPage() {
    const [employeeName, setEmployeeName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const tasksCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/tasks`);
    }, [user, firestore]);
    
    const handleAssignTask = async () => {
        if (!tasksCollectionRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot assign task. User not authenticated.' });
            return;
        }
        if (!employeeName || !taskDescription || !dueDate) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
            return;
        }

        setIsSaving(true);
        const taskData = {
            employeeName,
            taskDescription,
            dueDate: dueDate.toISOString().split('T')[0], // format as YYYY-MM-DD
            status: 'Assigned',
            assignedBy: user?.uid,
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(tasksCollectionRef, taskData);
            toast({ title: 'Task Assigned!', description: `Task has been assigned to ${employeeName}.` });
            // Reset form
            setEmployeeName('');
            setTaskDescription('');
            setDueDate(undefined);
        } catch (serverError) {
             const permissionError = new FirestorePermissionError({
                path: tasksCollectionRef.path,
                operation: 'create',
                requestResourceData: taskData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                 <div className="mb-4">
                    <Button variant="outline" asChild>
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Assign a New Task</CardTitle>
                        <CardDescription>Select an employee and provide the task details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employee-name">Employee</Label>
                            <Select onValueChange={setEmployeeName} value={employeeName}>
                                <SelectTrigger id="employee-name">
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employeeList.map(name => (
                                        <SelectItem key={name} value={name}>{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task-description">Task Description</Label>
                            <Textarea
                                id="task-description"
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="Enter a detailed description of the task..."
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="due-date">Due Date</Label>
                            <DatePicker date={dueDate} onDateChange={setDueDate} />
                        </div>
                        <Button onClick={handleAssignTask} disabled={isSaving} className="w-full">
                            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Assign Task
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

    