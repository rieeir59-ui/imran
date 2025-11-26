
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from 'next/link';
import { ArrowLeft, Download, Edit, Save, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RATE_ANALYSIS_DOC_ID = 'rate-analysis';

export default function RateAnalysisPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({
        material: Array(5).fill({ description: '', amount: 0 }),
        labour: Array(4).fill({ description: '', amount: 0 }),
        materialProfitPercent: 0,
        materialTaxPercent: 0,
        labourProfitPercent: 0,
        labourTaxPercent: 7.5,
    });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/rateAnalysis/${RATE_ANALYSIS_DOC_ID}`);
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

    const handleInputChange = (section: 'material' | 'labour', index: number, field: 'description' | 'amount', value: any) => {
        if (!isEditing) return;
        const newSectionData = [...formData[section]];
        newSectionData[index] = { ...newSectionData[index], [field]: value };
        setFormData(prev => ({ ...prev, [section]: newSectionData }));
    };

    const handleOtherChange = (field: string, value: any) => {
        if (!isEditing) return;
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const calculateTotal = (section: 'material' | 'labour') => formData[section].reduce((acc: number, item: any) => acc + (parseFloat(item.amount) || 0), 0);

    const materialTotal = calculateTotal('material');
    const materialProfit = materialTotal * (parseFloat(formData.materialProfitPercent) / 100 || 0);
    const materialTax = (materialTotal + materialProfit) * (parseFloat(formData.materialTaxPercent) / 100 || 0);
    const materialGrandTotal = materialTotal + materialProfit + materialTax;

    const labourTotal = calculateTotal('labour');
    const labourProfit = labourTotal * (parseFloat(formData.labourProfitPercent) / 100 || 0);
    const labourTax = (labourTotal + labourProfit) * (parseFloat(formData.labourTaxPercent) / 100 || 0);
    const labourGrandTotal = labourTotal + labourProfit + labourTax;

    const handleSave = () => {
        if (!docRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Rate Analysis saved.' });
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
        doc.text("Rate Analysis", 105, 15, { align: 'center' });

        autoTable(doc, {
            startY: 25,
            html: '#rate-analysis-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        })

        doc.save("rate-analysis.pdf");
    };

    const renderField = (value: any, onChange: (val: any) => void) => {
        return isEditing ? <Input value={value} onChange={e => onChange(e.target.value)} className="h-8" /> : <span>{value}</span>;
    }

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
                    <CardTitle>Rate Analysis</CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={handleDownload} variant="outline"><Download className="mr-2 w-4 h-4"/> PDF</Button>
                        {isEditing ? (
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Save className="mr-2 w-4 h-4" />} Save
                            </Button>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 w-4 h-4" /> Edit</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div id="rate-analysis-table">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div><Label>DESCRIPTION OF ITEM:</Label>{renderField(formData.description, (val: string) => handleOtherChange('description', val))}</div>
                            <div><Label>Item No.</Label>{renderField(formData.itemNo, (val: string) => handleOtherChange('itemNo', val))}</div>
                            <div><Label>Qty</Label>{renderField(formData.qty, (val: string) => handleOtherChange('qty', val))}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-lg mb-2">MATERIAL</h4>
                                {formData.material.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-2 mb-1">
                                        {renderField(item.description, (val: string) => handleInputChange('material', index, 'description', val))}
                                        {renderField(item.amount, (val: string) => handleInputChange('material', index, 'amount', val))}
                                    </div>
                                ))}
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold"><span>Total</span><span>{materialTotal.toFixed(2)}</span></div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span>Contractor's Profit, & Overheads</span>
                                    {isEditing ? <Input type="number" value={formData.materialProfitPercent} onChange={e => handleOtherChange('materialProfitPercent', e.target.value)} className="w-20 h-8" /> : <span>{formData.materialProfitPercent}%</span>}
                                    <span>{materialProfit.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span>Tax</span>
                                    {isEditing ? <Input type="number" value={formData.materialTaxPercent} onChange={e => handleOtherChange('materialTaxPercent', e.target.value)} className="w-20 h-8" /> : <span>{formData.materialTaxPercent}%</span>}
                                    <span>{materialTax.toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold"><span>Total</span><span>{materialGrandTotal.toFixed(2)}</span></div>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">LABOUR</h4>
                                {formData.labour.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-2 mb-1">
                                        {renderField(item.description, (val: string) => handleInputChange('labour', index, 'description', val))}
                                        {renderField(item.amount, (val: string) => handleInputChange('labour', index, 'amount', val))}
                                    </div>
                                ))}
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold"><span>Total</span><span>{labourTotal.toFixed(2)}</span></div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span>Contractor's Profit, & Overheads</span>
                                    {isEditing ? <Input type="number" value={formData.labourProfitPercent} onChange={e => handleOtherChange('labourProfitPercent', e.target.value)} className="w-20 h-8" /> : <span>{formData.labourProfitPercent}%</span>}
                                    <span>{labourProfit.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span>Income Tax</span>
                                    {isEditing ? <Input type="number" value={formData.labourTaxPercent} onChange={e => handleOtherChange('labourTaxPercent', e.target.value)} className="w-20 h-8" /> : <span>{formData.labourTaxPercent}%</span>}
                                    <span>{labourTax.toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold"><span>Total</span><span>{labourGrandTotal.toFixed(2)}</span></div>
                            </div>
                        </div>
                        <div className="mt-8 border-t pt-4">
                            <h4 className="font-bold text-lg mb-2">ITEM RATES</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span>Labour rate per 100 Cft / Sft</span>{renderField(formData.labourRate, (val: string) => handleOtherChange('labourRate', val))}</div>
                                <div className="flex justify-between"><span>Composite rate per 100 Cft / Sft</span>{renderField(formData.compositeRate, (val: string) => handleOtherChange('compositeRate', val))}</div>
                                <div className="flex justify-between"><span>Composite rate per Cum / Sq.m</span>{renderField(formData.compositeRateM, (val: string) => handleOtherChange('compositeRateM', val))}</div>
                            </div>
                        </div>
                        <div className="mt-8 border-t pt-4">
                            <h4 className="font-bold text-lg mb-2">Specification of Item</h4>
                            {renderField(formData.specification, (val: string) => handleOtherChange('specification', val))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
