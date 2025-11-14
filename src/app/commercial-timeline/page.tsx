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
import { Edit, Save, Loader2 } from 'lucide-react';


const initialProjectData = [
  {
    srNo: 1,
    projectName: 'Enertech Hydo-China Thar Sindh (Office Building)',
    area: '5,000.00',
    projectHolder: 'MOHSIN/NOMAN',
    allocationDate: '3/28/2025',
    status: 'Furniture BOQ & Lights BOQ in Progress.',
  },
  {
    srNo: 2,
    projectName: 'Enertech Hydo-China Thar Sindh (Officer Bungalow)',
    area: '2,000.00',
    projectHolder: 'MOHSIN/NOMAN',
    allocationDate: '3/28/2026',
    status: 'Furniture BOQ & Lights BOQ in Progress.',
  },
  {
    srNo: 3,
    projectName: 'Enertech Hydo-China Thar Sindh (Guest House)',
    area: '6,500.00',
    projectHolder: 'MOHSIN/NOMAN',
    allocationDate: '3/28/2027',
    status: 'Furniture BOQ & Lights BOQ in Progress.',
  },
  {
    srNo: 4,
    projectName: 'Enertech Hydo-China Thar Sindh (Bachelor Accommodation)',
    area: '8,850.00',
    projectHolder: 'MOHSIN/NOMAN',
    allocationDate: '3/28/2028',
    status: 'Furniture BOQ & Lights BOQ in Progress.',
  },
  {
    srNo: 5,
    projectName: 'Bestway Tower',
    area: '',
    projectHolder: 'ASAD',
    allocationDate: '',
    siteSurveyStart: 'N/A',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: 'Done',
    proposalEnd: 'Done',
    exterior3dStart: '',
    exterior3dEnd: '',
    archStart: 'Done',
    archEnd: 'Done',
    mepStart: 'Done',
    mepEnd: 'Done',
    boqStart: '',
    boqEnd: '',
    tenderStatus: 'Send',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: '',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 6,
    projectName: 'French Club',
    area: '',
    projectHolder: 'LUQMAN',
    allocationDate: '',
    siteSurveyStart: 'N/A',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: 'Done',
    proposalEnd: 'Done',
    exterior3dStart: '',
    exterior3dEnd: '',
    archStart: 'Done',
    archEnd: 'Done',
    mepStart: 'Done',
    mepEnd: 'Done',
    boqStart: '',
    boqEnd: '',
    tenderStatus: 'Send',
  },
  {
    srNo: 7,
    projectName: 'DIN Tower',
    area: '',
    projectHolder: 'NOMAN WAQAS',
    allocationDate: '',
    siteSurveyStart: 'N/A',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: 'Done',
    proposalEnd: 'Done',
    exterior3dStart: '',
    exterior3dEnd: '',
    archStart: 'Done',
    archEnd: 'Done',
    mepStart: 'Done',
    mepEnd: 'Done',
    boqStart: '',
    boqEnd: '',
    tenderStatus: 'Send',
  },
  {
    srNo: 8,
    projectName: 'Mr Nadeem Riaz Office Dolmen Mall',
    area: '',
    projectHolder: 'LUQMAN NOMAN',
    allocationDate: '',
    siteSurveyStart: 'N/A',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: 'Done',
    proposalEnd: 'Done',
    exterior3dStart: '',
    exterior3dEnd: '',
    archStart: '',
    archEnd: '',
    mepStart: '',
    mepEnd: '',
    boqStart: '',
    boqEnd: '',
    tenderStatus: '',
  },
  {
    srNo: 9,
    projectName: 'Mr Brad Office Dolmen Mall',
    area: '',
    projectHolder: 'LUQMAN NOMAN',
    allocationDate: '',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: 'Done',
    proposalEnd: 'Done',
  },
  {
    srNo: 10,
    projectName: 'BAMSOL',
    area: '22,332.00',
    projectHolder: 'Haseeb ASAD',
    allocationDate: '18-Aug-25',
    siteSurveyStart: 'AS BUILT RECEIVED',
    siteSurveyEnd: '',
    contact: 'Done',
    headCount: 'Done',
    proposalStart: '28-Aug-25',
    proposalEnd: '25-Sep-25',
  },
  {
    srNo: 11,
    projectName: 'Aghaz Housing',
    area: '',
    projectHolder: '',
    allocationDate: '',
  },
];

const initialOverallStatus = [
  { no: 1, text: 'Overall Status for Office Building', status: 'Furniture BOQ & Lights BOQ in Progress.' },
  { no: 2, text: 'Overall Status for Officer Bungalow', status: 'Furniture BOQ & Lights BOQ in Progress.' },
  { no: 3, text: 'Overall Status for Guest House', status: 'Furniture BOQ & Lights BOQ in Progress.' },
  { no: 4, text: 'Overall Status for Bachelor Accommodation', status: 'Furniture BOQ & Lights BOQ in Progress.' },
  { no: 5, text: 'Bestway Tower', status: 'EXTERIOR 3D IN REVISION' },
  { no: 6, text: 'French Club', status: 'All drawings sent' },
  { no: 7, text: 'DIN Tower', status: 'Final payment RECEIVED' },
  { no: 8, text: 'Mr Nadeem Riaz Office Dolmen Mall', status: 'Everything has been sent. QUERIES ONLY' },
  { no: 9, text: 'Mr Brad Office Dolmen Mall', status: 'All drawings sent' },
  { no: 10, text: 'BAMSOL', status: 'Proposal shared and minor revisions in proposal.' },
  { no: 11, text: 'Aghaz Housing', status: 'All drawings sent' },
];

const CommercialTimelinePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectData, setProjectData] = useState(initialProjectData);
  const [overallStatus, setOverallStatus] = useState(initialOverallStatus);
  const [remarks, setRemarks] = useState({ text: 'Maam Isbah Remarks & Order', date: '' });
  const [queries, setQueries] = useState('Queries received');

  const handleProjectDataChange = (index: number, field: string, value: string) => {
    const updatedData = [...projectData];
    (updatedData[index] as any)[field] = value;
    setProjectData(updatedData);
  };
  
  const handleStatusChange = (index: number, field: 'text' | 'status', value: string) => {
    const updatedStatus = [...overallStatus];
    (updatedStatus[index] as any)[field] = value;
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
    }, 1000);
  };

  const renderCell = (value: string | undefined, onChange: (val: string) => void) => {
    return isEditing ? <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8" /> : (value || '');
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-center text-xl font-bold flex-1">
              Commercial Projects Progress Chart
            </CardTitle>
            <div className="flex justify-end items-center gap-4">
              {isEditing ? (
                  <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                  </Button>
              ) : (
                  <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
              )}
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
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Exterior 3D's</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Architectural / Interior Drawings</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">MEP Drawings</TableHead>
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
                    
                    {(project as any).status ? (
                        <>
                          <TableCell className="border border-gray-400 text-center" colSpan={19}>{renderCell((project as any).status, (val) => handleProjectDataChange(index, 'status', val))}</TableCell>
                        </>
                    ) : (
                        <>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).siteSurveyStart, (val) => handleProjectDataChange(index, 'siteSurveyStart', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).siteSurveyEnd, (val) => handleProjectDataChange(index, 'siteSurveyEnd', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).contact, (val) => handleProjectDataChange(index, 'contact', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).headCount, (val) => handleProjectDataChange(index, 'headCount', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).proposalStart, (val) => handleProjectDataChange(index, 'proposalStart', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).proposalEnd, (val) => handleProjectDataChange(index, 'proposalEnd', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).exterior3dStart, (val) => handleProjectDataChange(index, 'exterior3dStart', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).exterior3dEnd, (val) => handleProjectDataChange(index, 'exterior3dEnd', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).archStart, (val) => handleProjectDataChange(index, 'archStart', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).archEnd, (val) => handleProjectDataChange(index, 'archEnd', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).mepStart, (val) => handleProjectDataChange(index, 'mepStart', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).mepEnd, (val) => handleProjectDataChange(index, 'mepEnd', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).boqStart, (val) => handleProjectDataChange(index, 'boqStart', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).boqEnd, (val) => handleProjectDataChange(index, 'boqEnd', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).tenderStatus, (val) => handleProjectDataChange(index, 'tenderStatus', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).comparative, (val) => handleProjectDataChange(index, 'comparative', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).workingDrawingsStart, (val) => handleProjectDataChange(index, 'workingDrawingsStart', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).workingDrawingsEnd, (val) => handleProjectDataChange(index, 'workingDrawingsEnd', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).siteVisit, (val) => handleProjectDataChange(index, 'siteVisit', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).finalBill, (val) => handleProjectDataChange(index, 'finalBill', val))}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{renderCell((project as any).projectClosure, (val) => handleProjectDataChange(index, 'projectClosure', val))}</TableCell>
                        </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-4" />
            <div className="p-4 border border-gray-400">
              <Table>
                <TableBody>
                  {overallStatus.map((status, index) => (
                    <TableRow key={status.no}>
                      <TableCell className="w-8">{status.no}</TableCell>
                      <TableCell className="font-bold">{isEditing ? <Input value={status.text} onChange={e => handleStatusChange(index, 'text', e.target.value)} /> : status.text}</TableCell>
                      <TableCell>{isEditing ? <Input value={status.status} onChange={e => handleStatusChange(index, 'status', e.target.value)} /> : status.status}</TableCell>
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
               {isEditing ? <Textarea value={queries} onChange={e => setQueries(e.target.value)} className="mt-4" /> : <p className="mt-4">{queries}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default CommercialTimelinePage;
