
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Download, Edit, Save, Loader2, ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { exportServicesToPdf } from '@/lib/utils';

const PROJECT_SERVICES_DOC_ID = "project-services-checklist";

const serviceSections = {
    "Predesign": {
        "Predesign Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Programming", "Space Schematics/ Flow Diagrams", "Existing Facilities Surveys", "Presentations"],
        "Site Analysis Services": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Site Analysis and Selection", "Site Development and Planning", "Detailed Site Utilization Studies", "Onsite Utility Studies", "Offsite Utility Studies", "Zoning Processing Assistance", "Project Development Scheduling", "Project Budgeting", "Presentations"]
    },
    "Design": {
        "Schematic Design Services: -": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design/ Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research/ Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"],
        "Design Development Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design / Documentation", "Electrical Design / Documentation", "Civil Design / Documentation", "Landscape Design / Documentation", "Interior Design / Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"],
        "Construction Documents Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design/ Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"]
    },
    "Construction": {
        "Bidding Or Negotiation Services:": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Bidding Materials", "Addenda", "Bidding Negotiations", "Analysis Of Alternates/ Substitutions", "Special Bidding Services", "Bid Evaluation", "Construction Contract Agreements"],
        "Construction Contract Administration Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Office Construction Administration", "Construction Field Observation", "Project Representation", "Inspection Coordination", "Supplemental Documents", "Quotation Requests/ Change Orders", "Project Schedule Monitoring", "Construction Cost Accounting", "Project Closeout"]
    },
    "Post": {
        "Post Construction Services:-": ["Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Maintenance And Operational Programming", "Start Up Assistance", "Record Drawings", "Warranty Review", "Post Construction Evaluation"]
    },
    "Supplemental": {
        "Supplemental Services: -": ["Graphics Design", "Fine Arts and Crafts Services", "Special Furnishing Design", "Non-Building Equipment Selection"],
        "List Of Materials:-": ["Conceptual Site and Building Plans/ Basic Layout", "Preliminary Sections and Elevations", "Air Conditioning/ H.V.A.C Design", "Plumbing", "Fire Protection", "Special Mechanical Systems", "General Space Requirements", "Power Services and Distribution", "Telephones", "Security Systems", "Special Electrical Systems", "Landscaping", "Materials", "Partition Sections", "Furniture Design", "Identification Of Potential Architectural Materials", "Specification Of a. Wall Finishes b. Floor Finishes c. Windows Coverings d. Carpeting", "Specialized Features Construction Details", "Project Administration", "Space Schematic Flow", "Existing Facilities Services", "Project Budgeting", "Presentation"]
    }
};

const ListOfServicesPage = () => {
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

    const servicesDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectData/${PROJECT_SERVICES_DOC_ID}`);
    }, [user, firestore]);

    useEffect(() => {
        if (!servicesDocRef) return;
        setIsLoading(true);
        getDoc(servicesDocRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load services data.' });
        }).finally(() => setIsLoading(false));
    }, [servicesDocRef, toast]);
    
    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
        if (typeof checked === 'boolean') {
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
        }
    };
    
    const handleSave = () => {
        if (!servicesDocRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(servicesDocRef, formData, { merge: true }).then(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast({ title: 'Success', description: 'List of Services saved.' });
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
            setIsSaving(false);
        });
    };

    const handleDownload = () => {
        exportServicesToPdf(formData, serviceSections);
        toast({ title: "Download started", description: "Your PDF is being generated." });
    };

    const renderServiceItem = (item: string, key: string) => (
        <div key={key} className="flex items-center gap-2 ml-4">
            {isEditing ? (
                <Checkbox
                    id={key}
                    checked={formData[key] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(key, checked)}
                />
            ) : (
                <span>{formData[key] ? '✓' : '🔲'}</span>
            )}
            <Label htmlFor={key} className="font-normal">{item}</Label>
        </div>
    );
    
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
                    <CardTitle>List of Services</CardTitle>
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
                    {Object.entries(serviceSections).map(([mainTitle, subSections]) => (
                        <div key={mainTitle}>
                            <h2 className="text-2xl font-bold mt-8 mb-4 pt-4">{Object.keys(serviceSections).indexOf(mainTitle) + 1}: - {mainTitle}</h2>
                            {Object.entries(subSections).map(([subTitle, items]) => (
                                <div key={subTitle} className="mb-4">
                                    <h3 className="text-xl font-semibold mt-6 mb-3">{subTitle}</h3>
                                    <div className="space-y-1">
                                        {items.map(item => {
                                            const itemKey = `${mainTitle}-${subTitle}-${item}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                            return renderServiceItem(item, itemKey);
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </main>
    );
};

export default ListOfServicesPage;
