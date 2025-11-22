
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ArrowLeft, Download, Edit, Save, Loader2, Terminal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { exportChecklistToPdf } from '@/lib/utils';


const PROJECT_CHECKLIST_DOC_ID = "project-checklist";


const SectionTitle = ({ children, isEditing, checked, onCheckedChange, id }: { children: React.ReactNode, isEditing?: boolean, checked?: boolean, onCheckedChange?: (checked: boolean | 'indeterminate') => void, id?: string }) => (
    <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold mt-8 mb-4 pt-4 flex-grow">{children}</h2>
        {isEditing && id && (
            <div className="flex items-center gap-2 pt-4">
                <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
                <Label htmlFor={id}>Mark as Complete</Label>
            </div>
        )}
    </div>
);

const Subtitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
);

const FormField = ({ label, value, children, isEditing, onChange, name }: { label: string, value?: string, children?: React.ReactNode, isEditing?: boolean, onChange?: (e: any) => void, name?: string }) => (
    <div className="flex flex-col space-y-1">
        <span className="font-semibold text-sm">{label}:</span>
        {isEditing ? (
            <Input name={name} value={value || ''} onChange={onChange} />
        ) : children ? children : (
             <div className="border-b min-h-[24px] py-1">{value || ''}</div>
        )}
    </div>
);


const ProjectChecklistPage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    
    const checklistDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectChecklists/${PROJECT_CHECKLIST_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!isUserLoading && !user && auth) {
            initiateAnonymousSignIn(auth);
        }
    }, [isUserLoading, user, auth]);

    useEffect(() => {
        if (!checklistDocRef) return;

        setIsLoading(true);
        getDoc(checklistDocRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    setFormData(docSnap.data() || {});
                }
            })
            .catch((serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: checklistDocRef.path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [checklistDocRef]);

    
    const initialChecklists = {
        Predesign: {
          "Predesign Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Programming", "Space Schematics/ Flow Diagrams", "Existing Facilities Surveys", "Presentations"],
          "Site Analysis Services": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Site Analysis and Selection", "Site Development and Planning", "Detailed Site Utilization Studies", "Onsite Utility Studies", "Offsite Utility Studies", "Zoning Processing Assistance", "Project Development Scheduling", "Project Budgeting", "Presentations"]
        },
        Design: {
          "Schematic Design Services: -": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design/ Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research/ Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"],
          "Design Development Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design / Documentation", "Electrical Design / Documentation", "Civil Design / Documentation", "Landscape Design / Documentation", "Interior Design / Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"],
          "Construction Documents Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design/ Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"]
        },
        Construction: {
          "Bidding Or Negotiation Services:": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Bidding Materials", "Addenda", "Bidding Negotiations", "Analysis Of Alternates/ Substitutions", "Special Bidding Services", "Bid Evaluation", "Construction Contract Agreements"],
          "Construction Contract Administration Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Office Construction Administration", "Construction Field Observation", "Project Representation", "Inspection Coordination", "Supplemental Documents", "10.Quotation Requests/ Change Orders", "11.Project Schedule Monitoring", "12.Construction Cost Accounting", "13.Project Closeout"]
        },
        Post: {
          "Post Construction Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Maintenance And Operational Programming", "Start Up Assistance", "Record Drawings", "Warranty Review", "Post Construction Evaluation"]
        },
        Supplemental: {
          "Supplemental Services: -": ["Graphics Design", "Fine Arts and Crafts Services", "Special Furnishing Design", "Non-Building Equipment Selection"],
          "List Of Materials:-": ["Conceptual Site and Building Plans/ Basic Layout", "Preliminary Sections and Elevations", "Air Conditioning/ H.V.A.C Design", "Plumbing", "Fire Protection", "Special Mechanical Systems", "General Space Requirements", "Power Services and Distribution", "Telephones", "Security Systems", "Special Electrical Systems", "Landscaping", "Materials", "Partition Sections", "Furniture Design", "Identification Of Potential Architectural Materials", "Specification Of a. Wall Finishes b. Floor Finishes c. Windows Coverings d. Carpeting", "Specialized Features Construction Details", "Project Administration", "Space Schematic Flow", "Existing Facilities Services", "Project Budgeting", "Presentation"]
        }
    };
    const checklistCategories = Object.keys(initialChecklists);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
        if (!isEditing || typeof checked !== 'boolean') return;
        setFormData(prev => ({...prev, [name]: checked }));
    };
    
    const handleSave = () => {
        if (!checklistDocRef) {
          toast({ variant: "destructive", title: "Save Failed", description: "User not authenticated." });
          return;
        }
        setIsSaving(true);
        setDoc(checklistDocRef, formData, { merge: true })
          .then(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast({
              title: "Data Saved",
              description: "Your changes have been saved successfully.",
            });
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: checklistDocRef.path,
              operation: 'write',
              requestResourceData: formData,
            });
            errorEmitter.emit('permission-error', permissionError);
            setIsSaving(false);
          });
    };
    
    const handleDownload = () => {
        exportChecklistToPdf(formData, checklistCategories, initialChecklists);
    }

    const renderChecklist = (mainCategory: keyof typeof initialChecklists) => {
      const subSections = initialChecklists[mainCategory];
      return (
        <div>
          {Object.entries(subSections).map(([subTitle, items]) => (
            <div key={subTitle} className="mb-4">
              <Subtitle>{subTitle}</Subtitle>
              <div className="space-y-2">
                {items.map((item, index) => {
                  const itemKey = `${mainCategory}-${subTitle}-${item}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  return (
                    <div key={index} className="flex items-center gap-2">
                      {isEditing ? (
                        <Checkbox
                          id={itemKey}
                          checked={(formData as any)[itemKey] || false}
                          onCheckedChange={(checked) => handleCheckboxChange(itemKey, checked)}
                        />
                      ) : (
                        <span className="mr-2">{(formData as any)[itemKey] ? '✓' : '🔲'}</span>
                      )}
                      <label htmlFor={itemKey} className="flex-grow">{item}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

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
                    <CardTitle>Project Checklist</CardTitle>
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
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Project" name="project" value={(formData as any).project} onChange={handleInputChange} isEditing={isEditing} />
                        <FormField label="Name, Address" name="nameAddress" value={(formData as any).nameAddress} onChange={handleInputChange} isEditing={isEditing} />
                        <FormField label="Architect" name="architect" value={(formData as any).architect} onChange={handleInputChange} isEditing={isEditing} />
                        <FormField label="Architect Project No" name="architectProjectNo" value={(formData as any).architectProjectNo} onChange={handleInputChange} isEditing={isEditing} />
                        <FormField label="Project Date" name="projectDate" value={(formData as any).projectDate} onChange={handleInputChange} isEditing={isEditing} />
                    </div>
                    {checklistCategories.map((category) => (
                    <div key={category}>
                        <SectionTitle
                        id={`mainSection-${category.toLowerCase()}`}
                        isEditing={isEditing}
                        checked={(formData as any)[`mainSection-${category.toLowerCase()}`]}
                        onCheckedChange={(checked) => handleCheckboxChange(`mainSection-${category.toLowerCase()}`, checked)}
                        >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SectionTitle>
                        {renderChecklist(category as keyof typeof initialChecklists)}
                    </div>
                    ))}
                </CardContent>
            </Card>
        </main>
    );
};
export default ProjectChecklistPage;
