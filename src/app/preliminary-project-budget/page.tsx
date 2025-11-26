
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from 'next/link';
import { ArrowLeft, Download, Edit, Save, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRELIMINARY_BUDGET_DOC_ID = 'preliminary-project-budget';

const initialFormData = {
    project: '',
    projectNo: '',
    job: '',
    revNo: '',
    location: '',
    preparedBy: '',
    grossArea: '',
    rentalArea: '',
    efficiency: '',
    date: '',
    revDate: '',
    basicBuildingCosts: [
        { item: '1. Site Work', rsPerSft: '', area: '', total: '' },
        { item: '2. Structural Frame', rsPerSft: '', area: '', total: '' },
        { item: '3. Exterior Finish', rsPerSft: '', area: '', total: '' },
        { item: '4. Interior Finish', rsPerSft: '', area: '', total: '' },
        { item: '5. Mechanical Vert. Transportation', rsPerSft: '', area: '', total: '' },
        { item: '6. Electrical Work', rsPerSft: '', area: '', total: '' },
        { item: '7. Heating, Ventilating, Air-conditioning', rsPerSft: '', area: '', total: '' },
        { item: '8. Plumbing', rsPerSft: '', area: '', total: '' },
        { item: '9. Fire Protection', rsPerSft: '', area: '', total: '' },
    ],
    unusualBuildingCosts: [
        { item: '10. Unusual Site Conditions', total: '' },
        { item: '11. Unusual Soil Conditions', total: '' },
        { item: '12. Off-Site Work', total: '' },
        { item: '13. Provisions for Future Expansion', total: '' },
        { item: '14. Special Equipment', total: '' },
        { item: '15. Construction-Time Schedule', total: '' },
        { item: '16. Type of Bidding and Contract', total: '' },
    ],
    additionalBudgetItems: [
        { item: '17. Landscaping', total: '' },
        { item: '18. Art and Sign Program', total: '' },
        { item: '19. Tenant Allowances (standard)', total: '' },
        { item: '20. Self-liquidation Items', total: '' },
    ],
    ownersBudgetItems: [
        { item: '21. Professional Fees @270/Sqr.Ft', total: '' },
        { item: '22. Surveys and Insurance Costs', total: '' },
        { item: '23. Land Cost', total: '' },
        { item: '24. Legal and Accounting Costs', total: '' },
        { item: '25. Leasing and Advertising Costs', total: '' },
        { item: '26. Financing Costs and Taxes', total: '' },
        { item: '27. Promotion', total: '' },
        { item: '28. Pre-Opening Expenses', total: '' },
        { item: '29. Owner\'s Administration Costs', total: '' },
        { item: '30. Concessions to Major Tenants (above standards)', total: '' },
    ]
};

export default function PreliminaryProjectBudgetPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>(initialFormData);

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/preliminaryProjectBudgets/${PRELIMINARY_BUDGET_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            } else {
                setFormData(initialFormData);
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTableChange = (section: string, index: number, field: string, value: string) => {
        const newSectionData = [...formData[section]];
        newSectionData[index][field] = value;
        setFormData(prev => ({ ...prev, [section]: newSectionData }));
    };
    
    const calculateTotal = (items: any[]) => items.reduce((sum, item) => sum + (parseFloat(item.total.replace(/,/g, '')) || 0), 0).toFixed(2);

    const basicBuildingCostsTotal = calculateTotal(formData.basicBuildingCosts);
    const unusualBuildingCostsTotal = calculateTotal(formData.unusualBuildingCosts);
    const additionalBudgetItemsTotal = calculateTotal(formData.additionalBudgetItems);
    const ownersBudgetItemsTotal = calculateTotal(formData.ownersBudgetItems);
    const subTotal = (parseFloat(basicBuildingCostsTotal) + parseFloat(unusualBuildingCostsTotal) + parseFloat(additionalBudgetItemsTotal)).toFixed(2);
    const totalProjectBudget = (parseFloat(subTotal) + parseFloat(ownersBudgetItemsTotal)).toFixed(2);


    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: "Success", description: "Preliminary Project Budget saved." });
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
        doc.text("PRELIMINARY PROJECT BUDGET", 105, 15, { align: 'center' });
        
        autoTable(doc, {
            startY: 25,
            html: '#budget-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] },
        });

        doc.save("preliminary-project-budget.pdf");
        toast({ title: "Download Started", description: "PDF is being generated." });
    }

    const renderCell = (value: string, onChange: (val: string) => void) => {
        return isEditing ? <Input value={value || ''} onChange={e => onChange(e.target.value)} className="h-8"/> : <div className="p-1 min-h-[32px]">{value}</div>;
    }

    if (isLoading || isUserLoading) return <div className="p-4 flex justify-center items-center"><Loader2 className="animate-spin"/> Loading...</div>;

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Preliminary Project Budget</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                        {isEditing ? <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <div id="budget-table">
                        <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                            <div><Label>Project:</Label>{renderCell(formData.project, (val) => setFormData({...formData, project: val}))}</div>
                            <div><Label>Project No:</Label>{renderCell(formData.projectNo, (val) => setFormData({...formData, projectNo: val}))}</div>
                            <div><Label>Date:</Label>{renderCell(formData.date, (val) => setFormData({...formData, date: val}))}</div>
                            <div></div>
                            <div><Label>Job:</Label>{renderCell(formData.job, (val) => setFormData({...formData, job: val}))}</div>
                            <div><Label>Rev. No:</Label>{renderCell(formData.revNo, (val) => setFormData({...formData, revNo: val}))}</div>
                            <div><Label>Date:</Label>{renderCell(formData.revDate, (val) => setFormData({...formData, revDate: val}))}</div>
                            <div></div>
                            <div><Label>Location:</Label>{renderCell(formData.location, (val) => setFormData({...formData, location: val}))}</div>
                            <div className="col-span-2"><Label>Prepared by:</Label>{renderCell(formData.preparedBy, (val) => setFormData({...formData, preparedBy: val}))}</div>
                            <div></div>
                            <div><Label>Gross Area:</Label>{renderCell(formData.grossArea, (val) => setFormData({...formData, grossArea: val}))}</div>
                            <div><Label>Rental Area:</Label>{renderCell(formData.rentalArea, (val) => setFormData({...formData, rentalArea: val}))}</div>
                            <div><Label>Efficiency:</Label>{renderCell(formData.efficiency, (val) => setFormData({...formData, efficiency: val}))}%</div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Rs. per sft. Gross</TableHead>
                                    <TableHead>Area</TableHead>
                                    <TableHead>Total Rs.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.basicBuildingCosts.map((item: any, index: number) => (
                                    <TableRow key={`basic-${index}`}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell>{renderCell(item.rsPerSft, (val) => handleTableChange('basicBuildingCosts', index, 'rsPerSft', val))}</TableCell>
                                        <TableCell>{renderCell(item.area, (val) => handleTableChange('basicBuildingCosts', index, 'area', val))}</TableCell>
                                        <TableCell>{renderCell(item.total, (val) => handleTableChange('basicBuildingCosts', index, 'total', val))}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold bg-muted">
                                    <TableCell>Basic Building Costs</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>{basicBuildingCostsTotal}</TableCell>
                                </TableRow>
                                {formData.unusualBuildingCosts.map((item: any, index: number) => (
                                    <TableRow key={`unusual-${index}`}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell colSpan={2}></TableCell>
                                        <TableCell>{renderCell(item.total, (val) => handleTableChange('unusualBuildingCosts', index, 'total', val))}</TableCell>
                                    </TableRow>
                                ))}
                                 <TableRow className="font-bold bg-muted">
                                    <TableCell>Unusual Building Costs</TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                    <TableCell>{unusualBuildingCostsTotal}</TableCell>
                                </TableRow>
                                 {formData.additionalBudgetItems.map((item: any, index: number) => (
                                    <TableRow key={`additional-${index}`}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell colSpan={2}></TableCell>
                                        <TableCell>{renderCell(item.total, (val) => handleTableChange('additionalBudgetItems', index, 'total', val))}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold bg-muted">
                                    <TableCell>Additional Budget Items</TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                    <TableCell>{additionalBudgetItemsTotal}</TableCell>
                                </TableRow>
                                <TableRow className="font-bold text-lg bg-primary/10">
                                    <TableCell>Sub-Total</TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                    <TableCell>{subTotal}</TableCell>
                                </TableRow>
                                {formData.ownersBudgetItems.map((item: any, index: number) => (
                                    <TableRow key={`owner-${index}`}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell colSpan={2}></TableCell>
                                        <TableCell>{renderCell(item.total, (val) => handleTableChange('ownersBudgetItems', index, 'total', val))}</TableCell>
                                    </TableRow>
                                ))}
                                 <TableRow className="font-bold bg-muted">
                                    <TableCell>Owner's Budget Items</TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                    <TableCell>{ownersBudgetItemsTotal}</TableCell>
                                </TableRow>
                                <TableRow className="font-bold text-xl bg-primary/20">
                                    <TableCell>TOTAL PROJECT BUDGET</TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                    <TableCell>{totalProjectBudget}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

  