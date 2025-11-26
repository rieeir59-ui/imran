'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CONTINUATION_SHEET_DOC_ID = 'continuation-sheet';

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
        <label className="font-semibold">{label}:</label>
        {children}
    </div>
);

export default function ContinuationSheetPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ rows: [] });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/continuationSheets/${CONTINUATION_SHEET_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({ ...data, rows: data.rows && data.rows.length > 0 ? data.rows : [{ id: 1, itemNo: '', description: '', scheduledValue: '', workCompletedPrev: '', workCompletedThis: '', materialsStored: '', totalCompleted: '', percentage: '', balance: '', retainage: '' }] });
            } else {
                setFormData({ rows: [{ id: 1, itemNo: '', description: '', scheduledValue: '', workCompletedPrev: '', workCompletedThis: '', materialsStored: '', totalCompleted: '', percentage: '', balance: '', retainage: '' }] });
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRowChange = (index: number, name: string, value: string) => {
        const newRows = [...formData.rows];
        newRows[index][name] = value;
        setFormData(prev => ({...prev, rows: newRows}));
    };
    
    const addRow = () => {
        const newId = formData.rows.length > 0 ? Math.max(...formData.rows.map((r: any) => r.id)) + 1 : 1;
        setFormData(prev => ({ ...prev, rows: [...prev.rows, { id: newId, itemNo: '', description: '', scheduledValue: '', workCompletedPrev: '', workCompletedThis: '', materialsStored: '', totalCompleted: '', percentage: '', balance: '', retainage: '' }] }));
    };

    const removeRow = (id: number) => {
        setFormData(prev => ({...prev, rows: prev.rows.filter((row: any) => row.id !== id)}));
    }

    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Continuation Sheet saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Continuation Sheet", 14, 15);
        
        let y = 25;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Application Number: ${formData.applicationNumber || ''}`, 14, y);
        doc.text(`Application Date: ${formData.applicationDate || ''}`, 150, y);
        y+=7;
        doc.text(`Period To: ${formData.periodTo || ''}`, 14, y);
        doc.text(`Architect's Project No: ${formData.architectsProjectNo || ''}`, 150, y);
        y+=10;

        autoTable(doc, {
            startY: y,
            head: [['Item No.', 'Description of Work', 'Scheduled Value', 'Work Completed Prev', 'Work Completed This', 'Materials Stored', 'Total Completed', '%', 'Balance', 'Retainage']],
            body: formData.rows.map((row: any) => [row.itemNo, row.description, row.scheduledValue, row.workCompletedPrev, row.workCompletedThis, row.materialsStored, row.totalCompleted, row.percentage, row.balance, row.retainage]),
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1 },
            headStyles: { fillColor: [30, 41, 59] }
        });

        doc.save("continuation-sheet.pdf");
    };
    
    const renderCell = (rowIndex: number, fieldName: string) => {
      if (isEditing) {
        return <Input value={formData.rows[rowIndex][fieldName] || ''} onChange={(e) => handleRowChange(rowIndex, fieldName, e.target.value)} className="h-8" />;
      }
      return formData.rows[rowIndex][fieldName];
    }
    
    const renderHeaderField = (name: string, label: string) => {
        return (
            <FormField label={label}>
                {isEditing ? <Input name={name} value={formData[name] || ''} onChange={handleHeaderChange} /> : <span className="p-1 min-h-[24px]">{formData[name]}</span>}
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
                    <CardTitle>Continuation Sheet</CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={handleDownloadPdf} variant="outline"><Download /> PDF</Button>
                        {isEditing ? (
                            <>
                            <Button onClick={addRow} variant="outline"><PlusCircle/> Add Row</Button>
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
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {renderHeaderField('applicationNumber', 'Application Number')}
                        {renderHeaderField('applicationDate', 'Application Date')}
                        {renderHeaderField('periodTo', 'Period To')}
                        {renderHeaderField('architectsProjectNo', "Architect's Project No")}
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[80px]">Item No.</TableHead>
                                    <TableHead className="min-w-[200px]">Description of Work</TableHead>
                                    <TableHead className="min-w-[120px]">Scheduled Value</TableHead>
                                    <TableHead className="min-w-[120px]">Work Completed Prev</TableHead>
                                    <TableHead className="min-w-[120px]">Work Completed This</TableHead>
                                    <TableHead className="min-w-[120px]">Materials Stored</TableHead>
                                    <TableHead className="min-w-[120px]">Total Completed</TableHead>
                                    <TableHead className="min-w-[60px]">%</TableHead>
                                    <TableHead className="min-w-[120px]">Balance</TableHead>
                                    <TableHead className="min-w-[120px]">Retainage</TableHead>
                                    {isEditing && <TableHead></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.rows?.map((row: any, index: number) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{renderCell(index, 'itemNo')}</TableCell>
                                        <TableCell>{renderCell(index, 'description')}</TableCell>
                                        <TableCell>{renderCell(index, 'scheduledValue')}</TableCell>
                                        <TableCell>{renderCell(index, 'workCompletedPrev')}</TableCell>
                                        <TableCell>{renderCell(index, 'workCompletedThis')}</TableCell>
                                        <TableCell>{renderCell(index, 'materialsStored')}</TableCell>
                                        <TableCell>{renderCell(index, 'totalCompleted')}</TableCell>
                                        <TableCell>{renderCell(index, 'percentage')}</TableCell>
                                        <TableCell>{renderCell(index, 'balance')}</TableCell>
                                        <TableCell>{renderCell(index, 'retainage')}</TableCell>
                                        {isEditing && <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>}
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
