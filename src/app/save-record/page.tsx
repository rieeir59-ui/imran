
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GanttChart, HardHat, ListChecks, CalendarDays, Folder, File as FileIcon, Search, Briefcase, CheckCircle, XCircle, CircleDotDashed, PlusCircle, Trash2, Check, Image, LayoutList } from 'lucide-react';
import Link from 'next/link';
import { useUser, useStorage, useFirestore, useMemoFirebase } from '@/firebase';
import { ref, listAll, getMetadata, deleteObject } from 'firebase/storage';
import { collection, getDocs, doc, deleteDoc, getDoc, onSnapshot } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const savedRecords = [
    { title: 'Project Checklist', description: 'Review and manage your project setup checklist.', href: '/project-checklist', icon: ListChecks, docPath: 'projectChecklists/project-checklist' },
    { title: 'Project Information', description: 'Access and edit general project information.', href: '/projects', icon: HardHat, docPath: 'projectInformation/main-project-information' },
    { title: 'Project Data', description: 'View and update detailed project data entries.', href: '/project-data', icon: FileText, docPath: 'projectData/main-project-data' },
    { title: 'Predesign Assessment', description: 'Manage your predesign general assessments.', href: '/predesign-assessment', icon: FileText, docPath: 'predesignAssessments/main-predesign-assessment' },
    { title: 'Site Visit Form', description: 'Review and edit site visit reports.', href: '/site-visit', icon: FileText, docPath: 'siteVisits/site-visit-proforma' },
    { title: 'Project Timeline', description: 'General project timeline and scheduling.', href: '/project-timeline', icon: GanttChart, docPath: 'projectTimelines/main-project-timeline' },
    { title: 'Bank Forms', description: 'Access all bank-related project forms.', href: '/bank', icon: FileText },
    { title: 'Commercial Projects Timeline', description: 'Track the progress of all commercial projects.', href: '/commercial-timeline', icon: GanttChart, docPath: 'projectTimelines/commercial-timeline' },
    { title: 'Residential Projects Timeline', description: 'Track the progress of all residential projects.', href: '/residential-timeline', icon: GanttChart, docPath: 'projectTimelines/residential-timeline' },
    { title: 'Architectural Drawings', description: 'Manage architectural drawing schedules.', href: '/architectural-drawings', icon: Image, docPath: 'drawingSchedules/architectural-drawing-schedule' },
    { title: 'Sample List of Drawings', description: 'Manage sample drawing lists.', href: '/sample-list-of-drawings', icon: LayoutList, docPath: 'drawingSchedules/sample-list-of-drawings' },
    { title: 'Structural Drawings', description: 'Manage structural drawing schedules.', href: '/structural-drawings', icon: HardHat, docPath: 'drawingSchedules/structural-drawing-schedule' },
    { title: 'Plumbing Drawings', description: 'Manage plumbing drawing schedules.', href: '/plumbing-drawings', icon: FileText, docPath: 'drawingSchedules/plumbing-drawing-schedule' },
    { title: 'Electrification Drawings', description: 'Manage electrification drawing schedules.', href: '/electrification-drawings', icon: FileText, docPath: 'drawingSchedules/electrification-drawing-schedule' },
    { title: 'Lighting Drawings', description: 'Manage lighting drawing schedules.', href: '/lighting-drawings', icon: FileText, docPath: 'drawingSchedules/lighting-drawing-schedule' },
    { title: 'File Manager', description: 'Upload and manage all your project files.', href: '/file-manager', icon: Folder },
];

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  fullPath: string;
}

interface Schedule {
    id: string;
    schedules: any[];
    employeeName: string;
}

export default function SaveRecordPage() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [recordStatus, setRecordStatus] = useState<Record<string, boolean>>({});
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    
    const { user } = useUser();
    const storage = useStorage();
    const firestore = useFirestore();
    const { toast } = useToast();

    const filesRef = useMemoFirebase(() => {
        if (!user || !storage) return null;
        return ref(storage, `users/${user.uid}/uploads`);
    }, [user, storage]);

    const schedulesCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/weeklySchedules`);
    }, [user, firestore]);

     useEffect(() => {
        if (!user || !firestore) {
            setIsLoadingStatus(false);
            return;
        }

        const checkStatuses = async () => {
            setIsLoadingStatus(true);
            const statusMap: Record<string, boolean> = {};
            const checks = savedRecords.map(async (record) => {
                if (record.docPath) {
                    const docRef = doc(firestore, `users/${user.uid}/${record.docPath}`);
                    const docSnap = await getDoc(docRef);
                    statusMap[record.href] = docSnap.exists();
                }
            });
            await Promise.all(checks);
            setRecordStatus(statusMap);
            setIsLoadingStatus(false);
        };

        checkStatuses();
    }, [user, firestore]);


    useEffect(() => {
        if (!filesRef) {
            setIsLoadingFiles(false);
            return;
        }

        const fetchFiles = async () => {
            setIsLoadingFiles(true);
            try {
                const res = await listAll(filesRef);
                const filePromises = res.items.map(async (itemRef) => {
                    const metadata = await getMetadata(itemRef);
                    return {
                        name: metadata.name,
                        size: metadata.size,
                        type: metadata.contentType || 'unknown',
                        fullPath: itemRef.fullPath,
                    };
                });
                const files = await Promise.all(filePromises);
                setUploadedFiles(files);
            } catch (error) {
                console.error("Error fetching files for saved records:", error);
            } finally {
                setIsLoadingFiles(false);
            }
        };

        fetchFiles();
    }, [filesRef]);
    
    useEffect(() => {
        if (!schedulesCollectionRef) {
            setIsLoadingSchedules(false);
            return;
        };

        const unsubscribe = onSnapshot(schedulesCollectionRef, (querySnapshot) => {
            const schedulesData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const employeeName = data.schedules?.[0]?.employeeName || data.employeeName || 'Unnamed Schedule';
                return {
                    id: doc.id,
                    schedules: data.schedules || [],
                    employeeName: employeeName,
                }
            });
            setSchedules(schedulesData);
            setIsLoadingSchedules(false);
        }, () => {
            setIsLoadingSchedules(false);
        });

        return () => unsubscribe();
    }, [schedulesCollectionRef]);
    
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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

    const handleDeleteFile = async (file: UploadedFile) => {
        if (!user || !storage) {
             toast({ variant: 'destructive', title: 'Error', description: 'Authentication error.'});
            return;
        }
        const fileRef = ref(storage, file.fullPath);
        try {
            await deleteObject(fileRef);
            setUploadedFiles(prev => prev.filter(f => f.fullPath !== file.fullPath));
            toast({ title: 'File Deleted', description: `${file.name} has been removed.` });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete the file.' });
        }
    }

    const filteredRecords = savedRecords.filter(record => 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredSchedules = schedules.filter(schedule => 
        schedule.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFiles = uploadedFiles.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="p-4 md:p-6 lg:p-8 space-y-8">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search records and files..."
                    className="w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Saved Forms & Records</CardTitle>
                    <p className="text-muted-foreground">Access all your saved forms, reports, and records from here.</p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                            <Link href={record.href} key={record.title} className="relative block hover:bg-accent transition-colors p-4 rounded-lg border">
                                <div className="flex items-start gap-4">
                                    <record.icon className="h-8 w-8 text-primary mt-1" />
                                    <div>
                                        <h3 className="text-lg font-bold">{record.title}</h3>
                                        <p className="text-sm text-muted-foreground">{record.description}</p>
                                    </div>
                                </div>
                                {record.docPath && (
                                    <Badge variant={recordStatus[record.href] ? "default" : "secondary"} className={cn("absolute top-2 right-2", recordStatus[record.href] && "bg-green-500")}>
                                        {isLoadingStatus ? <Loader2 className="h-3 w-3 animate-spin"/> : recordStatus[record.href] ? 'Completed' : 'Not Started'}
                                    </Badge>
                                )}
                            </Link>
                        ))
                    ) : (
                        !isLoadingSchedules && filteredSchedules.length === 0 && (
                             <p className="text-muted-foreground col-span-full">No matching forms or records found.</p>
                        )
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Employee Work Schedules</CardTitle>
                    <p className="text-muted-foreground">Manage and view individual employee work schedules.</p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {isLoadingSchedules ? (
                        <div className="p-4 rounded-lg border animate-pulse bg-muted h-32"></div>
                    ) : filteredSchedules.length > 0 ? (
                        filteredSchedules.map(schedule => {
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
                        })
                    ) : (
                         <p className="text-muted-foreground col-span-full">No schedules found.</p>
                    )}
                     <Link href="/weekly-schedule" passHref>
                        <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center p-4 border-dashed hover:bg-accent hover:border-solid">
                            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-muted-foreground">Add Employee Schedule</span>
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                    <p className="text-muted-foreground">Files uploaded via the <Link href="/file-manager" className="text-primary underline">File Manager</Link>.</p>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Size</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingFiles ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            <Loader2 className="mx-auto animate-spin" />
                                            <p>Loading files...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredFiles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No matching files found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFiles.map((file) => (
                                        <TableRow key={file.fullPath}>
                                            <TableCell><FileIcon className="h-5 w-5 text-muted-foreground" /></TableCell>
                                            <TableCell className="font-medium">
                                                <Link href="/file-manager" className="hover:underline text-primary">
                                                    {file.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{file.type}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{formatFileSize(file.size)}</TableCell>
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete the file "{file.name}". This action cannot be undone.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteFile(file)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
