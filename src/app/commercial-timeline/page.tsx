'use client';

import React from 'react';
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

const projectData = [
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

const overallStatus = [
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
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Commercial Projects Progress Chart
          </CardTitle>
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
                {projectData.map((project) => (
                  <TableRow key={project.srNo}>
                    <TableCell className="border border-gray-400 text-center">{project.srNo}</TableCell>
                    <TableCell className="border border-gray-400">{project.projectName}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.area}</TableCell>
                    <TableCell className="border border-gray-400">{project.projectHolder}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.allocationDate}</TableCell>
                    
                    {project.status ? (
                        <>
                          <TableCell className="border border-gray-400 text-center" colSpan={19}>{project.status}</TableCell>
                        </>
                    ) : (
                        <>
                            <TableCell className="border border-gray-400 text-center">{project.siteSurveyStart}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.siteSurveyEnd}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.contact}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.headCount}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.proposalStart}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.proposalEnd}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.exterior3dStart}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.exterior3dEnd}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.archStart}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.archEnd}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.mepStart}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.mepEnd}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.boqStart}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.boqEnd}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.tenderStatus}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.comparative}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.workingDrawingsStart}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.workingDrawingsEnd}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.siteVisit}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.finalBill}</TableCell>
                            <TableCell className="border border-gray-400 text-center">{project.projectClosure}</TableCell>
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
                  {overallStatus.map((status) => (
                    <TableRow key={status.no}>
                      <TableCell className="w-8">{status.no}</TableCell>
                      <TableCell className="font-bold">{status.text}</TableCell>
                      <TableCell>{status.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border border-gray-400 border-t-0">
              <div className="flex justify-between">
                <p>Maam Isbah Remarks & Order</p>
                <p>Date: </p>
              </div>
               <p className="mt-4">Queries received</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default CommercialTimelinePage;
