'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ARCHITECTURAL_DRAWING_SCHEDULE_DOC_ID = 'architectural-drawing-schedule';

const initialDrawingData = {
    introduction: Array.from({ length: 10 }, (_, i) => ({ srNo: `AR-${String(i + 1).padStart(2, '0')}`, description: i === 0 ? "General Notes and Conditions" : (i === 1 ? "Survey Plan" : (i === 2 ? "Site Setting Drawings" : "")), startDate: '', endDate: '', remarks: '' })),
    workingLayout: Array.from({ length: 10 }, (_, i) => ({ srNo: `AR-${i + 11}`, description: i === 0 ? "Master Working Layout Plan" : (i === 1 ? "Working Layout Plan (Basement Floor)" : ""), startDate: '', endDate: '', remarks: '' })),
    elevationSection: Array.from({ length: 20 }, (_, i) => ({ srNo: `AR-${i + 21}`, description: "", startDate: '', endDate: '', remarks: '' })),
    doorsWindows: Array.from({ length: 40 }, (_, i) => ({ srNo: `AR-${i + 41}`, description: "", startDate: '', endDate: '', remarks: '' })),
};

export default function ArchitecturalDrawingsPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>(initialDrawingData);
    const [draftsmanName, setDraftsmanName] = useState("Mr. Adeel");
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/drawingSchedules/${ARCHITECTURAL_DRAWING_SCHEDULE_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    introduction: data.introduction || initialDrawingData.introduction,
                    workingLayout: data.workingLayout || initialDrawingData.workingLayout,
                    elevationSection: data.elevationSection || initialDrawingData.elevationSection,
                    doorsWindows: data.doorsWindows || initialDrawingData.doorsWindows,
                });
                setDraftsmanName(data.draftsmanName || "Mr. Adeel");
            } else {
                setFormData(initialDrawingData);
            }
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleDrawingChange = (listName: string, index: number, field: string, value: string) => {
        setFormData((prev: any) => {
            const newList = [...prev[listName]];
            newList[index] = { ...newList[index], [field]: value };
            return { ...prev, [listName]: newList };
        });
    };
    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        const dataToSave = {...formData, draftsmanName};
        setDoc(docRef, dataToSave, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Architectural drawings saved.' });
            setIsEditing(false);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageHeight = doc.internal.pageSize.height;
        let y = 40;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("ARCHITECTURAL DRAWINGS", doc.internal.pageSize.width / 2, y, { align: 'center' });
        y += 20;

        const addTable = (title: string, list: any[]) => {
            if (y > pageHeight - 100) {
                doc.addPage();
                y = 40;
            }
            autoTable(doc, {
                startY: y,
                head: [[{content: title, colSpan: 5, styles: {halign: 'center', fillColor: [30, 41, 59], textColor: 255}}]],
                body: [
                    ['Sr. no.', 'Description', 'Start Date', 'End Date', 'Remarks'],
                    ...list.map(item => [item.srNo, item.description, item.startDate, item.endDate, item.remarks])
                ],
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [70, 70, 70] },
                didDrawPage: (data) => {
                    y = data.cursor?.y || 0;
                }
            });
            y = (doc as any).lastAutoTable.finalY + 10;
        }

        addTable("Introduction (AR-01-AR-10)", formData.introduction);
        addTable("Working Layout Drawings (AR-11-AR-20)", formData.workingLayout);
        addTable("Elevation & Section Drawings (AR-21-AR-40)", formData.elevationSection);
        addTable("Doors & Windows Drawings (AR-41-AR-80)", formData.doorsWindows);

        doc.save('architectural-drawings.pdf');
    }

    const renderDrawingList = (listName: string, list: any[]) => (
        list.map((item, index) => (
             <TableRow key={`${listName}-${index}`}>
                <TableCell>{item.srNo}</TableCell>
                <TableCell>{isEditing ? <Input value={item.description} onChange={(e) => handleDrawingChange(listName, index, 'description', e.target.value)} /> : item.description}</TableCell>
                <TableCell>{isEditing ? <Input value={item.startDate} onChange={(e) => handleDrawingChange(listName, index, 'startDate', e.target.value)} /> : item.startDate}</TableCell>
                <TableCell>{isEditing ? <Input value={item.endDate} onChange={(e) => handleDrawingChange(listName, index, 'endDate', e.target.value)} /> : item.endDate}</TableCell>
                <TableCell>{isEditing ? <Input value={item.remarks} onChange={(e) => handleDrawingChange(listName, index, 'remarks', e.target.value)} /> : item.remarks}</TableCell>
            </TableRow>
        ))
    );
    
    if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>

    return (
    <main className="p-4 md:p-6 lg:p-8">
        <div className="mb-4">
            <Button variant="outline" asChild>
                <Link href="/drawings"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Drawings</Link>
            </Button>
        </div>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Architectural Drawings</CardTitle>
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
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="font-bold">Draftsman Name: </span>
                        {isEditing ? <Input className="inline-block w-auto" value={draftsmanName} onChange={(e) => setDraftsmanName(e.target.value)} /> : <span>{draftsmanName}</span>}
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/12">Sr. no.</TableHead>
                            <TableHead className="w-5/12">Description</TableHead>
                            <TableHead className="w-2/12">Start Date</TableHead>
                            <TableHead className="w-2/12">End Date</TableHead>
                            <TableHead className="w-2/12">Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Introduction (AR-01-AR-10)</TableCell></TableRow>
                        {renderDrawingList('introduction', formData.introduction)}
                        <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Working Layout Drawings (AR-11-AR-20)</TableCell></TableRow>
                        {renderDrawingList('workingLayout', formData.workingLayout)}
                        <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Elevation & Section Drawings (AR-21-AR-40)</TableCell></TableRow>
                        {renderDrawingList('elevationSection', formData.elevationSection)}
                        <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Doors & Windows Drawings (AR-41-AR-80)</TableCell></TableRow>
                        {renderDrawingList('doorsWindows', formData.doorsWindows)}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </main>
    );
};
