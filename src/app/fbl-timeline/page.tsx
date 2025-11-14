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
import { Edit, Save, Loader2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

const initialProjectData = [
  {
    srNo: 1,
    projectName: 'FBL-Finance Center-Gulberg LHR',
    area: '16500',
    projectHolder: 'Luqman',
    allocationDate: '23-Oct-25',
    siteSurveyStart: '24-Oct-25',
    siteSurveyEnd: '24-Oct-25',
    contact: '',
    headCount: 'Received',
    proposalStart: '24-Oct-25',
    proposalEnd: '5-Nov-25',
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
    allocationDate: '18-Oct-25',
    siteSurveyStart: '20-Oct-25',
    siteSurveyEnd: '20-Oct-25',
    contact: '',
    headCount: 'Received',
    proposalStart: '27-Oct-25',
    proposalEnd: '8-Nov-25',
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
    allocationDate: '16-Oct-25',
    siteSurveyStart: '5-Oct-25',
    siteSurveyEnd: '6-Oct-25',
    contact: '',
    headCount: 'Received',
    proposalStart: '16-Oct-25',
    proposalEnd: '18-Oct-25',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '20-Oct-25',
    tenderArchEnd: '25-Oct-25',
    tenderMepStart: '26-Oct-25',
    tenderMepEnd: '4-Nov-25',
    boqStart: '27-Oct-25',
    boqEnd: '27-Oct-25',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '4-Nov-25',
    workingDrawingsEnd: '8-Nov-25',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 4,
    projectName: 'FBL IBB Chinar Road Mansehra KPK',
    area: '2612',
    projectHolder: 'Luqman',
    allocationDate: '24-Sep-25',
    siteSurveyStart: '30-Sep-25',
    siteSurveyEnd: '1-Oct-25',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '2-Oct-25',
    proposalEnd: '3-Oct-25',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '20-Oct-25',
    tenderArchEnd: '25-Oct-25',
    tenderMepStart: '30-Oct-25',
    tenderMepEnd: '4-Nov-25',
    boqStart: '27-Oct-25',
    boqEnd: '27-Oct-25',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '8-Nov-25',
    workingDrawingsEnd: '12-Nov-25',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 5,
    projectName: 'FBL Jameel Chowk Peshawar',
    area: '2259',
    projectHolder: 'Luqman',
    allocationDate: '22-Sep-25',
    siteSurveyStart: '1-Oct-25',
    siteSurveyEnd: '2-Oct-25',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '2-Oct-25',
    proposalEnd: '4-Oct-25',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '20-Oct-25',
    tenderArchEnd: '25-Oct-25',
    tenderMepStart: '30-Oct-25',
    tenderMepEnd: '4-Nov-25',
    boqStart: '27-Oct-25',
    boqEnd: '27-Oct-25',
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
    allocationDate: '8-Sep-25',
    siteSurveyStart: '4-Sep-25',
    siteSurveyEnd: '5-Sep-25',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '8-Sep-25',
    proposalEnd: '11-Sep-25',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '15-Sep-25',
    tenderArchEnd: '24-Sep-25',
    tenderMepStart: '10-Oct-25',
    tenderMepEnd: '12-Oct-25',
    boqStart: '2-Oct-25',
    boqEnd: '4-Oct-25',
    tenderStatus: 'Sent',
    comparative: 'Done',
    workingDrawingsStart: '21-Oct-25',
    workingDrawingsEnd: '25-Oct-25',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 7,
    projectName: 'FBL Ferozpur Road Lahore',
    area: '2492',
    projectHolder: 'Luqman Mujahid',
    allocationDate: '8-Sep-25',
    siteSurveyStart: '5-Sep-25',
    siteSurveyEnd: '6-Sep-25',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '8-Sep-25',
    proposalEnd: '12-Sep-25',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '13-Sep-25',
    tenderArchEnd: '24-Sep-25',
    tenderMepStart: '10-Oct-25',
    tenderMepEnd: '14-Oct-25',
    boqStart: '2-Oct-25',
    boqEnd: '4-Oct-25',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '2-Nov-25',
    workingDrawingsEnd: '5-Nov-25',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 8,
    projectName: 'FBL Park View City Lahore',
    area: '2,900.00',
    projectHolder: 'Luqman Mujahid',
    allocationDate: '5-Sep-25',
    siteSurveyStart: '3-Sep-25',
    siteSurveyEnd: '4-Sep-25',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '5-Sep-25',
    proposalEnd: '12-Sep-25',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '15-Sep-25',
    tenderArchEnd: '24-Sep-25',
    tenderMepStart: '2-Oct-25',
    tenderMepEnd: '4-Oct-25',
    boqStart: '25-Sep-25',
    boqEnd: '27-Sep-25',
    tenderStatus: 'Sent',
    comparative: '',
    workingDrawingsStart: '6-Nov-25',
    workingDrawingsEnd: '9-Nov-25',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 9,
    projectName: 'FBL CPC-KHARIAN-BRANCH',
    area: '1,635.00',
    projectHolder: 'Luqman Mujahid',
    allocationDate: '20-Aug-25',
    siteSurveyStart: '21-Aug-25',
    siteSurveyEnd: '22-Aug-25',
    contact: '',
    headCount: 'Received',
    proposalStart: '5-Sep-25',
    proposalEnd: '11-Sep-25',
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
    siteSurveyStart: '16-Jul-25',
    siteSurveyEnd: '17-Jul-25',
    contact: '',
    headCount: 'Received',
    proposalStart: '9-Aug-25',
    proposalEnd: '',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '25-Aug-25',
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
    allocationDate: '23-Apr-25',
    siteSurveyStart: '24-Apr-25',
    siteSurveyEnd: '25-Apr-25',
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
    allocationDate: '24-Oct-24',
    siteSurveyStart: '4-Nov-24',
    siteSurveyEnd: '5-Nov-24',
    contact: 'Done',
    headCount: 'Received',
    proposalStart: '8-Nov-24',
    proposalEnd: '12-Nov-24',
    '3dStart': '13-Nov-24',
    '3dEnd': '15-Nov-24',
    tenderArchStart: '16-Nov-24',
    tenderArchEnd: '24-Nov-24',
    tenderMepStart: '15-Nov-24',
    tenderMepEnd: '22-Nov-24',
    boqStart: '23-Nov-24',
    boqEnd: '26-Nov-24',
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
    allocationDate: '1-Aug-24',
    siteSurveyStart: '6-Aug-24',
    siteSurveyEnd: '7-Aug-24',
    contact: 'Done',
    headCount: 'N/A',
    proposalStart: '22-Aug-24',
    proposalEnd: '16-Sep-24',
    '3dStart': 'N/A',
    '3dEnd': 'N/A',
    tenderArchStart: '1-Oct-24',
    tenderArchEnd: '26-Oct-24',
    tenderMepStart: '',
    tenderMepEnd: '',
    boqStart: '28-Feb-25',
    boqEnd: '1-Mar-25',
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
    allocationDate: '11-Jun-25',
    siteSurveyStart: '11-Jun-25',
    siteSurveyEnd: '13-Jun-25',
    contact: 'Done',
    headCount: '',
    proposalStart: '',
    proposalEnd: '',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '16-Jun-25',
    tenderArchEnd: '21-Jun-25',
    tenderMepStart: '22-Jun-25',
    tenderMepEnd: '26-Jun-25',
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
    proposalStart: '28-Aug-25',
    proposalEnd: '',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '28-Aug-25',
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
  const [projectData, setProjectData] = useState(initialProjectData);
  const { toast } = useToast();

  const handleProjectDataChange = (index: number, field: string, value: string) => {
    const updatedData = [...projectData];
    (updatedData[index] as any)[field] = value;
    setProjectData(updatedData);
  };
  
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
    return isEditing ? <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8"/> : value;
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6 no-print">
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
        <h1 className="text-2xl font-bold">FBL Timeline</h1>
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
              FBL Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end items-center gap-4">
              <span className="font-bold text-lg text-teal-600">Faysal Bank</span>
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
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Area in Sft</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Project Holder</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Allocation Date / RFP</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Site Survey</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Contact</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Head Count / Requirment</TableHead>
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
                    <TableCell className="border border-gray-400">{renderCell(project.projectName, val => handleProjectDataChange(index, 'projectName', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.area, val => handleProjectDataChange(index, 'area', val))}</TableCell>
                    <TableCell className="border border-gray-400">{renderCell(project.projectHolder, val => handleProjectDataChange(index, 'projectHolder', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.allocationDate, val => handleProjectDataChange(index, 'allocationDate', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.siteSurveyStart, val => handleProjectDataChange(index, 'siteSurveyStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.siteSurveyEnd, val => handleProjectDataChange(index, 'siteSurveyEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.contact, val => handleProjectDataChange(index, 'contact', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.headCount, val => handleProjectDataChange(index, 'headCount', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.proposalStart, val => handleProjectDataChange(index, 'proposalStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.proposalEnd, val => handleProjectDataChange(index, 'proposalEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project['3dStart'], val => handleProjectDataChange(index, '3dStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project['3dEnd'], val => handleProjectDataChange(index, '3dEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderArchStart, val => handleProjectDataChange(index, 'tenderArchStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderArchEnd, val => handleProjectDataChange(index, 'tenderArchEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderMepStart, val => handleProjectDataChange(index, 'tenderMepStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderMepEnd, val => handleProjectDataChange(index, 'tenderMepEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.boqStart, val => handleProjectDataChange(index, 'boqStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.boqEnd, val => handleProjectDataChange(index, 'boqEnd', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.tenderStatus, val => handleProjectDataChange(index, 'tenderStatus', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.comparative, val => handleProjectDataChange(index, 'comparative', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.workingDrawingsStart, val => handleProjectDataChange(index, 'workingDrawingsStart', val))}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{renderCell(project.workingDrawingsEnd, val => handleProjectDataChange(index, 'workingDrawingsEnd', val))}</TableCell>
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
