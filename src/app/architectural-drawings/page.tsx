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

const ARCH_DRAWING_SCHEDULE_DOC_ID = 'architectural-drawing-schedule';

const initialDrawingData = {
    introduction: ["General Notes and Conditions", "Survey Plan", "Site Setting Drawings", "", "", "", "", "ing", "", ""].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
    workingLayoutDrawings: ["Master Working Layout Plan", "Working Layout Plan(Basement Floor)", "Working Layout Plan(Ground Floor)", "Working Layout Plan(First Floor)", "Working Layout Plan(MezzanineFloor)", "Working Layout Plan(Roof Top)", "", "", "", ""].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
    elevationAndSectionDrawings: ["Front elevation", "Right Side Elevation", "Rear Side Elevation", "Left Side Elevation", "Section A-A", "Section B-B", "Section C-C", "Section D-D", "Parapet & Slab Sectional Details", "Lift Section", "Elevation Blow up Detail", "Exterior Wall Cladding Detail", "", "", "", "", "", "", "", ""].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
    doorsAndWindowsDrawings: ["Door & Window Schedule Plan (ground Floor)", "Door & Window Schedule Plan (First Floor)", "Door & Window Schedule Plan (Basement Floor)", "Door & Window Schedule Plan (Roof Top)", "Door Elevation Schedule", "Windows Elevation Schedule", "Door & Frame Details", "Window Sill and Header Details", "Window Blow up Detail", "Door Blow Up Detail", ...Array(30).fill('')].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
};

const DrawingList = ({ list, listName, handleDrawingChange, isEditing, title, serialPrefix }: { list: any[], listName: string, handleDrawingChange: any, isEditing: boolean, title: string, serialPrefix?: string }) => (
    <>
        <TableRow><TableCell colSpan={5} className="font-bold bg-muted">{title}</TableCell></TableRow>
        {list.map((item: any, i: number) => (
             <TableRow key={`${listName}-${i}`}>
                <TableCell>{serialPrefix ? `${serialPrefix}${String(i + 1).padStart(2, '0')}` : i + 1}</TableCell>
                <TableCell>
                    {isEditing ? <Input value={item.title} onChange={(e) => handleDrawingChange(listName, i, 'title', e.target.value)} /> : item.title}
                </TableCell>
                <TableCell>
                     {isEditing ? <Input value={item.startDate} onChange={(e) => handleDrawingChange(listName, i, 'startDate', e.target.value)} /> : item.startDate}
                </TableCell>
                <TableCell>
                     {isEditing ? <Input value={item.endDate} onChange={(e) => handleDrawingChange(listName, i, 'endDate', e.target.value)} /> : item.endDate}
                </TableCell>
                <TableCell>
                     {isEditing ? <Input value={item.remarks} onChange={(e) => handleDrawingChange(listName, i, 'remarks', e.target.value)} /> : item.remarks}
                </TableCell>
            </TableRow>
        ))}
    </>
);

export default function ArchitecturalDrawingsPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>(initialDrawingData);
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/drawingSchedules/${ARCH_DRAWING_SCHEDULE_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    ...initialDrawingData,
                    ...data,
                });
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
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Architectural drawings saved.' });
            setIsEditing(false);
        }).finally(() => setIsSaving(false));
    };
    
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
                    <Button variant="outline"><Download /> PDF</Button>
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
                <Table>
                    <TableHeader><TableRow><TableHead>Serial No.</TableHead><TableHead>Drawings Title</TableHead><TableHead>Starting Date</TableHead><TableHead>Completion Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <DrawingList list={formData.introduction} listName="introduction" handleDrawingChange={handleDrawingChange} isEditing={isEditing} title="Introduction (AR-01-AR-10)" serialPrefix="AR-" />
                        <DrawingList list={formData.workingLayoutDrawings} listName="workingLayoutDrawings" handleDrawingChange={handleDrawingChange} isEditing={isEditing} title="Working Layout Drawings (AR-11-AR-20)" serialPrefix="AR-" />
                        <DrawingList list={formData.elevationAndSectionDrawings} listName="elevationAndSectionDrawings" handleDrawingChange={handleDrawingChange} isEditing={isEditing} title="Elevation & Section Drawings (AR-21-AR-40)" serialPrefix="AR-" />
                        <DrawingList list={formData.doorsAndWindowsDrawings} listName="doorsAndWindowsDrawings" handleDrawingChange={handleDrawingChange} isEditing={isEditing} title="Doors & Windows Drawings (AR-41-AR-80)" serialPrefix="AR-" />
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </main>
    );
};
