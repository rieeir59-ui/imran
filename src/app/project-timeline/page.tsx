
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
import { addDays, format, parseISO, isValid, differenceInDays, subDays } from 'date-fns';
import { exportDataToPdf } from '@/lib/utils';

const DEFAULT_TIMELINE_ID = "main-project-timeline";

const initialTimelineTasks = [
    { id: 1, name: "1. Project Initiation & Site Studies", isHeader: true },
    { id: 2, name: "Client Brief", duration: "", start: "", finish: "", predecessor: "" },
    { id: 3, name: "Project Scope and Area Statements", duration: "", start: "", finish: "", predecessor: "2" },
    { id: 4, name: "Topographic / Preliminary Survey", duration: "", start: "", finish: "", predecessor: "2" },
    { id: 5, name: "Geotechnical Investigation and Report", duration: "", start: "", finish: "", predecessor: "2" },
    { id: 6, name: "2. Concept Design Stage", isHeader: true },
    { id: 7, name: "Concept Design Development", duration: "", start: "", finish: "", predecessor: "3,4,5" },
    { id: 8, name: "Concept Plans and Supporting Drawings", duration: "", start: "", finish: "", predecessor: "7" },
    { id: 9, name: "Interior Design Concept Development", duration: "", start: "", finish: "", predecessor: "7" },
    { id: 10, name: "Finalization of Concept Design Report", duration: "", start: "", finish: "", predecessor: "8,9" },
    { id: 11, name: "Client Approval on Concept Design", duration: "", start: "", finish: "", predecessor: "10" },
    { id: 12, name: "3. Preliminary Design Stage", isHeader: true },
    { id: 13, name: "Preliminary Design and Layout Plan – Cycle 1", duration: "", start: "", finish: "", predecessor: "11" },
    { id: 14, name: "Initial Engineering Coordination (Structural / MEP)", duration: "", start: "", finish: "", predecessor: "11" },
    { id: 15, name: "Layout Plan – Cycle 2 (Refined Based on Feedback)", duration: "", start: "", finish: "", predecessor: "13,14" },
    { id: 16, name: "Environmental Study (if applicable)", duration: "", start: "", finish: "", predecessor: "15" },
    { id: 17, name: "Authority Pre-Consultation / Coordination (LDA, CDA, etc.)", duration: "", start: "", finish: "", predecessor: "15" },
    { id: 18, name: "3D Model Development", duration: "", start: "", finish: "", predecessor: "15" },
    { id: 19, name: "Elevations and Sections", duration: "", start: "", finish: "", predecessor: "15" },
    { id: 20, name: "Preliminary Interior Layout", duration: "", start: "", finish: "", predecessor: "15" },
    { id: 21, name: "Preliminary Engineering Design", duration: "", start: "", finish: "", predecessor: "15" },
    { id: 22, name: "Finalization of Preliminary Design Report", duration: "", start: "", finish: "", predecessor: "16,17,18,19,20,21" },
    { id: 23, name: "Client Comments / Approval on Preliminary Design", duration: "", start: "", finish: "", predecessor: "22" },
    { id: 24, name: "4. Authority Submission Stage", isHeader: true },
    { id: 25, name: "Preparation of Submission Drawings", duration: "", start: "", finish: "", predecessor: "23" },
    { id: 26, name: "Submission to LDA / CDA / Other Relevant Authority", duration: "", start: "", finish: "", predecessor: "25" },
    { id: 27, name: "Application for Stage-1 Approval", duration: "", start: "", finish: "", predecessor: "26" },
    { id: 28, name: "Authority Approval Process (Review, Comments, Compliance)", duration: "", start: "", finish: "", predecessor: "27" },
    { id: 29, name: "Receipt of Authority Approval (Stage-1)", duration: "", start: "", finish: "", predecessor: "28" },
    { id: 30, name: "5. Detailed Design and Tender Preparation Stage", isHeader: true },
    { id: 31, name: "Detailed Architectural Design", duration: "", start: "", finish: "", predecessor: "29" },
    { id: 32, name: "Detailed Interior Layout", duration: "", start: "", finish: "", predecessor: "29" },
    { id: 33, name: "Detailed Engineering Designs (Structural / MEP)", duration: "", start: "", finish: "", predecessor: "29" },
    { id: 34, name: "Draft Conditions of Contract", duration: "", start: "", finish: "", predecessor: "29" },
    { id: 35, name: "Draft BOQs and Technical Specifications", duration: "", start: "", finish: "", predecessor: "29" },
    { id: 36, name: "Client Comments and Approvals on Detailed Design", duration: "", start: "", finish: "", predecessor: "31,32,33,34,35" },
    { id: 37, name: "Finalization of Detailed Design", duration: "", start: "", finish: "", predecessor: "36" },
    { id: 38, name: "6. Construction Design and Tender Finalization Stage", isHeader: true },
    { id: 39, name: "Construction Design and Final Tender Preparation", duration: "", start: "", finish: "", predecessor: "37" },
    { id: 40, name: "Architectural Construction Drawings", duration: "", start: "", finish: "", predecessor: "39" },
    { id: 41, name: "Engineering Construction Drawings", duration: "", start: "", finish: "", predecessor: "39" },
    { id: 42, name: "Final Tender Documents", duration: "", start: "", finish: "", predecessor: "40,41" },
    { id: 43, name: "Client Comments / Approval on Final Tender Documents", duration: "", start: "", finish: "", predecessor: "42" },
    { id: 44, name: "Tender Documents Ready for Issue", duration: "", start: "", finish: "", predecessor: "43" },
    { id: 45, name: "7. Interior Design Development Stage", isHeader: true },
    { id: 46, name: "Final Interior Design Development", duration: "", start: "", finish: "", predecessor: "37" },
    { id: 47, name: "Interior Layout Working Details", duration: "", start: "", finish: "", predecessor: "46" },
    { id: 48, name: "Interior Thematic Mood Board and Color Scheme", duration: "", start: "", finish: "", predecessor: "46" },
    { id: 49, name: "Ceiling Detail Design Drawings", duration: "", start: "", finish: "", predecessor: "46" },
    { id: 50, name: "Built-in Feature Details", duration: "", start: "", finish: "", predecessor: "46" },
    { id: 51, name: "Partition and Pattern Detail Drawings", duration: "", start: "", finish: "", predecessor: "46" },
    { id: 52, name: "Draft Interior Design Tender", duration: "", start: "", finish: "", predecessor: "47,48,49,50,51" },
    { id: 53, name: "Client Comments / Approval on Interior Design Development", duration: "", start: "", finish: "", predecessor: "52" },
    { id: 54, name: "Client Comments / Approval on Interior Design Tender", duration: "", start: "", finish: "", predecessor: "53" },
    { id: 55, name: "Finalization of Interior Design Tender", duration: "", start: "", finish: "", predecessor: "54" },
    { id: 56, name: "8. Procurement & Appointment Stage", isHeader: true },
    { id: 57, name: "Procurement of Main Contractor", duration: "", start: "", finish: "", predecessor: "44" },
    { id: 58, name: "Contract Award / Mobilization", duration: "", start: "", finish: "", predecessor: "57" },
    { id: 59, name: "Supervision by IH&SA and ______________________________", duration: "", start: "", finish: "", predecessor: "58" },
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
                    if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
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
    
        // Convert dates from pickers (Date objects) to string format
        if (field === 'start' && value instanceof Date) {
            task.start = format(value, 'yyyy-MM-dd');
        }
        if (field === 'finish' && value instanceof Date) {
            task.finish = format(value, 'yyyy-MM-dd');
        }

        const startDate = task.start ? parseISO(task.start) : null;
        const finishDate = task.finish ? parseISO(task.finish) : null;
        const duration = task.duration ? parseInt(task.duration, 10) : null;

        // Case 1: Start date and duration are available -> calculate finish date
        if (field === 'start' || field === 'duration') {
            if (startDate && isValid(startDate) && duration !== null && !isNaN(duration) && duration > 0) {
                task.finish = format(addDays(startDate, duration - 1), 'yyyy-MM-dd');
            }
        }
        
        // Case 2: Start date and finish date are available -> calculate duration
        if (field === 'start' || field === 'finish') {
             if (startDate && isValid(startDate) && finishDate && isValid(finishDate) && finishDate >= startDate) {
                const newDuration = differenceInDays(finishDate, startDate) + 1;
                task.duration = String(newDuration);
            }
        }

        // Case 3: Finish date and duration are available -> calculate start date
        if (field === 'finish' || field === 'duration') {
            if (finishDate && isValid(finishDate) && duration !== null && !isNaN(duration) && duration > 0) {
                task.start = format(subDays(finishDate, duration - 1), 'yyyy-MM-dd');
            }
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

    const handleDownloadPdf = () => {
        const tasksToExport = timelineTasks.filter(task => !(task as any).isHeader);
        exportDataToPdf('Project Timeline', tasksToExport, 'project-timeline');
    }

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
        return isEditing ? <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8" /> : value;
    }
    
    const renderDateCell = (value: string | undefined, onChange: (val: Date | undefined) => void) => {
        const date = value && isValid(new Date(value)) ? new Date(value) : undefined;
        return isEditing ? (
            <DatePicker date={date} onDateChange={onChange} disabled={!isEditing} />
        ) : (
            date ? format(date, 'PP') : (value || '')
        )
    }

    return (
        <main className="p-4 md:p-6 lg:p-8">
             <div className="flex items-center justify-between gap-4 mb-4 no-print">
                <Button variant="outline" asChild>
                    <Link href="/"><ArrowLeft /> Back to Dashboard</Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Button onClick={handleDownloadPdf} variant="outline"><Download /> Download PDF</Button>
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
                                <TableRow key={task.id} className={(task as any).isHeader ? 'bg-muted font-bold' : ''}>
                                    <TableCell>{(task as any).isHeader ? '' : task.id}</TableCell>
                                    <TableCell colSpan={(task as any).isHeader ? 5 : 1}>
                                        {renderCell(task.name, (val) => handleTaskChange(index, 'name', val))}
                                    </TableCell>
                                    {!(task as any).isHeader && (
                                        <>
                                            <TableCell>{renderCell(task.duration || '', (val) => handleTaskChange(index, 'duration', val))}</TableCell>
                                            <TableCell>{renderDateCell(task.start, (val) => handleTaskChange(index, 'start', val))}</TableCell>
                                            <TableCell>{renderDateCell(task.finish || '', (val) => handleTaskChange(index, 'finish', val))}</TableCell>
                                            <TableCell>{renderCell(task.predecessor || '', (val) => handleTaskChange(index, 'predecessor', val))}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}

