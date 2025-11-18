
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
import { Edit, Save, Loader2, Download, ArrowLeft, Terminal, FileDown, PlusCircle, Trash2, CheckCircle, XCircle, CircleDotDashed } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { useSearchParams } from 'next/navigation';
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from '@/components/ui/date-picker';
import { format, isValid, parseISO } from 'date-fns';
import { exportDataToCsv } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const initialScheduleData = [
  { id: 1, employeeName: 'MUJAHID', projectName: '', details: '', status: 'In Progress', startDate: '', endDate: '' },
];

const WeeklySchedulePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState(initialScheduleData);
  const [remarks, setRemarks] = useState('');
  const [scheduleDates, setScheduleDates] = useState({ start: '', end: '' });
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  const { toast } = useToast();

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
        setScheduleId(id);
    } else {
        // If no ID, it's a new schedule
        setIsEditing(true);
        setSchedules(initialScheduleData);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const scheduleDocRef = useMemoFirebase(() => {
    if (!user || !firestore || !scheduleId) return null;
    return doc(firestore, `users/${user.uid}/weeklySchedules/${scheduleId}`);
  }, [user, firestore, scheduleId]);

  useEffect(() => {
    if (!scheduleDocRef) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    getDoc(scheduleDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.schedules && data.schedules.length > 0) setSchedules(data.schedules);
          if (data.remarks) setRemarks(data.remarks);
          if (data.scheduleDates) setScheduleDates(data.scheduleDates);
        } else {
            // Document doesn't exist, treat as new.
            setScheduleId(null);
            setIsEditing(true);
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
  
  const handleDateRangeChange = (field: 'start' | 'end', value: Date | undefined) => {
      setScheduleDates(prev => ({...prev, [field]: value ? format(value, 'yyyy-MM-dd') : ''}))
  }

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Save Failed", description: "User not authenticated." });
      return;
    }
    setIsSaving(true);
    const dataToSave = { schedules, remarks, scheduleDates };
    
    try {
        if (scheduleId) {
            const docRef = doc(firestore, `users/${user.uid}/weeklySchedules/${scheduleId}`);
            await setDoc(docRef, dataToSave, { merge: true });
        } else {
            const collectionRef = collection(firestore, `users/${user.uid}/weeklySchedules`);
            const newDocRef = await addDoc(collectionRef, dataToSave);
            setScheduleId(newDocRef.id);
        }

        setIsSaving(false);
        setIsEditing(false);
        toast({
          title: "Data Saved",
          description: "Your weekly schedule has been saved successfully.",
        });

    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: scheduleId ? `users/${user.uid}/weeklySchedules/${scheduleId}`: `users/${user.uid}/weeklySchedules`,
          operation: 'write',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
    }
  };

  const handleDownloadCsv = () => {
    const dataToExport = schedules.map(s => ({
        projectNo: s.id,
        employeeName: s.employeeName,
        projectName: s.projectName,
        details: s.details,
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate,
    }));
    exportDataToCsv(dataToExport, 'weekly-work-schedule');
  }

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const employeeName = schedules[0]?.employeeName || 'Employee';
    doc.text(`Weekly Work Schedule for ${employeeName}`, 14, 15);
    doc.text(`Schedule: ${scheduleDates.start} to ${scheduleDates.end}`, 14, 22);
    autoTable(doc, {
        head: [['Project No.', 'Employee', 'Project Name', 'Details', 'Status', 'Start Date', 'End Date']],
        body: schedules.map(s => [s.id, s.employeeName, s.projectName, s.details, s.status, s.startDate, s.endDate]),
        startY: 30,
    });
    const finalY = (doc as any).lastAutoTable.finalY || 30;
    if (remarks) {
        doc.text("Remarks", 14, finalY + 10);
        doc.text(remarks, 14, finalY + 15);
    }
    doc.save('weekly-work-schedule.pdf');
  }
  
  const addRow = () => {
    setSchedules([...schedules, { id: schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1, employeeName: schedules[0]?.employeeName || 'MUJAHID', projectName: '', details: '', status: 'In Progress', startDate: '', endDate: '' }]);
  }

  const removeRow = (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(updatedSchedules);
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="text-green-500" />;
      case 'In Progress':
        return <CircleDotDashed className="text-blue-500" />;
      case 'Incomplete':
        return <XCircle className="text-red-500" />;
      default:
        return null;
    }
  }

  const renderCell = (value: string | undefined, onChange: (val: any) => void) => {
    return isEditing ? <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8" /> : <span className="p-2 block">{value || ''}</span>;
  }

  const renderDateCell = (value: string | undefined, onChange: (val: Date | undefined) => void) => {
    const date = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
    if (isEditing) {
      return <DatePicker date={date} onDateChange={onChange} disabled={!isEditing} />;
    }
    return <span className="p-2 block">{date ? format(date, 'd-MMM-yy') : (value || '')}</span>;
  }

  if (isUserLoading || isLoading && scheduleId) {
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
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadCsv} variant="outline"><FileDown className="mr-2 h-4 w-4" /> CSV</Button>
            <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> PDF</Button>
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
        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
            <div className='flex items-center gap-4'>
                <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://picsum.photos/seed/${schedules[0]?.employeeName || 'employee'}/200`} alt={schedules[0]?.employeeName} />
                    <AvatarFallback>{schedules[0]?.employeeName?.charAt(0) || 'E'}</AvatarFallback>
                </Avatar>
                <div>
                    {isEditing ? (
                        <Input
                            value={schedules[0]?.employeeName || ''}
                            onChange={(e) => {
                                const newName = e.target.value;
                                setSchedules(schedules.map(s => ({ ...s, employeeName: newName })));
                            }}
                            className="text-2xl font-bold p-0 border-0 h-auto focus-visible:ring-0"
                            placeholder="Employee Name"
                        />
                    ) : (
                        <CardTitle className="text-2xl font-bold">{schedules[0]?.employeeName || 'Employee'}</CardTitle>
                    )}
                    <p className="text-muted-foreground">Weekly Work Schedule</p>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
                {isEditing ? (
                    <>
                        <DatePicker date={scheduleDates.start ? parseISO(scheduleDates.start) : undefined} onDateChange={(date) => handleDateRangeChange('start', date)} />
                        <span className="mx-2">to</span>
                        <DatePicker date={scheduleDates.end ? parseISO(scheduleDates.end) : undefined} onDateChange={(date) => handleDateRangeChange('end', date)} />
                    </>
                ) : (
                    <p className="text-sm font-medium">
                        {scheduleDates.start && format(parseISO(scheduleDates.start), 'PPP')} - {scheduleDates.end && format(parseISO(scheduleDates.end), 'PPP')}
                    </p>
                )}
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Project No.</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Tick</TableHead>
                  {isEditing && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule, index) => (
                  <TableRow key={index}>
                    <TableCell>{renderCell(String(schedule.id), (val) => handleScheduleChange(index, 'id', Number(val) || 0))}</TableCell>
                    <TableCell>{renderCell(schedule.projectName, (val) => handleScheduleChange(index, 'projectName', val))}</TableCell>
                    <TableCell>{renderCell(schedule.details, (val) => handleScheduleChange(index, 'details', val))}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <select
                          value={schedule.status}
                          onChange={(e) => handleScheduleChange(index, 'status', e.target.value)}
                          className="form-select block w-full h-8 border-gray-300 rounded-md"
                        >
                          <option>In Progress</option>
                          <option>Completed</option>
                          <option>Incomplete</option>
                        </select>
                      ) : (
                        <span className="p-2 block">{schedule.status}</span>
                      )}
                    </TableCell>
                    <TableCell>{renderDateCell(schedule.startDate, (val) => handleScheduleChange(index, 'startDate', val))}</TableCell>
                    <TableCell>{renderDateCell(schedule.endDate, (val) => handleScheduleChange(index, 'endDate', val))}</TableCell>
                    <TableCell>{getStatusIcon(schedule.status)}</TableCell>
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
                    <p className="text-sm text-muted-foreground p-2">{remarks || 'No remarks.'}</p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default WeeklySchedulePage;
