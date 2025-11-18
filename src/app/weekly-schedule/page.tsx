'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Loader2, Download, ArrowLeft, Terminal, FileDown, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from '@/components/ui/date-picker';
import { format, isValid } from 'date-fns';
import { exportDataToCsv } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const SCHEDULE_DOC_ID = "weekly-work-schedule";

const initialScheduleData = [
  { id: 1, employeeName: '', projectName: '', details: '', status: '', startDate: '', endDate: '' },
];

const WeeklySchedulePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState(initialScheduleData);
  const [remarks, setRemarks] = useState('');
  const { toast } = useToast();

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const scheduleDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/weeklySchedules/${SCHEDULE_DOC_ID}`);
  }, [user, firestore]);

  useEffect(() => {
    if (!scheduleDocRef) return;

    setIsLoading(true);
    getDoc(scheduleDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.schedules && data.schedules.length > 0) setSchedules(data.schedules);
          if (data.remarks) setRemarks(data.remarks);
        }
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: scheduleDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [scheduleDocRef]);

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updatedSchedules = [...schedules];
    const schedule = updatedSchedules[index] as any;
    schedule[field] = value;
    
    if (field === 'startDate' && value instanceof Date) {
        schedule.startDate = format(value, 'yyyy-MM-dd');
    }
    if (field === 'endDate' && value instanceof Date) {
        schedule.endDate = format(value, 'yyyy-MM-dd');
    }

    setSchedules(updatedSchedules);
  };
  
  const handleSave = () => {
    if (!scheduleDocRef) {
      toast({ variant: "destructive", title: "Save Failed", description: "User not authenticated." });
      return;
    }
    setIsSaving(true);
    const dataToSave = { schedules, remarks };
    
    setDoc(scheduleDocRef, dataToSave, { merge: true })
      .then(() => {
        setIsSaving(false);
        setIsEditing(false);
        toast({
          title: "Data Saved",
          description: "Your weekly schedule has been saved successfully.",
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: scheduleDocRef.path,
          operation: 'write',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
      });
  };

  const handleDownloadCsv = () => {
    exportDataToCsv(schedules, 'weekly-work-schedule');
  }

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Weekly Work Schedule", 14, 15);
    autoTable(doc, {
        head: [['Employee Name', 'Project Name', 'Details', 'Status', 'Start Date', 'End Date']],
        body: schedules.map(s => [s.employeeName, s.projectName, s.details, s.status, s.startDate, s.endDate]),
        startY: 20,
    });
    const finalY = (doc as any).lastAutoTable.finalY || 20;
    if (remarks) {
        doc.text("Remarks", 14, finalY + 10);
        doc.text(remarks, 14, finalY + 15);
    }
    doc.save('weekly-work-schedule.pdf');
  }
  
  const addRow = () => {
    setSchedules([...schedules, { id: schedules.length + 1, employeeName: '', projectName: '', details: '', status: '', startDate: '', endDate: '' }]);
  }

  const removeRow = (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(updatedSchedules);
  }

  const renderCell = (value: string | undefined, onChange: (val: any) => void) => {
    return isEditing ? <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8" /> : (value || '');
  }

  const renderDateCell = (value: string | undefined, onChange: (val: Date | undefined) => void) => {
    const date = value && isValid(new Date(value)) ? new Date(value) : undefined;
    if (isEditing) {
      return <DatePicker date={date} onDateChange={onChange} disabled={!isEditing} />;
    }
    return <span className="cell-value">{date ? format(date, 'd-MMM-yy') : (value || '')}</span>;
  }

  if (isUserLoading || isLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading Schedule...</p>
        </div>
    );
  }

  if (!user && !isUserLoading) {
      return (
        <main className="p-4 md:p-6 lg:p-8">
         <Card>
           <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
           <CardContent>
             <Alert variant="destructive">
               <Terminal className="h-4 w-4" />
               <AlertTitle>Unable to Authenticate</AlertTitle>
               <AlertDescription>We could not sign you in. Please refresh the page to try again.</AlertDescription>
             </Alert>
           </CardContent>
         </Card>
       </main>
     )
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6 no-print">
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
        <h1 className="text-2xl font-bold">Weekly Work Schedule</h1>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadCsv} variant="outline"><FileDown className="mr-2 h-4 w-4" /> Download CSV</Button>
            <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            {isEditing ? (
                <>
                    <Button onClick={addRow} variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Save
                    </Button>
                </>
            ) : (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2" /> Edit</Button>
            )}
        </div>
      </div>
      <Card className="printable-card">
        <CardHeader>
            <CardTitle>Weekly Work Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  {isEditing && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule, index) => (
                  <TableRow key={index}>
                    <TableCell>{renderCell(schedule.employeeName, (val) => handleScheduleChange(index, 'employeeName', val))}</TableCell>
                    <TableCell>{renderCell(schedule.projectName, (val) => handleScheduleChange(index, 'projectName', val))}</TableCell>
                    <TableCell>{renderCell(schedule.details, (val) => handleScheduleChange(index, 'details', val))}</TableCell>
                    <TableCell>{renderCell(schedule.status, (val) => handleScheduleChange(index, 'status', val))}</TableCell>
                    <TableCell>{renderDateCell(schedule.startDate, (val) => handleScheduleChange(index, 'startDate', val))}</TableCell>
                    <TableCell>{renderDateCell(schedule.endDate, (val) => handleScheduleChange(index, 'endDate', val))}</TableCell>
                    {isEditing && 
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeRow(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    }
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Remarks</h3>
                {isEditing ? (
                    <Textarea 
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add any overall remarks here..."
                    />
                ) : (
                    <p className="text-sm text-muted-foreground">{remarks || 'No remarks.'}</p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default WeeklySchedulePage;
