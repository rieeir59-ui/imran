'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SHOP_DRAWING_RECORD_DOC_ID = 'shop-drawing-record';

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col space-y-1">
        <span className="font-semibold text-sm">{label}:</span>
        {children}
    </div>
);

export default function ShopDrawingsRecordPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ records: Array(12).fill({}).map((_, i) => ({ id: i + 1 })) });
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/shopDrawingRecords/${SHOP_DRAWING_RECORD_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const { name, value } = e.target;
        if(index !== undefined) {
            const newRecords = [...formData.records];
            newRecords[index] = {...newRecords[index], [name]: value};
            setFormData(prev => ({...prev, records: newRecords}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };

     const handleCheckboxChange = (index: number, name: string, checked: boolean | 'indeterminate') => {
        if (!isEditing || typeof checked !== 'boolean') return;
        const newRecords = [...formData.records];
        newRecords[index] = {...newRecords[index], [name]: checked};
        setFormData(prev => ({...prev, records: newRecords}));
    };

    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Shop Drawings Record saved.' });
            setIsEditing(false);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("SHOP DRAWINGS & SAMPLE RECORD", 105, 15, { align: 'center'});
        
        autoTable(doc, {
            startY: 25,
            html: '#shop-drawings-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] },
        })

        doc.save("shop-drawings-record.pdf");
        toast({ title: "Download Started", description: "PDF generation is in progress." });
    };

    const renderField = (name: string, index?: number) => {
        const value = index !== undefined ? formData.records[index]?.[name] : formData[name];
        return isEditing ? <Input name={name} value={value || ''} onChange={(e) => handleInputChange(e, index)} /> : <div className="border-b min-h-[24px] py-1">{value || ''}</div>
    }

    if (isLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
    <main className="p-4 md:p-6 lg:p-8">
        <div className="mb-4">
            <Button variant="outline" asChild>
                <Link href="/drawings"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Drawings</Link>
            </Button>
        </div>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-center font-bold text-2xl">
                    SHOP DRAWINGS & SAMPLE RECORD
                </CardTitle>
                 <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                    {isEditing ? (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4" id="shop-drawings-table">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                        <FormField label="Project:">{renderField('project')}</FormField>
                        <FormField label="Architect's Project No:">{renderField('architectProjectNo')}</FormField>
                        <FormField label="Contractor:">{renderField('contractor')}</FormField>
                        <FormField label="Date:">{renderField('date')}</FormField>
                    </div>
                    <div className="border-t border-b py-2 my-2">
                        <FormField label="Spec. Section No.:">{renderField('specSectionNo')}</FormField>
                        <FormField label="Shop Drawing or Sample Drawing No.:">{renderField('drawingNo')}</FormField>
                    </div>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-2 mb-4">
                        <FormField label="Contractor:">{renderField('contractor2')}</FormField>
                        <FormField label="Subcontractor:">{renderField('subcontractor')}</FormField>
                        <FormField label="Trade:">{renderField('trade')}</FormField>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Record Date</TableHead>
                                <TableHead>Referred To</TableHead>
                                <TableHead>Date Sent</TableHead>
                                <TableHead># Copies</TableHead>
                                <TableHead>Date Ret'd.</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Copies To</TableHead>
                                <TableHead>Title</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.records.map((record: any, i: number) => (
                                <TableRow key={record.id}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>{renderField('recordDate', i)}</TableCell>
                                    <TableCell>{renderField('referredTo', i)}</TableCell>
                                    <TableCell>{renderField('dateSent', i)}</TableCell>
                                    <TableCell>{renderField('numCopies', i)}</TableCell>
                                    <TableCell>{renderField('dateRetd', i)}</TableCell>
                                    <TableCell className="space-y-1 text-xs">
                                        <div className="flex items-center gap-1"><Checkbox id={`a${i}`} checked={record.approved} onCheckedChange={(c) => handleCheckboxChange(i, 'approved', c)} disabled={!isEditing}/> Approved</div>
                                        <div className="flex items-center gap-1"><Checkbox id={`an${i}`} checked={record.approvedAsNoted} onCheckedChange={(c) => handleCheckboxChange(i, 'approvedAsNoted', c)} disabled={!isEditing}/> App'd as Noted</div>
                                        <div className="flex items-center gap-1"><Checkbox id={`rr${i}`} checked={record.reviseResubmit} onCheckedChange={(c) => handleCheckboxChange(i, 'reviseResubmit', c)} disabled={!isEditing}/> Revise & Resubmit</div>
                                        <div className="flex items-center gap-1"><Checkbox id={`na${i}`} checked={record.notApproved} onCheckedChange={(c) => handleCheckboxChange(i, 'notApproved', c)} disabled={!isEditing}/> Not Approved</div>
                                    </TableCell>
                                    <TableCell className="space-y-1 text-xs">
                                        <div className="flex items-center gap-1"><Checkbox id={`co${i}`} checked={record.copyContractor} onCheckedChange={(c) => handleCheckboxChange(i, 'copyContractor', c)} disabled={!isEditing}/> Contractor</div>
                                        <div className="flex items-center gap-1"><Checkbox id={`ow${i}`} checked={record.copyOwner} onCheckedChange={(c) => handleCheckboxChange(i, 'copyOwner', c)} disabled={!isEditing}/> Owner</div>
                                        <div className="flex items-center gap-1"><Checkbox id={`fi${i}`} checked={record.copyField} onCheckedChange={(c) => handleCheckboxChange(i, 'copyField', c)} disabled={!isEditing}/> Field</div>
                                        <div className="flex items-center gap-1"><Checkbox id={`f${i}`} checked={record.copyFile} onCheckedChange={(c) => handleCheckboxChange(i, 'copyFile', c)} disabled={!isEditing}/> File</div>
                                    </TableCell>
                                    <TableCell>{renderField('title', i)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </main>
    )
};
