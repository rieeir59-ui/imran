'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CONSTRUCTION_SCHEDULE_DOC_ID = 'construction-activity-schedule';

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col space-y-1">
        <label className="font-semibold text-sm">{label}</label>
        {children}
    </div>
);

export default function ConstructionActivitySchedulePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ tasks: [] });

    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const scheduleDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/constructionSchedules/${CONSTRUCTION_SCHEDULE_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!scheduleDocRef) return;
        setIsLoading(true);
        getDoc(scheduleDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({ ...data, tasks: data.tasks || [{ id: 1, code: '', task: '', duration: '', planStart: '', planFinish: '', actualStart: '', actualFinish: '', progress: '', variance: '', remarks: '' }] });
            } else {
                 setFormData({ tasks: [{ id: 1, code: '', task: '', duration: '', planStart: '', planFinish: '', actualStart: '', actualFinish: '', progress: '', variance: '', remarks: '' }] });
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: scheduleDocRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [scheduleDocRef, toast]);
    
    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTaskChange = (index: number, name: string, value: string) => {
        const newTasks = [...formData.tasks];
        newTasks[index] = { ...newTasks[index], [name]: value };
        setFormData(prev => ({...prev, tasks: newTasks}));
    };
    
    const addTask = () => {
        const newId = formData.tasks.length > 0 ? Math.max(...formData.tasks.map((t: any) => t.id)) + 1 : 1;
        setFormData(prev => ({ ...prev, tasks: [...prev.tasks, { id: newId, code: '', task: '', duration: '', planStart: '', planFinish: '', actualStart: '', actualFinish: '', progress: '', variance: '', remarks: '' }] }));
    };

    const removeTask = (id: number) => {
        setFormData(prev => ({...prev, tasks: prev.tasks.filter((task: any) => task.id !== id)}));
    }

    const handleSave = () => {
        if (!scheduleDocRef) return;
        setIsSaving(true);
        setDoc(scheduleDocRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Construction schedule saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: scheduleDocRef.path,
                operation: 'write',
                requestResourceData: formData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Construction Time Line", 14, 15);
        let y = 25;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Client: ${formData.client || ''}`, 14, y);
        doc.text(`Project: ${formData.project || ''}`, 80, y);
        doc.text(`Covered Area: ${formData.coveredArea || ''}`, 150, y);
        doc.text(`Location: ${formData.location || ''}`, 220, y);
        y+=7;
        doc.text(`Title: ${formData.title || ''}`, 14, y);
        doc.text(`Type: ${formData.type || ''}`, 80, y);
        doc.text(`Project Number: ${formData.projectNumber || ''}`, 150, y);
        doc.text(`Date: ${formData.date || ''}`, 220, y);
        y+=10;
        
        autoTable(doc, {
            startY: y,
            head: [['Sr.No/Code', 'Task', 'Duration', 'Plan Start', 'Plan Finish', 'Actual Start', 'Actual Finish', 'Progress', 'Variance Plan', 'Variance Actual', 'Remarks']],
            body: formData.tasks.map((task: any) => [task.code, task.task, task.duration, task.planStart, task.planFinish, task.actualStart, task.actualFinish, task.progress, task.variancePlan, task.varianceActual, task.remarks]),
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [30, 41, 59] }
        });

        doc.save("construction-activity-schedule.pdf");
    };
    
    const renderCell = (rowIndex: number, fieldName: string) => {
      if (isEditing) {
        return <Input value={formData.tasks?.[rowIndex]?.[fieldName] || ''} onChange={(e) => handleTaskChange(rowIndex, fieldName, e.target.value)} className="h-8" />;
      }
      return formData.tasks?.[rowIndex]?.[fieldName];
    }
    
    const renderHeaderField = (name: string, label: string) => {
       return (
            <FormField label={label}>
                {isEditing ? <Input name={name} value={formData[name] || ''} onChange={handleHeaderChange} /> : <div className="p-1 border-b min-h-[36px]">{formData[name]}</div>}
            </FormField>
       )
    }

    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Construction Activity Schedule</CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                        {isEditing ? (
                            <>
                            <Button onClick={addTask} variant="outline"><PlusCircle/> Add Task</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                            </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-lg font-bold text-center">Construction Time Line</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                        {renderHeaderField('client', 'Client')}
                        {renderHeaderField('title', 'Title')}
                        {renderHeaderField('project', 'Project')}
                        {renderHeaderField('type', 'Type')}
                        {renderHeaderField('coveredArea', 'Covered Area')}
                        {renderHeaderField('location', 'Location')}
                        {renderHeaderField('projectNumber', 'Project Number')}
                        {renderHeaderField('date', 'Date')}
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sr.No/Code</TableHead>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Plan Start</TableHead>
                                    <TableHead>Plan Finish</TableHead>
                                    <TableHead>Actual Start</TableHead>
                                    <TableHead>Actual Finish</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Variance Plan</TableHead>
                                    <TableHead>Variance Actual</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    {isEditing && <TableHead></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.tasks?.map((task: any, index: number) => (
                                    <TableRow key={task.id}>
                                        <TableCell>{renderCell(index, 'code')}</TableCell>
                                        <TableCell>{renderCell(index, 'task')}</TableCell>
                                        <TableCell>{renderCell(index, 'duration')}</TableCell>
                                        <TableCell>{renderCell(index, 'planStart')}</TableCell>
                                        <TableCell>{renderCell(index, 'planFinish')}</TableCell>
                                        <TableCell>{renderCell(index, 'actualStart')}</TableCell>
                                        <TableCell>{renderCell(index, 'actualFinish')}</TableCell>
                                        <TableCell>{renderCell(index, 'progress')}</TableCell>
                                        <TableCell>{renderCell(index, 'variancePlan')}</TableCell>
                                        <TableCell>{renderCell(index, 'varianceActual')}</TableCell>
                                        <TableCell>{renderCell(index, 'remarks')}</TableCell>
                                        {isEditing && <TableCell><Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
