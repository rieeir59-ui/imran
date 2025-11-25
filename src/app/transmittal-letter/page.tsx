
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

const TRANSMITTAL_LETTER_DOC_ID = 'transmittal-letter';

const FormField = ({ label, children, className }: { label?: string, children: React.ReactNode, className?: string }) => (
    <div className={className}>
        {label && <label className="font-semibold text-sm mb-1 block">{label}</label>}
        {children}
    </div>
);

const initialItems = () => Array(5).fill({}).map((_, i) => ({ id: i, copies: '', date: '', revNo: '', description: '', actionCode: '' }));

export default function TransmittalLetterPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ items: initialItems() });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/transmittalLetters/${TRANSMITTAL_LETTER_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                 const data = docSnap.data();
                 setFormData({ ...data, items: data.items && data.items.length > 0 ? data.items : initialItems() });
            } else {
                setFormData({ items: initialItems() });
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    const handleRadioChange = (name: string, value: string) => setFormData(prev => ({...prev, [name]: value}));
    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
        if (typeof checked === 'boolean') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        }
    };
    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({...prev, items: newItems}));
    }

    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Transmittal Letter saved." });
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
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Transmittal Letter", 105, 15, { align: 'center'});
        autoTable(doc, {
            startY: 25,
            html: '#transmittal-letter-table',
            theme: 'plain',
        });
        doc.save("transmittal-letter.pdf");
        toast({ title: 'Download Started' });
    }

    const renderField = (name: string, placeholder?: string, as?: 'textarea') => {
        const value = formData[name] || '';
        if (isEditing) {
            if (as === 'textarea') {
                return <Textarea name={name} value={value} onChange={handleInputChange} placeholder={placeholder}/>
            }
            return <Input name={name} value={value} onChange={handleInputChange} placeholder={placeholder}/>
        }
        return <div className="p-1 border-b min-h-[24px] whitespace-pre-wrap">{value}</div>
    }
    
    const renderCheckbox = (name: string, label: string) => (
        <div className="flex items-center space-x-2">
            <Checkbox id={name} name={name} checked={formData[name] || false} onCheckedChange={(checked) => handleCheckboxChange(name, checked)} disabled={!isEditing}/>
            <Label htmlFor={name} className="font-normal">{label}</Label>
        </div>
    );
    
    const renderRadio = (name: string, value: string, label?: string) => (
         <div className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={`${name}-${value}`} />
            {label && <Label htmlFor={`${name}-${value}`} className="font-normal">{label}</Label>}
        </div>
    )

    if(isLoading || isUserLoading) return <div className="p-4 flex justify-center items-center"><Loader2 className="animate-spin"/> Loading...</div>

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-col items-center justify-between">
                    <CardTitle className="text-2xl">ISBAH HASSAN & ASSOCIATES</CardTitle>
                    <p className="text-sm text-muted-foreground">ARCHITECTS - ENGINEERS - REAL ESTATE - CONTRACTORS - DEVELOPERS</p>
                    <Separator className="w-full my-2"/>
                    <h2 className="text-xl font-bold">TRANSMITTAL LETTER</h2>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4" id="transmittal-letter-table">
                       <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                           <FormField label="Project: (Name, Address)">{renderField('project_name_address')}</FormField>
                           <FormField label="Architect">{renderField('architect')}</FormField>
                           <FormField label="To:">{renderField('to_address', undefined, 'textarea')}</FormField>
                           <div>
                               <FormField label="Project No:">{renderField('project_no')}</FormField>
                               <FormField label="Date:">{renderField('date')}</FormField>
                           </div>
                           <FormField label="Attn:">{renderField('attn')}</FormField>
                           <div className="border p-2 rounded-md">
                                <p className="text-sm font-medium">If Enclosures are not as noted, Please Inform us immediately.</p>
                                <p className="text-sm font-medium mt-1">If checked below, please:</p>
                                {renderCheckbox('ack_receipt', 'Acknowledge Receipt of Enclosures.')}
                                {renderCheckbox('return_enclosures', 'Return Enclosures to us.')}
                           </div>
                       </div>
                       
                        <RadioGroup name="transmit_method" value={formData.transmit_method} onValueChange={(v) => handleRadioChange('transmit_method', v)} className="space-y-1" disabled={!isEditing}>
                           <Label className="font-bold">We Transmit:</Label>
                           <div className="flex items-center gap-2">{renderRadio('transmit_method', 'herewith', 'herewith')} {renderRadio('transmit_method', 'separate', 'under separate cover via')} {renderField('separate_via')}</div>
                           <div className="flex items-center gap-2">{renderRadio('transmit_method', 'request', 'in accordance with your request')}</div>
                        </RadioGroup>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label className="font-bold">For Your:</Label>
                                {renderCheckbox('for_approval', 'approval')}
                                {renderCheckbox('for_review', 'review & comment')}
                                {renderCheckbox('for_use', 'use')}
                            </div>
                            <div>
                                <Label className="font-bold">&nbsp;</Label>
                                {renderCheckbox('for_distribution', 'distribution to parties')}
                                {renderCheckbox('for_record', 'record')}
                                {renderCheckbox('for_info', 'information')}
                            </div>
                        </div>

                         <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label className="font-bold">The Following:</Label>
                                {renderCheckbox('following_drawings', 'Drawings')}
                                {renderCheckbox('following_specs', 'Specifications')}
                                {renderCheckbox('following_co', 'Change Order')}
                            </div>
                            <div>
                                <Label className="font-bold">&nbsp;</Label>
                                {renderCheckbox('following_prints', 'Shop Drawing Prints')}
                                {renderCheckbox('following_repro', 'Shop Drawing Reproducible')}
                            </div>
                            <div>
                                <Label className="font-bold">&nbsp;</Label>
                                {renderCheckbox('following_samples', 'Samples')}
                                {renderCheckbox('following_literature', 'Product Literature')}
                            </div>
                        </div>

                        <Table>
                            <TableHeader><TableRow><TableHead>Copies</TableHead><TableHead>Date</TableHead><TableHead>Rev. No.</TableHead><TableHead>Description</TableHead><TableHead>Action Code</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {formData.items?.map((item: any, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{isEditing ? <Input value={item.copies} onChange={e=>handleItemChange(index, 'copies', e.target.value)} /> : item.copies}</TableCell>
                                        <TableCell>{isEditing ? <Input type="date" value={item.date} onChange={e=>handleItemChange(index, 'date', e.target.value)} /> : item.date}</TableCell>
                                        <TableCell>{isEditing ? <Input value={item.revNo} onChange={e=>handleItemChange(index, 'revNo', e.target.value)} /> : item.revNo}</TableCell>
                                        <TableCell>{isEditing ? <Input value={item.description} onChange={e=>handleItemChange(index, 'description', e.target.value)} /> : item.description}</TableCell>
                                        <TableCell>{isEditing ? <Input value={item.actionCode} onChange={e=>handleItemChange(index, 'actionCode', e.target.value)} /> : item.actionCode}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div>
                            <p className="font-bold">Action Code</p>
                            <div className="grid grid-cols-2 text-sm">
                                <div>
                                    <p>A. Action indicated on item transmitted</p>
                                    <p>B. No action required</p>
                                    <p>C. For signature and return to this office</p>
                                </div>
                                 <div>
                                    <p>D. For signature and forwarding as noted below under REMARKS</p>
                                    <p>E. See REMARKS below</p>
                                </div>
                            </div>
                        </div>

                        <FormField label="Remarks:">{renderField('remarks', undefined, 'textarea')}</FormField>
                        
                        <div className="flex justify-between items-end">
                            <FormField label="Copies To:">{renderField('copies_to')}</FormField>
                            <FormField label="Received By:">{renderField('received_by')}</FormField>
                        </div>
                         <Separator />
                         <p className="text-center text-xs text-muted-foreground">101, Y-Block, Commercial, Defence, Lahore, Pakistan. 92-42-35692789-90 92-42-35692791 info@isbahhassan.com www.isbahhassan.com</p>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
