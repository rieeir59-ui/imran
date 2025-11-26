
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CHANGE_ORDER_DOC_ID = 'change-order';

export default function ChangeOrderPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/changeOrders/${CHANGE_ORDER_DOC_ID}`);
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

    const handleSave = () => {
        if (!docRef) {
             toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Change Order saved.' });
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
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("CHANGE ORDER", 105, 15, { align: 'center'});
        
        autoTable(doc, {
            startY: 25,
            html: '#change-order-table',
            theme: 'plain',
        });

        doc.save("change-order.pdf");
    };

    const renderField = (name: string, placeholder?: string, as?: 'textarea') => {
        const value = formData[name] || '';
        if (isEditing) {
            if (as === 'textarea') {
                return <Textarea name={name} value={value} onChange={handleInputChange} placeholder={placeholder} />;
            }
            return <Input name={name} value={value} onChange={handleInputChange} placeholder={placeholder} />;
        }
        return <div className="p-2 border-b min-h-[36px]">{value}</div>;
    };
    
    if (isLoading || isUserLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>;

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Change Order</CardTitle>
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
                <CardContent className="space-y-4" id="change-order-table">
                     <div className="grid grid-cols-2 gap-4">
                        <div><Label>Project:</Label>{renderField('project_name_address', '(Name, Address)')}</div>
                        <div><Label>Field Report No.:</Label>{renderField('field_report_no')}</div>
                        <div><Label>Architects Project No:</Label>{renderField('architect_project_no')}</div>
                        <div><Label>Date:</Label>{renderField('date')}</div>
                        <div><Label>To (Contractor):</Label>{renderField('to_contractor')}</div>
                        <div><Label>Contract For:</Label>{renderField('contract_for')}</div>
                        <div><Label>Contract Date:</Label>{renderField('contract_date')}</div>
                    </div>

                    <div>
                        <Label>This Contract is changed as follows:</Label>
                        {renderField('change_description', '', 'textarea')}
                    </div>

                    <div className="font-bold text-center">Not Valid until signed by the Owner, Architect and Contractor.</div>
                    
                     <div className="space-y-2">
                        <div className="flex items-center gap-2"><div>The original (Contract Sum) (Guaranteed Maximum Price) was</div> {renderField('original_contract_sum', 'Rs.')}</div>
                        <div className="flex items-center gap-2"><div>Net change by previously authorized Change Orders</div> {renderField('net_change_orders', 'Rs.')}</div>
                        <div className="flex items-center gap-2"><div>The (Contract Sum) (Guaranteed Maximum Price) prior to this Change Order was</div> {renderField('contract_sum_prior', 'Rs.')}</div>
                        <div className="flex items-center gap-2"><div>The (Contract Sum) (Guaranteed Maximum Price) will be (increased) (decreased) (changed) by this Change Order in the amount of</div> {renderField('change_order_amount', 'Rs.')}</div>
                        <div className="flex items-center gap-2"><div>The new (Contract Sum) (Guaranteed Maximum Price) including this Change Order will be</div> {renderField('new_contract_sum', 'Rs.')}</div>
                        <div className="flex items-center gap-2"><div>The Contract Time will be (increased) (decreased) by</div> {renderField('contract_time_change', '(_______) days')}</div>
                        <div className="flex items-center gap-2"><div>the date of Substantial Completion as the date of this Change Order therefore is:</div> {renderField('substantial_completion_date')}</div>
                    </div>
                    
                    <div className="text-xs text-center">NOTE: This summary does not reflect changes in the Contract Sum, Contract Time or Guaranteed Maximum Price which have been authorized by Contraction Change Directive.</div>
                    
                    <div className="grid grid-cols-3 gap-8 pt-8">
                        <div><Label>Architect</Label>{renderField('architect_signature_address', 'Address')}{renderField('architect_by', 'By')}{renderField('architect_date', 'Date')}</div>
                        <div><Label>Contractor</Label>{renderField('contractor_signature_address', 'Address')}{renderField('contractor_by', 'By')}{renderField('contractor_date', 'Date')}</div>
                        <div><Label>Owner</Label>{renderField('owner_signature_address', 'Address')}{renderField('owner_by', 'By')}{renderField('owner_date', 'Date')}</div>
                    </div>
                    <div className="flex justify-end gap-4 text-xs pt-4">
                        <span>Owner</span><span>Architect</span><span>Contractor</span><span>Field</span><span>Other</span>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
