
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

const PAYMENT_APP_DOC_ID = 'application-for-payment';

const FormField = ({ label, children }: { label?: string, children: React.ReactNode }) => (
    <div className="flex flex-col space-y-1">
        {label && <Label className="font-semibold text-sm">{label}</Label>}
        {children}
    </div>
);

export default function ApplicationForPaymentPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/applicationForPayment/${PAYMENT_APP_DOC_ID}`);
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
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Application for Payment saved.' });
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
        doc.text("PROJECT APPLICATION AND PROJECT CERTIFICATE FOR PAYMENT", 105, 15, { align: 'center'});
        
        autoTable(doc, {
            startY: 25,
            html: '#payment-application-table',
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1 },
        });

        doc.save("application-for-payment.pdf");
    };

    const renderField = (name: string) => {
        const value = formData[name] || '';
        return isEditing ? <Input name={name} value={value} onChange={handleInputChange} /> : <div className="p-1 border-b min-h-[24px]">{value}</div>;
    }
    const renderCheckbox = (name: string, label: string) => (
         <div className="flex items-center space-x-2">
            <Checkbox id={name} name={name} checked={formData[name] || false} onCheckedChange={(checked) => handleCheckboxChange(name, checked)} disabled={!isEditing}/>
            <Label htmlFor={name}>{label}</Label>
        </div>
    );
    
    if (isLoading || isUserLoading) return <div className="p-4 flex justify-center items-center"><Loader2 className="animate-spin"/> Loading...</div>

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Application and Certificate for Payment</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                        {isEditing ? <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <div id="payment-application-table">
                        <div className="grid grid-cols-3 gap-4 border-b pb-4">
                            <div className="col-span-2 space-y-2">
                                <FormField label="To (Owner):">{renderField('owner')}</FormField>
                                <FormField label="Attention:">{renderField('attention')}</FormField>
                            </div>
                            <div className="space-y-2">
                                <FormField label="Project:">{renderField('project')}</FormField>
                                <FormField label="Construction Manager:">{renderField('constructionManager')}</FormField>
                            </div>
                             <div className="col-span-2"></div>
                             <div className="space-y-2">
                                <FormField label="Application Number:">{renderField('applicationNumber')}</FormField>
                                <FormField label="Period From:">{renderField('periodFrom')}</FormField>
                                <FormField label="To:">{renderField('periodTo')}</FormField>
                                <FormField label="Architect's Project No:">{renderField('architectsProjectNo')}</FormField>
                                <div>
                                    <Label>Distributed to:</Label>
                                    {renderCheckbox('dist_owner', 'Owner')}
                                    {renderCheckbox('dist_architect', 'Architect')}
                                    {renderCheckbox('dist_contractor', 'Contractor Manager')}
                                    {renderCheckbox('dist_others', 'Others')}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mt-4">
                            <div>
                                <h4 className="font-bold">Project Application for Payment:</h4>
                                <p className="text-xs my-2">The undersigned Construction Manager certifies that the best of the Construction Manager's knowledge, information and belief Work covered by this Project Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractors for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.</p>
                                <FormField label="Construction Manager:">{renderField('cmName')}</FormField>
                                <div className="flex gap-4 mt-4">
                                    <FormField label="By:">{renderField('cmBy')}</FormField>
                                    <FormField label="Date:">{renderField('cmDate')}</FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <FormField label="Status of:">{renderField('cmStatus')}</FormField>
                                    <FormField label="County of:">{renderField('cmCounty')}</FormField>
                                </div>
                                <p className="text-xs my-2">Subscribed and sworn to before me this <span className="p-1 border-b">{formData.swornDay || '__'}</span> Day of: <span className="p-1 border-b">{formData.swornMonth || '______'}</span></p>
                                <FormField label="Notary Public:">{renderField('notaryPublic')}</FormField>
                                <FormField label="My Commission expires:">{renderField('commissionExpires')}</FormField>
                            </div>
                            <div>
                                <p className="text-xs">Application is made for Payment, as shown below, in connection with the Project. Project Application Summary, is attached.</p>
                                <p className="text-xs mt-2">The present status for the account for all Contractors is for this Project is as follows:</p>
                                <div className="space-y-2 mt-4">
                                    <FormField label="Total Contract Sum (Item A Totals):">{renderField('totalContractSum')}</FormField>
                                    <FormField label="Total Net Changes by Change Order (Item B Totals):">{renderField('netChanges')}</FormField>
                                    <FormField label="Total Contract Sum to Date (Item C Totals):">{renderField('contractSumToDate')}</FormField>
                                    <FormField label="Total Completed & Stored to Date (Item F Totals):">{renderField('totalCompleted')}</FormField>
                                    <FormField label="Retainage (Item H Totals):">{renderField('retainage')}</FormField>
                                    <FormField label="Less Previous Totals Payments (Item I Total):">{renderField('lessPrevious')}</FormField>
                                    <FormField label="Current Payment Due (Item J Totals):">{renderField('currentDue')}</FormField>
                                </div>
                            </div>
                        </div>

                         <div className="mt-4 pt-4 border-t">
                            <h4 className="font-bold">Architect's Project Certificate for Payment:</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <p className="text-xs my-2">In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.</p>
                                <div>
                                    <FormField label="Total of Amounts Certified:">{renderField('totalCertified')}</FormField>
                                    <p className="text-xs">(Attach explanation if amount certified differs from the amount applies for.)</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 mt-4">
                                <div>
                                    <FormField label="Architect:">{renderField('architectName')}</FormField>
                                     <div className="flex gap-4 mt-4">
                                        <FormField label="By:">{renderField('architectBy')}</FormField>
                                        <FormField label="Date:">{renderField('architectDate')}</FormField>
                                    </div>
                                </div>
                                <p className="text-xs mt-2">This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable on to the Contractors named in Contract Document attached. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
