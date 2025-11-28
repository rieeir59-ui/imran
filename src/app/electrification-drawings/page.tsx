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

const ELECTRIFICATION_DRAWING_SCHEDULE_DOC_ID = 'electrification-drawing-schedule';

const initialDrawingData = {
    electrificationDrawings: ["lllumination Layout Plans", "Power Layout Plans", "Legend & General Notes"].map(title => ({title, startDate: '', endDate: '', remarks: ''})),
};

export default function ElectrificationDrawingsPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>(initialDrawingData);
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/drawingSchedules/${ELECTRIFICATION_DRAWING_SCHEDULE_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
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
            toast({ title: 'Success', description: 'Electrification drawings saved.' });
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
                <CardTitle>Electrification Drawings</CardTitle>
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
                    <TableHeader><TableRow><TableHead>Drawings Title</TableHead><TableHead>Starting Date</TableHead><TableHead>Completion Date</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {formData.electrificationDrawings?.map((item: any, i: number) => {
                            const startDate = item.startDate && isValid(parseISO(item.startDate)) ? parseISO(item.startDate) : undefined;
                            const endDate = item.endDate && isValid(parseISO(item.endDate)) ? parseISO(item.endDate) : undefined;
                            return (
                             <TableRow key={`electrification-${i}`}>
                                <TableCell>
                                    {isEditing ? <Input value={item.title} onChange={(e) => handleDrawingChange('electrificationDrawings', i, 'title', e.target.value)} /> : item.title}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? <DatePicker date={startDate} onDateChange={(date) => handleDrawingChange('electrificationDrawings', i, 'startDate', date)} /> : item.startDate}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? <DatePicker date={endDate} onDateChange={(date) => handleDrawingChange('electrificationDrawings', i, 'endDate', date)} /> : item.endDate}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? <Input value={item.remarks} onChange={(e) => handleDrawingChange('electrificationDrawings', i, 'remarks', e.target.value)} /> : item.remarks}
                                </TableCell>
                            </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </main>
    );
};
