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

const SAMPLE_LIST_DOC_ID = 'sample-list-of-drawings';

const initialDrawingData = {
    draftsmanName: "Mr. Adeel",
    introduction: [
        { srNo: "AR-01", description: "General Notes and Conditions" },
        { srNo: "AR-02", description: "Survey Plan" },
        { srNo: "AR-03", description: "Site Setting Drawings" },
        { srNo: "AR-04", description: "" },
        { srNo: "AR-05", description: "" },
        { srNo: "AR-06", description: "" },
        { srNo: "AR-07", description: "" },
        { srNo: "AR-08", description: "ing" },
        { srNo: "AR-09", description: "" },
        { srNo: "AR-10", description: "" },
    ].map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
    workingLayoutDrawings: [
        { srNo: "AR-11", description: "Master Working Layout Plan" },
        { srNo: "AR-12", description: "Working Layout Plan (Basement Floor)" },
        { srNo: "AR-13", description: "Working Layout Plan (Ground Floor)" },
        { srNo: "AR-14", description: "Working Layout Plan (First Floor)" },
        { srNo: "AR-15", description: "Working Layout Plan (Mezzanine Floor)" },
        { srNo: "AR-16", description: "Working Layout Plan (Roof Top)" },
        { srNo: "AR-17", description: "" },
        { srNo: "AR-18", description: "" },
        { srNo: "AR-19", description: "" },
        { srNo: "AR-20", description: "" },
    ].map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
    elevationAndSectionDrawings: [
        { srNo: "AR-21", description: "Front elevation" },
        { srNo: "AR-22", description: "Right Side Elevation" },
        { srNo: "AR-23", description: "Rear Side Elevation" },
        { srNo: "AR-24", description: "Left Side Elevation" },
        { srNo: "AR-25", description: "Section A-A" },
        { srNo: "AR-26", description: "Section B-B" },
        { srNo: "AR-27", description: "Section C-C" },
        { srNo: "AR-28", description: "Section D-D" },
        { srNo: "AR-29", description: "Parapet & Slab Sectional Details" },
        { srNo: "AR-30", description: "Lift Section" },
        { srNo: "AR-31", description: "Elevation Blow up Detail" },
        { srNo: "AR-32", description: "Exterior Wall Cladding Detail" },
        ...Array.from({ length: 8 }, (_, i) => ({ srNo: `AR-${33 + i}`, description: "" }))
    ].map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
    doorsAndWindowsDrawings: [
        { srNo: "AR-41", description: "Door & Window Schedule Plan (ground Floor)" },
        { srNo: "AR-42", description: "Door & Window Schedule Plan (First Floor)" },
        { srNo: "AR-43", description: "Door & Window Schedule Plan (Basement Floor)" },
        { srNo: "AR-44", description: "Door & Window Schedule Plan (Roof Top)" },
        { srNo: "AR-45", description: "Door Elevation Schedule" },
        { srNo: "AR-46", description: "Windows Elevation Schedule" },
        { srNo: "AR-47", description: "Door & Frame Details" },
        { srNo: "AR-48", description: "Window Sill and Header Details" },
        { srNo: "AR-49", description: "Window Blow up Detail" },
        { srNo: "AR-50", description: "Door Blow Up Detail" },
        ...Array.from({ length: 30 }, (_, i) => ({ srNo: `AR-${51 + i}`, description: "" }))
    ].map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
};

const DrawingList = ({ list, listName, handleDrawingChange, isEditing, title, colSpan, otherList }: { list: any[], listName: string, handleDrawingChange: any, isEditing: boolean, title: string, colSpan: number, otherList?: any[] }) => (
    <>
        <TableRow><TableCell colSpan={colSpan} className="font-bold bg-muted">{title}</TableCell></TableRow>
        {list.map((item: any, i: number) => {
            const otherItem = otherList && otherList[i];
            return (
                <TableRow key={`${listName}-${i}`}>
                    <TableCell>{item.srNo}</TableCell>
                    <TableCell>
                        {isEditing ? <Input value={item.description} onChange={(e) => handleDrawingChange(listName, i, 'description', e.target.value)} /> : item.description}
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
                    {otherList && otherItem && (
                        <>
                            <TableCell>{otherItem.srNo}</TableCell>
                            <TableCell>
                                {isEditing ? <Input value={otherItem.description} onChange={(e) => handleDrawingChange('doorsAndWindowsDrawings', i, 'description', e.target.value)} /> : otherItem.description}
                            </TableCell>
                            <TableCell>
                                {isEditing ? <Input value={otherItem.startDate} onChange={(e) => handleDrawingChange('doorsAndWindowsDrawings', i, 'startDate', e.target.value)} /> : otherItem.startDate}
                            </TableCell>
                            <TableCell>
                                {isEditing ? <Input value={otherItem.endDate} onChange={(e) => handleDrawingChange('doorsAndWindowsDrawings', i, 'endDate', e.target.value)} /> : otherItem.endDate}
                            </TableCell>
                            <TableCell>
                                {isEditing ? <Input value={otherItem.remarks} onChange={(e) => handleDrawingChange('doorsAndWindowsDrawings', i, 'remarks', e.target.value)} /> : otherItem.remarks}
                            </TableCell>
                        </>
                    )}
                </TableRow>
            )
        })}
    </>
);


export default function SampleListOfDrawingsPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>(initialDrawingData);
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/drawingSchedules/${SAMPLE_LIST_DOC_ID}`);
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
            toast({ title: 'Success', description: 'Sample list of drawings saved.' });
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
            <CardHeader className="flex flex-col items-center justify-center text-center">
                <CardTitle className="text-2xl">SAMPLE LIST</CardTitle>
                <p className="text-xl">List of drawings</p>
                <p className="text-lg font-bold">Working Drawings</p>
            </CardHeader>
             <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="font-bold">Draftsman Name: </span>
                        {isEditing ? (
                            <Input 
                                className="inline-block w-auto"
                                value={formData.draftsmanName}
                                onChange={(e) => setFormData({...formData, draftsmanName: e.target.value})}
                            />
                        ) : (
                            <span>{formData.draftsmanName}</span>
                        )}
                    </div>
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
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sr. no.</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead>Sr. no.</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <DrawingList list={formData.introduction} listName="introduction" handleDrawingChange={handleDrawingChange} isEditing={isEditing} title="Introduction (AR-01-AR-10)" colSpan={5} otherList={formData.doorsAndWindowsDrawings.slice(0, 10)} />
                        <DrawingList list={formData.workingLayoutDrawings} listName="workingLayoutDrawings" handleDrawingChange={handleDrawingChange} isEditing={isEditing} title="Working Layout Drawings (AR-11-AR-20)" colSpan={5} otherList={formData.doorsAndWindowsDrawings.slice(10, 20)} />
                        <DrawingList list={formData.elevationAndSectionDrawings} listName="elevationAndSectionDrawings" handleDrawingChange={handleDrawingChange} isEditing={isEditing} title="Elevation & Section Drawings (AR-21-AR-40)" colSpan={5} otherList={formData.doorsAndWindowsDrawings.slice(20, 40)} />
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </main>
    );
};
