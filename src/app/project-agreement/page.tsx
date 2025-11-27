'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Download, Edit, Save, Loader2, ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import jsPDF from 'jspdf';

const PROJECT_AGREEMENT_DOC_ID = "project-agreement";

const Subtitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
);

export default function ProjectAgreementPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    
     useEffect(() => {
        if (!isUserLoading && !user && auth) {
            initiateAnonymousSignIn(auth);
        }
    }, [isUserLoading, user, auth]);
    
    const agreementDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectAgreements/${PROJECT_AGREEMENT_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!agreementDocRef) return;
        setIsLoading(true);
        getDoc(agreementDocRef)
            .then(docSnap => {
                if (docSnap.exists()) {
                    setFormData(docSnap.data());
                }
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: agreementDocRef.path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsLoading(false));
    }, [agreementDocRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!agreementDocRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(agreementDocRef, formData, { merge: true })
            .then(() => {
                toast({ title: 'Success', description: 'Project Agreement saved.' });
                setIsEditing(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: agreementDocRef.path,
                    operation: 'write',
                    requestResourceData: formData,
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsSaving(false));
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        let y = 15;

        const checkPageBreak = (requiredHeight: number) => {
            if (y + requiredHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        const addTitle = (title: string, size = 12, align: 'left' | 'center' | 'right' = 'left') => {
            checkPageBreak(10);
            doc.setFontSize(size);
            doc.setFont('helvetica', 'bold');
            
            if (size === 14) { 
                doc.setTextColor(40, 58, 83);
                doc.text(title, 105, y, { align: 'center' });
                doc.setTextColor(0, 0, 0);
            } else {
                doc.setFillColor(230, 230, 230);
                doc.rect(14, y - 5, 182, 7, 'F');
                doc.text(title, 16, y);
            }
            y += 8;
        };

        const addText = (text: string) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitText = doc.splitTextToSize(text, 182);
            const textHeight = doc.getTextDimensions(splitText).h;
            checkPageBreak(textHeight);
            doc.text(splitText, 14, y);
            y += textHeight + 2;
        };

        const addListItem = (text: string, level = 1, bullet = '•') => {
            const indent = 14 + (level * 5);
            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(text, 182 - indent);
            const textHeight = doc.getTextDimensions(splitText).h;
            checkPageBreak(textHeight);
            doc.text(bullet, indent, y);
            doc.text(splitText, indent + 4, y);
            y += textHeight + 2;
        };

        const addFieldRow = (label: string, value: string) => {
            checkPageBreak(7);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(label, 14, y);
            doc.text(`: ${value || '________________'}`, 80, y);
            y += 7;
        };

        addTitle("COMMERCIAL AGREEMENT", 14, 'center');
        y += 5;

        addFieldRow("Made as of the day", formData.day);
        addFieldRow("Between the Owner", formData.owner);
        addFieldRow("And the Firm", "Isbah Hassan & Associates");
        addFieldRow("For the Design of", formData.designOf);
        addFieldRow("Address", formData.address);
        addFieldRow("Covered Area of Project", formData.coveredArea);
        addFieldRow("Consultancy Charges @ Rs ___/Sft", formData.consultancyCharges);
        addFieldRow("Sales Tax @ 16%", formData.salesTax);
        addFieldRow("Withholding Tax @ 10%", formData.withholdingTax);
        addFieldRow("Final Consultancy Charges", formData.finalCharges);
        y += 5;

        addTitle("PAYMENT SCHEDULE:");
        addText("On mobilization (advance payment): 20 %");
        addText("On approval of schematic designs & 3D’s: 15%");
        addText("On completion of submission drawings: 15%");
        addText("On start of construction drawings: 15%");
        addText("On completion of construction drawings: 10%");
        addText("On completion of interior drawings: 10%");
        addText("On preparation of detailed BOQ: 10%");
        y += 5;
        
        addTitle("Project Management:");
        addText("Top Supervision:");
        addListItem("Please find attached the site visit schedule for the project please intimate the office one week in advance before the required visit for timely surveillance. Any Unscheduled visits would be charged as under.");
        addListItem("For out of station visits, the travelling by air and lodging in a five-star hotel will be paid by the client.");
        addListItem("Rs. 50,000 for Principal Architect's site visit per day.", 2, '-');
        addListItem("Rs. 30,000 for Associate Architect's site visit per day.", 2, '-');
        addListItem("For International visits, the travelling by air and lodging in a five-star hotel will be paid by the client.");
        addListItem("Rs. 150,000 for Principal Architect' s fee per day.", 2, '-');
        addListItem("Rs. 30,000 for Associate Architect' s fee per day.", 2, '-');
        addText("Detailed Supervision:");
        addListItem("The fee for detailed supervision will be Rs. 300,000 /- per month, which will ensure daily progress at the site.");
        addText("Please Note:");
        addListItem("The above quoted rates do not include any kind of tax.");
        addListItem("The contract value is lumpsum for the area between 90,000 to 120,000 Sft, if however, the area increases the above amount only the sub-consultants fee @ Rs. 70/Sft will be charged.");
        addListItem("The above consultancy charges quoted are valid for only two months.");
        y += 5;

        addTitle("Architectural Design Services:");
        [
            "Space Planning", "Design Concept", "Design Development & 3Ds (Facade)", "Budgeting Bil of Quantity’s.",
            "Work Drawings (Site Plan, Floor Plans, Elevations, Sections, Details, Schedules)",
            "Structure Drawing (Foundation, Framing, Sections, Details, Schedules, Specs)",
            "Electrification Drawings (Power, Lighting, Sections, Communication)",
            "Plumbing Drawings (Water, Soil, Ventilation, Fire Protection)",
            "Miscelaneous Services (Roof AC, HVAC, Material Specs)",
            "Extra Services (Landscaping, Acoustical, Surveys, Graphic Design)"
        ].forEach(item => addListItem(item));
        y += 5;
        
        addTitle("Interior Design Services:");
        addText("Design Details:");
        [
            "Flooring", "Wood Work", "Doors", "Windows", "False Ceiling", "Lighting", "Bath Details",
            "Kitchen Details", "Wall Textures.", "Stairways", "Built-in Features Fire Places", "Patios",
            "Water bodies", "Trellis", "Skylights", "Furniture", "Partitioning"
        ].forEach(item => addListItem(item));
        addText("Note: The item number 9& 10 is under the head of extra services if the client requests these services, the extra charges wil be as mentioned above.");
        y += 5;

        addTitle("Architect's Responsibilities.");
        [
            "The architect will produce a maximum of two proposals are revisions for the client for the said amount of consultancy every proposal or revision after this will be charged @ Rs. 500,000 /- per Proposal.",
            "The architect will require a minimum period of one month for the design development. 2 months will be required for work drawings.",
            "The architect will represent the owner and will advise and consult with the owner regarding construction.",
            "The architect will be responsible for checking the contractor's progress and giving the approval for payments due to the contractor.",
            "The architect is to prepare a maximum of 2 design proposals for the proposal stage for the client. If one proposal is developed, it can be revised two times, free of cost to the client. If, however, 2 design proposals are made, the second proposal can be revised three times, free of cost to the client. If the client wishes for another revision of the proposal, the architect will be paid Rs. 300,000 in advance for each drawing. If the client wishes to develop a third proposal, the architect will be paid Rs. 500,000 as advance payment for the task and Rs. 300,000 per revision of the third proposal.",
            "No revision will be made after the Issuance of Construction Drawings. If client wants the revision, he will have to pay for the amount ascertained in the contract.",
            "No revision will be made for working drawings. If client wants the revision, he will be required to pay the amount.",
            "Project supervision will include visits as mentioned in Construction Activity Schedule.",
            "The Architect will provide 3 Sets of working drawings to the client. For additional sets of working drawings Rs. 50,000 per set will be charged.",
            "The Architect will provide only two options/revisions of 3Ds for the Facade after which any option/revision wil be charged based on normal market rates. For Interior renderings Rs. 500,000/- will be charged."
        ].forEach((item, i) => addListItem(item, 1, `${i+1}.`));
        y += 5;

        addText("The Architect will not be responsible for the following things:");
        [
            "Continuous site supervision.",
            "Technical sequences and procedures of the contractors.",
            "Change of acts and omissions of the contractor. These are the contractor's responsibilities.",
            "Changes and omissions made on the owner's directions."
        ].forEach((item, i) => addListItem(item, 1, `${i+1}.`));
        y += 5;

        addTitle("ARTICLE-1: Termination of the Agreement");
        [
            "The agreement may be terminated by any of the parties on 7 days written notice. The other party will substantially perform in accordance with its items though no fault of the party initiating the termination.",
            "The owner at least on 7 days’ notice to the designer may terminate the agreement in the event that the project is permanently abandoned.",
            "In the event of termination not the fault of the design builder, the design builder will be compensated for services performed till termination date.",
            "No reimbursable then due and termination expenses. The termination expenses are the expenses directly attributable to the termination including a reasonable amount of overhead and profit for which the design/builder is not otherwise compensated under this agreement."
        ].forEach((item, i) => addListItem(item, 1, `${i+1}.`));
        y += 5;

        addTitle("ARTICLE-2: Bases of Compensation");
        addText("The owner will compensate the design/builder in accordance with this agreement, payments, and the other provisions of this agreement as described below.");
        [
            "Compensation for basic services",
            "Basic services will be as mentioned",
            "Subsequent payments will be as mentioned",
            "Compensation for additional services",
            "For additional services compensation will be as mentioned",
            "Travel expenses of Architect, Engineer, Sub-Engineer and Sub Consultant will be separately billed",
            "Computer Animation will be charged at the normal market rates",
            "The rate of interest past due payments will be 15 % per month"
        ].forEach(item => addListItem(item));

        checkPageBreak(25);
        y += 15;
        doc.text("______________", 14, y);
        doc.text("_______________", 140, y);
        y += 5;
        doc.text("Architect", 14, y);
        doc.text("Client", 140, y);
        
        doc.save("project-agreement.pdf");
        toast({ title: 'Download Started', description: 'Project Agreement PDF is being generated.' });
    };
    
    const renderField = (name: string) => {
        if (isEditing) {
            return <Input name={name} value={formData[name] || ''} onChange={handleInputChange} className="inline-block w-48 h-6" />;
        }
        return <span className="border-b border-gray-400 inline-block min-w-[100px] px-1">{formData[name] || ''}</span>;
    };
    
    if (isLoading || isUserLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }
    
    if (!user && !isUserLoading) {
       return (
         <main className="p-4 md:p-6 lg:p-8">
          <Card>
            <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Unable to Authenticate</AlertTitle>
                <AlertDescription>We could not sign you in. Please refresh the page to try again.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
      )
    }

    return (
    <main className="p-4 md:p-6 lg:p-8">
        <div className="mb-4">
            <Button variant="outline" asChild>
                <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
            </Button>
        </div>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Agreement</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleDownloadPdf} variant="outline"><Download /> PDF</Button>
                    {isEditing ? (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <h2 className="text-xl font-bold text-center mb-4">COMMERCIAL AGREEMENT</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-8">
                        <div>
                            <p>Made as of the day</p>
                            <p>Between the Owner</p>
                            <p>And the Firm</p>
                            <p>For the Design of</p>
                            <p>Address</p>
                            <p>Covered Area of Project</p>
                            <p>Consultancy Charges @ Rs ___/Sft</p>
                            <p>Sales Tax @ 16%</p>
                            <p>Withholding Tax @ 10%</p>
                            <p>Final Consultancy Charges</p>
                        </div>
                        <div>
                            <div>: {renderField("day")}</div>
                            <div>: {renderField("owner")}</div>
                            <p>: Isbah Hassan & Associates</p>
                            <div>: {renderField("designOf")}</div>
                            <div>: {renderField("address")}</div>
                            <div>: {renderField("coveredArea")}</div>
                            <div>: {renderField("consultancyCharges")}</div>
                            <div>: {renderField("salesTax")}</div>
                            <div>: {renderField("withholdingTax")}</div>
                            <div>: {renderField("finalCharges")}</div>
                        </div>
                    </div>
    
                    <Subtitle>PAYMENT SCHEDULE:</Subtitle>
                    <div className="grid grid-cols-2 gap-x-8">
                        <div>
                            <p>On mobilization (advance payment)</p>
                            <p>On approval of schematic designs & 3D’s</p>
                            <p>On completion of submission drawings</p>
                            <p>On start of construction drawings</p>
                            <p>On completion of construction drawings</p>
                            <p>On completion of interior drawings</p>
                            <p>On preparation of detailed BOQ</p>
                        </div>
                        <div>
                            <p>: 20 %</p>
                            <p>: 15%</p>
                            <p>: 15%</p>
                            <p>: 15%</p>
                            <p>: 10%</p>
                            <p>: 10%</p>
                            <p>: 10%</p>
                        </div>
                    </div>
                    
                    <Subtitle>Project Management:</Subtitle>
                    <h4 className="font-semibold">Top Supervision:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Please find attached the site visit schedule for the project please intimate the office one week in advance before the required visit for timely surveillance. Any Unscheduled visits would be charged as under.</li>
                        <li>For out of station visits, the travelling by air and lodging in a five-star hotel will be paid by the client.
                            <ul className="list-disc pl-5">
                                <li>Rs. 50,000 for Principal Architect's site visit per day.</li>
                                <li>Rs. 30,000 for Associate Architect's site visit per day.</li>
                            </ul>
                        </li>
                        <li>For International visits, the travelling by air and lodging in a five-star hotel will be paid by the client.
                             <ul className="list-disc pl-5">
                                <li>Rs. 150,000 for Principal Architect' s fee per day.</li>
                                <li>Rs. 30,000 for Associate Architect' s fee per day.</li>
                            </ul>
                        </li>
                    </ul>
    
                    <h4 className="font-semibold mt-4">Detailed Supervision:</h4>
                    <p>The fee for detailed supervision will be Rs. 300,000 /- per month, which will ensure daily progress at the site.</p>
                    
                    <h4 className="font-semibold mt-4">Please Note:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>The above quoted rates do not include any kind of tax.</li>
                        <li>The contract value is lumpsum for the area between 90,000 to 120,000 Sft, if however, the area increases the above amount only the sub-consultants fee @ Rs. 70/Sft will be charged.</li>
                        <li>The above consultancy charges quoted are valid for only two months.</li>
                    </ul>
    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div>
                            <Subtitle>Architectural Design Services:</Subtitle>
                            <ol className="list-decimal pl-5 space-y-1">
                                <li>Space Planning</li>
                                <li>Design Concept</li>
                                <li>Design Development & 3Ds (Facade)</li>
                                <li>Budgeting Bil of Quantity’s.</li>
                                <li>Work Drawings
                                    <ul className="list-[circle] pl-5">
                                        <li>Site Plan</li>
                                        <li>Ground Floor Plan</li>
                                        <li>Mezzanine Floor Plan</li>
                                        <li>Elevation NE</li>
                                        <li>Elevation NW</li>
                                        <li>Elevation SW</li>
                                        <li>Sections</li>
                                        <li>Stair Details</li>
                                        <li>Kitchen Details</li>
                                        <li>Bath Details</li>
                                        <li>Schedules</li>
                                    </ul>
                                </li>
                                <li>Structure Drawing
                                    <ul className="list-[circle] pl-5">
                                        <li>Foundation Plan</li>
                                        <li>Floor Framing Plan</li>
                                        <li>Wall Elev. & Slab Section</li>
                                        <li>Wall section & Details</li>
                                        <li>Stair Details</li>
                                        <li>Schedules</li>
                                        <li>Specs of Concrete</li>
                                    </ul>
                                </li>
                                <li>Electrification Drawings
                                    <ul className="list-[circle] pl-5">
                                        <li>Power Plan</li>
                                        <li>Lighting Plans</li>
                                        <li>Section & Details</li>
                                        <li>Communication Plan</li>
                                    </ul>
                                </li>
                                <li>Plumbing Drawings
                                    <ul className="list-[circle] pl-5">
                                        <li>Water Protect System</li>
                                        <li>Soil Protect System</li>
                                        <li>Ventilation System</li>
                                        <li>Fire Protection System</li>
                                    </ul>
                                </li>
                                <li>Miscelaneous Services
                                    <ul className="list-[circle] pl-5">
                                        <li>Roof air Conditioning</li>
                                        <li>H.V.A.C</li>
                                        <li>Material Specifications</li>
                                    </ul>
                                </li>
                                <li>Extra Services
                                     <ul className="list-[circle] pl-5">
                                        <li>Landscaping</li>
                                        <li>Acoustical</li>
                                        <li>Land Survey</li>
                                        <li>Geo-Technical Survey</li>
                                        <li>Graphic design</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>
                        <div>
                            <Subtitle>Interior Design Services:</Subtitle>
                            <h4 className="font-semibold">Design Details:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Flooring</li>
                                <li>Wood Work</li>
                                <li>Doors</li>
                                <li>Windows</li>
                                <li>False Ceiling</li>
                                <li>Lighting</li>
                                <li>Bath Details</li>
                                <li>Kitchen Details</li>
                                <li>Wall Textures.</li>
                                <li>Stairways</li>
                                <li>Built-in Features Fire Places</li>
                                <li>Patios</li>
                                <li>Water bodies</li>
                                <li>Trellis</li>
                                <li>Skylights</li>
                                <li>Furniture</li>
                                <li>Partitioning</li>
                            </ul>
                            <p className="mt-4"><strong>Note:</strong> The item number 9& 10 is under the head of extra services if the client requests these services, the extra charges wil be as mentioned above.</p>
                        </div>
                    </div>
    
                    <Subtitle>Architect's Responsibilities.</Subtitle>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>The architect will produce a maximum of two proposals are revisions for the client for the said amount of consultancy every proposal or revision after this will be charged @ Rs. 500,000 /- per Proposal.</li>
                        <li>The architect will require a minimum period of one month for the design development. 2 months will be required for work drawings.</li>
                        <li>The architect will represent the owner and will advise and consult with the owner regarding construction.</li>
                        <li>The architect will be responsible for checking the contractor's progress and giving the approval for payments due to the contractor.</li>
                        <li>The architect is to prepare a maximum of 2 design proposals for the proposal stage for the client. If one proposal is developed, it can be revised two times, free of cost to the client. If, however, 2 design proposals are made, the second proposal can be revised three times, free of cost to the client. If the client wishes for another revision of the proposal, the architect will be paid Rs. 300,000 in advance for each drawing. If the client wishes to develop a third proposal, the architect will be paid Rs. 500,000 as advance payment for the task and Rs. 300,000 per revision of the third proposal.</li>
                        <li>No revision will be made after the Issuance of Construction Drawings. If client wants the revision, he will have to pay for the amount ascertained in the contract.</li>
                        <li>No revision will be made for working drawings. If client wants the revision, he will be required to pay the amount.</li>
                        <li>Project supervision will include visits as mentioned in Construction Activity Schedule.</li>
                        <li>The Architect will provide 3 Sets of working drawings to the client. For additional sets of working drawings Rs. 50,000 per set will be charged.</li>
                        <li>The Architect will provide only two options/revisions of 3Ds for the Facade after which any option/revision wil be charged based on normal market rates. For Interior renderings Rs. 500,000/- will be charged.</li>
                    </ol>
    
                    <h4 className="font-semibold mt-4">The Architect will not be responsible for the following things:</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Continuous site supervision.</li>
                        <li>Technical sequences and procedures of the contractors.</li>
                        <li>Change of acts and omissions of the contractor. These are the contractor's responsibilities.</li>
                        <li>Changes and omissions made on the owner's directions.</li>
                    </ol>
                    
                    <Subtitle>ARTICLE-1: Termination of the Agreement</Subtitle>
                     <ol className="list-decimal pl-5 space-y-2">
                        <li>The agreement may be terminated by any of the parties on 7 days written notice. The other party will substantially perform in accordance with its items though no fault of the party initiating the termination.</li>
                        <li>The owner at least on 7 days’ notice to the designer may terminate the agreement in the event that the project is permanently abandoned.</li>
                        <li>In the event of termination not the fault of the design builder, the design builder will be compensated for services performed till termination date.</li>
                        <li>No reimbursable then due and termination expenses. The termination expenses are the expenses directly attributable to the termination including a reasonable amount of overhead and profit for which the design/builder is not otherwise compensated under this agreement.</li>
                    </ol>
    
                    <Subtitle>ARTICLE-2: Bases of Compensation</Subtitle>
                    <p>The owner will compensate the design/builder in accordance with this agreement, payments, and the other provisions of this agreement as described below.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Compensation for basic services</li>
                        <li>Basic services will be as mentioned</li>
                        <li>Subsequent payments will be as mentioned</li>
                        <li>Compensation for additional services</li>
                        <li>For additional services compensation will be as mentioned</li>
                        <li>Travel expenses of Architect, Engineer, Sub-Engineer and Sub Consultant will be separately billed</li>
                        <li>Computer Animation will be charged at the normal market rates</li>
                        <li>The rate of interest past due payments will be 15 % per month</li>
                    </ul>
                    
                    <div className="flex justify-between mt-8 pt-8 border-t">
                        <div>
                            <p>______________</p>
                            <p>Architect</p>
                        </div>
                        <div>
                            <p>_______________</p>
                            <p>Client</p>
                        </div>
                    </div>
    
                </div>
            </CardContent>
        </Card>
    </main>
    );
}
