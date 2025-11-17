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
import { Edit, Save, Loader2, Download, ArrowLeft, Terminal, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from '@/components/ui/date-picker';
import { addDays, format, parseISO } from 'date-fns';
import { exportDataToCsv } from '@/lib/utils';

const TIMELINE_DOC_ID = "fbl-timeline";

const initialProjectData = [
  {
    srNo: 1,
    projectName: 'FBL-Finance Center-Gulberg LHR',
    area: '16500',
    projectHolder: 'Luqman',
    allocationDate: '2025-10-23',
    siteSurveyStart: '2025-10-24',
    siteSurveyEnd: '2025-10-24',
    contact: '',
    headCount: 'Received',
    proposalStart: '2025-10-24',
    proposalEnd: '2025-11-05',
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
    projectName: 'FBL-Finance Center-F10 Islamabad',
    area: '10100',
    projectHolder: 'Luqman',
    allocationDate: '2025-10-18',
    siteSurveyStart: '2025-10-20',
    siteSurveyEnd: '2025-10-20',
    contact: '',
    headCount: 'Received',
    proposalStart: '2025-10-27',
    proposalEnd: '2025-11-08',
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
    srNo: 3,
    projectName: 'FBL JEHANGIRA NOWSHERA KPK',
    area: '2740',
    projectHolder: 'Luqman',
    allocationDate: '2025-10-16',
    siteSurveyStart: '2025-10-05',
    siteSurveyEnd: '2025-10-06',
    contact: '',
    headCount: 'Received',
    proposalStart: '2025-10-16',
    proposalEnd: '2025-10-18',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-10-20',
    tenderArchEnd: '2025-10-25',
    tenderMepStart: '2025-10-26',
    tenderMepEnd: '2025-11-04',
    boqStart: '2025-10-27',
    boqEnd: '2025-10-27',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '2025-11-04',
    workingDrawingsEnd: '2025-11-08',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 4,
    projectName: 'FBL IBB Chinar Road Mansehra KPK',
    area: '2612',
    projectHolder: 'Luqman',
    allocationDate: '2025-09-24',
    siteSurveyStart: '2025-09-30',
    siteSurveyEnd: '2025-10-01',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '2025-10-02',
    proposalEnd: '2025-10-03',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-10-20',
    tenderArchEnd: '2025-10-25',
    tenderMepStart: '2025-10-30',
    tenderMepEnd: '2025-11-04',
    boqStart: '2025-10-27',
    boqEnd: '2025-10-27',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '2025-11-08',
    workingDrawingsEnd: '2025-11-12',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 5,
    projectName: 'FBL Jameel Chowk Peshawar',
    area: '2259',
    projectHolder: 'Luqman',
    allocationDate: '2025-09-22',
    siteSurveyStart: '2025-10-01',
    siteSurveyEnd: '2025-10-02',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '2025-10-02',
    proposalEnd: '2025-10-04',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-10-20',
    tenderArchEnd: '2025-10-25',
    tenderMepStart: '2025-10-30',
    tenderMepEnd: '2025-11-04',
    boqStart: '2025-10-27',
    boqEnd: '2025-10-27',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 6,
    projectName: 'FBL Jhangi Branch Gujranwala',
    area: '2270',
    projectHolder: 'Luqman Mujahid',
    allocationDate: '2025-09-08',
    siteSurveyStart: '2025-09-04',
    siteSurveyEnd: '2025-09-05',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '2025-09-08',
    proposalEnd: '2025-09-11',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-09-15',
    tenderArchEnd: '2025-09-24',
    tenderMepStart: '2025-10-10',
    tenderMepEnd: '2025-10-12',
    boqStart: '2025-10-02',
    boqEnd: '2025-10-04',
    tenderStatus: 'Sent',
    comparative: 'Done',
    workingDrawingsStart: '2025-10-21',
    workingDrawingsEnd: '2025-10-25',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 7,
    projectName: 'FBL Ferozpur Road Lahore',
    area: '2492',
    projectHolder: 'Luqman Mujahid',
    allocationDate: '2025-09-08',
    siteSurveyStart: '2025-09-05',
    siteSurveyEnd: '2025-09-06',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '2025-09-08',
    proposalEnd: '2025-09-12',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-09-13',
    tenderArchEnd: '2025-09-24',
    tenderMepStart: '2025-10-10',
    tenderMepEnd: '2025-10-14',
    boqStart: '2025-10-02',
    boqEnd: '2025-10-04',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '2025-11-02',
    workingDrawingsEnd: '2025-11-05',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 8,
    projectName: 'FBL Park View City Lahore',
    area: '2,900.00',
    projectHolder: 'Luqman Mujahid',
    allocationDate: '2025-09-05',
    siteSurveyStart: '2025-09-03',
    siteSurveyEnd: '2025-09-04',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '2025-09-05',
    proposalEnd: '2025-09-12',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-09-15',
    tenderArchEnd: '2025-09-24',
    tenderMepStart: '2025-10-02',
    tenderMepEnd: '2025-10-04',
    boqStart: '2025-09-25',
    boqEnd: '2025-09-27',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '2025-11-06',
    workingDrawingsEnd: '2025-11-09',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 9,
    projectName: 'FBL CPC-KHARIAN-BRANCH',
    area: '1,635.00',
    projectHolder: 'Luqman Mujahid',
    allocationDate: '2025-08-20',
    siteSurveyStart: '2025-08-21',
    siteSurveyEnd: '2025-08-22',
    contact: '',
    headCount: 'Received',
    proposalStart: '2025-09-05',
    proposalEnd: '2025-09-11',
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
    srNo: 10,
    projectName: 'FBL Bhowana.',
    area: '2,183.00',
    projectHolder: 'Luqman Mujahid',
    allocationDate: '',
    siteSurveyStart: '2025-07-16',
    siteSurveyEnd: '2025-07-17',
    contact: '',
    headCount: 'Received',
    proposalStart: '2025-08-09',
    proposalEnd: '',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-08-25',
    tenderArchEnd: '',
    tenderMepStart: '',
    tenderMepEnd: '',
    boqStart: '',
    boqEnd: '',
    tenderStatus: 'sent',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 11,
    projectName: 'FBL Peer-Wadahi Road Branch Rawalpindi',
    area: '2,098.00',
    projectHolder: 'Noman',
    allocationDate: '2025-04-23',
    siteSurveyStart: '2025-04-24',
    siteSurveyEnd: '2025-04-25',
    contact: 'N/A',
    headCount: 'N/A',
    proposalStart: 'N/A',
    proposalEnd: 'N/A',
    '3dStart': 'N/A',
    '3dEnd': 'N/A',
    tenderArchStart: 'N/A',
    tenderArchEnd: 'N/A',
    tenderMepStart: 'N/A',
    tenderMepEnd: 'N/A',
    boqStart: 'N/A',
    boqEnd: 'N/A',
    tenderStatus: 'sent',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: 'DONE',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 12,
    projectName: 'FBL Gulbahar, Peshawer',
    area: '2,000.00',
    projectHolder: 'Noman',
    allocationDate: '2024-10-24',
    siteSurveyStart: '2024-11-04',
    siteSurveyEnd: '2024-11-05',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '2024-11-08',
    proposalEnd: '2024-11-12',
    '3dStart': '2024-11-13',
    '3dEnd': '2024-11-15',
    tenderArchStart: '2024-11-16',
    tenderArchEnd: '2024-11-24',
    tenderMepStart: '2024-11-15',
    tenderMepEnd: '2024-11-22',
    boqStart: '2024-11-23',
    boqEnd: '2024-11-26',
    tenderStatus: 'sent',
    comparative: 'Done',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 13,
    projectName: 'FBL Guest House DHA Phase-4 Lahore',
    area: '4,500.00',
    projectHolder: 'Noman',
    allocationDate: '2024-08-01',
    siteSurveyStart: '2024-08-06',
    siteSurveyEnd: '2024-08-07',
    contact: 'Done',
    headCount: 'N/A',
    proposalStart: '2024-08-22',
    proposalEnd: '2024-09-16',
    '3dStart': 'N/A',
    '3dEnd': 'N/A',
    tenderArchStart: '2024-10-01',
    tenderArchEnd: '2024-10-26',
    tenderMepStart: '',
    tenderMepEnd: '',
    boqStart: '2025-02-28',
    boqEnd: '2025-03-01',
    tenderStatus: 'sent',
    comparative: 'Done',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: 'PENDING',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 14,
    projectName: 'FBL Shahdara',
    area: '2,678.00',
    projectHolder: 'Adnan',
    allocationDate: '2025-06-11',
    siteSurveyStart: '2025-06-11',
    siteSurveyEnd: '2025-06-13',
    contact: 'Done',
    headCount: '',
    proposalStart: '',
    proposalEnd: '',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-06-16',
    tenderArchEnd: '2025-06-21',
    tenderMepStart: '2025-06-22',
    tenderMepEnd: '2025-06-26',
    boqStart: '',
    boqEnd: '',
    tenderStatus: 'sent',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 15,
    projectName: 'FBL RHQ (LG + GF)',
    area: '33,102.00',
    projectHolder: 'Luqman Haseeb',
    allocationDate: '',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: '',
    proposalStart: '2025-08-28',
    proposalEnd: '',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '2025-08-28',
    tenderArchEnd: '',
    tenderMepStart: '',
    tenderMepEnd: '',
    boqStart: '',
    boqEnd: '',
    tenderStatus: 'sent',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 16,
    projectName: 'FBL RHQ (Basment)',
    area: '33,102.00',
    projectHolder: 'Luqman Haseeb',
    allocationDate: '',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'WAITING',
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
];


const FblTimelinePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(initialProjectData);
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
        }
      })
      .catch(async (serverError) => {
        console.error("Error fetching timeline data:", serverError);
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
  
  const handleSave = () => {
    if (!timelineDocRef) {
      toast({ variant: "destructive", title: "Save Failed", description: "User not authenticated." });
      return;
    }
    setIsSaving(true);
    const dataToSave = { projectData };
    setDocumentNonBlocking(timelineDocRef, dataToSave, { merge: true });
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast({
        title: "Data Saved",
        description: "Your changes have been saved successfully.",
      });
    }, 1000);
  };

  const handleDownloadCsv = () => {
    exportDataToCsv(projectData, 'fbl-timeline-data');
  }
  
  const renderCell = (value: string | undefined, onChange: (val: string) => void) => {
    return isEditing ? <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8"/> : (value || '');
  }

  const renderDateCell = (value: string | undefined, onChange: (val: Date | undefined) => void) => {
      const date = value ? new Date(value) : undefined;
      return isEditing ? (
          <DatePicker date={date} onDateChange={onChange} disabled={!isEditing} />
      ) : (
          value ? format(new Date(value), 'd-MMM-yy') : ''
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
        <h1 className="text-2xl font-bold">FBL Timeline</h1>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadCsv} variant="outline"><FileDown className="mr-2 h-4 w-4" /> Download CSV</Button>
            <Button onClick={() => window.print()} variant="outline"><Download className="mr-2 h-4 w-4" /> Download</Button>
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
              FBL Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end items-center gap-4">
              <span className="font-bold text-lg text-teal-600">Faysal Bank</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse border border-gray-400 text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[50px]">Sr.No</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[150px]">Project Name</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Area in Sft</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[120px]">Project Holder</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[100px]">Allocation Date / RFP</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">Site Survey</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Contact</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[100px]">Head Count / Requirment</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">Proposal / Design Development</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">3D's</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">Tender Package Architectural</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">Tender Package MEP</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">BOQ</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Tender Status</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Comparative</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">Working Drawings</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Site Visit</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Final Bill</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Project Closure</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectData.map((project, index) => (
                  <TableRow key={project.srNo}>
                    <TableCell className="border border-gray-400 text-center">{project.srNo}</TableCell>
                    <TableCell className="border border-gray-400">{renderCell(project.projectName, val => handleProjectDataChange(index, 'projectName', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.area, val => handleProjectDataChange(index, 'area', val))}</TableCell>
                    <TableCell className="border border-gray-400">{renderCell(project.projectHolder, val => handleProjectDataChange(index, 'projectHolder', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.allocationDate, val => handleProjectDataChange(index, 'allocationDate', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.siteSurveyStart, val => handleProjectDataChange(index, 'siteSurveyStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.siteSurveyEnd, val => handleProjectDataChange(index, 'siteSurveyEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.contact, val => handleProjectDataChange(index, 'contact', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.headCount, val => handleProjectDataChange(index, 'headCount', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.proposalStart, val => handleProjectDataChange(index, 'proposalStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.proposalEnd, val => handleProjectDataChange(index, 'proposalEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project['3dStart'], val => handleProjectDataChange(index, '3dStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project['3dEnd'], val => handleProjectDataChange(index, '3dEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.tenderArchStart, val => handleProjectDataChange(index, 'tenderArchStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.tenderArchEnd, val => handleProjectDataChange(index, 'tenderArchEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.tenderMepStart, val => handleProjectDataChange(index, 'tenderMepStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.tenderMepEnd, val => handleProjectDataChange(index, 'tenderMepEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.boqStart, val => handleProjectDataChange(index, 'boqStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.boqEnd, val => handleProjectDataChange(index, 'boqEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderStatus, val => handleProjectDataChange(index, 'tenderStatus', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.comparative, val => handleProjectDataChange(index, 'comparative', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.workingDrawingsStart, val => handleProjectDataChange(index, 'workingDrawingsStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderDateCell(project.workingDrawingsEnd, val => handleProjectDataChange(index, 'workingDrawingsEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.siteVisit, val => handleProjectDataChange(index, 'siteVisit', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.finalBill, val => handleProjectDataChange(index, 'finalBill', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.projectClosure, val => handleProjectDataChange(index, 'projectClosure', val))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-4" />
            <div className="p-4 border border-gray-400">
              <h4 className="font-bold mb-2">Overall Status</h4>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default FblTimelinePage;
