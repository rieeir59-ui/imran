
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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Loader2, Download, ArrowLeft, Terminal, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from '@/components/ui/date-picker';
import { addDays, format, parseISO, isValid } from 'date-fns';
import { exportDataToCsv, exportDataToPdf } from '@/lib/utils';

const TIMELINE_DOC_ID = "cbd-timeline";

const initialProjectData = [
  {
    srNo: 1,
    projectName: 'Nawaz sharif Business Hub',
    area: '25 Kanals',
    projectHolder: 'ASAD/ WALEED/ Jabbar',
    allocationDate: '',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: '',
    headCount: '',
    proposalStart: '',
    proposalEnd: '',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '',
    tenderArchEnd: '',
    tenderMepStart: '',
    tenderMepEnd: '',
    boqStart: '',
    boqEnd: '',
    tenderStatus: '',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 2,
    projectName: 'C-B-D',
    area: '',
    projectHolder: 'ASAD/ WALEED',
    allocationDate: '2025-06-16',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: '',
    headCount: '',
    proposalStart: '2025-06-16',
    proposalEnd: '',
    '3dStart': '2025-06-16',
    '3dEnd': '',
    tenderArchStart: '',
    tenderArchEnd: '',
    tenderMepStart: '',
    tenderMepEnd: '',
    boqStart: '',
    boqEnd: '',
    tenderStatus: '',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
];

const initialOverallStatus = [
  { no: 1, text: 'Project Started' },
  { no: 2, text: 'final drawings has been sent only animation need to amend and resend.' },
];

const CbdTimelinePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(initialProjectData);
  const [overallStatus, setOverallStatus] = useState(initialOverallStatus);
  const [remarks, setRemarks] = useState({ text: 'Maam Isbah Remarks & Order', date: '' });
  const { toast } = useToast();
  
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const timelineDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/projectTimelines/${TIMELINE_DOC_ID}`);
  }, [user, firestore]);

  useEffect(() => {
    if (!timelineDocRef) return;

    setIsLoading(true);
    getDoc(timelineDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.projectData) setProjectData(data.projectData);
          if (data.overallStatus) setOverallStatus(data.overallStatus);
          if (data.remarks) setRemarks(data.remarks);
        }
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: timelineDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [timelineDocRef]);

  const handleProjectDataChange = (index: number, field: string, value: any) => {
    const updatedData = [...projectData];
    const task = updatedData[index] as any;
    task[field] = value;
    
    if (field === 'start' && value instanceof Date) {
        task.start = format(value, 'yyyy-MM-dd');
    }

    setProjectData(updatedData);
  };
  
  const handleStatusChange = (index: number, value: string) => {
    const updatedStatus = [...overallStatus];
    updatedStatus[index].text = value;
    setOverallStatus(updatedStatus);
  };
  
  const handleRemarksChange = (field: 'text' | 'date', value: string) => {
    setRemarks(prev => ({...prev, [field]: value}));
  }

  const handleSave = () => {
    if (!timelineDocRef) {
      toast({ variant: "destructive", title: "Save Failed", description: "User not authenticated." });
      return;
    }
    setIsSaving(true);
    const dataToSave = { projectData, overallStatus, remarks };
    setDoc(timelineDocRef, dataToSave, { merge: true })
      .then(() => {
        setIsSaving(false);
        setIsEditing(false);
        toast({
          title: "Data Saved",
          description: "Your changes have been saved successfully.",
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: timelineDocRef.path,
          operation: 'write',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
      });
  };

  const handleDownloadCsv = () => {
    exportDataToCsv(projectData, 'cbd-timeline-data');
  }

  const handleDownloadPdf = () => {
    exportDataToPdf('CBD Project Progress Chart', projectData, 'cbd-timeline');
  }

  const renderCell = (value: string | undefined, onChange: (val: string) => void) => {
    return isEditing ? <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8" /> : (value || '');
  }
  
  const renderDateCell = (value: string | undefined, onChange: (val: Date | undefined) => void) => {
      const date = value && isValid(new Date(value)) ? new Date(value) : undefined;
      return isEditing ? (
          <DatePicker date={date} onDateChange={onChange} disabled={!isEditing} />
      ) : (
          date ? format(date, 'd-MMM-yy') : (value || '')
      )
  }

  if (isUserLoading || isLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading Timeline...</p>
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
        <h1 className="text-2xl font-bold">CBD Timeline</h1>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadCsv} variant="outline"><FileDown className="mr-2 h-4 w-4" /> Download CSV</Button>
            <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            {isEditing ? (
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Save
                </Button>
            ) : (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2" /> Edit</Button>
            )}
        </div>
      </div>
      <Card className="printable-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/4"></div>
            <CardTitle className="text-center text-xl font-bold flex-1">
              CBD Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end items-center gap-4">
              <span className="font-bold text-lg text-blue-600">CBD</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse border border-gray-400 text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[30px]"
                  >
                    Sr.No
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[120px]"
                  >
                    Project Name
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[60px]"
                  >
                    Area in Sft
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[90px]"
                  >
                    Project Holder
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[70px]"
                  >
                    Allocation Date / RFP
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center w-[140px]"
                  >
                    Site Survey
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[60px]"
                  >
                    Contact
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[70px]"
                  >
                    Head Count / Requirment
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center w-[200px]"
                  >
                    Proposal / Design Development
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center w-[140px]"
                  >
                    3D's
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center w-[160px]"
                  >
                    Tender Package Architectural
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center w-[160px]"
                  >
                    Tender Package MEP
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center w-[140px]"
                  >
                    BOQ
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[60px]"
                  >
                    Tender Status
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[60px]"
                  >
                    Comparative
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center w-[140px]"
                  >
                    Working Drawings
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[60px]"
                  >
                    Site Visit
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[60px]"
                  >
                    Final Bill
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle w-[60px]"
                  >
                    Project Closure
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border border-gray-400 text-center w-[70px]">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[70px]">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[70px]">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[70px]">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[80px]">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[80px]">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[80px]">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[80px]">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[70px]">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[70px]">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[70px]">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center w-[70px]">
                    End Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectData.map((project, index) => (
                  <TableRow key={project.srNo}>
                    <TableCell className="border border-gray-400 text-center">
                      {project.srNo}
                    </TableCell>
                    <TableCell className="border border-gray-400">
                      {renderCell(project.projectName, (val) => handleProjectDataChange(index, 'projectName', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderCell(project.area, (val) => handleProjectDataChange(index, 'area', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400">
                      {renderCell(project.projectHolder, (val) => handleProjectDataChange(index, 'projectHolder', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.allocationDate, (val) => handleProjectDataChange(index, 'allocationDate', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.siteSurveyStart, (val) => handleProjectDataChange(index, 'siteSurveyStart', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.siteSurveyEnd, (val) => handleProjectDataChange(index, 'siteSurveyEnd', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderCell(project.contact, (val) => handleProjectDataChange(index, 'contact', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderCell(project.headCount, (val) => handleProjectDataChange(index, 'headCount', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.proposalStart, (val) => handleProjectDataChange(index, 'proposalStart', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.proposalEnd, (val) => handleProjectDataChange(index, 'proposalEnd', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project['3dStart'], (val) => handleProjectDataChange(index, '3dStart', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project['3dEnd'], (val) => handleProjectDataChange(index, '3dEnd', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.tenderArchStart, (val) => handleProjectDataChange(index, 'tenderArchStart', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.tenderArchEnd, (val) => handleProjectDataChange(index, 'tenderArchEnd', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.tenderMepStart, (val) => handleProjectDataChange(index, 'tenderMepStart', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.tenderMepEnd, (val) => handleProjectDataChange(index, 'tenderMepEnd', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.boqStart, (val) => handleProjectDataChange(index, 'boqStart', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.boqEnd, (val) => handleProjectDataChange(index, 'boqEnd', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderCell(project.tenderStatus, (val) => handleProjectDataChange(index, 'tenderStatus', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderCell(project.comparative, (val) => handleProjectDataChange(index, 'comparative', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.workingDrawingsStart, (val) => handleProjectDataChange(index, 'workingDrawingsStart', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderDateCell(project.workingDrawingsEnd, (val) => handleProjectDataChange(index, 'workingDrawingsEnd', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderCell(project.siteVisit, (val) => handleProjectDataChange(index, 'siteVisit', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderCell(project.finalBill, (val) => handleProjectDataChange(index, 'finalBill', val))}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {renderCell(project.projectClosure, (val) => handleProjectDataChange(index, 'projectClosure', val))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-4" />
            <div className="p-4 border border-gray-400">
              <h4 className="font-bold mb-2">Overall Status</h4>
              <Table>
                <TableBody>
                  {overallStatus.map((status, index) => (
                    <TableRow key={status.no}>
                      <TableCell className="w-8">{status.no}</TableCell>
                      <TableCell>{isEditing ? <Input value={status.text} onChange={e => handleStatusChange(index, e.target.value)} /> : status.text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border border-gray-400 border-t-0">
              <div className="flex justify-between">
                {isEditing ? <Textarea value={remarks.text} onChange={e => handleRemarksChange('text', e.target.value)} /> : <p>{remarks.text}</p>}
                {isEditing ? <Input type="date" value={remarks.date} onChange={e => handleRemarksChange('date', e.target.value)} /> : <p>Date: {remarks.date}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default CbdTimelinePage;
