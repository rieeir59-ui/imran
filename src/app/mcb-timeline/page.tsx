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
        projectName: 'MCB Emporium Branch Lahore',
        area: '3,200.00',
        projectHolder: 'Haseeb/Adnan',
        allocationDate: '1-Dec-24',
        siteSurveyStart: '',
        siteSurveyEnd: '',
        contact: 'General Contract done',
        headCount: 'Received',
        proposalStart: '1-Dec-24',
        proposalEnd: '24-Dec-24',
        '3dStart': '23-Dec-24',
        '3dEnd': '10-Jan-25',
        tenderArchStart: '6-Dec-24',
        tenderArchEnd: '18-Dec-24',
        tenderMepStart: '7-Apr-25',
        tenderMepEnd: '18-Apr-25',
        boqStart: '20-Apr-25',
        boqEnd: '23-Apr-25',
        tenderStatus: 'Sent',
        comparative: '',
        workingDrawingsStart: '',
        workingDrawingsEnd: '',
        siteVisit: '',
        finalBill: '',
        projectClosure: '',
    },
    {
        srNo: 2,
        projectName: 'MCB Islamic Dolmen Mall',
        area: '802.00',
        projectHolder: 'Haseeb',
        allocationDate: '27-Jan-25',
        siteSurveyStart: '',
        siteSurveyEnd: '',
        contact: 'General Contract done',
        headCount: 'Received',
        proposalStart: '27-Jan-25',
        proposalEnd: '18-Feb-25',
        '3dStart': '24-Feb-25',
        '3dEnd': '3-Mar-25',
        tenderArchStart: '3-Mar-25',
        tenderArchEnd: '10-Mar-25',
        tenderMepStart: '25-Apr-25',
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
        projectName: 'MCB Islamic Gulberg',
        area: '72,270.00',
        projectHolder: 'Jabbar/Asad Shah',
        allocationDate: '15-Apr-25',
        siteSurveyStart: '22-Aug-25',
        siteSurveyEnd: '23-Aug-25',
        contact: 'Done',
        headCount: 'Received',
        proposalStart: '15-Apr-25',
        proposalEnd: '30-Aug-25',
        '3dStart': '15-Apr-25',
        '3dEnd': '30-Aug-25',
        tenderArchStart: '13-Sep-25',
        tenderArchEnd: '',
        tenderMepStart: '4-Oct-25',
        tenderMepEnd: '8-Oct-25',
        boqStart: '',
        boqEnd: '',
        tenderStatus: 'Sent',
        comparative: '',
        workingDrawingsStart: '',
        workingDrawingsEnd: '',
        siteVisit: '',
        finalBill: '',
        projectClosure: '',
    },
];

const overallStatus = [
    { no: 1, text: 'Everything from our side has been sent and hopefully they will open tender next week.' },
    { no: 2, text: 'Construction in process' },
    { no: 3, text: 'Submission drawing has been sent' },
];

const McbTimelinePage = () => {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/4"></div>
            <CardTitle className="text-center text-xl font-bold flex-1">
              MCB Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end">
              <span className="font-bold text-lg text-green-700">MCB</span>
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

export default McbTimelinePage;
