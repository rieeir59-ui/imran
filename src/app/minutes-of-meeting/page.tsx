
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MINUTES_OF_MEETING_DOC_ID = 'minutes-of-meeting';

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="font-semibold text-sm">{label}</label>
        {children}
    </div>
);

export default function MinutesOfMeetingPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ items: Array(5).fill({}).map((_, i) => ({ id: i + 1, no: '', description: '' })) });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/minutesOfMeetings/${MINUTES_OF_MEETING_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    ...data,
                    items: data.items && data.items.length > 0 ? data.items : Array(5).fill({}).map((_, i) => ({ id: i + 1, no: '', description: '' }))
                });
            } else {
                 setFormData({ items: Array(5).fill({}).map((_, i) => ({ id: i + 1, no: '', description: '' })) });
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const { name, value } = e.target;
        if (index !== undefined) {
            const newItems = [...formData.items];
            newItems[index] = { ...newItems[index], [name]: value };
            setFormData(prev => ({ ...prev, items: newItems }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Minutes of meeting saved." });
                setIsEditing(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Minutes of the Meeting", 105, 15, { align: 'center'});
        
        const headerInfo = [
            ['Project', formData.project || ''],
            ["Architect's Project No.", formData.architectProjectNo || ''],
            ['Date', formData.date || ''],
            ['Time', formData.time || ''],
            ['Meeting No.', formData.meetingNo || ''],
            ['Present', formData.present || ''],
        ];

        autoTable(doc, {
            startY: 25,
            body: headerInfo,
            theme: 'plain',
        });

        const tableBody = formData.items?.map((item: any) => [item.no || '', item.description || '']) || [];
        
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 5,
            head: [['Item No.', 'Description']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        })

        doc.save("minutes-of-meeting.pdf");
        toast({ title: 'Download Started' });
    }

    const renderField = (name: string, placeholder?: string, index?: number) => {
        const value = index !== undefined ? formData.items[index]?.[name] : formData[name];
        return isEditing ? <Input name={name} value={value || ''} onChange={(e) => handleInputChange(e, index)} placeholder={placeholder} /> : <div className="p-1 border-b min-h-[24px]">{value}</div>;
    }
    
    if (isLoading || isUserLoading) return <div className="p-4 flex justify-center items-center"><Loader2 className="animate-spin"/> Loading...</div>
    
    return (
        <main className="p-4 md:p-6 lg:p-8">
             <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Minutes of the Meeting</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                        {isEditing ? <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Project">{renderField('project')}</FormField>
                            <FormField label="Architects Project No.">{renderField('architectProjectNo')}</FormField>
                            <FormField label="Date">{renderField('date')}</FormField>
                            <FormField label="Time">{renderField('time')}</FormField>
                            <FormField label="Meeting No.">{renderField('meetingNo')}</FormField>
                            <FormField label="Present">{renderField('present')}</FormField>
                        </div>
                        <Table className="mt-4">
                            <TableHeader><TableRow><TableHead>Item No.</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {formData.items?.map((item: any, i: number) => <TableRow key={i}>
                                    <TableCell className="w-24">{renderField('no', '', i)}</TableCell>
                                    <TableCell>{renderField('description', '', i)}</TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
