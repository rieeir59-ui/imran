'use client';

import React, { useState } from 'react';
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
import { Edit, Save, Loader2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

const initialProjectData = [
  {
    srNo: 1,
    projectName: 'UBL Bhowana, Chiniot',
    area: '7,600.00',
    projectHolder: 'Adnan Luqman',
    allocationDate: '6-may-25',
    siteSurveyStart: '20-may-25',
    siteSurveyEnd: '21-may-25',
    contact: 'Done',
    headCount: '6-may-25',
    proposalStart: '6-Jul-25',
    proposalEnd: 'Done',
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
    projectName: 'UBL QASIMABAD, HYDERABAD',
    area: '13,600.00',
    projectHolder: '',
    allocationDate: 'Done',
    siteSurveyStart: 'Done',
    siteSurveyEnd: 'Done',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: 'Done',
    proposalEnd: 'Done',
    '3dStart': 'Done',
    '3dEnd': 'Done',
    tenderArchStart: 'Done',
    tenderArchEnd: 'Done',
    tenderMepStart: 'Done',
    tenderMepEnd: 'Done',
    boqStart: 'Done',
    boqEnd: 'Done',
    tenderStatus: 'Done',
    comparative: 'Done',
    workingDrawingsStart: 'Done',
    workingDrawingsEnd: 'Done',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 3,
    projectName: 'UBL NELA-GUMBAD LHR',
    area: '',
    projectHolder: '',
    allocationDate: '',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: '',
    proposalEnd: 'Done',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '',
    tenderArchEnd: '',
    tenderMepStart: '',
    tenderMepEnd: '',
    boqStart: '',
    boqEnd: '',
    tenderStatus: 'Hold',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 4,
    projectName: 'UBL PHASE 6',
    area: '13,085.00',
    projectHolder: 'Adnan Haseeb',
    allocationDate: '6-april-24',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: '',
    proposalStart: '',
    proposalEnd: 'Done',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: 'Sent',
    tenderArchEnd: '',
    tenderMepStart: 'Pending',
    tenderMepEnd: '',
    boqStart: 'Pending',
    boqEnd: '',
    tenderStatus: 'Done',
    comparative: 'In Revision',
    workingDrawingsStart: '',
    workingDrawingsEnd: 'In Revision',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 5,
    projectName: 'State Life Society',
    area: '6,691.00',
    projectHolder: 'Adnan Haseeb',
    allocationDate: '6-March-24',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: '',
    headCount: '',
    proposalStart: '',
    proposalEnd: 'Done',
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
    workingDrawingsStart: '23-Oct-24',
    workingDrawingsEnd: '28-Oct-24',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
];

const initialOverallStatus = [
    { no: 1, text: 'Proposal sent and waiting for approval.' },
    { no: 2, text: 'Visit required' },
    { no: 3, text: 'on Hold' },
    { no: 4, text: 'Construction in Progress.' },
    { no: 5, text: 'Tender Working as per new theme.' },
]

const UblTimelinePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectData, setProjectData] = useState(initialProjectData);
  const [overallStatus, setOverallStatus] = useState(initialOverallStatus);
  const [remarks, setRemarks] = useState({ text: 'Maam Isbah Remarks & Order', date: '' });
  const { toast } = useToast();

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
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast({
        title: "Data Saved",
        description: "Your changes have been saved successfully.",
      });
    }, 1000);
  };

  const renderCell = (value: string, onChange: (val: string) => void) => {
    return isEditing ? <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8" /> : value;
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6 no-print">
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
        <h1 className="text-2xl font-bold">UBL Timeline</h1>
        <div className="flex items-center gap-2">
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
              UBL Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end items-center gap-4">
              <span className="font-bold text-lg text-blue-700">UBL</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse border border-gray-400">
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Sr.No</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Project Name</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Area In Sft</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Project Holder</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Allocation Date / RFP</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Site Survey</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Contact</TableHead>
                  <TableHead colSpan={1} rowSpan={2} className="border border-gray-400 text-center align-middle">Head Count</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Proposal / Design Development</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">3D's</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Tender Package Architectural</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Tender Package MEP</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">BOQ</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Tender Status</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Comparative</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Working Drawings</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Site Visit</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Final Bill</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Project Closure</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border border-gray-400 text-center">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">End Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">End Date</TableHead>
                   <TableHead className="border border-gray-400 text-center">Start Date</TableHead>
                  <TableHead className="border border-gray-400 text-center">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectData.map((project, index) => (
                  <TableRow key={project.srNo}>
                    <TableCell className="border border-gray-400 text-center">{project.srNo}</TableCell>
                    <TableCell className="border border-gray-400">{renderCell(project.projectName, (val) => handleProjectDataChange(index, 'projectName', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.area, (val) => handleProjectDataChange(index, 'area', val))}</TableCell>
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
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderArchStart, (val) => handleProjectDataChange(index, 'tenderArchStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderArchEnd, (val) => handleProjectDataChange(index, 'tenderArchEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderMepStart, (val) => handleProjectDataChange(index, 'tenderMepStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderMepEnd, (val) => handleProjectDataChange(index, 'tenderMepEnd', val))}</TableCell>
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
            <Separator className="my-4"/>
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

export default UblTimelinePage;
