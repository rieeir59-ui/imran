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

const projectData = [
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

const ResidentialTimelinePage = () => {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Residential Projects Progress Chart
          </CardTitle>
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
                {projectData.map((project) => (
                  <TableRow key={project.srNo}>
                    <TableCell className="border border-gray-400 text-center">{project.srNo}</TableCell>
                    <TableCell className="border border-gray-400">{project.projectName}</TableCell>
                    <TableCell className="border border-gray-400 text-center">{project.areaInSft}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ResidentialTimelinePage;
