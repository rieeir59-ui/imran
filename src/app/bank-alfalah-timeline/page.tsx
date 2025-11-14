
"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Loader2 } from 'lucide-react';

const initialProjectData = [
  {
    srNo: 1,
    projectName: "BALF Currency Exchange Dolmen Mall Lahore",
    area: "800.00",
    projectHolder: "Haseeb",
    allocationDate: "26-May-25",
    siteSurveyStart: "4-Apr-25",
    siteSurveyEnd: "4-Apr-25",
    contact: "",
    headCount: "Received",
    proposalStart: "5-Apr-25",
    proposalEnd: "11-Apr-25",
    "3dStart": "14-Apr-25",
    "3dEnd": "18-Apr-25",
    tenderArchStart: "",
    tenderArchEnd: "",
    tenderMepStart: "10-Sep-25",
    tenderMepEnd: "",
    boqStart: "",
    boqEnd: "",
    tenderStatus: "Sent",
    comparative: "",
    workingDrawingsStart: "",
    workingDrawingsEnd: "",
    siteVisit: "",
    finalBill: "",
    projectClosure: "",
  },
  {
    srNo: 2,
    projectName: "Bank Al-Falah Brand Manual",
    area: "N/A",
    projectHolder: "Zain",
    allocationDate: "2-Feb-25",
    siteSurveyStart: "N/A",
    siteSurveyEnd: "N/A",
    contact: "11-Feb-25",
    headCount: "N/A",
    proposalStart: "N/A",
    proposalEnd: "N/A",
    "3dStart": "N/A",
    "3dEnd": "N/A",
    tenderArchStart: "5-Aug",
    tenderArchEnd: "N/A",
    tenderMepStart: "",
    tenderMepEnd: "",
    boqStart: "N/A",
    boqEnd: "N/A",
    tenderStatus: "N/A",
    comparative: "N/A",
    workingDrawingsStart: "N/A",
    workingDrawingsEnd: "N/A",
    siteVisit: "N/A",
    finalBill: "N/A",
    projectClosure: "N/A",
  },
  {
    srNo: 3,
    projectName: "BALF Shahdin Manzil Branch Lahore",
    area: "3,830.00",
    projectHolder: "Mujahid Luqman",
    allocationDate: "N/A",
    siteSurveyStart: "",
    siteSurveyEnd: "",
    contact: "",
    headCount: "Received",
    proposalStart: "25-Sep-25",
    proposalEnd: "21-Oct-25",
    "3dStart": "",
    "3dEnd": "",
    tenderArchStart: "",
    tenderArchEnd: "",
    tenderMepStart: "",
    tenderMepEnd: "",
    boqStart: "",
    boqEnd: "",
    tenderStatus: "",
    comparative: "",
    workingDrawingsStart: "",
    workingDrawingsEnd: "",
    siteVisit: "",
    finalBill: "",
    projectClosure: "",
  },
];


const BankAlfalahTimelinePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectData, setProjectData] = useState(initialProjectData);
  const [overallStatus, setOverallStatus] = useState([
      'Dolmen mall currency exchange Construction Started',
      'Revision in brand manual requirements received from the bank; SENT',
      'Shahdin manzil branch waiting from Bank for approval.'
  ]);
  const [remarks, setRemarks] = useState({text: 'Maam Isbah Remarks & Order', date: ''});
  
  const handleProjectDataChange = (index: number, field: string, value: string) => {
    const updatedData = [...projectData];
    (updatedData[index] as any)[field] = value;
    setProjectData(updatedData);
  };
  
  const handleStatusChange = (index: number, value: string) => {
    const updatedStatus = [...overallStatus];
    updatedStatus[index] = value;
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
    return isEditing ? <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8"/> : value;
  }
  
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/4"></div>
            <CardTitle className="text-center text-xl font-bold flex-1">Bank Al-Falah Project Progress Chart</CardTitle>
            <div className="w-1/4 flex justify-end items-center gap-4">
                <span className="font-bold text-lg">Bank Alfalah</span>
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
                  <TableHead rowSpan={2} className="border border-gray-400 text-center align-middle">Contract</TableHead>
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
            <Separator className="my-4"/>
             <div className="p-4 border border-gray-400">
                <h4 className="font-bold mb-2">Overall Status</h4>
                {isEditing ? (
                  <div className="space-y-2">
                    {overallStatus.map((status, index) => <Input key={index} value={status} onChange={(e) => handleStatusChange(index, e.target.value)} />)}
                  </div>
                ) : (
                  <>
                    <p>{overallStatus[0]}</p>
                    <p>{overallStatus[1]}</p>
                    <p>{overallStatus[2]}</p>
                  </>
                )}
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

export default BankAlfalahTimelinePage;
