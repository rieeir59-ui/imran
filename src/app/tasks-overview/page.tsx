'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { format, parseISO, isValid } from 'date-fns';

interface Task {
    id: string;
    employeeName: string;
    projectName: string;
    taskDescription: string;
    startDate: string;
    endDate: string;
    status: 'Assigned' | 'In Progress' | 'Completed';
    designation: string;
}

const TaskTable = ({ tasks, isLoading }: { tasks: Task[], isLoading: boolean }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
                <p className="ml-2">Loading Tasks...</p>
            </div>
        );
    }

    if (tasks.length === 0) {
        return <p className="text-muted-foreground text-center p-8">No tasks found in this category.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tasks.map((task) => (
                    <TableRow key={task.id}>
                        <TableCell>{task.employeeName}</TableCell>
                        <TableCell>{task.designation}</TableCell>
                        <TableCell>{task.projectName}</TableCell>
                        <TableCell>{task.taskDescription}</TableCell>
                        <TableCell>{task.startDate && isValid(parseISO(task.startDate)) ? format(parseISO(task.startDate), 'PPP') : 'N/A'}</TableCell>
                        <TableCell>{task.endDate && isValid(parseISO(task.endDate)) ? format(parseISO(task.endDate), 'PPP') : 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={
                                task.status === 'Completed' ? 'default' :
                                task.status === 'In Progress' ? 'secondary' :
                                'outline'
                            } className={task.status === 'Completed' ? 'bg-green-500' : ''}>
                                {task.status}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default function TasksOverviewPage() {
    const { user, firestore } = useUser();

    const tasksCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/tasks`));
    }, [user, firestore]);

    const { data: allTasks, isLoading } = useCollection<Task>(tasksCollectionRef);

    const pendingTasks = useMemo(() => allTasks?.filter(task => task.status !== 'Completed') || [], [allTasks]);
    const completedTasks = useMemo(() => allTasks?.filter(task => task.status === 'Completed') || [], [allTasks]);

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Tasks Overview</CardTitle>
                    <p className="text-muted-foreground">View all assigned tasks, categorized by their status.</p>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pending">
                        <TabsList>
                            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
                            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
                            <TabsTrigger value="all">All Tasks ({allTasks?.length || 0})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pending">
                            <TaskTable tasks={pendingTasks} isLoading={isLoading} />
                        </TabsContent>
                        <TabsContent value="completed">
                            <TaskTable tasks={completedTasks} isLoading={isLoading} />
                        </TabsContent>
                        <TabsContent value="all">
                            <TaskTable tasks={allTasks || []} isLoading={isLoading} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    );
}
