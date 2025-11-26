
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SUB_CONSULTANT_LIST_DOC_ID = 'sub-consultant-list';

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
        <label className="font-semibold">{label}:</label>
        {children}
    </div>
);

export default function SubConsultantListPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({ rows: Array(15).fill({}).map((_, i) => ({ id: i })) });

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/subConsultantList/${SUB_CONSULTANT_LIST_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormData(docSnap.data());
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const { name, value } = e.target;
        if (index !== undefined) {
            const newRows = [...formData.rows];
            newRows[index] = { ...newRows[index], [name]: value };
            setFormData(prev => ({ ...prev, rows: newRows }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Sub-consultant list saved." });
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
        doc.text("List Of Sub consultants", 105, 15, {align: 'center'});
        autoTable(doc, {
            startY: 25,
            html: '#subconsultants-table',
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        })
        doc.save("sub-consultant-list.pdf");
        toast({ title: 'Download Started' });
    }

    const renderCell = (name: string, index: number) => {
        const value = formData.rows[index]?.[name] || '';
        return isEditing ? <Input name={name} value={value} onChange={e => handleInputChange(e, index)} /> : <p className="p-1">{value}</p>;
    };

    const renderHeaderField = (name: string) => {
        return isEditing ? <Input name={name} value={formData[name] || ''} onChange={handleInputChange} /> : <div className="p-1 border-b min-h-[24px]">{formData[name]}</div>;
    }

    if (isLoading || isUserLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin"/> Loading...</div>

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>List Of Sub consultants</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                        {isEditing ? <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <div id="subconsultants-table" className="space-y-4">
                        <FormField label="Project">{renderHeaderField('project')}</FormField>
                        <FormField label="Architect">{renderHeaderField('architect')}</FormField>
                        <FormField label="Architects Project No">{renderHeaderField('architectsProjectNo')}</FormField>
                        <FormField label="Date">{renderHeaderField('date')}</FormField>
                        <div className="border p-2 rounded mt-4">To: (Consultant) {renderHeaderField('toConsultant')}</div>
                        <p className="my-4">List Sub-Consultants and others proposed to be employed on the above Project as required by the bidding documents. (To be filled out by the Contractor and returned to the Architect.)</p>
                        <Table>
                            <TableHeader><TableRow><TableHead>Work</TableHead><TableHead>Firm</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead>Representative</TableHead></TableRow></TableHeader>
                            <TableBody>{formData.rows.map((row: any, i:number)=><TableRow key={row.id}>
                                <TableCell>{renderCell('work', i)}</TableCell>
                                <TableCell>{renderCell('firm', i)}</TableCell>
                                <TableCell>{renderCell('address', i)}</TableCell>
                                <TableCell>{renderCell('phone', i)}</TableCell>
                                <TableCell>{renderCell('representative', i)}</TableCell>
                            </TableRow>)}</TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
