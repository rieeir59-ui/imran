
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GanttChart, HardHat, ListChecks, CalendarDays, Folder, File as FileIcon } from 'lucide-react';
import Link from 'next/link';
import { useUser, useStorage, useMemoFirebase } from '@/firebase';
import { ref, listAll, getMetadata } from 'firebase/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

const savedRecords = [
    {
        title: 'Project Checklist',
        description: 'Review and manage your project setup checklist.',
        href: '/project-checklist',
        icon: ListChecks
    },
    {
        title: 'Project Information',
        description: 'Access and edit general project information.',
        href: '/projects',
        icon: HardHat
    },
    {
        title: 'Project Data',
        description: 'View and update detailed project data entries.',
        href: '/project-data',
        icon: FileText
    },
    {
        title: 'Predesign Assessment',
        description: 'Manage your predesign general assessments.',
        href: '/predesign-assessment',
        icon: FileText
    },
    {
        title: 'Site Visit Form',
        description: 'Review and edit site visit reports.',
        href: '/site-visit',
        icon: FileText
    },
    {
        title: 'Project Timeline',
        description: 'General project timeline and scheduling.',
        href: '/project-timeline',
        icon: GanttChart
    },
    {
        title: 'Weekly Work Schedules',
        description: 'Manage and review all employee weekly schedules.',
        href: '/weekly-schedule',
        icon: CalendarDays
    },
    {
        title: 'Commercial Projects Timeline',
        description: 'Track the progress of all commercial projects.',
        href: '/commercial-timeline',
        icon: GanttChart
    },
    {
        title: 'Residential Projects Timeline',
        description: 'Track the progress of all residential projects.',
        href: '/residential-timeline',
        icon: GanttChart
    },
    {
        title: 'Bank Timelines',
        description: 'Access timelines for all bank-related projects.',
        href: '/bank',
        icon: GanttChart
    },
];

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  fullPath: string;
}

export default function SaveRecordPage() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const { user } = useUser();
    const storage = useStorage();

    const filesRef = useMemoFirebase(() => {
        if (!user || !storage) return null;
        return ref(storage, `users/${user.uid}/uploads`);
    }, [user, storage]);

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
    
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <main className="p-4 md:p-6 lg:p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Saved Forms & Records</CardTitle>
                    <p className="text-muted-foreground">Access all your saved forms, reports, and records from here.</p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {savedRecords.map((record) => (
                        <Link href={record.href} key={record.title} className="block hover:bg-accent transition-colors p-4 rounded-lg border">
                            <div className="flex items-start gap-4">
                                <record.icon className="h-8 w-8 text-primary mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold">{record.title}</h3>
                                    <p className="text-sm text-muted-foreground">{record.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingFiles ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            <Loader2 className="mx-auto animate-spin" />
                                            <p>Loading files...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : uploadedFiles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No files uploaded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    uploadedFiles.map((file) => (
                                        <TableRow key={file.fullPath}>
                                            <TableCell><FileIcon className="h-5 w-5 text-muted-foreground" /></TableCell>
                                            <TableCell className="font-medium">
                                                <Link href="/file-manager" className="hover:underline text-primary">
                                                    {file.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{file.type}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{formatFileSize(file.size)}</TableCell>
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
