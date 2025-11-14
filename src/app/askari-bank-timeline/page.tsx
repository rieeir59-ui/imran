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
    projectName: 'AKBL AWT SADDAR RWP',
    area: '14,000',
    projectHolder: 'Noman Asad Mohsin',
    allocationDate: '6-Oct-25',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: '',
    headCount: 'Received',
    proposalStart: '14-Oct-25',
    proposalEnd: '17-Oct-25',
    '3dStart': '17-Oct-25',
    '3dEnd': '21-Oct-25',
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
    projectName: 'AKBL CHAKLALA GARRISON RWP',
    area: '4,831',
    projectHolder: 'Noman Asad Mohsin',
    allocationDate: '13-Sep-25',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'In-Progress',
    headCount: 'Recieved',
    proposalStart: '',
    proposalEnd: '',
    '3dStart': '1-Oct-25',
    '3dEnd': '3-Oct-25',
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
    projectName: 'AKBL Priority Lounge',
    area: '24,000.00',
    projectHolder: 'Noman Haseeb Mohsin',
    allocationDate: '28-Mar-25',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: 'DONE',
    headCount: 'Recevied',
    proposalStart: '21-Apr-25',
    proposalEnd: '28-Apr-25',
    '3dStart': '',
    '3dEnd': '',
    tenderArchStart: '',
    tenderArchEnd: '',
    tenderMepStart: '',
    tenderMepEnd: '',
    boqStart: '',
    boqEnd: 'sent',
    tenderStatus: 'sent',
    comparative: '',
    workingDrawingsStart: '',
    workingDrawingsEnd: 'sent',
    siteVisit: '',
    finalBill: '',
    projectClosure: '',
  },
  {
    srNo: 4,
    projectName: 'AKBL Ocean Mall KHI',
    area: '430.00',
    projectHolder: 'Noman Asad Mohsin',
    allocationDate: '10-Oct-25',
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
];

const overallStatus = [
  { no: 1, text: 'Site Survey scheduled' },
  { no: 2, text: 'PROPOSAL SENT AGAIN.' },
  { no: 3, text: 'Tender package shared.' },
];

const AskariBankTimelinePage = () => {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/4"></div>
            <CardTitle className="text-center text-xl font-bold flex-1">
              Askari Bank Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end">
              <span className="font-bold text-lg text-blue-800">
                askaribank
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse border border-gray-400">
              <TableHeader>
                <TableRow>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Sr.No
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Project Name
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Area in Sft
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Project Holder
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Allocation Date / RFP
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center"
                  >
                    Site Survey
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Contact
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Head Count / Requirment
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center"
                  >
                    Proposal / Design Development
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center"
                  >
                    3D's
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center"
                  >
                    Tender Package Architectural
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center"
                  >
                    Tender Package MEP
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center"
                  >
                    BOQ
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Tender Status
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Comparative
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="border border-gray-400 text-center"
                  >
                    Working Drawings
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Site Visit
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Final Bill
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="border border-gray-400 text-center align-middle"
                  >
                    Project Closure
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border border-gray-400 text-center">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    End Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    Start Date
                  </TableHead>
                  <TableHead className="border border-gray-400 text-center">
                    End Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectData.map((project) => (
                  <TableRow key={project.srNo}>
                    <TableCell className="border border-gray-400 text-center">
                      {project.srNo}
                    </TableCell>
                    <TableCell className="border border-gray-400">
                      {project.projectName}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.area}
                    </TableCell>
                    <TableCell className="border border-gray-400">
                      {project.projectHolder}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.allocationDate}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.siteSurveyStart}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.siteSurveyEnd}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.contact}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.headCount}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.proposalStart}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.proposalEnd}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project['3dStart']}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project['3dEnd']}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.tenderArchStart}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.tenderArchEnd}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.tenderMepStart}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.tenderMepEnd}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.boqStart}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.boqEnd}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.tenderStatus}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.comparative}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.workingDrawingsStart}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.workingDrawingsEnd}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.siteVisit}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.finalBill}
                    </TableCell>
                    <TableCell className="border border-gray-400 text-center">
                      {project.projectClosure}
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
                  {overallStatus.map((status) => (
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

export default AskariBankTimelinePage;
