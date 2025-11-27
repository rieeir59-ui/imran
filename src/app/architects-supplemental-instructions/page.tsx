
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DOC_ID = 'architects-supplemental-instructions';

const FormField = ({ label, children }: { label?: string, children: React.ReactNode }) => (
    <div className="space-y-1">
        {label && <Label className="font-semibold text-sm">{label}</Label>}
        {children}
    </div>
);

export default function ArchitectsSupplementalInstructionsPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/architectsSupplementalInstructions/${DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
        if (typeof checked === 'boolean') {
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
        }
    };
    
    const handleSave = () => {
        if (!docRef) {
             toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Instructions saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'write',
                requestResourceData: formData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        let y = 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("ARCHITECT'S", 14, y);
        y+=5;
        doc.text("SUPPLEMENTAL INSTRUCTIONS", 14, y);
        y += 10;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const drawCheckbox = (x: number, yPos: number, label: string, isChecked: boolean) => {
            const boxSize = 3.5;
            doc.setDrawColor(0);
            doc.rect(x, yPos - boxSize, boxSize, boxSize, 'S');
            if (isChecked) {
                doc.setFont('ZapfDingbats');
                doc.text('✓', x + 0.5, yPos);
            }
            doc.setFont('helvetica', 'normal');
            doc.text(label, x + boxSize + 1.5, yPos);
        };
        
        drawCheckbox(140, 15, 'Owner', formData.check_owner);
        drawCheckbox(170, 15, 'Contractor', formData.check_contractor_dist);
        drawCheckbox(140, 20, 'Architect', formData.check_architect);
        drawCheckbox(170, 20, 'Field', formData.check_field);
        drawCheckbox(140, 25, 'Contractor', formData.check_contractor);
        drawCheckbox(170, 25, 'Other', formData.check_other);

        autoTable(doc, {
            startY: y,
            body: [
                [`Project: ${formData.project_name_address || ''}`, `Architect's Supplemental Instruction No.: ${formData.instruction_no || ''}`],
                [``, `Date of Issuance: ${formData.date_of_issuance || ''}`],
                [`Contract For: ${formData.contract_for || ''}`, `Architects: ${formData.architects || ''}`],
                [`Owner: ${formData.owner || ''}`, `Architects Project No: ${formData.architects_project_no || ''}`],
                [`To: (Contractor)\n${formData.to_contractor || ''}`, `Contract Date: ${formData.contract_date || ''}`],
            ],
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1 }
        });
        
        y = (doc as any).lastAutoTable.finalY + 5;

        const mainText = "The Work shall be carried out in accordance with the following supplemental instructions issued in accordance with the contract Documents without change in Contract Sum or Contract Time. Prior to proceeding in accordance with these instructions, indicate you acceptance of these instructions for minor change to the Work as consistent with the Contract Documents and return a copy to the Architect.";
        const splitText = doc.splitTextToSize(mainText, 182);
        doc.text(splitText, 14, y);
        y += (splitText.length * 4) + 10;
        
        const addTextSection = (label: string, value: string) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 14, y);
            y+=5;
            doc.setFont('helvetica', 'normal');
            const splitValue = doc.splitTextToSize(value || '', 182);
            doc.rect(14, y, 182, 30);
            doc.text(splitValue, 15, y+4);
            y+=35;
        }

        addTextSection("Description:", formData.description || '');
        addTextSection("Attachments (Here insert listing of documents that support description.)", formData.attachments || '');

        y += 20;
        doc.text('Issued:', 14, y);
        doc.text('Accepted:', 105, y);
        y += 5;
        doc.text(`By: ${formData.issued_by || ''}`, 14, y);
        doc.text(`By: ${formData.accepted_by || ''}`, 105, y);
        y += 5;
        doc.text('Architect', 14, y);
        doc.text('Contractor', 105, y);
        doc.text(`Date: ${formData.accepted_date || ''}`, 150, y);

        doc.save("architects-supplemental-instructions.pdf");
    };

    const renderField = (name: string, placeholder?: string, as?: 'textarea') => {
        const value = formData[name] || '';
        if (isEditing) {
            if (as === 'textarea') {
                return <Textarea name={name} value={value} onChange={handleInputChange} placeholder={placeholder} />;
            }
            return <Input name={name} value={value} onChange={handleInputChange} placeholder={placeholder} />;
        }
        return <div className="p-2 border-b min-h-[36px] whitespace-pre-wrap">{value}</div>;
    };
    
    const renderCheckbox = (name: string, label: string) => (
        <div className="flex items-center space-x-2">
            <Checkbox id={name} name={name} checked={formData[name] || false} onCheckedChange={(checked) => handleCheckboxChange(name, checked)} disabled={!isEditing}/>
            <Label htmlFor={name} className="font-normal">{label}</Label>
        </div>
    );

    if (isLoading || isUserLoading) return <div className="p-4 flex justify-center items-center"><Loader2 className="animate-spin"/> Loading...</div>;

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex-row justify-between items-start">
                     <div>
                        <CardTitle className="text-xl font-bold">ARCHITECT'S</CardTitle>
                        <p className="font-semibold">SUPPLEMENTAL INSTRUCTIONS</p>
                    </div>
                    <div className="flex gap-2">
                         {isEditing ? <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                         <Button onClick={handleDownload} variant="outline"><Download className="w-4 h-4 mr-2"/>PDF</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-end gap-x-8 gap-y-1 flex-wrap">
                        {renderCheckbox('check_owner', 'Owner')}
                        {renderCheckbox('check_architect', 'Architect')}
                        {renderCheckbox('check_contractor', 'Contractor')}
                        {renderCheckbox('check_field', 'Field')}
                        {renderCheckbox('check_other', 'Other')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <FormField label="Project: (Name, Address)">{renderField('project_name_address')}</FormField>
                        <FormField label="Architect's Supplemental Instruction No.">{renderField('instruction_no')}</FormField>
                        <FormField label="Contract For:">{renderField('contract_for')}</FormField>
                        <FormField label="Date of Issuance:">{renderField('date_of_issuance')}</FormField>
                        <FormField label="Owner:">{renderField('owner')}</FormField>
                        <FormField label="Architects:">{renderField('architects')}</FormField>
                        <FormField label="To: (Contractor)">{renderField('to_contractor', undefined, 'textarea')}</FormField>
                        <div>
                            <FormField label="Architects Project No:">{renderField('architects_project_no')}</FormField>
                            <FormField label="Contract Date:">{renderField('contract_date')}</FormField>
                        </div>
                    </div>
                    <div className="p-2 border my-4">
                        <p className="text-sm">The Work shall be carried out in accordance with the following supplemental instructions issued in accordance with the contract Documents without change in Contract Sum or Contract Time. Prior to proceeding in accordance with these instructions, indicate you acceptance of these instructions for minor change to the Work as consistent with the Contract Documents and return a copy to the Architect.</p>
                    </div>
                     <FormField label="Description:">{renderField('description', undefined, 'textarea')}</FormField>
                     <FormField label="Attachments (Here insert listing of documents that support description.)">{renderField('attachments', undefined, 'textarea')}</FormField>
                     <div className="grid grid-cols-3 gap-8 pt-8 items-end">
                        <div className="space-y-2">
                            <Label>Issued:</Label>
                            <FormField label="By:">{renderField('issued_by')}</FormField>
                            <p className="text-center">Architect</p>
                        </div>
                         <div className="space-y-2">
                            <Label>Accepted:</Label>
                            <FormField label="By:">{renderField('accepted_by')}</FormField>
                            <p className="text-center">Contractor</p>
                        </div>
                         <div>
                            <FormField label="Date:">{renderField('accepted_date')}</FormField>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </main>
    )
}
