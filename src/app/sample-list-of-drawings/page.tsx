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
import { DatePicker } from '@/components/ui/date-picker';
import { parseISO, format, isValid } from 'date-fns';

const SAMPLE_LIST_DOC_ID = 'sample-list-of-drawings';

const initialDrawingData = {
    draftsmanName: "Mr. Adeel",
    introduction: [
        { srNo: "AR-01", description: "General Notes and Conditions" },
        { srNo: "AR-02", description: "Survey Plan" },
        { srNo: "AR-03", description: "Site Setting Drawings" },
    ].concat(Array.from({ length: 7 }, (_, i) => ({ srNo: `AR-${String(i + 4).padStart(2, '0')}`, description: "" }))).map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
    workingLayoutDrawings: [
        { srNo: "AR-11", description: "Master Working Layout Plan" },
        { srNo: "AR-12", description: "Working Layout Plan (Basement Floor)" },
        { srNo: "AR-13", description: "Working Layout Plan (Ground Floor)" },
        { srNo: "AR-14", description: "Working Layout Plan (First Floor)" },
        { srNo: "AR-15", description: "Working Layout Plan (Mezzanine Floor)" },
        { srNo: "AR-16", description: "Working Layout Plan (Roof Top)" },
    ].concat(Array.from({ length: 4 }, (_, i) => ({ srNo: `AR-${17 + i}`, description: "" }))).map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
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
    ].concat(Array.from({ length: 8 }, (_, i) => ({ srNo: `AR-${33 + i}`, description: "" }))).map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
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
    ].concat(Array.from({ length: 30 }, (_, i) => ({ srNo: `AR-${51 + i}`, description: "" }))).map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
    stairStepRampDrawings: [
        { srNo: "AR-81", description: "Main Stair Case Detail" },
        { srNo: "AR-82", description: "Main Stair Case Detail Section" },
        { srNo: "AR-83", description: "Main Entrance Steps Detail" },
        { srNo: "AR-84", description: "Back Entrance step Detail" },
    ].concat(Array.from({ length: 16 }, (_, i) => ({ srNo: `AR-${85 + i}`, description: "" }))).map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
    bathroomDrawings: [
        { srNo: "AR-101", description: "Toilet Layout (Ground floor)" },
        { srNo: "AR-102", description: "Toilet Layout (First floor)" },
        { srNo: "AR-103", description: "Toilet Layout (Mezzanine floor)" },
        { srNo: "AR-104", description: "Toilet Layout (Basement floor)" },
        { srNo: "AR-105", description: "Toilet Layout (Roof Top)" },
        { srNo: "AR-106", description: "Toilet Detail (Ground floor)" },
        { srNo: "AR-107", description: "Toilet Detail (First floor)" },
        { srNo: "AR-108", description: "Toilet Detail (Mezzanine floor)" },
        { srNo: "AR-109", description: "Toilet Detail (Basement floor)" },
        { srNo: "AR-110", description: "Toilet Detail (Roof Top)" },
        { srNo: "AR-111", description: "Blow Up Detail" },
    ].concat(Array.from({ length: 29 }, (_, i) => ({ srNo: `AR-${112 + i}`, description: "" }))).map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
    kitchenDrawings: [
        { srNo: "AR-141", description: "Kitchen Layout (Ground floor)" },
        { srNo: "AR-142", description: "Kitchen Layout (First floor)" },
        { srNo: "AR-143", description: "Kitchen Layout (Mezzanine floor)" },
        { srNo: "AR-144", description: "Kitchen Layout (Basement floor)" },
        { srNo: "AR-145", description: "Kitchen Detail (Ground floor)" },
        { srNo: "AR-146", description: "Kitchen Detail (First floor)" },
        { srNo: "AR-147", description: "Kitchen Detail (Mezzanine floor)" },
        { srNo: "AR-148", description: "Kitchen Detail (Basement floor)" },
    ].concat(Array.from({ length: 12 }, (_, i) => ({ srNo: `AR-${149 + i}`, description: "" }))).map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
    floorPatternDrawings: [
        { srNo: "AR-161", description: "Exterior Paving Pattern" },
        { srNo: "AR-162", description: "Floor Pattern (Ground Floor)" },
        { srNo: "AR-163", description: "Floor Pattern (First Floor)" },
        { srNo: "AR-164", description: "Floor Pattern (Mazzenine Floor)" },
        { srNo: "AR-165", description: "Floor Pattern (Basement Floor)" },
        { srNo: "AR-166", description: "Floor Pattern (Roof Top)" },
        { srNo: "AR-167", description: "Floor Pattern Blow up Details" },
        { srNo: "AR-168", description: "Floor Floor Finishes and Transition Details" },
    ].concat(Array.from({ length: 12 }, (_, i) => ({ srNo: `AR-${169 + i}`, description: "" }))).map(item => ({...item, startDate: '', endDate: '', remarks: ''})),
};

const DrawingList = ({ list, listName, handleDrawingChange, isEditing, title, colSpan, otherList, otherListName }: { list: any[], listName: string, handleDrawingChange: any, isEditing: boolean, title: string, colSpan: number, otherList?: any[], otherListName?: string }) => (
    <>
        <TableRow><TableCell colSpan={colSpan} className="font-bold bg-muted">{title}</TableCell></TableRow>
        {list.map((item: any, i: number) => {
            const otherItem = otherList && otherList[i];
            const startDate = item.startDate && isValid(parseISO(item.startDate)) ? parseISO(item.startDate) : undefined;
            const endDate = item.endDate && isValid(parseISO(item.endDate)) ? parseISO(item.endDate) : undefined;
            const otherStartDate = otherItem && otherItem.startDate && isValid(parseISO(otherItem.startDate)) ? parseISO(otherItem.startDate) : undefined;
            const otherEndDate = otherItem && otherItem.endDate && isValid(parseISO(otherItem.endDate)) ? parseISO(otherItem.endDate) : undefined;

            return (
                <TableRow key={`${listName}-${i}`}>
                    <TableCell>{item.srNo}</TableCell>
                    <TableCell>
                        {isEditing ? <Input value={item.description} onChange={(e) => handleDrawingChange(listName, i, 'description', e.target.value)} /> : item.description}
                    </TableCell>
                    <TableCell>
                        {isEditing ? <DatePicker date={startDate} onDateChange={(date) => handleDrawingChange(listName, i, 'startDate', date)} /> : item.startDate}
                    </TableCell>
                    <TableCell>
                        {isEditing ? <DatePicker date={endDate} onDateChange={(date) => handleDrawingChange(listName, i, 'endDate', date)} /> : item.endDate}
                    </TableCell>
                    <TableCell>
                        {isEditing ? <Input value={item.remarks} onChange={(e) => handleDrawingChange(listName, i, 'remarks', e.target.value)} /> : item.remarks}
                    </TableCell>
                    {otherList && otherItem && otherListName && (
                        <>
                            <TableCell>{otherItem.srNo}</TableCell>
                            <TableCell>
                                {isEditing ? <Input value={otherItem.description} onChange={(e) => handleDrawingChange(otherListName, i, 'description', e.target.value)} /> : otherItem.description}
                            </TableCell>
                            <TableCell>
                                {isEditing ? <DatePicker date={otherStartDate} onDateChange={(date) => handleDrawingChange(otherListName, i, 'startDate', date)} /> : otherItem.startDate}
                            </TableCell>
                            <TableCell>
                                {isEditing ? <DatePicker date={otherEndDate} onDateChange={(date) => handleDrawingChange(otherListName, i, 'endDate', date)} /> : otherItem.endDate}
                            </TableCell>
                            <TableCell>
                                {isEditing ? <Input value={otherItem.remarks} onChange={(e) => handleDrawingChange(otherListName, i, 'remarks', e.target.value)} /> : otherItem.remarks}
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
                // Ensure all parts of initial data are present
                const mergedData = { ...initialDrawingData, ...data };
                Object.keys(initialDrawingData).forEach(key => {
                    if (!mergedData[key as keyof typeof initialDrawingData]) {
                        mergedData[key as keyof typeof initialDrawingData] = initialDrawingData[key as keyof typeof initialDrawingData];
                    }
                });
                setFormData(mergedData);
            } else {
                setFormData(initialDrawingData);
            }
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleDrawingChange = (listName: string, index: number, field: string, value: string | Date | undefined) => {
        setFormData((prev: any) => {
            const newList = [...prev[listName]];
            const updatedValue = value instanceof Date ? format(value, 'yyyy-MM-dd') : value;
            newList[index] = { ...newList[index], [field]: updatedValue };
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
    
    if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>;

    const renderTableRows = (list1Name: keyof typeof initialDrawingData, list2Name: keyof typeof initialDrawingData, title1: string, title2: string) => {
        const list1 = formData[list1Name] || [];
        const list2 = formData[list2Name] || [];
        const maxLength = Math.max(list1.length, list2.length);
        const rows = [];
        
        for (let i = 0; i < maxLength; i++) {
            const item1 = list1[i];
            const item2 = list2[i];
            const startDate1 = item1 && item1.startDate && isValid(parseISO(item1.startDate)) ? parseISO(item1.startDate) : undefined;
            const endDate1 = item1 && item1.endDate && isValid(parseISO(item1.endDate)) ? parseISO(item1.endDate) : undefined;
            const startDate2 = item2 && item2.startDate && isValid(parseISO(item2.startDate)) ? parseISO(item2.startDate) : undefined;
            const endDate2 = item2 && item2.endDate && isValid(parseISO(item2.endDate)) ? parseISO(item2.endDate) : undefined;
            rows.push(
                 <TableRow key={`${list1Name as string}-${list2Name as string}-${i}`}>
                    {item1 ? <>
                        <TableCell>{item1.srNo}</TableCell>
                        <TableCell>{isEditing ? <Input value={item1.description} onChange={(e) => handleDrawingChange(list1Name as string, i, 'description', e.target.value)} /> : item1.description}</TableCell>
                        <TableCell>{isEditing ? <DatePicker date={startDate1} onDateChange={(date) => handleDrawingChange(list1Name as string, i, 'startDate', date)} /> : item1.startDate}</TableCell>
                        <TableCell>{isEditing ? <DatePicker date={endDate1} onDateChange={(date) => handleDrawingChange(list1Name as string, i, 'endDate', date)} /> : item1.endDate}</TableCell>
                        <TableCell>{isEditing ? <Input value={item1.remarks} onChange={(e) => handleDrawingChange(list1Name as string, i, 'remarks', e.target.value)} /> : item1.remarks}</TableCell>
                    </> : <><TableCell/><TableCell/><TableCell/><TableCell/><TableCell/></>}
                    {item2 ? <>
                        <TableCell>{item2.srNo}</TableCell>
                        <TableCell>{isEditing ? <Input value={item2.description} onChange={(e) => handleDrawingChange(list2Name as string, i, 'description', e.target.value)} /> : item2.description}</TableCell>
                        <TableCell>{isEditing ? <DatePicker date={startDate2} onDateChange={(date) => handleDrawingChange(list2Name as string, i, 'startDate', date)} /> : item2.startDate}</TableCell>
                        <TableCell>{isEditing ? <DatePicker date={endDate2} onDateChange={(date) => handleDrawingChange(list2Name as string, i, 'endDate', date)} /> : item2.endDate}</TableCell>
                        <TableCell>{isEditing ? <Input value={item2.remarks} onChange={(e) => handleDrawingChange(list2Name as string, i, 'remarks', e.target.value)} /> : item2.remarks}</TableCell>
                    </> : <><TableCell/><TableCell/><TableCell/><TableCell/><TableCell/></>}
                 </TableRow>
            );
        }

        return <>
            <TableRow>
                <TableCell colSpan={5} className="font-bold bg-muted">{title1}</TableCell>
                <TableCell colSpan={5} className="font-bold bg-muted">{title2}</TableCell>
            </TableRow>
            {rows}
        </>;
    }

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
                        {renderTableRows('introduction', 'stairStepRampDrawings', 'Introduction (AR-01-AR-10)', 'Stair, Step & Ramp Drawings (AR-81-AR-100)')}
                        {renderTableRows('workingLayoutDrawings', 'bathroomDrawings', 'Working Layout Drawings (AR-11-AR-20)', 'Bathroom Drawings (AR-101-AR-140)')}
                        {renderTableRows('elevationAndSectionDrawings', 'kitchenDrawings', 'Elevation & Section Drawings (AR-21-AR-40)', 'Kitchen Drawings (AR-141-AR-160)')}
                        {renderTableRows('doorsAndWindowsDrawings', 'floorPatternDrawings', 'Doors & Windows Drawings (AR-41-AR-80)', 'Floor Pattern Drawings (AR-161-AR-180)')}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </main>
    );
};
