'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Download, Edit, Save, Loader2, ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PROPOSAL_REQUEST_DOC_ID = 'proposal-request';

export default function ProposalRequestPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();

    useEffect(() => {
      if (!isUserLoading && !user && auth) {
          initiateAnonymousSignIn(auth);
      }
    }, [isUserLoading, user, auth]);
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/proposalRequests/${PROPOSAL_REQUEST_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSave = () => {
        if (!docRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Proposal Request saved.' });
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

        const addField = (label: string, value: string, x: number, yPos: number, width: number) => {
            doc.text(`${label}: ${value || ''}`, x, yPos);
            doc.line(x + doc.getTextWidth(label) + 2, yPos + 1, x + width, yPos + 1);
        };

        const addTitle = (title: string) => {
            if (y > 260) { doc.addPage(); y = 15; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(30, 41, 59);
            doc.rect(14, y - 5, 182, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(title, 105, y, { align: 'center'});
            y += 8;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
        };
        
        addTitle("Proposal Request");
        y += 5;
    
        doc.setFontSize(10);
        addField('Project', formData.project || '', 14, y, 90);
        addField('Proposal Request No.', formData.proposal_no || '', 105, y, 90);
        y += 7;
    
        addField('(Name, Address)', formData.name_address || '', 14, y, 90);
        addField('Date', formData.date || '', 105, y, 90);
        y += 7;
    
        addField('Architects Project No', formData.architect_project_no || '', 14, y, 90);
        addField('Contract For', formData.contract_for || '', 105, y, 90);
        y += 7;
    
        addField('Owner', formData.owner || '', 14, y, 90);
        addField('Contract Date', formData.contract_date || '', 105, y, 90);
        y += 10;
    
        doc.rect(14, y, 182, 20);
        doc.text(`To: (Contractor) ${formData.to_contractor || ''}`, 16, y + 5);
        y += 25;
    
        doc.text('Description: (Written description of the Work)', 14, y);
        y += 5;
        const descText = doc.splitTextToSize(formData.description || '', 182);
        doc.rect(14, y, 182, 30);
        doc.text(descText, 16, y + 5);
        y += 35;
    
        doc.text('Attachments: (List attached documents that support description)', 14, y);
        y += 5;
        const attachText = doc.splitTextToSize(formData.attachments || '', 182);
        doc.rect(14, y, 182, 20);
        doc.text(attachText, 16, y + 5);
        y += 25;
    
        doc.text('Please submit an itemized quotation for changes in the Contract Sum and/or Time incidental to proposed modifications to the Contract Documents described herein.', 14, y);
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('THIS IS NOT A CHANGE ORDER NOR A DIRECTION TO PROCEED WITH THE WORK DESCRIBED HEREIN.', 105, y, { align: 'center' });
        y += 15;
    
        doc.setFont('helvetica', 'normal');
        doc.text(`Architect: ${formData.architect || ''}`, 14, y);
        y += 7;
        doc.text('By:', 14, y);
        y += 15;
    
        doc.text('Owner', 14, y);
        doc.text('Architect', 54, y);
        doc.text('Contractor', 94, y);
        doc.text('Field', 134, y);
        doc.text('Other', 174, y);

        doc.save("proposal-request.pdf");
        toast({ title: "Download Started", description: "PDF generation is in progress." });
    };

    const renderFormField = (name: string, placeholder?: string, as?: 'textarea') => {
        const value = formData[name] || '';
        if (isEditing) {
            return as === 'textarea' ?
                <Textarea name={name} value={value} onChange={handleInputChange} /> :
                <Input name={name} value={value} onChange={handleInputChange} />;
        }
        return <div className="border-b min-h-[24px] py-1">{value}</div>;
    };

    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    if (!user && !isUserLoading) {
      return (
        <main className="p-4 md:p-6 lg:p-8">
         <Card>
           <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
           <CardContent>
             <Alert variant="destructive">
               <Terminal className="h-4 w-4" />
               <AlertTitle>Unable to Authenticate</AlertTitle>
               <AlertDescription>We could not sign you in. Please refresh the page to try again.</AlertDescription>
             </Alert>
           </CardContent>
         </Card>
       </main>
     )
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
                    <CardTitle>Proposal Request</CardTitle>
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
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <div><Label>Project</Label>{renderFormField('project')}</div>
                            <div><Label>Proposal Request No.</Label>{renderFormField('proposal_no')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div><Label>(Name, Address)</Label>{renderFormField('name_address')}</div>
                            <div><Label>Date</Label>{renderFormField('date')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div><Label>Architects Project No</Label>{renderFormField('architect_project_no')}</div>
                            <div><Label>Contract For</Label>{renderFormField('contract_for')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div><Label>Owner</Label>{renderFormField('owner')}</div>
                            <div><Label>Contract Date</Label>{renderFormField('contract_date')}</div>
                        </div>

                        <div className="border rounded-md p-4 space-y-2">
                            <div>To: (Contractor)</div>
                            {renderFormField('to_contractor')}
                        </div>

                        <div><Label>Description: (Written description of the Work)</Label>{renderFormField('description', '', 'textarea')}</div>
                        <div><Label>Attachments: (List attached documents that support description)</Label>{renderFormField('attachments', '', 'textarea')}</div>
                        
                        <p>Please submit an itemized quotation for changes in the Contract Sum and/or Time incidental to proposed modifications to the Contract Documents described herein.</p>
                        <p className="font-bold text-center">THIS IS NOT A CHANGE ORDER NOT A DIRECTION TO PROCEED WITH THE WORK DESCRIBED HEREIN.</p>
                        
                        <div className="flex justify-between items-end pt-8">
                            <div>
                                <p>Architect:</p>
                                {renderFormField('architect')}
                                <p>By:</p>
                            </div>
                            <div><p>Owner</p></div>
                            <div><p>Architect</p></div>
                            <div><p>Contractor</p></div>
                            <div><p>Field</p></div>
                            <div><p>Other</p></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
