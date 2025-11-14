
'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, Loader2, Download, ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from '@/components/ui/date-picker';
import { addDays, format, parseISO } from 'date-fns';

const DEFAULT_TIMELINE_ID = "main-project-timeline";

const initialTimelineTasks = [
    { id: 1, name: "Project Name:", duration: "", start: "", finish: "", predecessor: "" },
    { id: 2, name: "Conceptual Design", duration: "", start: "", finish: "", predecessor: "" },
    { id: 3, name: "Client Brief", duration: "", start: "", finish: "", predecessor: "2" },
    { id: 4, name: "Topographic Survey", duration: "", start: "", finish: "", predecessor: "2" },
    { id: 5, name: "Project Scope and Area Statements", duration: "", start: "", finish: "", predecessor: "3,4" },
    { id: 6, name: "Conceptual Plans and Supporting Drawings", duration: "", start: "", finish: "", predecessor: "5" },
    { id: 7, name: "Concept Engineering", duration: "", start: "", finish: "", predecessor: "5" },
    { id: 8, name: "Geotechnical Investigation and Report", duration: "", start: "", finish: "", predecessor: "5" },
    { id: 9, name: "Conceptual Interior Brief", duration: "", start: "", finish: "", predecessor: "5" },
    { id: 10, name: "Finalize Concept Design / Report", duration: "", start: "", finish: "", predecessor: "6,7,8,9" },
    { id: 11, name: "Client Comments / Approval on Concept Design", duration: "", start: "", finish: "", predecessor: "10" },
    { id: 12, name: "Preliminary Design", duration: "", start: "", finish: "", predecessor: "11" },
    { id: 13, name: "Layout Plans-Cycle 1", duration: "", start: "", finish: "", predecessor: "12" },
    { id: 14, name: "Initial Engineering", duration: "", start: "", finish: "", predecessor: "12" },
    { id: 15, name: "Preliminary Design Workshop", duration: "", start: "", finish: "", predecessor: "13,14" },
    { id: 16, name: "Layout Plans-Cycle 2", duration: "", start: "", finish: "", predecessor: "15" },
    { id: 17, name: "Environmental Study and Authority Approval", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 18, name: "3-D Model", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 19, name: "External Elevation", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 20, name: "Building Section", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 21, name: "Preliminary Interior Layouts", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 22, name: "Preliminary Engineering Design", duration: "", start: "", finish: "", predecessor: "16" },
    { id: 23, name: "Finalize Preliminary Design / Report", duration: "", start: "", finish: "", predecessor: "17,18,19,20,21,22" },
    { id: 24, name: "Client Comments / Approval on Preliminary Design", duration: "", start: "", finish: "", predecessor: "23" },
    { id: 25, name: "Submission to LDA / CDA or Other Authority", duration: "", start: "", finish: "", predecessor: "24" },
    { id: 26, name: "Prepare Submission Drawings", duration: "", start: "", finish: "", predecessor: "25" },
    { id: 27, name: "Submit Application for Stage I Approval", duration: "", start: "", finish: "", predecessor: "26" },
    { id: 28, name: "LDA/CDA/Other Authority Approval Process", duration: "", start: "", finish: "", predecessor: "27" },
    { id: 29, name: "LDA/CDA/Other Authority Stage I Approval", duration: "", start: "", finish: "", predecessor: "28" },
    { id: 30, name: "Detailed Design and Draft Tender", duration: "", start: "", finish: "", predecessor: "29" },
    { id: 31, name: "Detailed Architectural Design", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 32, name: "Detailed Interior Layouts", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 33, name: "Detailed Engineering Design", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 34, name: "Draft Conditions of Contract", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 35, name: "Draft BOQ and Specifications", duration: "", start: "", finish: "", predecessor: "30" },
    { id: 36, name: "Client Comments / Approval Final Design", duration: "", start: "", finish: "", predecessor: "31,32,33,34,35" },
    { id: 37, name: "Construction Drawings and Final Tender", duration: "", start: "", finish: "", predecessor: "36" },
    { id: 38, name: "Architectural Construction Drawings", duration: "", start: "", finish: "", predecessor: "37" },
    { id: 39, name: "Engineering Construction Drawings", duration: "", start: "", finish: "", predecessor: "37" },
    { id: 40, name: "Final Tender Documents", duration: "", start: "", finish: "", predecessor: "38,39" },
    { id: 41, name: "Client Comments / Approval on Final Tender Documents", duration: "", start: "", finish: "", predecessor: "40" },
    { id: 42, name: "Incorporate Comments in Tender Documents", duration: "", start: "", finish: "", predecessor: "41" },
    { id: 43, name: "Tender Documents Ready", duration: "", start: "", finish: "", predecessor: "42" },
    { id: 44, name: "Final Interior Design", duration: "", start: "", finish: "", predecessor: "36" },
    { id: 45, name: "Interior Layouts working details", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 46, name: "Interior Thematic Mood Board + Color Scheme", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 47, name: "Ceiling Details Design Drawings", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 48, name: "Built-in Feature Details", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 49, name: "Partition Pattern Details Drawings", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 50, name: "Draft Interior design Tender", duration: "", start: "", finish: "", predecessor: "45,46,47,48,49" },
    { id: 51, name: "Client Comments / Approval of Interior Design Tender", duration: "", start: "", finish: "", predecessor: "50" },
    { id: 52, name: "Incorporate Comments in Interior Design Tender", duration: "", start: "", finish: "", predecessor: "51" },
    { id: 53, name: "Interior Design Tender Complete", duration: "", start: "", finish: "", predecessor: "52" },
    { id: 54, name: "Procurement of Main Contractor", duration: "", start: "", finish: "", predecessor: "43" },
    { id: 55, name: "Construction Period ____ Months - Top Supervision by IH&SA and ____________________", duration: "", start: "", finish: "", predecessor: "54" },
];

const FormField = ({ label, value, isEditing, onChange, name }: { label: string, value?: string, isEditing?: boolean, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, name?: string }) => (
    <div>
        <span className="font-semibold">{label}</span>
        {isEditing ? 
            <Input name={name} value={value} onChange={onChange} className="inline-block w-auto" /> : 
            <span>{value || '___________________________'}</span>
        }
    </div>
);


export default function ProjectTimelinePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timelineTasks, setTimelineTasks] = useState(initialTimelineTasks);
    const [headerData, setHeaderData] = useState({
        project: "",
        architect: "IH&SA",
        nameAddress: "",
        architectProjectNo: "",
        projectDate: ""
    });

    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    
    useEffect(() => {
        if (!isUserLoading && !user && auth) {
            initiateAnonymousSignIn(auth);
        }
    }, [isUserLoading, user, auth]);

    const timelineDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectTimelines/${DEFAULT_TIMELINE_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!timelineDocRef) return;

        setIsLoading(true);
        getDoc(timelineDocRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setHeaderData({
                        project: data.project || "",
                        architect: data.architect || "IH&SA",
                        nameAddress: data.nameAddress || "",
                        architectProjectNo: data.architectProjectNo || "",
                        projectDate: data.projectDate || ""
                    });
                    if (data.tasks && Array.isArray(data.tasks) && data.tasks.length === initialTimelineTasks.length) {
                       setTimelineTasks(data.tasks);
                    } else {
                       setTimelineTasks(initialTimelineTasks);
                    }
                } else {
                    // Set default if no doc exists
                    setHeaderData({
                        project: "",
                        architect: "IH&SA",
                        nameAddress: "",
                        architectProjectNo: "",
                        projectDate: ""
                    });
                    setTimelineTasks(initialTimelineTasks);
                }
            })
            .catch(async (serverError) => {
                console.error("Error fetching timeline data:", serverError);
                 const permissionError = new FirestorePermissionError({
                  path: timelineDocRef.path,
                  operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [timelineDocRef]);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHeaderData(prev => ({...prev, [name]: value}));
    };

    const handleTaskChange = (index: number, field: string, value: any) => {
        const updatedTasks = [...timelineTasks];
        const task = updatedTasks[index] as any;
        task[field] = value;

        if (field === 'duration' || field === 'start') {
            const startDate = task.start ? (typeof task.start === 'string' ? parseISO(task.start) : task.start) : null;
            const duration = task.duration ? parseInt(task.duration, 10) : 0;

            if (startDate && !isNaN(duration) && duration > 0) {
                const finishDate = addDays(startDate, duration);
                task.finish = format(finishDate, 'yyyy-MM-dd');
            }
        }
        
        if (field === 'start' && value instanceof Date) {
            task.start = format(value, 'yyyy-MM-dd');
        }

        setTimelineTasks(updatedTasks);
    };

    const handleSave = () => {
        if (!timelineDocRef) {
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "User not authenticated.",
            });
            return;
        }

        setIsSaving(true);
        const dataToSave = { ...headerData, tasks: timelineTasks };
        setDocumentNonBlocking(timelineDocRef, dataToSave, { merge: true });

        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast({
                title: "Timeline Saved",
                description: "Your project timeline has been saved.",
            });
        }, 500);
    };

    if (isUserLoading || isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading Timeline...</p>
            </div>
        );
    }
    
     if (!user && !isUserLoading) {
        return (
          <main className="p-4 md:p-6 lg:p-8">
           <Card>
             <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
             <CardContent>
               <Alert variant="destructive">
                 <Terminal className="h-4 w-4" />
                 <AlertTitle>Unable to Authenticate</AlertTitle>
                 <AlertDescription>We could not sign you in. Please refresh the page to try again.</AlertDescription>
               </Alert>
             </CardContent>
           </Card>
         </main>
       )
    }

    const renderCell = (value: string, onChange: (val: string) => void) => {
        return isEditing ? <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8" /> : value;
    }
    
    const renderDateCell = (value: string | undefined, onChange: (val: Date | undefined) => void) => {
        const date = value ? new Date(value) : undefined;
        return isEditing ? (
            <DatePicker date={date} onDateChange={onChange} disabled={!isEditing} />
        ) : (
            value ? format(new Date(value), 'PP') : ''
        )
    }

    return (
        <main className="p-4 md:p-6 lg:p-8">
             <div className="flex items-center justify-between gap-4 mb-4 no-print">
                <Button variant="outline" asChild>
                    <Link href="/"><ArrowLeft /> Back to Dashboard</Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Button onClick={() => window.print()} variant="outline"><Download /> Download</Button>
                    {isEditing ? (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                    )}
                </div>
            </div>
            <Card className="printable-card">
                <CardHeader>
                    <CardTitle className="text-center">TIME LINE SCHEDULE</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField label="Project: " name="project" value={headerData.project} isEditing={isEditing} onChange={handleHeaderChange} />
                        <FormField label="Architect: " name="architect" value={headerData.architect} isEditing={isEditing} onChange={handleHeaderChange} />
                        <FormField label="(Name, Address): " name="nameAddress" value={headerData.nameAddress} isEditing={isEditing} onChange={handleHeaderChange} />
                        <FormField label="Architects Project No: " name="architectProjectNo" value={headerData.architectProjectNo} isEditing={isEditing} onChange={handleHeaderChange} />
                        <FormField label="Project Date: " name="projectDate" value={headerData.projectDate} isEditing={isEditing} onChange={handleHeaderChange} />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Task Name</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Start</TableHead>
                                <TableHead>Finish</TableHead>
                                <TableHead>Predecessor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {timelineTasks.map((task, index) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.id}</TableCell>
                                    <TableCell>{renderCell(task.name, (val) => handleTaskChange(index, 'name', val))}</TableCell>
                                    <TableCell>{renderCell(task.duration, (val) => handleTaskChange(index, 'duration', val))}</TableCell>
                                    <TableCell>{renderDateCell(task.start, (val) => handleTaskChange(index, 'start', val))}</TableCell>
                                    <TableCell>{renderCell(task.finish, (val) => handleTaskChange(index, 'finish', val))}</TableCell>
                                    <TableCell>{renderCell(task.predecessor, (val) => handleTaskChange(index, 'predecessor', val))}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
