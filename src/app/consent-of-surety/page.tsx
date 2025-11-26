
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
        const doc = new jsPDF();
        let y = 15;
    
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("CONSENT OF SURETY", 105, y, { align: 'center'});
        y+=5;
        doc.text("TO REDUCTION IN OR PARTIAL RELEASE OF RETAINAGE", 105, y, { align: 'center'});
        y+=10;

        const drawCheckbox = (x: number, yPos: number, label: string, isChecked: boolean) => {
            doc.rect(x, yPos - 3.5, 3.5, 3.5);
            if (isChecked) doc.text('X', x + 0.8, yPos);
            doc.text(label, x + 5, yPos);
        };
        
        doc.setFontSize(10);
        drawCheckbox(140, y, 'Owner', formData.check_owner);
        drawCheckbox(160, y, 'Architect', formData.check_architect);
        drawCheckbox(180, y, 'Contractor', formData.check_contractor);
        y += 7;
        drawCheckbox(160, y, 'Surety', formData.check_surety);
        drawCheckbox(180, y, 'Other', formData.check_other);
        y -= 7;

        doc.setFont('helvetica', 'normal');
        doc.text(`Project: ${formData.project_name_address || ''}`, 14, y);
        doc.text(`Architects Project No: ${formData.architect_project_no || ''}`, 130, y);
        y+=7;
        doc.text(`Contract For: ${formData.contract_for || ''}`, 130, y);
        y+=7;
        doc.text(`Contract Date: ${formData.contract_date || ''}`, 130, y);
        y+=7;

        doc.text(`To: (Owner) ${formData.to_owner || ''}`, 14, y);
        y += 20;

        doc.text(`In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the`, 14, y);
        y += 7;
        doc.text(`${formData.surety_name_address || ''}, SURETY,`, 14, y);
        y += 14;
        doc.text(`On bond of ${formData.contractor_name_address || ''}, CONTRACTOR,`, 14, y);
        y += 14;
        doc.text(`Hereby approves the reduction in or partial release of retainage to the Contractor as follows:`, 14, y);
        y += 7;
        const reductionText = doc.splitTextToSize(formData.reduction_details || '', 180);
        doc.text(reductionText, 14, y);
        y += (reductionText.length * 5) + 7;

        const agreementText = doc.splitTextToSize(`The Surety agrees that such reduction in or partial release of retainage to the Contractor shall not relieve the Surety of any of its obligations to ${formData.owner_name_address || ''}, OWNER, as set forth in the said Surety's bond.`, 180);
        doc.text(agreementText, 14, y);
        y += (agreementText.length * 5) + 14;

        doc.text(`In Witness Whereof, The Surety has hereunto set its hand this ${formData.witness_day || '__'} day of ${formData.witness_month || '______'}, 20${formData.witness_year || '__'}`, 14, y);
        y += 14;

        doc.text('Surety:', 14, y);
        doc.line(30, y, 120, y);
        y += 7;
        doc.text(formData.surety_signature || '', 30, y);
        doc.text('Signature of Authorized Representative:', 14, y + 7);
        y += 14;
        doc.text('Title:', 14, y);
        doc.line(25, y, 120, y);
        y += 7;
        doc.text(formData.surety_title || '', 25, y);

        doc.text(`Attest: (Seal)`, 14, y - 20);

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
                            {renderField('to_owner')}
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
                            <p>The Surety has hereunto set its hand this {isEditing ? <Input name="witness_day" value={formData.witness_day || ''} onChange={handleInputChange} className="inline w-12"/> : <span>{formData.witness_day || '__'}</span>} day of {isEditing ? <Input name="witness_month" value={formData.witness_month || ''} onChange={handleInputChange} className="inline w-24"/> : <span>{formData.witness_month || '______'}</span>}, 20{isEditing ? <Input name="witness_year" value={formData.witness_year || ''} onChange={handleInputChange} className="inline w-12"/> : <span>{formData.witness_year || '__'}</span>}</p>
                        </div>
                        <div>
                            <Label>Surety:</Label>
                            {renderField('surety_signature')}
                            <Label>Signature of Authorized Representative:</Label>
                             <Label>Title:</Label>
                            {renderField('surety_title')}
                        </div>
                    </div>
                    <div className="pt-8"><p>Attest: (Seal)</p></div>
                </CardContent>
            </Card>
        </main>
    )
}
