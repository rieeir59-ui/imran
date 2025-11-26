
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

const CONSENT_OF_SURETY_FINAL_DOC_ID = 'consent-of-surety-final';

export default function ConsentOfSuretyFinalPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/consentOfSuretyFinal/${CONSENT_OF_SURETY_FINAL_DOC_ID}`);
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
            toast({ title: 'Success', description: 'Consent of Surety saved.' });
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
        const doc = new jsPDF('p', 'pt', 'a4');
        let y = 30;
    
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("CONSENT OF SURETY COMPANY TO FINAL PAYMENT", doc.internal.pageSize.width / 2, y, { align: 'center'});
        y += 20;

        const leftMargin = 40;
        const rightMargin = doc.internal.pageSize.width - 40;
        const contentWidth = rightMargin - leftMargin;
        const halfContentWidth = contentWidth / 2;
        
        autoTable(doc, {
            startY: y,
            body: [
                [
                    { content: `Project: (Name, Address)\n${formData.project_name_address || ''}\n\nTo: (Owner)\n${formData.to_owner || ''}`, styles: { cellWidth: halfContentWidth - 10 } },
                    { content: `Architects Project No: ${formData.architect_project_no || ''}\nContract For: ${formData.contract_for || ''}\nContract Date: ${formData.contract_date || ''}`, styles: { cellWidth: halfContentWidth - 10 } }
                ]
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2, halign: 'left' },
            margin: { left: leftMargin },
            didDrawPage: (data) => {
                const drawCheckbox = (x: number, yPos: number, label: string, isChecked: boolean) => {
                    doc.setFontSize(8);
                    doc.rect(x, yPos - 3.5, 5, 5);
                    if (isChecked) doc.text('X', x + 1, yPos);
                    doc.text(label, x + 7, yPos);
                };
                doc.setFontSize(9);
                doc.text('Distribution to:', rightMargin - 60, 30);
                drawCheckbox(rightMargin - 60, 40, 'Owner', formData.check_owner);
                drawCheckbox(rightMargin - 25, 40, 'Surety', formData.check_surety);
                drawCheckbox(rightMargin - 60, 48, 'Architect', formData.check_architect);
                drawCheckbox(rightMargin - 25, 48, 'Other', formData.check_other);
                drawCheckbox(rightMargin - 60, 56, 'Contractor', formData.check_contractor);
            }
        });
    
        y = (doc as any).lastAutoTable.finalY + 15;
    
        const p1 = `In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the (here insert named and address of Surety Company) ${formData.surety_company || ''}, SURETY COMPANY, on bond of (here insert named and address of Contractor) ${formData.contractor_name_address || ''}, CONTRACTOR, Hereby approves the final payment to the Contractor, and agrees that final payment to the Contractor shall not relieve the Surety Company of any of its obligations to (here insert named and address of Owner): ${formData.owner_name_address || ''}, OWNER, as set forth in the said Surety's bond.`;
        const splitText1 = doc.splitTextToSize(p1, contentWidth);
        doc.setFontSize(10);
        doc.text(splitText1, leftMargin, y);
        y += (doc.getTextDimensions(splitText1).h) + 15;

        const p2 = `In Witness Whereof, The Surety has hereunto set its hand this ${formData.witness_day || '__'} day of ${formData.witness_month || '______'}, 20${formData.witness_year || '__'}.`;
        const splitText2 = doc.splitTextToSize(p2, contentWidth);
        doc.text(splitText2, leftMargin, y);
        y += (doc.getTextDimensions(splitText2).h) + 25;

        doc.text(`Surety Company: ${formData.surety_company_name || '___________________________'}`, leftMargin, y);
        y += 20;

        doc.text('Attest: (Seal)', leftMargin, y);
        
        const signatureX = rightMargin - 150;
        doc.line(signatureX, y, rightMargin, y);
        doc.text('By:', signatureX - 15, y);
        doc.text('Signature of Authorized Representative', signatureX, y + 10);
        
        y += 25;

        doc.line(signatureX, y, rightMargin, y);
        doc.text('Title:', signatureX - 25, y);
        
        doc.save("consent-of-surety-final.pdf");
    };

    const renderField = (name: string, as?: 'textarea') => {
        const value = formData[name] || '';
        if (isEditing) {
            if (as === 'textarea') {
                return <Textarea name={name} value={value} onChange={handleInputChange} />;
            }
            return <Input name={name} value={value} onChange={handleInputChange} />;
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
                <CardHeader className="text-center">
                    <CardTitle>CONSENT OF SURETY COMPANY TO FINAL PAYMENT</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="w-2/3">
                            <Label>Project: (Name, Address)</Label>
                            {renderField('project_name_address')}
                        </div>
                        <div className="flex gap-2">
                             {isEditing ? <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                             <Button onClick={handleDownload} variant="outline"><Download className="w-4 h-4 mr-2"/>PDF</Button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 text-sm">
                        {renderCheckbox('check_owner', 'Owner')}
                        {renderCheckbox('check_architect', 'Architect')}
                        {renderCheckbox('check_contractor', 'Contractor')}
                        {renderCheckbox('check_surety', 'Surety')}
                        {renderCheckbox('check_other', 'Other')}
                    </div>
                     <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div>
                            <Label>To: (Owner)</Label>
                            {renderField('to_owner', 'textarea')}
                        </div>
                        <div>
                            <Label>Architects Project No:</Label>
                            {renderField('architect_project_no')}
                             <Label>Contract For:</Label>
                            {renderField('contract_for')}
                             <Label>Contract Date:</Label>
                            {renderField('contract_date')}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm">In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the (here insert named and address of Surety Company) {renderField('surety_company')}, SURETY COMPANY, on bond of (here insert named and address of Contractor) {renderField('contractor_name_address')}, CONTRACTOR, Hereby approves the final payment to the Contractor, and agrees that final payment to the Contractor shall not relieve the Surety Company of any of its obligations to (here insert named and address of Owner): {renderField('owner_name_address')}, OWNER, as set forth in the said Surety's bond.</div>
                    </div>
                    <div className="pt-8">
                        <p>In Witness Whereof, The Surety has hereunto set its hand this {isEditing ? <Input name="witness_day" value={formData.witness_day || ''} onChange={handleInputChange} className="inline w-12"/> : <span className="border-b inline-block w-12">{formData.witness_day || ''}</span>} day of {isEditing ? <Input name="witness_month" value={formData.witness_month || ''} onChange={handleInputChange} className="inline w-24"/> : <span className="border-b inline-block w-24">{formData.witness_month || ''}</span>}, 20{isEditing ? <Input name="witness_year" value={formData.witness_year || ''} onChange={handleInputChange} className="inline w-12"/> : <span className="border-b inline-block w-12">{formData.witness_year || ''}</span>}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-8">
                        <div>
                            <Label>Attest: (Seal)</Label>
                        </div>
                        <div>
                            <Label>Surety Company:</Label>
                            {renderField('surety_company_name')}
                            <Label>By:</Label>
                            {renderField('surety_signature')}
                            <p className="text-sm text-muted-foreground">Signature of Authorized Representative</p>
                             <Label className="mt-4">Title:</Label>
                            {renderField('surety_title')}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
