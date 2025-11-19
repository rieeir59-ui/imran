
'use client';

import React, { useState, useEffect, Fragment } from 'react';
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
import { Edit, Save, Loader2, Download, ArrowLeft, Terminal, FileDown, PlusCircle, Trash2, CheckCircle, XCircle, CircleDotDashed, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { useSearchParams } from 'next/navigation';
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from '@/components/ui/date-picker';
import { format, isValid, parseISO, differenceInDays } from 'date-fns';
import { exportDataToCsv } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const initialDailyEntry = () => ({ details: '', percentage: 0 });

const initialScheduleData = [
  { 
    id: 1, 
    employeeName: 'MUJAHID', 
    projectName: '', 
    status: 'In Progress', 
    startDate: '', 
    endDate: '', 
    dailyEntries: Array(0).fill(null).map(initialDailyEntry),
  },
];

const designations = [
    "CEO",
    "Studio Manager",
    "Architect 3D Visualizer",
    "Draftsperson",
    "Quantity Surveyor",
    "Finance Manager",
    "HR/Admin",
    "IT Manager",
    "AI Manager"
];

const WeeklySchedulePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState(initialScheduleData);
  const [remarks, setRemarks] = useState('');
  const [scheduleDates, setScheduleDates] = useState({ start: '', end: '' });
  const [designation, setDesignation] = useState<string>('');
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [openProjects, setOpenProjects] = useState<Record<number, boolean>>({});

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
        setIsEditing(true);
        if (schedules.length === 0 || schedules[0].employeeName !== 'MUJAHID') {
            setSchedules(initialScheduleData);
            setDesignation('');
        }
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
          if (data.schedules && data.schedules.length > 0) {
            setSchedules(data.schedules.map((s: any) => ({
              ...s,
              dailyEntries: s.dailyEntries || []
            })));
          }
          if (data.remarks) setRemarks(data.remarks);
          if (data.scheduleDates) setScheduleDates(data.scheduleDates);
          if (data.designation) setDesignation(data.designation);
        } else {
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

  const getNumberOfDays = (startDateStr: string, endDateStr: string) => {
    if (!startDateStr || !endDateStr) return 0;
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    if (!isValid(start) || !isValid(end)) return 0;
    return differenceInDays(end, start) + 1;
  };

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updatedSchedules = [...schedules];
    const schedule = updatedSchedules[index] as any;
    
    let oldStartDate = schedule.startDate;
    let oldEndDate = schedule.endDate;

    if (field === 'startDate' && value instanceof Date) {
        schedule.startDate = format(value, 'yyyy-MM-dd');
    } else if (field === 'endDate' && value instanceof Date) {
        schedule.endDate = format(value, 'yyyy-MM-dd');
    } else {
        schedule[field] = value;
    }
    
    if ((field === 'startDate' && schedule.startDate !== oldStartDate) || (field === 'endDate' && schedule.endDate !== oldEndDate)) {
        const numDays = getNumberOfDays(schedule.startDate, schedule.endDate);
        const currentEntries = schedule.dailyEntries || [];
        if (numDays > 0) {
            if (numDays > currentEntries.length) {
                schedule.dailyEntries = [
                    ...currentEntries,
                    ...Array(numDays - currentEntries.length).fill(null).map(initialDailyEntry)
                ];
            } else {
                schedule.dailyEntries = currentEntries.slice(0, numDays);
            }
        } else {
            schedule.dailyEntries = [];
        }
    }

    setSchedules(updatedSchedules);
  };
  
  const handleDailyEntryChange = (projectIndex: number, dayIndex: number, field: 'details' | 'percentage', value: any) => {
    const updatedSchedules = [...schedules];
    const schedule = updatedSchedules[projectIndex];
    const dailyEntry = schedule.dailyEntries[dayIndex];
    if (field === 'percentage') {
      dailyEntry[field] = Math.max(0, Math.min(100, Number(value) || 0));
    } else {
      dailyEntry[field] = value;
    }
    setSchedules(updatedSchedules);
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: Date | undefined) => {
      setScheduleDates(prev => ({...prev, [field]: value ? format(value, 'yyyy-MM-dd') : ''}))
  }

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Save Failed", description: "User not authenticated." });
      return;
    }
    setIsSaving(true);
    const dataToSave = { schedules, remarks, scheduleDates, designation };
    
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
    const dataToExport = schedules.flatMap(s => 
        s.dailyEntries.map((d, i) => ({
            projectNo: s.id,
            employeeName: s.employeeName,
            designation: designation,
            projectName: s.projectName,
            day: `Day ${i + 1}`,
            details: d.details,
            percentage: d.percentage,
            status: s.status,
            startDate: s.startDate,
            endDate: s.endDate,
        }))
    );
    exportDataToCsv(dataToExport, 'daily-work-schedule');
  }

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const employeeName = schedules[0]?.employeeName || 'Employee';
    doc.text(`Weekly Work Schedule for ${employeeName}`, 14, 15);
    doc.text(`Designation: ${designation}`, 14, 22);
    doc.text(`Schedule: ${scheduleDates.start} to ${scheduleDates.end}`, 14, 29);
    
    schedules.forEach((schedule, index) => {
        if (index > 0) doc.addPage();
        doc.text(`Project: ${schedule.projectName} (Status: ${schedule.status})`, 14, 15);
        
        autoTable(doc, {
            head: [['Day', 'Details', 'Progress']],
            body: schedule.dailyEntries.map((d, i) => [`Day ${i+1}`, d.details, `${d.percentage}%`]),
            startY: 20
        });
    });

    doc.save('daily-work-schedule.pdf');
  }
  
  const addRow = () => {
    setSchedules([...schedules, { id: schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1, employeeName: schedules[0]?.employeeName || 'MUJAHID', projectName: '', status: 'In Progress', startDate: '', endDate: '', dailyEntries: [] }]);
  }

  const removeRow = (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(updatedSchedules);
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="text-green-500" />;
      case 'In Progress': return <CircleDotDashed className="text-blue-500" />;
      case 'Incomplete': return <XCircle className="text-red-500" />;
      default: return null;
    }
  }

  const calculateTotalProgress = (dailyEntries: {percentage: number}[]) => {
      if (!dailyEntries || dailyEntries.length === 0) return 0;
      const totalPercentage = dailyEntries.reduce((sum, entry) => sum + entry.percentage, 0);
      return Math.round(totalPercentage / dailyEntries.length);
  }

  const renderCell = (value: string | undefined, onChange: (val: any) => void, placeholder?: string) => {
    return isEditing ? <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8" /> : <span className="p-2 block min-h-[32px]">{value || ''}</span>;
  }
  
  const renderPercentageCell = (value: number | undefined, onChange: (val: any) => void) => {
    if (isEditing) {
        return <Input type="number" value={value || 0} onChange={(e) => onChange(e.target.value)} className="h-8 w-20" min="0" max="100"/>
    }
    return <Progress value={value || 0} className="w-full" />
  }

  const renderDateCell = (value: string | undefined, onChange: (val: Date | undefined) => void) => {
    const date = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
    if (isEditing) {
      return <DatePicker date={date} onDateChange={onChange} disabled={!isEditing} />;
    }
    return <span className="p-2 block min-h-[32px]">{date ? format(date, 'd-MMM-yy') : (value || '')}</span>;
  }
  
  if (isUserLoading || (isLoading && scheduleId)) {
    return <div className="flex h-full w-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading Schedule...</p></div>;
  }

  if (!user && !isUserLoading) {
      return (
        <main className="p-4 md:p-6 lg:p-8">
         <Card><CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader><CardContent><Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Unable to Authenticate</AlertTitle><AlertDescription>We could not sign you in. Please refresh the page to try again.</AlertDescription></Alert></CardContent></Card>
       </main>
     )
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6 no-print">
        <Button variant="outline" asChild><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link></Button>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadCsv} variant="outline"><FileDown className="mr-2 h-4 w-4" /> CSV</Button>
            <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> PDF</Button>
            {isEditing ? (<><Button onClick={addRow} variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button><Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Save</Button></>) : (<Button onClick={() => setIsEditing(true)}><Edit className="mr-2" /> Edit</Button>)}
        </div>
      </div>
      <Card className="printable-card">
        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
            <div className='flex items-center gap-4'>
                <Avatar className="h-16 w-16"><AvatarImage src={`https://picsum.photos/seed/${schedules[0]?.employeeName || 'employee'}/200`} alt={schedules[0]?.employeeName} /><AvatarFallback>{schedules[0]?.employeeName?.charAt(0) || 'E'}</AvatarFallback></Avatar>
                <div>
                    {isEditing ? (<Input value={schedules[0]?.employeeName || ''} onChange={(e) => { const newName = e.target.value; setSchedules(schedules.map(s => ({ ...s, employeeName: newName })));}} className="text-2xl font-bold p-0 border-0 h-auto focus-visible:ring-0" placeholder="Employee Name"/>) : (<CardTitle className="text-2xl font-bold">{schedules[0]?.employeeName || 'Employee'}</CardTitle>)}
                    {isEditing ? (<Select onValueChange={setDesignation} value={designation}><SelectTrigger className="w-[280px] mt-1"><SelectValue placeholder="Select a designation" /></SelectTrigger><SelectContent>{designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>) : (<p className="text-muted-foreground">{designation || 'No designation'}</p>)}
                </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
                 <p className="text-sm text-muted-foreground">Weekly Work Schedule</p>
                <div className="flex items-center gap-2">
                    {isEditing ? (<><DatePicker date={scheduleDates.start ? parseISO(scheduleDates.start) : undefined} onDateChange={(date) => handleDateRangeChange('start', date)} /><span className="mx-2">to</span><DatePicker date={scheduleDates.end ? parseISO(scheduleDates.end) : undefined} onDateChange={(date) => handleDateRangeChange('end', date)} /></>) : (<p className="text-sm font-medium">{scheduleDates.start && format(parseISO(scheduleDates.start), 'PPP')} - {scheduleDates.end && format(parseISO(scheduleDates.end), 'PPP')}</p>)}
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-20">Project No.</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-48">Total Progress</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Tick</TableHead>
                  {isEditing && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule, index) => {
                    const isOpen = openProjects[schedule.id] || false;
                    return (
                        <Fragment key={schedule.id}>
                            <TableRow>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => setOpenProjects(prev => ({...prev, [schedule.id]: !isOpen}))}>
                                        {isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                                    </Button>
                                </TableCell>
                                <TableCell>{renderCell(String(schedule.id), (val) => handleScheduleChange(index, 'id', Number(val) || 0))}</TableCell>
                                <TableCell>{renderCell(schedule.projectName, (val) => handleScheduleChange(index, 'projectName', val))}</TableCell>
                                <TableCell>{isEditing ? (<Select value={schedule.status} onValueChange={(value) => handleScheduleChange(index, 'status', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Incomplete">Incomplete</SelectItem></SelectContent></Select>) : (<span className="p-2 block">{schedule.status}</span>)}</TableCell>
                                <TableCell><Progress value={calculateTotalProgress(schedule.dailyEntries)} className="w-full" /></TableCell>
                                <TableCell>{renderDateCell(schedule.startDate, (val) => handleScheduleChange(index, 'startDate', val))}</TableCell>
                                <TableCell>{renderDateCell(schedule.endDate, (val) => handleScheduleChange(index, 'endDate', val))}</TableCell>
                                <TableCell>{getStatusIcon(schedule.status)}</TableCell>
                                {isEditing && <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>}
                            </TableRow>
                            {isOpen && (
                                <TableRow>
                                    <TableCell colSpan={isEditing ? 9 : 8} className="p-0">
                                        <div className="p-4 bg-muted/50">
                                            <h4 className="font-semibold mb-2">Daily Plan</h4>
                                            {getNumberOfDays(schedule.startDate, schedule.endDate) > 0 ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className='w-24'>Day</TableHead>
                                                            <TableHead>Details</TableHead>
                                                            <TableHead className='w-48'>Progress</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {schedule.dailyEntries.map((daily, dayIndex) => (
                                                            <TableRow key={dayIndex}>
                                                                <TableCell>Day {dayIndex + 1}</TableCell>
                                                                <TableCell>{renderCell(daily.details, (val) => handleDailyEntryChange(index, dayIndex, 'details', val), "What was done today?")}</TableCell>
                                                                <TableCell>{renderPercentageCell(daily.percentage, (val) => handleDailyEntryChange(index, dayIndex, 'percentage', val))}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <p className="text-sm text-muted-foreground p-4 text-center">Set a start and end date to create a daily plan.</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    );
                })}
              </TableBody>
            </Table>
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Remarks</h3>
                {isEditing ? (<Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add any overall remarks here..."/>) : (<p className="text-sm text-muted-foreground p-2">{remarks || 'No remarks.'}</p>)}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default WeeklySchedulePage;
