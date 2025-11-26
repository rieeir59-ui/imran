
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';

const PROJECT_APP_SUMMARY_DOC_ID = 'project-application-summary';

export default function ProjectApplicationSummaryPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const appSummaryDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectData/${PROJECT_APP_SUMMARY_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!appSummaryDocRef) return;
        setIsLoading(true);
        getDoc(appSummaryDocRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
        }).finally(() => setIsLoading(false));
    }, [appSummaryDocRef, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!appSummaryDocRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(appSummaryDocRef, formData, { merge: true }).then(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast({ title: 'Success', description: 'Project Application Summary saved.' });
        }).catch(err => {
            console.error(err);
            setIsSaving(false);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
        });
    };

    const handleDownload = () => {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("PROJECT APPLICATION SUMMARY", 105, 15, { align: 'center'});
      let y = 30;
      
      const tableBody = [
          ["Application Number", formData.applicationNumber || ''],
          ["Application Date", formData.applicationDate || ''],
          ["Period From", formData.periodFrom || ''],
          ["To", formData.periodTo || ''],
          ["Architect's Project No", formData.architectsProjectNo || ''],
      ];

      autoTable(doc, {
          startY: y,
          body: tableBody,
          theme: 'plain',
      });
      
      y = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.text("In tabulations below, amounts are stated to the nearest rupee.", 14, y);
      y+= 5;

      const summaryBody = [
            ['A', 'Original Contract Sum', formData.originalContractSum || ''],
            ['B', 'Net Change Orders to Date', formData.netChangeOrders || ''],
            ['C', 'Contract Sum to Date', formData.contractSumToDate || ''],
            ['D', 'Work In Place to Date', formData.workInPlaceToDate || ''],
            ['E', 'Stored Materials (Not in D or I)', formData.storedMaterials || ''],
            ['F', 'Total Completed & Stored to Date (D+E)', formData.totalCompletedAndStored || ''],
            ['G', 'Retainage Percentage', formData.retainagePercentage || ''],
            ['H', 'Retainage Amount', formData.retainageAmount || ''],
            ['I', 'Previous Payments', formData.previousPayments || ''],
            ['J', 'Current Payment Due (F-H-I)', formData.currentPaymentDue || ''],
            ['K', 'Balance to Finish (C-E)', formData.balanceToFinish || ''],
            ['L', 'Percent Complete (F÷C)', formData.percentComplete || ''],
      ];

      autoTable(doc, {
        startY: y,
        head: [['', 'Item', 'Amount']],
        body: summaryBody,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        columnStyles: { 0: { fontStyle: 'bold' } }
      });
      doc.save("project-application-summary.pdf");
    };

    const renderField = (label: string, name: keyof typeof formData) => (
        <div className="flex justify-between items-center py-1">
            <Label htmlFor={name} className={cn(name.length === 1 && "font-bold")}>{label}</Label>
            {isEditing ? (
                <Input id={name} name={name} value={formData[name] || ''} onChange={handleInputChange} className="w-1/2" />
            ) : (
                <span className="w-1/2 text-right">{formData[name]}</span>
            )}
        </div>
    );
    
    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
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
                    <CardTitle>Project Application Summary</CardTitle>
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
                    <div className="space-y-2">
                        {renderField("Application Number:", "applicationNumber")}
                        {renderField("Application Date:", "applicationDate")}
                        {renderField("Period From:", "periodFrom")}
                        {renderField("To:", "periodTo")}
                        {renderField("Architect's Project No:", "architectsProjectNo")}
                        
                        <p className="text-sm text-muted-foreground pt-4">In tabulations below, amounts are stated to the nearest rupee.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 pt-4">
                            <div className="font-semibold">{renderField("Contractor Name", "contractorName")}</div>
                            <div className="font-semibold">{renderField("Totals this Page or all Pages", "totalsPage")}</div>
                            <div className="font-semibold">{renderField("Portion of Work", "portionOfWork")}</div>
                        </div>
                        
                        <Separator className="my-4"/>

                        {renderField("A. Original Contract Sum", "originalContractSum")}
                        {renderField("B. Net Change Orders to Date", "netChangeOrders")}
                        {renderField("C. Contract Sum to Date", "contractSumToDate")}
                        {renderField("D. Work In Place to Date", "workInPlaceToDate")}
                        {renderField("E. Stored Materials (Not in D or I)", "storedMaterials")}
                        {renderField("F. Total Completed & Stored to Date (D+E)", "totalCompletedAndStored")}
                        {renderField("G. Retainage Percentage", "retainagePercentage")}
                        {renderField("H. Retainage Amount", "retainageAmount")}
                        {renderField("I. Previous Payments", "previousPayments")}
                        {renderField("J. Current Payment Due (F-H-I)", "currentPaymentDue")}
                        {renderField("K. Balance to Finish (C-E)", "balanceToFinish")}
                        {renderField("L. Percent Complete (F÷C)", "percentComplete")}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

