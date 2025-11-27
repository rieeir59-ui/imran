
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

const DOC_ID = 'construction-change-directive';

const FormField = ({ label, children }: { label?: string, children: React.ReactNode }) => (
    <div className="space-y-1">
        {label && <Label className="font-semibold text-sm">{label}</Label>}
        {children}
    </div>
);

export default function ConstructionChangeDirectivePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/constructionChangeDirectives/${DOC_ID}`);
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
            toast({ title: 'Success', description: 'Directive saved.' });
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
        doc.text("CONSTRUCTION", 14, y);
        y+=5;
        doc.text("CHANGE DIRECTIVE", 14, y);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const drawCheckbox = (x: number, yPos: number, label: string, isChecked: boolean) => {
            const boxSize = 3.5;
            doc.setDrawColor(0);
            doc.rect(x, yPos - boxSize, boxSize, boxSize, 'S');
            if (isChecked) {
                doc.setFont('ZapfDingbats');
                doc.text('✓', x + 0.5, yPos);
                doc.setFont('helvetica', 'normal');
            }
            doc.text(label, x + boxSize + 1.5, yPos);
        };
        
        drawCheckbox(150, 15, 'Owner', formData.check_owner);
        drawCheckbox(175, 15, 'Field', formData.check_field);
        drawCheckbox(150, 20, 'Architect', formData.check_architect);
        drawCheckbox(175, 20, 'Other', formData.check_other);
        drawCheckbox(150, 25, 'Contractor', formData.check_contractor);
        
        y += 15;

        autoTable(doc, {
            startY: y,
            body: [
                [`Project: (Name, Address)\n${formData.project_name_address || ''}`, `Directive No.: ${formData.directive_no || ''}`],
                [``, `Date: ${formData.date || ''}`],
                [`To Contractor: (Name, Address)\n${formData.to_contractor || ''}`, `Architects Project No: ${formData.architects_project_no || ''}`],
                [``, `Contract For: ${formData.contract_for || ''}`],
                [``, `Contract Date: ${formData.contract_date || ''}`],
            ],
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1 }
        });
        
        y = (doc as any).lastAutoTable.finalY + 5;

        doc.text(`You are hereby directed to make the following change(s) in this Contract:`, 14, y);
        y+=5;
        const changeDescText = doc.splitTextToSize(formData.change_description || '', 182);
        doc.rect(14, y, 182, 30);
        doc.text(changeDescText, 15, y+4);
        y+=35;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Proposed Adjustments", 105, y, { align: 'center' });
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(14, y, 200, y);
        y += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const p1 = `1. The proposed basis of adjustment to the Contract Sum or Guaranteed Maximum Price is:`;
        doc.text(p1, 14, y);
        y+=7;
        drawCheckbox(18, y, `Lum Sum (increase) (decrease) of Rs. ${formData.adjustment_lum_sum_amount || '_________'}`, formData.adjustment_lum_sum);
        y+=7;
        drawCheckbox(18, y, `Unit Price of Rs. ${formData.adjustment_unit_price_amount || '_________'} per ${formData.adjustment_unit_price_per || '_________'}`, formData.adjustment_unit_price);
        y+=7;
        drawCheckbox(18, y, 'as follows:', formData.adjustment_as_follows);

        const asFollowsText = doc.splitTextToSize(formData.adjustment_as_follows_text || '', 160);
        doc.text(asFollowsText, 23, y + 5);
        y += (asFollowsText.length * 4) + 8;

        let timeText = '2. The Contract Time is proposed to ';
        if (formData.time_adjusted) timeText += '(be adjusted). '; else if (formData.time_unchanged) timeText += '(remain unchanged). '; else timeText += '(be adjusted) (remain unchanged). ';
        timeText += `The proposed adjustment, if any, is (an increase of ${formData.time_increase_days || '___'} days) (a decrease of ${formData.time_decrease_days || '___'} days).`;
        const splitTimeText = doc.splitTextToSize(timeText, 182);
        doc.text(splitTimeText, 14, y);
        y += (splitTimeText.length * 5) + 10;
        
        const p3 = "When signed by the Owner and Architect and received by the Contractor, this document becomes effective IMMEDIATELY as a Construction Change Directive (CCD), and the Contractor shall proceed with the change(s) described above.";
        const splitP3 = doc.splitTextToSize(p3, 90);
        doc.text(splitP3, 14, y);
        
        const p4 = "Signature by the Contractor indicates the Contractor's agreement with the proposed adjustments in Contract Sum and Contract Time set forth in this Construction Change Directive.";
        const splitP4 = doc.splitTextToSize(p4, 90);
        doc.rect(105, y - 2, 95, splitP4.length * 4 + 8);
        doc.text(splitP4, 107, y + 2);
        
        y += (Math.max(splitP3.length, splitP4.length) * 5) + 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Architect', 14, y);
        doc.text('Contractor', 80, y);
        doc.text('Owner', 150, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        
        const addSignatureBlock = (x: number, prefix: string) => {
            let startY = y;
            doc.text(`Address: ${formData[`${prefix}_address`] || ''}`, x, startY);
            startY += 15;
            doc.text(`By: ${formData[`${prefix}_by`] || ''}`, x, startY);
            startY += 10;
            doc.text(`Date: ${formData[`${prefix}_date`] || ''}`, x, startY);
        }
        
        addSignatureBlock(14, 'architect');
        addSignatureBlock(80, 'contractor');
        addSignatureBlock(150, 'owner');
        
        doc.save("construction-change-directive.pdf");
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
                        <CardTitle className="text-xl font-bold">CONSTRUCTION</CardTitle>
                        <p className="font-semibold">CHANGE DIRECTIVE</p>
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
                        <FormField label="Project: (Name, Address)">{renderField('project_name_address', '', 'textarea')}</FormField>
                        <div>
                            <FormField label="Directive No.">{renderField('directive_no')}</FormField>
                            <FormField label="Date:">{renderField('date')}</FormField>
                        </div>
                        <FormField label="To Contractor: (Name, Address)">{renderField('to_contractor', '', 'textarea')}</FormField>
                        <div>
                            <FormField label="Architects Project No:">{renderField('architects_project_no')}</FormField>
                            <FormField label="Contract For:">{renderField('contract_for')}</FormField>
                            <FormField label="Contract Date:">{renderField('contract_date')}</FormField>
                        </div>
                    </div>
                    <p className="text-sm">You are hereby directed to make the following change(s) in this Contract:</p>
                    {renderField('change_description', 'Description of change...', 'textarea')}
                    
                    <div className="pt-6">
                        <h3 className="font-bold text-center text-lg">Proposed Adjustments</h3>
                        <div className="border-t mt-2 pt-4 space-y-4">
                            <div>1. The proposed basis of adjustment to the Contract Sum or Guaranteed Maximum Price is:</div>
                            <div className="pl-4 space-y-2">
                                <div className="flex items-center gap-2">{renderCheckbox('adjustment_lum_sum', '')} <div>Lum Sum (increase) (decrease) of Rs.</div> {renderField('adjustment_lum_sum_amount')}</div>
                                <div className="flex items-center gap-2">{renderCheckbox('adjustment_unit_price', '')} <div>Unit Price of Rs.</div> {renderField('adjustment_unit_price_amount')} <div>per</div> {renderField('adjustment_unit_price_per')}</div>
                                <div className="flex items-center gap-2">{renderCheckbox('adjustment_as_follows', '')} <div>as follows:</div></div>
                                {isEditing ? <Textarea name="adjustment_as_follows_text" value={formData.adjustment_as_follows_text || ''} onChange={handleInputChange} className="ml-8" /> : <div className="ml-8 p-2 border-b min-h-[36px]">{formData.adjustment_as_follows_text}</div>}
                            </div>
                            <div>2. The Contract Time is proposed to {isEditing ? <div className='inline-flex gap-2'>{renderCheckbox('time_adjusted', '(be adjusted)')} {renderCheckbox('time_unchanged', '(remain unchanged)')}</div> : <span>{formData.time_adjusted ? '(be adjusted)' : (formData.time_unchanged ? '(remain unchanged)' : '_____')}</span>}. The proposed adjustment, if any, is (an increase of {renderField('time_increase_days')} days) (a decrease of {renderField('time_decrease_days')} days).</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-4">
                        <p className="text-xs">When signed by the Owner and Architect and received by the Contractor, this document becomes effective IMMEDIATELY as a Construction Change Directive (CCD), and the Contractor shall proceed with the change(s) described above.</p>
                        <div className="border p-2 rounded-md text-xs">
                           Signature by the Contractor indicates the Contractor's agreement with the proposed adjustments in Contract Sum and Contract Time set forth in this Construction Change Directive.
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-3 gap-8 pt-8 items-end">
                        <div className="space-y-2">
                            <p className="text-center font-bold">Architect</p>
                            <FormField label="Address:">{renderField('architect_address')}</FormField>
                            <FormField label="By:">{renderField('architect_by')}</FormField>
                            <FormField label="Date:">{renderField('architect_date')}</FormField>
                        </div>
                         <div className="space-y-2">
                            <p className="text-center font-bold">Contractor</p>
                            <FormField label="Address:">{renderField('contractor_address')}</FormField>
                            <FormField label="By:">{renderField('contractor_by')}</FormField>
                            <FormField label="Date:">{renderField('contractor_date')}</FormField>
                        </div>
                         <div className="space-y-2">
                             <p className="text-center font-bold">Owner</p>
                            <FormField label="Address:">{renderField('owner_address')}</FormField>
                            <FormField label="By:">{renderField('owner_by')}</FormField>
                            <FormField label="Date:">{renderField('owner_date')}</FormField>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </main>
    )

    


