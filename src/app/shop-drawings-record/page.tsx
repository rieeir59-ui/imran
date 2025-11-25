'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SHOP_DRAWING_RECORD_DOC_ID = 'shop-drawing-record';

const initialSubRecord = () => ({
    dateRecord: '',
    title: '',
    contractorSubcontractorTrade: '',
    recordNo: '',
    referredTo: '',
    dateSent: '',
    numCopies: '',
    dateRetdReferred: '',
    actionApproved: false,
    actionApprovedAsNoted: false,
    actionReviseResubmit: false,
    actionNotApproved: false,
    actionDateRetd: '',
    copiesToContractor: false,
    copiesToOwner: false,
    copiesToField: false,
    copiesToFile: false,
});

const initialRecord = () => ({
    specSectionNo: '',
    shopDrawingOrSampleNo: '',
    subRecords: Array(3).fill(null).map(() => initialSubRecord()),
});

const getInitialFormData = () => ({
    project: '',
    architectProjectNo: '',
    contractor: '',
    records: Array(12).fill(null).map(() => initialRecord()),
});


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
    const [formData, setFormData] = useState<any>(getInitialFormData());
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/shopDrawingRecords/${SHOP_DRAWING_RECORD_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) {
            setFormData(getInitialFormData());
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                 const records = data.records && data.records.length > 0 ? data.records.map((r: any) => ({
                    ...initialRecord(),
                    ...r,
                    subRecords: r.subRecords && r.subRecords.length > 0 ? r.subRecords.map((sr: any) => ({...initialSubRecord(), ...sr})) : Array(3).fill(null).map(() => initialSubRecord())
                })) : Array(12).fill(null).map(() => initialRecord());

                setFormData({ ...data, records });
            } else {
                setFormData(getInitialFormData());
            }
        }).catch(err => {
            console.error("Firebase read error:", err);
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleRecordChange = (recordIndex: number, field: string, value: string) => {
        const newRecords = [...formData.records];
        newRecords[recordIndex] = {...newRecords[recordIndex], [field]: value};
        setFormData(prev => ({...prev, records: newRecords}));
    };
    
    const handleSubRecordChange = (recordIndex: number, subIndex: number, field: string, value: any) => {
        const newRecords = [...formData.records];
        newRecords[recordIndex].subRecords[subIndex] = {...newRecords[recordIndex].subRecords[subIndex], [field]: value};
        setFormData(prev => ({...prev, records: newRecords}));
    };

    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Shop Drawings Record saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'write',
                requestResourceData: formData
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("SHOP DRAWING AND SAMPLE RECORD", 148, 15, { align: 'center'});

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Project: ${formData.project || ''}`, 14, 25);
        doc.text(`Architect's Project No: ${formData.architectProjectNo || ''}`, 200, 25);
        doc.text(`Contractor: ${formData.contractor || ''}`, 14, 30);
        
        let startY = 35;
        formData.records.forEach((record: any, recordIndex: number) => {
            if (startY > 160) { 
                doc.addPage();
                startY = 15;
            }

            autoTable(doc, {
                startY,
                html: `#record-table-${recordIndex}`,
                theme: 'grid',
                styles: { fontSize: 6, cellPadding: 1, lineColor: 0, lineWidth: 0.1 },
                didDrawPage: (data) => {
                    startY = data.cursor?.y || 15;
                }
            });
            startY = (doc as any).lastAutoTable.finalY;
        });

        doc.save("shop-drawings-record.pdf");
        toast({ title: "Download Started", description: "PDF generation is in progress." });
    };

    const renderHeaderInput = (name: string, placeholder?: string) => isEditing ? 
        <Input name={name} value={formData[name] || ''} onChange={handleHeaderChange} placeholder={placeholder} /> :
        <span className="p-1">{formData[name] || ''}</span>;

    const renderRecordInput = (recordIndex: number, field: string, placeholder?: string) => isEditing ? 
        <Input name={field} value={formData.records[recordIndex][field] || ''} onChange={e => handleRecordChange(recordIndex, field, e.target.value)} placeholder={placeholder} className="h-6 text-xs" /> : 
        <span className="p-1 text-xs">{formData.records[recordIndex][field] || ''}</span>;

    const renderSubRecordInput = (recordIndex: number, subIndex: number, field: string, placeholder?: string) => isEditing ?
        <Input name={field} value={formData.records[recordIndex].subRecords[subIndex][field] || ''} onChange={e => handleSubRecordChange(recordIndex, subIndex, field, e.target.value)} placeholder={placeholder} className="h-6 text-xs" /> :
        <span className="p-1 text-xs">{formData.records[recordIndex].subRecords[subIndex][field] || ''}</span>;
        
    const renderSubRecordCheckbox = (recordIndex: number, subIndex: number, field: string) => isEditing ?
        <Checkbox checked={formData.records[recordIndex].subRecords[subIndex][field]} onCheckedChange={c => handleSubRecordChange(recordIndex, subIndex, field, c)} /> :
        (formData.records[recordIndex].subRecords[subIndex][field] ? '✓' : ' ');


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
                <CardTitle className="text-center font-bold text-xl">
                    SHOP DRAWING AND SAMPLE RECORD
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
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                    <FormField label="Project:">{renderHeaderInput('project')}</FormField>
                    <FormField label="Architect's Project No:">{renderHeaderInput('architectProjectNo')}</FormField>
                    <FormField label="Contractor:">{renderHeaderInput('contractor')}</FormField>
                </div>
                <div className="space-y-2">
                    {formData.records.map((record: any, recordIndex: number) => (
                    <Table key={recordIndex} id={`record-table-${recordIndex}`} className="border text-xs">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Date Record</TableHead>
                                <TableHead className="w-48">
                                    <div className="mb-1">Spec. Section No.</div>
                                    {renderRecordInput(recordIndex, 'specSectionNo')}
                                    <div className="mt-2 mb-1">Shop Drawing or Sample Drawing No.</div>
                                    {renderRecordInput(recordIndex, 'shopDrawingOrSampleNo')}
                                    <div className="mt-2">Title</div>
                                </TableHead>
                                <TableHead className="w-24">Contractor Subcontractor Trade</TableHead>
                                <TableHead className="w-16"># Record</TableHead>
                                <TableHead colSpan={4} className="text-center">Referred</TableHead>
                                <TableHead colSpan={2} className="text-center">Action</TableHead>
                                <TableHead colSpan={4} className="text-center">Copies To</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Date Sent</TableHead>
                                <TableHead># Copies</TableHead>
                                <TableHead>Date Ret'd.</TableHead>
                                <TableHead className="w-48">
                                    <div className="flex items-center gap-1 text-xs"><Checkbox disabled/> Approved</div>
                                    <div className="flex items-center gap-1 text-xs"><Checkbox disabled/> App'd as Noted</div>
                                    <div className="flex items-center gap-1 text-xs"><Checkbox disabled/> Revise & Resubmit</div>
                                    <div className="flex items-center gap-1 text-xs"><Checkbox disabled/> Not Approved</div>
                                </TableHead>
                                <TableHead>Date Ret'd.</TableHead>
                                <TableHead><Checkbox disabled/> Contractor</TableHead>
                                <TableHead><Checkbox disabled/> Owner</TableHead>
                                <TableHead><Checkbox disabled/> Field</TableHead>
                                <TableHead><Checkbox disabled/> File</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {record.subRecords.map((subRecord: any, subIndex: number) => (
                            <TableRow key={subIndex}>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'dateRecord')}</TableCell>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'title')}</TableCell>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'contractorSubcontractorTrade')}</TableCell>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'recordNo')}</TableCell>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'referredTo')}</TableCell>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'dateSent')}</TableCell>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'numCopies')}</TableCell>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'dateRetdReferred')}</TableCell>
                                <TableCell>
                                    <div className='flex items-center'>{renderSubRecordCheckbox(recordIndex, subIndex, 'actionApproved')}</div>
                                    <div className='flex items-center'>{renderSubRecordCheckbox(recordIndex, subIndex, 'actionApprovedAsNoted')}</div>
                                    <div className='flex items-center'>{renderSubRecordCheckbox(recordIndex, subIndex, 'actionReviseResubmit')}</div>
                                    <div className='flex items-center'>{renderSubRecordCheckbox(recordIndex, subIndex, 'actionNotApproved')}</div>
                                </TableCell>
                                <TableCell>{renderSubRecordInput(recordIndex, subIndex, 'actionDateRetd')}</TableCell>
                                <TableCell>{renderSubRecordCheckbox(recordIndex, subIndex, 'copiesToContractor')}</TableCell>
                                <TableCell>{renderSubRecordCheckbox(recordIndex, subIndex, 'copiesToOwner')}</TableCell>
                                <TableCell>{renderSubRecordCheckbox(recordIndex, subIndex, 'copiesToField')}</TableCell>
                                <TableCell>{renderSubRecordCheckbox(recordIndex, subIndex, 'copiesToFile')}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    ))}
                </div>
            </CardContent>
        </Card>
    </main>
    )
};
