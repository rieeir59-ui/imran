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
        projectName: 'HBL PRESTIGE JOHER TOWN',
        area: '10,000',
        projectHolder: 'Luqman',
        allocationDate: '19-Sep-25',
        siteSurveyStart: '4-Aug-25',
        siteSurveyEnd: '5-Aug-25',
        contact: '',
        headCount: 'Received',
        proposalStart: '22-Sep-25',
        proposalEnd: '8-Oct-25',
        '3dStart': '',
        '3dEnd': '',
        tenderArchStart: '21-Oct-25',
        tenderArchEnd: '25-Oct-25',
        tenderMepStart: '25-Oct-25',
        tenderMepEnd: '3-Nov-25',
        boqStart: '3-Nov-25',
        boqEnd: '4-Nov-25',
        tenderStatus: '',
        comparative: '4-Nov-25',
        workingDrawingsStart: '30-Oct-25',
        workingDrawingsEnd: '16-Nov-25',
        siteVisit: '',
        finalBill: '',
        projectClosure: '',
    },
    {
        srNo: 2,
        projectName: '68-A HBL Prestige & RBC CITY HOUSING SIALKOT -II',
        area: '9,880',
        projectHolder: 'Jabar Luqman',
        allocationDate: '28-Sep-25',
        siteSurveyStart: '2-Oct-25',
        siteSurveyEnd: '3-Oct-25',
        contact: '',
        headCount: 'Received',
        proposalStart: '6-Oct-25',
        proposalEnd: '15-Oct-25',
        '3dStart': '',
        '3dEnd': '',
        tenderArchStart: '',
        tenderArchEnd: '',
        tenderMepStart: '',
        tenderMepEnd: '',
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
        srNo: 3,
        projectName: 'HBL DHA GUJRANWALA',
        area: '4,028',
        projectHolder: 'Luqman',
        allocationDate: '6-Sep-25',
        siteSurveyStart: '4-Sep',
        siteSurveyEnd: '5-Sep',
        contact: '',
        headCount: 'Received',
        proposalStart: '8-Sep-25',
        proposalEnd: '12-Sep-25',
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
        projectName: 'HBL CITY HOUSING SIALKOT',
        area: '10,135',
        projectHolder: 'Luqman',
        allocationDate: '11-Sep-25',
        siteSurveyStart: '26-Aug-25',
        siteSurveyEnd: '27-Aug-25',
        contact: '',
        headCount: 'Received',
        proposalStart: '12-Sep-25',
        proposalEnd: '18-Sep-25',
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
        srNo: 5,
        projectName: 'HBL ASLAM MOR LAYYAH',
        area: '2,022',
        projectHolder: 'MUJAHID Luqman',
        allocationDate: '11-Sep-25',
        siteSurveyStart: '21-Sep-25',
        siteSurveyEnd: '22-Sep-25',
        contact: '',
        headCount: 'Received',
        proposalStart: '5-Oct-25',
        proposalEnd: '6-Oct-25',
        '3dStart': '',
        '3dEnd': '',
        tenderArchStart: '5-Oct-25',
        tenderArchEnd: '9-Oct-25',
        tenderMepStart: '9-Oct-25',
        tenderMepEnd: '12-Oct-25',
        boqStart: '12-Oct-25',
        boqEnd: '12-Oct-25',
        tenderStatus: 'Send',
        comparative: '',
        workingDrawingsStart: '28-Oct-25',
        workingDrawingsEnd: '4-Nov-25',
        siteVisit: '1s visit',
        finalBill: '',
        projectClosure: '',
    },
    {
        srNo: 6,
        projectName: 'HBL Hellan Branch 1375 Gujranwala',
        area: '2,260',
        projectHolder: 'MUJAHID Luqman',
        allocationDate: '19-Sep-25',
        siteSurveyStart: '7-Sep-25',
        siteSurveyEnd: '8-Sep-25',
        contact: '',
        headCount: 'Received',
        proposalStart: '5-Oct-25',
        proposalEnd: '27-Oct-25',
        '3dStart': '',
        '3dEnd': '',
        tenderArchStart: '28-Oct-25',
        tenderArchEnd: '3-Nov-25',
        tenderMepStart: '30-Oct-25',
        tenderMepEnd: '4-Nov-25',
        boqStart: '4-Nov-25',
        boqEnd: '5-Nov-25',
        tenderStatus: '',
        comparative: '',
        workingDrawingsStart: '',
        workingDrawingsEnd: '',
        siteVisit: '',
        finalBill: '',
        projectClosure: '',
    },
    {
        srNo: 7,
        projectName: 'HBL Jaranwala Road',
        area: '2,725.00',
        projectHolder: 'Luqman Mujahid',
        allocationDate: '23-Aug-25',
        siteSurveyStart: '21-Aug-25',
        siteSurveyEnd: '21-Aug-25',
        contact: '',
        headCount: 'Received',
        proposalStart: '21-Oct-25',
        proposalEnd: '25-Oct-25',
        '3dStart': '',
        '3dEnd': '',
        tenderArchStart: '25-Oct-25',
        tenderArchEnd: '26-Oct-25',
        tenderMepStart: '27-Oct-25',
        tenderMepEnd: '1-Nov-25',
        boqStart: '26-Oct-25',
        boqEnd: '26-Oct-25',
        tenderStatus: 'Send',
        comparative: '',
        workingDrawingsStart: '14-Nov-25',
        workingDrawingsEnd: '18-Nov-25',
        siteVisit: '',
        finalBill: '',
        projectClosure: '',
    },
    {
        srNo: 8,
        projectName: 'HBL Poona branch',
        area: '1,422.00',
        projectHolder: 'Mujahid',
        allocationDate: 'N/A',
        siteSurveyStart: 'N/A',
        siteSurveyEnd: 'N/A',
        contact: 'Done',
        headCount: '',
        proposalStart: '27-May-25',
        proposalEnd: '',
        '3dStart': '',
        '3dEnd': '',
        tenderArchStart: '',
        tenderArchEnd: '',
        tenderMepStart: '4-Aug-25',
        tenderMepEnd: '8-Aug-25',
        boqStart: '8-Aug-25',
        boqEnd: '9-Aug-25',
        tenderStatus: 'Send',
        comparative: '',
        workingDrawingsStart: '',
        workingDrawingsEnd: '9-Aug-25',
        siteVisit: '',
        finalBill: '',
        projectClosure: '',
    },
    {
        srNo: 9,
        projectName: 'HBL Raya Branch Lahore',
        area: '11,720.00',
        projectHolder: 'Luqman Adnan',
        allocationDate: '13-Dec-23',
        siteSurveyStart: '14-Dec-23',
        siteSurveyEnd: '15-Dec-23',
        contact: 'Done',
        headCount: 'Received',
        proposalStart: '13-Feb-24',
        proposalEnd: '27-Feb-24',
        '3dStart': '28-Feb-24',
        '3dEnd': '9-Mar-24',
        tenderArchStart: '11-Mar-24',
        tenderArchEnd: '25-Mar-24',
        tenderMepStart: '12-Mar-24',
        tenderMepEnd: '20-Mar-24',
        boqStart: '22-Mar-24',
        boqEnd: '30-Mar-24',
        tenderStatus: 'Send',
        comparative: 'Send',
        workingDrawingsStart: '12-Mar-25',
        workingDrawingsEnd: '20-Mar-25',
        siteVisit: 'VISITS DONE',
        finalBill: '',
        projectClosure: '',
    },
    {
        srNo: 10,
        projectName: 'HBL Chowk Azam Branch 0847 Multan',
        area: '2,510.00',
        projectHolder: 'Luqman Mujahid',
        allocationDate: '9-Apr-25',
        siteSurveyStart: '17-Apr-25',
        siteSurveyEnd: '18-Apr-25',
        contact: '',
        headCount: '',
        proposalStart: '',
        proposalEnd: '',
        '3dStart': '',
        '3dEnd': '',
        tenderArchStart: '10-Jun-25',
        tenderArchEnd: '11-Jul-25',
        tenderMepStart: '23-Jun-25',
        tenderMepEnd: '30-Jun-25',
        boqStart: '11-Jul-25',
        boqEnd: '14-Jul-25',
        tenderStatus: 'Sent',
        comparative: '',
        workingDrawingsStart: '16-Jul-25',
        workingDrawingsEnd: '19-Jul-25',
        siteVisit: '1s visit',
        finalBill: '',
        projectClosure: '',
    },
    {
        srNo: 11,
        projectName: 'HBL Islamic prestige',
        area: '1,778.00',
        projectHolder: 'Mohsin Ali',
        allocationDate: '25-Jul-25',
        siteSurveyStart: '',
        siteSurveyEnd: '',
        contact: '',
        headCount: '',
        proposalStart: '',
        proposalEnd: '',
        '3dStart': '28-Aug-25',
        '3dEnd': '',
        tenderArchStart: '',
        tenderArchEnd: '',
        tenderMepStart: '',
        tenderMepEnd: '',
        boqStart: '1-Sep-25',
        boqEnd: '2-Sep-25',
        tenderStatus: '',
        comparative: '',
        workingDrawingsStart: '',
        workingDrawingsEnd: '',
        siteVisit: '',
        finalBill: '',
        projectClosure: '',
    },
];

const HblTimelinePage = () => {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="w-1/4"></div>
            <CardTitle className="text-center text-xl font-bold flex-1">
              HBL Project Progress Chart
            </CardTitle>
            <div className="w-1/4 flex justify-end">
              <span className="font-bold text-lg text-green-600">HBL</span>
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
              <h4 className="font-bold mb-2">Overall status</h4>
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

export default HblTimelinePage;
