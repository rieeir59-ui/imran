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
    '3dEnd:': '',
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

const overallStatus = [
    { no: 1, text: 'Proposal sent and waiting for approval.' },
    { no: 2, text: 'Visit required' },
    { no: 3, text: 'on Hold' },
    { no: 4, text: 'Construction in Progress.' },
    { no: 5, text: 'Tender Working as per new theme.' },
]

const UblTimelinePage = () => {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/4"></div>
            <CardTitle className="text-center text-xl font-bold flex-1">
              UBL Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end">
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
                  <TableHead colSpan={2} className="border border-gray-400 text-center">Head Count</TableHead>
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
                  <TableHead className="border border-gray-400 text-center">Requirement</TableHead>
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
                    <TableCell className="border border-gray-400 text-center">{project.siteSurveyStart}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.siteSurveyEnd}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.contact}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.headCount}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.proposalStart}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.proposalEnd}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project['3dStart']}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project['3dEnd']}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.tenderArchStart}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.tenderArchEnd}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.tenderMepStart}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.tenderMepEnd}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.boqStart}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.boqEnd}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.tenderStatus}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.comparative}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.workingDrawingsStart}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.workingDrawingsEnd}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.siteVisit}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.finalBill}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.projectClosure}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-4"/>
            <div className="p-4 border border-gray-400">
                <h4 className="font-bold mb-2">Overall Status</h4>
                <Table>
                    <TableBody>
                        {overallStatus.map(status => (
                            <TableRow key={status.no}>
                                <TableCell className="w-8">{status.no}</TableCell>
                                <TableCell>{status.text}</TableCell>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default UblTimelinePage;
