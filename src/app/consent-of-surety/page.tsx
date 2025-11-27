
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

const CONSENT_OF_SURETY_DOC_ID = 'consent-of-surety';

export default function ConsentOfSuretyPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/consentOfSurety/${CONSENT_OF_SURETY_DOC_ID}`);
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
        let y = 40;
        const leftMargin = 40;
        const rightMargin = doc.internal.pageSize.width - 40;
        const contentWidth = rightMargin - leftMargin;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("CONSENT OF SURETY", doc.internal.pageSize.width / 2, y, { align: 'center'});
        y += 14;
        doc.text("TO REDUCTION IN OR PARTIAL RELEASE OF RETAINAGE", doc.internal.pageSize.width / 2, y, { align: 'center'});
        y += 20;

        autoTable(doc, {
            startY: y,
            theme: 'plain',
            body: [
                [
                    { content: `Project: (Name, Address)\n${formData.project_name_address || ''}\n\nTo: (Owner)\n${formData.to_owner || ''}`, styles: { cellWidth: contentWidth / 2 - 10 } },
                    { content: `Architects Project No: ${formData.architect_project_no || ''}\nContract For: ${formData.contract_for || ''}\nContract Date: ${formData.contract_date || ''}`, styles: { cellWidth: contentWidth / 2 - 10 } }
                ]
            ],
            didDrawPage: (data) => {
                doc.setFontSize(9);
                doc.text('Distribution to:', rightMargin - 60, 40);
                const drawCheckbox = (x: number, yPos: number, label: string, isChecked: boolean) => {
                    doc.setFontSize(8);
                    doc.rect(x, yPos - 3.5, 5, 5);
                    if (isChecked) doc.text('X', x + 1, yPos);
                    doc.text(label, x + 7, yPos);
                };
                drawCheckbox(rightMargin - 60, 50, 'Owner', formData.check_owner);
                drawCheckbox(rightMargin - 25, 50, 'Surety', formData.check_surety);
                drawCheckbox(rightMargin - 60, 58, 'Architect', formData.check_architect);
                drawCheckbox(rightMargin - 25, 58, 'Other', formData.check_other);
                drawCheckbox(rightMargin - 60, 66, 'Contractor', formData.check_contractor);
            }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const p1 = `In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the ${formData.surety_name_address || '____________________'}, SURETY, on bond of ${formData.contractor_name_address || '____________________'}, CONTRACTOR, Hereby approves the reduction in or partial release of retainage to the Contractor as follows:`;
        const splitP1 = doc.splitTextToSize(p1, contentWidth);
        doc.text(splitP1, leftMargin, y);
        y += doc.getTextDimensions(splitP1).h + 5;

        const reductionText = doc.splitTextToSize(formData.reduction_details || 'N/A', contentWidth);
        doc.rect(leftMargin, y, contentWidth, doc.getTextDimensions(reductionText).h + 10);
        doc.text(reductionText, leftMargin + 2, y + 5);
        y += doc.getTextDimensions(reductionText).h + 20;

        const agreementText = `The Surety agrees that such reduction in or partial release of retainage to the Contractor shall not relieve the Surety of any of its obligations to ${formData.owner_name_address || '____________________'}, OWNER, as set forth in the said Surety's bond.`;
        const splitAgreement = doc.splitTextToSize(agreementText, contentWidth);
        doc.text(splitAgreement, leftMargin, y);
        y += doc.getTextDimensions(splitAgreement).h + 15;

        doc.text(`In Witness Whereof, The Surety has hereunto set its hand this ${formData.witness_day || '__'} day of ${formData.witness_month || '______'}, 20${formData.witness_year || '__'}.`, leftMargin, y);
        y += 20;

        doc.text('Attest: (Seal)', leftMargin, y);
        y += 30;

        const signatureX = leftMargin + contentWidth / 2;
        doc.text(`Surety: ${formData.surety_signature || '___________________________'}`, signatureX, y);
        y += 10;
        doc.text('(Signature of Authorized Representative)', signatureX, y);
        y += 15;
        doc.text(`Title: ${formData.surety_title || '___________________________'}`, signatureX, y);
        
        doc.save("consent-of-surety.pdf");
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
                    <CardTitle>CONSENT OF SURETY</CardTitle>
                    <p>TO REDUCTION IN OR PARTIAL RELEASE OF RETAINAGE</p>
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
                    <p className="text-sm">In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the</p>
                    <div className="flex items-center gap-2">{renderField('surety_name_address')}<span>, SURETY,</span></div>
                    <div className="flex items-center gap-2"><span>On bond of </span>{renderField('contractor_name_address')}<span>, CONTRACTOR,</span></div>
                    <p className="text-sm">Hereby approves the reduction in or partial release of retainage to the Contractor as follows:</p>
                    {renderField('reduction_details', 'textarea')}
                    <p className="text-sm">The Surety agrees that such reduction in or partial release of retainage to the Contractor shall not relieve the Surety of any of its obligations to {isEditing ? <Input name="owner_name_address" value={formData.owner_name_address || ''} onChange={handleInputChange} className="inline w-64"/> : <span>{formData.owner_name_address || '____________'}</span>}, OWNER, as set forth in the said Surety's bond.</p>
                    <div className="flex justify-between items-center pt-8">
                        <div>
                            <p>In Witness Whereof,</p>
                            <p>The Surety has hereunto set its hand this {isEditing ? <Input name="witness_day" value={formData.witness_day || ''} onChange={handleInputChange} className="inline w-12"/> : <span className="border-b inline-block w-12 text-center">{formData.witness_day || ''}</span>} day of {isEditing ? <Input name="witness_month" value={formData.witness_month || ''} onChange={handleInputChange} className="inline w-24"/> : <span className="border-b inline-block w-24 text-center">{formData.witness_month || ''}</span>}, 20{isEditing ? <Input name="witness_year" value={formData.witness_year || ''} onChange={handleInputChange} className="inline w-12"/> : <span className="border-b inline-block w-12 text-center">{formData.witness_year || ''}</span>}</p>
                        </div>
                        <div>
                            <p>Attest: (Seal)</p>
                        </div>
                    </div>
                    <div className="pt-8 flex justify-end">
                         <div className="w-1/2 space-y-2">
                             <Label>Surety:</Label>
                            {renderField('surety_signature')}
                            <p className="text-xs text-muted-foreground -mt-2">Signature of Authorized Representative</p>
                             <Label className="mt-4">Title:</Label>
                            {renderField('surety_title')}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
