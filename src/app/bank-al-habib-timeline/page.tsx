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
    projectName: 'Bank Al Habib CLIFTON BRANCH',
    area: '5,500.00',
    projectHolder: '',
    allocationDate: '13-Oct-25',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: '',
    headCount: 'DONE',
    proposalStart: '14-Oct-25',
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
  {
    srNo: 2,
    projectName: 'Khyaban-e-Hafiz Office and Branch',
    area: '13,500.00',
    projectHolder: '',
    allocationDate: '13-Oct-25',
    siteSurveyStart: '',
    siteSurveyEnd: '',
    contact: '',
    headCount: 'DONE',
    proposalStart: '14-Oct-25',
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

const overallStatus = [{ no: 1, text: 'PROPOSAL STAGE' }];

const BankAlHabibTimelinePage = () => {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/4"></div>
            <CardTitle className="text-center text-xl font-bold flex-1">
              Bank Al Habib Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end">
              <span className="font-bold text-lg text-red-600">
                Bank Al Habib
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

export default BankAlHabibTimelinePage;
