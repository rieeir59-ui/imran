
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProjectsPage from '@/app/projects/page';

const fileIndexItems = [
    { no: 1, id: 'section-1', title: 'Project Checklist' },
    { no: 2, id: 'section-2', title: 'Project Information' },
    { no: 3, id: 'section-3', title: 'Predesign general assessment' },
    { no: 4, id: 'section-4', title: 'Project Data' },
    { no: 5, id: 'section-5', title: 'Project Agreement' },
    { no: 6, id: 'section-6', title: 'List of Services' },
    { no: 7, id: 'section-7', title: 'Requirement Performa (for Residential and Commercial Project)' },
    { no: 8, id: 'section-8', title: 'Site Survey' },
    { no: 9, id: 'section-9', title: 'Project Bylaws' },
    { no: 10, id: 'section-10', title: 'Proposal request' },
    { no: 11, id: 'section-11', title: 'Drawings (architectural/interior/submission)' },
    { no: 12, id: 'section-12', title: 'Shop Drawings Sample Record' },
    { no: 13, id: 'section-13', title: 'Project Chart (Studio)' },
    { no: 14, id: 'section-14', title: 'Architect field report/Transmittal letter/minutes of the meeting' },
    { no: 15, id: 'section-15', title: 'List Of Sub consultants' },
    { no: 16, id: 'section-16', title: 'List of Contractors' },
    { no: 17, id: 'section-17', title: 'List of approve vendors' },
    { no: 18, id: 'section-18', title: 'Time line Schedule' },
    { no: 19, id: 'section-19', title: 'Project Application Summary' },
    { no: 20, id: 'section-20', title: 'Continuation Sheet' },
    { no: 21, id: 'section-21', title: 'Construction Activity schedule' },
    { no: 22, id: 'section-22', title: 'Preliminary Project Budget' },
    { no: 23, id: 'section-23', title: 'Bill Of Quantity' },
    { no: 24, id: 'section-24', title: 'Rate Analysis' },
    { no: 25, id: 'section-25', title: 'Change Order' },
    { no: 26, id: 'section-26', title: 'Application and Certificate for Payment' },
    { no: 27, id: 'section-27', title: 'Instruction Sheet' },
    { no: 28, id: 'section-28', title: 'Certificate Substantial Summary' },
    { no: 29, id: 'section-29', title: 'Other Provisions' },
    { no: 30, id: 'section-30', title: 'Consent of Surety' },
    { no: 31, id: 'section-31', title: 'Total Package of Project' },
    { no: 32, id: 'section-32', title: 'Architects Supplemental Instructions' },
    { no: 33, id: 'section-33', title: 'Construction Change Director' },
];

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-bold mt-8 mb-4 pt-4">{children}</h2>
);

const Subtitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
);

const FormField = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex flex-col mb-2">
        <span className="font-semibold">{label}:</span>
        <span>{value || '___________________________'}</span>
    </div>
);

const renderChecklist = (title: string, items: string[]) => (
    <div>
        <Subtitle>{title}</Subtitle>
        <ul className="list-decimal list-inside space-y-1">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

const DrawingsList = () => {
    const architecturalDrawings = [
        "Submission Drawings", "Demolition Plan", "Excavation Plan", "Site Plan", "Basement Plan", "Ground Floor Plan", "First Floor Plan", "Second Floor Plan", "Roof Plan", "Section A", "Section B", "Section C", "Elevation 1", "Elevation 2", "Elevation 3", "Elevation 4"
    ];
    const details = ["Baths Details", "Doors Details", "Floors Details", "Entrance Detail", "Stair Detail"];
    const structureDrawings = ["Foundation Plan", "Floor Farming Plan", "Ground Floor Slab", "First Floor Slab", "Second Floor Slab", "Wall elev & slab sec.", "Wall sec & details", "Stairs", "Schedules", "Space of Concrete"];
    const plumbingDrawings = ["Sewarge Systems", "Water Supply & Gas Systems", "Detail of Sewrage Appurtunances", "Detail of Sokage Pit", "Detail of Soptik Tank", "Detail of Overhead Water Tank", "Detail of Underground Water Tank", "Legend & General Notes"];
    const electrificationDrawings = ["lllumination Layout Plans", "Power Layout Plans", "Legend & General Notes"];

    const renderTable = (title: string, data: string[]) => (
        <div className="mb-8">
            <h4 className="font-bold text-lg mb-2">{title}</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Serial No.</TableHead>
                        <TableHead>Drawings Title</TableHead>
                        <TableHead>Starting Date</TableHead>
                        <TableHead>Completion Date</TableHead>
                        <TableHead>Remarks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <>
            {renderTable("Architectural Drawings", architecturalDrawings)}
            {renderTable("Details", details)}
            {renderTable("Structure Drawings", structureDrawings)}
            {renderTable("Plumbing Drawings", plumbingDrawings)}
            {renderTable("Electrification Drawings", electrificationDrawings)}
        </>
    );
};

const SectionContent = ({ sectionId }: { sectionId: string }) => {
    switch (sectionId) {
        case 'section-1':
            return (
                <Card>
                    <CardHeader><CardTitle>Project Checklist</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <FormField label="Project" />
                            <FormField label="Name, Address" />
                            <FormField label="Architect" />
                            <FormField label="Architect Project No" />
                            <FormField label="Project Date" />
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                            {renderChecklist("1: - Predesign", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Programming", "Space Schematics/ Flow Diagrams", "Existing Facilities Surveys", "Presentations"])}
                            {renderChecklist("Site Analysis Services", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Site Analysis and Selection", "Site Development and Planning", "Detailed Site Utilization Studies", "Onsite Utility Studies", "Offsite Utility Studies", "Zoning Processing Assistance", "Project Development Scheduling", "Project Budgeting", "Presentations"])}
                            {renderChecklist("2: - Design", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design/ Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research/ Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"])}
                            {renderChecklist("Design Development Services", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design / Documentation", "Electrical Design / Documentation", "Civil Design / Documentation", "Landscape Design / Documentation", "Interior Design / Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"])}
                            {renderChecklist("Construction Documents Services", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design / Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"])}
                            {renderChecklist("3: - Construction", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Bidding Materials", "Addenda", "Bidding Negotiations", "Analysis Of Alternates/ Substitutions", "Special Bidding Services", "Bid Evaluation", "Construction Contract Agreements"])}
                            {renderChecklist("Construction Contract Administration Services", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Office Construction Administration", "Construction Field Observation", "Project Representation", "Inspection Coordination", "Supplemental Documents", "Quotation Requests/ Change Orders", "Project Schedule Monitoring", "Construction Cost Accounting", "Project Closeout"])}
                            {renderChecklist("4: - Post", ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Maintenance And Operational Programming", "Start Up Assistance", "Record Drawings", "Warranty Review", "Post Construction Evaluation"])}
                            {renderChecklist("5: - Supplemental", ["Graphics Design", "Fine Arts and Crafts Services", "Special Furnishing Design", "Non-Building Equipment Selection"])}
                            {renderChecklist("List Of Materials", ["Conceptual Site and Building Plans/ Basic Layout", "Preliminary Sections and Elevations", "Air Conditioning/ H.V.A.C Design", "Plumbing", "Fire Protection", "Special Mechanical Systems", "General Space Requirements", "Power Services and Distribution", "Telephones", "Security Systems", "Special Electrical Systems", "Landscaping", "Materials", "Partition Sections", "Furniture Design", "Identification Of Potential Architectural Materials", "Specification Of a. Wall Finishes b. Floor Finishes c. Windows Coverings d. Carpeting", "Specialized Features Construction Details", "Project Administration", "Space Schematic Flow", "Existing Facilities Services", "Project Budgeting", "Presentation"])}
                        </div>
                    </CardContent>
                </Card>
            );
        case 'section-2':
            return (
                <Card>
                    <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
                    <CardContent>
                        <p>Please refer to the <Link href="/projects" className="text-primary underline">Project Information page</Link>.</p>
                    </CardContent>
                </Card>
            );
        case 'section-3':
             return (
                <Card>
                    <CardHeader><CardTitle>Predesign General Assessment</CardTitle></CardHeader>
                    <CardContent>
                        <p>Please refer to the <Link href="/predesign-assessment" className="text-primary underline">Predesign Assessment page</Link>.</p>
                    </CardContent>
                </Card>
            );
        case 'section-4':
            return (
                 <Card>
                    <CardHeader><CardTitle>Project Data</CardTitle></CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField label="Project" />
                                <FormField label="Architect's Project No." />
                                <FormField label="Address" />
                                <FormField label="Date" />
                                <FormField label="Owner" />
                                <FormField label="Tel" />
                            </div>
                            <Separator/>
                            <FormField label="Business Address" />
                            <FormField label="Home Address" />
                            <FormField label="Tel" />
                            <FormField label="Proposed Improvements" />
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField label="Building Dept. Classification" />
                                <FormField label="Set Backs" value="N____E____S____W____Coverage__________" />
                                <FormField label="Cost" />
                                <FormField label="Stories" />
                                <FormField label="Fire Zone" />
                            </div>
                            <FormField label="Other Agency Standards or Approvals Required" />
                            <FormField label="Site Legal Description" />
                            <FormField label="Deed recorded in Vol." />
                            <FormField label="Restrictions" />
                            <FormField label="Easements" />
                            <FormField label="Liens, Leases" />
                            <div className="grid md:grid-cols-3 gap-4">
                                <FormField label="Lot Dimensions" />
                                <FormField label="Facing" />
                                <FormField label="Value" />
                            </div>
                            <FormField label="Adjacent property use" />
                            <FormField label="Owner's Designated Representative" />
                            <FormField label="Address" />
                            <FormField label="Tel" />
                            <FormField label="Attorney at Law" />
                            <FormField label="Insurance Advisor" />
                            <FormField label="Consultant on" />
                            <Subtitle>Site Information Sources</Subtitle>
                            <FormField label="Property Survey by" />
                            <FormField label="Topographic Survey by" />
                            <FormField label="Soils Tests by" />
                            <FormField label="Aerial Photos by" />
                            <FormField label="Maps" />
                            <Subtitle>Public Services</Subtitle>
                            <FormField label="Gas Company" />
                            <FormField label="Electric Co" />
                            <FormField label="Telephone Co" />
                            <FormField label="Sewers" />
                            <FormField label="Water" />
                            <Subtitle>Financial Data</Subtitle>
                            <FormField label="Loan Amount" />
                            <FormField label="Loan by" />
                            <FormField label="Bonds or Liens" />
                            <FormField label="Grant Amount" />
                            <FormField label="Grant from" />
                            <Subtitle>Method of Handling</Subtitle>
                            <p>Singe ( ) or Separate ( ) Contracts</p>
                            <p>Negotiated: __________ Bid: ______________</p>
                            <p>Stipulated Sum: _____________________</p>
                            <p>Cost Plus Fee: _________________ Force Amount: _______________</p>
                            <p>Equipment: Fixed ______ Movable ______ Interiors ________</p>
                            <p>Landscaping: _________________________</p>
                            <Subtitle>Sketch of Property</Subtitle>
                            <p>Notations on existing improvements, disposal thereof, utilities, tree, etc.; indicated North; notations on other Project provision:</p>
                            <div className="border h-48"></div>
                        </div>
                    </CardContent>
                </Card>
            );
        case 'section-5':
            return (
                <Card>
                    <CardHeader><CardTitle>Project Agreement</CardTitle></CardHeader>
                    <CardContent>
                        <div className="prose">
                            <p>Made as of the day</p>
                            <p>Between the Owner</p>
                            <p>And the Firm: Isbah Hassan & Associates</p>
                            <p>For the Design of</p>
                            <p>Address</p>
                            <p>Covered Area of Project</p>
                            <p>Consultancy Charges @ Rs ___/Sft</p>
                            <p>Sales Tax @ 16%</p>
                            <p>Withholding Tax @ 10%</p>
                            <p>Final Consultancy Charges</p>
                            <Subtitle>PAYMENT SCHEDULE:</Subtitle>
                            <p>On mobilization (advance payment): 20 %</p>
                            <p>On approval of schematic designs & 3D’s: 15%</p>
                            <p>On completion of submission drawings: 15%</p>
                            <p>On start of construction drawings: 15%</p>
                            <p>On completion of construction drawings: 10%</p>
                            <p>On completion of interior drawings: 10%</p>
                            <p>On preparation of detailed BOQ: 10%</p>
                            <Subtitle>Project Management:</Subtitle>
                            <Subtitle>Top Supervision:</Subtitle>
                            <ul className="list-disc list-inside">
                                <li>Please find attached the site visit schedule for the project please intimate the office one week in advance before the required visit for timely surveillance. Any Unscheduled visits would be charged as under.</li>
                                <li>For out of station visits, the travelling by air and lodging in a five-star hotel will be paid by the client.</li>
                                <li>Rs. 50,000 for Principal Architect's site visit per day.</li>
                                <li>Rs. 30,000 for Associate Architect's site visit per day.</li>
                                <li>For International visits, the travelling by air and lodging in a five-star hotel will be paid by the client.</li>
                                <li>Rs. 150,000 for Principal Architect' s fee per day.</li>
                                <li>Rs. 30,000 for Associate Architect' s fee per day.</li>
                            </ul>
                            <Subtitle>Detailed Supervision:</Subtitle>
                            <p>The fee for detailed supervision will be Rs. 300,000 /- per month, which will ensure daily progress at the site.</p>
                            <Subtitle>Please Note:</Subtitle>
                            <ul className="list-disc list-inside">
                                <li>The above quoted rates do not include any kind of tax.</li>
                                <li>The contract value is lumpsum for the area between 90,000 to 120,000 Sft, if however, the area increases the above amount only the sub-consultants fee @ Rs. 70/Sft will be charged.</li>
                                <li>The above consultancy charges quoted are valid for only two months.</li>
                            </ul>
                            <Subtitle>Architect's Responsibilities.</Subtitle>
                            <ol className="list-decimal list-inside">
                                <li>The architect will produce a maximum of two proposals are revisions for the client for the said amount of consultancy every proposal or revision after this will be charged @ Rs. 500,000 /- per Proposal.</li>
                                <li>The architect will require a minimum period of one month for the design development. 2 months will be required for work drawings.</li>
                                <li>The architect will represent the owner and will advise and consult with the owner regarding construction.</li>
                                <li>The architect will be responsible for checking the contractor's progress and giving the approval for payments due to the contractor.</li>
                                <li>The architect is to prepare a maximum of 2 design proposals for the proposal stage for the client...</li>
                                <li>No revision will be made after the Issuance of Construction Drawings. If client wants the revision, he will have to pay for the amount ascertained in the contract.</li>
                                <li>No revision will be made for working drawings. If client wants the revision, he will be required to pay the amount.</li>
                                <li>Project supervision will include visits as mentioned in Construction Activity Schedule.</li>
                                <li>The Architect will provide 3 Sets of working drawings to the client. For additional sets of working drawings Rs. 50,000 per set will be charged.</li>
                                <li>The Architect will provide only two options/revisions of 3Ds for the Facade after which any option/revision will be charged based on normal market rates. For Interior renderings Rs. 500,000/- will be charged.</li>
                            </ol>
                            <Subtitle>The Architect will not be responsible for the following things:</Subtitle>
                            <ol className="list-decimal list-inside">
                                <li>Continuous site supervision.</li>
                                <li>Technical sequences and procedures of the contractors.</li>
                                <li>Change of acts and omissions of the contractor. These are the contractor's responsibilities.</li>
                                <li>Changes and omissions made on the owner's directions.</li>
                            </ol>
                            <Subtitle>ARTICLE-1: Termination of the Agreement</Subtitle>
                            <ol className="list-decimal list-inside">
                                <li>The agreement may be terminated by any of the parties on 7 days written notice...</li>
                                <li>The owner at least on 7 days’ notice to the designer may terminate the agreement in the event that the project is permanently abandoned.</li>
                                <li>In the event of termination not the fault of the design builder, the design builder will be compensated for services performed till termination date.</li>
                                <li>No reimbursable then due and termination expenses...</li>
                            </ol>
                            <Subtitle>ARTICLE-2: Bases of Compensation</Subtitle>
                            <ul className="list-disc list-inside">
                                <li>Compensation for basic services</li>
                                <li>Basic services will be as mentioned</li>
                                <li>Subsequent payments will be as mentioned</li>
                                <li>Compensation for additional services</li>
                                <li>For additional services compensation will be as mentioned</li>
                                <li>Travel expenses of Architect, Engineer, Sub-Engineer and Sub-Consultant will be separately billed</li>
                                <li>Computer Animation will be charged at the normal market rates</li>
                                <li>The rate of interest past due payments will be 15 % per month</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            );
        case 'section-6':
            return (
                <Card>
                    <CardHeader><CardTitle>List of Services</CardTitle></CardHeader>
                    <CardContent>
                        <p>Please refer to the Project Checklist section.</p>
                    </CardContent>
                </Card>
            );
        case 'section-7':
            return (
                <Card>
                    <CardHeader><CardTitle>Requirement Performa (for Residential and Commercial Project)</CardTitle></CardHeader>
                    <CardContent>
                        <ProjectsPage />
                    </CardContent>
                </Card>
            );
        case 'section-8':
            return (
                <Card>
                    <CardHeader><CardTitle>Site Survey</CardTitle></CardHeader>
                    <CardContent>
                        <p>Details for Site Survey...</p>
                    </CardContent>
                </Card>
            );
        case 'section-9':
            return (
                <Card>
                    <CardHeader><CardTitle>Project Bylaws</CardTitle></CardHeader>
                    <CardContent>
                        <p>No content provided for this section.</p>
                    </CardContent>
                </Card>
            );
        case 'section-10':
            return (
                <Card>
                    <CardHeader><CardTitle>Proposal Request</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <FormField label="Project (Name, Address)" />
                            <FormField label="Proposal Request No." />
                            <FormField label="Date" />
                            <FormField label="Architects Project No" />
                            <FormField label="Contract For" />
                            <FormField label="Owner" />
                            <FormField label="To (Contractor)" />
                            <FormField label="Description (Written description of the Work)" />
                            <FormField label="Attachments (List attached documents that support description)" />
                        </div>
                    </CardContent>
                </Card>
            );
        case 'section-11':
            return (
                <Card>
                    <CardHeader><CardTitle>Drawings (Architectural / Interiors / submission)</CardTitle></CardHeader>
                    <CardContent>
                        <DrawingsList />
                    </CardContent>
                </Card>
            );
        case 'section-12':
             return (
                <Card>
                    <CardHeader><CardTitle>Shop Drawings & Sample Record</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Record #</TableHead>
                                    <TableHead>Spec. Section No.</TableHead>
                                    <TableHead>Shop Drawing or Sample Drawing No.</TableHead>
                                    <TableHead>Contractor</TableHead>
                                    <TableHead>Subcontractor</TableHead>
                                    <TableHead>Trade</TableHead>
                                    <TableHead>Title</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Rows for shop drawings */}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            );
        case 'section-13':
            return (
                <Card>
                    <CardHeader><CardTitle>Project Chart (Studio)</CardTitle></CardHeader>
                    <CardContent>
                        <p>No content provided for this section.</p>
                    </CardContent>
                </Card>
            );
        case 'section-14':
            return (
                <Card>
                    <CardHeader><CardTitle>Architects Field Report / Transmittal Letter / Minutes of Meetings</CardTitle></CardHeader>
                    <CardContent>
                        <p>Forms for field reports, transmittal letters, and meeting minutes will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-15':
            return (
                <Card>
                    <CardHeader><CardTitle>List of Sub Consultants</CardTitle></CardHeader>
                    <CardContent>
                        <p>Form for listing sub-consultants will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-16':
            return (
                <Card>
                    <CardHeader><CardTitle>List of Contractors</CardTitle></CardHeader>
                    <CardContent>
                        <p>Form for listing contractors will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-17':
            return (
                <Card>
                    <CardHeader><CardTitle>List of Approve Vendors</CardTitle></CardHeader>
                    <CardContent>
                        <p>Vendor lists will be displayed here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-18':
            return (
                <Card>
                    <CardHeader><CardTitle>Time line Schedule</CardTitle></CardHeader>
                    <CardContent>
                        <p>Timeline schedule details will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-19':
             return (
                <Card>
                    <CardHeader><CardTitle>Project Application Summary</CardTitle></CardHeader>
                    <CardContent>
                        <p>Project application summary form will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-20':
            return (
                <Card>
                    <CardHeader><CardTitle>Continuation Sheet</CardTitle></CardHeader>
                    <CardContent>
                        <p>Continuation sheet form will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-21':
            return (
                <Card>
                    <CardHeader><CardTitle>Construction Activity schedule</CardTitle></CardHeader>
                    <CardContent>
                        <p>No content provided for this section.</p>
                    </CardContent>
                </Card>
            );
        case 'section-22':
            return (
                <Card>
                    <CardHeader><CardTitle>Preliminary Project Budget</CardTitle></CardHeader>
                    <CardContent>
                        <p>Budget form will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-23':
            return (
                <Card>
                    <CardHeader><CardTitle>Bill Of Quantity</CardTitle></CardHeader>
                    <CardContent>
                        <p>Bill of Quantity details will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-24':
            return (
                <Card>
                    <CardHeader><CardTitle>Rate Analysis</CardTitle></CardHeader>
                    <CardContent>
                        <p>Rate analysis form will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-25':
            return (
                <Card>
                    <CardHeader><CardTitle>Change Order</CardTitle></CardHeader>
                    <CardContent>
                        <p>Change order form will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-26':
            return (
                <Card>
                    <CardHeader><CardTitle>Application & Certificates of Payments</CardTitle></CardHeader>
                    <CardContent>
                        <p>Application and payment certificate forms will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-27':
            return (
                <Card>
                    <CardHeader><CardTitle>Instruction Sheet</CardTitle></CardHeader>
                    <CardContent>
                        <p>Instruction sheet form will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-28':
            return (
                <Card>
                    <CardHeader><CardTitle>Certificate Substantial Summary</CardTitle></CardHeader>
                    <CardContent>
                        <p>No content provided for this section.</p>
                    </CardContent>
                </Card>
            );
        case 'section-29':
            return (
                <Card>
                    <CardHeader><CardTitle>Other Provisions</CardTitle></CardHeader>
                    <CardContent>
                        <p>No content provided for this section.</p>
                    </CardContent>
                </Card>
            );
        case 'section-30':
            return (
                <Card>
                    <CardHeader><CardTitle>Consent of Surety</CardTitle></CardHeader>
                    <CardContent>
                        <p>Consent of surety form will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-31':
             return (
                <Card>
                    <CardHeader><CardTitle>Total Package of Project</CardTitle></CardHeader>
                    <CardContent>
                        <p>No content provided for this section.</p>
                    </CardContent>
                </Card>
            );
        case 'section-32':
             return (
                <Card>
                    <CardHeader><CardTitle>Architects Supplemental Instructions</CardTitle></CardHeader>
                    <CardContent>
                        <p>Supplemental instructions form will be here.</p>
                    </CardContent>
                </Card>
            );
        case 'section-33':
            return (
                 <Card>
                    <CardHeader><CardTitle>Construction Change Director</CardTitle></CardHeader>
                    <CardContent>
                        <p>Construction change director form will be here.</p>
                    </CardContent>
                </Card>
            );
        default:
            return (
                <Card>
                    <CardHeader><CardTitle>Select a Section</CardTitle></CardHeader>
                    <CardContent><p>Please select a section from the index to view its content.</p></CardContent>
                </Card>
            )
    }
}

export default function BankPage() {
    const [activeSection, setActiveSection] = useState('section-1');

    return (
        <main className="p-4 md:p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between no-print mb-6">
                <Button variant="outline" asChild>
                    <Link href="/"><ArrowLeft />Back</Link>
                </Button>
                <h1 className="text-center text-3xl font-bold">FILE INDEX</h1>
                <div />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 flex-grow">
                <Card className="no-print">
                    <CardHeader>
                        <CardTitle>Index</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <ul className="space-y-2">
                                {fileIndexItems.map((item) => (
                                    <li key={item.id}>
                                        <button 
                                            onClick={() => setActiveSection(item.id)}
                                            className={`w-full text-left p-2 rounded-md transition-colors ${activeSection === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                        >
                                           {item.no}. {item.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <div className="printable-card">
                   <SectionContent sectionId={activeSection} />
                </div>
            </div>
        </main>
    );
}
    
    