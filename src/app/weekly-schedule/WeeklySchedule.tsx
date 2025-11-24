
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
import { Edit, Save, Loader2, Download, ArrowLeft, Terminal, FileDown, PlusCircle, Trash2, CheckCircle, XCircle, CircleDotDashed, ChevronDown, ChevronRight, ClipboardList, ChevronsUpDown, Check } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { useSearchParams } from 'next/navigation';
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from '@/components/ui/date-picker';
import { format, isValid, parseISO, differenceInDays, addDays, endOfMonth } from 'date-fns';
import { exportDataToCsv } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const initialDailyEntry = () => ({ details: '', percentage: 0 });

const initialScheduleData = (employeeName: string) => ([
  { 
    id: 1, 
    employeeName: employeeName, 
    projectName: '', 
    details: '',
    status: 'In Progress', 
    startDate: '', 
    endDate: '', 
    dailyEntries: Array(0).fill(null).map(initialDailyEntry),
  },
]);

const designations = [
    "CEO",
    "Architect",
    "3D Visualizer",
    "Studio Manager",
    "Draftsperson",
    "Quantity Surveyor",
    "Finance Manager",
    "HR/Admin",
    "IT Manager",
    "AI Manager"
];

interface Task {
    id: string;
    employeeName: string;
    projectName: string;
    taskDescription: string;
    startDate: string;
    endDate: string;
    status: string;
    assignedBy: string;
    createdAt: any;
}

const WeeklySchedule = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [scheduleDates, setScheduleDates] = useState({ start: '', end: '' });
  const [designation, setDesignation] = useState<string>('');
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [openProjects, setOpenProjects] = useState<Record<number, boolean>>({});
  const [scheduleType, setScheduleType] = useState<'weekly' | 'monthly'>('weekly');
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [designationPopoverOpen, setDesignationPopoverOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const employeeQueryParam = searchParams.get('employee') || 'New Employee';
  const designationQueryParam = searchParams.get('designation') || '';

  const [employeeName, setEmployeeName] = useState(employeeQueryParam);
  const [schedules, setSchedules] = useState(() => initialScheduleData(employeeName));


  const { toast } = useToast();

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    const id = searchParams.get('id');
    const employee = searchParams.get('employee');
    const des = searchParams.get('designation');
    
    if (id) {
        setScheduleId(id);
    } else {
        setIsEditing(true);
        const newEmployeeName = employee || 'New Employee';
        setEmployeeName(newEmployeeName);
        setSchedules(initialScheduleData(newEmployeeName));
        setDesignation(des || '');
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

  const tasksCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore || !employeeName) return null;
    return query(collection(firestore, `users/${user.uid}/tasks`), where("employeeName", "==", employeeName));
  }, [user, firestore, employeeName]);
  
  useEffect(() => {
    if (!tasksCollectionRef) return;
  
    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        tasksData.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
        setAssignedTasks(tasksData);
    }, (error) => {
        console.error("Error fetching tasks:", error);
    });
  
    return () => unsubscribe();
  }, [tasksCollectionRef]);


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
             if (data.schedules[0]?.employeeName) {
              setEmployeeName(data.schedules[0].employeeName);
            }
          }
          if (data.remarks) setRemarks(data.remarks);
          if (data.scheduleDates) setScheduleDates(data.scheduleDates);
          if (data.designation) setDesignation(data.designation);
          if (data.scheduleType) setScheduleType(data.scheduleType);
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
    setSchedules(prevSchedules => 
      prevSchedules.map((schedule, i) => {
        if (i === index) {
          const newSchedule = { ...schedule, [field]: value };
          
          if (field === 'startDate' || field === 'endDate') {
              const numDays = getNumberOfDays(newSchedule.startDate, newSchedule.endDate);
              const currentEntries = newSchedule.dailyEntries || [];
              let newEntries;
              if (numDays > 0) {
                  if (numDays > currentEntries.length) {
                      newEntries = [
                          ...currentEntries,
                          ...Array(numDays - currentEntries.length).fill(null).map(initialDailyEntry)
                      ];
                  } else {
                      newEntries = currentEntries.slice(0, numDays);
                  }
                  newSchedule.dailyEntries = newEntries;
              } else {
                  newSchedule.dailyEntries = [];
              }
          }
          return newSchedule;
        }
        return schedule;
      })
    );
  };
  
  const handleDateRangeChange = (field: 'start' | 'end', value: Date | undefined) => {
    if (!value) return;

    let startDate: Date;
    let endDate: Date;

    if (field === 'start') {
        startDate = value;
        if (scheduleType === 'weekly') {
            endDate = addDays(startDate, 6);
        } else { // monthly
            endDate = endOfMonth(startDate);
        }
    } else { // field === 'end'
        endDate = value;
        startDate = scheduleDates.start ? parseISO(scheduleDates.start) : new Date();
    }
    
    const newScheduleDates = {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
    };
    setScheduleDates(newScheduleDates);
  }

  const handleDailyEntryChange = (projectIndex: number, dayIndex: number, field: 'details' | 'percentage', value: any) => {
    setSchedules(prevSchedules => 
        prevSchedules.map((schedule, i) => {
            if (i === projectIndex) {
                const newDailyEntries = schedule.dailyEntries.map((entry, j) => {
                    if (j === dayIndex) {
                        let finalValue = value;
                        if (field === 'percentage') {
                            finalValue = Math.max(0, Math.min(100, Number(value) || 0));
                        }
                        return { ...entry, [field]: finalValue };
                    }
                    return entry;
                });
                return { ...schedule, dailyEntries: newDailyEntries };
            }
            return schedule;
        })
    );
  }

  useEffect(() => {
    const numDays = getNumberOfDays(scheduleDates.start, scheduleDates.end);
    if(numDays <= 0 || !isEditing) return;

    const updatedSchedules = schedules.map(schedule => {
        const newDailyEntries = Array(numDays > 0 ? numDays : 0).fill(null).map((_, i) => schedule.dailyEntries[i] || initialDailyEntry());
        return { ...schedule, startDate: scheduleDates.start, endDate: scheduleDates.end, employeeName, dailyEntries: newDailyEntries };
    });
    setSchedules(updatedSchedules);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleDates, scheduleType, employeeName]);


  const handleSave = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Save Failed", description: "User not authenticated." });
      return;
    }
    setIsSaving(true);
    const dataToSave = { schedules, remarks, scheduleDates, designation, scheduleType };
    
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
          description: "Your work schedule has been saved successfully.",
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
    let y = 15;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 58, 83);
    doc.text(`Work Schedule: ${employeeName}`, 105, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const scheduleDateString = `For the period of ${scheduleDates.start ? format(parseISO(scheduleDates.start), 'PPP') : ''} to ${scheduleDates.end ? format(parseISO(scheduleDates.end), 'PPP') : ''}`;
    doc.text(`Designation: ${designation}`, 14, y);
    doc.text(scheduleDateString, 195, y, { align: 'right' });
    y += 10;

    schedules.forEach((schedule) => {
        if (y > 250) {
            doc.addPage();
            y = 15;
        }
        
        const projectDetailsBody = [
          [{content: `Project No: ${schedule.id || 'N/A'} - ${schedule.projectName || 'N/A'}`, styles: {fontStyle: 'bold', fontSize: 12, fillColor: [22, 163, 74], textColor: [255,255,255]}}],
          [{content: `Overall Details: ${schedule.details || 'No details provided.'}`}],
          [{content: `Status: ${schedule.status || 'N/A'}`}],
          [{content: `Date Range: ${schedule.startDate ? format(parseISO(schedule.startDate), 'd MMM') : 'N/A'} - ${schedule.endDate ? format(parseISO(schedule.endDate), 'd MMM') : 'N/A'}`}],
        ];

        autoTable(doc, {
            body: projectDetailsBody,
            startY: y,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
        });
        
        y = (doc as any).lastAutoTable.finalY + 5;
    });

    if (remarks) {
        if (y > 270) {
            doc.addPage();
            y = 15;
        }
        y += 5;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 58, 83);
        doc.text("Remarks", 14, y);
        y += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitRemarks = doc.splitTextToSize(remarks, 180);
        doc.text(splitRemarks, 14, y);
    }

    doc.save(`work-schedule-${employeeName}.pdf`);
  }
  
  const addRow = () => {
    const numDays = getNumberOfDays(scheduleDates.start, scheduleDates.end);
    setSchedules([...schedules, { 
      id: schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1, 
      employeeName: employeeName, 
      projectName: '', 
      details: '',
      status: 'In Progress', 
      startDate: scheduleDates.start, 
      endDate: scheduleDates.end, 
      dailyEntries: Array(numDays > 0 ? numDays : 0).fill(null).map(initialDailyEntry)
    }]);
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
  
  const renderCell = (value: string | undefined, onChange: (val: any) => void, placeholder?: string) => {
    return isEditing ? <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8" /> : <span className="p-2 block min-h-[32px]">{value || ''}</span>;
  }

  const renderTextareaCell = (value: string | undefined, onChange: (val: any) => void, placeholder?: string) => {
    return isEditing ? <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-20" /> : <p className="p-2 block min-h-[32px] whitespace-pre-wrap">{value || ''}</p>;
  }
  
  const renderPercentageCell = (value: number | undefined, onChange: (val: any) => void) => {
    if (isEditing) {
        return <Input type="number" value={value || 0} onChange={(e) => onChange(e.target.value)} className="h-8 w-20" min="0" max="100"/>
    }
    return <Progress value={value || 0} className="w-full" />
  }

  const renderDateCell = (dateString: string | undefined, onChange: (date: Date | undefined) => void) => {
    const date = dateString && isValid(parseISO(dateString)) ? parseISO(dateString) : undefined;
    if (isEditing) {
      return <DatePicker date={date} onDateChange={onChange} disabled={!isEditing} />;
    }
    return <span className="p-2 block min-h-[32px]">{date ? format(date, 'd-MMM-yy') : ''}</span>;
  };
  
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    if (!user || !firestore) return;
    const taskDocRef = doc(firestore, `users/${user.uid}/tasks/${taskId}`);
    try {
        await updateDoc(taskDocRef, { status: newStatus });
        toast({ title: "Task Updated", description: "Task status has been updated."});
    } catch (error) {
        console.error("Error updating task status:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update task status.' });
    }
  };
  
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

        {assignedTasks.length > 0 && (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ClipboardList /> Assigned Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Task Description</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignedTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.projectName}</TableCell>
                                    <TableCell>{task.taskDescription}</TableCell>
                                    <TableCell>{task.startDate ? format(parseISO(task.startDate), 'PPP') : ''}</TableCell>
                                    <TableCell>{task.endDate ? format(parseISO(task.endDate), 'PPP') : ''}</TableCell>
                                    <TableCell>
                                         <Select value={task.status} onValueChange={(newStatus) => handleTaskStatusChange(task.id, newStatus)}>
                                            <SelectTrigger className='w-40'>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Assigned">Assigned</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}

      <Card className="printable-card">
        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
            <div className='flex items-center gap-4'>
                <Avatar className="h-16 w-16"><AvatarImage src={`https://picsum.photos/seed/${employeeName}/200`} alt={employeeName} /><AvatarFallback>{employeeName?.charAt(0) || 'E'}</AvatarFallback></Avatar>
                <div>
                    {isEditing ? (<Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="text-2xl font-bold p-0 border-0 h-auto focus-visible:ring-0" placeholder="Employee Name"/>) : (<CardTitle className="text-2xl font-bold">{employeeName}</CardTitle>)}
                    {isEditing ? (
                        <Popover open={designationPopoverOpen} onOpenChange={setDesignationPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={designationPopoverOpen}
                              className="w-[280px] justify-between mt-1"
                            >
                              {designation || "Select or type a designation..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[280px] p-0">
                            <Command>
                              <CommandInput 
                                placeholder="Search designation..."
                                onValueChange={(search) => {
                                    if (!designations.some(d => d.toLowerCase() === search.toLowerCase())) {
                                        setDesignation(search);
                                    }
                                }}
                              />
                               <CommandList>
                                <CommandEmpty>No designation found. Type to create.</CommandEmpty>
                                <CommandGroup>
                                  {designations.map((d) => (
                                    <CommandItem
                                      key={d}
                                      value={d}
                                      onSelect={(currentValue) => {
                                        setDesignation(currentValue === designation ? "" : currentValue)
                                        setDesignationPopoverOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          designation === d ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {d}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                    ) : (<p className="text-muted-foreground">{designation || 'No designation'}</p>)}
                </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
                 <p className="text-sm text-muted-foreground">Work Schedule</p>
                 {isEditing && (
                     <RadioGroup value={scheduleType} onValueChange={(val: 'weekly' | 'monthly') => setScheduleType(val)} className="flex gap-4">
                         <div className="flex items-center space-x-2"><RadioGroupItem value="weekly" id="weekly"/><Label htmlFor="weekly">Weekly</Label></div>
                         <div className="flex items-center space-x-2"><RadioGroupItem value="monthly" id="monthly"/><Label htmlFor="monthly">Monthly</Label></div>
                     </RadioGroup>
                 )}
                <div className="flex items-center gap-2">
                    {isEditing ? (<><DatePicker date={scheduleDates.start ? parseISO(scheduleDates.start) : undefined} onDateChange={(date) => handleDateRangeChange('start', date)} /><span className="mx-2">to</span><DatePicker date={scheduleDates.end ? parseISO(scheduleDates.end) : undefined} onDateChange={(date) => handleDateRangeChange('end', date)} disabled={scheduleType==='weekly' || scheduleType==='monthly'} /></>) : (<p className="text-lg font-bold">{scheduleDates.start && format(parseISO(scheduleDates.start), 'PPP')} - {scheduleDates.end && format(parseISO(scheduleDates.end), 'PPP')}</p>)}
                </div>
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
                        <Fragment key={schedule.id}>
                             <TableRow>
                                
                                <TableCell>{renderCell(String(schedule.id), (val) => handleScheduleChange(index, 'id', Number(val) || 0))}</TableCell>
                                <TableCell>{renderCell(schedule.projectName, (val) => handleScheduleChange(index, 'projectName', val))}</TableCell>
                                <TableCell>{renderTextareaCell(schedule.details, (val) => handleScheduleChange(index, 'details', val))}</TableCell>
                                <TableCell>{isEditing ? (<Select value={schedule.status} onValueChange={(value) => handleScheduleChange(index, 'status', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Incomplete">Incomplete</SelectItem></SelectContent></Select>) : (<span className="p-2 block">{schedule.status}</span>)}</TableCell>
                                <TableCell>{renderDateCell(schedule.startDate, (date) => handleScheduleChange(index, 'startDate', date ? format(date, 'yyyy-MM-dd') : ''))}</TableCell>
                                <TableCell>{renderDateCell(schedule.endDate, (date) => handleScheduleChange(index, 'endDate', date ? format(date, 'yyyy-MM-dd') : ''))}</TableCell>
                                <TableCell>{getStatusIcon(schedule.status)}</TableCell>
                                {isEditing && <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>}
                            </TableRow>
                        </Fragment>
                    ))}
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

export default WeeklySchedule;
