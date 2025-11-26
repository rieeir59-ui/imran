
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from 'next/link';
import { ArrowLeft, Download, Edit, Save, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const INSTRUCTION_SHEET_DOC_ID = 'instruction-sheet';

const initialSteps = () => Array.from({ length: 23 }, (_, i) => ({
    id: i + 1,
    what: '',
    how: '',
    why: ''
}));

export default function InstructionSheetPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ steps: initialSteps() });

    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/instructionSheets/${INSTRUCTION_SHEET_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({ ...data, steps: data.steps && data.steps.length > 0 ? data.steps : initialSteps() });
            } else {
                setFormData({ steps: initialSteps() });
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
        if (typeof checked === 'boolean') {
            setFormData({ ...formData, [name]: checked });
        }
    };

    const handleStepChange = (index: number, field: string, value: string) => {
        const newSteps = [...formData.steps];
        newSteps[index][field] = value;
        setFormData({ ...formData, steps: newSteps });
    };

    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: "Success", description: "Instruction Sheet saved." });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: formData });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("INSTRUCTION SHEET", 14, 15);
        autoTable(doc, {
            startY: 20,
            html: '#instruction-sheet-content',
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 163, 74] },
        });
        doc.save('instruction-sheet.pdf');
    };

    const renderField = (name: string) => {
        const value = formData[name] || '';
        if (isEditing) {
            return <Input name={name} value={value} onChange={handleInputChange} />;
        }
        return <div className="p-1 border-b min-h-[24px]">{value}</div>;
    };
    
    const renderCheckbox = (name: string, label: string) => (
        <div className="flex items-center space-x-2">
            <Checkbox id={name} name={name} checked={formData[name] || false} onCheckedChange={(checked) => handleCheckboxChange(name, checked)} disabled={!isEditing}/>
            <Label htmlFor={name} className="font-normal">{label}</Label>
        </div>
    );
    
    const renderStepCell = (index: number, field: 'what' | 'how' | 'why') => {
        const value = formData.steps[index]?.[field] || '';
        if (isEditing) {
            return <Input value={value} onChange={(e) => handleStepChange(index, field, e.target.value)} className="h-8"/>
        }
        return <div className="p-1 min-h-[32px]">{value}</div>
    }

    if (isLoading) return <div className="p-4 flex justify-center items-center"><Loader2 className="animate-spin"/> Loading...</div>;

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>INSTRUCTION SHEET</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                        {isEditing ? <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <div id="instruction-sheet-content">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-2/3 space-y-2">
                                <div className="flex gap-2 items-center"><Label className="w-20">Project:</Label>{renderField('project')}</div>
                                <div className="flex gap-2 items-center"><Label className="w-20">Contract:</Label>{renderField('contract')}</div>
                            </div>
                            <div className="w-1/3 space-y-2 text-right">
                                <div className="flex gap-2 justify-end items-center"><Label>TO</Label>
                                    <div className="text-left space-y-1">
                                        {renderCheckbox('to_owner', 'Owner')}
                                        {renderCheckbox('to_architect', 'Architect')}
                                        {renderCheckbox('to_contractor', 'Contractor')}
                                    </div>
                                    <div className="text-left space-y-1">
                                        {renderCheckbox('to_field', 'Field')}
                                        {renderCheckbox('to_other', 'Other')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mb-4">
                            <div className="flex gap-2 items-center"><Label>Field Report No.</Label>{renderField('fieldReportNo')}</div>
                            <div className="flex gap-2 items-center"><Label>Architects Project No:</Label>{renderField('architectsProjectNo')}</div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Important Steps (What?)</TableHead>
                                    <TableHead>Key Points (How?)</TableHead>
                                    <TableHead>Reasons (Why?)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.steps.map((step: any, index: number) => (
                                    <TableRow key={step.id}>
                                        <TableCell className="flex items-center gap-2"><span className="font-bold w-6">{index + 1}</span> {renderStepCell(index, 'what')}</TableCell>
                                        <TableCell>{renderStepCell(index, 'how')}</TableCell>
                                        <TableCell>{renderStepCell(index, 'why')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-end items-end mt-4">
                             <div className="flex gap-2 justify-end items-center"><Label>BY</Label>
                                <div className="text-left space-y-1">
                                    {renderCheckbox('by_owner', 'Owner')}
                                    {renderCheckbox('by_architect', 'Architect')}
                                    {renderCheckbox('by_contractor', 'Contractor')}
                                </div>
                                <div className="text-left space-y-1">
                                    {renderCheckbox('by_field', 'Field')}
                                    {renderCheckbox('by_other', 'Other')}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
