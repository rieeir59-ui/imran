
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DRAWING_SCHEDULE_DOC_ID = 'drawing-schedule';

const FormField = ({ label, children, isEditing, value, onChange, name }: { label: string, children?: React.ReactNode, isEditing?: boolean, value?: string, onChange?: (e: any) => void, name?: string }) => (
    <div className="flex flex-col space-y-1">
        <span className="font-semibold text-sm">{label}:</span>
        {isEditing ? (
            <Input name={name} value={value || ''} onChange={onChange} />
        ) : children ? children : (
             <div className="border-b min-h-[24px] py-1">{value || ''}</div>
        )}
    </div>
);

const DrawingsList = React.memo(({ formData, handleInputChange, isEditing, setFormData }: { formData: any, handleInputChange: any, isEditing: boolean, setFormData: any }) => {

    const handleDrawingChange = (listName: string, index: number, field: string, value: string) => {
        setFormData((prev: any) => {
            const newList = [...prev[listName]];
            newList[index] = { ...newList[index], [field]: value };
            return { ...prev, [listName]: newList };
        });
    };
    
    const renderDrawingRow = (item: any, listName: string, index: number, serial: number | string) => {
        return (
            <TableRow key={`${listName}-${index}`}>
                <TableCell>{serial}</TableCell>
                <TableCell>
                    {isEditing ? (
                        <Input 
                            value={item.title} 
                            onChange={(e) => handleDrawingChange(listName, index, 'title', e.target.value)}
                        />
                    ) : item.title}
                </TableCell>
                <TableCell>
                     {isEditing ? (
                        <Input 
                            value={item.startDate} 
                            onChange={(e) => handleDrawingChange(listName, index, 'startDate', e.target.value)}
                        />
                    ) : item.startDate}
                </TableCell>
                <TableCell>
                     {isEditing ? (
                        <Input 
                            value={item.endDate} 
                            onChange={(e) => handleDrawingChange(listName, index, 'endDate', e.target.value)}
                        />
                    ) : item.endDate}
                </TableCell>
                <TableCell>
                     {isEditing ? (
                        <Input 
                            value={item.remarks} 
                            onChange={(e) => handleDrawingChange(listName, index, 'remarks', e.target.value)}
                        />
                    ) : item.remarks}
                </TableCell>
            </TableRow>
        )
    };

    const renderField = (name: string, isHeader = false) => {
        const value = isHeader ? formData[name] : formData[name];
        return isEditing ? <Input name={name} value={value || ''} onChange={handleInputChange} /> : <div className="border-b min-h-[24px] py-1">{value || ''}</div>;
    }
    
    return (
        <div className="space-y-6">
            <FormField label="Project" >{renderField('project', true)}</FormField>
            <div className="grid grid-cols-2 gap-4">
                <FormField label="(Name, Address)" >{renderField('nameAddress', true)}</FormField>
                <FormField label="Architects Project No" >{renderField('architectProjectNo', true)}</FormField>
                <FormField label="Date" >{renderField('date', true)}</FormField>
                <FormField label="Contract Date">{renderField('contractDate', true)}</FormField>
            </div>
            <FormField label="Project Incharge" >{renderField('projectIncharge', true)}</FormField>

            <Table>
                <TableHeader><TableRow><TableHead>Serial No.</TableHead><TableHead>Drawings Title</TableHead><TableHead>Starting Date</TableHead><TableHead>Completion Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                <TableBody>
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Architectural Drawings</TableCell></TableRow>
                    {formData.architecturalDrawings?.map((item: any, i: number) => renderDrawingRow(item, 'architecturalDrawings', i, i + 1))}
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Details</TableCell></TableRow>
                    {formData.details?.map((item: any, i: number) => renderDrawingRow(item, 'details', i, i + 1 + (formData.architecturalDrawings?.length || 0)))}
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Structure Drawings</TableCell></TableRow>
                    {formData.structureDrawings?.map((item: any, i: number) => renderDrawingRow(item, 'structureDrawings', i, i + 1 + (formData.architecturalDrawings?.length || 0) + (formData.details?.length || 0)))}
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Plumbing Drawings</TableCell></TableRow>
                    {formData.plumbingDrawings?.map((item: any, i: number) => renderDrawingRow(item, 'plumbingDrawings', i, i + 1 + (formData.architecturalDrawings?.length || 0) + (formData.details?.length || 0) + (formData.structureDrawings?.length || 0)))}
                    <TableRow><TableCell colSpan={5} className="font-bold bg-muted">Electrification Drawings</TableCell></TableRow>
                    {formData.electrificationDrawings?.map((item: any, i: number) => renderDrawingRow(item, 'electrificationDrawings', i, i + 1 + (formData.architecturalDrawings?.length || 0) + (formData.details?.length || 0) + (formData.structureDrawings?.length || 0) + (formData.plumbingDrawings?.length || 0)))}
                </TableBody>
            </Table>
        </div>
    );
});
DrawingsList.displayName = 'DrawingsList';


export default function DrawingsPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({
        architecturalDrawings: [],
        details: [],
        structureDrawings: [],
        plumbingDrawings: [],
        electrificationDrawings: []
    });
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/drawingSchedules/${DRAWING_SCHEDULE_DOC_ID}`);
    }, [user, firestore]);
    
    const initialDrawingData = {
        architecturalDrawings: ["Submission Drawings", "Demolition Plan", "Excavation Plan", "Site Plan", "Basement Plan", "Ground Floor Plan", "First Floor Plan", "Second Floor Plan", "Roof Plan", "Section A", "Section B", "Section C", "Elevation 1", "Elevation 2", "Elevation 3", "Elevation 4"].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
        details: ["Baths Details", "Doors Details", "Floors Details", "Entrance Detail", "Stair Detail"].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
        structureDrawings: ["Foundation Plan", "Floor Farming Plan", "Ground Floor Slab", "First Floor Slab", "Second Floor Slab", "Wall elev & slab sec.", "Wall sec & details", "Stairs", "Schedules", "Space of Concrete"].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
        plumbingDrawings: ["Sewarge Systems", "Water Supply & Gas Systems", "Detail of Sewrage Appurtunances", "Detail of Sokage Pit", "Detail of Soptik Tank", "Detail of Overhead Water Tank", "Detail of Underground Water Tank", "Legend & General Notes"].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
        electrificationDrawings: ["lllumination Layout Plans", "Power Layout Plans", "Legend & General Notes"].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
    };

    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    ...data,
                    architecturalDrawings: data.architecturalDrawings || initialDrawingData.architecturalDrawings,
                    details: data.details || initialDrawingData.details,
                    structureDrawings: data.structureDrawings || initialDrawingData.structureDrawings,
                    plumbingDrawings: data.plumbingDrawings || initialDrawingData.plumbingDrawings,
                    electrificationDrawings: data.electrificationDrawings || initialDrawingData.electrificationDrawings,
                });
            } else {
                setFormData(initialDrawingData);
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Drawing schedule saved.' });
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
        doc.text("Drawings (Architectural / Interiors / submission)", 105, 15, { align: 'center' });
        
        autoTable(doc, {
          startY: 25,
          html: '#drawings-table',
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59] }
        })

        doc.save("drawings.pdf");
        toast({ title: "Download Started", description: "PDF generation is in progress." });
    };

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
                <CardTitle>Drawings (Architectural / Interiors / submission)</CardTitle>
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
                <div id="drawings-table">
                    <DrawingsList formData={formData} handleInputChange={handleInputChange} isEditing={isEditing} setFormData={setFormData} />
                </div>
            </CardContent>
        </Card>
    </main>
    );
};
