
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PROJECT_DATA_DOC_ID = "main-project-data";

const Subtitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
);

const FormField = ({ label, value, as, children, isEditing, onChange, name }: { label: string, value?: string, as?: 'textarea', children?: React.ReactNode, isEditing?: boolean, onChange?: (e: any) => void, name?: string }) => (
    <div className="flex flex-col space-y-1">
        <span className="font-semibold text-sm">{label}:</span>
        {isEditing ? (
            as === 'textarea' ? <Textarea name={name} value={value || ''} onChange={onChange} /> : <Input name={name} value={value || ''} onChange={onChange} />
        ) : children ? children : (
             <div className="border-b min-h-[24px] py-1">{value || ''}</div>
        )}
    </div>
);


export default function ProjectDataPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const projectDataDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectData/${PROJECT_DATA_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!projectDataDocRef) return;

        setIsLoading(true);
        getDoc(projectDataDocRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    setFormData(docSnap.data() || {});
                }
            })
            .catch((serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: projectDataDocRef.path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [projectDataDocRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!isEditing) return;
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
        if (!isEditing || typeof checked !== 'boolean') return;
        setFormData((prev: any) => ({ ...prev, [name]: checked }));
    };

    const handleRadioChange = (name: string, value: string) => {
        if (!isEditing) return;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!projectDataDocRef) {
          toast({ variant: "destructive", title: "Save Failed", description: "User not authenticated." });
          return;
        }
        setIsSaving(true);
        setDoc(projectDataDocRef, formData, { merge: true })
          .then(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast({
              title: "Project Data Saved",
              description: "Your changes have been saved successfully.",
            });
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: projectDataDocRef.path,
              operation: 'write',
              requestResourceData: formData,
            });
            errorEmitter.emit('permission-error', permissionError);
            setIsSaving(false);
          });
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        let y = 15;
    
        const addField = (label: string, value: string | undefined, options: { isTextarea?: boolean, xOffset?: number } = {}) => {
            if (y > 270) {
                doc.addPage();
                y = 15;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(label, options.xOffset || 14, y);
            
            doc.setFont('helvetica', 'normal');
            const textY = y + 5;
            const text = value || '____________________';
            const splitText = doc.splitTextToSize(text, options.isTextarea ? 180 : 80);
            const textHeight = doc.getTextDimensions(splitText).h;

            if (textY + textHeight > 280) {
                 doc.addPage();
                 y = 15;
            }

            doc.text(splitText, options.xOffset || 14, textY);
            y = textY + (options.isTextarea ? textHeight + 4 : 0);
            if (!options.isTextarea) y += -5;
        };

        const addDualField = (label1: string, value1: string | undefined, label2: string | undefined, value2: string | undefined) => {
            if (y > 270) {
                doc.addPage();
                y = 15;
            }
            addField(label1, value1);
            if(label2) {
                addField(label2, value2, { xOffset: 105 });
            }
            y += 10;
        }
    
        const addCheckbox = (label: string, value: boolean | undefined, options: { xOffset?: number } = {}) => {
            if (y > 280) {
                doc.addPage();
                y = 15;
            }
            doc.setFontSize(10);
            doc.text(`${value ? '[✓]' : '[ ]'} ${label}`, options.xOffset || 14, y);
            if (!options.xOffset) {
                 y += 7;
            }
        };
    
        const addTitle = (title: string, size = 12) => {
            if (y > 260) {
                doc.addPage();
                y = 15;
            }
            doc.setFontSize(size);
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(30, 41, 59);
            doc.rect(14, y - 5, 182, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(title, 16, y);
            y += 8;
            doc.setTextColor(0, 0, 0);
        };
    
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Project Data", 105, y, { align: 'center' });
        y += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
    
        addDualField("Project", formData.project, "Architect's Project No.", formData.architectsProjectNo);
        addDualField("Address", formData.address, "Date", formData.date);
        addDualField("Owner", formData.owner, "Tel", formData.tel);
        addDualField("Business Address", formData.businessAddress, "Home Address", formData.homeAddress);
        
        y += 5;
        addField("Proposed Improvements", formData.proposedImprovements, { isTextarea: true });
        y += 10;

        addDualField("Building Dept. Classification", formData.buildingDeptClassification, "Set Backs", formData.setBacks);
        addDualField("Cost", formData.cost, "Stories", formData.stories);
        addDualField("Fire Zone", formData.fireZone, undefined, undefined);
        y += 5;

        addField("Other Agency Standards or Approvals Required", formData.otherAgencyStandards, { isTextarea: true });
        y += 10;
        addField("Site Legal Description", formData.siteLegalDescription, { isTextarea: true });
        y += 10;
        addDualField("Deed recorded in", formData.deedRecorded, undefined, undefined);
        y += 10;

        addField("Restrictions", formData.restrictions, { isTextarea: true });
        y += 10;
        addField("Easements", formData.easements, { isTextarea: true });
        y += 10;
        addField("Liens, Leases", formData.liensLeases, { isTextarea: true });
        y += 10;

        addDualField("Lot Dimensions", formData.lotDimensions, undefined, undefined);
        y += 5;
        addField("Adjacent property use", formData.adjacentPropertyUse, { isTextarea: true });
        y += 10;
        
        addDualField("Owners: Name", formData.ownerName, "Designated Representative", formData.designatedRep);
        addDualField("Address", formData.repAddress, "Tel", formData.repTel);
        addDualField("Attorney at Law", formData.attorney, "Insurance Advisor", formData.insuranceAdvisor);
        addDualField("Consultant on", formData.consultantOn, undefined, undefined);

        y += 10;
        addTitle("Site Information Sources");
        addDualField("Property Survey by", formData.propertySurveyBy, "Topographic Survey by", formData.topographicSurveyBy);
        addDualField("Soils Tests by", formData.soilsTestsBy, "Aerial Photos by", formData.aerialPhotosBy);
        addDualField("Maps", formData.maps, undefined, undefined);

        y += 10;
        addTitle("Public Services");
        autoTable(doc, {
            startY: y,
            head: [['Company', 'Name and Address', 'Representative', 'Tel']],
            body: [
                ['Gas Company', formData.gas_address, formData.gas_rep, formData.gas_tel],
                ['Electric Co', formData.electric_address, formData.electric_rep, formData.electric_tel],
                ['Telephone Co', formData.telco_address, formData.telco_rep, formData.telco_tel],
            ],
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [30, 41, 59] }
        });
        y = (doc as any).lastAutoTable.finalY + 7;
        addDualField("Sewers", formData.sewers, "Water", formData.water);

        y += 10;
        addTitle("Financial Data");
        addDualField("Loan Amount", formData.loanAmount, "Loan by", formData.loanBy);
        addDualField("Bonds or Liens", formData.bondsOrLiens, "Grant Amount", formData.grantAmount);
        addDualField("Grant from", formData.grantFrom, undefined, undefined);

        y += 10;
        addTitle("Method of Handling");
        addCheckbox("Single Contract", formData.method_single);
        addCheckbox("Separate Contracts", formData.method_separate, { xOffset: 70 });
        y += 7;
        
        doc.setFont('helvetica', 'bold');
        doc.text("Bidding", 14, y); y+=7;
        doc.setFont('helvetica', 'normal');
        addCheckbox("Negotiated", formData.negotiatedBid === "negotiated");
        addCheckbox("Bid", formData.negotiatedBid === "bid", { xOffset: 70 });
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.text("Contract", 14, y); y+=7;
        doc.setFont('helvetica', 'normal');
        addCheckbox("Stipulated Sum", formData.stipulatedSum);
        addCheckbox("Cost Plus Fee", formData.costPlusFee, { xOffset: 70 });
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.text("Scope", 14, y); y+=7;
        doc.setFont('helvetica', 'normal');
        addCheckbox("Equipment", formData.equipment);
        addCheckbox("Landscaping", formData.landscaping, { xOffset: 70 });

        y += 10;
        addTitle("Sketch of Property");
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text("Notations on existing improvements, disposal thereof, utilities, tree, etc.; indicated North; notations on other Project provision:", 14, y);
        y += 5;
        doc.rect(14, y, 180, 50);
    
        doc.save("project-data.pdf");
        toast({ title: "Download started", description: "Your PDF is being generated." });
    }

    const renderInput = (name: string, label: string) => (
        <FormField label={label} name={name} value={formData[name]} onChange={handleInputChange} isEditing={isEditing} />
    );

    const renderTextarea = (name: string, label: string) => (
        <FormField label={label} as="textarea" name={name} value={formData[name]} onChange={handleInputChange} isEditing={isEditing} />
    );
    
    const renderCheckbox = (name: string, label: string) => (
         <div className="flex items-center space-x-2">
            <Checkbox id={name} name={name} checked={formData[name] || false} onCheckedChange={(checked) => handleCheckboxChange(name, checked)} disabled={!isEditing}/>
            <Label htmlFor={name}>{label}</Label>
        </div>
    );
    
    const renderRadioGroup = (name: string, labels: string[]) => (
        <RadioGroup
            name={name}
            value={formData[name]}
            onValueChange={(value) => handleRadioChange(name, value)}
            className="flex gap-4"
            disabled={!isEditing}
        >
            {labels.map(label => (
                 <div key={label} className="flex items-center space-x-2">
                    <RadioGroupItem value={label.toLowerCase()} id={`${name}-${label.toLowerCase()}`} />
                    <Label htmlFor={`${name}-${label.toLowerCase()}`}>{label}</Label>
                </div>
            ))}
        </RadioGroup>
    );

    if (isLoading || isUserLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
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
                    <CardTitle>Project Data</CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={handleDownload} variant="outline"><Download /> Download PDF</Button>
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
                    <div className="space-y-4">
                        {renderInput("project", "Project")}
                        {renderInput("address", "Address")}
                        {renderInput("owner", "Owner")}
                        {renderInput("architectsProjectNo", "Architect's Project No.")}
                        {renderInput("date", "Date")}
                        {renderInput("tel", "Tel")}
                        {renderInput("businessAddress", "Business Address")}
                        {renderInput("homeAddress", "Home Address")}
                        {renderTextarea("proposedImprovements", "Proposed Improvements")}
                        {renderInput("buildingDeptClassification", "Building Dept. Classification")}
                        {renderInput("setBacks", "Set Backs")}
                        {renderInput("cost", "Cost")}
                        {renderInput("stories", "Stories")}
                        {renderInput("fireZone", "Fire Zone")}
                        {renderTextarea("otherAgencyStandards", "Other Agency Standards or Approvals Required")}
                        {renderTextarea("siteLegalDescription", "Site Legal Description")}
                        {renderInput("deedRecorded", "Deed recorded in")}
                        {renderTextarea("restrictions", "Restrictions")}
                        {renderTextarea("easements", "Easements")}
                        {renderTextarea("liensLeases", "Liens, Leases")}
                        {renderInput("lotDimensions", "Lot Dimensions")}
                        {renderTextarea("adjacentPropertyUse", "Adjacent property use")}
                        {renderInput("ownerName", "Owners: Name")}
                        {renderInput("designatedRep", "Designated Representative")}
                        {renderInput("repAddress", "Address")}
                        {renderInput("repTel", "Tel")}
                        {renderInput("attorney", "Attorney at Law")}
                        {renderInput("insuranceAdvisor", "Insurance Advisor")}
                        {renderInput("consultantOn", "Consultant on")}
                        
                        <Subtitle>Site Information Sources:</Subtitle>
                        {renderInput("propertySurveyBy", "Property Survey by")}
                        {renderInput("topographicSurveyBy", "Topographic Survey by")}
                        {renderInput("soilsTestsBy", "Soils Tests by")}
                        {renderInput("aerialPhotosBy", "Aerial Photos by")}
                        {renderInput("maps", "Maps")}
                        
                        <Subtitle>Public Services:</Subtitle>
                        <Table>
                            <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Name and Address</TableHead><TableHead>Representative</TableHead><TableHead>Tel</TableHead></TableRow></TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Gas Company</TableCell>
                                    <TableCell>{isEditing ? <Input name="gas_address" value={formData.gas_address || ''} onChange={handleInputChange} /> : formData.gas_address}</TableCell>
                                    <TableCell>{isEditing ? <Input name="gas_rep" value={formData.gas_rep || ''} onChange={handleInputChange} /> : formData.gas_rep}</TableCell>
                                    <TableCell>{isEditing ? <Input name="gas_tel" value={formData.gas_tel || ''} onChange={handleInputChange} /> : formData.gas_tel}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell>Electric Co</TableCell>
                                    <TableCell>{isEditing ? <Input name="electric_address" value={formData.electric_address || ''} onChange={handleInputChange} /> : formData.electric_address}</TableCell>
                                    <TableCell>{isEditing ? <Input name="electric_rep" value={formData.electric_rep || ''} onChange={handleInputChange} /> : formData.electric_rep}</TableCell>
                                    <TableCell>{isEditing ? <Input name="electric_tel" value={formData.electric_tel || ''} onChange={handleInputChange} /> : formData.electric_tel}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell>Telephone Co</TableCell>
                                    <TableCell>{isEditing ? <Input name="telco_address" value={formData.telco_address || ''} onChange={handleInputChange} /> : formData.telco_address}</TableCell>
                                    <TableCell>{isEditing ? <Input name="telco_rep" value={formData.telco_rep || ''} onChange={handleInputChange} /> : formData.telco_rep}</TableCell>
                                    <TableCell>{isEditing ? <Input name="telco_tel" value={formData.telco_tel || ''} onChange={handleInputChange} /> : formData.telco_tel}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        {renderInput("sewers", "Sewers")}
                        {renderInput("water", "Water")}
                        
                        <Subtitle>Financial Data:</Subtitle>
                        {renderInput("loanAmount", "Loan Amount")}
                        {renderInput("loanBy", "Loan by")}
                        {renderInput("bondsOrLiens", "Bonds or Liens")}
                        {renderInput("grantAmount", "Grant Amount")}
                        {renderInput("grantFrom", "Grant from")}
                        
                        <Subtitle>Method of Handling:</Subtitle>
                        <div className="flex gap-4 items-center">
                            <Label>Contract Type:</Label>
                            {renderCheckbox("method_single", "Single Contract")}
                            {renderCheckbox("method_separate", "Separate Contracts")}
                        </div>
                         <div className="flex gap-4 items-center">
                            <Label>Bidding:</Label>
                            {renderRadioGroup("negotiatedBid", ["Negotiated", "Bid"])}
                        </div>
                         <div className="flex gap-4 items-center">
                            <Label>Contract:</Label>
                            {renderCheckbox("stipulatedSum", "Stipulated Sum")}
                            {renderCheckbox("costPlusFee", "Cost Plus Fee")}
                        </div>
                         <div className="flex gap-4 items-center">
                            <Label>Scope:</Label>
                            {renderCheckbox("equipment", "Equipment")}
                            {renderCheckbox("landscaping", "Landscaping")}
                        </div>
                        
                        <Subtitle>Sketch of Property:</Subtitle>
                        <p>Notations on existing improvements, disposal thereof, utilities, tree, etc.; indicated North; notations on other Project provision:</p>
                        <div className="border h-48 mt-2"></div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

