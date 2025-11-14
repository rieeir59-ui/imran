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
  const [projectData, setProjectData] = useState(initialProjectData);
  const [overallStatus, setOverallStatus] = useState(initialOverallStatus);
  const [remarks, setRemarks] = useState({ text: 'Maam Isbah Remarks & Order', date: '' });

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
    }, 1000);
  };

  const renderCell = (value: string, onChange: (val: string) => void) => {
    return isEditing ? <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8" /> : value;
  }
  
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-center text-xl font-bold flex-1">
              Residential Projects Progress Chart
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
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Area In Sft</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Project Holder</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Allocation Date / RFP</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Site Survey</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Contact</TableHead>
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Head Count / Requirment</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Proposal / Design Development</TableHead>
                  <TableHead colSpan={2} className="border border-gray-400 text-center">3D's</TableHead>
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
