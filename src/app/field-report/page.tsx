
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft, Globe, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FIELD_REPORT_DOC_ID = 'field-report';

const FormField = ({ label, children }: { label?: string, children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
        {label && <label className="font-semibold text-sm whitespace-nowrap">{label}</label>}
        <div className="w-full">{children}</div>
    </div>
);

export default function FieldReportPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/fieldReports/${FIELD_REPORT_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormData(docSnap.data());
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
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Field Report saved." });
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
        let y = 15;
    
        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("ISBAH HASSAN & ASSOCIATES", 105, y, { align: 'center'});
        y += 6;
        doc.setFontSize(8);
        doc.text("ARCHITECTS - ENGINEERS - CONSTRUCTIONS", 105, y, { align: 'center'});
        y += 8;
    
        // Title and checkboxes
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("ARCHITECT'S FIELD REPORT", 14, y);
    
        let checkboxY = y - 2;
        const drawCheckbox = (x: number, yPos: number, label: string, isChecked: boolean) => {
            doc.setFontSize(8);
            doc.text(`${isChecked ? '[✓]' : '[ ]'} ${label}`, x, yPos);
        };
    
        drawCheckbox(150, checkboxY, 'Owner', formData.owner);
        drawCheckbox(175, checkboxY, 'Field', formData.field);
        checkboxY += 5;
        drawCheckbox(150, checkboxY, 'Architect', formData.architect_check);
        drawCheckbox(175, checkboxY, 'Other', formData.other);
        checkboxY += 5;
        drawCheckbox(150, checkboxY, 'Contractor', formData.contractor_check);
    
        y = checkboxY + 2;
    
        // Separator
        doc.setLineWidth(0.5);
        doc.line(14, y, 200, y);
        y += 5;
    
        // Main Info Table
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        autoTable(doc, {
            startY: y,
            body: [
                [`Project: ${formData.project || ''}`, `Field Report No: ${formData.fieldReportNo || ''}`],
                [`Contract: ${formData.contract || ''}`, `Architects Project No: ${formData.architectsProjectNo || ''}`],
                [`Date: ${formData.date || ''}  Time: ${formData.time || ''}`, `Weather: ${formData.weather || ''}  Tem. Range: ${formData.tempRange || ''}`],
                [`Est. % of Completion: ${formData.estCompletion || ''}`, `Conformance with Schedule: ${formData.conformance || ''}`],
                [`Work in Progress: ${formData.workInProgress || ''}`, `Present at Site: ${formData.presentAtSite || ''}`],
            ],
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 1, cellWidth: 'wrap' },
            columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90 } }
        });
        y = (doc as any).lastAutoTable.finalY + 3;
    
        // Sections with Textareas
        const addSection = (title: string, value: string) => {
            const splitValue = doc.splitTextToSize(value || '', 182);
            const requiredHeight = Math.max(splitValue.length * 4 + 10, 25);
            if (y + requiredHeight > 280) { // Check for page break
                doc.addPage();
                y = 15;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setDrawColor(200); // light grey for box
            doc.rect(14, y, 182, requiredHeight - 8);
            doc.text(splitValue, 15, y + 4);
            y += requiredHeight;
        }
    
        addSection("Observations:", formData.observations);
        addSection("Items to Verify:", formData.itemsToVerify);
        addSection("Information or Action Required:", formData.infoOrAction);
        addSection("Attachments:", formData.attachments);
    
        // Signature
        if (y > 270) { doc.addPage(); y = 15; }
        doc.setFont('helvetica', 'bold');
        doc.text("Report By:", 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.reportBy || '', 50, y);
        doc.line(48, y + 1, 120, y + 1);
        y+=10;
        
        // Footer
        y = doc.internal.pageSize.height - 15;
        doc.setLineWidth(0.2);
        doc.line(14, y, 196, y);
        y += 4;
        doc.setFontSize(7);
        const footerText = "Y-101 (Com), Phase-III, DHA Lahore Cantt | 0321-6995378, 042-35692522 | info@isbahhassan.com | www.isbahhassan.com";
        doc.text(footerText, 105, y, { align: 'center'});

        doc.save("architect-field-report.pdf");
        toast({ title: 'Download Started' });
    }
    
    const renderField = (name: string, placeholder?: string) => {
        const value = formData[name];
        return isEditing ? <Input name={name} value={value || ''} onChange={handleInputChange} placeholder={placeholder} /> : <div className="p-1 border-b min-h-[36px]">{value}</div>;
    }
    
    const renderCheckbox = (name: string, label: string) => {
        return <div className="flex items-center gap-2">
            <Checkbox id={name} name={name} checked={formData[name]} onCheckedChange={(checked) => handleCheckboxChange(name, checked as boolean)} disabled={!isEditing} />
            <Label htmlFor={name} className="font-normal">{label}</Label>
        </div>
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
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">ISBAH HASSAN & ASSOCIATES</CardTitle>
                    <p className="text-xs text-muted-foreground">ARCHITECTS - ENGINEERS - CONSTRUCTIONS</p>
                </CardHeader>
                <CardContent>
                     <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-bold">ARCHITECT'S FIELD REPORT</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                            {isEditing ? <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                         <div className="space-y-1">
                            {renderCheckbox('owner', 'Owner')}
                            {renderCheckbox('architect_check', 'Architect')}
                            {renderCheckbox('contractor_check', 'Contractor')}
                        </div>
                         <div className="space-y-1">
                            {renderCheckbox('field', 'Field')}
                            {renderCheckbox('other', 'Other')}
                        </div>
                    </div>
                    <Separator className="my-4"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Project:">{renderField('project')}</FormField>
                        <FormField label="Field Report No.:">{renderField('fieldReportNo')}</FormField>
                        <FormField label="Contract:">{renderField('contract')}</FormField>
                        <FormField label="Architects Project No:">{renderField('architectsProjectNo')}</FormField>
                        <FormField label="Date:">{renderField('date')}</FormField>
                        <FormField label="Time:">{renderField('time')}</FormField>
                        <FormField label="Weather:">{renderField('weather')}</FormField>
                        <FormField label="Tem. Range:">{renderField('tempRange')}</FormField>
                        <FormField label="Est. % of Completion:">{renderField('estCompletion')}</FormField>
                        <FormField label="Conformance with Schedule:">{renderField('conformance')}</FormField>
                        <FormField label="Work in Progress:">{renderField('workInProgress')}</FormField>
                        <FormField label="Present at Site:">{renderField('presentAtSite')}</FormField>
                    </div>
                     <div className="space-y-6 mt-6">
                        <FormField label="Observations:"><Textarea name="observations" value={formData.observations || ''} onChange={handleInputChange} disabled={!isEditing} rows={5}/></FormField>
                        <FormField label="Items to Verify:"><Textarea name="itemsToVerify" value={formData.itemsToVerify || ''} onChange={handleInputChange} disabled={!isEditing} rows={3}/></FormField>
                        <FormField label="Information or Action Required:"><Textarea name="infoOrAction" value={formData.infoOrAction || ''} onChange={handleInputChange} disabled={!isEditing} rows={3}/></FormField>
                        <FormField label="Attachments:"><Textarea name="attachments" value={formData.attachments || ''} onChange={handleInputChange} disabled={!isEditing} rows={2}/></FormField>
                        <FormField label="Report By:">{renderField('reportBy')}</FormField>
                     </div>
                </CardContent>
                 <CardFooter className="flex-col items-center justify-center pt-6 border-t">
                    <Separator className="mb-4"/>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><MapPin size={12}/> Y-101 (Com), Phase-III, DHA Lahore Cantt</div>
                        <div className="flex items-center gap-1"><Phone size={12}/> 0321-6995378, 042-35692522</div>
                        <div className="flex items-center gap-1"><Mail size={12}/> info@isbahhassan.com</div>
                        <div className="flex items-center gap-1"><Globe size={12}/> www.isbahhassan.com</div>
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}


