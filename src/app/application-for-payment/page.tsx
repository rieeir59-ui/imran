
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


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
    const [formData, setFormData] = useState<any>({
        changeOrdersPrevious: { additions: '', deduction: '', total: '' },
        changeOrdersThisMonth: Array(2).fill({ number: '', dateApproved: '' }),
    });

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
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    ...data,
                    changeOrdersPrevious: data.changeOrdersPrevious || { additions: '', deduction: '', total: '' },
                    changeOrdersThisMonth: data.changeOrdersThisMonth && data.changeOrdersThisMonth.length > 0 ? data.changeOrdersThisMonth : Array(2).fill({ number: '', dateApproved: '' }),
                });
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
    
    const handleTableChange = (section: string, index: number, field: string, value: string) => {
        const newSectionData = [...(formData[section] || [])];
        newSectionData[index] = { ...newSectionData[index], [field]: value };
        setFormData(prev => ({ ...prev, [section]: newSectionData }));
    }

    const handleNestedChange = (section: string, field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...(prev[section] || {}),
                [field]: value
            }
        }));
    }
    
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
        doc.text("APPLICATION AND CERTIFICATE FOR PAYMENT", 105, 15, { align: 'center'});
        
        let y = 25;
        doc.setFontSize(9);

        // Header Table
        autoTable(doc, {
            startY: y,
            body: [
                [
                    { content: `To (Owner): ${formData.owner || ''}\nFrom (Contractor): ${formData.from_contractor || ''}\nContract For: ${formData.contract_for || ''}`, styles: { cellWidth: 90 } },
                    { content: `Project: ${formData.project || ''}\nVIA (Architect): ${formData.via_architect || ''}\n\nApplication Number: ${formData.applicationNumber || ''}\nPeriod To: ${formData.periodTo || ''}\nArchitect's Project No: ${formData.architectsProjectNo || ''}\nContract Date: ${formData.contractDate || ''}`, styles: { cellWidth: 90 } }
                ]
            ],
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1 },
        });
        y = (doc as any).lastAutoTable.finalY + 5;

        // Contractor's Application for Payment Section
        const contractorAppBody = [
            [{ content: "Change Order Summary", colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } }],
            ['Change Orders approved in previous monthly by Owner', formData.changeOrdersPrevious?.additions || '', formData.changeOrdersPrevious?.deduction || ''],
            [{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, { content: formData.changeOrdersPrevious?.total || '', colSpan: 2 }],
            ['Approved this Month', { content: 'Number', styles: { fontStyle: 'bold' } }, { content: 'Date Approved', styles: { fontStyle: 'bold' } }],
            ...(formData.changeOrdersThisMonth || []).map((item: any) => ['', item.number, item.dateApproved]),
            [{ content: 'TOTALS', styles: { fontStyle: 'bold' } }, { content: formData.change_order_totals || '', colSpan: 2 }],
            ['Net change by Change Orders', { content: formData.net_change_by_change_orders || '', colSpan: 2 }],
        ];

        autoTable(doc, {
            body: [
                [
                    { content: "Contractor's Application for Payment:", styles: { fontStyle: 'bold' } },
                    { content: "Application is made for Payment, as shown below, in connection with the Contract. Continuation Sheet, is attached.", styles: { fontSize: 8 } }
                ]
            ],
            startY: y,
            theme: 'plain'
        });

        y = (doc as any).lastAutoTable.finalY;

        const rightColumnY = y;
        
        autoTable(doc, {
            body: contractorAppBody,
            startY: y,
            theme: 'grid',
            columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 20 }, 2: { cellWidth: 20 } },
        });

        let leftY = (doc as any).lastAutoTable.finalY + 2;

        const certificationText = "The undersigned Contractor certifies that the best of the Contractor's knowledge, information and belief the Work covered by this Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractor for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.";
        const splitText = doc.splitTextToSize(certificationText, 90);
        doc.setFontSize(8);
        doc.text(splitText, 14, leftY);
        leftY += (splitText.length * 3) + 5;
        doc.setFontSize(9);
        doc.text(`Contractor: ${formData.cmName || ''}`, 14, leftY);
        leftY += 7;
        doc.text(`By: ${formData.cmBy || ''}`, 14, leftY);
        doc.text(`Date: ${formData.cmDate || ''}`, 50, leftY);
        leftY += 7;
        doc.text(`State of: ${formData.cmState || ''}`, 14, leftY);
        doc.text(`County of: ${formData.cmCounty || ''}`, 50, leftY);
        leftY += 7;
        doc.text(`Subscribed and sworn to before me this ${formData.swornDay || ''} Day of: ${formData.swornMonth || ''} 20${formData.swornYear || ''}`, 14, leftY, {maxWidth: 90});
        leftY += 7;
        doc.text(`Notary Public: ${formData.notaryPublic || ''}`, 14, leftY);
        leftY += 7;
        doc.text(`My Commission expires: ${formData.commissionExpires || ''}`, 14, leftY);

        // Payment Summary on the right
        const paymentSummaryBody = [
            ['1. Original Contract Sum', formData.originalContractSum || ''],
            ['2. Total Net Changes by Change Order', formData.netChanges || ''],
            ['3. Total Contract Sum to Date (Line 1 ± 2)', formData.contractSumToDate || ''],
            ['4. Total Completed & Stored to Date', formData.totalCompletedStored || ''],
            ['   (Column G of Continuation Sheet)', ''],
            ['5. Retainage:', ''],
            ['   a. ___% of Completed Works', formData.retainage_completed || ''],
            ['      (Column D+E of Continuation Sheet)', ''],
            ['   b. ___% of Stored Material', formData.retainage_stored || ''],
            ['      (Column F of Continuation Sheet)', ''],
            ['   Total Retainage (Line 5a+5b)', formData.retainage_total || ''],
            ['6. Total Earned Less Retainage (Line 4 Less 5 Total)', formData.totalEarnedLessRetainage || ''],
            ['7. Less Previous Certificates for Payments (Line 6)', formData.lessPreviousCerts || ''],
            ['8. Current Payment Due', formData.currentPaymentDue || ''],
            ['9. Balance to Finish, Plus Retainage (Line 3 Less 6)', formData.balanceToFinish || ''],
        ];

        autoTable(doc, {
            body: paymentSummaryBody,
            startY: rightColumnY,
            theme: 'grid',
            tableWidth: 90,
            columnStyles: { 1: { halign: 'right' } },
            margin: { left: 108 },
        });

        y = Math.max(leftY, (doc as any).lastAutoTable.finalY) + 10;
        
        doc.setLineWidth(0.5);
        doc.line(14, y, 200, y);
        y+=5;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Architect's Project Certificate for Payment:", 14, y);
        y+=5;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const architectCertText = "In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.";
        const splitArchitectText = doc.splitTextToSize(architectCertText, 90);
        doc.text(splitArchitectText, 14, y);

        const rightCertY = y;
        doc.setFontSize(9);
        doc.text(`Amounts Certified: ${formData.totalCertified || ''}`, 108, rightCertY);
        doc.setFontSize(8);
        doc.text('(Attach explanation if amount certified differs from the amount applies for.)', 108, rightCertY + 5);
        y += (splitArchitectText.length * 3) + 10;

        doc.text(`Architect: ${formData.architectName || ''}`, 14, y);
        y+=7;
        doc.text(`By: ${formData.architectBy || ''}`, 14, y);
        doc.text(`Date: ${formData.architectDate || ''}`, 50, y);

        const finalNoteText = "This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable only to the Contractors named herein. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.";
        const splitFinalNote = doc.splitTextToSize(finalNoteText, 90);
        doc.text(splitFinalNote, 108, y);


        doc.save("application-for-payment.pdf");
    };

    const renderField = (name: string) => {
        const value = formData[name] || '';
        return isEditing ? <Input name={name} value={value} onChange={handleInputChange} /> : <div className="p-1 border-b min-h-[24px]">{value}</div>;
    }

    const renderNestedField = (section: string, field: string) => {
         const value = formData[section]?.[field] || '';
        return isEditing ? <Input name={`${section}.${field}`} value={value} onChange={e => handleNestedChange(section, field, e.target.value)} /> : <div className="p-1 border-b min-h-[24px]">{value}</div>;
    }

    const renderTableCell = (section: string, index: number, field: string) => {
        const value = formData[section]?.[index]?.[field] || '';
        return isEditing ? <Input name={`${section}.${index}.${field}`} value={value} onChange={e => handleTableChange(section, index, field, e.target.value)} /> : <div className="p-1 min-h-[24px]">{value}</div>;
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
                        <div className="grid grid-cols-2 gap-4 border-b pb-4">
                            <div className="space-y-2">
                                <FormField label="To (Owner):">{renderField('owner')}</FormField>
                                <FormField label="From (Contractor):">{renderField('from_contractor')}</FormField>
                                <FormField label="Contract For:">{renderField('contract_for')}</FormField>
                            </div>
                            <div className="space-y-2">
                                <FormField label="Project:">{renderField('project')}</FormField>
                                <FormField label="VIA (Architect):">{renderField('via_architect')}</FormField>
                                 <div className="pt-6 grid grid-cols-2 gap-4">
                                     <div>
                                        <FormField label="Application Number:">{renderField('applicationNumber')}</FormField>
                                        <FormField label="Period To:">{renderField('periodTo')}</FormField>
                                        <FormField label="Architect's Project No:">{renderField('architectsProjectNo')}</FormField>
                                        <FormField label="Contract Date:">{renderField('contractDate')}</FormField>
                                     </div>
                                     <div>
                                        <Label>Distributed to:</Label>
                                        {renderCheckbox('dist_owner', 'Owner')}
                                        {renderCheckbox('dist_architect', 'Architect')}
                                        {renderCheckbox('dist_contractor', 'Contractor')}
                                        {renderCheckbox('dist_others', 'Others')}
                                    </div>
                                 </div>
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-8 mt-4">
                            <div>
                                <h4 className="font-bold text-center border-b pb-2">Contractor's Application for Payment:</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow><TableHead colSpan={3} className="text-center font-bold">Change Order Summary</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Change Orders approved in previous monthly by Owner</TableCell>
                                            <TableCell>{renderNestedField('changeOrdersPrevious', 'additions')}</TableCell>
                                            <TableCell>{renderNestedField('changeOrdersPrevious', 'deduction')}</TableCell>
                                        </TableRow>
                                        <TableRow className="font-bold bg-muted/50">
                                            <TableCell>TOTAL</TableCell>
                                            <TableCell colSpan={2}>{renderNestedField('changeOrdersPrevious', 'total')}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <p className="font-bold">Approved this Month</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>Number</div>
                                                    <div>Date Approved</div>
                                                     {formData.changeOrdersThisMonth?.map((item: any, index: number) => (
                                                        <React.Fragment key={index}>
                                                            <div>{renderTableCell('changeOrdersThisMonth', index, 'number')}</div>
                                                            <div>{renderTableCell('changeOrdersThisMonth', index, 'dateApproved')}</div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                         <TableRow className="font-bold bg-muted/50">
                                            <TableCell>TOTALS</TableCell>
                                            <TableCell colSpan={2}>{renderField('change_order_totals')}</TableCell>
                                        </TableRow>
                                         <TableRow>
                                            <TableCell>Net change by Change Orders</TableCell>
                                            <TableCell colSpan={2}>{renderField('net_change_by_change_orders')}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                <div className="text-xs my-2">The undersigned Contractor certifies that the best of the Contractor's knowledge, information and belief the Work covered by this Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractor for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.</div>
                                <FormField label="Contractor:">{renderField('cmName')}</FormField>
                                <div className="flex gap-4 mt-4">
                                    <FormField label="By:">{renderField('cmBy')}</FormField>
                                    <FormField label="Date:">{renderField('cmDate')}</FormField>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <FormField label="State of:">{renderField('cmState')}</FormField>
                                    <FormField label="County of:">{renderField('cmCounty')}</FormField>
                                </div>
                                <div className="text-xs my-2">Subscribed and sworn to before me this {isEditing ? <Input name="swornDay" value={formData.swornDay || ''} onChange={handleInputChange} className="inline w-16"/> : <span>{formData.swornDay || '___'}</span>} Day of: {isEditing ? <Input name="swornMonth" value={formData.swornMonth || ''} onChange={handleInputChange} className="inline w-24"/> : <span>{formData.swornMonth || '______'}</span>} 20{isEditing ? <Input name="swornYear" value={formData.swornYear || ''} onChange={handleInputChange} className="inline w-12"/> : <span>{formData.swornYear || '__'}</span>}</div>
                                <FormField label="Notary Public:">{renderField('notaryPublic')}</FormField>
                                <FormField label="My Commission expires:">{renderField('commissionExpires')}</FormField>
                            </div>
                            <div className="pt-12">
                                <div className="text-xs">Application is made for Payment, as shown below, in connection with the Contract. Continuation Sheet, is attached.</div>
                                <div className="space-y-2 mt-4">
                                    <div className="flex justify-between items-center"><Label>1. Original Contract Sum</Label>{renderField('originalContractSum')}</div>
                                    <div className="flex justify-between items-center"><Label>2. Total Net Changes by Change Order</Label>{renderField('netChanges')}</div>
                                    <div className="flex justify-between items-center"><Label>3. Total Contract Sum to Date (Line 1 ± 2)</Label>{renderField('contractSumToDate')}</div>
                                    <div className="flex justify-between items-center"><Label>4. Total Completed & Stored to Date</Label>{renderField('totalCompletedStored')}</div>
                                    <div className="text-xs">(Column G of Continuation Sheet)</div>
                                    <div className="pl-4">
                                        <Label>5. Retainage:</Label>
                                        <div className="flex items-center gap-2"><Label className="w-1/2">a. ___% of Completed Works</Label>{renderField('retainage_completed')}</div>
                                        <div className="text-xs">(Column D+E of Continuation Sheet)</div>
                                        <div className="flex items-center gap-2"><Label className="w-1/2">b. ___% of Stored Material</Label>{renderField('retainage_stored')}</div>
                                        <div className="text-xs">(Column F of Continuation Sheet)</div>
                                        <div className="flex justify-between items-center"><Label>Total Retainage (Line 5a+5b) or Total in Column I of Continuation Sheet</Label>{renderField('retainage_total')}</div>
                                    </div>
                                    <div className="flex justify-between items-center"><Label>6. Total Earned Less Retainage (Line 4 Less 5 Total)</Label>{renderField('totalEarnedLessRetainage')}</div>
                                    <div className="flex justify-between items-center"><Label>7. Less Previous Certificates for Payments (Line 6)</Label>{renderField('lessPreviousCerts')}</div>
                                    <div className="flex justify-between items-center"><Label>8. Current Payment Due</Label>{renderField('currentPaymentDue')}</div>
                                    <div className="flex justify-between items-center"><Label>9. Balance to Finish, Plus Retainage (Line 3 Less 6)</Label>{renderField('balanceToFinish')}</div>
                                </div>
                            </div>
                        </div>

                         <div className="mt-4 pt-4 border-t">
                            <h4 className="font-bold">Architect's Project Certificate for Payment:</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="text-xs my-2">In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.</div>
                                <div>
                                    <FormField label="Amounts Certified:">{renderField('totalCertified')}</FormField>
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
                                <div className="text-xs mt-2">This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable on to the Contractors named herein. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
