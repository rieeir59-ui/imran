'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Building, Briefcase } from 'lucide-react';
import { useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Project {
  projectName: string;
  client: string;
  team: string[];
}

// Function to extract client name from timeline ID
const getClientFromTimelineId = (timelineId: string): string => {
    const parts = timelineId.split('-').slice(0, -1);
    if (parts.includes('bank')) {
        return parts.filter(p => p !== 'bank').map(p => p.toUpperCase()).join(' ');
    }
    if (parts.includes('commercial') || parts.includes('residential')) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return parts.map(p => p.toUpperCase()).join(' ');
};


export default function ProjectsOverviewPage() {
    const { user, firestore } = useUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const timelinesCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/projectTimelines`));
    }, [user, firestore]);
    
    const tasksCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/tasks`));
    }, [user, firestore]);

    const { data: timelines, isLoading: isLoadingTimelines } = useCollection(timelinesCollectionRef);
    const { data: tasks, isLoading: isLoadingTasks } = useCollection(tasksCollectionRef);

    useEffect(() => {
        if (!isLoadingTimelines && !isLoadingTasks) {
            const projectMap: Record<string, Project> = {};

            // Process timelines to get project names and clients
            if (timelines) {
                timelines.forEach((timeline: any) => {
                    const client = getClientFromTimelineId(timeline.id);
                    if (timeline.projectData && Array.isArray(timeline.projectData)) {
                        timeline.projectData.forEach((proj: any) => {
                            if (proj.projectName && !projectMap[proj.projectName]) {
                                projectMap[proj.projectName] = {
                                    projectName: proj.projectName,
                                    client: client,
                                    team: [],
                                };
                            }
                        });
                    }
                });
            }

            // Process tasks to assign team members to projects
            if (tasks) {
                tasks.forEach((task: any) => {
                    if (task.projectName && projectMap[task.projectName] && task.employeeName) {
                        if (!projectMap[task.projectName].team.includes(task.employeeName)) {
                            projectMap[task.projectName].team.push(task.employeeName);
                        }
                    } else if (task.projectName && !projectMap[task.projectName] && task.employeeName) {
                         projectMap[task.projectName] = {
                            projectName: task.projectName,
                            client: 'Internal / Unspecified',
                            team: [task.employeeName],
                        };
                    }
                });
            }

            setProjects(Object.values(projectMap));
            setIsLoading(false);
        }
    }, [timelines, tasks, isLoadingTimelines, isLoadingTasks]);

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-6 w-6" />
                        Projects Overview
                    </CardTitle>
                    <p className="text-muted-foreground">A high-level view of all projects, clients, and assigned teams.</p>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="animate-spin text-primary h-12 w-12" />
                            <p className="ml-4 text-lg">Aggregating project data...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/5">Project Name</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Team Members</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.projectName}>
                                        <TableCell className="font-medium">{project.projectName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span>{project.client}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                {project.team.length > 0 ? (
                                                     <TooltipProvider>
                                                        <div className="flex -space-x-2">
                                                            {project.team.map((memberName, index) => (
                                                                <Tooltip key={`${project.projectName}-${memberName}`}>
                                                                    <TooltipTrigger asChild>
                                                                         <Avatar className="h-8 w-8 border-2 border-background">
                                                                            <AvatarImage src={`https://picsum.photos/seed/${memberName}/100`} alt={memberName} />
                                                                            <AvatarFallback>{memberName.charAt(0).toUpperCase()}</AvatarFallback>
                                                                        </Avatar>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{memberName}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ))}
                                                        </div>
                                                     </TooltipProvider>
                                                ) : (
                                                    <span className="text-muted-foreground italic">No team members assigned</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}