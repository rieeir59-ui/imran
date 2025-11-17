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
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { exportDataToCsv } from '@/lib/utils';

const TIMELINE_DOC_ID = "residential-timeline";

const initialProjectData = [
  {
    srNo: 1,
    projectName: 'Mr Asim Khan',
    areaInSft: '',
    projectHolder: '',
    allocationDate: '',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: 'Done',
    proposalEnd: 'Done',
    '3dStart': '12-Oct-25',
    '3dEnd': 'Done',
    archStart: 'Done',
    archEnd: 'Done',
    mepStart: 'Done',
    mepEnd: 'Done',
    boqStart: 'Done',
    boqEnd: 'Done',
    tenderStatus: 'Done',
    comparative: 'Done',
    workingDrawingsStart: 'Done',
    workingDrawingsEnd: 'Done',
    siteVisit: 'Done',
    finalBill: 'Done',
    projectClosure: 'Done',
  },
  {
    srNo: 2,
    projectName: 'Mr Waleed Mustaq',
    areaInSft: '',
    projectHolder: 'Khizar',
    allocationDate: '',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: 'Done',
    proposalEnd: 'Done',
    '3dStart': 'Done',
    '3dEnd': 'Done',
    archStart: 'Done',
    archEnd: 'Done',
    mepStart: 'Done',
    mepEnd: 'Done',
    boqStart: 'Done',
    boqEnd: 'Done',
    tenderStatus: 'Done',
    comparative: 'Done',
    workingDrawingsStart: 'Done',
    workingDrawingsEnd: 'Done',
    siteVisit: 'Done',
    finalBill: 'Done',
    projectClosure: 'Done',
  },
  {
    srNo: 3,
    projectName: 'Mr. Shahpar Masood',
    areaInSft: '',
    projectHolder: 'Sobia/Waqas',
    allocationDate: '23-Jul-25',
    siteSurveyStart: 'n/a',
    siteSurveyEnd: 'n/a',
    contact: 'Done',
    headCount: '',
    proposalStart: '1-Jul-25',
    proposalEnd: '12-Aug-25',
    '3dStart': '6-Aug-25',
    '3dEnd': '23-Jul-25',
    archStart: '14-Sep-25',
    archEnd: '',
    mepStart: '',
    mepEnd: '',
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
    srNo: 4,
    projectName: 'Rana Sajjad',
    areaInSft: '',
    projectHolder: 'Sobia/Amna',
    allocationDate: '',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: '',
    headCount: '',
    proposalStart: '',
    proposalEnd: '',
    '3dStart': '',
    '3dEnd': '',
    archStart: '',
    archEnd: '',
    mepStart: '',
    mepEnd: '',
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
  { no: 1, text: 'Construction In Progress' },
  { no: 2, text: 'Construction In Progress (bathroom revision)' },
  { no: 3, text: 'Mep and submission drawing in progress' },
  { no: 4, text: 'Basement Multi Purpose area is in process.' },
];

const ResidentialTimelinePage = () => {
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

  const handleProjectDataChange = (index: number, field: string, value: string) => {
    const updatedData = [...projectData];
    (updatedData[index] as any)[field] = value;
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
    exportDataToCsv(projectData, 'residential-timeline-data');
  }

  const renderCell = (value: string, onChange: (val: string) => void) => {
    return isEditing ? <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8" /> : value;
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
        <h1 className="text-2xl font-bold">Residential Projects</h1>
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
            <CardTitle className="text-center text-xl font-bold flex-1">
              Residential Projects Progress Chart
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse border border-gray-400 text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[50px]">Sr.No</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[150px]">Project Name</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Area In Sft</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[120px]">Project Holder</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[100px]">Allocation Date / RFP</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">Site Survey</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Contact</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[100px]">Head Count / Requirment</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[240px]">Proposal / Design Development</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">3D's</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[240px]">Architectural / Interior Drawings</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[240px]">MEP Drawings</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">BOQ</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Tender Status</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[60px]">Comparative</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center w-[200px]">Working Drawings</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Site Visit</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Final Bill</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle w-[80px]">Project Closure</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[120px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[120px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[100px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[120px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[120px]">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[120px]">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center w-[120px]">End Date</TableHead>
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
                    <TableCell className="border border-gray-400">{renderCell(project.projectName, (val) => handleProjectDataChange(index, 'projectName', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.areaInSft, (val) => handleProjectDataChange(index, 'areaInSft', val))}</TableCell>
                    <TableCell className="border border-gray-400">{renderCell(project.projectHolder, (val) => handleProjectDataChange(index, 'projectHolder', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.allocationDate, (val) => handleProjectDataChange(index, 'allocationDate', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.siteSurveyStart, (val) => handleProjectDataChange(index, 'siteSurveyStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.siteSurveyEnd, (val) => handleProjectDataChange(index, 'siteSurveyEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.contact, (val) => handleProjectDataChange(index, 'contact', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.headCount, (val) => handleProjectDataChange(index, 'headCount', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.proposalStart, (val) => handleProjectDataChange(index, 'proposalStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.proposalEnd, (val) => handleProjectDataChange(index, 'proposalEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project['3dStart'], (val) => handleProjectDataChange(index, '3dStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project['3dEnd'], (val) => handleProjectDataChange(index, '3dEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.archStart, (val) => handleProjectDataChange(index, 'archStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.archEnd, (val) => handleProjectDataChange(index, 'archEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.mepStart, (val) => handleProjectDataChange(index, 'mepStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.mepEnd, (val) => handleProjectDataChange(index, 'mepEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.boqStart, (val) => handleProjectDataChange(index, 'boqStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.boqEnd, (val) => handleProjectDataChange(index, 'boqEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderStatus, (val) => handleProjectDataChange(index, 'tenderStatus', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.comparative, (val) => handleProjectDataChange(index, 'comparative', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.workingDrawingsStart, (val) => handleProjectDataChange(index, 'workingDrawingsStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.workingDrawingsEnd, (val) => handleProjectDataChange(index, 'workingDrawingsEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.siteVisit, (val) => handleProjectDataChange(index, 'siteVisit', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.finalBill, (val) => handleProjectDataChange(index, 'finalBill', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.projectClosure, (val) => handleProjectDataChange(index, 'projectClosure', val))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-4" />
            <div className="p-4 border border-gray-400">
              <h4 className="font-bold mb-2">OVERALL STATUS</h4>
              <Table>
                <TableBody>
                  {overallStatus.map((status, index) => (
                    <TableRow key={status.no}>
                      <TableCell className="w-8">{status.no}.</TableCell>
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

export default ResidentialTimelinePage;
