"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const fileIndexItems = [
    { no: 1, title: 'Project Checklist' },
    { no: 2, title: 'Project Information' },
    { no: 3, title: 'Predesign general assessment' },
    { no: 4, title: 'Project Data' },
    { no: 5, title: 'Project Agreement' },
    { no: 6, title: 'List of Services' },
    { no: 7, title: 'Requirement Performa (for Residential Project)' },
    { no: 8, title: 'Site Survey' },
    { no: 9, title: 'Project Bylaws' },
    { no: 10, title: 'Proposal request' },
    { no: 11, title: 'Drawings (architectural/interior/submission)' },
    { no: 12, title: 'Shop Drawings Sample Record' },
    { no: 13, title: 'Project Chart (Studio)' },
    { no: 14, title: 'Architect field report/Transmittal letter/minutes of the meeting' },
    { no: 15, title: 'List Of Sub consultants' },
    { no: 16, title: 'List of Contractors' },
    { no: 17, title: 'List of approve vendors' },
    { no: 18, title: 'Time line Schedule' },
    { no: 19, title: 'Project Application Summary' },
    { no: 20, title: 'Continuation Sheet' },
    { no: 21, title: 'Construction Activity schedule' },
    { no: 22, title: 'Preliminary Project Budget' },
    { no: 23, title: 'Bill Of Quantity' },
    { no: 24, title: 'Rate Analysis' },
    { no: 25, title'Change Order' },
    { no: 26, title: 'Application and Certificate for Payment' },
    { no: 27, title: 'Instruction Sheet' },
    { no: 28, title: 'Certificate Substantial Summary' },
    { no: 29, title: 'Other Provisions' },
    { no: 30, title: 'Consent of Surety' },
    { no: 31, title: 'Total Package of Project' },
    { no: 32, title: 'Architects Supplemental Instructions' },
    { no: 33, title: 'Construction Change Director' },
];

const SectionTitle = ({ id, children }: { id: string, children: React.ReactNode }) => (
    <h2 id={id} className="text-2xl font-bold mt-8 mb-4 pt-4 border-t-4 border-primary">{children}</h2>
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

export default function BankPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
        <Card className="printable-card">
            <CardHeader>
                <div className="flex items-center justify-between no-print">
                    <Button variant="outline" asChild>
                        <Link href="/"><ArrowLeft />Back</Link>
                    </Button>
                    <CardTitle className="text-center text-3xl">FILE INDEX</CardTitle>
                    <div/>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Serial No.</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Title</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fileIndexItems.map((item) => (
                            <TableRow key={item.no}>
                                <TableCell>{item.no}</TableCell>
                                <TableCell></TableCell>
                                <TableCell><a href={`#section-${item.no}`} className="text-primary hover:underline">{item.title}</a></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                <SectionTitle id="section-1">Project Checklist</SectionTitle>
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

                <SectionTitle id="section-2">Project Information</SectionTitle>
                {/* This content is already available on the /projects page, so we are not duplicating it here. We can link to it if needed. */}
                <p>Please refer to the <Link href="/projects" className="text-primary underline">Project Information page</Link>.</p>


                <SectionTitle id="section-3">Predesign General Assessment</SectionTitle>
                {/* This content is already available on the /predesign-assessment page, so we are not duplicating it here. */}
                <p>Please refer to the <Link href="/predesign-assessment" className="text-primary underline">Predesign Assessment page</Link>.</p>


                <SectionTitle id="section-4">Project Data</SectionTitle>
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

                <SectionTitle id="section-5">Project Agreement</SectionTitle>
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
                
                <SectionTitle id="section-6">List of Services</SectionTitle>
                {/* This is a duplicate of section 1, so we are linking to it instead. */}
                <p>Please refer to the <a href="#section-1" className="text-primary underline">Project Checklist section</a>.</p>

                <SectionTitle id="section-7">Requirement Performa (For Residential project)</SectionTitle>
                {/* Content for Section 7 */}
                <p>Details for Requirement Performa...</p>

                <SectionTitle id="section-8">Site Survey</SectionTitle>
                {/* Content for Section 8 */}
                <p>Details for Site Survey...</p>

                <SectionTitle id="section-9">Project Bylaws</SectionTitle>
                {/* Content for Section 9 - Placeholder */}
                <p>No content provided for this section.</p>

                <SectionTitle id="section-10">Proposal Request</SectionTitle>
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
                
                <SectionTitle id="section-11">Drawings (Architectural / Interiors / submission)</SectionTitle>
                <DrawingsList />
                
                <SectionTitle id="section-12">Shop Drawings & Sample Record</SectionTitle>
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

                <SectionTitle id="section-13">Project Chart (Studio)</SectionTitle>
                 <p>No content provided for this section.</p>

                <SectionTitle id="section-14">Architects Field Report / Transmittal Letter / Minutes of Meetings</SectionTitle>
                {/* Forms for 14 */}
                <p>Forms for field reports, transmittal letters, and meeting minutes will be here.</p>

                <SectionTitle id="section-15">List of Sub Consultants</SectionTitle>
                {/* Form for 15 */}
                 <p>Form for listing sub-consultants will be here.</p>

                <SectionTitle id="section-16">List of Contractors</SectionTitle>
                {/* Form for 16 */}
                <p>Form for listing contractors will be here.</p>

                <SectionTitle id="section-17">List of Approve Vendors</SectionTitle>
                {/* Vendor Lists for 17 */}
                <p>Vendor lists will be displayed here.</p>

                <SectionTitle id="section-18">Time Line Schedule</SectionTitle>
                {/* Schedule for 18 */}
                <p>Timeline schedule details will be here.</p>

                <SectionTitle id="section-19">Project Application Summary</SectionTitle>
                {/* Form for 19 */}
                <p>Project application summary form will be here.</p>

                <SectionTitle id="section-20">Continuation Sheet</SectionTitle>
                {/* Form for 20 */}
                <p>Continuation sheet form will be here.</p>

                <SectionTitle id="section-21">Construction Activity Schedule</SectionTitle>
                <p>No content provided for this section.</p>

                <SectionTitle id="section-22">Preliminary Project Budget</SectionTitle>
                {/* Form for 22 */}
                <p>Budget form will be here.</p>

                <SectionTitle id="section-23">Bill Of Quantity</SectionTitle>
                {/* Form for 23 */}
                <p>Bill of Quantity details will be here.</p>

                <SectionTitle id="section-24">Rate Analysis</SectionTitle>
                {/* Form for 24 */}
                <p>Rate analysis form will be here.</p>

                <SectionTitle id="section-25">Change Order</SectionTitle>
                {/* Form for 25 */}
                <p>Change order form will be here.</p>

                <SectionTitle id="section-26">Application & Certificates of Payments</SectionTitle>
                {/* Forms for 26 */}
                <p>Application and payment certificate forms will be here.</p>

                <SectionTitle id="section-27">Instruction Sheet</SectionTitle>
                {/* Form for 27 */}
                <p>Instruction sheet form will be here.</p>
                
                <SectionTitle id="section-28">Certificate Substantial Summary</SectionTitle>
                 <p>No content provided for this section.</p>
                 
                <SectionTitle id="section-29">Other Provisions</SectionTitle>
                <p>No content provided for this section.</p>

                <SectionTitle id="section-30">Consent of Surety</SectionTitle>
                {/* Form for 30 */}
                <p>Consent of surety form will be here.</p>
                
                <SectionTitle id="section-31">Total Package of Project</SectionTitle>
                <p>No content provided for this section.</p>

                <SectionTitle id="section-32">Architects Supplemental Instructions</SectionTitle>
                {/* Form for 32 */}
                <p>Supplemental instructions form will be here.</p>

                <SectionTitle id="section-33">Construction Change Director</SectionTitle>
                {/* Form for 33 */}
                <p>Construction change director form will be here.</p>

            </CardContent>
        </Card>
    </main>
  );
}
